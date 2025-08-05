<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Deposit;
use App\Models\Meal;
use App\Models\ShoppingExpense;
use App\Models\User;
use Carbon\CarbonImmutable;

final class DashboardService
{
    public function getTotalMeal($startDate = null, $endDate = null): float
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();
        
        return (float) Meal::query()
            ->whereBetween('date', [$start, $end])
            ->sum('meal_count');
    }

    public function getTotalShoppingExpense($startDate = null, $endDate = null): float
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();
        
        return (float) ShoppingExpense::query()
            ->whereBetween('date', [$start, $end])
            ->sum('amount');
    }

    public function getTotalDeposit($startDate = null, $endDate = null): float
    {
        $start = $startDate ?? now()->startOfMonth();
        $end = $endDate ?? now()->endOfMonth();
        
        return (float) Deposit::query()
            ->whereBetween('date', [$start, $end])
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
        
        return User::query()
            ->active()
            ->withSum(['meals as total_meal' => function ($query) use ($start, $end) {
                $query->whereBetween('date', [$start, $end]);
            }], 'meal_count')
            ->withSum(['deposits as total_deposit' => function ($query) use ($start, $end) {
                $query->whereBetween('date', [$start, $end]);
            }], 'amount')
            ->get()
            ->map(fn ($user) => $this->formatUserData($user, $mealRate))
            ->toArray();
    }

    private function formatUserData($user, float $mealRate): array
    {
        $totalMeal = (float) ($user->total_meal ?? 0);
        $totalDeposit = (float) ($user->total_deposit ?? 0);
        $totalCost = round($totalMeal * $mealRate, 2);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'total_meal' => $totalMeal,
            'meal_rate' => number_format($mealRate, 2, '.', ''),
            'total_cost' => number_format($totalCost, 2, '.', ''),
            'total_deposit' => number_format($totalDeposit, 2, '.', ''),
            'balance' => number_format(($totalDeposit - $totalCost), 2, '.', ''),
        ];
    }
}
