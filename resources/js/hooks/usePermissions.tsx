import React from 'react';
import { usePage } from '@inertiajs/react';
import type { User, PageProps } from '@/types';

/**
 * Custom hook to check user permissions
 */
export function usePermissions() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const permissions = user?.permissions || [];

    /**
     * Check if user has a specific permission
     */
    const can = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    /**
     * Check if user has any of the specified permissions
     */
    const canAny = (permissionList: string[]): boolean => {
        return permissionList.some(permission => permissions.includes(permission));
    };

    /**
     * Check if user has all of the specified permissions
     */
    const canAll = (permissionList: string[]): boolean => {
        return permissionList.every(permission => permissions.includes(permission));
    };

    /**
     * Get all user permissions
     */
    const getUserPermissions = (): string[] => {
        return permissions;
    };

    return {
        can,
        canAny,
        canAll,
        permissions: getUserPermissions(),
        user,
    };
}

/**
 * Higher-order component to wrap components with permission checking
 */
export function withPermission<T extends object>(
    WrappedComponent: React.ComponentType<T>,
    requiredPermission: string | string[],
    fallback?: React.ComponentType | null
) {
    return function PermissionWrapper(props: T) {
        const { can, canAny } = usePermissions();
        
        const hasPermission = Array.isArray(requiredPermission) 
            ? canAny(requiredPermission)
            : can(requiredPermission);

        if (!hasPermission) {
            return fallback ? React.createElement(fallback) : null;
        }

        return React.createElement(WrappedComponent, props);
    };
}

/**
 * Component to conditionally render children based on permissions
 */
interface PermissionGateProps {
    permission: string | string[];
    mode?: 'any' | 'all'; // For arrays: 'any' means user needs any permission, 'all' means user needs all permissions
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function PermissionGate({ 
    permission, 
    mode = 'any', 
    fallback = null, 
    children 
}: PermissionGateProps) {
    const { can, canAny, canAll } = usePermissions();
    
    let hasPermission = false;
    
    if (Array.isArray(permission)) {
        hasPermission = mode === 'all' ? canAll(permission) : canAny(permission);
    } else {
        hasPermission = can(permission);
    }

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}
