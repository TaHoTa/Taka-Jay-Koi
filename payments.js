// Payment module — kept separate so the official gateway can replace the manual flow later
// without touching the rest of the app.
//
// NOW  ("manual-bkash"): user sends ৳ by bKash → enters TrxID → you approve in admin.html → Pro unlocks.
// LATER ("gateway"):     implement startGateway() to redirect to bKash/aggregator checkout.
//                        A Supabase Edge Function verifies the payment
//                        callback and sets profiles.pro = true. The app already reacts to that live.

import { PAYMENT_METHOD } from './config.js';
import { store } from './store.js';

export const payments = {
  method: PAYMENT_METHOD,
  isManual: () => PAYMENT_METHOD === 'manual-bkash',
  submitManual: ({ trxId, sender }) => store.submitPayment({ trxId, sender }),
  async startGateway() {
    throw new Error('gateway-not-configured');
  },
};

// bKash TrxIDs are 10 characters, letters + digits (e.g. BK7A9X2QPL). Accept 8–12 to be safe.
export const validTrxId = s => /^[A-Z0-9]{8,12}$/.test((s || '').trim().toUpperCase());
