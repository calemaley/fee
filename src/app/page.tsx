"use client"

import { GraduationCap, ShieldCheck, ArrowRight, Building2, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFDFF] relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-primary to-accent p-5 rounded-[2.5rem] shadow-2xl shadow-primary/20 transform hover:scale-110 transition-transform duration-500">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter font-headline">
              Scholarly<span className="text-primary">Pay</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              The modern standard for secure school fees management and financial transparency.
            </p>
          </div>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 px-4">
          <Link 
            href="/institution/login" 
            className="group relative p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-primary/30 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 bg-primary/5 rounded-full -mr-6 -mt-6 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Institution Portal</h3>
                <p className="text-slate-500 mt-2 font-medium">For school administrators and bursars to manage students and collections.</p>
              </div>
              <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest pt-4">
                Enter Admin Hub <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>

          <Link 
            href="/family/login" 
            className="group relative p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-accent/30 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 bg-accent/5 rounded-full -mr-6 -mt-6 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Family Portal</h3>
                <p className="text-slate-500 mt-2 font-medium">For parents and guardians to view statements and settle balances securely.</p>
              </div>
              <div className="flex items-center gap-2 text-accent font-black uppercase text-xs tracking-widest pt-4">
                Access Family Portal <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Security Badge */}
        <div className="pt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 opacity-40">
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by</span>
               <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            Bank-Level Encryption • Secure Payment Processing
          </p>
        </div>
      </div>
    </div>
  );
}
