import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, X, Upload, PiggyBank, Users } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface DepositFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    editingDeposit?: {
        id: number;
        user_id: number;
        date: string;
        amount: number;
    };
}

export default function DepositFormModal({ 
    isOpen, 
    onClose, 
    users, 
    editingDeposit 
}: DepositFormModalProps) {
    const [activeTab, setActiveTab] = useState('single');
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    
    // Single deposit form
    const { data, setData, post, put, processing, reset, errors, clearErrors } = useForm({
        user_id: editingDeposit?.user_id?.toString() || '',
        date: editingDeposit?.date || new Date().toISOString().split('T')[0],
        amount: editingDeposit?.amount?.toString() || '',
    });

    // Bulk deposit form
    const { 
        data: bulkData, 
        setData: setBulkData, 
        post: postBulk, 
        processing: bulkProcessing, 
        reset: resetBulk, 
        errors: bulkErrors,
        clearErrors: clearBulkErrors 
    } = useForm({
        date: new Date().toISOString().split('T')[0],
        deposits: users.reduce((acc, user) => ({ ...acc, [user.id]: '' }), {} as Record<number, string>),
    });

    const isEditing = !!editingDeposit;

    const handleSingleSubmit = (e: React.FormEvent) => {
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
            put(`/deposits/${editingDeposit.id}`, {
                data: submitData,
                onSuccess,
                onError,
            });
        } else {
            post('/deposits', {
                data: submitData,
                onSuccess,
                onError,
            });
        }
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setServerErrors({});
        clearBulkErrors();

        // Filter out empty deposits
        const filteredDeposits = Object.entries(bulkData.deposits)
            .filter(([_, amount]) => amount && parseFloat(amount) > 0)
            .reduce((acc, [userId, amount]) => ({
                ...acc,
                [userId]: parseFloat(amount)
            }), {});

        const submitData = {
            date: bulkData.date,
            deposits: filteredDeposits,
        };

        postBulk('/deposits/bulk', {
            data: submitData,
            onSuccess: () => {
                resetBulk();
                onClose();
            },
            onError: (errors: any) => {
                if (errors.message) {
                    setServerErrors({ general: errors.message });
                }
            },
        });
    };

    const handleClose = () => {
        reset();
        resetBulk();
        clearErrors();
        clearBulkErrors();
        setServerErrors({});
        setActiveTab('single');
        onClose();
    };

    const updateBulkDeposit = (userId: number, amount: string) => {
        setBulkData('deposits', {
            ...bulkData.deposits,
            [userId]: amount,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PiggyBank className="h-5 w-5" />
                        {isEditing ? 'Edit Deposit' : 'Add Deposits'}
                    </DialogTitle>
                </DialogHeader>

                {/* General Error Alert */}
                {serverErrors.general && (
                    <Alert variant="destructive">
                        <AlertDescription>{serverErrors.general}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="single" className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Single Deposit
                        </TabsTrigger>
                        <TabsTrigger value="bulk" className="flex items-center gap-2" disabled={isEditing}>
                            <Users className="h-4 w-4" />
                            Bulk Deposits
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="space-y-4">
                        <form onSubmit={handleSingleSubmit} className="space-y-4">
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
                                    {isEditing ? 'Update Deposit' : 'Add Deposit'}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="bulk" className="space-y-4">
                        <form onSubmit={handleBulkSubmit} className="space-y-4">
                            {/* Bulk Date */}
                            <div className="space-y-2">
                                <Label htmlFor="bulk-date">Date for all deposits *</Label>
                                <Input
                                    id="bulk-date"
                                    type="date"
                                    value={bulkData.date}
                                    onChange={(e) => setBulkData('date', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    disabled={bulkProcessing}
                                    className={bulkErrors.date ? 'border-red-500 focus:border-red-500' : ''}
                                />
                                {bulkErrors.date && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{bulkErrors.date}</p>
                                )}
                            </div>

                            {/* Bulk Deposits Grid */}
                            <div className="space-y-2">
                                <Label>Deposit amounts for each user</Label>
                                <div className="grid gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                                    {users.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between gap-3">
                                            <Label className="text-sm font-medium min-w-0 flex-1">
                                                {user.name}
                                            </Label>
                                            <div className="relative w-32">
                                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                                                    ৳
                                                </span>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={bulkData.deposits[user.id] || ''}
                                                    onChange={(e) => updateBulkDeposit(user.id, e.target.value)}
                                                    disabled={bulkProcessing}
                                                    className="pl-6 text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Leave empty for users who didn't deposit anything
                                </p>
                            </div>

                            {/* Bulk Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={bulkProcessing}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={bulkProcessing || !bulkData.date}
                                >
                                    {bulkProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    <Upload className="h-4 w-4 mr-2" />
                                    Add Bulk Deposits
                                </Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
