"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/dashboard");
    }, 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="max-w-[420px] w-full space-y-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">ScholarlyPay</h1>
          <div className="px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary tracking-widest uppercase">
            Admin Console
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-headline">Administrator Sign In</CardTitle>
            <CardDescription>
              Access the fee management dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="staff-id">Staff ID / Email</Label>
                <Input id="staff-id" type="text" placeholder="ADM-001" required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required disabled={isLoading} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login to Dashboard
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                New school?{" "}
                <Link href="/admin/signup" className="text-primary hover:underline font-semibold">
                  Register institution
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to public portal
          </Link>
        </div>
      </div>
    </div>
  );
}
