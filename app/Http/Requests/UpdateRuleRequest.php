<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateRuleRequest
 *
 * Form request for validating auto-reply rule updates.
 * All validation rules and custom messages are defined here.
 * Controllers use this to validate incoming request data.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class UpdateRuleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Authorization is handled by middleware (@permission directive),
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
            'keyword' => 'required|string|max:255|unique:auto_reply_rules,keyword,'.$this->route('rule'),
            'reply_message' => 'required|string|max:1000',
            'is_active' => 'nullable|boolean',
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
            'keyword.required' => 'The trigger keyword is required.',
            'keyword.unique' => 'This keyword is already in use by another rule.',
            'keyword.max' => 'The keyword must not exceed 255 characters.',
            'reply_message.required' => 'The auto-reply message is required.',
            'reply_message.max' => 'The reply message must not exceed 1000 characters.',
            'is_active.boolean' => 'The active status must be true or false.',
        ];
    }
}
