<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, DashboardService $dashboardService)
    {
        // Get month from request or default to current month
        $monthParam = $request->query('month', now()->format('Y-m'));

        try {
            // Parse the month parameter (format: Y-m) and create start/end dates
            $start = \Carbon\Carbon::createFromFormat('Y-m-d', $monthParam.'-01')->startOfMonth();
            $end = $start->copy()->endOfMonth();
        } catch (Exception $e) {
            // If invalid month format, fall back to current month
            $start = now()->startOfMonth();
            $end = now()->endOfMonth();
            $monthParam = now()->format('Y-m');
        }

        $totalMeal = $dashboardService->getTotalMeal($start, $end);
        $totalDeposit = $dashboardService->getTotalDeposit($start, $end);
        $totalShoppingExpense = $dashboardService->getTotalShoppingExpense($start, $end);
        $balance = $totalDeposit - $totalShoppingExpense;
        $mealRate = $dashboardService->calculateMealRate($totalMeal, $totalShoppingExpense);

        return Inertia::render('dashboard/dashboard', [
            'users' => $dashboardService->getUsersData($mealRate, $start, $end),
            'statistics' => [
                'totalBalance' => $balance,
                'totalDeposits' => $totalDeposit,
                'totalMeals' => $totalMeal,
                'totalShoppingExpenses' => $totalShoppingExpense,
                'mealCost' => $totalMeal * $mealRate,
                'shoppingCost' => $totalShoppingExpense,
            ],
            'currentMonth' => $monthParam,
            'formattedMonth' => $start->format('F Y'),
        ]);
    }
}
