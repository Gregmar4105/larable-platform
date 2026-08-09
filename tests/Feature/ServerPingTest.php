<?php

use App\Models\User;

test('authenticated user can ping server address and get status response within timeout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/servers/ping', [
        'address' => '127.0.0.1',
        'port' => 80,
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'address',
            'online',
            'latency_ms',
            'status_code',
        ]);
});

test('ping detects real online Proxmox server via HTTPS GET request', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/servers/ping', [
        'address' => 'https://server-main-01.larable.dev',
        'tokenId' => 'root@pam!larable-platform',
        'tokenSecret' => 'b108c902-3bb1-4350-953f-0b51f8967d8c',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'address' => 'https://server-main-01.larable.dev',
            'online' => true,
        ]);
});

test('ping gracefully returns offline state for unreachable address without failing backend', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/servers/ping', [
        'address' => '10.255.255.1',
        'port' => 8006,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'address' => '10.255.255.1',
            'online' => false,
        ]);
});
