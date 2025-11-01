<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('admin users are redirected to admin dashboard', function () {
    $admin = User::factory()->create(['user_type' => 'admin']);

    $this->actingAs($admin);

    $this->get(route('dashboard'))->assertRedirect(route('admin.dashboard'));
});

test('agent users are redirected to agent dashboard', function () {
    $agent = User::factory()->create(['user_type' => 'agent']);

    $this->actingAs($agent);

    $this->get(route('dashboard'))->assertRedirect(route('agent.dashboard'));
});

test('guest type users receive 403', function () {
    $guest = User::factory()->create(['user_type' => 'guest']);

    $this->actingAs($guest);

    $this->get(route('dashboard'))->assertForbidden();
});
