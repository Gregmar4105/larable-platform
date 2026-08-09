export type ServerType =
    | 'web'
    | 'database'
    | 'worker'
    | 'load_balancer'
    | 'container_host'
    | 'cache';

export type ServerProvider = 'aws' | 'digitalocean' | 'hetzner' | 'gcp' | 'linode' | 'proxmox';

export type ServerStatus = 'online' | 'provisioning' | 'maintenance' | 'offline';

export interface ServerSpecs {
    vcpus: number;
    ramGb: number;
    diskGb: number;
}

export interface ResourceUsage {
    usedGb: number;
    totalGb: number;
    percent: number;
}

export interface Server {
    id: string;
    name: string;
    type: ServerType;
    provider: ServerProvider;
    ipAddress: string;
    ipv6Address?: string;
    region: string;
    locationPin?: string;
    status: ServerStatus;
    cpuUsage: number; // 0 to 100
    ramUsage: ResourceUsage;
    diskUsage: ResourceUsage;
    uptime: string;
    tags: string[];
    phpVersion?: string;
    dbEngine?: string;
    activeSitesCount?: number;
    proxmoxPort?: number;
    proxmoxTokenId?: string;
    proxmoxTokenSecret?: string;
    hostAddress?: string;
    latencyMs?: number;
    lastPingTime?: string;
    isPinging?: boolean;
    specs: ServerSpecs;
    createdDate: string;
}
