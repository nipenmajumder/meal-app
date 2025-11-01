import { ConsistentTable, ConsistentTableCell, ConsistentTableHeader, ConsistentTableRow } from '@/components/consistent-table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { PageProps, Permission, Role } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Filter, Lock, RotateCcw, Save, Search, Shield } from 'lucide-react';
import { useState } from 'react';

interface RolePermissionsPageProps extends PageProps {
    roles: Role[];
    permissions: Permission[];
    rolePermissions: Record<number, number[]>; // roleId -> permissionIds[]
    can: {
        manage_roles: boolean;
        assign_permissions: boolean;
    };
}

export default function RolePermissions() {
    const { roles, permissions, rolePermissions, can } = usePage<RolePermissionsPageProps>().props;
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [permissionChanges, setPermissionChanges] = useState<Record<number, number[]>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Filter permissions based on search
    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    // Group permissions by category (extracted from permission name)
    const groupedPermissions = filteredPermissions.reduce(
        (groups, permission) => {
            const category = permission.name.split('_')[0] || 'general';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(permission);
            return groups;
        },
        {} as Record<string, Permission[]>,
    );

    // Get current permissions for a role
    const getRolePermissions = (roleId: number): number[] => {
        return permissionChanges[roleId] || rolePermissions[roleId] || [];
    };

    // Toggle permission for a role
    const togglePermission = (roleId: number, permissionId: number) => {
        const currentPermissions = getRolePermissions(roleId);
        const hasPermission = currentPermissions.includes(permissionId);

        const newPermissions = hasPermission ? currentPermissions.filter((id) => id !== permissionId) : [...currentPermissions, permissionId];

        setPermissionChanges((prev) => ({
            ...prev,
            [roleId]: newPermissions,
        }));
    };

    // Check if role has permission
    const hasPermission = (roleId: number, permissionId: number): boolean => {
        return getRolePermissions(roleId).includes(permissionId);
    };

    // Check if there are unsaved changes
    const hasUnsavedChanges = (): boolean => {
        return Object.keys(permissionChanges).length > 0;
    };

    // Save changes
    const handleSave = () => {
        if (!hasUnsavedChanges()) return;

        setIsSaving(true);
        router.post(
            route('roles.update-permissions'),
            {
                rolePermissions: permissionChanges,
            },
            {
                onSuccess: () => {
                    setPermissionChanges({});
                    setShowConfirmDialog(false);
                },
                onFinish: () => setIsSaving(false),
            },
        );
    };

    // Reset changes
    const handleReset = () => {
        setPermissionChanges({});
        setShowConfirmDialog(false);
    };

    // Toggle all permissions for a role in a category
    const toggleCategoryPermissions = (roleId: number, categoryPermissions: Permission[]) => {
        const allSelected = categoryPermissions.every((p) => hasPermission(roleId, p.id));

        categoryPermissions.forEach((permission) => {
            if (allSelected && hasPermission(roleId, permission.id)) {
                togglePermission(roleId, permission.id);
            } else if (!allSelected && !hasPermission(roleId, permission.id)) {
                togglePermission(roleId, permission.id);
            }
        });
    };

    const filteredRoles = selectedRole === 'all' ? roles : roles.filter((role) => role.id.toString() === selectedRole);

    return (
        <AppLayout>
            <Head title="Role Permissions" />

            <div className="space-y-6 p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl font-bold">Role Permissions</h1>
                        <p className="text-muted-foreground mt-2">Assign and manage permissions for each role</p>
                    </div>

                    {hasUnsavedChanges() && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleReset} size="sm">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button onClick={() => setShowConfirmDialog(true)} size="sm">
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-card rounded-lg border p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="text-muted-foreground h-5 w-5" />
                        <h3 className="font-semibold">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label className="mb-2 block text-sm font-medium">Filter by Role</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="mb-2 block text-sm font-medium">Search Permissions</Label>
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                                <Input
                                    placeholder="Search permissions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions Matrix */}
                <div className="bg-card overflow-hidden rounded-lg border">
                    <div className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Permissions Matrix</h3>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <span>{filteredPermissions.length} Permissions</span>
                                <span>•</span>
                                <span>{filteredRoles.length} Roles</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 p-6">
                        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="text-primary h-5 w-5" />
                                    <h4 className="text-lg font-semibold capitalize">{category} Permissions</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        {categoryPermissions.length} permissions
                                    </Badge>
                                </div>

                                <div className="overflow-x-auto">
                                    <ConsistentTable>
                                        <ConsistentTableHeader>
                                            <ConsistentTableRow>
                                                <ConsistentTableCell isHeader className="min-w-[200px] text-left font-medium">
                                                    Permission
                                                </ConsistentTableCell>
                                                {filteredRoles.map((role) => (
                                                    <ConsistentTableCell key={role.id} isHeader className="min-w-[120px] text-center font-medium">
                                                        <div className="space-y-2">
                                                            <div>{role.name}</div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleCategoryPermissions(role.id, categoryPermissions)}
                                                                className="h-6 px-2 text-xs"
                                                            >
                                                                {categoryPermissions.every((p) => hasPermission(role.id, p.id))
                                                                    ? 'Unselect All'
                                                                    : 'Select All'}
                                                            </Button>
                                                        </div>
                                                    </ConsistentTableCell>
                                                ))}
                                            </ConsistentTableRow>
                                        </ConsistentTableHeader>
                                        <tbody>
                                            {categoryPermissions.map((permission) => (
                                                <ConsistentTableRow key={permission.id} className="hover:bg-muted/50">
                                                    <ConsistentTableCell className="py-4">
                                                        <div>
                                                            <div className="font-medium">{permission.name}</div>
                                                            {permission.description && (
                                                                <div className="text-muted-foreground mt-1 text-sm">{permission.description}</div>
                                                            )}
                                                        </div>
                                                    </ConsistentTableCell>
                                                    {filteredRoles.map((role) => (
                                                        <ConsistentTableCell key={role.id} className="py-4">
                                                            <div className="flex justify-center">
                                                                <Checkbox
                                                                    checked={hasPermission(role.id, permission.id)}
                                                                    onCheckedChange={() => togglePermission(role.id, permission.id)}
                                                                    disabled={!can.assign_permissions}
                                                                />
                                                            </div>
                                                        </ConsistentTableCell>
                                                    ))}
                                                </ConsistentTableRow>
                                            ))}
                                        </tbody>
                                    </ConsistentTable>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Changes Summary */}
                {hasUnsavedChanges() && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Lock className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-medium text-yellow-800">Unsaved Changes</h4>
                        </div>
                        <p className="mb-3 text-sm text-yellow-700">You have unsaved permission changes. Click "Save Changes" to apply them.</p>
                        <div className="space-y-2">
                            {Object.entries(permissionChanges).map(([roleId, permissionIds]) => {
                                const role = roles.find((r) => r.id === parseInt(roleId));
                                const originalPermissions = rolePermissions[parseInt(roleId)] || [];
                                const added = permissionIds.filter((id) => !originalPermissions.includes(id));
                                const removed = originalPermissions.filter((id) => !permissionIds.includes(id));

                                return (
                                    <div key={roleId} className="text-sm">
                                        <span className="font-medium">{role?.name}:</span>
                                        {added.length > 0 && <span className="ml-2 text-green-700">+{added.length} permissions</span>}
                                        {removed.length > 0 && <span className="ml-2 text-red-700">-{removed.length} permissions</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Save Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Save Permission Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to save these permission changes? This will affect user access across the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
