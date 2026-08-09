<?php

use App\Models\Organization;
use App\Models\User;

test('authenticated user can view organizations index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('organizations.index'));

    $response->assertStatus(200);
});

test('authenticated user can create an organization', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('organizations.store'), [
        'name' => 'Test Tech Inc',
        'slug' => 'test-tech-inc',
        'plan' => 'Enterprise',
        'description' => 'A test tech organization',
    ]);

    $response->assertRedirect(route('organizations.index'));
    $this->assertDatabaseHas('organizations', [
        'name' => 'Test Tech Inc',
        'slug' => 'test-tech-inc',
        'plan' => 'Enterprise',
    ]);
});

test('authenticated user can update their organization', function () {
    $user = User::factory()->create();
    $org = Organization::create([
        'user_id' => $user->id,
        'name' => 'Old Name',
        'slug' => 'old-name',
        'plan' => 'Free',
    ]);
    $org->users()->attach($user->id, ['role' => 'owner']);

    $response = $this->actingAs($user)->put(route('organizations.update', $org), [
        'name' => 'New Updated Name',
        'slug' => 'new-updated-name',
        'plan' => 'Startup',
    ]);

    $response->assertRedirect(route('organizations.index'));
    $this->assertDatabaseHas('organizations', [
        'id' => $org->id,
        'name' => 'New Updated Name',
        'plan' => 'Startup',
    ]);
});

test('authenticated user can switch connected active organization', function () {
    $user = User::factory()->create();
    $org1 = Organization::create([
        'user_id' => $user->id,
        'name' => 'Org One',
        'slug' => 'org-one',
        'plan' => 'Free',
    ]);
    $org1->users()->attach($user->id, ['role' => 'owner']);

    $org2 = Organization::create([
        'user_id' => $user->id,
        'name' => 'Org Two',
        'slug' => 'org-two',
        'plan' => 'Startup',
    ]);
    $org2->users()->attach($user->id, ['role' => 'owner']);

    $response = $this->actingAs($user)->post(route('organizations.switch', $org2));

    $response->assertSessionHas('current_organization_id', $org2->id);
});

test('authenticated user can delete an organization', function () {
    $user = User::factory()->create();
    $org = Organization::create([
        'user_id' => $user->id,
        'name' => 'Org to delete',
        'slug' => 'org-to-delete',
        'plan' => 'Free',
    ]);
    $org->users()->attach($user->id, ['role' => 'owner']);

    $response = $this->actingAs($user)->delete(route('organizations.destroy', $org));

    $response->assertRedirect(route('organizations.index'));
    $this->assertDatabaseMissing('organizations', [
        'id' => $org->id,
    ]);
});
