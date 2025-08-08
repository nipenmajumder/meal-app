import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, Role } from '@/types';
import { UserPlus, Edit, Mail, Lock, Shield, Activity } from 'lucide-react';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    roles: Role[];
    currentUserRoles: string[];
}

export function UserFormModal({ isOpen, onClose, user, roles, currentUserRoles }: UserFormModalProps) {
    const isEditing = !!user;
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        status: 1,
        roles: [] as string[],
    });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    password_confirmation: '',
                    status: user.status,
                    roles: user.roles?.map(role => role.name) || [],
                });
                setSelectedRoles(user.roles?.map(role => role.name) || []);
            } else {
                reset();
                setSelectedRoles([]);
            }
        }
    }, [isOpen, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            roles: selectedRoles,
        };

        if (isEditing) {
            put(route('users.update', user.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setSelectedRoles([...selectedRoles, roleName]);
        } else {
            setSelectedRoles(selectedRoles.filter(r => r !== roleName));
        }
        setData('roles', checked 
            ? [...selectedRoles, roleName]
            : selectedRoles.filter(r => r !== roleName)
        );
    };

    // Admin can assign any role, others can only assign roles they have or roles below their level
    const availableRoles = roles.filter(role => {
        if (currentUserRoles.includes('Admin')) {
            return true; // Admin can assign any role
        }
        return currentUserRoles.includes(role.name);
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit User' : 'Add New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? 'Update user details below.' 
                            : 'Fill in the details to create a new user.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={errors.name ? 'border-red-500' : ''}
                                placeholder="Full name"
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={errors.email ? 'border-red-500' : ''}
                                placeholder="email@example.com"
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password {!isEditing && '*'}
                                {isEditing && <span className="text-xs text-muted-foreground">(optional)</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={errors.password ? 'border-red-500' : ''}
                                placeholder={isEditing ? "Leave blank to keep current" : "Password"}
                                required={!isEditing}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        {data.password && (
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={errors.password_confirmation ? 'border-red-500' : ''}
                                    placeholder="Confirm password"
                                    required={!!data.password}
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                        )}

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={data.status.toString()}
                                onValueChange={(value) => setData('status', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    {/* Roles */}
                    {availableRoles.length > 0 && (
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="grid grid-cols-2 gap-2 p-3 border rounded">
                                {availableRoles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={selectedRoles.includes(role.name)}
                                            onCheckedChange={(checked) => 
                                                handleRoleChange(role.name, checked as boolean)
                                            }
                                        />
                                        <Label 
                                            htmlFor={`role-${role.id}`}
                                            className="text-sm font-normal"
                                        >
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.roles && (
                                <p className="text-sm text-red-600">{errors.roles}</p>
                            )}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
