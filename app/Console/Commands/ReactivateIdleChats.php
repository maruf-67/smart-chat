<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Chat;
use App\Services\ChatService;
use Illuminate\Console\Command;

/**
 * ReactivateIdleChats Command
 *
 * Scheduled command that finds chats with assigned agents that have been
 * inactive for a specified duration and automatically unassigns the agent,
 * re-enabling the auto-reply bot.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class ReactivateIdleChats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chats:reactivate-idle
                            {--minutes=15 : Minutes of inactivity before reactivating}
                            {--dry-run : Show what would be reactivated without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Unassign agents from idle chats and re-enable auto-reply';

    /**
     * Execute the console command.
     */
    public function handle(ChatService $chatService): int
    {
        $minutes = (int) $this->option('minutes');
        $isDryRun = $this->option('dry-run');

        $threshold = now()->subMinutes($minutes);

        $this->info("Finding chats idle for more than {$minutes} minutes...");
        $this->info("Threshold: {$threshold->toDateTimeString()}");

        // Find chats with assigned agents that haven't had activity
        $idleChats = Chat::whereNotNull('agent_id')
            ->where('last_activity_at', '<', $threshold)
            ->with('agent')
            ->get();

        if ($idleChats->isEmpty()) {
            $this->info('No idle chats found.');

            return Command::SUCCESS;
        }

        $this->info("Found {$idleChats->count()} idle chat(s):");

        $this->table(
            ['Chat ID', 'Guest', 'Agent', 'Last Activity', 'Idle Duration'],
            $idleChats->map(function ($chat) {
                $idleDuration = $chat->last_activity_at->diffForHumans(now(), true);

                return [
                    $chat->id,
                    $chat->guest_identifier,
                    $chat->agent?->name ?? 'N/A',
                    $chat->last_activity_at->toDateTimeString(),
                    $idleDuration,
                ];
            })
        );

        if ($isDryRun) {
            $this->warn('DRY RUN: No changes were made.');

            return Command::SUCCESS;
        }

        if (! $this->confirm('Proceed with reactivating these chats?', true)) {
            $this->info('Operation cancelled.');

            return Command::SUCCESS;
        }

        $reactivatedCount = 0;

        foreach ($idleChats as $chat) {
            try {
                $chatService->releaseChat($chat->id);
                $this->info("✓ Reactivated chat #{$chat->id} ({$chat->guest_identifier})");
                $reactivatedCount++;
            } catch (\Exception $e) {
                $this->error("✗ Failed to reactivate chat #{$chat->id}: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("Successfully reactivated {$reactivatedCount} of {$idleChats->count()} chat(s).");

        return Command::SUCCESS;
    }
}
