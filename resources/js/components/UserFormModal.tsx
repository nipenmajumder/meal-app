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
import { User, Role } from '@/types';

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

    const availableRoles = roles.filter(role => 
        currentUserRoles.includes(role.name) || currentUserRoles.includes('super-admin')
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit User' : 'Create New User'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? 'Update user information, roles, and status. Leave password blank to keep current password.' 
                            : 'Create a new user account with roles and permissions.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={errors.name ? 'border-red-500' : ''}
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className={errors.email ? 'border-red-500' : ''}
                            required
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            Password {!isEditing && '*'}
                            {isEditing && (
                                <span className="text-sm text-muted-foreground ml-2">
                                    (leave blank to keep current)
                                </span>
                            )}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={errors.password ? 'border-red-500' : ''}
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

                    {/* Roles */}
                    {availableRoles.length > 0 && (
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-3">
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
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
