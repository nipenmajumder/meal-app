<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

final class DepositBulkController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->path(), 'r');
        
        if (!$handle) {
            return back()->withErrors(['file' => 'Unable to read the uploaded file.']);
        }

        $headers = fgetcsv($handle);
        if (!$headers || !$this->validateHeaders($headers)) {
            fclose($handle);
            return back()->withErrors(['file' => 'Invalid CSV format. Expected headers: user_id, date, amount']);
        }

        $users = User::active()->pluck('id')->toArray();
        $imported = 0;
        $errors = [];
        $row = 1;

        DB::beginTransaction();
        
        try {
            while (($data = fgetcsv($handle)) !== false) {
                $row++;
                
                if (count($data) < 3) {
                    $errors[] = "Row {$row}: Insufficient data";
                    continue;
                }

                $validator = Validator::make([
                    'user_id' => $data[0],
                    'date' => $data[1],
                    'amount' => $data[2],
                ], [
                    'user_id' => 'required|integer|in:' . implode(',', $users),
                    'date' => 'required|date|before_or_equal:today',
                    'amount' => 'required|numeric|min:0|max:99999.99',
                ]);

                if ($validator->fails()) {
                    $errors[] = "Row {$row}: " . implode(', ', $validator->errors()->all());
                    continue;
                }

                Deposit::updateOrCreate(
                    [
                        'user_id' => $data[0],
                        'date' => $data[1],
                    ],
                    ['amount' => $data[2]]
                );

                $imported++;
                
                // Clear cache for the month
                $monthKey = now()->parse($data[1])->format('Y-m');
                Cache::forget("deposits.monthly.{$monthKey}");
            }

            DB::commit();
            fclose($handle);

            $message = "Successfully imported {$imported} deposits.";
            if (!empty($errors)) {
                $message .= ' ' . count($errors) . ' errors occurred.';
            }

            return back()->with('success', $message)->with('import_errors', $errors);
            
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return back()->withErrors(['file' => 'An error occurred during import: ' . $e->getMessage()]);
        }
    }

    public function template()
    {
        $users = User::active()->select('id', 'name')->get();
        
        $csv = "user_id,date,amount\n";
        foreach ($users as $user) {
            $csv .= "{$user->id}," . now()->format('Y-m-d') . ",0.00\n";
        }

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="deposit_template.csv"');
    }

    private function validateHeaders(array $headers): bool
    {
        $expectedHeaders = ['user_id', 'date', 'amount'];
        return array_slice($headers, 0, 3) === $expectedHeaders;
    }
}
