import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';

interface ConsistentTableProps {
    children: React.ReactNode;
    className?: string;
}

interface ConsistentTableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface ConsistentTableRowProps {
    children: React.ReactNode;
    className?: string;
    isEvenRow?: boolean;
    isSummaryRow?: boolean;
}

interface ConsistentTableCellProps {
    children: React.ReactNode;
    className?: string;
    isSticky?: boolean;
    isHeader?: boolean;
}

export function ConsistentTable({ children, className = '' }: ConsistentTableProps) {
    return (
        <div className="border-border bg-card rounded-lg border shadow-sm">
            <Table className={`border-collapse ${className}`}>{children}</Table>
        </div>
    );
}

export function ScrollableTableContainer({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
    return (
        <div className="border-border bg-card relative flex-1 rounded-xl border shadow-sm">
            {(title || subtitle) && (
                <div className="bg-muted/50 border-b p-4">
                    {title && <h2 className="text-foreground text-center text-xl font-semibold">{title}</h2>}
                    {subtitle && <p className="text-muted-foreground mt-1 text-center text-sm">{subtitle}</p>}
                </div>
            )}
            <Table className="border-collapse">{children}</Table>
        </div>
    );
}

export function ConsistentTableHeader({ children, className = '' }: ConsistentTableHeaderProps) {
    return <TableHeader className={`sticky top-0 z-20 ${className}`}>{children}</TableHeader>;
}

export function ConsistentTableRow({ children, className = '', isEvenRow = false, isSummaryRow = false }: ConsistentTableRowProps) {
    let rowClasses = 'transition-colors border-b border-border';

    if (isSummaryRow) {
        rowClasses += ' bg-muted/50 border-t-2 border-primary/20 font-bold';
    } else if (isEvenRow) {
        rowClasses += ' bg-muted/20 hover:bg-muted/40';
    } else {
        rowClasses += ' bg-card hover:bg-muted/30';
    }

    return <TableRow className={`${rowClasses} ${className}`}>{children}</TableRow>;
}

export function ConsistentTableCell({ children, className = '', isSticky = false, isHeader = false }: ConsistentTableCellProps) {
    let cellClasses = 'text-center border-r border-border/50';

    if (isHeader) {
        cellClasses += ' bg-muted/80 font-semibold text-foreground min-w-[120px]';
        if (isSticky) {
            cellClasses += ' sticky left-0 z-30 min-w-[160px] border-r-2 border-border';
        }
    } else if (isSticky) {
        cellClasses += ' sticky left-0 z-10 bg-muted/30 font-medium text-foreground';
    } else {
        cellClasses += ' text-foreground';
    }

    return <TableCell className={`${cellClasses} ${className}`}>{children}</TableCell>;
}

export function ConsistentTableHead({
    children,
    className = '',
    isSticky = false,
}: {
    children: React.ReactNode;
    className?: string;
    isSticky?: boolean;
}) {
    let headClasses = 'text-center font-semibold text-foreground min-w-[120px] border-r border-border/50 bg-muted/80';

    if (isSticky) {
        headClasses += 'sticky left-0 z-30 min-w-[160px] border-r-2 border-border';
    }

    return <TableHead className={`${headClasses} ${className}`}>{children}</TableHead>;
}
