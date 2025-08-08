<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Meal;
use App\Models\ShoppingExpense;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;

final class TestController extends Controller
{
    public function testScopes(): JsonResponse
    {
        try {
            $start = Carbon::now()->startOfMonth();
            $end = Carbon::now()->endOfMonth();

            // Test each model's scope
            $mealCount = Meal::query()->forDateRange($start, $end)->count();
            $depositCount = Deposit::query()->forDateRange($start, $end)->count();
            $expenseCount = ShoppingExpense::query()->forDateRange($start, $end)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'meal_count' => $mealCount,
                    'deposit_count' => $depositCount,
                    'expense_count' => $expenseCount,
                    'date_range' => [
                        'start' => $start->toDateString(),
                        'end' => $end->toDateString(),
                    ],
                ],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
}
