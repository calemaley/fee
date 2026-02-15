'use client';

import { usePaystackPayment } from "react-paystack";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CreditCard, Loader2 } from "lucide-react";

interface PaystackTriggerProps {
  amount: number;
  email: string;
  onSuccess: (reference: any) => void;
  onClose: () => void;
  isProcessing: boolean;
  balance: number;
}

export default function PaystackTrigger({ 
  amount, 
  email, 
  onSuccess, 
  onClose, 
  isProcessing, 
  balance 
}: PaystackTriggerProps) {
  // Config is generated inside the client-only component to avoid SSR issues
  const config = {
    reference: (new Date()).getTime().toString(),
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo/cents
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    currency: "KES",
  };

  const initializePayment = usePaystackPayment(config);

  return (
    <div className="flex flex-col gap-4">
      <Button 
        onClick={() => {
          if (balance > 0) {
            initializePayment({ onSuccess, onClose });
          }
        }} 
        className="w-full bg-white text-slate-900 hover:bg-slate-50 h-14 md:h-16 text-lg md:text-xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50" 
        disabled={isProcessing || balance <= 0}
      >
        {isProcessing ? (
          <div className="flex items-center gap-3"><Loader2 className="animate-spin h-5 w-5" /> Syncing...</div>
        ) : balance <= 0 ? (
          <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-green-500" /> Account Fully Settled</div>
        ) : "Settle Balance Securely"}
      </Button>
      <p className="text-[9px] text-center opacity-40 flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em]">
        <CreditCard className="h-3 w-3" /> Encrypted via Paystack
      </p>
    </div>
  );
}