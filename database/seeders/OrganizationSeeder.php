<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrganizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $user = User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
            ]);
            $users = collect([$user]);
        }

        $orgsData = [
            [
                'name' => 'Acme Inc',
                'slug' => 'acme-inc',
                'plan' => 'Enterprise',
                'description' => 'Primary enterprise organization for core infrastructure.',
            ],
            [
                'name' => 'Acme Corp.',
                'slug' => 'acme-corp',
                'plan' => 'Startup',
                'description' => 'Startup division for innovative web platforms.',
            ],
            [
                'name' => 'Evil Corp.',
                'slug' => 'evil-corp',
                'plan' => 'Free',
                'description' => 'Experimental sandbox environment.',
            ],
        ];

        foreach ($users as $user) {
            foreach ($orgsData as $data) {
                $org = Organization::firstOrCreate(
                    ['slug' => $data['slug']],
                    [
                        'user_id' => $user->id,
                        'name' => $data['name'],
                        'plan' => $data['plan'],
                        'description' => $data['description'],
                    ]
                );

                if (! $user->organizations()->where('organizations.id', $org->id)->exists()) {
                    $user->organizations()->attach($org->id, ['role' => 'owner']);
                }
            }
        }
    }
}
