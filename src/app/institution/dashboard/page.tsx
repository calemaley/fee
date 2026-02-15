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
  ArrowRight,
  Sparkles,
  Search
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Syncing your Institution Dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFF]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 glass-sidebar min-h-screen hidden lg:flex flex-col text-white p-6 sticky top-0 z-50">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-2xl shadow-lg shadow-primary/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-black font-headline tracking-tighter">ScholarlyPay</span>
          </div>
          
          <nav className="space-y-1.5 flex-1">
            <NavItem href="/institution/dashboard" icon={LayoutDashboard} label="Overview" active />
            <NavItem href="/institution/students" icon={Users} label="Student Directory" />
            <NavItem href="/institution/fees" icon={CreditCard} label="Fees Control" />
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10 space-y-5">
            <div className="flex items-center gap-4 px-3 py-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center font-bold text-white shadow-inner">
                {user.email?.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{user.email}</span>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Administrator</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-xl" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" /> Logout Session
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Analytics Dashboard</span>
                <Sparkles className="h-3 w-3 text-accent fill-accent" />
              </div>
              <h1 className="text-4xl font-black text-foreground font-headline tracking-tight">Institutional Health</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                Operational metrics for <span className="font-bold text-foreground">Scholarly Academy</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-2xl px-8 h-12 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                <Link href="/institution/students">
                  <Plus className="mr-2 h-5 w-5" /> Register Student
                </Link>
              </Button>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <StatCard 
              label="Total Revenue" 
              value={`KES ${stats.totalCollected.toLocaleString()}`} 
              icon={TrendingUp} 
              color="primary"
              progress={65}
              description="Live collection from portal"
            />
            <StatCard 
              label="Outstanding" 
              value={`KES ${stats.totalOutstanding.toLocaleString()}`} 
              icon={AlertCircle} 
              color="accent"
              progress={35}
              description="Target collection end of month"
            />
            <StatCard 
              label="Active Roster" 
              value={stats.count.toString()} 
              icon={Users} 
              color="foreground"
              avatars={stats.count}
              description="Successfully registered students"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <SectionCard 
              title="Recent Admissions" 
              description="Latest student registrations"
              href="/institution/students"
              items={students?.slice(0, 5).map((s: any) => ({
                id: s.id,
                title: s.name,
                subtitle: s.grade,
                badge: s.admissionNumber
              }))}
            />

            <SectionCard 
              title="Payment Alerts" 
              description="High priority outstanding balances"
              href="/institution/fees"
              items={students?.filter((s: any) => (Number(s.totalFees) - Number(s.paidAmount)) > 0).slice(0, 5).map((s: any) => ({
                id: s.id,
                title: s.name,
                subtitle: `Balance: KES ${(Number(s.totalFees) - Number(s.paidAmount)).toLocaleString()}`,
                badge: "Pending",
                variant: "destructive"
              }))}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active = false }: { href: string, icon: any, label: string, active?: boolean }) {
  return (
    <Button 
      variant="ghost" 
      className={`w-full justify-start rounded-xl h-12 transition-all group ${
        active 
          ? "bg-white/10 text-white shadow-lg shadow-black/20" 
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`} 
      asChild
    >
      <Link href={href}>
        <Icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${active ? "text-accent" : ""}`} />
        <span className="font-semibold">{label}</span>
      </Link>
    </Button>
  );
}

function StatCard({ label, value, icon: Icon, color, progress, avatars, description }: any) {
  const colorMap: any = {
    primary: "bg-primary",
    accent: "bg-accent",
    foreground: "bg-slate-900"
  };

  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-3xl">
      <div className={`h-1.5 w-full ${colorMap[color] || "bg-primary"}`} />
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-center justify-between mb-2">
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            {label}
          </CardDescription>
          <div className={`p-2 rounded-xl ${colorMap[color]} bg-opacity-10`}>
            <Icon className={`h-4 w-4 ${color === 'foreground' ? 'text-slate-900' : 'text-' + color}`} />
          </div>
        </div>
        <CardTitle className="text-3xl font-black font-headline tracking-tighter">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${colorMap[color]} transition-all duration-1000`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}
        {avatars !== undefined && (
          <div className="flex -space-x-2.5">
            {[...Array(Math.min(avatars, 5))].map((_, i) => (
              <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600 shadow-sm">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {avatars > 5 && (
              <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                +{avatars - 5}
              </div>
            )}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-3 font-medium opacity-70 italic">{description}</p>
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, description, items, href, variant }: any) {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6">
        <div>
          <CardTitle className="text-xl font-black font-headline tracking-tight">{title}</CardTitle>
          <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-primary rounded-xl font-bold hover:bg-primary/5">
          <Link href={href}>View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {items?.length > 0 ? items.map((item: any) => (
          <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer">
            <div className="flex flex-col">
              <span className="font-black text-sm text-slate-800">{item.title}</span>
              <span className="text-[11px] text-muted-foreground font-medium mt-0.5">{item.subtitle}</span>
            </div>
            <Badge 
              variant={item.variant === "destructive" ? "destructive" : "secondary"} 
              className="rounded-lg px-2.5 py-0.5 font-bold tracking-tight"
            >
              {item.badge}
            </Badge>
          </div>
        )) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm text-muted-foreground font-medium italic">No recent records to display</p>
          </div>
        )}
        <Button variant="ghost" className="w-full text-primary font-bold group rounded-2xl h-11" asChild>
          <Link href={href}>
            Full Report <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}