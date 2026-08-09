<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Server extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'provider',
        'ip_address',
        'ipv6_address',
        'host_address',
        'region',
        'location_pin',
        'status',
        'cpu_usage',
        'ram_used_gb',
        'ram_total_gb',
        'ram_percent',
        'disk_used_gb',
        'disk_total_gb',
        'disk_percent',
        'uptime',
        'tags',
        'php_version',
        'db_engine',
        'active_sites_count',
        'proxmox_port',
        'proxmox_token_id',
        'proxmox_token_secret',
        'vcpus',
        'ram_gb',
        'disk_gb',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'cpu_usage' => 'integer',
            'ram_used_gb' => 'float',
            'ram_total_gb' => 'float',
            'ram_percent' => 'float',
            'disk_used_gb' => 'float',
            'disk_total_gb' => 'float',
            'disk_percent' => 'float',
            'active_sites_count' => 'integer',
            'proxmox_port' => 'integer',
            'vcpus' => 'integer',
            'ram_gb' => 'integer',
            'disk_gb' => 'integer',
        ];
    }

    /**
     * Get the user that owns the server.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
