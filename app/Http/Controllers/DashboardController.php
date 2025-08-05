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

        $monthlyData = $dashboardService->getMonthlyData($start, $end);
        $monthlyStats = $dashboardService->getMonthlyStatistics($monthParam);

        return Inertia::render('dashboard/dashboard', [
            'users' => $monthlyData['users'],
            'statistics' => [
                'totalBalance' => $monthlyData['balance'],
                'totalDeposits' => $monthlyData['totalDeposits'],
                'totalMeals' => $monthlyData['totalMeals'],
                'totalShoppingExpenses' => $monthlyData['totalShoppingExpenses'],
                'totalUtilities' => $monthlyData['totalUtilities'],
                'mealCost' => $monthlyData['mealCost'],
                'mealRate' => $monthlyData['mealRate'],
                'shoppingCost' => $monthlyData['totalShoppingExpenses'],
            ],
            'monthlyStats' => $monthlyStats,
            'currentMonth' => $monthParam,
            'formattedMonth' => $start->format('F Y'),
        ]);
    }
}
