"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";

export default function ParentLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/parent/dashboard");
    }, 1500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="max-w-[400px] w-full space-y-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
            <GraduationCap className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">ScholarlyPay</h1>
          <p className="text-muted-foreground">Parent Portal Access</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>
              Enter your credentials to manage your child's fees
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required disabled={isLoading} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/parent/signup" className="text-primary hover:underline font-semibold">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
