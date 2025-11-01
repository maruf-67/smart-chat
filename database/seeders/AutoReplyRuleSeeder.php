<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AutoReplyRule;
use Illuminate\Database\Seeder;

class AutoReplyRuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 5 auto-reply rules with specific keywords
        $keywords = [
            'hello' => 'Hello! Thanks for reaching out. How can we help you today?',
            'help' => 'We\'re here to help! Please describe what you need assistance with.',
            'pricing' => 'For pricing information, please visit our pricing page or contact sales.',
            'hours' => 'We\'re available Monday to Friday, 9 AM to 5 PM EST.',
            'support' => 'Please describe your issue and we\'ll get back to you shortly.',
        ];

        foreach ($keywords as $keyword => $reply) {
            AutoReplyRule::factory()
                ->state([
                    'keyword' => $keyword,
                    'reply_message' => $reply,
                ])
                ->create();
        }
    }
}
