import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface Shortcut {
    keys: string;
    description: string;
}

interface KeyboardShortcutsHelpProps {
    shortcuts: Shortcut[];
}

export function KeyboardShortcutsHelp({ shortcuts }: KeyboardShortcutsHelpProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Keyboard Shortcuts">
                    <Keyboard className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                    <DialogDescription>
                        Use these shortcuts to navigate and perform actions quickly
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <span className="text-sm text-foreground">{shortcut.description}</span>
                            <kbd className="pointer-events-none inline-flex h-7 select-none items-center gap-1 rounded border bg-background px-2 font-mono text-xs font-medium text-muted-foreground">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
