"use client"

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  LogOut, 
  Loader2, 
  AlertCircle, 
  Download, 
  Sparkles, 
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Receipt,
  Info,
  CalendarDays
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser, useCollection, useFirestore, useDoc } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, where, doc, updateDoc, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

// Import PaystackTrigger dynamically with SSR disabled to fix "window is not defined"
const PaystackTrigger = dynamic(() => import("@/components/PaystackTrigger"), { 
  ssr: false,
  loading: () => <div className="h-16 w-full bg-slate-800 animate-pulse rounded-[2rem]" />
});

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

  const totalFees = student ? Number(student.totalFees || 0) : 0;
  const paidAmount = student ? Number(student.paidAmount || 0) : 0;
  const balance = totalFees - paidAmount;
  const paidPercentage = totalFees > 0 ? Math.min(100, Math.round((paidAmount / totalFees) * 100)) : 0;

  const onSuccess = (reference: any) => {
    if (!db || !student) return;
    setIsProcessing(true);
    
    const studentRef = doc(db, "students", student.id);
    const newPaidAmount = (Number(student.paidAmount) || 0) + balance;
    const updateData = { paidAmount: newPaidAmount, status: "Paid" };

    updateDoc(studentRef, updateData)
      .catch((err) => {
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
      .catch((err) => {
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
Academic Period: ${student?.year} - ${student?.term}

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

    toast({ title: "Download Started", description: "Your receipt has been generated successfully." });
  };

  if (userLoading || profileLoading || studentLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black tracking-tight animate-pulse text-center">Syncing Family Portal...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <nav className="border-b bg-white/70 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-2xl shadow-lg shadow-primary/20">
              <GraduationCap className="text-white h-5 w-5 md:h-6 md:w-6" />
            </div>
            <span className="text-xl md:text-2xl font-black text-slate-800 font-headline tracking-tighter">ScholarlyPay</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {parentProfile?.firstName?.[0] || 'U'}
              </div>
              <span className="text-sm font-black text-slate-700">{parentProfile?.firstName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="rounded-xl font-bold hover:bg-destructive/5 hover:text-destructive px-2 md:px-4">
              <LogOut className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-8 md:space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Family Accounts</span>
              <Sparkles className="h-3.5 w-3.5 fill-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter font-headline text-slate-900 leading-tight">Hello, {parentProfile?.firstName}</h2>
            {student ? (
              <p className="text-muted-foreground font-bold flex items-center gap-2 text-sm md:text-base">
                Viewing academic records for <span className="text-slate-900 font-black border-b-4 border-accent/30">{student.name}</span>
              </p>
            ) : (
              <p className="text-destructive font-black uppercase tracking-wider text-[10px] bg-destructive/5 px-3 py-1.5 rounded-full w-fit">Record mismatch: {parentProfile?.admissionNumber}</p>
            )}
          </div>
          {student && (
            <div className="flex gap-2">
              <Badge className="w-fit h-fit py-2 px-6 text-[11px] font-black bg-slate-900 hover:bg-slate-800 shadow-xl rounded-2xl uppercase tracking-widest">
                {student.grade}
              </Badge>
              <Badge variant="outline" className="w-fit h-fit py-2 px-4 text-[10px] font-black border-2 rounded-2xl flex gap-2 items-center uppercase tracking-widest">
                <CalendarDays className="h-3 w-3" /> {student.year} {student.term}
              </Badge>
            </div>
          )}
        </header>

        {student ? (
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="lg:col-span-2 border-none shadow-[0_20px_60px_rgb(0,0,0,0.06)] bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative rounded-[2.5rem]">
              <div className="absolute right-[-40px] top-[-40px] p-40 bg-accent/20 rounded-full blur-[120px] opacity-30" />
              <div className="absolute left-[-40px] bottom-[-40px] p-40 bg-primary/20 rounded-full blur-[120px] opacity-30" />
              
              <div className="relative z-10 p-6 md:p-12 space-y-8 md:space-y-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Total Outstanding</p>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <h3 className="text-5xl md:text-7xl font-black font-headline tracking-tighter">KES {balance.toLocaleString()}</h3>
                      <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold text-[10px] py-1">{student.year} {student.term}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-xs font-black">{paidPercentage}% Cleared</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-60 px-1">
                    <span>Payment Progress</span>
                    <span>{paidPercentage}%</span>
                  </div>
                  <Progress value={paidPercentage} className="h-2.5 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] backdrop-blur-sm group hover:bg-white/10 transition-all flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Commitment</p>
                      <p className="text-xl md:text-2xl font-black">KES {totalFees.toLocaleString()}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="bg-accent/10 border border-accent/20 p-5 rounded-[2rem] backdrop-blur-sm group hover:bg-accent/20 transition-all flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-accent-foreground opacity-50 uppercase tracking-widest">Cleared</p>
                      <p className="text-xl md:text-2xl font-black text-accent">KES {paidAmount.toLocaleString()}</p>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-accent opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Client-only Paystack Button */}
                <PaystackTrigger 
                  amount={balance}
                  email={user?.email || ""}
                  onSuccess={onSuccess}
                  onClose={onClose}
                  isProcessing={isProcessing}
                  balance={balance}
                />
              </div>
            </Card>

            <div className="space-y-6 md:space-y-8">
              <Card className="border-none shadow-[0_15px_40px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-6 border-b border-slate-50 px-6 pt-8">
                  <CardTitle className="flex items-center gap-3 font-black font-headline text-lg">
                    <div className="p-2.5 rounded-2xl bg-primary/10">
                      <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    Summary Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 pt-6 px-6">
                  <MetricItem label="Admission #" value={student.admissionNumber} mono />
                  <MetricItem label="Academic" value={`${student.year} ${student.term}`} />
                  <MetricItem label="Grade" value={student.grade} />
                  <MetricItem label="Status" value={student.status} highlight={student.status === 'Paid'} />
                  
                  <div className="mt-8 p-6 rounded-3xl bg-slate-50/80 border border-slate-100 space-y-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Info className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Admin's Note</span>
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed italic text-slate-500">
                      "All payments must be cleared 14 days prior to term assessments."
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className={`rounded-[2rem] p-6 flex items-center gap-4 border shadow-sm ${balance <= 0 ? 'bg-green-50/50 border-green-100 text-green-700' : 'bg-orange-50/50 border-orange-100 text-orange-700'}`}>
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${balance <= 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {balance <= 0 ? <ShieldCheck className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-0.5">Enrollment</p>
                  <p className="text-sm font-black leading-tight">{balance <= 0 ? 'Fully Registered & Active' : 'Action Required'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-10 md:p-20 text-center border-none shadow-[0_20px_60px_rgb(0,0,0,0.05)] bg-white rounded-[2.5rem]">
            <div className="h-20 w-20 md:h-24 md:w-24 bg-destructive/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-destructive" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tighter font-headline">Unlinked Profile</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-10 leading-relaxed font-bold opacity-70">Your account profile isn't currently linked to a validated student record.</p>
            <div className="bg-slate-50 p-6 rounded-3xl inline-block border border-slate-100">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Ref Admission #</span>
               <code className="text-xl md:text-2xl font-black text-primary tracking-widest">{parentProfile?.admissionNumber}</code>
            </div>
          </Card>
        )}

        {student && (
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black font-headline tracking-tighter text-slate-900">Financial Ledger</h3>
              <Badge variant="outline" className="rounded-xl px-4 py-1.5 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                {payments?.length || 0} Transactions
              </Badge>
            </div>
            
            <Card className="border-none shadow-[0_20px_60px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <th className="p-6 md:p-8">Settlement Date</th>
                      <th className="p-6 md:p-8">Transaction ID</th>
                      <th className="p-6 md:p-8 text-right">Amount (KES)</th>
                      <th className="p-6 md:p-8 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments?.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6 md:p-8">
                          <span className="text-sm font-black text-slate-800">{new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </td>
                        <td className="p-6 md:p-8">
                          <Badge variant="outline" className="font-mono text-[10px] rounded-lg tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity border-slate-200 uppercase">{p.reference.substring(0, 10)}...</Badge>
                        </td>
                        <td className="p-6 md:p-8 text-right">
                          <span className="text-sm font-black text-primary">KES {Number(p.amount).toLocaleString()}</span>
                        </td>
                        <td className="p-6 md:p-8 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10 px-5 gap-2 rounded-xl border-slate-200 font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            onClick={() => downloadReceipt(p)}
                          >
                            <Download className="h-4 w-4" /> <span className="hidden md:inline">Receipt</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!payments || payments.length === 0) && !paymentsLoading && (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                    <History className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-widest opacity-30">No transactions detected</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function MetricItem({ label, value, mono, highlight }: any) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0">
      <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      <span className={`font-black ${highlight ? 'text-primary' : 'text-slate-800'} ${mono ? 'font-mono text-xs opacity-70' : 'text-sm'}`}>
        {value}
      </span>
    </div>
  );
}