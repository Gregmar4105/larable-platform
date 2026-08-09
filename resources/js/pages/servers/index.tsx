import React, { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Boxes,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Cpu,
    Database,
    Edit3,
    Eye,
    EyeOff,
    Filter,
    Globe,
    Layers,
    Loader2,
    MapPin,
    MoreVertical,
    Network,
    Plus,
    RefreshCw,
    Search,
    Server as ServerIcon,
    Shield,
    SlidersHorizontal,
    Terminal,
    Trash2,
    Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Server, ServerProvider, ServerStatus, ServerType } from '@/types/server';

// Preset Real Street Address Suggestions for initial fallback
const INITIAL_ADDRESS_SUGGESTIONS = [
    '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
    '742 Evergreen Terrace, Springfield, OR 97477, USA',
    'Level 28, 100 Miller Street, North Sydney NSW 2060, Australia',
    'Ayala Ave cor. Paseo de Roxas, Makati, Metro Manila, Philippines',
    'Friedrichstraße 123, 10117 Berlin, Germany',
    '10 Downing Street, London SW1A 2AA, United Kingdom',
    'Shinjuku 3-Chome, Shinjuku City, Tokyo 160-0022, Japan',
    '5th Avenue & E 34th St, New York, NY 10001, USA',
];

// Default initial servers representing different card types & providers
const INITIAL_SERVERS: Server[] = [
    {
        id: 'srv-200',
        name: 'Larable Main Server',
        type: 'container_host',
        provider: 'proxmox',
        ipAddress: 'https://server-main-01.larable.dev',
        hostAddress: 'https://server-main-01.larable.dev',
        region: 'Pasay, Southern Manila',
        locationPin: 'Barangay 183, Zone 20, District 1, Pasay, Southern Manila District, I',
        status: 'online',
        cpuUsage: 28,
        ramUsage: { usedGb: 3.4, totalGb: 8, percent: 42.5 },
        diskUsage: { usedGb: 38, totalGb: 160, percent: 23.75 },
        uptime: '100% (Online)',
        tags: ['proxmox-ve', 'on-prem', 'pasay-main'],
        proxmoxTokenId: 'root@pam!larable-platform',
        specs: { vcpus: 16, ramGb: 32, diskGb: 500 },
        createdDate: '2026-08-09',
    },
    {
        id: 'srv-101',
        name: 'web-prod-primary-01',
        type: 'web',
        provider: 'aws',
        ipAddress: '54.210.88.142',
        ipv6Address: '2600:1f18:2410:8b00::142',
        region: 'us-east-1 (N. Virginia)',
        status: 'online',
        cpuUsage: 28,
        ramUsage: { usedGb: 3.4, totalGb: 8, percent: 42.5 },
        diskUsage: { usedGb: 38, totalGb: 160, percent: 23.75 },
        uptime: '99.98% (48 days)',
        tags: ['production', 'nginx', 'php-8.4'],
        phpVersion: '8.4.1',
        activeSitesCount: 8,
        specs: { vcpus: 4, ramGb: 8, diskGb: 160 },
        createdDate: '2025-11-10',
    },
    {
        id: 'srv-102',
        name: 'db-postgres-primary',
        type: 'database',
        provider: 'digitalocean',
        ipAddress: '159.65.220.91',
        region: 'sfo3 (San Francisco)',
        status: 'online',
        cpuUsage: 54,
        ramUsage: { usedGb: 12.8, totalGb: 16, percent: 80.0 },
        diskUsage: { usedGb: 142, totalGb: 320, percent: 44.37 },
        uptime: '100% (112 days)',
        tags: ['production', 'postgres-16', 'primary'],
        dbEngine: 'PostgreSQL 16.2',
        specs: { vcpus: 8, ramGb: 16, diskGb: 320 },
        createdDate: '2025-09-01',
    },
    {
        id: 'srv-109',
        name: 'proxmox-hypervisor-node-01',
        type: 'container_host',
        provider: 'proxmox',
        ipAddress: '192.168.1.100',
        region: 'Friedrichstraße 123, Berlin',
        locationPin: 'Friedrichstraße 123, 10117 Berlin, Germany',
        status: 'online',
        cpuUsage: 32,
        ramUsage: { usedGb: 48, totalGb: 128, percent: 37.5 },
        diskUsage: { usedGb: 450, totalGb: 2000, percent: 22.5 },
        uptime: '100% (240 days)',
        tags: ['proxmox-ve', 'on-prem', 'pve-cluster'],
        proxmoxPort: 8006,
        proxmoxTokenId: 'root@pam!terraform',
        specs: { vcpus: 32, ramGb: 128, diskGb: 2000 },
        createdDate: '2025-05-12',
    },
    {
        id: 'srv-103',
        name: 'queue-worker-horizon-01',
        type: 'worker',
        provider: 'hetzner',
        ipAddress: '168.119.140.75',
        region: 'fsn1 (Falkenstein)',
        status: 'online',
        cpuUsage: 41,
        ramUsage: { usedGb: 4.8, totalGb: 8, percent: 60.0 },
        diskUsage: { usedGb: 22, totalGb: 80, percent: 27.5 },
        uptime: '99.94% (32 days)',
        tags: ['production', 'horizon', 'redis-jobs'],
        specs: { vcpus: 4, ramGb: 8, diskGb: 80 },
        createdDate: '2025-12-05',
    },
    {
        id: 'srv-104',
        name: 'edge-loadbalancer-01',
        type: 'load_balancer',
        provider: 'gcp',
        ipAddress: '34.141.90.11',
        region: 'europe-west3 (Frankfurt)',
        status: 'online',
        cpuUsage: 14,
        ramUsage: { usedGb: 1.8, totalGb: 4, percent: 45.0 },
        diskUsage: { usedGb: 12, totalGb: 50, percent: 24.0 },
        uptime: '99.99% (180 days)',
        tags: ['edge', 'haproxy', 'ssl-term'],
        specs: { vcpus: 2, ramGb: 4, diskGb: 50 },
        createdDate: '2025-06-15',
    },
    {
        id: 'srv-105',
        name: 'k8s-node-worker-alpha',
        type: 'container_host',
        provider: 'aws',
        ipAddress: '52.14.99.204',
        region: 'us-west-2 (Oregon)',
        status: 'online',
        cpuUsage: 68,
        ramUsage: { usedGb: 24.5, totalGb: 32, percent: 76.56 },
        diskUsage: { usedGb: 210, totalGb: 500, percent: 42.0 },
        uptime: '99.85% (18 days)',
        tags: ['docker', 'kubernetes', 'cluster-alpha'],
        specs: { vcpus: 16, ramGb: 32, diskGb: 500 },
        createdDate: '2026-01-20',
    },
    {
        id: 'srv-106',
        name: 'cache-redis-cluster-01',
        type: 'cache',
        provider: 'linode',
        ipAddress: '172.104.22.89',
        region: 'ap-south (Mumbai)',
        status: 'online',
        cpuUsage: 19,
        ramUsage: { usedGb: 6.2, totalGb: 8, percent: 77.5 },
        diskUsage: { usedGb: 15, totalGb: 60, percent: 25.0 },
        uptime: '100% (64 days)',
        tags: ['redis-7', 'cache-layer', 'session-store'],
        specs: { vcpus: 2, ramGb: 8, diskGb: 60 },
        createdDate: '2025-10-14',
    },
    {
        id: 'srv-107',
        name: 'web-staging-node-02',
        type: 'web',
        provider: 'digitalocean',
        ipAddress: '143.198.77.34',
        region: 'nyc1 (New York)',
        status: 'provisioning',
        cpuUsage: 88,
        ramUsage: { usedGb: 1.9, totalGb: 4, percent: 47.5 },
        diskUsage: { usedGb: 18, totalGb: 80, percent: 22.5 },
        uptime: 'Provisioning...',
        tags: ['staging', 'testing', 'setup-in-progress'],
        phpVersion: '8.4.1',
        activeSitesCount: 2,
        specs: { vcpus: 2, ramGb: 4, diskGb: 80 },
        createdDate: '2026-08-09',
    },
];

