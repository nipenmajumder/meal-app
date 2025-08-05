import React from 'react';
import { usePage } from '@inertiajs/react';
import { Auth } from '@/types';

interface CanProps {
    permission?: string;
    role?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function Can({ permission, role, children, fallback = null }: CanProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    
    if (!auth.user) {
        return <>{fallback}</>;
    }

    // Check if user is Admin (admins can do everything)
    const isAdmin = auth.user.roles?.some((r: any) => r.name === 'Admin') || false;
    if (isAdmin) {
        return <>{children}</>;
    }

    // Check permission
    if (permission) {
        const hasPermission = auth.user.permissions?.some((p: any) => p.name === permission) || false;
        if (!hasPermission) {
            return <>{fallback}</>;
        }
    }

    // Check role
    if (role) {
        const hasRole = auth.user.roles?.some((r: any) => r.name === role) || false;
        if (!hasRole) {
            return <>{fallback}</>;
        }
    }

    return <>{children}</>;
}

export default Can;