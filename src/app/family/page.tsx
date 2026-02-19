"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function FamilySignup() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    admissionNumber: ""
  });

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!auth || !db) return;

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        admissionNumber: formData.admissionNumber,
        role: "parent",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "parents", user.uid), profileData);

      toast({
        title: "Registration Successful",
        description: "Your family account has been created.",
      });

      router.push("/family/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during signup."
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
        <div className="auth-form-box !w-[350px]">
          <h2 className="font-headline text-2xl">Family Signup</h2>
          <form onSubmit={onSubmit} className="w-full space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="auth-input-bx">
                <input
                  placeholder="First"
                  required
                  disabled={isLoading}
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="auth-input-bx">
                <input
                  placeholder="Last"
                  required
                  disabled={isLoading}
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
            <div className="auth-input-bx">
              <input
                type="email"
                placeholder="Email Address"
                required
                disabled={isLoading}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="auth-input-bx">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="auth-input-bx">
              <input
                placeholder="Admission #"
                required
                disabled={isLoading}
                value={formData.admissionNumber}
                onChange={(e) => setFormData({...formData, admissionNumber: e.target.value})}
              />
            </div>
            <div className="auth-input-bx pt-2">
              <button type="submit" className="auth-submit-btn flex items-center justify-center" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </button>
            </div>
          </form>
          <div className="auth-links">
            <Link href="/family/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