// Server type metadata for visual branding & badges
const SERVER_TYPE_CONFIG: Record<
    ServerType,
    {
        label: string;
        description: string;
        icon: React.ElementType;
        badgeStyle: string;
        cardBorder: string;
        gradientBg: string;
    }
> = {
    web: {
        label: 'Web Server',
        description: 'Serves web applications & HTTP requests (Nginx / PHP-FPM)',
        icon: Globe,
        badgeStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        cardBorder: 'hover:border-blue-500/50',
        gradientBg: 'from-blue-500/10 via-transparent to-transparent',
    },
    database: {
        label: 'Database Server',
        description: 'Relational data store & persistent storage engine',
        icon: Database,
        badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        cardBorder: 'hover:border-emerald-500/50',
        gradientBg: 'from-emerald-500/10 via-transparent to-transparent',
    },
    worker: {
        label: 'Queue Worker',
        description: 'Executes background tasks, queues & scheduled cron jobs',
        icon: Cpu,
        badgeStyle: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        cardBorder: 'hover:border-purple-500/50',
        gradientBg: 'from-purple-500/10 via-transparent to-transparent',
    },
    load_balancer: {
        label: 'Load Balancer',
        description: 'Traffic distribution, HAProxy & SSL termination node',
        icon: Network,
        badgeStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        cardBorder: 'hover:border-amber-500/50',
        gradientBg: 'from-amber-500/10 via-transparent to-transparent',
    },
    container_host: {
        label: 'Container Host',
        description: 'Docker daemon & microservice container runner',
        icon: Boxes,
        badgeStyle: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
        cardBorder: 'hover:border-cyan-500/50',
        gradientBg: 'from-cyan-500/10 via-transparent to-transparent',
    },
    cache: {
        label: 'Cache & Redis',
        description: 'Ultra-fast in-memory key-value cache & pub/sub store',
        icon: Zap,
        badgeStyle: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
        cardBorder: 'hover:border-rose-500/50',
        gradientBg: 'from-rose-500/10 via-transparent to-transparent',
    },
};

const PROVIDER_NAMES: Record<ServerProvider, string> = {
    aws: 'AWS EC2',
    digitalocean: 'DigitalOcean Droplet',
    hetzner: 'Hetzner Cloud',
    gcp: 'Google Cloud Platform',
    linode: 'Linode / Akamai',
    proxmox: 'Proxmox VE (Self-Hosted / On-Prem)',
};

