<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMealPermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        // Allow if user has specific permission
        if ($user && $user->can($permission)) {
            return $next($request);
        }

        // Check role-based permissions
        if ($user) {
            $userRoles = $user->roles->pluck('name')->toArray();
            
            // Admins and Meal Managers can manage everything
            if (in_array('Admin', $userRoles) || in_array('Meal Manager', $userRoles)) {
                return $next($request);
            }
            
            // Members can only view
            if (in_array('Member', $userRoles) && str_contains($permission, 'view')) {
                return $next($request);
            }
        }

        abort(403, 'Insufficient permissions to access this resource.');
    }
}
