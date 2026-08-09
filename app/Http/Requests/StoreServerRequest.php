<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreServerRequest extends FormRequest
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
            'provider' => ['required', 'string', 'in:aws,digitalocean,hetzner,gcp,linode,proxmox'],
            'region' => ['nullable', 'string', 'max:255'],
            'vcpus' => ['nullable', 'integer', 'min:1', 'max:64'],
            'ramGb' => ['nullable', 'integer', 'min:1', 'max:512'],
            'diskGb' => ['nullable', 'integer', 'min:1', 'max:2000'],
            'hostAddress' => ['nullable', 'string', 'max:500'],
            'port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'tokenId' => ['nullable', 'string', 'max:255'],
            'tokenSecret' => ['nullable', 'string', 'max:255'],
            'locationPin' => ['nullable', 'string', 'max:500'],
        ];
    }
}
