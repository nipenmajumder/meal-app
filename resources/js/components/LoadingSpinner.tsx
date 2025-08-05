import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({ 
    size = 'md', 
    text = 'Loading...', 
    className = '',
    fullScreen = false 
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const content = (
        <div className={cn(
            'flex flex-col items-center justify-center space-y-2',
            fullScreen && 'min-h-[50vh]',
            className
        )}>
            <Loader2 className={cn(sizeClasses[size], 'animate-spin text-muted-foreground')} />
            {text && (
                <p className={cn(textSizeClasses[size], 'text-muted-foreground')}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}

// Table loading skeleton
export function TableLoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div 
                            key={colIndex} 
                            className="h-4 bg-muted rounded animate-pulse flex-1" 
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Card loading skeleton
export function CardLoadingSkeleton() {
    return (
        <div className="space-y-3 p-4 border rounded-lg">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
            <div className="h-3 bg-muted rounded animate-pulse w-full" />
        </div>
    );
}
