<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreMealRequest;
use App\Http\Requests\UpdateMealRequest;
use App\Models\Meal;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MealController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->query('month', now()->format('Y-m'));
        
        // Cache the data for better performance
        $cacheKey = "meals_data_{$month}";
        $statsCacheKey = "meals_stats_{$month}";
        
        $data = Cache::remember($cacheKey, 3600, function () use ($month) {
            return $this->transformMealData($month);
        });
        
        $monthlyStats = Cache::remember($statsCacheKey, 3600, function () use ($month) {
            return $this->getMonthlyStats($month);
        });
        
        $users = User::all();
        $userNames = $users->pluck('name')->toArray();
        
        return Inertia::render('meals/Index', [
            'data' => $data,
            'userNames' => $userNames,
            'users' => $users,
            'currentMonth' => $month,
            'monthlyStats' => $monthlyStats,
        ]);
    }

    public function store(StoreMealRequest $request): RedirectResponse
    {
        Meal::create($request->validated());
        
        // Clear cache for the month
        $month = Carbon::parse($request->date)->format('Y-m');
        Cache::forget("meals_data_{$month}");
        Cache::forget("meals_stats_{$month}");
        
        return redirect()->back()->with('success', 'Meal record created successfully.');
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'meals' => 'required|array',
            'meals.*' => 'nullable|numeric|min:0|max:10',
        ]);

        $date = $request->date;
        $meals = $request->meals;

        foreach ($meals as $userId => $mealCount) {
            if (!empty($mealCount) && $mealCount > 0) {
                Meal::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'date' => $date,
                    ],
                    [
                        'meal_count' => $mealCount,
                    ]
                );
            }
        }

        // Clear cache for the month
        $month = Carbon::parse($date)->format('Y-m');
        Cache::forget("meals_data_{$month}");
        Cache::forget("meals_stats_{$month}");

        return redirect()->back()->with('success', 'Bulk meal records created successfully.');
    }

    public function update(UpdateMealRequest $request, Meal $meal): RedirectResponse
    {
        $meal->update($request->validated());
        
        // Clear cache for the month
        $month = Carbon::parse($request->date)->format('Y-m');
        Cache::forget("meals_data_{$month}");
        Cache::forget("meals_stats_{$month}");
        
        return redirect()->back()->with('success', 'Meal record updated successfully.');
    }

    public function destroy(Meal $meal): RedirectResponse
    {
        $month = $meal->date->format('Y-m');
        $meal->delete();
        
        // Clear cache for the month
        Cache::forget("meals_data_{$month}");
        Cache::forget("meals_stats_{$month}");
        
        return redirect()->back()->with('success', 'Meal record deleted successfully.');
    }

    public function export(Request $request): StreamedResponse
    {
        $month = $request->query('month', now()->format('Y-m'));
        $data = $this->transformMealData($month);
        $users = User::all();
        
        $filename = "meals_{$month}.csv";
        
        return response()->streamDownload(function () use ($data, $users) {
            $handle = fopen('php://output', 'w');
            
            // Header row
            $headers = ['Date'];
            foreach ($users as $user) {
                $headers[] = $user->name;
            }
            $headers[] = 'Total';
            fputcsv($handle, $headers);
            
            // Data rows
            foreach ($data as $row) {
                $csvRow = [$row['date']];
                $rowTotal = 0;
                
                foreach ($users as $user) {
                    $value = $row[$user->name] ?? 0;
                    $csvRow[] = $value;
                    $rowTotal += (float) $value;
                }
                $csvRow[] = $rowTotal;
                
                fputcsv($handle, $csvRow);
            }
            
            fclose($handle);
        }, $filename);
    }

    private function transformMealData(string $month): array
    {
        $startDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endDate = Carbon::createFromFormat('Y-m', $month)->endOfMonth();
        
        // Get all users
        $users = User::all();
        
        // Get all meals for the month
        $meals = Meal::with('user')
            ->whereBetween('date', [$startDate, $endDate])
            ->get()
            ->groupBy('date');
        
        $data = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('d-m-Y');
            $row = ['date' => $dateString];
            
            $dayMeals = $meals->get($currentDate->format('Y-m-d'), collect());
            
            foreach ($users as $user) {
                $userMeal = $dayMeals->where('user_id', $user->id)->first();
                $row[$user->name] = $userMeal ? $userMeal->meal_count : 0;
            }
            
            $data[] = $row;
            $currentDate->addDay();
        }
        
        return $data;
    }

    private function getMonthlyStats(string $month): array
    {
        $startDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $endDate = Carbon::createFromFormat('Y-m', $month)->endOfMonth();
        
        $totalMeals = Meal::whereBetween('date', [$startDate, $endDate])
            ->sum('meal_count');
        
        $mealCount = Meal::whereBetween('date', [$startDate, $endDate])
            ->count();
        
        $activeUsers = Meal::whereBetween('date', [$startDate, $endDate])
            ->distinct('user_id')
            ->count();
        
        return [
            'totalMeals' => number_format($totalMeals, 1),
            'mealCount' => $mealCount,
            'activeUsers' => $activeUsers,
        ];
    }
}
