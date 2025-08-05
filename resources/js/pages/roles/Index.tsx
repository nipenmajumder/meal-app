import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ConsistentTable, ConsistentTableHeader, ConsistentTableRow, ConsistentTableCell } from '@/components/consistent-table';
import { RolePermissionsModal } from '@/components/RolePermissionsModal';
import { Role, Permission, PageProps } from '@/types';
import { Plus, Edit, Trash2, Shield, Users, Settings, Lock } from 'lucide-react';

interface RolesPageProps extends PageProps {
    roles: {
        data: Role[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    permissions: Permission[];
    rolePermissions: Record<number, number[]>; // roleId -> permissionIds[]
    can: {
        create_roles: boolean;
        edit_roles: boolean;
        delete_roles: boolean;
        manage_permissions: boolean;
    };
    [key: string]: unknown;
}

interface RoleFormData {
    name: string;
    guard_name: string;
    [key: string]: unknown;
}

export default function RolesIndex() {
    const { roles, permissions, rolePermissions, can } = usePage<RolesPageProps>().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);
    const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState<RoleFormData>({ name: '', guard_name: 'web' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const endpoint = editingRole 
            ? route('roles.update', editingRole.id)
            : route('roles.store');

        const method = editingRole ? 'put' : 'post';

        router[method](endpoint, formData as any, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setEditingRole(null);
                setFormData({ name: '', guard_name: 'web' });
            },
            onError: (errors) => setErrors(errors),
            onFinish: () => setProcessing(false)
        });
    };

    const handleEdit = (role: Role) => {
        setFormData({ name: role.name, guard_name: role.guard_name });
        setEditingRole(role);
        setIsCreateModalOpen(true);
    };

    const handleDelete = () => {
        if (deletingRole) {
            router.delete(route('roles.destroy', deletingRole.id), {
                onSuccess: () => setDeletingRole(null),
            });
        }
    };

    const openCreateModal = () => {
        setFormData({ name: '', guard_name: 'web' });
        setEditingRole(null);
        setErrors({});
        setIsCreateModalOpen(true);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingRole(null);
        setFormData({ name: '', guard_name: 'web' });
        setErrors({});
    };

    return (
        <AppLayout>
            <Head title="Roles Management" />
            
            <div className="p-6 lg:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Roles Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Create and manage user roles and their permissions
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {can.manage_permissions && (
                            <Button 
                                variant="outline"
                                asChild
                            >
                                <Link href={route('roles.permissions')}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Manage Permissions
                                </Link>
                            </Button>
                        )}
                        {can.create_roles && (
                            <Button onClick={openCreateModal}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Role
                            </Button>
                        )}
                    </div>
                </div>

                {/* Roles Table */}
                <div className="bg-card border rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">System Roles</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{roles.total} Total Roles</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <ConsistentTable>
                            <ConsistentTableHeader>
                                <ConsistentTableRow>
                                    <ConsistentTableCell isHeader className="text-left font-medium">Role</ConsistentTableCell>
                                    <ConsistentTableCell isHeader className="text-left font-medium">Guard</ConsistentTableCell>
                                    <ConsistentTableCell isHeader className="text-left font-medium">Created</ConsistentTableCell>
                                    <ConsistentTableCell isHeader className="text-center font-medium">Actions</ConsistentTableCell>
                                </ConsistentTableRow>
                            </ConsistentTableHeader>
                            <tbody>
                                {roles.data.length > 0 ? (
                                    roles.data.map((role, index) => (
                                        <ConsistentTableRow key={role.id} isEvenRow={index % 2 === 0} className="hover:bg-muted/50">
                                            <ConsistentTableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Shield className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{role.name}</div>
                                                        <div className="text-xs text-muted-foreground">ID: {role.id}</div>
                                                    </div>
                                                </div>
                                            </ConsistentTableCell>
                                            <ConsistentTableCell className="py-4">
                                                <Badge variant="secondary" className="text-xs">
                                                    {role.guard_name}
                                                </Badge>
                                            </ConsistentTableCell>
                                            <ConsistentTableCell className="py-4">
                                                <div className="text-sm">
                                                    {new Date(role.created_at).toLocaleDateString()}
                                                </div>
                                            </ConsistentTableCell>
                                            <ConsistentTableCell className="py-4">
                                                <div className="flex justify-center gap-1">
                                                    {can.manage_permissions && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => setPermissionsRole(role)}
                                                            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Lock className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {can.edit_roles && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => handleEdit(role)}
                                                            className="h-8 px-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {can.delete_roles && role.name !== 'super-admin' && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => setDeletingRole(role)}
                                                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </ConsistentTableCell>
                                        </ConsistentTableRow>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2">
                                                <Shield className="h-8 w-8 text-muted-foreground" />
                                                <h3 className="font-medium">No roles found</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Create your first role to get started.
                                                </p>
                                                {can.create_roles && (
                                                    <Button 
                                                        onClick={openCreateModal}
                                                        size="sm"
                                                        className="mt-2"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Create Role
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </ConsistentTable>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={closeModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Edit Role' : 'Create New Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole ? 'Update the role details.' : 'Add a new role to the system.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Role Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className={errors.name ? 'border-red-500' : ''}
                                placeholder="e.g. Manager, Editor, Viewer"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="guard_name">Guard</Label>
                            <Input
                                id="guard_name"
                                type="text"
                                value={formData.guard_name}
                                onChange={(e) => setFormData(prev => ({ ...prev, guard_name: e.target.value }))}
                                className={errors.guard_name ? 'border-red-500' : ''}
                                placeholder="web"
                                required
                            />
                            {errors.guard_name && (
                                <p className="text-sm text-red-600">{errors.guard_name}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : (editingRole ? 'Update' : 'Create')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the role "{deletingRole?.name}"? This action cannot be undone and will affect all users with this role.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Role Permissions Modal */}
            <RolePermissionsModal
                isOpen={!!permissionsRole}
                onClose={() => setPermissionsRole(null)}
                role={permissionsRole}
                permissions={permissions}
                rolePermissions={permissionsRole ? rolePermissions[permissionsRole.id] || [] : []}
            />
        </AppLayout>
    );
}
