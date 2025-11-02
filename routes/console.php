<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule idle chat reactivation every 5 minutes
Schedule::command('chats:reactivate-idle', ['--minutes' => 15])
    ->everyFiveMinutes()
    ->withoutOverlapping()
    ->runInBackground();
