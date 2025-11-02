<?php

// Registration is disabled in this application.
// Admin and agent users are created manually.
// These tests are kept for reference but skipped.

test('registration is disabled', function () {
    // Attempt to access registration route
    $response = $this->get('/register');

    // Should return 404 (route not found)
    $response->assertNotFound();
})->skip('Registration intentionally disabled');

test('registration endpoint is not accessible', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // Should return 404 (route not found)
    $response->assertNotFound();
})->skip('Registration intentionally disabled');
