import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import { LucideIcon } from 'lucide-react';

interface PermissionButtonProps {
    permission: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    onClick?: () => void;
    disabled?: boolean;
    icon?: LucideIcon;
}

export function PermissionButton({ 
    permission, 
    children, 
    className = '',
    variant = 'default',
    size = 'default',
    onClick,
    disabled = false,
    icon: Icon,
    ...props 
}: PermissionButtonProps) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(permission)) {
        return null;
    }
    
    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {children}
        </Button>
    );
}

interface PermissionSectionProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function PermissionSection({ permission, children, fallback = null }: PermissionSectionProps) {
    const { hasPermission } = usePermissions();
    
    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }
    
    return <>{children}</>;
}
