<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Public channels - no authentication required
// Guests can listen to their own chat updates
Broadcast::channel('guest-chat.{guestIdentifier}', function () {
    return true; // Allow all connections
});

// User-specific channels for agents (public, user ID in channel name provides security)
Broadcast::channel('user.{userId}', function () {
    return true; // Allow all connections - security by user ID in channel name
});

// Admin channel for all chat updates
Broadcast::channel('admin-chats', function () {
    return true; // Allow all connections - admins will filter on frontend
});
