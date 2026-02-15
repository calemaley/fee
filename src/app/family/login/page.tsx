"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function FamilyLogin() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!auth) return;

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/family/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="ring-wrapper">
        <i style={{ "--clr": "#00ff0a" } as any}></i>
        <i style={{ "--clr": "#ff0057" } as any}></i>
        <i style={{ "--clr": "#fffd44" } as any}></i>
        <div className="auth-form-box">
          <h2 className="font-headline">Family Login</h2>
          <form onSubmit={onSubmit} className="w-full space-y-4">
            <div className="auth-input-bx">
              <input
                type="email"
                placeholder="Email Address"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-input-bx">
              <input
                type="password"
                placeholder="Password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-input-bx">
              <button type="submit" className="auth-submit-btn flex items-center justify-center" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
              </button>
            </div>
          </form>
          <div className="auth-links">
            <Link href="#">Forgot Password</Link>
            <Link href="/family">Signup</Link>
          </div>
        </div>
      </div>
    </div>
  );
}