<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Deposit;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

final class DepositDataTransformer
{
    public function transform(CarbonInterface $start, CarbonInterface $end): array
    {
        $users = $this->getActiveUsers();
        $dates = $this->generateDateRange($start, $end);
        $depositMap = $this->createDepositMap($start, $end);

        return [
            'userNames' => $users->pluck('name')->toArray(),
            'data' => $this->buildDataTable($dates, $users, $depositMap),
        ];
    }

    /**
     * Retrieve only active users with selected columns.
     */
    private function getActiveUsers(): Collection
    {
        return User::active()->select('id', 'name')->get();
    }

    /**
     * Generate all dates between the start and end, inclusive.
     */
    private function generateDateRange(CarbonInterface $start, CarbonInterface $end): Collection
    {
        $dates = [];
        $current = $start->copy();
        while ($current <= $end) {
            $dates[] = $current->format('Y-m-d');
            $current->addDay();
        }
        
        return collect($dates);
    }

    /**
     * Create a map of deposits keyed by "Y-m-d-user_id".
     */
    private function createDepositMap(CarbonInterface $start, CarbonInterface $end): Collection
    {
        return Deposit::whereBetween('date', [$start, $end])
            ->select(['user_id', 'date', 'amount'])
            ->get()
            ->groupBy(fn ($deposit) => $deposit->date->format('Y-m-d').'-'.$deposit->user_id);
    }

    /**
     * Build the final structured array table with all dates and user deposit values.
     */
    private function buildDataTable(Collection $dates, Collection $users, Collection $depositMap): Collection
    {
        return $dates->map(function (string $date) use ($users, $depositMap) {
            $carbonDate = \Carbon\Carbon::createFromFormat('Y-m-d', $date);
            $row = ['date' => $carbonDate->format('d-l-M')];

            foreach ($users as $user) {
                $key = "{$date}-{$user->id}";
                $row[$user->name] = $depositMap->has($key)
                    ? $depositMap[$key]->first()->amount
                    : '';
            }

            return $row;
        });
    }
}
