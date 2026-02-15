import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, ShieldCheck, UserRound, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <GraduationCap className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-primary font-headline">ScholarlyPay</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-background to-background">
        <div className="max-w-4xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-foreground font-headline">
              School Fees Management <br />
              <span className="text-primary italic">Simplified & Secure</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Empowering schools with transparent financial tracking and parents with effortless payment solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-none shadow-xl bg-white/80 overflow-hidden">
              <div className="h-2 bg-accent" />
              <CardHeader className="text-left">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4 text-accent">
                  <UserRound className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-headline">Parent Portal</CardTitle>
                <CardDescription className="text-base">
                  Pay school fees, track history, and download receipts for your child using their admission number.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild className="w-full h-12 text-lg font-medium group" variant="default">
                  <Link href="/parent/login">
                    Enter Portal <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="text-primary">
                  <Link href="/parent/signup">Create Parent Account</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-none shadow-xl bg-white/80 overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader className="text-left">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-headline">Admin Portal</CardTitle>
                <CardDescription className="text-base">
                  Track payments, manage student profiles, and oversee school financial status with advanced tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild className="w-full h-12 text-lg font-medium group bg-primary" variant="default">
                  <Link href="/admin/login">
                    Manage School <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="text-primary">
                  <Link href="/admin/signup">Register Institution</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-sm text-muted-foreground border-t bg-white/50">
        <p>© 2024 ScholarlyPay. All rights reserved. Securely powered by Paystack.</p>
      </footer>
    </div>
  );
}
