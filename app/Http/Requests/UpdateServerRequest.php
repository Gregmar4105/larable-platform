<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateServerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:online,provisioning,maintenance,offline'],
            'tags' => ['nullable', 'array'],
            'locationPin' => ['nullable', 'string', 'max:500'],
            'hostAddress' => ['nullable', 'string', 'max:500'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'tokenId' => ['nullable', 'string', 'max:255'],
            'tokenSecret' => ['nullable', 'string', 'max:255'],
        ];
    }
}
