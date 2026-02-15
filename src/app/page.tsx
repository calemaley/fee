
"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, ShieldCheck, UserRound } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
              <GraduationCap className="text-white h-10 w-10" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline">ScholarlyPay</h1>
          <p className="text-muted-foreground">Select a portal to continue</p>
        </div>

        <div className="grid gap-4 pt-4">
          <Button asChild size="lg" className="h-24 text-xl font-bold flex items-center justify-start px-8 gap-6 shadow-md hover:shadow-lg transition-all">
            <Link href="/family/login">
              <div className="bg-white/20 p-2 rounded-lg">
                <UserRound className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-start">
                <span>Family Portal</span>
                <span className="text-xs font-normal opacity-80 uppercase tracking-widest">Parents & Guardians</span>
              </div>
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="h-24 text-xl font-bold flex items-center justify-start px-8 gap-6 shadow-sm hover:shadow-md transition-all border-primary text-primary hover:bg-primary/5">
            <Link href="/institution/login">
              <div className="bg-primary/10 p-2 rounded-lg">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col items-start">
                <span>Institution Portal</span>
                <span className="text-xs font-normal opacity-80 uppercase tracking-widest text-muted-foreground">Administrators</span>
              </div>
            </Link>
          </Button>
        </div>

        <footer className="text-center pt-8">
          <p className="text-xs text-muted-foreground">© 2024 ScholarlyPay School Fees Management</p>
        </footer>
      </div>
    </div>
  );
}
