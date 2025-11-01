import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
                    <DialogDescription>Use these shortcuts to navigate and perform actions quickly</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    {shortcuts.map((shortcut, index) => (
                        <div
                            key={index}
                            className="bg-muted/50 hover:bg-muted flex items-center justify-between rounded-lg px-3 py-2 transition-colors"
                        >
                            <span className="text-foreground text-sm">{shortcut.description}</span>
                            <kbd className="bg-background text-muted-foreground pointer-events-none inline-flex h-7 items-center gap-1 rounded border px-2 font-mono text-xs font-medium select-none">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
