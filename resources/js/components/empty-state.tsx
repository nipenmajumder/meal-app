import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 min-h-[400px]">
            {Icon && (
                <div className="rounded-full bg-muted p-6">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
            )}
            <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h3>
                {description && (
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <Button onClick={action.onClick} className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
