"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function FamilyLogin() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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

  async function onResetPassword(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!auth || !email) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your email address to reset your password."
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset email sent",
        description: "Check your inbox for instructions to reset your password."
      });
      setIsResetting(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not send reset email."
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
          <h2 className="font-headline">{isResetting ? "Reset Password" : "Family Login"}</h2>
          
          {!isResetting ? (
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
              <div className="auth-links">
                <button 
                  type="button" 
                  onClick={() => setIsResetting(true)}
                  className="text-white hover:underline text-sm"
                >
                  Forgot Password?
                </button>
                <Link href="/family" className="text-white hover:underline text-sm">Signup</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={onResetPassword} className="w-full space-y-4">
              <p className="text-white/70 text-sm text-center px-4">
                Enter your email to receive a password reset link.
              </p>
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
                <button type="submit" className="auth-submit-btn flex items-center justify-center" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
                </button>
              </div>
              <div className="auth-links justify-center">
                <button 
                  type="button" 
                  onClick={() => setIsResetting(false)}
                  className="text-white hover:underline text-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
