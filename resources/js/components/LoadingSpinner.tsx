import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', text = 'Loading...', className = '', fullScreen = false }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const content = (
        <div className={cn('flex flex-col items-center justify-center space-y-2', fullScreen && 'min-h-[50vh]', className)}>
            <Loader2 className={cn(sizeClasses[size], 'text-muted-foreground animate-spin')} />
            {text && <p className={cn(textSizeClasses[size], 'text-muted-foreground')}>{text}</p>}
        </div>
    );

    if (fullScreen) {
        return <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">{content}</div>;
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
                        <div key={colIndex} className="bg-muted h-4 flex-1 animate-pulse rounded" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Card loading skeleton
export function CardLoadingSkeleton() {
    return (
        <div className="space-y-3 rounded-lg border p-4">
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-6 w-1/2 animate-pulse rounded" />
            <div className="bg-muted h-3 w-full animate-pulse rounded" />
        </div>
    );
}
