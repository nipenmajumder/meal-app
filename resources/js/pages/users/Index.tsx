import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal, Plus, Search, Filter, Edit, Trash2, Power, PowerOff, Users } from 'lucide-react';

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
    can: {
        create_users: boolean;
        edit_users: boolean;
        delete_users: boolean;
        manage_user_status: boolean;
    };
}

export default function UsersIndex() {
    const { users, roles, filters, currentUserRoles, can, auth } = usePage<UsersPageProps>().props;
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
            
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                {/* Modern Page Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10 p-8 mb-8">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    Users Management
                                </h1>
                            </div>
                            <p className="text-lg text-muted-foreground max-w-2xl">
                                Manage system users, assign roles, and control permissions with advanced filtering and bulk operations
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span>{users.meta?.total || users.data.length} Total Users</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>{roles.length} Available Roles</span>
                                </div>
                            </div>
                        </div>
                        {can.create_users && (
                            <Button 
                                onClick={() => setIsCreateModalOpen(true)}
                                size="lg"
                                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add New User
                            </Button>
                        )}
                    </div>
                </div>

                {/* Modern Filters Section */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl"></div>
                    <div className="relative backdrop-blur-sm bg-card/80 border border-border/50 rounded-2xl p-8 shadow-xl">
                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                                    <Filter className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">Smart Filters</h3>
                                    <p className="text-sm text-muted-foreground">Find users quickly with advanced search and filtering</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-6">
                                    <label className="text-sm font-medium mb-3 block text-foreground flex items-center gap-2">
                                        <Search className="h-4 w-4 text-primary" />
                                        Search Users
                                    </label>
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            placeholder="Search by name, email, or ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-12 h-12 text-base bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-300"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="text-sm font-medium mb-3 block text-foreground">
                                        Filter by Role
                                    </label>
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50">
                                            <SelectValue placeholder="All roles" />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/50">
                                            <SelectItem value="all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-primary/60"></div>
                                                    All roles
                                                </div>
                                            </SelectItem>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400"></div>
                                                        {role.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="text-sm font-medium mb-3 block text-foreground">
                                        Filter by Status
                                    </label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent className="border-border/50">
                                            <SelectItem value="all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-300"></div>
                                                    All statuses
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400 animate-pulse"></div>
                                                    Active
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400"></div>
                                                    Inactive
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button 
                                    onClick={handleSearch} 
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12 px-8 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    disabled={isLoading}
                                >
                                    <Filter className="h-5 w-5 mr-2" />
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Applying...
                                        </>
                                    ) : (
                                        'Apply Filters'
                                    )}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={handleReset}
                                    className="h-12 px-6 border-border/50 hover:bg-muted/50 transition-all duration-300"
                                >
                                    Reset All
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Users Table */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-card/30 to-transparent rounded-2xl"></div>
                    <div className="relative backdrop-blur-sm bg-card/90 border border-border/30 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-border/30 bg-gradient-to-r from-muted/30 to-transparent">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">User Directory</h3>
                                        <p className="text-sm text-muted-foreground">Manage your team members and their access</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                                        {users.meta?.total || users.data.length} Users
                                    </Badge>
                                    <Badge variant="outline" className="border-border/50 px-3 py-1">
                                        {users.data.filter(u => u.status === 1).length} Active
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <ConsistentTable>
                                <ConsistentTableHeader>
                                    <ConsistentTableRow className="border-border/30">
                                        <ConsistentTableCell isHeader className="text-left font-semibold text-foreground/90">User Profile</ConsistentTableCell>
                                        <ConsistentTableCell isHeader className="text-left font-semibold text-foreground/90">Contact Info</ConsistentTableCell>
                                        <ConsistentTableCell isHeader className="text-center font-semibold text-foreground/90">Roles & Permissions</ConsistentTableCell>
                                        <ConsistentTableCell isHeader className="text-center font-semibold text-foreground/90">Status</ConsistentTableCell>
                                        <ConsistentTableCell isHeader className="text-left font-semibold text-foreground/90">Member Since</ConsistentTableCell>
                                        <ConsistentTableCell isHeader className="text-center font-semibold text-foreground/90">Actions</ConsistentTableCell>
                                    </ConsistentTableRow>
                                </ConsistentTableHeader>
                                <tbody className="divide-y divide-border/30">
                                    {isLoading ? (
                                        <LoadingSkeleton />
                                    ) : users.data.length > 0 ? (
                                        users.data.map((user, index) => (
                                            <ConsistentTableRow key={user.id} isEvenRow={index % 2 === 0} className="hover:bg-muted/30 transition-all duration-300 group">
                                                <ConsistentTableCell className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-500 border-2 border-background"></div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                                                                ID: {user.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ConsistentTableCell>
                                                <ConsistentTableCell className="py-6">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-foreground">{user.email}</div>
                                                        <div className="text-xs text-muted-foreground">Primary Contact</div>
                                                    </div>
                                                </ConsistentTableCell>
                                                <ConsistentTableCell className="py-6">
                                                    <div className="flex flex-wrap gap-2 justify-center">
                                                        {user.roles?.map((role) => (
                                                            <Badge 
                                                                key={role.id} 
                                                                variant="outline" 
                                                                className="text-xs bg-gradient-to-r from-primary/5 to-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors font-medium"
                                                            >
                                                                {role.name}
                                                            </Badge>
                                                        )) || (
                                                            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                                                                No roles assigned
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </ConsistentTableCell>
                                                <ConsistentTableCell className="py-6">
                                                    <div className="flex justify-center">
                                                        {user.status === 1 ? (
                                                            <Badge className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-300 shadow-sm">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 transition-all duration-300 shadow-sm">
                                                                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </ConsistentTableCell>
                                                <ConsistentTableCell className="py-6">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24))} days ago
                                                        </div>
                                                    </div>
                                                </ConsistentTableCell>
                                                <ConsistentTableCell className="py-6">
                                                    <div className="flex justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-muted/50 transition-all duration-300 group-hover:bg-primary/10">
                                                                    <MoreHorizontal className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-52 border-border/50 shadow-xl">
                                                                {can.edit_users && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => setEditingUser(user)}
                                                                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-3 text-primary" />
                                                                        Edit User Details
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {can.manage_user_status && user.id !== auth.user.id && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleToggleStatus(user)}
                                                                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        {user.status === 1 ? (
                                                                            <>
                                                                                <PowerOff className="h-4 w-4 mr-3 text-orange-500" />
                                                                                Deactivate User
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Power className="h-4 w-4 mr-3 text-green-500" />
                                                                                Activate User
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {can.delete_users && user.id !== auth.user.id && (
                                                                    <>
                                                                        <div className="border-t my-2 border-border/50"></div>
                                                                        <DropdownMenuItem
                                                                            onClick={() => setDeletingUser(user)}
                                                                            className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50 transition-colors"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-3" />
                                                                            Delete User
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </ConsistentTableCell>
                                            </ConsistentTableRow>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-inner">
                                                        <Users className="h-10 w-10 text-muted-foreground" />
                                                    </div>
                                                    <div className="space-y-2 text-center">
                                                        <h3 className="text-xl font-semibold text-foreground">No users found</h3>
                                                        <p className="text-muted-foreground max-w-sm">
                                                            No users match your current search and filter criteria. Try adjusting your filters or search terms.
                                                        </p>
                                                    </div>
                                                    {can.create_users && (
                                                        <Button 
                                                            onClick={() => setIsCreateModalOpen(true)}
                                                            className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Create First User
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

                {/* Modern Pagination */}
                {users.links && (
                    <div className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-2xl p-6 shadow-lg">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    <span className="font-medium">
                                        Showing {users.meta?.from || 1} to {users.meta?.to || users.data.length} of {users.meta?.total || users.data.length} users
                                    </span>
                                </div>
                                <div className="hidden sm:block w-px h-4 bg-border"></div>
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span>{users.data.filter(u => u.status === 1).length} Active</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {users.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-300 ${
                                            link.active
                                                ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg transform scale-105'
                                                : 'bg-background/60 hover:bg-muted border border-border/50 hover:border-primary/30 hover:shadow-md'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}`}
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

            {/* Enhanced Delete Confirmation */}
            <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
                <AlertDialogContent className="max-w-lg border-border/50 shadow-2xl">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center border border-red-200">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="space-y-1">
                                <AlertDialogTitle className="text-xl font-semibold">Delete User Account</AlertDialogTitle>
                                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                            </div>
                        </div>
                        <AlertDialogDescription className="text-base pt-4 leading-relaxed">
                            You are about to permanently delete <strong className="text-foreground">{deletingUser?.name}</strong> ({deletingUser?.email}). 
                            This will remove their account, revoke all permissions, and cannot be reversed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                        <AlertDialogCancel className="mt-0 bg-background hover:bg-muted border-border/50">
                            Keep User
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingUser && handleDeleteUser()}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}