import * as React from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    Edit3,
    Plus,
    Radio,
    Save,
    Shield,
    Sparkles,
    Trash2,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import InputError from '@/components/input-error';
import type { Organization } from '@/types/organization';

interface Props {
    organizations: Organization[];
    currentOrganizationId?: number | null;
}

export default function Index({ organizations = [], currentOrganizationId }: Props) {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [editingOrg, setEditingOrg] = React.useState<Organization | null>(null);

    // Create Form State
    const createForm = useForm({
        name: '',
        slug: '',
        plan: 'Free',
        description: '',
    });

    // Edit Form State
    const editForm = useForm({
        name: '',
        slug: '',
        plan: 'Free',
        description: '',
    });

    // Check URL parameters for ?create=true or ?edit=id on load
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === 'true') {
            setIsCreateOpen(true);
        }
        const editId = params.get('edit');
        if (editId) {
            const found = organizations.find((o) => o.id === Number(editId));
            if (found) {
                handleOpenEdit(found);
            }
        }
    }, [organizations]);

    const handleCreateNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        createForm.setData((prev) => ({
            ...prev,
            name,
            slug,
        }));
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/organizations', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenEdit = (org: Organization) => {
        setEditingOrg(org);
        editForm.setData({
            name: org.name || '',
            slug: org.slug || '',
            plan: org.plan || 'Free',
            description: org.description || '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrg) {
            return;
        }

        editForm.put(`/organizations/${editingOrg.id}`, {
            onSuccess: () => {
                setEditingOrg(null);
                editForm.reset();
            },
        });
    };

    const filteredOrganizations = organizations.filter(
        (org) =>
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.plan.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSwitch = (orgId: number) => {
        router.post(`/organizations/${orgId}/switch`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (org: Organization) => {
        if (confirm(`Are you sure you want to delete "${org.name}"?`)) {
            router.delete(`/organizations/${org.id}`);
        }
    };

    const getBadgeVariant = (plan: string) => {
        switch (plan.toLowerCase()) {
            case 'enterprise':
                return 'default';
            case 'startup':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <>
            <Head title="Organizations" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 w-full">
                {/* Header Banner */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            Organizations
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your workspace organizations, switch active contexts, and configure team settings.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="shrink-0 gap-2 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Create Organization
                    </Button>
                </div>

                {/* Flash Success Alert */}
                {flash?.success && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2 w-full">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Search Bar */}
                <div className="w-full max-w-md">
                    <Input
                        type="search"
                        placeholder="Filter organizations by name or plan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Organizations Grid */}
                {filteredOrganizations.length === 0 ? (
                    <Card className="text-center p-12 w-full">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No organizations found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {searchQuery
                                ? 'Try adjusting your search filter.'
                                : 'Get started by creating your first organization.'}
                        </p>
                        {!searchQuery && (
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="mt-6 gap-2 cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Create Organization
                            </Button>
                        )}
                    </Card>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
                        {filteredOrganizations.map((org) => {
                            const isConnected = currentOrganizationId === org.id;

                            return (
                                <Card
                                    key={org.id}
                                    className={`relative flex flex-col justify-between transition-all duration-200 border-2 ${
                                        isConnected
                                            ? 'border-primary shadow-md bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                                                    {org.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg font-semibold leading-tight">
                                                        {org.name}
                                                    </CardTitle>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {org.slug}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={getBadgeVariant(org.plan)}>
                                                {org.plan}
                                            </Badge>
                                        </div>
                                        {org.description && (
                                            <CardDescription className="mt-2 line-clamp-2 text-sm">
                                                {org.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>

                                    <CardContent className="py-2 text-xs text-muted-foreground space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{org.users_count ?? 1} Member(s)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5" />
                                            <span>Active Context</span>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="pt-3 border-t flex items-center justify-between gap-2">
                                        {isConnected ? (
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                <Radio className="h-4 w-4 animate-pulse" />
                                                Connected
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSwitch(org.id)}
                                                className="text-xs cursor-pointer"
                                            >
                                                Connect
                                            </Button>
                                        )}

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEdit(org)}
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(org)}
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CREATE ORGANIZATION MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Create Organization
                        </DialogTitle>
                        <DialogDescription>
                            Create a new organization workspace. You will be set as the owner.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Organization Name</Label>
                            <Input
                                id="create-name"
                                type="text"
                                placeholder="e.g. Acme Corp"
                                value={createForm.data.name}
                                onChange={handleCreateNameChange}
                                required
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-slug">Slug (URL Identifier)</Label>
                            <Input
                                id="create-slug"
                                type="text"
                                placeholder="acme-corp"
                                value={createForm.data.slug}
                                onChange={(e) => createForm.setData('slug', e.target.value)}
                            />
                            <InputError message={createForm.errors.slug} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-plan">Subscription Plan</Label>
                            <Select
                                value={createForm.data.plan}
                                onValueChange={(val) => createForm.setData('plan', val)}
                            >
                                <SelectTrigger id="create-plan">
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Free">Free Plan</SelectItem>
                                    <SelectItem value="Startup">Startup Plan</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise Plan</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={createForm.errors.plan} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-description">Description (Optional)</Label>
                            <Input
                                id="create-description"
                                type="text"
                                placeholder="Short description of this organization..."
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                            />
                            <InputError message={createForm.errors.description} />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="gap-2"
                            >
                                <Sparkles className="h-4 w-4" />
                                Create & Connect
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT ORGANIZATION MODAL */}
            <Dialog
                open={Boolean(editingOrg)}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingOrg(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Edit Organization
                        </DialogTitle>
                        <DialogDescription>
                            Update details and plan settings for {editingOrg?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Organization Name</Label>
                            <Input
                                id="edit-name"
                                type="text"
                                placeholder="e.g. Acme Corp"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-slug">Slug (URL Identifier)</Label>
                            <Input
                                id="edit-slug"
                                type="text"
                                placeholder="acme-corp"
                                value={editForm.data.slug}
                                onChange={(e) => editForm.setData('slug', e.target.value)}
                            />
                            <InputError message={editForm.errors.slug} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-plan">Subscription Plan</Label>
                            <Select
                                value={editForm.data.plan}
                                onValueChange={(val) => editForm.setData('plan', val)}
                            >
                                <SelectTrigger id="edit-plan">
                                    <SelectValue placeholder="Select plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Free">Free Plan</SelectItem>
                                    <SelectItem value="Startup">Startup Plan</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise Plan</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={editForm.errors.plan} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description (Optional)</Label>
                            <Input
                                id="edit-description"
                                type="text"
                                placeholder="Short description of this organization..."
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                            />
                            <InputError message={editForm.errors.description} />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setEditingOrg(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Organizations',
            href: '/organizations',
        },
    ],
};
