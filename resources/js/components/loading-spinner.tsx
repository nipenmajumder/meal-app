import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2" role="status" aria-live="polite">
            <Loader2 className={cn('text-primary animate-spin', sizeClasses[size], className)} />
            {text && (
                <p className="text-muted-foreground text-sm" aria-label="Loading message">
                    {text}
                </p>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
}
