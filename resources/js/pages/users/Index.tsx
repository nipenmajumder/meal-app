import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Can } from '@/components/Can';
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
import { UserFormModal } from '@/components/UserFormModal';
import { User, Role, PageProps } from '@/types';
import { Plus, Search, Filter, Edit, Trash2, Power, PowerOff, Users } from 'lucide-react';

interface UsersPageProps extends PageProps {
    users: {
        data: User[];
        links: any[];
        meta: any;
    };
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
        status?: number;
    };
    currentUserRoles: string[];
}

export default function UsersIndex() {
    const { users, roles, filters, currentUserRoles, auth } = usePage<UsersPageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status?.toString() || 'all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('users.index'), {
            search: searchTerm,
            role: selectedRole === 'all' ? '' : selectedRole,
            status: selectedStatus === 'all' ? '' : selectedStatus,
        }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedRole('all');
        setSelectedStatus('all');
        router.get(route('users.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDeleteUser = () => {
        if (deletingUser) {
            router.delete(route('users.destroy', deletingUser.id), {
                onSuccess: () => setDeletingUser(null),
            });
        }
    };

    // Modern loading skeleton component
    const LoadingSkeleton = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <ConsistentTableRow key={index} isEvenRow={index % 2 === 0} className="animate-pulse">
                    <ConsistentTableCell className="py-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-3 w-20 rounded-md" />
                            </div>
                        </div>
                    </ConsistentTableCell>
                    <ConsistentTableCell className="py-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </ConsistentTableCell>
                    <ConsistentTableCell className="py-6">
                        <div className="flex justify-center gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    </ConsistentTableCell>
                    <ConsistentTableCell className="py-6">
                        <div className="flex justify-center">
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </ConsistentTableCell>
                    <ConsistentTableCell className="py-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </ConsistentTableCell>
                    <ConsistentTableCell className="py-6">
                        <div className="flex justify-center">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                    </ConsistentTableCell>
                </ConsistentTableRow>
            ))}
        </>
    );    const handleToggleStatus = (user: User) => {
        router.patch(route('users.toggle-status', user.id), {}, {
            onSuccess: () => {
                // Status toggled successfully
            },
        });
    };

    const getStatusBadge = (status: number) => {
        return status === 1 ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
                Active
            </Badge>
        ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Inactive
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Users Management" />
            
            <div className="p-6 lg:p-8 space-y-8">
                {/* Simple Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Users Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage system users, assign roles, and control permissions
                        </p>
                    </div>
                    <Can permission="create users">
                        <Button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add New User
                        </Button>
                    </Can>
                </div>

                {/* Simple Filters Section */}
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Filters</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Search Users
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Role
                            </Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Status
                            </Label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button 
                            onClick={handleSearch} 
                            disabled={isLoading}
                            size="sm"
                        >
                            {isLoading ? 'Applying...' : 'Apply Filters'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleReset}
                            size="sm"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
                <ConsistentTable>
                    <ConsistentTableHeader>
                        <ConsistentTableRow>
                            <ConsistentTableCell isHeader className="text-left font-medium">User</ConsistentTableCell>
                            <ConsistentTableCell isHeader className="text-left font-medium">Email</ConsistentTableCell>
                            <ConsistentTableCell isHeader className="text-left font-medium">Roles</ConsistentTableCell>
                            <ConsistentTableCell isHeader className="text-center font-medium">Status</ConsistentTableCell>
                            <ConsistentTableCell isHeader className="text-left font-medium">Joined</ConsistentTableCell>
                            <ConsistentTableCell isHeader className="text-center font-medium">Actions</ConsistentTableCell>
                        </ConsistentTableRow>
                    </ConsistentTableHeader>
                    <tbody>
                        {isLoading ? (
                            <LoadingSkeleton />
                        ) : users.data.length > 0 ? (
                            users.data.map((user, index) => (
                                <ConsistentTableRow key={user.id} isEvenRow={index % 2 === 0} className="hover:bg-muted/50">
                                    <ConsistentTableCell className="py-4">
                                        <div className="flex items-center gap-3">                           
                                            <div className="font-medium">{user.name}</div>
                                        </div>
                                    </ConsistentTableCell>
                                    <ConsistentTableCell className="py-4">
                                        <div className="text-sm">{user.email}</div>
                                    </ConsistentTableCell>
                                    <ConsistentTableCell className="py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles?.map((role) => (
                                                <Badge key={role.id} variant="secondary" className="text-xs">
                                                    {role.name}
                                                </Badge>
                                            )) || (
                                                <span className="text-xs text-muted-foreground">No roles</span>
                                            )}
                                        </div>
                                    </ConsistentTableCell>
                                    <ConsistentTableCell className="py-4">
                                        <div className="flex justify-center">
                                            {user.status === 1 ? (
                                                <Badge variant="default" className="text-xs">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </ConsistentTableCell>
                                    <ConsistentTableCell className="py-4">
                                        <div className="text-sm">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </ConsistentTableCell>
                                    <ConsistentTableCell className="py-4">
                                        <div className="flex justify-center gap-1">
                                            <Can permission="edit users">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setEditingUser(user)}
                                                    className="h-8 px-2"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Can>
                                            <Can permission="manage user status">
                                                {user.id !== auth.user.id && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleToggleStatus(user)}
                                                        className="h-8 px-2"
                                                    >
                                                        {user.status === 1 ? (
                                                            <PowerOff className="h-4 w-4" />
                                                        ) : (
                                                            <Power className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                            </Can>
                                            <Can permission="delete users">
                                                {user.id !== auth.user.id && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => setDeletingUser(user)}
                                                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </Can>
                                        </div>
                                    </ConsistentTableCell>
                                </ConsistentTableRow>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                        <h3 className="font-medium">No users found</h3>
                                        <p className="text-sm text-muted-foreground">
                                            No users match your current filters.
                                        </p>
                                        <Can permission="create users">
                                            <Button 
                                                onClick={() => setIsCreateModalOpen(true)}
                                                size="sm"
                                                className="mt-2"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create User
                                            </Button>
                                        </Can>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </ConsistentTable>
                {/* Simple Pagination */}
                {users.links && (
                    <div className="bg-card border rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {users.meta?.from || 1} to {users.meta?.to || users.data.length} of {users.meta?.total || users.data.length} users
                            </div>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm rounded ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        preserveState
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <UserFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                roles={roles}
                currentUserRoles={currentUserRoles}
            />

            {/* Edit Modal */}
            <UserFormModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                roles={roles}
                currentUserRoles={currentUserRoles}
            />

            {/* Simple Delete Confirmation */}
            <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {deletingUser?.name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingUser && handleDeleteUser()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}