<?php

use App\Models\EmailSetting;
use App\Models\User;

test('unauthenticated user cannot access email configuration page', function () {
    $response = $this->get(route('email-configuration.edit'));

    $response->assertRedirect(route('login'));
});

test('unverified user cannot access email configuration page', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get(route('email-configuration.edit'));

    $response->assertRedirect(route('verification.notice'));
});

test('verified user can access email configuration page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('email-configuration.edit'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/email-configuration')
        ->has('setting')
    );
});

test('verified user can save and update email configuration', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('email-configuration.update'), [
        'smtp_host' => 'smtp.mailtrap.io',
        'smtp_port' => 2525,
        'smtp_encryption' => 'tls',
        'smtp_username' => 'testuser',
        'smtp_password' => 'secret123',
        'from_address' => 'noreply@platform.com',
        'from_name' => 'Platform Test',

        'imap_host' => 'imap.mailtrap.io',
        'imap_port' => 993,
        'imap_encryption' => 'ssl',
        'imap_username' => 'imapuser',
        'imap_password' => 'imapsecret',
        'imap_validate_cert' => true,
    ]);

    $response->assertRedirect(route('email-configuration.edit'));

    $setting = EmailSetting::where('user_id', $user->id)->first();
    expect($setting)->not->toBeNull();
    expect($setting->smtp_host)->toBe('smtp.mailtrap.io');
    expect($setting->smtp_port)->toBe(2525);
    expect($setting->smtp_password)->toBe('secret123');
    expect($setting->imap_host)->toBe('imap.mailtrap.io');
    expect($setting->imap_password)->toBe('imapsecret');
});

test('leaving password fields blank preserves existing passwords', function () {
    $user = User::factory()->create();

    EmailSetting::create([
        'user_id' => $user->id,
        'smtp_host' => 'smtp.initial.com',
        'smtp_port' => 587,
        'smtp_password' => 'original-smtp-password',
        'imap_host' => 'imap.initial.com',
        'imap_port' => 993,
        'imap_password' => 'original-imap-password',
    ]);

    $response = $this->actingAs($user)->patch(route('email-configuration.update'), [
        'smtp_host' => 'smtp.updated.com',
        'smtp_port' => 587,
        'smtp_password' => null,
        'imap_host' => 'imap.updated.com',
        'imap_port' => 993,
        'imap_password' => null,
    ]);

    $response->assertRedirect(route('email-configuration.edit'));

    $setting = $user->fresh()->emailSetting;
    expect($setting->smtp_host)->toBe('smtp.updated.com');
    expect($setting->smtp_password)->toBe('original-smtp-password');
    expect($setting->imap_host)->toBe('imap.updated.com');
    expect($setting->imap_password)->toBe('original-imap-password');
});

test('test SMTP connection endpoint verifies host and port reachability', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('email-configuration.test-smtp'), [
        'smtp_host' => '127.0.0.1',
        'smtp_port' => 65534, // unreachable port
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('smtp_test_result');
    $result = session('smtp_test_result');
    expect($result['success'])->toBeFalse();
});

test('test IMAP connection endpoint verifies host and port reachability', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('email-configuration.test-imap'), [
        'imap_host' => '127.0.0.1',
        'imap_port' => 65534, // unreachable port
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('imap_test_result');
    $result = session('imap_test_result');
    expect($result['success'])->toBeFalse();
});
