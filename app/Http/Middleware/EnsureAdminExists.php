<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\Response;

final class EnsureAdminExists
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if there are any users with Admin role
        $adminRole = Role::where('name', 'Admin')->first();

        if ($adminRole && $adminRole->users()->count() === 0) {
            // If no admin exists, make the first user an admin
            $firstUser = User::first();
            if ($firstUser) {
                $firstUser->assignRole('Admin');
            }
        }

        return $next($request);
    }
}
