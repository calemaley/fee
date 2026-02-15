"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function InstitutionSignup() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: "",
    adminEmail: "",
    password: "",
    confirmPassword: ""
  });

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!auth || !db) return;

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please ensure both passwords are the same."
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.adminEmail, formData.password);
      const user = userCredential.user;

      const profileData = {
        schoolName: formData.schoolName,
        adminEmail: formData.adminEmail,
        role: "admin",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "institutions", user.uid), profileData);

      toast({
        title: "Registration Successful",
        description: "Your institution has been registered.",
      });
      
      router.push("/institution/dashboard");
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
        <div className="auth-form-box">
          <h2 className="font-headline text-2xl">Admin Signup</h2>
          <form onSubmit={onSubmit} className="w-full space-y-3">
            <div className="auth-input-bx">
              <input
                placeholder="School Name"
                required
                disabled={isLoading}
                value={formData.schoolName}
                onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
              />
            </div>
            <div className="auth-input-bx">
              <input
                type="email"
                placeholder="Admin Email"
                required
                disabled={isLoading}
                value={formData.adminEmail}
                onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
              />
            </div>
            <div className="auth-input-bx">
              <input
                type="password"
                placeholder="Password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="auth-input-bx">
              <input
                type="password"
                placeholder="Confirm"
                required
                disabled={isLoading}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
            <div className="auth-input-bx pt-2">
              <button type="submit" className="auth-submit-btn flex items-center justify-center" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register"}
              </button>
            </div>
          </form>
          <div className="auth-links">
            <Link href="/institution/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}