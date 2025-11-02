<?php

declare(strict_types=1);

namespace App\Enums;

enum MessageSender: string
{
    case Guest = 'guest';
    case Agent = 'agent';
    case Bot = 'bot';
}
