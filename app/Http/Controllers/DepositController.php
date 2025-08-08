<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreDepositRequest;
use App\Http\Requests\UpdateDepositRequest;
use App\Models\Deposit;
use App\Models\User;
use App\Services\DepositDataTransformer;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

final class DepositController extends Controller
{
    public function __construct(
        private readonly DepositDataTransformer $depositDataTransformer
    ) {}

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
            "deposits.monthly.{$start->format('Y-m')}",
            now()->addHours(1),
            fn () => $this->depositDataTransformer->transform($start, $end)
        );

        $users = User::active()->select('id', 'name')->get();

        return inertia('deposits/Index', [
            ...$data,
            'users' => $users,
            'currentMonth' => $start->format('Y-m'),
            'monthlyStats' => $this->getMonthlyStats($start, $end),
        ]);
    }

    public function store(StoreDepositRequest $request)
    {
        $validated = $request->validated();

        $deposit = Deposit::updateOrCreate(
            [
                'user_id' => $validated['user_id'],
                'date' => $validated['date'],
            ],
            ['amount' => $validated['amount']]
        );

        // Clear cache for the month
        $monthKey = now()->parse($validated['date'])->format('Y-m');
        Cache::forget("deposits.monthly.{$monthKey}");

        return back()->with('success', 'Deposit saved successfully.');
    }

    public function update(UpdateDepositRequest $request, Deposit $deposit)
    {
        $validated = $request->validated();

        $deposit->update($validated);

        // Clear cache for the month
        $monthKey = $deposit->date->format('Y-m');
        Cache::forget("deposits.monthly.{$monthKey}");

        return back()->with('success', 'Deposit updated successfully.');
    }

    public function destroy(Deposit $deposit)
    {
        $this->authorize('delete deposits');
        
        $monthKey = $deposit->date->format('Y-m');
        $deposit->delete();

        // Clear cache for the month
        Cache::forget("deposits.monthly.{$monthKey}");

        return back()->with('success', 'Deposit deleted successfully.');
    }

    public function export(Request $request)
    {
        $this->authorize('export deposits');
        
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

        $deposits = Deposit::with('user')
            ->whereBetween('date', [$start, $end])
            ->orderBy('date')
            ->orderBy('user_id')
            ->get();

        $csv = "Date,User,Amount\n";
        foreach ($deposits as $deposit) {
            $csv .= sprintf(
                "%s,%s,%.2f\n",
                $deposit->date->format('Y-m-d'),
                $deposit->user->name,
                $deposit->amount
            );
        }

        $filename = "deposits_{$start->format('Y-m')}.csv";

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    private function getMonthlyStats($start, $end)
    {
        $totalDeposits = (float) Deposit::whereBetween('date', [$start, $end])->sum('amount');
        $depositCount = Deposit::whereBetween('date', [$start, $end])->count();
        $activeUsers = Deposit::whereBetween('date', [$start, $end])
            ->distinct('user_id')
            ->count('user_id');

        return [
            'totalAmount' => number_format($totalDeposits, 2),
            'depositCount' => $depositCount,
            'activeUsers' => $activeUsers,
        ];
    }
}
