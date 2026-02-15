
"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, History, CreditCard, User, Info, LogOut, Loader2, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser, useCollection, useFirestore, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, where, doc, updateDoc, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { usePaystackPayment } from "react-paystack";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function FamilyDashboard() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const parentRef = useMemo(() => (user && db ? doc(db, "parents", user.uid) : null), [user, db]);
  const { data: parentProfile, loading: profileLoading } = useDoc(parentRef);

  const studentQuery = useMemoFirebase(() => {
    if (!db || !parentProfile?.admissionNumber) return null;
    return query(collection(db, "students"), where("admissionNumber", "==", parentProfile.admissionNumber));
  }, [db, parentProfile]);

  const { data: students, loading: studentLoading } = useCollection(studentQuery);
  const student = students?.[0] as any;

  const paymentsQuery = useMemoFirebase(() => {
    if (!db || !student?.admissionNumber) return null;
    return query(
      collection(db, "payments"), 
      where("admissionNumber", "==", student.admissionNumber),
      orderBy("date", "desc")
    );
  }, [db, student]);

  const { data: payments, loading: paymentsLoading } = useCollection(paymentsQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/family/login");
    }
  }, [user, userLoading, router]);

  const balance = student ? (Number(student.totalFees) - Number(student.paidAmount || 0)) : 0;

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "",
    amount: balance * 100,
    publicKey: "pk_live_c72e49065b2b0c5fb5a9093fa17d08dbcb29b6d3",
    currency: "KES",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onSuccess = (reference: any) => {
    if (!db || !student) return;
    
    setIsProcessing(true);
    
    const studentRef = doc(db, "students", student.id);
    const newPaidAmount = (Number(student.paidAmount) || 0) + balance;
    const updateData = {
      paidAmount: newPaidAmount,
      status: "Paid"
    };

    updateDoc(studentRef, updateData)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: studentRef.path,
          operation: 'update',
          requestResourceData: updateData
        }));
      });

    const paymentData = {
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      amount: balance,
      currency: "KES",
      reference: reference.reference,
      status: "success",
      date: new Date().toISOString(),
      email: user?.email,
      method: "Paystack",
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, "payments"), paymentData)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'payments',
          operation: 'create',
          requestResourceData: paymentData
        }));
      });

    setIsProcessing(false);
    toast({
      title: "Payment Successful",
      description: `Reference: ${reference.reference}. Your balance has been updated.`,
    });
  };

  const onClose = () => {
    toast({
      variant: "destructive",
      title: "Payment Cancelled",
      description: "You closed the payment window.",
    });
  };

  const handlePayFees = () => {
    if (balance <= 0) return;
    initializePayment({ onSuccess, onClose });
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
        <p className="text-muted-foreground font-medium">Synchronizing Family Portal...</p>
      </div>
    );
  }

  if (!user) return null;

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
                <Button 
                  onClick={handlePayFees} 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 text-lg font-bold shadow-lg" 
                  disabled={isProcessing || balance <= 0}
                >
                  {isProcessing ? "Updating Records..." : "Securely Pay Outstanding Balance"}
                </Button>
                <p className="text-[10px] text-center opacity-60 flex items-center justify-center gap-1">
                  <CreditCard className="h-3 w-3" /> Payments securely processed by Paystack
                </p>
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
          <Card className="p-12 text-center border-none shadow-xl bg-white">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">Link your child's record</p>
            <p className="text-muted-foreground text-sm">Please contact the school administrator to verify your admission number: <span className="font-bold">{parentProfile?.admissionNumber}</span></p>
          </Card>
        )}

        {student && (
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="bg-white p-1 h-12 shadow-sm border">
              <TabsTrigger value="history" className="h-10 px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
                <History className="h-4 w-4 mr-2" /> Payment History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-6">
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b">
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Reference</th>
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                        <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right text-muted-foreground">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments?.map((p: any) => (
                        <tr key={p.id} className="border-b hover:bg-muted/10 transition-colors">
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(p.date).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm font-mono">{p.reference}</td>
                          <td className="p-4 text-sm text-right font-bold">
                            KES {Number(p.amount).toLocaleString()}
                          </td>
                          <td className="p-4 text-right">
                            <Button variant="outline" size="sm" className="h-8 gap-2 border-accent text-accent hover:bg-accent/10">
                              <Download className="h-3.5 w-3.5" /> Receipt
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!payments || payments.length === 0) && !paymentsLoading && (
                  <div className="p-12 text-center text-muted-foreground italic">
                    No payment records found yet.
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
