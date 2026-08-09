import * as React from 'react';
import { Link } from '@inertiajs/react';
import {
    Activity,
    AudioWaveform,
    Boxes,
    Building2,
    Command,
    GalleryVerticalEnd,
    Globe,
    LayoutDashboard,
    Network,
    Server,
    Settings,
    ShieldCheck,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

// Sidebar data with Control Center navigation items
const data = {
    navMain: [
        {
            title: 'Control Center',
            url: dashboard(),
            icon: LayoutDashboard,
        },
        {
            title: 'Organizations',
            url: '#',
            icon: Building2,
            items: [
                { title: 'Overview', url: '/organizations' },
                { title: 'Members', url: '#' },
            ],
        },
        {
            title: 'Servers',
            url: '/servers',
            icon: Server,
            items: [
                { title: 'All Servers', url: '/servers' },
                { title: 'Clusters', url: '#' },
                { title: 'Provisioning', url: '#' },
            ],
        },
        {
            title: 'Deployments',
            url: '#',
            icon: Boxes,
            items: [
                { title: 'Services', url: '#' },
                { title: 'VPS', url: '#' },
                { title: 'Shared Hosting', url: '#' },
                { title: 'Databases', url: '#' },
                { title: 'Buckets', url: '#' },
            ],
        },
        {
            title: 'Sites',
            url: '#',
            icon: Globe,
            items: [
                { title: 'All Sites', url: '#' },
                { title: 'Environments', url: '#' },
                { title: 'SSL Certificates', url: '#' },
            ],
        },
        {
            title: 'Domains',
            url: '#',
            icon: Network,
            items: [
                { title: 'Registered Domains', url: '#' },
                { title: 'DNS Records', url: '#' },
                { title: 'Routing', url: '#' },
            ],
        },
        {
            title: 'Logs and Analytics',
            url: '#',
            icon: Activity,
            items: [
                { title: 'System Logs', url: '#' },
                { title: 'Access Logs', url: '#' },
                { title: 'Metrics', url: '#' },
            ],
        },
        {
            title: 'Access Controls',
            url: '#',
            icon: ShieldCheck,
            items: [
                { title: 'Roles & Permissions', url: '#' },
                { title: 'API Keys', url: '#' },
                { title: 'Audit Trail', url: '#' },
            ],
        },
    ] as NavItem[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset" {...props}>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl('/settings/profile')}
                            tooltip="Settings"
                        >
                            <Link href="/settings/profile">
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}


