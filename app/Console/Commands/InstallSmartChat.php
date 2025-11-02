<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Console\Style\SymfonyStyle;
use Throwable;

class InstallSmartChat extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'smart-chat:install
        {--fresh : Drop all tables before running migrations}
        {--force : Run installation even in production environments}';

    /**
     * The console command description.
     */
    protected $description = 'Prepare Smart Chat for local or server environments by configuring the app key, database, and demo data.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $io = new SymfonyStyle($this->input, $this->output);
        $io->title('Smart Chat Installer');

        if ($this->laravel->environment('production') && ! $this->option('force')) {
            $io->warning('You are running in production. Re-run the installer with --force to continue.');

            return self::FAILURE;
        }

        try {
            $this->ensureEnvironmentFile($io);
            $this->generateApplicationKey($io);
            $this->linkStorage($io);
            $this->runMigrations($io, (bool) $this->option('fresh'));
            $this->showDemoAccounts($io);

            $io->success('Smart Chat installation completed successfully.');

            $io->section('Next steps');
            $io->listing([
                'Edit the .env file to configure database, broadcasting, and Prism AI provider credentials.',
                'Install frontend dependencies with `pnpm install` (or `npm install`).',
                'Run `pnpm dev` and `php artisan reverb:start` to boot the Vite dev server and WebSocket server.',
            ]);

            return self::SUCCESS;
        } catch (Throwable $exception) {
            $io->error($exception->getMessage());

            return self::FAILURE;
        }
    }

    private function ensureEnvironmentFile(SymfonyStyle $io): void
    {
        $envPath = base_path('.env');
        $examplePath = base_path('.env.example');

        if (File::exists($envPath)) {
            $io->writeln('• .env file already exists.');

            return;
        }

        if (! File::exists($examplePath)) {
            throw new \RuntimeException('Missing .env.example file. Please create one before running the installer.');
        }

        File::copy($examplePath, $envPath);
        $io->writeln('• Created .env file from .env.example.');
    }

    private function generateApplicationKey(SymfonyStyle $io): void
    {
        if (! empty(config('app.key'))) {
            $io->writeln('• Application key already set.');

            return;
        }

        Artisan::call('key:generate', ['--force' => true]);
        $io->writeln('• Generated application key.');
    }

    private function linkStorage(SymfonyStyle $io): void
    {
        $storageLink = public_path('storage');

        if (File::exists($storageLink)) {
            $io->writeln('• Public storage symlink already exists.');

            return;
        }

        Artisan::call('storage:link');
        $io->writeln('• Created storage symlink.');
    }

    private function runMigrations(SymfonyStyle $io, bool $fresh): void
    {
        $command = $fresh ? 'migrate:fresh' : 'migrate';
        $label = $fresh ? 'Resetting database with fresh migrations' : 'Running database migrations';

        $io->section($label);

        $this->call($command, [
            '--seed' => true,
            '--force' => true,
        ]);
    }

    private function showDemoAccounts(SymfonyStyle $io): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        $accounts = User::query()
            ->whereIn('email', [
                'admin@test.local',
                'agent@test.local',
                'guest@test.local',
            ])
            ->orderBy('user_type')
            ->get(['email', 'user_type']);

        if ($accounts->isEmpty()) {
            $io->note('Database seeding completed without demo accounts. Review Database\Seeders\UserSeeder for credentials.');

            return;
        }

        $io->section('Demo login accounts');
        $io->table(
            ['Role', 'Email', 'Password'],
            $accounts->map(static fn (User $user): array => [
                ucfirst($user->user_type),
                $user->email,
                'password',
            ])->toArray(),
        );

        $io->note('Demo passwords default to "password". Update them immediately in production environments.');
    }
}
