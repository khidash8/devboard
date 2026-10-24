// app/dashboard/billing/cancel-button.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cancelSubscription } from './actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface CancelSubscriptionButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost';
    size?: 'default' | 'xs' | 'sm' | 'lg';
}

export function CancelSubscriptionButton({
    className,
    variant = 'outline',
    size = 'sm',
}: CancelSubscriptionButtonProps) {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const router = useRouter();

    async function handleCancel() {
        setIsLoading(true);
        setError(null);
        try {
            await cancelSubscription();
            setOpen(false);
            router.refresh();
        } catch (err: any) {
            setError(err?.message || 'Failed to cancel subscription. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={
                    <Button variant={variant} size={size} className={className}>
                        Cancel Subscription
                    </Button>
                }
            />
            <DialogContent className="sm:max-w-md bg-paper border border-border">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">Cancel Pro Subscription</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground pt-1">
                        Are you sure you want to cancel your DevBoard Pro subscription?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs text-muted-foreground">
                    <p>
                        Your plan will revert to the <strong>Free tier</strong>. Your existing projects will remain intact, but you won&apos;t be able to create new projects if you have 3 or more.
                    </p>
                    {error && (
                        <div className="p-2.5 text-xs rounded border border-attention/30 bg-attention/10 text-attention">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-end gap-2 pt-2">
                    <DialogClose
                        render={
                            <Button variant="outline" size="sm" disabled={isLoading}>
                                Keep Subscription
                            </Button>
                        }
                    />
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                Cancelling…
                            </>
                        ) : (
                            'Confirm Cancellation'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
