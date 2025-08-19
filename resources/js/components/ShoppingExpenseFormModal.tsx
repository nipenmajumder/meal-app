import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Plus, X, Receipt } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface ShoppingExpenseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    editingExpense?: {
        id: number;
        user_id: number;
        date: string;
        amount: number;
        description?: string;
    };
}

export default function ShoppingExpenseFormModal({ 
    isOpen, 
    onClose, 
    users, 
    editingExpense 
}: ShoppingExpenseFormModalProps) {
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        user_id: editingExpense?.user_id?.toString() || '',
        date: editingExpense?.date || new Date().toISOString().split('T')[0],
        amount: editingExpense?.amount?.toString() || '',
        description: editingExpense?.description || '',
    });

    // Helper functions for date handling
    const getDateFromString = (dateString: string): Date | undefined => {
        if (!dateString) return undefined;
        // Create date in local timezone to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const getStringFromDate = (date: Date | undefined): string => {
        if (!date) return '';
        // Use local date to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isEditing = !!editingExpense;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setServerErrors({});
        clearErrors();

        const submitData = {
            ...data,
            amount: parseFloat(data.amount) || 0,
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
            put(`/shopping-expenses/${editingExpense.id}`, {
                data: submitData,
                onSuccess,
                onError,
            });
        } else {
            post('/shopping-expenses', {
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
                        <Receipt className="h-5 w-5" />
                        {isEditing ? 'Edit Shopping Expense' : 'Add Shopping Expense'}
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
                        <Label htmlFor="user">Shopper *</Label>
                        <Select 
                            value={data.user_id} 
                            onValueChange={(value) => setData('user_id', value)}
                            disabled={processing}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Who did the shopping?" />
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
                        <DatePicker
                            date={getDateFromString(data.date)}
                            onSelect={(date) => setData('date', getStringFromDate(date))}
                            placeholder="Select date"
                            disabled={processing}
                            className={errors.date ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {errors.date && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.date}</p>
                        )}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (৳) *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                ৳
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                disabled={processing}
                                className={`pl-8 ${errors.amount ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                        </div>
                        {errors.amount && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="e.g., Rice, vegetables, fish..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            disabled={processing}
                            rows={3}
                            className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Optional: Add details about what was purchased
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
                            disabled={processing || !data.user_id || !data.date || !data.amount}
                        >
                            {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Plus className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update Expense' : 'Add Expense'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
