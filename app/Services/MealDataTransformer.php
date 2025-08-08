<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Meal;
use App\Models\User;
use Carbon\Carbon;

final class MealDataTransformer
{
    public function transformMonthlyData(string $month): array
    {
        $startDate = Carbon::createFromFormat('Y-m-d', $month.'-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $users = User::active()->orderBy('name')->get();
        $userIds = $users->pluck('id')->toArray();

        // Get all meals for the month in one query
        $meals = Meal::with('user')
            ->forDateRange($startDate, $endDate)
            ->get()
            ->groupBy('date');

        // Generate all dates in the month
        $dates = collect();
        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dates->push($date->format('Y-m-d'));
        }

        // Transform data for each date
        $transformedData = $dates->map(function ($date) use ($meals, $users) {
            $row = ['date' => $date];

            // Get meals for this date
            $dayMeals = $meals->get($date, collect());
            $mealsByUser = $dayMeals->keyBy('user_id');

            // Add meal count for each user
            foreach ($users as $user) {
                $meal = $mealsByUser->get($user->id);
                $row[$user->name] = $meal ? (float) $meal->meal_count : 0;
            }

            // Calculate total for the day
            $row['total'] = array_sum(array_filter($row, 'is_numeric'));

            return $row;
        });

        return $transformedData->toArray();
    }

    public function getUserMonthlyTotals(string $month): array
    {
        $startDate = Carbon::createFromFormat('Y-m-d', $month.'-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        return User::active()
            ->withSum(['meals as total_meal' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('meals.date', [$startDate, $endDate]);
            }], 'meal_count')
            ->withSum(['deposits as total_deposit' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('deposits.date', [$startDate, $endDate]);
            }], 'amount')
            ->withSum(['utilities as total_utility' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('utilities.date', [$startDate, $endDate]);
            }], 'amount')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'total_meals' => (float) ($user->total_meal ?? 0),
                    'total_deposits' => (float) ($user->total_deposit ?? 0),
                    'total_utilities' => (float) ($user->total_utility ?? 0),
                ];
            })
            ->toArray();
    }
}
