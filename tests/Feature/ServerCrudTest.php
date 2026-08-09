<?php

use App\Models\Server;
use App\Models\User;

test('authenticated user can view servers list', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/servers');

    $response->assertStatus(200);
});

test('authenticated user can provision a new server', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/servers', [
        'name' => 'Custom Web Node',
        'provider' => 'aws',
        'region' => 'us-east-1',
        'vcpus' => 4,
        'ramGb' => 8,
        'diskGb' => 160,
    ]);

    $response->assertRedirect('/servers');

    $this->assertDatabaseHas('servers', [
        'user_id' => $user->id,
        'name' => 'Custom Web Node',
        'provider' => 'aws',
    ]);
});

test('authenticated user can provision a proxmox server', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/servers', [
        'name' => 'Larable Main Server',
        'provider' => 'proxmox',
        'hostAddress' => 'https://server-main-01.larable.dev',
        'tokenId' => 'root@pam!larable-platform',
        'tokenSecret' => 'b108c902-3bb1-4350-953f-0b51f8967d8c',
        'locationPin' => 'Barangay 183, Zone 20, District 1, Pasay, Southern Manila District, I',
    ]);

    $response->assertRedirect('/servers');

    $this->assertDatabaseHas('servers', [
        'user_id' => $user->id,
        'name' => 'Larable Main Server',
        'provider' => 'proxmox',
        'host_address' => 'https://server-main-01.larable.dev',
        'proxmox_port' => null,
    ]);
});

test('authenticated user can provision a proxmox server using ip address and receives port', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/servers', [
        'name' => 'Proxmox IP Node',
        'provider' => 'proxmox',
        'hostAddress' => '192.168.1.100',
        'port' => 8006,
        'tokenId' => 'root@pam!terraform',
        'tokenSecret' => 'b108c902-3bb1-4350-953f-0b51f8967d8c',
    ]);

    $response->assertRedirect('/servers');

    $this->assertDatabaseHas('servers', [
        'user_id' => $user->id,
        'name' => 'Proxmox IP Node',
        'provider' => 'proxmox',
        'host_address' => '192.168.1.100',
        'proxmox_port' => 8006,
    ]);
});

test('authenticated user can update an existing server', function () {
    $user = User::factory()->create();
    $server = Server::factory()->create([
        'user_id' => $user->id,
        'name' => 'Old Server Name',
        'status' => 'online',
    ]);

    $response = $this->actingAs($user)->put("/servers/{$server->id}", [
        'name' => 'Updated Server Name',
        'status' => 'maintenance',
    ]);

    $response->assertRedirect('/servers');

    $this->assertDatabaseHas('servers', [
        'id' => $server->id,
        'name' => 'Updated Server Name',
        'status' => 'maintenance',
    ]);
});

test('authenticated user can delete a server instance', function () {
    $user = User::factory()->create();
    $server = Server::factory()->create([
        'user_id' => $user->id,
        'name' => 'Server To Delete',
    ]);

    $response = $this->actingAs($user)->delete("/servers/{$server->id}");

    $response->assertRedirect('/servers');

    $this->assertDatabaseMissing('servers', [
        'id' => $server->id,
    ]);
});
