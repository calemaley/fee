
"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2 } from "lucide-react";

export default function InstitutionSignup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/institution/dashboard");
    }, 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="max-w-[450px] w-full space-y-6">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
            <Building2 className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-headline">ScholarlyPay</h1>
          <p className="text-muted-foreground">Register your Institution</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/95">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-headline">Create Account</CardTitle>
            <CardDescription>
              Start managing your school fees efficiently
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input id="school-name" placeholder="Scholarly Academy" required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@school.com" required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required disabled={isLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required disabled={isLoading} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register & Continue
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Already registered?{" "}
                <Link href="/institution/login" className="text-primary hover:underline font-semibold">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
