import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ConsistentTable,
    ConsistentTableHeader,
    ConsistentTableRow,
    ConsistentTableCell,
    ConsistentTableHead,
    ScrollableTableContainer,
} from '@/components/consistent-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Download, FileText, PlusCircle, Upload } from 'lucide-react';
import React, { useState } from 'react';

type Deposits = {
    date: string;
    [username: string]: string | number | undefined;
};

type User = {
    id: number;
    name: string;
};

type MonthlyStats = {
    totalAmount: string;
    depositCount: number;
    activeUsers: number;
};

type Props = {
    data: Deposits[];
    userNames: string[];
    users: User[];
    currentMonth: string;
    monthlyStats: MonthlyStats;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Deposits',
        href: '/deposits',
    },
];

export default function Deposits({ userNames, data, users, currentMonth, }: Props) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    const {
        data: formData,
        setData,
        post,
        processing,
        reset,
        errors,
    } = useForm({
        user_id: '',
        date: '',
        amount: '',
    });



    // Helper functions
    const formatCurrency = (value: string | number | undefined): string => {
        if (!value || value === 0) return '—';
        const num = Number(value);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 2,
        }).format(num);
    };
    const calculateColumnTotal = (userName: string): number => {
        return data.reduce((sum, row) => {
            const value = Number(row[userName]) || 0;
            return sum + value;
        }, 0);
    };



    const getCellClassName = (value: string | number | undefined): string => {
        if (!value || value === 0) return 'text-gray-400';
        const num = Number(value);
        if (num > 100) return 'text-green-700 font-semibold bg-green-50';
        if (num > 50) return 'text-green-600 font-medium bg-green-25';
        if (num > 0) return 'text-blue-600';
        return 'text-red-500 font-medium bg-red-50';
    };

    const getAmountBadgeVariant = (value: string | number | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (!value || value === 0) return 'outline';
        const num = Number(value);
        if (num > 100) return 'default';
        if (num > 0) return 'secondary';
        return 'destructive';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/deposits', {
            onSuccess: () => {
                reset();
                setIsAddDialogOpen(false);
            },
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        const formData = new FormData();
        formData.append('file', importFile);

        router.post('/deposits/bulk/import', formData, {
            onSuccess: () => {
                setImportFile(null);
                setIsImportDialogOpen(false);
            },
        });
    };

    const handleExport = () => {
        window.location.href = `/deposits/export?month=${currentMonth}`;
    };

    const downloadTemplate = () => {
        window.location.href = '/deposits/bulk/template';
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const current = new Date(currentMonth + '-01');
        const newMonth =
            direction === 'prev'
                ? new Date(current.getFullYear(), current.getMonth() - 1, 1)
                : new Date(current.getFullYear(), current.getMonth() + 1, 1);

        const monthParam = newMonth.toISOString().slice(0, 7);
        router.get(`/deposits?month=${monthParam}`);
    };

    const formatMonthDisplay = (monthStr: string) => {
        const date = new Date(monthStr + '-01');
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

    const getCurrentMonth = () => {
        return formatMonthDisplay(currentMonth);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Contributions" />

            <div className="p-3 sm:p-4 lg:p-6 max-w-full">
                {/* Month Navigation and Stats */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Deposits - {getCurrentMonth()}</h1>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={downloadTemplate}>
                            <FileText className="mr-1 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Template</span>
                        </Button>

                        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Upload className="mr-1 sm:mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Import</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Import Deposits</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleImportSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="file">CSV File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".csv,.txt"
                                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                        />
                                        <p className="text-muted-foreground mt-1 text-sm">Upload a CSV file with columns: user_id, date, amount</p>
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={!importFile}>
                                            Import
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="mr-1 sm:mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>

                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Add Deposit</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Deposit</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="user_id">User</Label>
                                        <Select value={formData.user_id} onValueChange={(value) => setData('user_id', value)}>
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
                                        {errors.user_id && <p className="mt-1 text-sm text-red-500">{errors.user_id}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setData('date', e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="99999.99"
                                            value={formData.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Enhanced User-Friendly Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                    <div className="max-h-[70vh] overflow-y-auto">
                        <ConsistentTable>
                            <ConsistentTableHeader className="sticky top-0 z-10">
                                <ConsistentTableRow>
                                    <ConsistentTableHead className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-800 min-w-[120px] sm:min-w-[160px]">
                                        Date
                                    </ConsistentTableHead>
                                    {userNames.map((name) => (
                                        <ConsistentTableHead key={name} className="bg-gray-50 dark:bg-gray-800 min-w-[100px] sm:min-w-[120px]">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="hidden sm:inline">👤</span>
                                                <span className="text-xs sm:text-sm truncate">{name}</span>
                                            </div>
                                        </ConsistentTableHead>
                                    ))}
                                </ConsistentTableRow>
                            </ConsistentTableHeader>
                            <tbody>
                                {data.map((row, idx) => {
                                    const isEvenRow = idx % 2 === 0;
                                    const dateObj = new Date(row.date.split('-').reverse().join('-'));
                                    const formattedDate = `${dateObj.getDate()}-${dateObj.toLocaleString('en-US', { month: 'long' })}-${dateObj.toLocaleString('en-US', { weekday: 'long' })}`;

                                    return (
                                        <ConsistentTableRow key={idx} className={`${isEvenRow ? 'bg-gray-50/30 dark:bg-gray-800/30' : ''} hover:bg-gray-100 dark:hover:bg-gray-700/50`}>
                                            <ConsistentTableCell className="sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-w-[120px] sm:min-w-[160px]">
                                                <div className="flex flex-col py-2">
                                                    <span className="text-xs sm:text-sm font-semibold text-center">{formattedDate}</span>
                                                </div>
                                            </ConsistentTableCell>
                                            {userNames.map((name) => {
                                                const value = row[name];

                                                return (
                                                    <ConsistentTableCell key={name} className={`${getCellClassName(value)} text-center py-3`}>
                                                        <div className="flex justify-center">
                                                            {value && Number(value) !== 0 ? (
                                                                <Badge
                                                                    variant={getAmountBadgeVariant(value)}
                                                                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium"
                                                                >
                                                                    {formatCurrency(value)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-lg text-muted-foreground">—</span>
                                                            )}
                                                        </div>
                                                    </ConsistentTableCell>
                                                );
                                            })}
                                        </ConsistentTableRow>
                                    );
                                })}

                                {/* Summation Row */}
                                <ConsistentTableRow className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-t-2 border-blue-200 dark:border-blue-700">
                                    <ConsistentTableCell className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-900/20 border-r border-blue-200 dark:border-blue-700">
                                        <div className="flex flex-col py-3">
                                            <span className="text-center text-sm font-bold text-blue-900 dark:text-blue-100">TOTAL</span>
                                        </div>
                                    </ConsistentTableCell>
                                    {userNames.map((name) => {
                                        const columnTotal = calculateColumnTotal(name);

                                        return (
                                            <ConsistentTableCell key={name} className="text-center py-3">
                                                <div className="flex justify-center">
                                                    <Badge variant="default" className="bg-primary px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold hover:bg-primary/90">
                                                        {formatCurrency(columnTotal)}
                                                    </Badge>
                                                </div>
                                            </ConsistentTableCell>
                                        );
                                    })}
                                </ConsistentTableRow>
                            </tbody>
                        </ConsistentTable>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
