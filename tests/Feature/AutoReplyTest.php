<?php

use App\Events\MessageReceived;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Services\AutoReplyService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Storage::fake('public');
});

afterEach(function () {
    \Mockery::close();
});

it('fires MessageReceived event when guest sends a message', function () {
    Event::fake();

    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);

    $response = $this->post("/chat/{$chat->guest_identifier}/messages", [
        'content' => 'Hello, I need help!',
    ]);

    $response->assertRedirect();

    Event::assertDispatched(MessageReceived::class);
});

it('generates auto-reply synchronously when guest message is received', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);

    $autoReplyService = \Mockery::mock(AutoReplyService::class);
    $autoReplyService->shouldReceive('shouldGenerateAutoReply')
        ->once()
        ->with(\Mockery::on(fn (Chat $resolvedChat) => $resolvedChat->id === $chat->id))
        ->andReturn(true);
    $autoReplyService->shouldReceive('generateReply')
        ->once()
        ->andReturn('Thanks for reaching out!');

    app()->instance(AutoReplyService::class, $autoReplyService);

    $this->post("/chat/{$chat->guest_identifier}/messages", [
        'content' => 'Hello, I need help!',
    ])->assertRedirect();

    // Verify the auto-reply message was created
    expect($chat->messages()->where('is_auto_reply', true)->count())->toBe(1);

    $autoReplyMessage = $chat->messages()->where('is_auto_reply', true)->first();
    expect($autoReplyMessage->content)->toBe('Thanks for reaching out!');
    expect($autoReplyMessage->sender)->toBe(Message::SENDER_BOT);
});

it('generates AI auto-reply for guest messages', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);
    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'content' => 'Hello, I need help!',
        'sender' => Message::SENDER_GUEST,
        'is_from_guest' => true,
    ]);

    $service = new AutoReplyService;
    $reply = $service->generateReply($message);

    // AI response should not be null
    expect($reply)->not->toBeNull();
    expect($reply)->toBeString();
})->skip('Requires valid Gemini API key');

it('does not generate auto-reply when agent is assigned', function () {
    /** @var User $agent */
    $agent = User::factory()->create(['user_type' => 'agent']);
    $chat = Chat::factory()->create([
        'auto_reply_enabled' => true,
        'agent_id' => $agent->id,
    ]);

    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'content' => 'Hello!',
        'sender' => Message::SENDER_GUEST,
        'is_from_guest' => true,
    ]);

    $service = new AutoReplyService;
    $shouldGenerate = $service->shouldGenerateAutoReply($chat);

    expect($shouldGenerate)->toBeFalse();
});

it('accepts file uploads with message', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);
    $file = UploadedFile::fake()->image('test.jpg', 100, 100)->size(500); // 500KB

    $response = $this->post("/chat/{$chat->guest_identifier}/messages", [
        'content' => 'Please check this image',
        'attachment' => $file,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('messages', [
        'chat_id' => $chat->id,
        'content' => 'Please check this image',
    ]);

    $message = Message::where('chat_id', $chat->id)
        ->where('is_from_guest', true)
        ->latest()
        ->first();
    expect($message->file_path)->not->toBeNull();
    expect($message->file_type)->toBe('jpg');
    expect($message->file_size)->toBeGreaterThan(0);

    expect(Storage::disk('public')->exists($message->file_path))->toBeTrue();
});

it('rejects files larger than 1MB', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);
    $file = UploadedFile::fake()->image('large.jpg')->size(2048); // 2MB

    $response = $this->post("/chat/{$chat->guest_identifier}/messages", [
        'content' => 'Large file test',
        'attachment' => $file,
    ]);

    $response->assertSessionHasErrors('attachment');
});

it('rejects invalid file types', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);
    $file = UploadedFile::fake()->create('document.docx', 100);

    $response = $this->post("/chat/{$chat->guest_identifier}/messages", [
        'content' => 'Invalid file type',
        'attachment' => $file,
    ]);

    $response->assertSessionHasErrors('attachment');
});

it('accepts PDF files', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);
    $file = UploadedFile::fake()->create('document.pdf', 500);

    $response = $this->post("/chat/{$chat->guest_identifier}/messages", [
        'content' => 'PDF document',
        'attachment' => $file,
    ]);

    $response->assertRedirect();

    $message = Message::where('chat_id', $chat->id)
        ->where('is_from_guest', true)
        ->latest()
        ->first();
    expect($message->file_type)->toBe('pdf');
});

