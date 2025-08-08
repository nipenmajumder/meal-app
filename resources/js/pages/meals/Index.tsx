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
import { Can } from '@/components/Can';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { PlusCircle, ChevronLeft, ChevronRight, Calculator, Download, UtensilsCrossed, Users } from 'lucide-react';

type Meals = {
    date: string;
    [username: string]: string | number | undefined;
};

type User = {
    id: number;
    name: string;
};

type MonthlyStats = {
    totalMeals: string;
    mealCount: number;
    activeUsers: number;
};

type Props = {
    data: Meals[];
    userNames: string[];
    users: User[];
    currentMonth: string;
    monthlyStats: MonthlyStats;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Meals',
        href: '/meals',
    },
];

export default function Meals({ userNames, data, users, currentMonth, monthlyStats }: Props) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

    const { data: formData, setData, post, processing, reset, errors } = useForm({
        user_id: '',
        date: '',
        meal_count: '',
    });

    const { data: bulkFormData, setData: setBulkData, post: postBulk, processing: bulkProcessing, reset: resetBulk, errors: bulkErrors } = useForm({
        date: '',
        meals: {} as Record<string, string>,
    });

    // Helper functions
    const formatMealCount = (value: string | number | undefined): string => {
        if (!value || value === 0) return '—';
        const num = Number(value);
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
    };

    const calculateRowTotal = (row: Meals): number => {
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
        if (num >= 2) return 'text-green-700 font-semibold bg-green-50';
        if (num >= 1) return 'text-green-600 font-medium bg-green-25';
        if (num > 0) return 'text-blue-600';
        return 'text-gray-500 font-medium bg-gray-50';
    };

    const getAmountBadgeVariant = (value: string | number | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!value || value === 0) return 'outline';
        const num = Number(value);
        if (num >= 2) return 'default';
        if (num >= 1) return 'secondary';
        return 'outline';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/meals', {
            onSuccess: () => {
                reset();
                setIsAddDialogOpen(false);
            },
        });
    };

    const handleBulkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postBulk('/meals/bulk', {
            onSuccess: () => {
                resetBulk();
                setIsBulkDialogOpen(false);
            },
        });
    };

    const updateBulkMeal = (userId: string, value: string) => {
        setBulkData('meals', {
            ...bulkFormData.meals,
            [userId]: value,
        });
    };

    const handleExport = () => {
        window.location.href = `/meals/export?month=${currentMonth}`;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const current = new Date(currentMonth + '-01');
        const newMonth = direction === 'prev' 
            ? new Date(current.getFullYear(), current.getMonth() - 1, 1)
            : new Date(current.getFullYear(), current.getMonth() + 1, 1);
        
        const monthParam = newMonth.toISOString().slice(0, 7);
        router.get(`/meals?month=${monthParam}`);
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
            <Head title="Meal Tracking" />

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
                        <h1 className="text-2xl font-bold">Meals - {getCurrentMonth()}</h1>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateMonth('next')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Can permission="export meals">
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </Can>
                        
                        <Can permission="bulk import meals">
                            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Users className="mr-2 h-4 w-4" />
                                        Bulk Add
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Add Meals for All Users</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="bulk_date">Date</Label>
                                            <Input
                                                id="bulk_date"
                                                type="date"
                                                value={bulkFormData.date}
                                                onChange={(e) => setBulkData('date', e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                            {bulkErrors.date && (
                                                <p className="text-red-500 text-sm mt-1">{bulkErrors.date}</p>
                                            )}
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            <Label className="text-base font-semibold">Meal Counts for Each User</Label>
                                            <div className="grid gap-3 mt-2">
                                                {users.map((user) => (
                                                    <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                                                        <div className="flex-1">
                                                            <Label className="font-medium">{user.name}</Label>
                                                        </div>
                                                        <div className="w-32">
                                                            <Input
                                                                type="number"
                                                                step="0.5"
                                                                min="0"
                                                                max="10"
                                                                value={bulkFormData.meals[user.id.toString()] || ''}
                                                                onChange={(e) => updateBulkMeal(user.id.toString(), e.target.value)}
                                                                placeholder="0"
                                                                className="text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Leave empty or enter 0 for users who didn't have meals
                                            </p>
                                        </div>

                                        <div className="flex justify-end space-x-2 pt-4 border-t">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsBulkDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={bulkProcessing}>
                                                {bulkProcessing ? 'Saving...' : 'Save All Meals'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </Can>
                        
                        <Can permission="create meals">
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Meal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Meal Record</DialogTitle>
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
                                            <Input
                                                id="date"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                            {errors.date && (
                                                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="meal_count">Meal Count</Label>
                                            <Input
                                                id="meal_count"
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="10"
                                                value={formData.meal_count}
                                                onChange={(e) => setData('meal_count', e.target.value)}
                                                placeholder="0"
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Enter the number of meals (e.g., 1, 1.5, 2)
                                            </p>
                                            {errors.meal_count && (
                                                <p className="text-red-500 text-sm mt-1">{errors.meal_count}</p>
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

                {/* Enhanced Meal Tracking Table */}
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
                                                            {formatMealCount(value)}
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
                                                {formatMealCount(columnTotal)}
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
