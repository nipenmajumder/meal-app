import { usePage } from '@inertiajs/react';
import { Auth } from '@/types';

export function usePermissions() {
    const { auth } = usePage<{ auth: Auth }>().props;
    
    const hasPermission = (permission: string): boolean => {
        if (!auth.user) return false;
        
        // Check if user has specific permission
        const hasDirectPermission = auth.user.permissions?.some(p => p.name === permission) || false;
        if (hasDirectPermission) return true;
        
        // Check if user has admin role (admins can do everything)
        const isAdmin = auth.user.roles?.some(r => r.name === 'Admin') || false;
        if (isAdmin) return true;
        
        return false;
    };
    
    const hasRole = (role: string): boolean => {
        if (!auth.user) return false;
        return auth.user.roles?.some(r => r.name === role) || false;
    };
    
    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };
    
    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some(role => hasRole(role));
    };
    
    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAnyRole,
        user: auth.user,
        isAuthenticated: !!auth.user,
    };
}
