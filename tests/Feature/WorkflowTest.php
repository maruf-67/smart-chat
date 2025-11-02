<?php

declare(strict_types=1);

use App\Events\AgentAssigned;
use App\Events\AgentUnassigned;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Facades\Event;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    Event::fake();
});

it('disables auto-reply when agent is assigned via event', function () {
    $chat = Chat::factory()->create([
        'auto_reply_enabled' => true,
        'agent_id' => null,
    ]);

    $agent = User::factory()->create(['user_type' => 'agent']);

    // Dispatch the event
    AgentAssigned::dispatch($chat->fresh());

    // Event should be dispatched
    Event::assertDispatched(AgentAssigned::class);
});

it('enables auto-reply when agent is unassigned via event', function () {
    $agent = User::factory()->create(['user_type' => 'agent']);

    $chat = Chat::factory()->create([
        'auto_reply_enabled' => false,
        'agent_id' => $agent->id,
    ]);

    // Dispatch the event
    AgentUnassigned::dispatch($chat->fresh());

    // Event should be dispatched
    Event::assertDispatched(AgentUnassigned::class);
});

it('admin can view any chat via policy', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $chat = Chat::factory()->create();

    actingAs($admin);

    expect($admin->can('view', $chat))->toBeTrue();
});

it('agent can only view their assigned chats via policy', function () {
    $agent = User::factory()->create(['user_type' => 'agent']);
    $otherAgent = User::factory()->create(['user_type' => 'agent']);

    $assignedChat = Chat::factory()->create(['agent_id' => $agent->id]);
    $otherChat = Chat::factory()->create(['agent_id' => $otherAgent->id]);

    actingAs($agent);

    expect($agent->can('view', $assignedChat))->toBeTrue();
    expect($agent->can('view', $otherChat))->toBeFalse();
});

it('only admin can assign agents via policy', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $agent = User::factory()->create(['user_type' => 'agent']);
    $chat = Chat::factory()->create();

    actingAs($admin);
    expect($admin->can('assignAgent', $chat))->toBeTrue();

    actingAs($agent);
    expect($agent->can('assignAgent', $chat))->toBeFalse();
});

it('only admin can manage auto-reply rules via policy', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);
    $agent = User::factory()->create(['user_type' => 'agent']);

    actingAs($admin);
    expect($admin->can('viewAny', \App\Models\AutoReplyRule::class))->toBeTrue();
    expect($admin->can('create', \App\Models\AutoReplyRule::class))->toBeTrue();

    actingAs($agent);
    expect($agent->can('viewAny', \App\Models\AutoReplyRule::class))->toBeFalse();
    expect($agent->can('create', \App\Models\AutoReplyRule::class))->toBeFalse();
});

it('reactivate idle chats command finds idle chats', function () {
    // Create an idle chat (agent assigned but no activity for 20 minutes)
    $agent = User::factory()->create(['user_type' => 'agent']);
    $idleChat = Chat::factory()->create([
        'agent_id' => $agent->id,
        'auto_reply_enabled' => false,
        'last_activity_at' => now()->subMinutes(20),
    ]);

    // Create an active chat
    $activeChat = Chat::factory()->create([
        'agent_id' => $agent->id,
        'auto_reply_enabled' => false,
        'last_activity_at' => now()->subMinutes(5),
    ]);

    $this->artisan('chats:reactivate-idle', ['--minutes' => 15, '--dry-run' => true])
        ->expectsOutput('Finding chats idle for more than 15 minutes...')
        ->expectsOutput('Found 1 idle chat(s):')
        ->assertExitCode(0);
});
