"use client"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-6">
      <div className="text-center space-y-6 relative">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full -z-10" />
        
        <div className="space-y-2">
          <p className="text-primary font-black text-xs uppercase tracking-[0.4em] animate-pulse">
            System Security Protocol
          </p>
          <h1 className="text-4xl font-black text-white tracking-tighter font-headline">Access Restricted</h1>
        </div>
        
        <div className="max-w-xs mx-auto space-y-4">
          <p className="text-white/40 text-sm leading-relaxed font-medium">
            This gateway is protected. Please use your institution-specific URL to access the ScholarlyPay portal. 
          </p>
          <div className="h-px w-12 bg-white/10 mx-auto" />
          <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
