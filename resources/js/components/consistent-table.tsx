import React from 'react';
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
    TableBody,
    TableCell,
} from '@/components/ui/table';

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
        <div className="border-border relative overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="overflow-auto max-h-[70vh]">
                <Table className={`border-collapse ${className}`}>
                    {children}
                </Table>
            </div>
        </div>
    );
}

export function ScrollableTableContainer({ title, subtitle, children }: { title?: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="border-border relative min-h-[50vh] flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
            {(title || subtitle) && (
                <div className="p-4 border-b bg-muted/50">
                    {title && <h2 className="text-xl font-semibold text-center text-foreground">{title}</h2>}
                    {subtitle && <p className="text-sm text-center text-muted-foreground mt-1">{subtitle}</p>}
                </div>
            )}
                                {children}
                </Table>
            </div>
        </div>
    );
}
        </div>
    );
}

export function ConsistentTableHeader({ children, className = '' }: ConsistentTableHeaderProps) {
    return (
        <TableHeader className={`sticky top-0 z-20 ${className}`}>
            {children}
        </TableHeader>
    );
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
    
    return (
        <TableRow className={`${rowClasses} ${className}`}>
            {children}
        </TableRow>
    );
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
    
    return (
        <TableCell className={`${cellClasses} ${className}`}>
            {children}
        </TableCell>
    );
}

export function ConsistentTableHead({ children, className = '', isSticky = false }: { children: React.ReactNode; className?: string; isSticky?: boolean }) {
    let headClasses = 'text-center font-semibold text-foreground min-w-[120px] border-r border-border/50 bg-muted/80';
    
    if (isSticky) {
        headClasses += ' sticky left-0 z-30 min-w-[160px] border-r-2 border-border';
    }
    
    return (
        <TableHead className={`${headClasses} ${className}`}>
            {children}
        </TableHead>
    );
}

export function ScrollableTableContainer({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
    return (
        <div className="border-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min bg-card shadow-sm">
            {(title || subtitle) && (
                <div className="p-4 border-b bg-muted/50">
                    {title && <h2 className="text-xl font-semibold text-center text-foreground">{title}</h2>}
                    {subtitle && <p className="text-sm text-center text-muted-foreground mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="overflow-auto">
                <Table className="border-collapse">
                    {children}
                </Table>
            </div>
        </div>
    );
}
