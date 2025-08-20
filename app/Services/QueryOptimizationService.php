<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Deposit;
use App\Models\Meal;
use App\Models\ShoppingExpense;
use App\Models\User;
use App\Models\Utility;
use Illuminate\Support\Facades\DB;

final class QueryOptimizationService
{
    /**
     * Get all monthly aggregated data in a single optimized query
     */
    public function getMonthlyAggregatedData($startDate, $endDate): array
    {
        // Using raw queries for maximum performance when dealing with large datasets
        $results = DB::select("
            SELECT 
                'meals' as type,
                SUM(meal_count) as total_amount,
                COUNT(*) as record_count,
                COUNT(DISTINCT user_id) as active_users
            FROM meals 
            WHERE date BETWEEN ? AND ?
            
            UNION ALL
            
            SELECT 
                'deposits' as type,
                SUM(amount) as total_amount,
                COUNT(*) as record_count,
                COUNT(DISTINCT user_id) as active_users
            FROM deposits 
            WHERE date BETWEEN ? AND ?
            
            UNION ALL
            
            SELECT 
                'shopping_expenses' as type,
                SUM(amount) as total_amount,
                COUNT(*) as record_count,
                COUNT(DISTINCT user_id) as active_users
            FROM shopping_expenses 
            WHERE date BETWEEN ? AND ?
            
            UNION ALL
            
            SELECT 
                'utilities' as type,
                SUM(amount) as total_amount,
                COUNT(*) as record_count,
                COUNT(DISTINCT user_id) as active_users
            FROM utilities 
            WHERE date BETWEEN ? AND ?
        ", [
            $startDate, $endDate,  // meals
            $startDate, $endDate,  // deposits
            $startDate, $endDate,  // shopping_expenses
            $startDate, $endDate,  // utilities
        ]);

        $data = [];
        foreach ($results as $result) {
            $data[$result->type] = [
                'total_amount' => (float) $result->total_amount,
                'record_count' => (int) $result->record_count,
                'active_users' => (int) $result->active_users,
            ];
        }

        return $data;
    }

    /**
     * Get user statistics for a date range using a single optimized query
     */
    public function getUserStatisticsForDateRange($startDate, $endDate): array
    {
        return User::query()
            ->active()
            ->select([
                'users.id',
                'users.name',
                DB::raw('COALESCE(meal_totals.total_meals, 0) as total_meals'),
                DB::raw('COALESCE(deposit_totals.total_deposits, 0) as total_deposits'),
                DB::raw('COALESCE(expense_totals.total_expenses, 0) as total_expenses'),
                DB::raw('COALESCE(utility_totals.total_utilities, 0) as total_utilities'),
            ])
            ->leftJoin(
                DB::raw("(
                    SELECT user_id, SUM(meal_count) as total_meals 
                    FROM meals 
                    WHERE date BETWEEN '{$startDate}' AND '{$endDate}' 
                    GROUP BY user_id
                ) as meal_totals"),
                'users.id', '=', 'meal_totals.user_id'
            )
            ->leftJoin(
                DB::raw("(
                    SELECT user_id, SUM(amount) as total_deposits 
                    FROM deposits 
                    WHERE date BETWEEN '{$startDate}' AND '{$endDate}' 
                    GROUP BY user_id
                ) as deposit_totals"),
                'users.id', '=', 'deposit_totals.user_id'
            )
            ->leftJoin(
                DB::raw("(
                    SELECT user_id, SUM(amount) as total_expenses 
                    FROM shopping_expenses 
                    WHERE date BETWEEN '{$startDate}' AND '{$endDate}' 
                    GROUP BY user_id
                ) as expense_totals"),
                'users.id', '=', 'expense_totals.user_id'
            )
            ->leftJoin(
                DB::raw("(
                    SELECT user_id, SUM(amount) as total_utilities 
                    FROM utilities 
                    WHERE date BETWEEN '{$startDate}' AND '{$endDate}' 
                    GROUP BY user_id
                ) as utility_totals"),
                'users.id', '=', 'utility_totals.user_id'
            )
            ->orderBy('users.name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'total_meals' => (float) $user->total_meals,
                    'total_deposits' => (float) $user->total_deposits,
                    'total_expenses' => (float) $user->total_expenses,
                    'total_utilities' => (float) $user->total_utilities,
                ];
            })
            ->toArray();
    }

    /**
     * Bulk insert meals with optimized performance
     */
    public function bulkInsertMeals(array $mealData): void
    {
        if (empty($mealData)) {
            return;
        }

        // Prepare data for bulk insert with upsert capability
        $chunks = array_chunk($mealData, 500); // Process in chunks of 500

        foreach ($chunks as $chunk) {
            $values = [];
            $bindings = [];

            foreach ($chunk as $meal) {
                $values[] = '(?, ?, ?, NOW(), NOW())';
                $bindings[] = $meal['user_id'];
                $bindings[] = $meal['date'];
                $bindings[] = $meal['meal_count'];
            }

            $sql = "
                INSERT INTO meals (user_id, date, meal_count, created_at, updated_at) 
                VALUES " . implode(', ', $values) . "
                ON DUPLICATE KEY UPDATE 
                    meal_count = VALUES(meal_count),
                    updated_at = NOW()
            ";

            DB::statement($sql, $bindings);
        }
    }

    /**
     * Get monthly data for table display with optimized queries
     */
    public function getMonthlyTableData($startDate, $endDate, string $type): array
    {
        $modelClass = match ($type) {
            'meals' => Meal::class,
            'deposits' => Deposit::class,
            'shopping_expenses' => ShoppingExpense::class,
            'utilities' => Utility::class,
            default => throw new \InvalidArgumentException("Invalid type: {$type}"),
        };

        $column = $type === 'meals' ? 'meal_count' : 'amount';

        // Get users once
        $users = User::active()->select('id', 'name')->orderBy('name')->get();

        // Get data for the month
        $data = $modelClass::select('user_id', 'date', $column)
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->groupBy(function ($item) {
                return $item->date->format('Y-m-d');
            });

        // Generate date range
        $dates = [];
        $current = clone $startDate;
        while ($current <= $endDate) {
            $dates[] = $current->format('Y-m-d');
            $current->modify('+1 day');
        }

        // Build table data
        $tableData = [];
        foreach ($dates as $date) {
            $row = ['date' => \Carbon\Carbon::createFromFormat('Y-m-d', $date)->format('d-M-Y')];
            
            $dayData = $data->get($date, collect());
            
            foreach ($users as $user) {
                $userRecord = $dayData->where('user_id', $user->id)->first();
                $row[$user->name] = $userRecord ? $userRecord->$column : 0;
            }
            
            $tableData[] = $row;
        }

        return [
            'data' => $tableData,
            'userNames' => $users->pluck('name')->toArray(),
        ];
    }
}
