import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import {
    ConsistentTable,
    ConsistentTableHeader,
    ConsistentTableRow,
    ConsistentTableCell,
    ConsistentTableHead,
    ScrollableTableContainer,
} from '@/components/consistent-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Can } from '@/components/Can';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusCircle, ChevronLeft, ChevronRight, Calculator, Download, ShoppingCart } from 'lucide-react';

type ShoppingExpenses = {
    date: string;
    [username: string]: string | number | undefined;
};

type User = {
    id: number;
    name: string;
};

type MonthlyStats = {
    totalAmount: string;
    expenseCount: number;
    activeUsers: number;
};

type Props = {
    data: ShoppingExpenses[];
    userNames: string[];
    users: User[];
    currentMonth: string;
    monthlyStats: MonthlyStats;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Shopping Expenses',
        href: '/shopping-expenses',
    },
];

export default function ShoppingExpenses({ userNames, data, users, currentMonth, monthlyStats }: Props) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const { data: formData, setData, post, processing, reset, errors } = useForm({
        user_id: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
    });

    // Helper functions
    const formatCurrency = (value: string | number | undefined): string => {
        if (!value || value === 0) return '—';
        const num = Number(value);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(num);
    };

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

    const calculateRowTotal = (row: ShoppingExpenses): number => {
        return userNames.reduce((sum, name) => {
            const value = Number(row[name]) || 0;
            return sum + value;
        }, 0);
    };

    const calculateColumnTotal = (userName: string): number => {
        return data.reduce((sum, row) => {
            const value = Number(row[userName]) || 0;
            return sum + value;
        }, 0);
    };

    const calculateGrandTotal = (): number => {
        return data.reduce((sum, row) => {
            return sum + calculateRowTotal(row);
        }, 0);
    };

    const getCellClassName = (value: string | number | undefined): string => {
        if (!value || value === 0) return 'text-gray-400';
        const num = Number(value);
        if (num > 100) return 'text-red-700 font-semibold bg-red-50';
        if (num > 50) return 'text-red-600 font-medium bg-red-25';
        if (num > 0) return 'text-orange-600';
        return 'text-gray-500 font-medium bg-gray-50';
    };

    const getAmountBadgeVariant = (value: string | number | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!value || value === 0) return 'outline';
        const num = Number(value);
        if (num > 100) return 'destructive';
        if (num > 0) return 'secondary';
        return 'outline';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shopping-expenses', {
            onSuccess: () => {
                reset();
                setIsAddDialogOpen(false);
            },
        });
    };

    const handleExport = () => {
        window.location.href = `/shopping-expenses/export?month=${currentMonth}`;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const current = new Date(currentMonth + '-01');
        const newMonth = direction === 'prev' 
            ? new Date(current.getFullYear(), current.getMonth() - 1, 1)
            : new Date(current.getFullYear(), current.getMonth() + 1, 1);
        
        const monthParam = newMonth.toISOString().slice(0, 7);
        router.get(`/shopping-expenses?month=${monthParam}`);
    };

    const formatMonthDisplay = (monthStr: string) => {
        const date = new Date(monthStr + '-01');
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const getCurrentMonth = () => {
        return formatMonthDisplay(currentMonth);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shopping Expenses" />

            <div className="p-4">
                {/* Month Navigation and Stats */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateMonth('prev')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h1 className="text-2xl font-bold">Shopping Expenses - {getCurrentMonth()}</h1>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateMonth('next')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Can permission="export shopping expenses">
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </Can>
                        
                        <Can permission="create shopping expenses">
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Expense
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Shopping Expense</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="user_id">User</Label>
                                            <Select
                                                value={formData.user_id}
                                                onValueChange={(value) => setData('user_id', value)}
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
                                                <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="date">Date</Label>
                                            <DatePicker
                                                date={getDateFromString(formData.date)}
                                                onSelect={(date) => setData('date', getStringFromDate(date))}
                                                placeholder="Select date"
                                                disabled={processing}
                                                className={errors.date ? 'border-red-500 focus:border-red-500' : ''}
                                            />
                                            {errors.date && (
                                                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                                            )}
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
                                            {errors.amount && (
                                                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description (Optional)</Label>
                                            <Input
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="What was purchased..."
                                            />
                                            {errors.description && (
                                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsAddDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </Can>
                    </div>
                </div>

                {/* Enhanced Shopping Expenses Table */}
                <ScrollableTableContainer>
                    <ConsistentTableHeader>
                        <ConsistentTableRow>
                            <ConsistentTableHead isSticky>
                                Date
                            </ConsistentTableHead>
                            {userNames.map((name) => (
                                <ConsistentTableHead key={name}>
                                    <div className="flex items-center justify-center gap-1">
                                     {name}
                                    </div>
                                </ConsistentTableHead>
                            ))}
                        </ConsistentTableRow>
                    </ConsistentTableHeader>
                    <TableBody>
                        {data.map((row, idx) => {
                            const rowTotal = calculateRowTotal(row);
                            const isEvenRow = idx % 2 === 0;
                            
                            // Format date as "1-July-Monday"
                            const dateObj = new Date(row.date.split('-').reverse().join('-'));
                            const formattedDate = `${dateObj.getDate()}-${dateObj.toLocaleString('en-US', { month: 'long' })}-${dateObj.toLocaleString('en-US', { weekday: 'long' })}`;
                            
                            return (
                                <ConsistentTableRow key={idx} isEvenRow={isEvenRow}>
                                    <ConsistentTableCell isSticky>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-center text-sm">
                                                {formattedDate}
                                            </span>
                                        </div>
                                    </ConsistentTableCell>
                                    {userNames.map((name) => {
                                        const value = row[name];
                                        
                                        return (
                                            <ConsistentTableCell key={name} className={getCellClassName(value)}>
                                                <div>
                                                    {value && Number(value) !== 0 ? (
                                                        <Badge 
                                                            variant={getAmountBadgeVariant(value)}
                                                            className="text-sm font-medium px-3 py-1"
                                                        >
                                                            {formatCurrency(value)}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-lg">—</span>
                                                    )}
                                                </div>
                                            </ConsistentTableCell>
                                        );
                                    })}
                                </ConsistentTableRow>
                            );
                        })}
                        
                        {/* Summation Row */}
                        <ConsistentTableRow isSummaryRow>
                            <ConsistentTableCell isSticky>
                                <div className="flex flex-col">
                                    <span className="font-bold text-center text-sm">
                                        TOTAL
                                    </span>
                                </div>
                            </ConsistentTableCell>
                            {userNames.map((name) => {
                                const columnTotal = calculateColumnTotal(name);
                                
                                return (
                                    <ConsistentTableCell key={name}>
                                        <div>
                                            <Badge 
                                                variant="default"
                                                className="text-sm font-bold px-3 py-1 bg-primary hover:bg-primary/90"
                                            >
                                                {formatCurrency(columnTotal)}
                                            </Badge>
                                        </div>
                                    </ConsistentTableCell>
                                );
                            })}
                        </ConsistentTableRow>
                    </TableBody>
                </ScrollableTableContainer>
            </div>
        </AppLayout>
    );
}
