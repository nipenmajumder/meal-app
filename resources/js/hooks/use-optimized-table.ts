import { useMemo } from 'react';

/**
 * Hook to optimize table calculations with memoization
 */
export function useOptimizedTableCalculations<T extends Record<string, unknown>>(data: T[], userNames: string[]) {
    const calculateRowTotal = useMemo(
        () => (row: T) => {
            return userNames.reduce((sum, name) => {
                const value = Number(row[name]) || 0;
                return sum + value;
            }, 0);
        },
        [userNames],
    );

    const calculateColumnTotal = useMemo(
        () => (userName: string) => {
            return data.reduce((sum, row) => {
                const value = Number(row[userName]) || 0;
                return sum + value;
            }, 0);
        },
        [data],
    );

    const calculateGrandTotal = useMemo(() => {
        return data.reduce((sum, row) => {
            return (
                sum +
                userNames.reduce((rowSum, name) => {
                    const value = Number(row[name]) || 0;
                    return rowSum + value;
                }, 0)
            );
        }, 0);
    }, [data, userNames]);

    return {
        calculateRowTotal,
        calculateColumnTotal,
        calculateGrandTotal,
    };
}
