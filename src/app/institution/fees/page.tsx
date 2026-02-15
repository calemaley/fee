"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Search, 
  LayoutDashboard,
  GraduationCap,
  Loader2,
  LogOut,
  ChevronRight,
  MessageSquareText,
  Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useAuth, useUser, useCollection, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { generateFeeExplanation } from "@/ai/flows/generate-fee-explanation";
import { useToast } from "@/hooks/use-toast";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";

export default function InstitutionFees() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isUpdatingFees, setIsUpdatingFees] = useState(false);

  const studentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "students"), orderBy("name", "asc"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleUpdatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !selectedStudent) return;

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("paymentAmount"));
    const newPaidAmount = (Number(selectedStudent.paidAmount) || 0) + amount;
    const newStatus = newPaidAmount >= Number(selectedStudent.totalFees) ? "Paid" : "Balance";

    try {
      await updateDoc(doc(db, "students", selectedStudent.id), {
        paidAmount: newPaidAmount,
        status: newStatus
      });
      setIsUpdatingFees(false);
      toast({
        title: "Payment Recorded",
        description: `KES ${amount.toLocaleString()} has been added to ${selectedStudent.name}'s account.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating record",
        description: error.message
      });
    }
  };

  const handleExplain = async (student: any) => {
    setIsExplaining(true);
    try {
      const result = await generateFeeExplanation({
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        outstandingBalance: Number(student.totalFees) - Number(student.paidAmount),
        dueDate: new Date().toLocaleDateString(),
        additionalContext: "Detailed breakdown for payment reminder."
      });
      setExplanation(result.explanation);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "AI Assistant Failed",
        description: "Could not generate explanation at this time."
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/institution/login");
    }
  };

  if (userLoading || studentsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Synchronizing financial records...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex">
        <aside className="w-64 bg-primary min-h-screen hidden lg:flex flex-col text-white p-6 sticky top-0 shadow-2xl">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-white/20 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold font-headline">ScholarlyPay</span>
          </div>
          <nav className="space-y-2 flex-1">
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/institution/dashboard">
                <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/institution/students">
                <Users className="mr-3 h-5 w-5" /> Students
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 bg-white/10" asChild>
              <Link href="/institution/fees">
                <CreditCard className="mr-3 h-5 w-5" /> Fees Management
              </Link>
            </Button>
          </nav>
          <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground shadow-inner">
                {user.email?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{user.email}</span>
                <span className="text-xs text-white/50 truncate">Administrator</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-white/50 hover:text-white hover:bg-white/10" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" /> Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground font-headline">Fees Management</h1>
              <p className="text-muted-foreground flex items-center gap-1.5">
                Financial Tracking <ChevronRight className="h-3.5 w-3.5" /> <span className="text-primary font-medium">KES</span>
              </p>
            </div>
          </header>

          <Card className="border-none shadow-xl bg-white overflow-hidden border-t-4 border-t-accent">
            <CardHeader className="border-b bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-headline">Financial Directory</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search student..." 
                  className="pl-10 h-10 bg-muted/30 border-none" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b">
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Student</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Total Fee</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Paid</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Balance</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s: any) => (
                    <tr key={s.id} className="border-b hover:bg-muted/5 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">{s.name}</span>
                          <span className="text-xs text-muted-foreground">{s.admissionNumber}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium">KES {Number(s.totalFees).toLocaleString()}</td>
                      <td className="p-4 text-sm text-primary font-bold">KES {Number(s.paidAmount).toLocaleString()}</td>
                      <td className="p-4 text-sm text-destructive font-bold">
                        KES {(Number(s.totalFees) - Number(s.paidAmount)).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <Badge variant={s.status === 'Paid' ? 'default' : s.status === 'Balance' ? 'secondary' : 'destructive'} className="rounded-full">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 border-primary text-primary hover:bg-primary/5" onClick={() => { setSelectedStudent(s); setExplanation(""); }}>
                              <MessageSquareText className="h-3.5 w-3.5" /> AI Explain
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle className="font-headline text-2xl">AI Fee Assistant</DialogTitle>
                              <DialogDescription>Generating a professional explanation for {selectedStudent?.name}'s current balance.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div className="p-4 rounded-xl bg-muted/40 border border-muted min-h-[150px] relative">
                                {isExplaining ? (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="text-xs font-medium animate-pulse">Drafting explanation...</span>
                                  </div>
                                ) : (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-muted-foreground">
                                    {explanation || "Click 'Generate' to create a polite, context-aware explanation for the parent."}
                                  </p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" onClick={() => setExplanation("")}>Reset</Button>
                              <Button className="bg-primary text-white" disabled={isExplaining} onClick={() => selectedStudent && handleExplain(selectedStudent)}>
                                {explanation ? "Regenerate" : "Generate Explanation"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isUpdatingFees && selectedStudent?.id === s.id} onOpenChange={(open) => { setIsUpdatingFees(open); if(open) setSelectedStudent(s); }}>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm" className="h-8">Add Payment</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <form onSubmit={handleUpdatePayment}>
                              <DialogHeader>
                                <DialogTitle className="font-headline">Record Payment</DialogTitle>
                                <DialogDescription>Update the total paid amount for {selectedStudent?.name}.</DialogDescription>
                              </DialogHeader>
                              <div className="py-6 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="paymentAmount">Payment Amount (KES)</Label>
                                  <Input id="paymentAmount" name="paymentAmount" type="number" placeholder="Enter amount received" required />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsUpdatingFees(false)}>Cancel</Button>
                                <Button type="submit">Update Account</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && !studentsLoading && (
                <div className="p-12 text-center text-muted-foreground italic">
                  No financial records found.
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
