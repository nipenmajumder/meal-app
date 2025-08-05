import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { 
    ConsistentTable, 
    ConsistentTableHeader, 
    ConsistentTableRow, 
    ConsistentTableCell, 
    ConsistentTableHead 
} from '@/components/consistent-table';

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

    return (
        <AppLayout>
            <Head title={`Dashboard - ${formattedMonth}`} />
            
            <div className="space-y-6 sm:space-y-8 p-3 sm:p-6">
                {/* Header */}
                <div className="text-center py-6 sm:py-8 px-4 sm:px-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border shadow-sm">
                    <div className="space-y-2 sm:space-y-3">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Mess Meal Management
                        </h1>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-600 dark:text-blue-400">
                            Final Meal Report - {formattedMonth}
                        </h2>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
                            Comprehensive financial overview and meal tracking for your mess
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMonthChange('prev')}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous Month
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMonthChange('next')}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2"
                        >
                            Next Month
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleExport}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Meals</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalMeals}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Meals consumed
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Meal Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                                ৳{stats.totalMeals > 0 ? (stats.shoppingCost / stats.totalMeals).toFixed(2) : '0.00'}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Per meal cost
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">৳{stats.mealCost.toFixed(2)}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                All meal expenses
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Deposits</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">৳{stats.totalDeposits.toFixed(2)}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Money collected
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Shopping</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">৳{stats.shoppingCost.toFixed(2)}</div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                Grocery expenses
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                                stats.totalBalance >= 0 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                                ৳{stats.totalBalance.toFixed(2)}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                {stats.totalBalance >= 0 ? 'Surplus' : 'Deficit'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
                {/* User Balances Table */}
                {/* Mobile Card View */}
                <div className="block sm:hidden">
                    <div className="space-y-4 p-4">
                        {usersList.map((user) => {
                            const balance = Number(user.balance || 0);
                            const totalMeal = Number(user.total_meal || 0);
                            const totalCost = Number(user.total_cost || 0);
                            const totalDeposit = Number(user.total_deposit || 0);
                            
                            return (
                                <div key={user.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                                    <div className="font-medium text-base">{user.name}</div>
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
                                            <span className={`ml-2 font-mono font-bold ${
                                                balance > 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : balance < 0 
                                                        ? 'text-red-600 dark:text-red-400' 
                                                        : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                ৳{balance.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Mobile Summary */}
                        <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border-t-2 border-gray-300 dark:border-gray-600">
                            <div className="font-bold text-base mb-2 text-gray-900 dark:text-white">TOTALS</div>
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
                                    <span className={`ml-2 font-mono font-bold text-lg ${
                                        stats.totalBalance > 0 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : stats.totalBalance < 0 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        ৳{stats.totalBalance.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block">
                    <ConsistentTable>
                        <ConsistentTableHeader>
                            <ConsistentTableRow className="bg-gray-50 dark:bg-gray-800">
                                <ConsistentTableHead className="font-bold py-4 px-6 text-base">Name</ConsistentTableHead>
                                <ConsistentTableHead className="text-center font-bold py-4 px-4 text-base">Meals</ConsistentTableHead>
                                <ConsistentTableHead className="text-right font-bold py-4 px-4 text-base">Total Cost</ConsistentTableHead>
                                <ConsistentTableHead className="text-right font-bold py-4 px-4 text-base">Deposit</ConsistentTableHead>
                                <ConsistentTableHead className="text-right font-bold py-4 px-6 text-base">Balance</ConsistentTableHead>
                            </ConsistentTableRow>
                        </ConsistentTableHeader>
                        <tbody>
                            {usersList.map((user) => {
                                const balance = Number(user.balance || 0);
                                const totalMeal = Number(user.total_meal || 0);
                                const totalCost = Number(user.total_cost || 0);
                                const totalDeposit = Number(user.total_deposit || 0);
                                
                                return (
                                    <ConsistentTableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <ConsistentTableCell className="font-medium py-4 px-6 text-base">
                                            {user.name}
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="text-center py-4 px-4 text-base">
                                            {totalMeal}
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="text-right font-mono py-4 px-4 text-base">
                                            ৳{totalCost.toFixed(2)}
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="text-right font-mono py-4 px-4 text-base">
                                            ৳{totalDeposit.toFixed(2)}
                                        </ConsistentTableCell>
                                        <ConsistentTableCell className="text-right font-mono py-4 px-6 text-base">
                                            <span className={`font-bold ${
                                                balance > 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : balance < 0 
                                                        ? 'text-red-600 dark:text-red-400' 
                                                        : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                ৳{balance.toFixed(2)}
                                            </span>
                                        </ConsistentTableCell>
                                    </ConsistentTableRow>
                                );
                            })}
                            
                            {/* Summary Row */}
                            <ConsistentTableRow className="border-t-2 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700">
                                <ConsistentTableCell className="font-bold text-base py-5 px-6 text-gray-900 dark:text-white">
                                    TOTALS
                                </ConsistentTableCell>
                                <ConsistentTableCell className="text-center font-bold py-5 px-4 text-base text-gray-900 dark:text-white">
                                    {usersList.reduce((sum, user) => sum + Number(user.total_meal || 0), 0)}
                                </ConsistentTableCell>
                                <ConsistentTableCell className="text-right font-mono font-bold py-5 px-4 text-base text-gray-900 dark:text-white">
                                    ৳{stats.mealCost.toFixed(2)}
                                </ConsistentTableCell>
                                <ConsistentTableCell className="text-right font-mono font-bold py-5 px-4 text-base text-gray-900 dark:text-white">
                                    ৳{stats.totalDeposits.toFixed(2)}
                                </ConsistentTableCell>
                                <ConsistentTableCell className="text-right font-mono font-bold py-5 px-6 text-base">
                                    <span className={`text-lg ${
                                        stats.totalBalance > 0 
                                            ? 'text-green-600 dark:text-green-400' 
                                            : stats.totalBalance < 0 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        ৳{stats.totalBalance.toFixed(2)}
                                    </span>
                                </ConsistentTableCell>
                            </ConsistentTableRow>
                        </tbody>
                    </ConsistentTable>
                </div>
            </div>
        </AppLayout>
    );
}
