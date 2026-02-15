"use client"

import { GraduationCap, ShieldAlert, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full -z-10 animate-pulse" />
      
      <div className="max-w-md w-full text-center space-y-12 relative">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-white/5 p-5 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-sm">
              <ShieldAlert className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-primary font-black text-xs uppercase tracking-[0.5em] animate-pulse">
              Security Protocol: Active
            </p>
            <h1 className="text-5xl font-black text-white tracking-tighter font-headline">Access Restricted</h1>
          </div>
          
          <div className="space-y-4">
            <p className="text-white/40 text-sm leading-relaxed font-medium px-4">
              This gateway is protected by encrypted protocols. Authorized personnel must utilize their specific portal endpoints.
            </p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4">
          <Link 
            href="/institution/login" 
            className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-500"
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Administrator</p>
              <p className="text-lg font-black text-white">Institution Portal</p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>

          <Link 
            href="/family/login" 
            className="group flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 transition-all duration-500"
          >
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Parent / Guardian</p>
              <p className="text-lg font-black text-white">Family Portal</p>
            </div>
            <ArrowRight className="h-5 w-5 text-white/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        <div className="pt-8">
          <p className="text-[10px] text-white/10 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <Lock className="h-3 w-3" /> Encrypted Session • ScholarlyPay Security
          </p>
        </div>
      </div>
    </div>
  );
}