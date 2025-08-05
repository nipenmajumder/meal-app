import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { ConsistentTable, ConsistentTableHeader, ConsistentTableRow, ConsistentTableCell } from '@/components/consistent-table';
import { Role, Permission, PageProps } from '@/types';
import { Shield, Save, RotateCcw, Users, Lock, Search, Filter, Check, X } from 'lucide-react';

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
    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Group permissions by category (extracted from permission name)
    const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
        const category = permission.name.split('_')[0] || 'general';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(permission);
        return groups;
    }, {} as Record<string, Permission[]>);

    // Get current permissions for a role
    const getRolePermissions = (roleId: number): number[] => {
        return permissionChanges[roleId] || rolePermissions[roleId] || [];
    };

    // Toggle permission for a role
    const togglePermission = (roleId: number, permissionId: number) => {
        const currentPermissions = getRolePermissions(roleId);
        const hasPermission = currentPermissions.includes(permissionId);
        
        const newPermissions = hasPermission
            ? currentPermissions.filter(id => id !== permissionId)
            : [...currentPermissions, permissionId];
        
        setPermissionChanges(prev => ({
            ...prev,
            [roleId]: newPermissions
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
        router.post(route('roles.update-permissions'), {
            rolePermissions: permissionChanges
        }, {
            onSuccess: () => {
                setPermissionChanges({});
                setShowConfirmDialog(false);
            },
            onFinish: () => setIsSaving(false)
        });
    };

    // Reset changes
    const handleReset = () => {
        setPermissionChanges({});
        setShowConfirmDialog(false);
    };

    // Toggle all permissions for a role in a category
    const toggleCategoryPermissions = (roleId: number, categoryPermissions: Permission[]) => {
        const allSelected = categoryPermissions.every(p => hasPermission(roleId, p.id));
        
        categoryPermissions.forEach(permission => {
            if (allSelected && hasPermission(roleId, permission.id)) {
                togglePermission(roleId, permission.id);
            } else if (!allSelected && !hasPermission(roleId, permission.id)) {
                togglePermission(roleId, permission.id);
            }
        });
    };

    const filteredRoles = selectedRole === 'all' 
        ? roles 
        : roles.filter(role => role.id.toString() === selectedRole);

    return (
        <AppLayout>
            <Head title="Role Permissions" />
            
            <div className="p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Role Permissions
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Assign and manage permissions for each role
                        </p>
                    </div>
                    
                    {hasUnsavedChanges() && (
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline"
                                onClick={handleReset}
                                size="sm"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                            <Button 
                                onClick={() => setShowConfirmDialog(true)}
                                size="sm"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Filters</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Filter by Role
                            </Label>
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
                            <Label className="text-sm font-medium mb-2 block">
                                Search Permissions
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Permissions Matrix</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{filteredPermissions.length} Permissions</span>
                                <span>•</span>
                                <span>{filteredRoles.length} Roles</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <h4 className="text-lg font-semibold capitalize">{category} Permissions</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        {categoryPermissions.length} permissions
                                    </Badge>
                                </div>

                                <div className="overflow-x-auto">
                                    <ConsistentTable>
                                        <ConsistentTableHeader>
                                            <ConsistentTableRow>
                                                <ConsistentTableCell isHeader className="text-left font-medium min-w-[200px]">
                                                    Permission
                                                </ConsistentTableCell>
                                                {filteredRoles.map((role) => (
                                                    <ConsistentTableCell key={role.id} isHeader className="text-center font-medium min-w-[120px]">
                                                        <div className="space-y-2">
                                                            <div>{role.name}</div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleCategoryPermissions(role.id, categoryPermissions)}
                                                                className="h-6 px-2 text-xs"
                                                            >
                                                                {categoryPermissions.every(p => hasPermission(role.id, p.id)) ? 'Unselect All' : 'Select All'}
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
                                                                <div className="text-sm text-muted-foreground mt-1">
                                                                    {permission.description}
                                                                </div>
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
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-5 w-5 text-yellow-600" />
                            <h4 className="font-medium text-yellow-800">Unsaved Changes</h4>
                        </div>
                        <p className="text-sm text-yellow-700 mb-3">
                            You have unsaved permission changes. Click "Save Changes" to apply them.
                        </p>
                        <div className="space-y-2">
                            {Object.entries(permissionChanges).map(([roleId, permissionIds]) => {
                                const role = roles.find(r => r.id === parseInt(roleId));
                                const originalPermissions = rolePermissions[parseInt(roleId)] || [];
                                const added = permissionIds.filter(id => !originalPermissions.includes(id));
                                const removed = originalPermissions.filter(id => !permissionIds.includes(id));
                                
                                return (
                                    <div key={roleId} className="text-sm">
                                        <span className="font-medium">{role?.name}:</span>
                                        {added.length > 0 && (
                                            <span className="text-green-700 ml-2">
                                                +{added.length} permissions
                                            </span>
                                        )}
                                        {removed.length > 0 && (
                                            <span className="text-red-700 ml-2">
                                                -{removed.length} permissions
                                            </span>
                                        )}
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
                        <AlertDialogAction
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
