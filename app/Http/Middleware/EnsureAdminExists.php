<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;
use Spatie\Permission\Models\Role;

class EnsureAdminExists
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