it('injects pdf excerpt into prompt without attaching the document payload', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);

    $path = 'chat-attachments/sample.pdf';
    Storage::disk('public')->put($path, 'Fake PDF content for testing');

    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'content' => 'See attached PDF',
        'sender' => Message::SENDER_GUEST,
        'is_from_guest' => true,
        'file_path' => $path,
        'file_type' => 'pdf',
        'file_size' => 1024,
    ]);

    $service = new class extends AutoReplyService
    {
        protected function extractPdfExcerpt(Message $message): ?array
        {
            return [
                'text' => 'Sample PDF excerpt content',
                'truncated' => false,
            ];
        }
    };

    $method = new \ReflectionMethod($service, 'createUserMessage');
    $method->setAccessible(true);

    /** @var \Prism\Prism\ValueObjects\Messages\UserMessage $userMessage */
    $userMessage = $method->invoke($service, $message, 'Context block');

    expect($userMessage->content)->toContain('Sample PDF excerpt content');
    expect($userMessage->documents())->toBeEmpty();
});

it('includes file context in AI prompt', function () {
    Storage::fake('public');
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);
    $file = UploadedFile::fake()->image('test.jpg');
    $path = $file->store('chat-attachments', 'public');

    $message = Message::factory()->create([
        'chat_id' => $chat->id,
        'content' => 'What do you see in this image?',
        'sender' => Message::SENDER_GUEST,
        'is_from_guest' => true,
        'file_path' => $path,
        'file_type' => 'jpg',
        'file_size' => $file->getSize(),
    ]);

    $service = new AutoReplyService;
    $reply = $service->generateReply($message);

    // AI should handle image context (null if API key missing in test env)
    expect($reply)->toBeString()->or->toBeNull();
})->skip('Requires valid Gemini API key');

it('limits the conversation context to the five most recent messages', function () {
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);

    $timestamp = Carbon::now()->subMinutes(10);

    foreach (range(1, 7) as $index) {
        $messageTimestamp = $timestamp->copy()->addMinutes($index);

        Message::factory()->create([
            'chat_id' => $chat->id,
            'content' => "Message {$index}",
            'sender' => Message::SENDER_GUEST,
            'is_from_guest' => true,
            'created_at' => $messageTimestamp,
            'updated_at' => $messageTimestamp,
        ]);
    }

    $service = new AutoReplyService;

    $contextMethod = new ReflectionMethod($service, 'buildConversationContext');
    $contextMethod->setAccessible(true);

    $context = $contextMethod->invoke($service, $chat->fresh());

    foreach (range(3, 7) as $index) {
        expect($context)->toContain("Message {$index}");
    }

    foreach ([1, 2] as $index) {
        expect($context)->not->toContain("Message {$index}");
    }

    expect($context)->toContain('Earlier messages omitted for brevity.');
});

it('creates chat with auto_reply_enabled on first guest message', function () {
    $guestIdentifier = 'test-guest-'.uniqid();

    $response = $this->post("/chat/{$guestIdentifier}/messages", [
        'content' => 'First message',
    ]);

    $response->assertRedirect();

    $chat = Chat::where('guest_identifier', $guestIdentifier)->first();
    expect($chat)->not->toBeNull();
    expect($chat->auto_reply_enabled)->toBeTrue();
});

it('disables auto-reply when agent is assigned to chat', function () {
    /** @var User $agent */
    $agent = User::factory()->create(['user_type' => 'agent']);
    $chat = Chat::factory()->create(['auto_reply_enabled' => true]);

    actingAs($agent);

    $service = app(\App\Services\ChatService::class);
    $service->assignAgent($chat->id, $agent->id);

    $chat->refresh();
    $service = new AutoReplyService;

    expect($service->shouldGenerateAutoReply($chat))->toBeFalse();
});

it('re-enables auto-reply when agent is unassigned', function () {
    /** @var User $agent */
    $agent = User::factory()->create(['user_type' => 'agent']);
    $chat = Chat::factory()->create([
        'auto_reply_enabled' => true,
        'agent_id' => $agent->id,
    ]);

    actingAs($agent);

    $service = app(\App\Services\ChatService::class);
    $service->releaseChat($chat->id);

    $chat->refresh();
    $autoReplyService = new AutoReplyService;

    expect($autoReplyService->shouldGenerateAutoReply($chat))->toBeTrue();
});
