<?php

namespace Database\Factories;

use App\Models\Server;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Server>
 */
class ServerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => 'server-'.$this->faker->slug(2),
            'type' => $this->faker->randomElement(['web', 'database', 'worker', 'load_balancer', 'container_host', 'cache']),
            'provider' => $this->faker->randomElement(['aws', 'digitalocean', 'hetzner', 'gcp', 'linode']),
            'ip_address' => $this->faker->ipv4(),
            'host_address' => $this->faker->ipv4(),
            'region' => 'us-east-1',
            'status' => 'online',
            'cpu_usage' => $this->faker->numberBetween(5, 70),
            'ram_used_gb' => 4.0,
            'ram_total_gb' => 8.0,
            'ram_percent' => 50.0,
            'disk_used_gb' => 45.0,
            'disk_total_gb' => 160.0,
            'disk_percent' => 28.1,
            'uptime' => '99.9% (30 days)',
            'tags' => ['production', 'node'],
            'vcpus' => 4,
            'ram_gb' => 8,
            'disk_gb' => 160,
        ];
    }
}
