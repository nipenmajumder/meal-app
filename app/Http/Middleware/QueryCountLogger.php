<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class QueryCountLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (config('app.debug') && config('app.env') !== 'production') {
            $queryCount = 0;
            $totalTime = 0;
            $queries = [];

            DB::listen(function ($query) use (&$queryCount, &$totalTime, &$queries) {
                $queryCount++;
                $totalTime += $query->time;
                
                if ($query->time > 100) { // Log queries taking more than 100ms
                    $queries[] = [
                        'sql' => $query->sql,
                        'time' => $query->time,
                        'bindings' => $query->bindings,
                    ];
                }
            });

            $response = $next($request);

            // Log performance metrics
            if ($queryCount > 0) {
                $logData = [
                    'url' => $request->url(),
                    'method' => $request->method(),
                    'query_count' => $queryCount,
                    'total_time' => round($totalTime, 2) . 'ms',
                    'average_time' => round($totalTime / $queryCount, 2) . 'ms',
                ];

                if (!empty($queries)) {
                    $logData['slow_queries'] = $queries;
                }

                // Log to specific channel for performance monitoring
                Log::channel('performance')->info('Request Performance', $logData);

                // Add headers for development
                $response->headers->set('X-Query-Count', (string) $queryCount);
                $response->headers->set('X-Query-Time', $totalTime . 'ms');
            }

            return $response;
        }

        return $next($request);
    }
}
