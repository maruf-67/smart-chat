<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * UpdateUserRequest
 *
 * Form request for validating user updates.
 * Password is optional (only validated if provided).
 * Email must be unique except for the current user.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Authorization is handled by middleware,
     * so this always returns true.
     *
     * @return bool Always true (middleware handles authorization)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<string>|string> Validation rules
     */
    public function rules(): array
    {
        $userId = $this->route('user'); // Get user ID from route

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['nullable', 'string', 'max:15'],
            'password' => ['nullable', 'string', Password::min(8)->letters()->numbers(), 'confirmed'],
            'role_id' => [
                'nullable',
                Rule::requiredIf(fn() => $this->input('user_type') === 'admin'),
                'integer',
                'exists:roles,id',
            ],
            'user_type' => ['required', 'string', Rule::in(['admin', 'agent', 'user'])],
            'status' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'], // 2MB max
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string> Custom error messages
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'first_name.max' => 'First name must not exceed 255 characters.',
            'last_name.required' => 'Last name is required.',
            'last_name.max' => 'Last name must not exceed 255 characters.',
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already in use.',
            'phone.max' => 'Phone number must not exceed 15 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
            'role_id.required' => 'Please select a role for admin users.',
            'role_id.exists' => 'Selected role is invalid.',
            'user_type.required' => 'Please select a user type.',
            'user_type.in' => 'Invalid user type selected.',
            'image.image' => 'The file must be an image.',
            'image.max' => 'Image size must not exceed 2MB.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string> Custom attribute names
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'first name',
            'last_name' => 'last name',
            'email' => 'email address',
            'phone' => 'phone number',
            'password' => 'password',
            'role_id' => 'role',
            'user_type' => 'user type',
            'status' => 'status',
            'image' => 'profile image',
        ];
    }
}
