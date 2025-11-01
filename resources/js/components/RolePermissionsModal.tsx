import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Permission, Role } from '@/types';
import { router } from '@inertiajs/react';
import { RotateCcw, Save, Search, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RolePermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: Role | null;
    permissions?: Permission[];
    rolePermissions?: number[]; // permission IDs assigned to this role
}

export function RolePermissionsModal({ isOpen, onClose, role, permissions = [], rolePermissions = [] }: RolePermissionsModalProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && role) {
            setSelectedPermissions(rolePermissions);
        }
    }, [isOpen, role, rolePermissions]);

    // Filter permissions based on search - add safety check
    const filteredPermissions = (permissions || []).filter(
        (permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    // Group permissions by category
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

    const togglePermission = (permissionId: number) => {
        setSelectedPermissions((prev) => (prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]));
    };

    const toggleCategoryPermissions = (categoryPermissions: Permission[]) => {
        const allSelected = categoryPermissions.every((p) => selectedPermissions.includes(p.id));

        if (allSelected) {
            setSelectedPermissions((prev) => prev.filter((id) => !categoryPermissions.some((p) => p.id === id)));
        } else {
            const newPermissions = categoryPermissions.filter((p) => !selectedPermissions.includes(p.id)).map((p) => p.id);
            setSelectedPermissions((prev) => [...prev, ...newPermissions]);
        }
    };

    const handleSave = () => {
        if (!role) return;

        setProcessing(true);
        router.post(
            route('roles.assign-permissions', role.id),
            {
                permissions: selectedPermissions,
            },
            {
                onSuccess: () => {
                    onClose();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const handleReset = () => {
        setSelectedPermissions(rolePermissions);
    };

    const hasChanges = () => {
        return JSON.stringify(selectedPermissions.sort()) !== JSON.stringify(rolePermissions.sort());
    };

    if (!role) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Manage Permissions for "{role.name}"
                    </DialogTitle>
                    <DialogDescription>Select the permissions that should be assigned to this role.</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label>Search Permissions</Label>
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

                    {/* Permissions by Category */}
                    <div className="space-y-6">
                        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium capitalize">{category}</h4>
                                        <Badge variant="secondary" className="text-xs">
                                            {categoryPermissions.length}
                                        </Badge>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => toggleCategoryPermissions(categoryPermissions)}>
                                        {categoryPermissions.every((p) => selectedPermissions.includes(p.id)) ? 'Unselect All' : 'Select All'}
                                    </Button>
                                </div>

                                <div className="bg-muted/30 grid grid-cols-1 gap-3 rounded-lg border p-4 md:grid-cols-2">
                                    {categoryPermissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={selectedPermissions.includes(permission.id)}
                                                onCheckedChange={() => togglePermission(permission.id)}
                                            />
                                            <Label htmlFor={`permission-${permission.id}`} className="flex-1 cursor-pointer text-sm font-normal">
                                                <div>
                                                    <div className="font-medium">{permission.name}</div>
                                                    {permission.description && (
                                                        <div className="text-muted-foreground text-xs">{permission.description}</div>
                                                    )}
                                                </div>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
                        <div className="text-muted-foreground text-sm">
                            {selectedPermissions.length} of {permissions.length} permissions selected
                        </div>

                        {hasChanges() && (
                            <Badge variant="outline" className="border-orange-200 text-orange-600">
                                Unsaved changes
                            </Badge>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={handleReset} disabled={!hasChanges()}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={processing || !hasChanges()}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Permissions'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
