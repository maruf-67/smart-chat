<?php

use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->adminRole = Role::query()->create([
        'name' => 'admin',
        'title' => 'Administrator',
        'permissions' => [],
        'type' => 'admin',
        'is_active' => true,
    ]);

    $this->adminUser = User::factory()->create([
        'user_type' => 'admin',
        'role_id' => $this->adminRole->id,
        'email' => 'admin@example.com',
    ]);
});

test('admins can create non-admin users without assigning roles', function () {
    $this->actingAs($this->adminUser);

    $response = $this->post(route('admin.users.store'), [
        'first_name' => 'Agent',
        'last_name' => 'Zero',
        'email' => 'agent-zero@example.com',
        'phone' => '1234567890',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'user_type' => 'agent',
        'status' => '1',
    ]);

    $response->assertRedirect(route('admin.users.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'agent-zero@example.com',
        'user_type' => 'agent',
        'role_id' => null,
    ]);
});

test('role selection is required when creating admin users', function () {
    $this->actingAs($this->adminUser);

    $response = $this->from(route('admin.users.create'))->post(route('admin.users.store'), [
        'first_name' => 'Second',
        'last_name' => 'Admin',
        'email' => 'secondary-admin@example.com',
        'phone' => '0987654321',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'user_type' => 'admin',
        'status' => '1',
    ]);

    $response->assertSessionHasErrors('role_id');

    $this->assertDatabaseMissing('users', [
        'email' => 'secondary-admin@example.com',
    ]);
});

test('user listing can be filtered by user type', function () {
    $this->actingAs($this->adminUser);

    $agent = User::factory()->create([
        'first_name' => 'Filtered',
        'last_name' => 'Agent',
        'email' => 'filtered-agent@example.com',
        'user_type' => 'agent',
        'role_id' => null,
    ]);

    User::factory()->create([
        'user_type' => 'guest',
        'email' => 'filtered-user@example.com',
    ]);

    $response = $this->get(route('admin.users.index', ['user_type' => 'agent']));

    $response->assertInertia(function (Assert $page) use ($agent) {
        return $page->component('admin/users/index')
            ->where('filters.user_type', 'agent')
            ->has('users.data', 1, function (Assert $user) use ($agent) {
                return $user->where('id', $agent->id)
                    ->where('user_type', 'agent')
                    ->where('role', null)
                    ->etc();
            });
    });
});

test('updating a user to a non-admin clears their role', function () {
    $this->actingAs($this->adminUser);

    $adminToUpdate = User::factory()->create([
        'first_name' => 'Update',
        'last_name' => 'Target',
        'email' => 'update-target@example.com',
        'user_type' => 'admin',
        'role_id' => $this->adminRole->id,
    ]);

    $response = $this->put(route('admin.users.update', $adminToUpdate), [
        'first_name' => 'Update',
        'last_name' => 'Target',
        'email' => 'update-target@example.com',
        'phone' => '5555555555',
        'user_type' => 'agent',
        'status' => '1',
    ]);

    $response->assertRedirect(route('admin.users.index'));

    $this->assertDatabaseHas('users', [
        'id' => $adminToUpdate->id,
        'user_type' => 'agent',
        'role_id' => null,
    ]);
});
