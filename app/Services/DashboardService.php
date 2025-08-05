<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Deposit;
use App\Models\Meal;
use App\Models\ShoppingExpense;
use App\Models\User;
use App\Models\Utility;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

final class DashboardService
{
    public function getMonthlyData($startDate = null, $endDate = null): array
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();
        
        $cacheKey = 'monthly_data_' . $start->format('Y-m');
        
        return Cache::remember($cacheKey, 3600, function () use ($start, $end) {
            // Get all data in fewer queries
            $totalMeals = $this->getTotalMeal($start, $end);
            $totalDeposits = $this->getTotalDeposit($start, $end);
            $totalShoppingExpenses = $this->getTotalShoppingExpense($start, $end);
            // $totalUtilities = $this->getTotalUtilities($start, $end);
            
            $mealRate = $this->calculateMealRate($totalMeals, $totalShoppingExpenses);
            $balance = $totalDeposits - $totalShoppingExpenses;
            
            return [
                'totalMeals' => $totalMeals,
                'totalDeposits' => $totalDeposits,
                'totalShoppingExpenses' => $totalShoppingExpenses,
                'totalUtilities' => 0,
                'mealRate' => $mealRate,
                'balance' => $balance,
                'mealCost' => $totalMeals * $mealRate,
                'users' => $this->getUsersData($mealRate, $start, $end),
            ];
        });
    }

    public function getTotalMeal($startDate = null, $endDate = null): float
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();

        return (float) Meal::query()
            ->forDateRange($start, $end)
            ->sum('meal_count');
    }

    public function getTotalShoppingExpense($startDate = null, $endDate = null): float
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();

        return (float) ShoppingExpense::query()
            ->forDateRange($start, $end)
            ->sum('amount');
    }

    public function getTotalDeposit($startDate = null, $endDate = null): float
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();

        return (float) Deposit::query()
            ->forDateRange($start, $end)
            ->sum('amount');
    }

    public function getTotalUtilities($startDate = null, $endDate = null): float
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();

        return (float) Utility::query()
            ->forDateRange($start, $end)
            ->sum('amount');
    }

    public function calculateMealRate(float $totalMeal, float $totalShoppingExpense): float
    {
        return $totalMeal > 0 ? $totalShoppingExpense / $totalMeal : 0;
    }

    public function getUsersData(float $mealRate, $startDate = null, $endDate = null): array
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();

        // Single optimized query with all relationships
        return User::query()
            ->active()
            ->select(['id', 'name'])
            ->withSum(['meals as total_meal' => function ($query) use ($start, $end) {
                $query->whereBetween('date', [$start, $end]);
            }], 'meal_count')
            ->withSum(['deposits as total_deposit' => function ($query) use ($start, $end) {
                $query->whereBetween('date', [$start, $end]);
            }], 'amount')
            ->withSum(['utilities as total_utility' => function ($query) use ($start, $end) {
                $query->whereBetween('created_at', [$start, $end]);
            }], 'amount')
            ->get()
            ->map(fn ($user) => $this->formatUserData($user, $mealRate))
            ->toArray();
    }

    private function formatUserData($user, float $mealRate): array
    {
        $totalMeal = (float) ($user->total_meal ?? 0);
        $totalDeposit = (float) ($user->total_deposit ?? 0);
        $totalUtility = (float) ($user->total_utility ?? 0);
        $mealCost = round($totalMeal * $mealRate, 2);
        $totalCost = $mealCost + $totalUtility;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'total_meal' => $totalMeal,
            'meal_rate' => number_format($mealRate, 2, '.', ''),
            'meal_cost' => number_format($mealCost, 2, '.', ''),
            'total_utility' => number_format($totalUtility, 2, '.', ''),
            'total_cost' => number_format($totalCost, 2, '.', ''),
            'total_deposit' => number_format($totalDeposit, 2, '.', ''),
            'balance' => number_format(($totalDeposit - $totalCost), 2, '.', ''),
        ];
    }

    public function getMonthlyStatistics($month = null): array
    {
        $date = $month ? Carbon::createFromFormat('Y-m', $month) : now();
        $start = $date->copy()->startOfMonth();
        $end = $date->copy()->endOfMonth();

        $cacheKey = 'monthly_stats_' . $start->format('Y-m');

        return Cache::remember($cacheKey, 3600, function () use ($start, $end) {
            return [
                'total_active_users' => User::active()->count(),
                'total_meals_this_month' => $this->getTotalMeal($start, $end),
                'total_deposits_this_month' => $this->getTotalDeposit($start, $end),
                'total_expenses_this_month' => $this->getTotalShoppingExpense($start, $end),
                'average_meals_per_day' => $this->getAverageMealsPerDay($start, $end),
                'most_active_user' => $this->getMostActiveUser($start, $end),
            ];
        });
    }

    private function getAverageMealsPerDay($start, $end): float
    {
        $totalDays = $start->diffInDays($end) + 1;
        $totalMeals = $this->getTotalMeal($start, $end);
        
        return $totalDays > 0 ? round($totalMeals / $totalDays, 2) : 0;
    }

    private function getMostActiveUser($start, $end): ?array
    {
        $user = User::query()
            ->active()
            ->select(['id', 'name'])
            ->withSum(['meals as total_meal' => function ($query) use ($start, $end) {
                $query->whereBetween('meals.date', [$start, $end]);
            }], 'meal_count')
            ->orderByDesc('total_meal')
            ->first();

        return $user ? [
            'name' => $user->name,
            'total_meals' => (float) ($user->total_meal ?? 0),
        ] : null;
    }

    public function clearMonthCache($month): void
    {
        $keys = [
            "monthly_data_{$month}",
            "monthly_stats_{$month}",
            "meals_data_{$month}",
            "meals_stats_{$month}",
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }
}
