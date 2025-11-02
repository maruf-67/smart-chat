<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;

/**
 * StoreMessageRequest
 *
 * Form request for validating message creation in chats.
 * All validation rules and custom messages are defined here.
 * Controllers use this to validate incoming message data.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class StoreMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Authorization is handled by middleware or controller logic,
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
        return [
            'content' => 'required|string|max:5000|min:1',
            'attachment' => [
                'nullable',
                'file',
                File::types(['pdf', 'jpg', 'jpeg', 'png'])->max(1024), // 1MB limit
            ],
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
            'content.required' => 'The message content is required.',
            'content.min' => 'The message cannot be empty.',
            'content.max' => 'The message must not exceed 5000 characters.',
            'attachment.file' => 'The attachment must be a valid file.',
            'attachment.mimes' => 'The attachment must be a PDF, JPG, JPEG, or PNG file.',
            'attachment.max' => 'The attachment must not exceed 1MB in size.',
        ];
    }
}
