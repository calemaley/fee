"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, History, CreditCard, User, Info, LogOut, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser, useCollection, useFirestore, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, where, doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";

export default function FamilyDashboard() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isPaying, setIsPaying] = useState(false);

  const parentRef = useMemo(() => (user && db ? doc(db, "parents", user.uid) : null), [user, db]);
  const { data: parentProfile, loading: profileLoading } = useDoc(parentRef);

  const studentQuery = useMemoFirebase(() => {
    if (!db || !parentProfile?.admissionNumber) return null;
    return query(collection(db, "students"), where("admissionNumber", "==", parentProfile.admissionNumber));
  }, [db, parentProfile]);

  const { data: students, loading: studentLoading } = useCollection(studentQuery);
  const student = students?.[0];

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/family/login");
    }
  }, [user, userLoading, router]);

  const handlePayFees = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      toast({
        title: "Payment Processed",
        description: "Your payment request has been sent for processing. KES amount will update soon.",
      });
    }, 2000);
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/family/login");
    }
  };

  if (userLoading || profileLoading || studentLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading Family Portal...</p>
      </div>
    );
  }

  if (!user) return null;

  const balance = student ? (Number(student.totalFees) - Number(student.paidAmount || 0)) : 0;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <GraduationCap className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-primary font-headline">ScholarlyPay</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 font-medium bg-white">
              <User className="h-3 w-3" /> {parentProfile?.firstName} {parentProfile?.lastName}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Hello, {parentProfile?.firstName}</h2>
            {student ? (
              <p className="text-muted-foreground flex items-center gap-2">
                Viewing dashboard for <span className="font-semibold text-foreground underline decoration-accent underline-offset-4">{student.name}</span>
              </p>
            ) : (
              <p className="text-destructive font-medium">No student record linked to admission # {parentProfile?.admissionNumber}</p>
            )}
          </div>
          {student && (
            <Badge className="w-fit h-fit py-1.5 px-3 text-sm font-semibold bg-accent hover:bg-accent/90">
              {student.grade}
            </Badge>
          )}
        </header>

        {student ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-none shadow-xl bg-primary text-white overflow-hidden relative">
              <div className="absolute right-0 top-0 p-8 opacity-10">
                <CreditCard size={160} />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-medium opacity-80 uppercase tracking-wider">Fee Balance</CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold font-headline">KES {balance.toLocaleString()}</span>
                  <span className="opacity-70">Remaining</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                    <p className="text-xs opacity-70 uppercase mb-1">Total Fee Amount</p>
                    <p className="text-xl font-bold">KES {Number(student.totalFees).toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                    <p className="text-xs opacity-70 uppercase mb-1">Total Paid So Far</p>
                    <p className="text-xl font-bold text-accent">KES {Number(student.paidAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <Button onClick={handlePayFees} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 text-lg font-bold shadow-lg" disabled={isPaying || balance <= 0}>
                  {isPaying ? "Processing..." : "Pay Outstanding Balance"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Info className="h-5 w-5 text-primary" /> Child Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground text-sm">Admission ID</span>
                  <span className="font-mono font-medium">{student.admissionNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground text-sm">Grade Level</span>
                  <span className="font-medium">{student.grade}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground text-sm">Status</span>
                  <Badge variant={student.status === 'Paid' ? 'default' : student.status === 'Balance' ? 'secondary' : 'destructive'} className="rounded-full">
                    {student.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Link your child's record</p>
            <p className="text-muted-foreground">Please contact the school administrator to verify your admission number: {parentProfile?.admissionNumber}</p>
          </Card>
        )}

        {student && (
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="bg-white p-1 h-12 shadow-sm">
              <TabsTrigger value="history" className="h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
                <History className="h-4 w-4 mr-2" /> Payment History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-6">
              <Card className="border-none shadow-xl bg-white overflow-hidden p-12 text-center text-muted-foreground">
                No payment records found yet in KES.
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