export default function ServersIndex({ servers: initialServers = [] }: { servers?: Server[] }) {
    const [servers, setServers] = useState<Server[]>(initialServers.length > 0 ? initialServers : INITIAL_SERVERS);

    // Sync local state when Inertia reloads servers prop from backend
    useEffect(() => {
        if (initialServers && initialServers.length > 0) {
            setServers(initialServers);
        }
    }, [initialServers]);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [copiedIp, setCopiedIp] = useState<string | null>(null);

    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingServer, setEditingServer] = useState<Server | null>(null);
    const [deletingServer, setDeletingServer] = useState<Server | null>(null);

    // Form data state for creation
    const [formData, setFormData] = useState({
        name: '',
        provider: 'aws' as ServerProvider,
        region: 'us-east-1',
        vcpus: 4,
        ramGb: 8,
        diskGb: 160,
        // Proxmox specific fields
        hostAddress: '',
        port: 8006,
        tokenId: '',
        tokenSecret: '',
        locationPin: '',
    });

    // Real Address Search state (Google Maps / OpenStreetMap Geocoding API)
    const [locationSearchInput, setLocationSearchInput] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<string[]>(INITIAL_ADDRESS_SUGGESTIONS);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [showTokenSecret, setShowTokenSecret] = useState(false);

    // Live Geocoding Address Lookup (Fetches real street addresses as user types)
    useEffect(() => {
        if (!locationSearchInput || locationSearchInput.length < 2) {
            setAddressSuggestions(INITIAL_ADDRESS_SUGGESTIONS);
            return;
        }

        const timer = setTimeout(() => {
            setIsLoadingAddresses(true);
            fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    locationSearchInput,
                )}&limit=6`,
                {
                    headers: { 'Accept-Language': 'en' },
                },
            )
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        const addresses = data.map(
                            (item: { display_name: string }) => item.display_name,
                        );
                        setAddressSuggestions(addresses);
                    } else {
                        // Filter local fallback addresses
                        const filtered = INITIAL_ADDRESS_SUGGESTIONS.filter((a) =>
                            a.toLowerCase().includes(locationSearchInput.toLowerCase()),
                        );
                        setAddressSuggestions(filtered.length ? filtered : [locationSearchInput]);
                    }
                })
                .catch(() => {
                    const filtered = INITIAL_ADDRESS_SUGGESTIONS.filter((a) =>
                        a.toLowerCase().includes(locationSearchInput.toLowerCase()),
                    );
                    setAddressSuggestions(filtered.length ? filtered : [locationSearchInput]);
                })
                .finally(() => {
                    setIsLoadingAddresses(false);
                });
        }, 350);

        return () => clearTimeout(timer);
    }, [locationSearchInput]);

    // Asynchronous, non-blocking 5-second background ping engine
    useEffect(() => {
        const getCsrfToken = (): string => {
            const metaToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            if (metaToken) return metaToken;
            const match = document.cookie.match(new RegExp('(?:^|; )XSRF-TOKEN=([^;]+)'));
            return match ? decodeURIComponent(match[1]) : '';
        };

        const pingAllServers = async () => {
            const token = getCsrfToken();

            const pingPromises = servers.map(async (server) => {
                const targetAddress = server.hostAddress || server.ipAddress;
                if (!targetAddress) return null;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for internet HTTPS nodes

                try {
                    const res = await fetch('/api/servers/ping', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': token,
                            'X-XSRF-TOKEN': token,
                            Accept: 'application/json',
                        },
                        body: JSON.stringify({
                            address: targetAddress,
                            port: server.proxmoxPort,
                            tokenId: server.proxmoxTokenId,
                            tokenSecret: server.proxmoxTokenSecret,
                        }),
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const data = await res.json();
                        return {
                            id: server.id,
                            online: Boolean(data.online),
                            latencyMs: data.latency_ms ?? null,
                            metrics: data.metrics ?? null,
                        };
                    }
                } catch {
                    clearTimeout(timeoutId);
                }

                // If unreachable or timed out, report offline safely without throwing errors
                return {
                    id: server.id,
                    online: false,
                    latencyMs: null,
                    metrics: null,
                };
            });

            const results = await Promise.allSettled(pingPromises);

            setServers((prevServers) => {
                const updatesMap = new Map<string, {
                    online: boolean;
                    latencyMs: number | null;
                    metrics: {
                        cpuUsage?: number;
                        vcpus?: number;
                        ramUsage?: { usedGb: number; totalGb: number; percent: number };
                        diskUsage?: { usedGb: number; totalGb: number; percent: number };
                        uptime?: string;
                    } | null;
                }>();

                results.forEach((res) => {
                    if (res.status === 'fulfilled' && res.value) {
                        updatesMap.set(res.value.id, {
                            online: res.value.online,
                            latencyMs: res.value.latencyMs,
                            metrics: res.value.metrics,
                        });
                    }
                });

                let hasChanges = false;
                const nextServers = prevServers.map((srv) => {
                    const update = updatesMap.get(srv.id);
                    if (!update) return srv;

                    const newStatus: ServerStatus = update.online ? 'online' : 'offline';
                    const m = update.metrics;

                    if (m && update.online) {
                        hasChanges = true;
                        return {
                            ...srv,
                            status: newStatus,
                            latencyMs: update.latencyMs ?? undefined,
                            cpuUsage: typeof m.cpuUsage === 'number' ? m.cpuUsage : srv.cpuUsage,
                            ramUsage: m.ramUsage ? {
                                usedGb: m.ramUsage.usedGb,
                                totalGb: m.ramUsage.totalGb,
                                percent: m.ramUsage.percent,
                            } : srv.ramUsage,
                            diskUsage: m.diskUsage ? {
                                usedGb: m.diskUsage.usedGb,
                                totalGb: m.diskUsage.totalGb,
                                percent: m.diskUsage.percent,
                            } : srv.diskUsage,
                            specs: {
                                vcpus: m.vcpus ?? srv.specs.vcpus,
                                ramGb: m.ramUsage?.totalGb ? Math.round(m.ramUsage.totalGb) : srv.specs.ramGb,
                                diskGb: m.diskUsage?.totalGb ? Math.round(m.diskUsage.totalGb) : srv.specs.diskGb,
                            },
                            uptime: m.uptime ?? srv.uptime,
                            lastPingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        };
                    }

                    if (srv.status !== newStatus || srv.latencyMs !== (update.latencyMs ?? undefined)) {
                        hasChanges = true;
                        return {
                            ...srv,
                            status: newStatus,
                            latencyMs: update.latencyMs ?? undefined,
                            lastPingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        };
                    }
                    return srv;
                });

                return hasChanges ? nextServers : prevServers;
            });
        };

        // Initial check on mount
        pingAllServers();

        // 5-second recurring background interval
        const intervalId = setInterval(() => {
            pingAllServers();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [servers.length]);

    // Dynamic detection: Is hostAddress an IP Address vs Domain URL?
    const isIpAddress = (val: string): boolean => {
        if (!val) return false;
        const trimmed = val.trim();
        return /^[0-9]/.test(trimmed) || /^\d{1,3}(\.\d{1,3})*/.test(trimmed);
    };

    // Copy SSH command helper
    const handleCopySsh = (ip: string, name: string) => {
        const command = `ssh forge@${ip}`;
        navigator.clipboard.writeText(command);
        setCopiedIp(ip);
        toast.success(`Copied SSH command for ${name}`, {
            description: command,
        });
        setTimeout(() => setCopiedIp(null), 2500);
    };

    // Filter servers
    const filteredServers = useMemo(() => {
        return servers.filter((srv) => {
            const matchesType = selectedType === 'all' || srv.type === selectedType;
            const matchesStatus = selectedStatus === 'all' || srv.status === selectedStatus;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                srv.name.toLowerCase().includes(q) ||
                srv.ipAddress.includes(q) ||
                srv.region.toLowerCase().includes(q) ||
                (srv.locationPin && srv.locationPin.toLowerCase().includes(q)) ||
                srv.tags.some((t) => t.toLowerCase().includes(q)) ||
                PROVIDER_NAMES[srv.provider].toLowerCase().includes(q);

            return matchesType && matchesStatus && matchesSearch;
        });
    }, [servers, selectedType, selectedStatus, searchQuery]);

    // Computed Stats
    const stats = useMemo(() => {
        const total = servers.length;
        const online = servers.filter((s) => s.status === 'online').length;
        const avgCpu = Math.round(
            servers.reduce((acc, s) => acc + s.cpuUsage, 0) / (total || 1),
        );
        const totalRam = servers.reduce((acc, s) => acc + s.ramUsage.totalGb, 0);

        return { total, online, avgCpu, totalRam };
    }, [servers]);

    // Handle Create Server submit
    const handleCreateServer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Server name is required');
            return;
        }

        const isProxmox = formData.provider === 'proxmox';

        if (isProxmox) {
            if (!formData.hostAddress.trim()) {
                toast.error('Host address (IP or Domain) is required for Proxmox');
                return;
            }
            if (!formData.tokenId.trim()) {
                toast.error('Token ID is required for Proxmox API authentication');
                return;
            }
            if (!formData.tokenSecret.trim()) {
                toast.error('Token Secret is required for Proxmox API authentication');
                return;
            }
        }

        let targetHostAddress = formData.hostAddress.trim();
        if (targetHostAddress && !isIpAddress(targetHostAddress) && !targetHostAddress.startsWith('http://') && !targetHostAddress.startsWith('https://')) {
            targetHostAddress = `https://${targetHostAddress}`;
        }

        router.post('/servers', { ...formData, hostAddress: targetHostAddress }, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setFormData({
                    name: '',
                    provider: 'aws',
                    region: 'us-east-1',
                    vcpus: 4,
                    ramGb: 8,
                    diskGb: 160,
                    hostAddress: '',
                    port: 8006,
                    tokenId: '',
                    tokenSecret: '',
                    locationPin: '',
                });
                setLocationSearchInput('');
                toast.success(`Server "${formData.name}" added successfully!`);
            },
            onError: (errors) => {
                const firstErr = Object.values(errors)[0];
                toast.error(firstErr || 'Failed to provision server');
            },
        });
    };

    // Handle Restart Server simulation
    const handleRestartServer = (id: string, name: string) => {
        toast.info(`Restarting server ${name}...`, {
            description: 'Sending reboot signal via provider API.',
        });
        setServers((prev) =>
            prev.map((s) =>
                s.id === id
                    ? { ...s, status: 'maintenance', uptime: 'Rebooting system...' }
                    : s,
            ),
        );

        setTimeout(() => {
            setServers((prev) =>
                prev.map((s) =>
                    s.id === id
                        ? { ...s, status: 'online', uptime: '100% (Just restarted)' }
                        : s,
                ),
            );
            toast.success(`Server ${name} is back online!`);
        }, 3500);
    };

    // Handle Edit Server submit
    const handleEditServerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingServer) return;

        router.put(`/servers/${editingServer.id}`, {
            name: editingServer.name,
            status: editingServer.status,
            tags: editingServer.tags,
            locationPin: editingServer.locationPin,
            hostAddress: editingServer.hostAddress,
            port: editingServer.proxmoxPort,
            tokenId: editingServer.proxmoxTokenId,
            tokenSecret: editingServer.proxmoxTokenSecret,
        }, {
            onSuccess: () => {
                setIsEditOpen(false);
                toast.success(`Server "${editingServer.name}" updated successfully.`);
            },
            onError: () => {
                toast.error('Failed to update server.');
            },
        });
    };

    // Handle Delete Server submit
    const handleDeleteServerSubmit = () => {
        if (!deletingServer) return;

        router.delete(`/servers/${deletingServer.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                toast.success(`Server "${deletingServer.name}" has been deleted.`);
                setDeletingServer(null);
            },
            onError: () => {
                toast.error('Failed to delete server.');
            },
        });
    };

    return (
        <>
            <Head title="Servers Management" />
            <div className="flex flex-col gap-6 p-4 md:p-6 w-full flex-1">
                {/* Page Title Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <ServerIcon className="h-7 w-7 text-primary shrink-0" />
                            Servers Management
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Monitor, manage, and provision compute nodes, Proxmox hypervisors, and server clusters.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-sidebar-border/70 px-3 py-1.5 rounded-lg shadow-2xs">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="font-medium text-foreground">Auto-Ping Engine</span>
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">5s interval</span>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            Provision Server
                        </Button>
                    </div>
                </div>

                {/* Top Metrics Grid - 4 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-xs flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Total Servers</p>
                            <p className="text-2xl font-bold text-foreground leading-none">{stats.total}</p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ServerIcon className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-xs flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Online & Active</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                                {stats.online} <span className="text-xs text-muted-foreground font-normal">/ {stats.total}</span>
                            </p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-xs flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Avg CPU Utilization</p>
                            <p className="text-2xl font-bold text-foreground leading-none">{stats.avgCpu}%</p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Activity className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-xs flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Total Memory Capacity</p>
                            <p className="text-2xl font-bold text-foreground leading-none">{stats.totalRam} GB</p>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Layers className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Single Sleek 1-Row Filter Control Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card p-3 rounded-xl border border-sidebar-border/70 shadow-2xs w-full">
                    {/* Server Type Dropdown */}
                    <div className="w-full sm:w-56 shrink-0">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full text-xs h-9">
                                <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="Server Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">
                                    All Server Types ({servers.length})
                                </SelectItem>
                                {(Object.keys(SERVER_TYPE_CONFIG) as ServerType[]).map((typeKey) => {
                                    const config = SERVER_TYPE_CONFIG[typeKey];
                                    const count = servers.filter((s) => s.type === typeKey).length;
                                    return (
                                        <SelectItem key={typeKey} value={typeKey} className="text-xs">
                                            {config.label} ({count})
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Dropdown */}
                    <div className="w-full sm:w-44 shrink-0">
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full text-xs h-9">
                                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                                <SelectItem value="online" className="text-xs">Online</SelectItem>
                                <SelectItem value="provisioning" className="text-xs">Provisioning</SelectItem>
                                <SelectItem value="maintenance" className="text-xs">Maintenance</SelectItem>
                                <SelectItem value="offline" className="text-xs">Offline</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Input Spanning Full Remaining Width */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by server name, IP address, location, street address, or provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-xs h-9 w-full"
                        />
                    </div>
                </div>

                {/* Servers Cards Grid - Utilizing Full Viewport Width */}
                {filteredServers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-sidebar-border bg-card w-full">
                        <ServerIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <h3 className="text-base font-semibold text-foreground">No Servers Found</h3>
                        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                            No servers match your current search query or active filter criteria. Try clearing filters or provisioning a new server.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedType('all');
                                setSelectedStatus('all');
                                setSearchQuery('');
                            }}
                        >
                            Reset All Filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
                        {filteredServers.map((server) => {
                            const config = SERVER_TYPE_CONFIG[server.type];
                            const TypeIcon = config.icon;

                            // Status badge rendering helper
                            const renderStatusBadge = (srv: Server) => {
                                switch (srv.status) {
                                    case 'online':
                                        return (
                                            <div className="flex items-center gap-1.5">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 gap-1.5 text-[11px] py-0.5"
                                                >
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    Online
                                                </Badge>
                                                {srv.latencyMs !== undefined && srv.latencyMs !== null && (
                                                    <span className="text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                        {srv.latencyMs}ms
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    case 'provisioning':
                                        return (
                                            <Badge
                                                variant="outline"
                                                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 gap-1.5 text-[11px] py-0.5"
                                            >
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                </span>
                                                Provisioning
                                            </Badge>
                                        );
                                    case 'maintenance':
                                        return (
                                            <Badge
                                                variant="outline"
                                                className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900 gap-1.5 text-[11px] py-0.5"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                                                Maintenance
                                            </Badge>
                                        );
                                    case 'offline':
                                        return (
                                            <Badge
                                                variant="outline"
                                                className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 gap-1.5 text-[11px] py-0.5"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                                Offline
                                            </Badge>
                                        );
                                }
                            };

                            return (
                                <div
                                    key={server.id}
                                    className={`relative flex flex-col justify-between rounded-xl border border-sidebar-border/70 bg-card transition-all duration-200 hover:shadow-md ${config.cardBorder}`}
                                >
                                    {/* Subtle Card Type Header Gradient Accent */}
                                    <div
                                        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${config.gradientBg}`}
                                    />

                                    <div>
                                        {/* Card Header Section */}
                                        <div className="p-5 pb-3">
                                            <div className="flex flex-row items-start justify-between gap-3">
                                                {/* Server Name & Type Badge */}
                                                <div className="space-y-1.5 min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={`gap-1 px-2 py-0.5 font-medium text-[11px] ${config.badgeStyle}`}
                                                        >
                                                            <TypeIcon className="h-3 w-3 shrink-0" />
                                                            {config.label}
                                                        </Badge>
                                                        {renderStatusBadge(server)}
                                                    </div>
                                                    <h3 className="text-base font-bold tracking-tight text-foreground truncate" title={server.name}>
                                                        {server.name}
                                                    </h3>
                                                    <p className="text-xs flex items-center gap-1 text-muted-foreground truncate">
                                                        <span className="font-medium text-foreground">{PROVIDER_NAMES[server.provider]}</span>
                                                    </p>
                                                    {server.locationPin ? (
                                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate font-medium" title={server.locationPin}>
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{server.locationPin}</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            <span>{server.region}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Quick Options Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem
                                                            onClick={() => handleCopySsh(server.ipAddress, server.name)}
                                                            className="gap-2 cursor-pointer text-xs"
                                                        >
                                                            <Terminal className="h-3.5 w-3.5" />
                                                            Copy SSH Command
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleRestartServer(server.id, server.name)}
                                                            className="gap-2 cursor-pointer text-xs"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                            Restart Server
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setEditingServer(server);
                                                                setIsEditOpen(true);
                                                            }}
                                                            className="gap-2 cursor-pointer text-xs"
                                                        >
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                            Edit Server Specs
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setDeletingServer(server);
                                                                setIsDeleteOpen(true);
                                                            }}
                                                            className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete Server
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* IP & Quick Info Strip */}
                                        <div className="px-5 py-2 bg-muted/30 border-y border-sidebar-border/40 flex flex-row items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 font-mono text-muted-foreground">
                                                <span className="font-semibold text-foreground">
                                                    {server.ipAddress}
                                                    {server.proxmoxPort && isIpAddress(server.ipAddress) ? `:${server.proxmoxPort}` : ''}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopySsh(server.ipAddress, server.name)}
                                                className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                {copiedIp === server.ipAddress ? (
                                                    <>
                                                        <Check className="h-3 w-3 text-emerald-500" />
                                                        <span className="text-emerald-500">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-3 w-3" />
                                                        <span>Copy SSH</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {(() => {
                                            const isOnline = server.status === 'online';
                                            return (
                                                <div className="p-5 space-y-3.5">
                                                    {/* CPU Usage Bar */}
                                                    <div className="space-y-1">
                                                        <div className="flex flex-row items-center justify-between text-xs">
                                                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                                                <Cpu className="h-3.5 w-3.5 text-primary" /> CPU Load
                                                            </span>
                                                            <span className={`font-semibold ${!isOnline ? 'text-muted-foreground' : server.cpuUsage > 85 ? 'text-red-500' : server.cpuUsage > 60 ? 'text-amber-500' : 'text-foreground'}`}>
                                                                {isOnline ? `${server.cpuUsage}%` : '—'}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${
                                                                    !isOnline
                                                                        ? 'bg-muted-foreground/20'
                                                                        : server.cpuUsage > 85
                                                                        ? 'bg-red-500'
                                                                        : server.cpuUsage > 60
                                                                        ? 'bg-amber-500'
                                                                        : 'bg-primary'
                                                                }`}
                                                                style={{ width: `${isOnline ? Math.min(server.cpuUsage, 100) : 0}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* RAM Usage Bar */}
                                                    <div className="space-y-1">
                                                        <div className="flex flex-row items-center justify-between text-xs">
                                                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                                                <Layers className="h-3.5 w-3.5 text-purple-500" /> Memory (RAM)
                                                            </span>
                                                            <span className="text-foreground">
                                                                {isOnline ? (
                                                                    <>
                                                                        <strong className="font-semibold">{server.ramUsage.usedGb} GB</strong> / {server.ramUsage.totalGb} GB
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted-foreground font-medium">—</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${isOnline ? 'bg-purple-500' : 'bg-muted-foreground/20'}`}
                                                                style={{ width: `${isOnline ? Math.min(server.ramUsage.percent, 100) : 0}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Disk Storage Bar */}
                                                    <div className="space-y-1">
                                                        <div className="flex flex-row items-center justify-between text-xs">
                                                            <span className="text-muted-foreground flex items-center gap-1 font-medium">
                                                                <Activity className="h-3.5 w-3.5 text-emerald-500" /> Disk Storage
                                                            </span>
                                                            <span className="text-foreground">
                                                                {isOnline ? (
                                                                    <>
                                                                        <strong className="font-semibold">{server.diskUsage.usedGb} GB</strong> / {server.diskUsage.totalGb} GB
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted-foreground font-medium">—</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/20'}`}
                                                                style={{ width: `${isOnline ? Math.min(server.diskUsage.percent, 100) : 0}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Specific Type Metadata Highlights */}
                                                    <div className="pt-2 border-t border-sidebar-border/40 text-xs text-muted-foreground grid grid-cols-2 gap-2">
                                                        <div>
                                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-wider">Specs</span>
                                                            <p className="font-medium text-foreground text-[11px] mt-0.5">
                                                                {isOnline ? `${server.specs.vcpus} vCPU • ${server.specs.ramGb}GB RAM` : '—'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 tracking-wider">
                                                                {server.provider === 'proxmox' ? 'Proxmox API' : server.type === 'web' ? 'Engine' : server.type === 'database' ? 'Database' : 'Uptime'}
                                                            </span>
                                                            <p className="font-medium text-foreground text-[11px] mt-0.5 truncate">
                                                                {isOnline
                                                                    ? server.provider === 'proxmox'
                                                                        ? server.proxmoxTokenId || 'PVE Token Auth'
                                                                        : server.type === 'web' && server.phpVersion
                                                                        ? `PHP ${server.phpVersion}`
                                                                        : server.type === 'database' && server.dbEngine
                                                                        ? server.dbEngine
                                                                        : server.uptime
                                                                    : '—'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Tags list */}
                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                        {server.tags.map((tag) => (
                                                            <Badge
                                                                key={tag}
                                                                variant="secondary"
                                                                className="text-[10px] px-1.5 py-0 font-normal rounded-md"
                                                            >
                                                                #{tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="p-4 pt-3 border-t border-sidebar-border/40 bg-muted/10 flex flex-row items-center justify-between rounded-b-xl">
                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Added {server.createdDate}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopySsh(server.ipAddress, server.name)}
                                            className="h-7 text-xs gap-1.5 cursor-pointer"
                                        >
                                            <Terminal className="h-3 w-3" />
                                            SSH Connect
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Provision Server Modal Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <ServerIcon className="h-5 w-5 text-primary" />
                            Provision New Server
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Enter server name, select cloud provider, and configure node connection details.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateServer} className="space-y-4 py-2">
                        {/* Server Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="server-name" className="text-xs">Server Name</Label>
                            <Input
                                id="server-name"
                                placeholder="e.g. web-app-prod-02"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="text-xs"
                                required
                            />
                        </div>

                        {/* Cloud Provider & Region */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="provider" className="text-xs">Cloud Provider</Label>
                                <Select
                                    value={formData.provider}
                                    onValueChange={(val) => setFormData({ ...formData, provider: val as ServerProvider })}
                                >
                                    <SelectTrigger id="provider" className="text-xs">
                                        <SelectValue placeholder="Provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(PROVIDER_NAMES) as ServerProvider[]).map((p) => (
                                            <SelectItem key={p} value={p} className="text-xs">
                                                {PROVIDER_NAMES[p]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Standard Datacenter Region (Hidden if Proxmox, as Proxmox uses Real Street Address Search) */}
                            {formData.provider !== 'proxmox' && (
                                <div className="space-y-1.5">
                                    <Label htmlFor="region" className="text-xs">Datacenter Region</Label>
                                    <Select
                                        value={formData.region}
                                        onValueChange={(val) => setFormData({ ...formData, region: val })}
                                    >
                                        <SelectTrigger id="region" className="text-xs">
                                            <SelectValue placeholder="Region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="us-east-1" className="text-xs">us-east-1 (N. Virginia)</SelectItem>
                                            <SelectItem value="sfo3" className="text-xs">sfo3 (San Francisco)</SelectItem>
                                            <SelectItem value="fsn1" className="text-xs">fsn1 (Frankfurt/Falkenstein)</SelectItem>
                                            <SelectItem value="ap-southeast-1" className="text-xs">ap-southeast-1 (Singapore)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* PROXMOX SPECIFIC FIELDS (If Proxmox selected, HIDE server specs and SHOW Proxmox configuration) */}
                        {formData.provider === 'proxmox' ? (
                            <div className="space-y-4 pt-2 border-t border-sidebar-border/60">
                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs">
                                    <Shield className="h-4 w-4 shrink-0" />
                                    <span>Proxmox VE On-Premises Hypervisor Connection Configuration</span>
                                </div>

                                {/* Real Street Address Search with Live Autocomplete Suggestions */}
                                <div className="space-y-1.5 relative">
                                    <Label htmlFor="location-search" className="text-xs flex items-center justify-between">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                                            Server Address / Location (Google Maps Pin)
                                        </span>
                                        {isLoadingAddresses && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Loader2 className="h-3 w-3 animate-spin" /> Searching real addresses...
                                            </span>
                                        )}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="location-search"
                                            placeholder="Type street address, building name, city, or landmark..."
                                            value={locationSearchInput || formData.locationPin}
                                            onChange={(e) => {
                                                setLocationSearchInput(e.target.value);
                                                setFormData({ ...formData, locationPin: e.target.value });
                                                setShowLocationSuggestions(true);
                                            }}
                                            onFocus={() => setShowLocationSuggestions(true)}
                                            className="text-xs pr-8"
                                        />
                                        <MapPin className="absolute right-2.5 top-2.5 h-4 w-4 text-emerald-500" />
                                    </div>

                                    {/* Google Maps Real Address Autocomplete Suggestions Dropdown */}
                                    {showLocationSuggestions && addressSuggestions.length > 0 && (
                                        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover text-popover-foreground rounded-lg border border-sidebar-border shadow-lg max-h-52 overflow-y-auto">
                                            <div className="p-1 text-[10px] uppercase font-semibold text-muted-foreground tracking-wider px-2 py-1 bg-muted/40 border-b flex items-center justify-between">
                                                <span>Google Maps Address Suggestions</span>
                                                <span className="text-[9px] font-normal text-muted-foreground">Real-time Geocoding</span>
                                            </div>
                                            {addressSuggestions.map((loc, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        setFormData({ ...formData, locationPin: loc });
                                                        setLocationSearchInput(loc);
                                                        setShowLocationSuggestions(false);
                                                        toast.success(`Pinned address: ${loc}`);
                                                    }}
                                                    className="px-3 py-2 text-xs hover:bg-accent cursor-pointer flex items-center gap-2 transition-colors border-b last:border-0 border-sidebar-border/30"
                                                >
                                                    <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                    <span className="truncate">{loc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Field: Host Address (Domain URL vs IP Address) */}
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="host-address" className="text-xs font-semibold flex items-center gap-1.5">
                                                    {isIpAddress(formData.hostAddress) ? (
                                                        <>
                                                            <Network className="h-3.5 w-3.5 text-blue-500" />
                                                            Proxmox Node IP Address
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Globe className="h-3.5 w-3.5 text-purple-500" />
                                                            Proxmox Domain URL
                                                        </>
                                                    )}
                                                </Label>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {isIpAddress(formData.hostAddress) ? 'IP Address Mode' : 'Domain URL Mode'}
                                                </span>
                                            </div>
                                            <Input
                                                id="host-address"
                                                placeholder={
                                                    isIpAddress(formData.hostAddress)
                                                        ? 'e.g. 192.168.1.100'
                                                        : 'e.g. pve.example.com or 192.168.1.100'
                                                }
                                                value={formData.hostAddress}
                                                onChange={(e) => setFormData({ ...formData, hostAddress: e.target.value })}
                                                className="text-xs font-mono"
                                                required
                                            />
                                        </div>

                                        {/* Port Field (Rendered when IP Address is typed) */}
                                        {isIpAddress(formData.hostAddress) && (
                                            <div className="space-y-1.5 animate-in fade-in duration-200">
                                                <Label htmlFor="proxmox-port" className="text-xs">
                                                    Proxmox Port Number
                                                </Label>
                                                <Input
                                                    id="proxmox-port"
                                                    type="number"
                                                    placeholder="8006"
                                                    value={formData.port}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            port: parseInt(e.target.value) || 8006,
                                                        })
                                                    }
                                                    className="text-xs font-mono"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Token ID field */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="token-id" className="text-xs">
                                            Token ID
                                        </Label>
                                        <Input
                                            id="token-id"
                                            placeholder="e.g. root@pam!mytoken"
                                            value={formData.tokenId}
                                            onChange={(e) => setFormData({ ...formData, tokenId: e.target.value })}
                                            className="text-xs font-mono"
                                            required
                                        />
                                    </div>

                                    {/* Token Secret field */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="token-secret" className="text-xs">
                                            Token Secret
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="token-secret"
                                                type={showTokenSecret ? 'text' : 'password'}
                                                placeholder="e.g. 5a4b3c2d-1e0f-9876-5432-10abcdef9876"
                                                value={formData.tokenSecret}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, tokenSecret: e.target.value })
                                                }
                                                className="text-xs font-mono pr-9"
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowTokenSecret(!showTokenSecret)}
                                                className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                            >
                                                {showTokenSecret ? (
                                                    <EyeOff className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Eye className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Standard Hardware Specs Presets (Rendered ONLY when provider !== 'proxmox') */
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="vcpus" className="text-xs">vCPUs</Label>
                                    <Input
                                        id="vcpus"
                                        type="number"
                                        min="1"
                                        max="64"
                                        value={formData.vcpus}
                                        onChange={(e) => setFormData({ ...formData, vcpus: parseInt(e.target.value) || 1 })}
                                        className="text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="ramGb" className="text-xs">RAM (GB)</Label>
                                    <Input
                                        id="ramGb"
                                        type="number"
                                        min="1"
                                        max="512"
                                        value={formData.ramGb}
                                        onChange={(e) => setFormData({ ...formData, ramGb: parseInt(e.target.value) || 1 })}
                                        className="text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="diskGb" className="text-xs">SSD Storage (GB)</Label>
                                    <Input
                                        id="diskGb"
                                        type="number"
                                        min="20"
                                        max="2000"
                                        value={formData.diskGb}
                                        onChange={(e) => setFormData({ ...formData, diskGb: parseInt(e.target.value) || 20 })}
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="gap-1.5">
                                <Plus className="h-4 w-4" />
                                {formData.provider === 'proxmox' ? 'Connect Proxmox Server' : 'Start Provisioning'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Server Modal Dialog */}
            {editingServer && (
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <Edit3 className="h-4 w-4 text-primary" />
                                Edit Server: {editingServer.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Adjust server metadata, tags, and status.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditServerSubmit} className="space-y-3 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-name" className="text-xs">Server Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingServer.name}
                                    onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                                    className="text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-status" className="text-xs">Status</Label>
                                <Select
                                    value={editingServer.status}
                                    onValueChange={(val) => setEditingServer({ ...editingServer, status: val as ServerStatus })}
                                >
                                    <SelectTrigger id="edit-status" className="text-xs">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="provisioning">Provisioning</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-host-address" className="text-xs">Host Address / Domain URL</Label>
                                <Input
                                    id="edit-host-address"
                                    value={editingServer.hostAddress || ''}
                                    onChange={(e) => setEditingServer({ ...editingServer, hostAddress: e.target.value })}
                                    placeholder="https://server-01.example.com"
                                    className="text-xs font-mono"
                                />
                            </div>

                            {editingServer.provider === 'proxmox' && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-token-id" className="text-xs">Proxmox API Token ID</Label>
                                        <Input
                                            id="edit-token-id"
                                            value={editingServer.proxmoxTokenId || ''}
                                            onChange={(e) => setEditingServer({ ...editingServer, proxmoxTokenId: e.target.value })}
                                            placeholder="root@pam!token-id"
                                            className="text-xs font-mono"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="edit-token-secret" className="text-xs">Proxmox API Token Secret</Label>
                                        <div className="relative">
                                            <Input
                                                id="edit-token-secret"
                                                type={showTokenSecret ? 'text' : 'password'}
                                                value={editingServer.proxmoxTokenSecret || ''}
                                                onChange={(e) => setEditingServer({ ...editingServer, proxmoxTokenSecret: e.target.value })}
                                                placeholder="Enter unique server API Token Secret UUID"
                                                className="text-xs font-mono pr-9"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowTokenSecret(!showTokenSecret)}
                                                className="absolute right-1 top-1 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                            >
                                                {showTokenSecret ? (
                                                    <EyeOff className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Eye className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Modal Dialog */}
            {deletingServer && (
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
                                <AlertTriangle className="h-5 w-5" />
                                Delete Server: {deletingServer.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs pt-1">
                                Are you sure you want to terminate and delete this server instance? This action cannot be undone and will erase all data on <strong className="font-mono text-foreground">{deletingServer.ipAddress}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-3">
                            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteServerSubmit}>
                                Delete Server
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

ServersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Servers',
            href: '/servers',
        },
    ],
};
