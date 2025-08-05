import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    error?: string | Record<string, string[]>;
    title?: string;
    showRetry?: boolean;
    onRetry?: () => void;
    onDismiss?: () => void;
    className?: string;
}

export default function ErrorBoundary({ 
    error, 
    title = 'Something went wrong',
    showRetry = false,
    onRetry,
    onDismiss,
    className = ''
}: ErrorBoundaryProps) {
    if (!error) return null;

    const renderError = () => {
        if (typeof error === 'string') {
            return <p>{error}</p>;
        }

        if (typeof error === 'object') {
            return (
                <div className="space-y-2">
                    {Object.entries(error).map(([field, messages]) => (
                        <div key={field}>
                            <p className="font-medium text-sm capitalize">{field.replace('_', ' ')}:</p>
                            <ul className="list-disc list-inside text-sm ml-2">
                                {Array.isArray(messages) 
                                    ? messages.map((message, index) => (
                                        <li key={index}>{message}</li>
                                    ))
                                    : <li>{messages}</li>
                                }
                            </ul>
                        </div>
                    ))}
                </div>
            );
        }

        return <p>An unexpected error occurred</p>;
    };

    return (
        <Alert variant="destructive" className={className}>
            <AlertTriangle className="h-4 w-4" />
            <div className="flex-1">
                <AlertTitle className="flex items-center justify-between">
                    {title}
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDismiss}
                            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </AlertTitle>
                <AlertDescription className="mt-2">
                    {renderError()}
                    {showRetry && onRetry && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRetry}
                            className="mt-3 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                        >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Try Again
                        </Button>
                    )}
                </AlertDescription>
            </div>
        </Alert>
    );
}
