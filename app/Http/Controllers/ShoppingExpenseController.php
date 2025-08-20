<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreShoppingExpenseRequest;
use App\Http\Requests\UpdateShoppingExpenseRequest;
use App\Models\ShoppingExpense;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

final class ShoppingExpenseController extends Controller
{
    public function index(Request $request)
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

        $data = Cache::remember(
            "shopping_expenses.monthly.{$start->format('Y-m')}",
            now()->addHours(1),
            fn () => $this->transformExpenseData($start, $end)
        );

        $users = User::active()->select('id', 'name')->get();

        return inertia('shopping-expenses/Index', [
            ...$data,
            'users' => $users,
            'currentMonth' => $start->format('Y-m'),
            'monthlyStats' => $this->getMonthlyStats($start, $end),
        ]);
    }

    public function store(StoreShoppingExpenseRequest $request)
    {
        $validated = $request->validated();

        $expense = ShoppingExpense::updateOrCreate(
            [
                'user_id' => $validated['user_id'],
                'date' => $validated['date'],
            ],
            [
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? null,
            ]
        );

        // Clear cache for the month
        $monthKey = now()->parse($validated['date'])->format('Y-m');
        Cache::forget("shopping_expenses.monthly.{$monthKey}");

        return back()->with('success', 'Shopping expense saved successfully.');
    }

    public function update(UpdateShoppingExpenseRequest $request, ShoppingExpense $shoppingExpense)
    {
        $validated = $request->validated();

        $shoppingExpense->update($validated);

        // Clear cache for the month
        $monthKey = $shoppingExpense->date->format('Y-m');
        Cache::forget("shopping_expenses.monthly.{$monthKey}");

        return back()->with('success', 'Shopping expense updated successfully.');
    }

    public function destroy(ShoppingExpense $shoppingExpense)
    {
        $this->authorize('delete shopping expenses');
        
        $monthKey = $shoppingExpense->date->format('Y-m');
        $shoppingExpense->delete();

        // Clear cache for the month
        Cache::forget("shopping_expenses.monthly.{$monthKey}");

        return back()->with('success', 'Shopping expense deleted successfully.');
    }

    public function export(Request $request)
    {
        $this->authorize('export shopping expenses');
        
        // Get month from request or default to current month
        $monthParam = $request->query('month', now()->format('Y-m'));

        try {
            // Parse the month parameter (format: Y-m) and create start/end dates
            $start = \Carbon\Carbon::createFromFormat('Y-m-d', $monthParam.'-01')->startOfMonth();
            $end = $start->copy()->endOfMonth();
        } catch (Exception $e) {
            $start = now()->startOfMonth();
            $end = now()->endOfMonth();
        }

        // Optimized: Select only needed columns and eager load user name
        $expenses = ShoppingExpense::select('user_id', 'date', 'amount', 'description')
            ->with('user:id,name')
            ->whereBetween('date', [$start, $end])
            ->orderBy('date')
            ->orderBy('user_id')
            ->get();

        $csv = "Date,User,Amount,Description\n";
        foreach ($expenses as $expense) {
            $csv .= sprintf(
                "%s,%s,%.2f,%s\n",
                $expense->date->format('Y-m-d'),
                $expense->user->name,
                $expense->amount,
                $expense->description ?? ''
            );
        }

        $filename = "shopping_expenses_{$start->format('Y-m')}.csv";

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    private function transformExpenseData($start, $end)
    {
        // Optimized: Get expenses with only needed user data
        $expenses = ShoppingExpense::select('user_id', 'date', 'amount', 'description')
            ->with('user:id,name')
            ->whereBetween('date', [$start, $end])
            ->orderBy('date')
            ->get();

        $userNames = User::active()->pluck('name')->toArray();

        // Create date range for the month
        $dates = [];
        $current = $start->copy();
        while ($current <= $end) {
            $dates[] = $current->format('d-m-Y');
            $current->addDay();
        }

        // Transform data into table format
        $data = [];
        foreach ($dates as $date) {
            $row = ['date' => $date];

            foreach ($userNames as $userName) {
                $expense = $expenses->first(function ($expense) use ($date, $userName) {
                    return $expense->date->format('d-m-Y') === $date &&
                           $expense->user->name === $userName;
                });

                $row[$userName] = $expense ? $expense->amount : 0;
            }

            $data[] = $row;
        }

        return [
            'data' => $data,
            'userNames' => $userNames,
        ];
    }

    private function getMonthlyStats($start, $end)
    {
        // Optimized: Use selectRaw for better performance with aggregate functions
        $stats = ShoppingExpense::selectRaw('
            SUM(amount) as total_amount,
            COUNT(*) as expense_count,
            COUNT(DISTINCT user_id) as active_users
        ')
        ->whereBetween('date', [$start, $end])
        ->first();

        return [
            'totalAmount' => number_format((float) ($stats->total_amount ?? 0), 2),
            'expenseCount' => $stats->expense_count ?? 0,
            'activeUsers' => $stats->active_users ?? 0,
        ];
    }
}
