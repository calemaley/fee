"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, History, CreditCard, User, Info, LogOut, Loader2, AlertCircle, Download, Sparkles, ChevronRight } from "lucide-react";
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

  const downloadReceipt = (payment: any) => {
    const receiptContent = `
=========================================
          SCHOLARLYPAY RECEIPT
=========================================
Date: ${new Date(payment.date).toLocaleString()}
Reference: ${payment.reference}
Student: ${student?.name}
Admission #: ${payment.admissionNumber}
Grade: ${student?.grade}

-----------------------------------------
PAYMENT DETAILS
-----------------------------------------
Amount Paid: ${payment.currency} ${Number(payment.amount).toLocaleString()}
Method: ${payment.method}
Status: COMPLETED

-----------------------------------------
Remaining Balance: ${payment.currency} ${(Number(student.totalFees) - Number(student.paidAmount)).toLocaleString()}
-----------------------------------------

Thank you for your payment.
Generated by ScholarlyPay School Management System.
=========================================
    `;

    const element = document.createElement("a");
    const file = new Blob([receiptContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${payment.reference}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Download Started",
      description: "Your receipt has been generated successfully.",
    });
  };

  if (userLoading || profileLoading || studentLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold tracking-tight animate-pulse">Syncing Family Portal...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <nav className="border-b bg-white/70 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-2xl shadow-lg shadow-primary/20">
              < GraduationCap className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-slate-800 font-headline tracking-tighter">ScholarlyPay</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {parentProfile?.firstName?.[0]}
              </div>
              <span className="text-sm font-black text-slate-700">{parentProfile?.firstName} {parentProfile?.lastName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl font-bold hover:bg-destructive/5 hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Welcome Back</span>
              <Sparkles className="h-3.5 w-3.5 text-accent fill-accent" />
            </div>
            <h2 className="text-5xl font-black tracking-tighter font-headline text-slate-900">Hello, {parentProfile?.firstName}</h2>
            {student ? (
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                Viewing academic records for <span className="text-slate-900 font-black border-b-4 border-accent/30">{student.name}</span>
              </p>
            ) : (
              <p className="text-destructive font-black uppercase tracking-wider text-xs bg-destructive/5 px-3 py-1 rounded-full w-fit">Admission record mismatch: {parentProfile?.admissionNumber}</p>
            )}
          </div>
          {student && (
            <Badge className="w-fit h-fit py-2 px-6 text-sm font-black bg-slate-900 hover:bg-slate-800 shadow-xl rounded-2xl">
              {student.grade}
            </Badge>
          )}
        </header>

        {student ? (
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2 border-none shadow-[0_20px_60px_rgb(0,0,0,0.06)] bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative rounded-[2rem]">
              <div className="absolute right-[-40px] top-[-40px] p-20 bg-accent/20 rounded-full blur-[100px] opacity-20" />
              <div className="absolute left-[-40px] bottom-[-40px] p-20 bg-primary/20 rounded-full blur-[100px] opacity-20" />
              
              <CardHeader className="relative z-10 pt-10 px-10">
                <CardTitle className="text-xs font-black opacity-60 uppercase tracking-[0.3em] mb-2">Total Outstanding Balance</CardTitle>
                <div className="flex items-baseline gap-4">
                  <span className="text-7xl font-black font-headline tracking-tighter">KES {balance.toLocaleString()}</span>
                  <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold">2024 Term 2</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-10 relative z-10 p-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm group hover:bg-white/10 transition-all">
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-2">Term Invoice</p>
                    <p className="text-2xl font-black">KES {Number(student.totalFees).toLocaleString()}</p>
                  </div>
                  <div className="bg-accent/10 border border-accent/20 p-6 rounded-3xl backdrop-blur-sm group hover:bg-accent/20 transition-all">
                    <p className="text-[10px] font-black text-accent-foreground opacity-50 uppercase tracking-widest mb-2">Paid to Date</p>
                    <p className="text-2xl font-black text-accent">KES {Number(student.paidAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={handlePayFees} 
                    className="w-full bg-white text-slate-900 hover:bg-slate-50 h-16 text-xl font-black rounded-3xl shadow-2xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50" 
                    disabled={isProcessing || balance <= 0}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin h-5 w-5" /> Syncing with Bank...
                      </div>
                    ) : "Securely Pay via Checkout"}
                  </Button>
                  <p className="text-[10px] text-center opacity-40 flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
                    <CreditCard className="h-3 w-3" /> Encrypted processing by Paystack & Central Bank
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_15px_40px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-6 border-b border-slate-50">
                <CardTitle className="flex items-center gap-3 font-black font-headline text-lg">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-8">
                <DetailRow label="Admission ID" value={student.admissionNumber} mono />
                <DetailRow label="Grade Level" value={student.grade} />
                <div className="flex justify-between items-center py-4 border-b border-slate-50">
                  <span className="text-muted-foreground text-xs font-black uppercase tracking-widest">Account Status</span>
                  <Badge 
                    variant={student.status === 'Paid' ? 'default' : 'destructive'} 
                    className="rounded-xl px-4 py-1 font-black shadow-sm"
                  >
                    {student.status}
                  </Badge>
                </div>
                <div className="mt-6 p-5 rounded-3xl bg-slate-50/80 border border-slate-100 text-[11px] font-medium leading-relaxed italic text-slate-500">
                  "Important: All payments must be cleared 2 weeks prior to end-term assessments for transcript eligibility."
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="p-20 text-center border-none shadow-[0_20px_60px_rgb(0,0,0,0.05)] bg-white rounded-[2rem]">
            <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Unlinked Account</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">Your account isn't currently linked to a student record. Please verify your admission number with the school admin.</p>
            <Badge variant="outline" className="px-6 py-2 rounded-full font-black font-mono text-lg">{parentProfile?.admissionNumber}</Badge>
          </Card>
        )}

        {student && (
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="bg-slate-100/50 p-1.5 h-16 rounded-[1.5rem] shadow-inner border border-slate-100 mb-8">
              <TabsTrigger 
                value="history" 
                className="h-full px-10 rounded-[1.25rem] font-black data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
              >
                <History className="h-4 w-4 mr-2" /> Financial History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="history" className="mt-0 focus-visible:ring-0">
              <Card className="border-none shadow-[0_20px_60px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Settlement Date</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Transaction ID</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Amount (KES)</th>
                        <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-right text-muted-foreground">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {payments?.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-6">
                            <span className="text-sm font-black text-slate-800">{new Date(p.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </td>
                          <td className="p-6">
                            <Badge variant="outline" className="font-mono text-[11px] rounded-lg tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">{p.reference}</Badge>
                          </td>
                          <td className="p-6 text-right">
                            <span className="text-sm font-black text-primary">KES {Number(p.amount).toLocaleString()}</span>
                          </td>
                          <td className="p-6 text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-10 px-6 gap-2 rounded-xl border-slate-200 font-bold hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                              onClick={() => downloadReceipt(p)}
                            >
                              <Download className="h-4 w-4" /> Receipt
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!payments || payments.length === 0) && !paymentsLoading && (
                  <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                      <History className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-sm text-muted-foreground font-bold italic tracking-tight">No financial transactions detected for this account.</p>
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

function DetailRow({ label, value, mono }: any) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-slate-50">
      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{label}</span>
      <span className={`font-black text-slate-800 ${mono ? 'font-mono text-xs opacity-70' : 'text-sm'}`}>{value}</span>
    </div>
  );
}