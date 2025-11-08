export type TerminalStatus = 'waiting' | 'processing' | 'success' | 'failed' | 'cancelled';

export interface TerminalPaymentResult {
    status: 'success' | 'failed';
    transactionId?: string;
    message: string;
}

/**
 * Simulates calling a backend to create a payment intent.
 * In a real app, this would make a fetch call to your server.
 */
export const createPaymentIntent = async (amount: number, currency: string): Promise<{ clientSecret: string }> => {
    console.log(`[PaymentService] Creating payment intent for ${amount} ${currency}`);
    // This simulates a POST request to `/api/payments/create-intent`
    await new Promise(res => setTimeout(res, 300)); // Simulate network latency
    return {
        clientSecret: `pi_${Date.now()}_secret_${Math.random()}`
    };
};


/**
 * Simulates the entire process of taking a payment with a physical terminal
 * using a frontend SDK (like Stripe Terminal JS).
 */
export const processTerminalPayment = (
    amount: number,
    onStatusChange: (status: TerminalStatus, message: string) => void
): Promise<TerminalPaymentResult> => {
    return new Promise((resolve, reject) => {
        let cancelled = false;
        
        const cancel = () => {
            cancelled = true;
            onStatusChange('cancelled', 'Payment cancelled by user.');
            reject({ status: 'failed', message: 'Payment cancelled.' });
        };
        
        (async () => {
            try {
                // Step 1: Frontend asks backend to create an intent
                onStatusChange('processing', 'Initializing terminal...');
                await createPaymentIntent(amount, 'USD');
                if (cancelled) return;

                // Step 2: Frontend SDK uses intent to get ready for payment
                await new Promise(res => setTimeout(res, 1000));
                if (cancelled) return;
                onStatusChange('waiting', 'Please tap, swipe, or insert card.');

                // Step 3: Simulate waiting for customer interaction
                await new Promise(res => setTimeout(res, 3000));
                if (cancelled) return;
                onStatusChange('processing', 'Processing payment...');
                
                // Step 4: Simulate processing and getting a result
                await new Promise(res => setTimeout(res, 2000));
                if (cancelled) return;

                // Randomly succeed or fail for demo purposes
                if (Math.random() > 0.1) { // 90% success rate
                    onStatusChange('success', 'Payment Approved');
                    resolve({
                        status: 'success',
                        transactionId: `txn_${Date.now()}`,
                        message: 'Payment Approved'
                    });
                } else {
                    onStatusChange('failed', 'Payment Declined. Please try another card.');
                    reject({ status: 'failed', message: 'Payment Declined.' });
                }

            } catch (error) {
                if (!cancelled) {
                    onStatusChange('failed', 'A connection error occurred.');
                    reject({ status: 'failed', message: 'Connection error.' });
                }
            }
        })();
        
        // Expose a way to cancel. In a real app, this might be part of a returned object.
        // For this simulation, the modal will just call its own `onClose` which will cause this promise to reject.
    });
};
