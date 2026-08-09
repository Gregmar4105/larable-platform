import * as React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AudioWaveform,
    Building2,
    ChevronsUpDown,
    Command,
    GalleryVerticalEnd,
    Plus,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import type { Organization } from '@/types/organization';

const defaultIcons = [GalleryVerticalEnd, AudioWaveform, Command, Building2];

export function TeamSwitcher() {
    const { isMobile } = useSidebar();
    const { organizations = [], currentOrganization } = usePage().props;

    const orgList = (organizations as Organization[]) || [];
    const activeOrg = (currentOrganization as Organization) || orgList[0];

    const handleSwitchOrg = (orgId: number) => {
        router.post(`/organizations/${orgId}/switch`, {}, {
            preserveScroll: true,
        });
    };

    if (!activeOrg) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <Link href="/organizations?create=true" className="flex items-center gap-2">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Plus className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Create Org</span>
                                <span className="truncate text-xs text-muted-foreground">Get started</span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    const ActiveIcon = defaultIcons[0];

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <ActiveIcon className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-semibold">
                                    {activeOrg.name}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {activeOrg.plan || 'Free'}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Teams
                        </DropdownMenuLabel>
                        {orgList.map((org, index) => {
                            const OrgIcon = defaultIcons[index % defaultIcons.length];
                            const isActive = activeOrg.id === org.id;

                            return (
                                <DropdownMenuItem
                                    key={org.id}
                                    onClick={() => handleSwitchOrg(org.id)}
                                    className={`gap-2 p-2 cursor-pointer ${isActive ? 'bg-accent font-medium' : ''}`}
                                >
                                    <div className="flex size-6 items-center justify-center rounded-sm border">
                                        <OrgIcon className="size-4 shrink-0" />
                                    </div>
                                    <span className="flex-1 truncate">{org.name}</span>
                                    <DropdownMenuShortcut>
                                        ⌘{index + 1}
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="gap-2 p-2 cursor-pointer">
                            <Link href="/organizations?create=true">
                                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4" />
                                </div>
                                <div className="font-medium text-muted-foreground">
                                    Add team
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
