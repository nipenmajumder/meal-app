import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, X } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface MealFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    editingMeal?: {
        id: number;
        user_id: number;
        date: string;
        meal_count: number;
    };
}

export default function MealFormModal({ isOpen, onClose, users, editingMeal }: MealFormModalProps) {
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        user_id: editingMeal?.user_id?.toString() || '',
        date: editingMeal?.date || new Date().toISOString().split('T')[0],
        meal_count: editingMeal?.meal_count?.toString() || '',
    });

    const isEditing = !!editingMeal;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setServerErrors({});
        clearErrors();

        const submitData = {
            ...data,
            meal_count: parseFloat(data.meal_count) || 0,
        };

        const onSuccess = () => {
            reset();
            onClose();
        };

        const onError = (errors: any) => {
            if (errors.message) {
                setServerErrors({ general: errors.message });
            }
        };

        if (isEditing) {
            put(`/meals/${editingMeal.id}`, {
                data: submitData,
                onSuccess,
                onError,
            });
        } else {
            post('/meals', {
                data: submitData,
                onSuccess,
                onError,
            });
        }
    };

    const handleClose = () => {
        reset();
        clearErrors();
        setServerErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {isEditing ? 'Edit Meal' : 'Add New Meal'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* General Error Alert */}
                    {serverErrors.general && (
                        <Alert variant="destructive">
                            <AlertDescription>{serverErrors.general}</AlertDescription>
                        </Alert>
                    )}

                    {/* User Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="user">User *</Label>
                        <Select 
                            value={data.user_id} 
                            onValueChange={(value) => setData('user_id', value)}
                            disabled={processing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.user_id && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.user_id}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            disabled={processing}
                            className={errors.date ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {errors.date && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                        )}
                    </div>

                    {/* Meal Count */}
                    <div className="space-y-2">
                        <Label htmlFor="meal_count">Meal Count *</Label>
                        <Input
                            id="meal_count"
                            type="number"
                            step="0.5"
                            min="0"
                            max="10"
                            placeholder="e.g., 1.5"
                            value={data.meal_count}
                            onChange={(e) => setData('meal_count', e.target.value)}
                            disabled={processing}
                            className={errors.meal_count ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {errors.meal_count && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.meal_count}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Enter meal count (0.5 increments allowed, max 10)
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.user_id || !data.date || !data.meal_count}
                        >
                            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Plus className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update Meal' : 'Add Meal'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
