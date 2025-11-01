import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

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
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center sm:p-12">
            {Icon && (
                <div className="bg-muted rounded-full p-6">
                    <Icon className="text-muted-foreground h-10 w-10" />
                </div>
            )}
            <div className="space-y-2">
                <h3 className="text-foreground text-lg font-semibold sm:text-xl">{title}</h3>
                {description && <p className="text-muted-foreground mx-auto max-w-md text-sm sm:text-base">{description}</p>}
            </div>
            {action && (
                <Button onClick={action.onClick} className="mt-4">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
