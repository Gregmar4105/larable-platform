<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServerRequest;
use App\Http\Requests\UpdateServerRequest;
use App\Models\Server;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServerController extends Controller
{
    /**
     * Display a listing of the servers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Auto-seed initial default servers (including exact Proxmox server) if empty
        if (Server::where('user_id', $user->id)->count() === 0) {
            $this->seedInitialServers($user->id);
        } else {
            // Self-correct any existing domain URL servers that lack scheme or mistakenly had proxmox_port set
            $userServers = Server::where('user_id', $user->id)->get();
            foreach ($userServers as $srv) {
                $addr = $srv->host_address ?: $srv->ip_address;
                if ($addr && ! str_starts_with($addr, 'http://') && ! str_starts_with($addr, 'https://') && ! $this->isIpAddress($addr)) {
                    $normalized = "https://{$addr}";
                    $srv->update([
                        'host_address' => $normalized,
                        'ip_address' => $normalized,
                        'proxmox_port' => null,
                    ]);
                } elseif (str_starts_with($addr, 'http')) {
                    $srv->update(['proxmox_port' => null]);
                }
            }
        }

        $servers = Server::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Server $s) => $this->transformServer($s));

        return Inertia::render('servers/index', [
            'servers' => $servers,
        ]);
    }

    /**
     * Store a newly created server in storage.
     */
    public function store(StoreServerRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $isProxmox = $validated['provider'] === 'proxmox';
        $hostAddress = isset($validated['hostAddress']) && $validated['hostAddress'] !== null ? trim($validated['hostAddress']) : null;

        $isHostIp = $this->isIpAddress($hostAddress);

        // Normalize domain URLs to default to HTTPS scheme
        if ($hostAddress && ! $isHostIp && ! str_starts_with($hostAddress, 'http://') && ! str_starts_with($hostAddress, 'https://')) {
            $hostAddress = "https://{$hostAddress}";
        }

        $hostIp = $isProxmox
            ? ($hostAddress ?: '192.168.1.150')
            : '198.51.100.'.rand(1, 254);

        $inferredType = $isProxmox ? 'container_host' : 'web';
        $ramGb = $isProxmox ? 32 : ($validated['ramGb'] ?? 8);
        $diskGb = $isProxmox ? 500 : ($validated['diskGb'] ?? 160);
        $vcpus = $isProxmox ? 16 : ($validated['vcpus'] ?? 4);

        Server::create([
            'user_id' => $user->id,
            'name' => trim($validated['name']),
            'type' => $inferredType,
            'provider' => $validated['provider'],
            'ip_address' => $hostIp,
            'host_address' => $hostAddress ?: $hostIp,
            'region' => $isProxmox ? ($validated['locationPin'] ?? 'On-Premises Building') : ($validated['region'] ?? 'us-east-1'),
            'location_pin' => $isProxmox ? ($validated['locationPin'] ?? null) : null,
            'status' => 'online',
            'cpu_usage' => rand(10, 35),
            'ram_used_gb' => 4.0,
            'ram_total_gb' => $ramGb,
            'ram_percent' => (4.0 / $ramGb) * 100,
            'disk_used_gb' => 45.0,
            'disk_total_gb' => $diskGb,
            'disk_percent' => (45.0 / $diskGb) * 100,
            'uptime' => '100% (Just Provisioned)',
            'tags' => $isProxmox ? ['proxmox-ve', 'on-prem', $inferredType] : [$inferredType, 'new-node'],
            'proxmox_port' => ($isProxmox && $isHostIp) ? ($validated['port'] ?? 8006) : null,
            'proxmox_token_id' => $isProxmox ? ($validated['tokenId'] ?? null) : null,
            'proxmox_token_secret' => $isProxmox ? ($validated['tokenSecret'] ?? null) : null,
            'vcpus' => $vcpus,
            'ram_gb' => $ramGb,
            'disk_gb' => $diskGb,
        ]);

        return redirect()->route('servers.index')
            ->with('success', "Server \"{$validated['name']}\" provisioned successfully.");
    }

    /**
     * Update the specified server in storage.
     */
    public function update(UpdateServerRequest $request, Server $server): RedirectResponse
    {
        if ($server->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validated();

        $updateData = [
            'name' => trim($validated['name']),
            'status' => $validated['status'],
            'tags' => $validated['tags'] ?? $server->tags,
            'location_pin' => $validated['locationPin'] ?? $server->location_pin,
        ];

        if (array_key_exists('hostAddress', $validated) && $validated['hostAddress'] !== null) {
            $updateData['host_address'] = trim($validated['hostAddress']);
        }
        if (array_key_exists('port', $validated)) {
            $updateData['proxmox_port'] = $validated['port'];
        }
        if (array_key_exists('tokenId', $validated)) {
            $updateData['proxmox_token_id'] = $validated['tokenId'];
        }
        if (array_key_exists('tokenSecret', $validated) && $validated['tokenSecret'] !== null) {
            $updateData['proxmox_token_secret'] = $validated['tokenSecret'];
        }

        $server->update($updateData);

        return redirect()->route('servers.index')
            ->with('success', "Server \"{$server->name}\" updated successfully.");
    }

    /**
     * Remove the specified server from storage.
     */
    public function destroy(Request $request, Server $server): RedirectResponse
    {
        if ($server->user_id !== $request->user()->id) {
            abort(403);
        }

        $name = $server->name;
        $server->delete();

        return redirect()->route('servers.index')
            ->with('success', "Server \"{$name}\" has been deleted.");
    }

    /**
     * Helper to detect whether address is a numerical IP address vs Domain URL.
     */
    private function isIpAddress(?string $val): bool
    {
        if (! $val) {
            return false;
        }

        $trimmed = trim($val);
        if (str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return false;
        }

        return filter_var($trimmed, FILTER_VALIDATE_IP) !== false
            || (bool) preg_match('/^\d{1,3}(\.\d{1,3}){3}$/', $trimmed);
    }

    /**
     * Transform Server Eloquent model into frontend interface structure.
     *
     * @return array<string, mixed>
     */
    private function transformServer(Server $server): array
    {
        return [
            'id' => (string) $server->id,
            'name' => $server->name,
            'type' => $server->type,
            'provider' => $server->provider,
            'ipAddress' => $server->ip_address,
            'ipv6Address' => $server->ipv6_address,
            'hostAddress' => $server->host_address,
            'region' => $server->region,
            'locationPin' => $server->location_pin,
            'status' => $server->status,
            'cpuUsage' => $server->cpu_usage,
            'ramUsage' => [
                'usedGb' => $server->ram_used_gb,
                'totalGb' => $server->ram_total_gb,
                'percent' => $server->ram_percent,
            ],
            'diskUsage' => [
                'usedGb' => $server->disk_used_gb,
                'totalGb' => $server->disk_total_gb,
                'percent' => $server->disk_percent,
            ],
            'uptime' => $server->uptime,
            'tags' => $server->tags ?? [],
            'phpVersion' => $server->php_version,
            'dbEngine' => $server->db_engine,
            'activeSitesCount' => $server->active_sites_count,
            'proxmoxPort' => $server->proxmox_port,
            'proxmoxTokenId' => $server->proxmox_token_id,
            'proxmoxTokenSecret' => $server->proxmox_token_secret,
            'specs' => [
                'vcpus' => $server->vcpus,
                'ramGb' => $server->ram_gb,
                'diskGb' => $server->disk_gb,
            ],
            'createdDate' => $server->created_at->format('Y-m-d'),
        ];
    }

    /**
     * Seed initial default servers for a new user.
     */
    private function seedInitialServers(int $userId): void
    {
        $initialData = [
            [
                'name' => 'Larable Main Server',
                'type' => 'container_host',
                'provider' => 'proxmox',
                'ip_address' => 'https://server-main-01.larable.dev',
                'host_address' => 'https://server-main-01.larable.dev',
                'region' => 'Pasay, Southern Manila',
                'location_pin' => 'Barangay 183, Zone 20, District 1, Pasay, Southern Manila District, I',
                'status' => 'online',
                'cpu_usage' => 1,
                'ram_used_gb' => 2.5,
                'ram_total_gb' => 12.0,
                'ram_percent' => 22.3,
                'disk_used_gb' => 7.1,
                'disk_total_gb' => 68.0,
                'disk_percent' => 10.5,
                'uptime' => '100% (Online)',
                'tags' => ['proxmox-ve', 'on-prem', 'pasay-main'],
                'proxmox_port' => null, // Domain URL -> No port appended!
                'proxmox_token_id' => 'root@pam!larable-platform',
                'vcpus' => 12,
                'ram_gb' => 12,
                'disk_gb' => 68,
            ],
            [
                'name' => 'web-prod-primary-01',
                'type' => 'web',
                'provider' => 'aws',
                'ip_address' => '54.210.88.142',
                'ipv6_address' => '2600:1f18:2410:8b00::142',
                'region' => 'us-east-1 (N. Virginia)',
                'status' => 'online',
                'cpu_usage' => 28,
                'ram_used_gb' => 3.4,
                'ram_total_gb' => 8.0,
                'ram_percent' => 42.5,
                'disk_used_gb' => 38.0,
                'disk_total_gb' => 160.0,
                'disk_percent' => 23.75,
                'uptime' => '99.98% (48 days)',
                'tags' => ['production', 'nginx', 'php-8.4'],
                'php_version' => '8.4.1',
                'active_sites_count' => 8,
                'vcpus' => 4,
                'ram_gb' => 8,
                'disk_gb' => 160,
            ],
            [
                'name' => 'db-postgres-primary',
                'type' => 'database',
                'provider' => 'digitalocean',
                'ip_address' => '159.65.220.91',
                'region' => 'sfo3 (San Francisco)',
                'status' => 'online',
                'cpu_usage' => 54,
                'ram_used_gb' => 12.8,
                'ram_total_gb' => 16.0,
                'ram_percent' => 80.0,
                'disk_used_gb' => 142.0,
                'disk_total_gb' => 320.0,
                'disk_percent' => 44.37,
                'uptime' => '100% (112 days)',
                'tags' => ['production', 'postgres-16', 'primary'],
                'db_engine' => 'PostgreSQL 16.2',
                'vcpus' => 8,
                'ram_gb' => 16,
                'disk_gb' => 320,
            ],
            [
                'name' => 'proxmox-hypervisor-node-01',
                'type' => 'container_host',
                'provider' => 'proxmox',
                'ip_address' => '192.168.1.100',
                'host_address' => '192.168.1.100',
                'region' => 'Friedrichstraße 123, Berlin',
                'location_pin' => 'Friedrichstraße 123, 10117 Berlin, Germany',
                'status' => 'online',
                'cpu_usage' => 32,
                'ram_used_gb' => 48.0,
                'ram_total_gb' => 128.0,
                'ram_percent' => 37.5,
                'disk_used_gb' => 450.0,
                'disk_total_gb' => 2000.0,
                'disk_percent' => 22.5,
                'uptime' => '100% (240 days)',
                'tags' => ['proxmox-ve', 'on-prem', 'pve-cluster'],
                'proxmox_port' => 8006, // IP Address -> Port 8006 appended
                'proxmox_token_id' => 'root@pam!terraform',
                'vcpus' => 32,
                'ram_gb' => 128,
                'disk_gb' => 2000,
            ],
        ];

        foreach ($initialData as $data) {
            Server::create(array_merge($data, ['user_id' => $userId]));
        }
    }
}
