
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, History, CreditCard, Download, User, Info, LogOut } from "lucide-react";
import { MOCK_STUDENTS, MOCK_PAYMENTS, Student } from "@/app/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

export default function FamilyDashboard() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/family/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Simulating fetching current user's child based on auth email
    if (user) {
      const found = MOCK_STUDENTS.find(s => s.parentEmail === user.email) || MOCK_STUDENTS[0];
      setStudent(found);
    }
  }, [user]);

  const handlePayFees = () => {
    setIsPaying(true);
    // In a real app, you'd trigger Paystack here
    setTimeout(() => {
      setIsPaying(false);
      toast({
        title: "Payment Successful",
        description: "Your payment of KES 4,000.00 has been received. You can now download your receipt.",
      });
    }, 2000);
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/family/login");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!user || !student) return null;

  const balance = student.totalFees - student.paidAmount;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              < GraduationCap className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-primary font-headline">ScholarlyPay</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 font-medium bg-white">
              <User className="h-3 w-3" /> {user.email}
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
            <h2 className="text-3xl font-bold tracking-tight font-headline">Hello, Parent</h2>
            <p className="text-muted-foreground flex items-center gap-2">
              Viewing dashboard for <span className="font-semibold text-foreground underline decoration-accent underline-offset-4">{student.name}</span>
            </p>
          </div>
          <Badge className="w-fit h-fit py-1.5 px-3 text-sm font-semibold bg-accent hover:bg-accent/90">
            {student.grade}
          </Badge>
        </header>

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
                  <p className="text-xl font-bold">KES {student.totalFees.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md">
                  <p className="text-xs opacity-70 uppercase mb-1">Total Paid So Far</p>
                  <p className="text-xl font-bold text-accent">KES {student.paidAmount.toLocaleString()}</p>
                </div>
              </div>
              <Button 
                onClick={handlePayFees} 
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 text-lg font-bold shadow-lg"
                disabled={isPaying || balance <= 0}
              >
                {isPaying ? "Processing..." : "Pay Outstanding Balance"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Info className="h-5 w-5 text-primary" />
                Child Details
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
              <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm italic text-muted-foreground">
                "Please ensure all payments are made before the end of term examinations."
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="bg-white p-1 h-12 shadow-sm">
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
                      <th className="p-4 font-semibold text-sm">Date</th>
                      <th className="p-4 font-semibold text-sm">Reference</th>
                      <th className="p-4 font-semibold text-sm">Method</th>
                      <th className="p-4 font-semibold text-sm text-right">Amount</th>
                      <th className="p-4 font-semibold text-sm text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PAYMENTS.filter(p => p.studentId === student.id).map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-muted/10 transition-colors">
                        <td className="p-4 text-sm text-muted-foreground">{payment.date}</td>
                        <td className="p-4 text-sm font-mono">{payment.reference}</td>
                        <td className="p-4 text-sm font-medium">{payment.method}</td>
                        <td className="p-4 text-sm text-right font-bold">KES {payment.amount.toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" size="sm" className="h-8 gap-2 border-accent text-accent hover:bg-accent/10">
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {MOCK_PAYMENTS.filter(p => p.studentId === student.id).length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No payment records found.
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
