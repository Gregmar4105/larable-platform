<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\EmailConfigurationUpdateRequest;
use App\Models\EmailSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailConfigurationController extends Controller
{
    /**
     * Display the email configuration settings page.
     */
    public function edit(Request $request): Response
    {
        $setting = $request->user()->emailSetting;

        return Inertia::render('settings/email-configuration', [
            'setting' => $setting ? [
                'id' => $setting->id,
                'smtp_host' => $setting->smtp_host,
                'smtp_port' => $setting->smtp_port,
                'smtp_encryption' => $setting->smtp_encryption,
                'smtp_username' => $setting->smtp_username,
                'smtp_password' => $setting->smtp_password,
                'from_address' => $setting->from_address,
                'from_name' => $setting->from_name,
                'has_smtp_password' => ! empty($setting->smtp_password),
                'imap_host' => $setting->imap_host,
                'imap_port' => $setting->imap_port,
                'imap_encryption' => $setting->imap_encryption,
                'imap_username' => $setting->imap_username,
                'imap_password' => $setting->imap_password,
                'imap_validate_cert' => (bool) $setting->imap_validate_cert,
                'has_imap_password' => ! empty($setting->imap_password),
            ] : null,
            'status' => session('status'),
            'flash' => session('flash'),
        ]);
    }

    /**
     * Update the email configuration settings.
     */
    public function update(EmailConfigurationUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $setting = $user->emailSetting ?: new EmailSetting(['user_id' => $user->id]);

        // Keep existing password if input password field is left empty or blank
        if (array_key_exists('smtp_password', $validated) && ($validated['smtp_password'] === null || $validated['smtp_password'] === '')) {
            unset($validated['smtp_password']);
        }

        if (array_key_exists('imap_password', $validated) && ($validated['imap_password'] === null || $validated['imap_password'] === '')) {
            unset($validated['imap_password']);
        }

        $setting->fill($validated);
        $setting->user_id = $user->id;
        $setting->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Email configuration saved successfully.')]);

        return to_route('email-configuration.edit')->with('status', 'email-configuration-updated');
    }

    /**
     * Test backend SMTP connection.
     */
    public function testSmtp(Request $request): RedirectResponse
    {
        $request->validate([
            'smtp_host' => ['required', 'string'],
            'smtp_port' => ['required', 'integer'],
            'smtp_encryption' => ['nullable', 'string', 'in:tls,ssl,none'],
            'smtp_username' => ['nullable', 'string'],
            'smtp_password' => ['nullable', 'string'],
        ]);

        $userSetting = $request->user()->emailSetting;
        $host = $request->input('smtp_host');
        $port = (int) $request->input('smtp_port');
        $password = $request->input('smtp_password') ?: ($userSetting ? $userSetting->smtp_password : null);

        $result = $this->verifySocketConnection($host, $port);

        if ($result['success']) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __("SMTP server reachable at {$host}:{$port}.")]);

            return back()->with('smtp_test_result', [
                'success' => true,
                'message' => "Successfully connected to SMTP server at {$host}:{$port}.",
            ]);
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => __("Failed to connect to SMTP server: {$result['error']}")]);

        return back()->with('smtp_test_result', [
            'success' => false,
            'message' => "Failed to connect to SMTP server {$host}:{$port} - {$result['error']}",
        ]);
    }

    /**
     * Test backend IMAP connection.
     */
    public function testImap(Request $request): RedirectResponse
    {
        $request->validate([
            'imap_host' => ['required', 'string'],
            'imap_port' => ['required', 'integer'],
            'imap_encryption' => ['nullable', 'string', 'in:ssl,tls,none'],
            'imap_username' => ['nullable', 'string'],
            'imap_password' => ['nullable', 'string'],
        ]);

        $userSetting = $request->user()->emailSetting;
        $host = $request->input('imap_host');
        $port = (int) $request->input('imap_port');

        $result = $this->verifySocketConnection($host, $port);

        if ($result['success']) {
            Inertia::flash('toast', ['type' => 'success', 'message' => __("IMAP server reachable at {$host}:{$port}.")]);

            return back()->with('imap_test_result', [
                'success' => true,
                'message' => "Successfully connected to IMAP server at {$host}:{$port}.",
            ]);
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => __("Failed to connect to IMAP server: {$result['error']}")]);

        return back()->with('imap_test_result', [
            'success' => false,
            'message' => "Failed to connect to IMAP server {$host}:{$port} - {$result['error']}",
        ]);
    }

    /**
     * Helper to verify socket connectivity to host and port.
     *
     * @return array{success: bool, error?: string}
     */
    private function verifySocketConnection(string $host, int $port, int $timeout = 5): array
    {
        $errno = 0;
        $errstr = '';

        $fp = @fsockopen($host, $port, $errno, $errstr, $timeout);

        if ($fp) {
            fclose($fp);

            return ['success' => true];
        }

        return [
            'success' => false,
            'error' => $errstr ?: "Connection timed out after {$timeout} seconds.",
        ];
    }
}
