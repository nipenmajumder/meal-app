import { ConsistentTable, ConsistentTableCell, ConsistentTableHead, ConsistentTableHeader, ConsistentTableRow } from '@/components/consistent-table';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Download, ShoppingBag, TrendingUp, Users as UsersIcon, UtensilsCrossed, Wallet } from 'lucide-react';

interface User {
    id: number;
    name: string;
    balance: number | string;
    total_meal?: number | string;
    meal_rate?: number | string;
    total_cost?: number | string;
    total_deposit?: number | string;
}

interface Statistics {
    totalBalance: number;
    totalDeposits: number;
    totalMeals: number;
    totalShoppingExpenses: number;
    mealCost: number;
    shoppingCost: number;
}

interface DashboardProps {
    statistics: Statistics;
    users: User[];
    currentMonth: string;
    formattedMonth: string;
}

export default function Dashboard({ statistics, users, currentMonth, formattedMonth }: DashboardProps) {
    // Defensive programming: provide default values if statistics is undefined
    const stats = statistics || {
        totalBalance: 0,
        totalDeposits: 0,
        totalMeals: 0,
        totalShoppingExpenses: 0,
        mealCost: 0,
        shoppingCost: 0,
    };

    const usersList = users || [];

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const currentDate = new Date(currentMonth + '-01');
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + (direction === 'prev' ? -1 : 1));

        const params = new URLSearchParams(window.location.search);
        params.set('month', newDate.toISOString().slice(0, 7));
        window.location.href = `/dashboard?${params.toString()}`;
    };

    const handleExport = () => {
        const params = new URLSearchParams(window.location.search);
        window.location.href = `/dashboard/export?${params.toString()}`;
    };

    const getBalanceVariant = (balance: number | string | undefined) => {
        const numBalance = Number(balance || 0);
        if (numBalance > 0) return 'default';
        if (numBalance < 0) return 'destructive';
        return 'secondary';
    };

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'ArrowLeft',
            altKey: true,
            callback: () => handleMonthChange('prev'),
            description: 'Go to previous month',
        },
        {
            key: 'ArrowRight',
            altKey: true,
            callback: () => handleMonthChange('next'),
            description: 'Go to next month',
        },
        {
            key: 'e',
            ctrlKey: true,
            callback: handleExport,
            description: 'Export report',
        },
    ]);

    return (
        <AppLayout>
            <Head title={`Dashboard - ${formattedMonth}`} />

            <div className="space-y-6 p-3 sm:space-y-8 sm:p-6">
                {/* Header */}
                <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-6 text-center shadow-sm sm:px-6 sm:py-8 dark:from-gray-800 dark:to-gray-700">
                    <div className="space-y-2 sm:space-y-3">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl dark:text-white">
                            Mess Meal Management
                        </h1>
                        <h2 className="text-lg font-semibold text-blue-600 sm:text-xl lg:text-2xl dark:text-blue-400">
                            Final Meal Report - {formattedMonth}
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-2xl px-2 text-sm sm:text-base">
                            Comprehensive financial overview and meal tracking for your mess
                        </p>
                    </div>
                    <div className="mt-4 flex flex-col flex-wrap items-center justify-center gap-2 sm:mt-6 sm:flex-row sm:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMonthChange('prev')}
                            className="w-full px-4 py-2 sm:w-auto sm:px-6"
                            title="Previous Month (Alt + ←)"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous Month
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMonthChange('next')}
                            className="w-full px-4 py-2 sm:w-auto sm:px-6"
                            title="Next Month (Alt + →)"
                        >
                            Next Month
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleExport}
                            className="w-full bg-green-600 px-4 py-2 text-white hover:bg-green-700 sm:w-auto sm:px-6"
                            title="Export Report (Ctrl + E)"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div
                    className="animate-in fade-in slide-in-from-bottom-4 grid grid-cols-1 gap-4 duration-500 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
                    role="region"
                    aria-label="Monthly Statistics"
                >
                    <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">Total Meals</CardTitle>
                            <UtensilsCrossed className="text-muted-foreground h-4 w-4" aria-hidden="true" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold sm:text-2xl lg:text-3xl" aria-label={`Total meals: ${stats.totalMeals}`}>
                                {stats.totalMeals}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Meals consumed</p>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">Meal Rate</CardTitle>
                            <TrendingUp className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold sm:text-2xl lg:text-3xl">
                                ৳{stats.totalMeals > 0 ? (stats.shoppingCost / stats.totalMeals).toFixed(2) : '0.00'}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Per meal cost</p>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">Total Cost</CardTitle>
                            <Wallet className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold sm:text-2xl lg:text-3xl">৳{stats.mealCost.toFixed(2)}</div>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">All meal expenses</p>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">Total Deposits</CardTitle>
                            <Download className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold sm:text-2xl lg:text-3xl">৳{stats.totalDeposits.toFixed(2)}</div>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Money collected</p>
                        </CardContent>
                    </Card>

                    <Card className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">Shopping</CardTitle>
                            <ShoppingBag className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl font-bold sm:text-2xl lg:text-3xl">৳{stats.shoppingCost.toFixed(2)}</div>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">Grocery expenses</p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 transition-all duration-200 hover:scale-105 hover:shadow-lg dark:border-l-green-400">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-muted-foreground text-xs font-medium sm:text-sm">Current Balance</CardTitle>
                            <Wallet className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div
                                className={`text-xl font-bold transition-colors sm:text-2xl lg:text-3xl ${
                                    stats.totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                ৳{stats.totalBalance.toFixed(2)}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{stats.totalBalance >= 0 ? 'Surplus' : 'Deficit'}</p>
                        </CardContent>
                    </Card>
                </div>
                {/* User Balances Table */}
                {usersList.length === 0 ? (
                    <EmptyState
                        icon={UsersIcon}
                        title="No Users Found"
                        description="There are no users registered for this month. Add users to start tracking meals and expenses."
                    />
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="block sm:hidden">
                            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 p-4 duration-500">
                                {usersList.map((user, index) => {
                                    const balance = Number(user.balance || 0);
                                    const totalMeal = Number(user.total_meal || 0);
                                    const totalCost = Number(user.total_cost || 0);
                                    const totalDeposit = Number(user.total_deposit || 0);

                                    return (
                                        <div
                                            key={user.id}
                                            className="space-y-2 rounded-lg bg-gray-50 p-4 transition-all duration-200 hover:shadow-md dark:bg-gray-800"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="text-base font-medium">{user.name}</div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Meals:</span>
                                                    <span className="ml-2 font-mono">{totalMeal}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Cost:</span>
                                                    <span className="ml-2 font-mono">৳{totalCost.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Deposit:</span>
                                                    <span className="ml-2 font-mono">৳{totalDeposit.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Balance:</span>
                                                    <span
                                                        className={`ml-2 font-mono font-bold ${
                                                            balance > 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : balance < 0
                                                                  ? 'text-red-600 dark:text-red-400'
                                                                  : 'text-gray-600 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        ৳{balance.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Mobile Summary */}
                                <div className="rounded-lg border-t-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-50 p-4 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
                                    <div className="mb-2 text-base font-bold text-gray-900 dark:text-white">TOTALS</div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Total Meals:</span>
                                            <span className="ml-2 font-mono font-bold">
                                                {usersList.reduce((sum, user) => sum + Number(user.total_meal || 0), 0)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Cost:</span>
                                            <span className="ml-2 font-mono font-bold">৳{stats.mealCost.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Total Deposits:</span>
                                            <span className="ml-2 font-mono font-bold">৳{stats.totalDeposits.toFixed(2)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Final Balance:</span>
                                            <span
                                                className={`ml-2 font-mono text-lg font-bold ${
                                                    stats.totalBalance > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : stats.totalBalance < 0
                                                          ? 'text-red-600 dark:text-red-400'
                                                          : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                ৳{stats.totalBalance.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="animate-in fade-in slide-in-from-bottom-4 hidden duration-500 sm:block">
                            <ConsistentTable>
                                <ConsistentTableHeader>
                                    <ConsistentTableRow className="bg-gray-50 dark:bg-gray-800">
                                        <ConsistentTableHead className="px-6 py-4 text-base font-bold">Name</ConsistentTableHead>
                                        <ConsistentTableHead className="px-4 py-4 text-center text-base font-bold">Meals</ConsistentTableHead>
                                        <ConsistentTableHead className="px-4 py-4 text-right text-base font-bold">Total Cost</ConsistentTableHead>
                                        <ConsistentTableHead className="px-4 py-4 text-right text-base font-bold">Deposit</ConsistentTableHead>
                                        <ConsistentTableHead className="px-6 py-4 text-right text-base font-bold">Balance</ConsistentTableHead>
                                    </ConsistentTableRow>
                                </ConsistentTableHeader>
                                <tbody>
                                    {usersList.map((user) => {
                                        const balance = Number(user.balance || 0);
                                        const totalMeal = Number(user.total_meal || 0);
                                        const totalCost = Number(user.total_cost || 0);
                                        const totalDeposit = Number(user.total_deposit || 0);

                                        return (
                                            <ConsistentTableRow
                                                key={user.id}
                                                className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            >
                                                <ConsistentTableCell className="px-6 py-4 text-base font-medium">{user.name}</ConsistentTableCell>
                                                <ConsistentTableCell className="px-4 py-4 text-center text-base">{totalMeal}</ConsistentTableCell>
                                                <ConsistentTableCell className="px-4 py-4 text-right font-mono text-base">
                                                    ৳{totalCost.toFixed(2)}
                                                </ConsistentTableCell>
                                                <ConsistentTableCell className="px-4 py-4 text-right font-mono text-base">
                                                    ৳{totalDeposit.toFixed(2)}
                                                </ConsistentTableCell>
                                                <ConsistentTableCell className="px-6 py-4 text-right font-mono text-base">
                                                    <span
                                                        className={`font-bold ${
                                                            balance > 0
                                                                ? 'text-green-600 dark:text-green-400'
                                                                : balance < 0
                                                                  ? 'text-red-600 dark:text-red-400'
                                                                  : 'text-gray-600 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        ৳{balance.toFixed(2)}
                                                    </span>
                                                </ConsistentTableCell>
                                            </ConsistentTableRow>
                                        );
                                    })}

                                    {/* Summary Row */}
                                    <ConsistentTableRow className="border-t-2 border-gray-300 bg-gradient-to-r from-gray-100 to-gray-50 dark:border-gray-600 dark:from-gray-800 dark:to-gray-700">
                                        <ConsistentTableCell className="px-6 py-5 text-base font-bold text-gray-900 dark:text-white">
                                            TOTALS
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="px-4 py-5 text-center text-base font-bold text-gray-900 dark:text-white">
                                            {usersList.reduce((sum, user) => sum + Number(user.total_meal || 0), 0)}
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="px-4 py-5 text-right font-mono text-base font-bold text-gray-900 dark:text-white">
                                            ৳{stats.mealCost.toFixed(2)}
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="px-4 py-5 text-right font-mono text-base font-bold text-gray-900 dark:text-white">
                                            ৳{stats.totalDeposits.toFixed(2)}
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="px-6 py-5 text-right font-mono text-base font-bold">
                                            <span
                                                className={`text-lg ${
                                                    stats.totalBalance > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : stats.totalBalance < 0
                                                          ? 'text-red-600 dark:text-red-400'
                                                          : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                            >
                                                ৳{stats.totalBalance.toFixed(2)}
                                            </span>
                                        </ConsistentTableCell>
                                    </ConsistentTableRow>
                                </tbody>
                            </ConsistentTable>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
