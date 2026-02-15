
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  AlertCircle, 
  Plus, 
  LayoutDashboard,
  GraduationCap,
  Loader2,
  LogOut,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useAuth, useUser, useCollection, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function InstitutionDashboard() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  // Real-time student data for stats
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "students"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  const stats = useMemo(() => {
    if (!students) return { totalCollected: 0, totalOutstanding: 0, count: 0 };
    const totalCollected = students.reduce((acc, s) => acc + (Number(s.paidAmount) || 0), 0);
    const totalOutstanding = students.reduce((acc, s) => acc + ((Number(s.totalFees) || 0) - (Number(s.paidAmount) || 0)), 0);
    return {
      totalCollected,
      totalOutstanding,
      count: students.length
    };
  }, [students]);

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
        <p className="text-muted-foreground font-medium">Synchronizing institution data...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-primary min-h-screen hidden lg:flex flex-col text-white p-6 sticky top-0 shadow-2xl">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-white/20 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold font-headline">ScholarlyPay</span>
          </div>
          
          <nav className="space-y-2 flex-1">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 bg-white/10" asChild>
              <Link href="/institution/dashboard">
                <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/institution/students">
                <Users className="mr-3 h-5 w-5" /> Students
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white" asChild>
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

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground font-headline">Institution Overview</h1>
              <p className="text-muted-foreground flex items-center gap-1.5">
                Financial health summary <ChevronRight className="h-3.5 w-3.5" /> <span className="text-primary font-medium">KES</span>
              </p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/20">
              <Link href="/institution/students">
                <Plus className="mr-2 h-4 w-4" /> Manage Students
              </Link>
            </Button>
          </header>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <Card className="border-none shadow-md overflow-hidden bg-white group hover:shadow-xl transition-all duration-300">
              <div className="h-1 bg-primary" />
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="mr-1.5 h-3 w-3 text-primary" /> Total Revenue
                </CardDescription>
                <CardTitle className="text-3xl font-headline font-bold">KES {stats.totalCollected.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Live collection from all registered students</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden bg-white group hover:shadow-xl transition-all duration-300">
              <div className="h-1 bg-accent" />
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <AlertCircle className="mr-1.5 h-3 w-3 text-accent" /> Outstanding Balance
                </CardDescription>
                <CardTitle className="text-3xl font-headline font-bold">KES {stats.totalOutstanding.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '35%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Total pending payments across institution</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden bg-white group hover:shadow-xl transition-all duration-300">
              <div className="h-1 bg-foreground" />
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Users className="mr-1.5 h-3 w-3 text-foreground" /> Active Students
                </CardDescription>
                <CardTitle className="text-3xl font-headline font-bold">{stats.count}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(stats.count, 5))].map((_, i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-muted-foreground flex items-center justify-center text-[8px] text-white">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Currently registered in the directory</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline">Recent Admissions</CardTitle>
                <CardDescription>Latest students added to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {students?.slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.grade}</span>
                    </div>
                    <Badge variant="outline">{s.admissionNumber}</Badge>
                  </div>
                ))}
                {(!students || students.length === 0) && (
                  <p className="text-center py-8 text-muted-foreground italic">No students registered yet.</p>
                )}
                <Button variant="ghost" className="w-full text-primary font-semibold" asChild>
                  <Link href="/institution/students">
                    View All Students <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-headline">Payment Alerts</CardTitle>
                <CardDescription>Students with significant outstanding balances</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {students?.filter((s: any) => (Number(s.totalFees) - Number(s.paidAmount)) > 0).slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5 border-destructive/10">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{s.name}</span>
                      <span className="text-xs text-muted-foreground">Balance: KES {(Number(s.totalFees) - Number(s.paidAmount)).toLocaleString()}</span>
                    </div>
                    <Badge variant="destructive">Pending</Badge>
                  </div>
                ))}
                {(!students || students.filter((s: any) => (Number(s.totalFees) - Number(s.paidAmount)) > 0).length === 0) && (
                  <p className="text-center py-8 text-muted-foreground italic">All accounts are up to date!</p>
                )}
                <Button variant="ghost" className="w-full text-primary font-semibold" asChild>
                  <Link href="/institution/fees">
                    Go to Fees Management <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
