
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  Menu,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useAuth, useUser, useCollection, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function InstitutionDashboard() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "students"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  const stats = useMemo(() => {
    if (!students) return { totalCollected: 0, totalOutstanding: 0, count: 0, paidCount: 0, balanceCount: 0, pendingCount: 0 };
    const totalCollected = students.reduce((acc, s) => acc + (Number(s.paidAmount) || 0), 0);
    const totalOutstanding = students.reduce((acc, s) => acc + ((Number(s.totalFees) || 0) - (Number(s.paidAmount) || 0)), 0);
    
    const paidCount = students.filter(s => s.status === 'Paid').length;
    const balanceCount = students.filter(s => s.status === 'Balance').length;
    const pendingCount = students.filter(s => s.status === 'Pending').length;

    return {
      totalCollected,
      totalOutstanding,
      count: students.length,
      paidCount,
      balanceCount,
      pendingCount
    };
  }, [students]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/institution/login");
    }
  };

  const generateReport = (status: string) => {
    if (!students) return;
    
    const filtered = status === 'All' 
      ? students 
      : students.filter(s => s.status === status);

    const reportTitle = `${status} Students Report - ${new Date().toLocaleDateString()}`;
    let content = `=========================================\n`;
    content += `        SCHOLARLYPAY FINANCIAL REPORT\n`;
    content += `=========================================\n`;
    content += `Report Type: ${status}\n`;
    content += `Date Generated: ${new Date().toLocaleString()}\n`;
    content += `Total Records: ${filtered.length}\n`;
    content += `-----------------------------------------\n\n`;
    content += `NAME | ADMISSION # | GRADE | TOTAL | PAID | BALANCE | STATUS\n`;
    content += `-----------------------------------------\n`;

    filtered.forEach(s => {
      const balance = Number(s.totalFees) - Number(s.paidAmount);
      content += `${s.name} | ${s.admissionNumber} | ${s.grade} | KES ${Number(s.totalFees).toLocaleString()} | KES ${Number(s.paidAmount).toLocaleString()} | KES ${balance.toLocaleString()} | ${s.status}\n`;
    });

    content += `\n-----------------------------------------\n`;
    content += `SUMMARY STATISTICS\n`;
    content += `Total Fees Expected: KES ${filtered.reduce((acc, s) => acc + Number(s.totalFees), 0).toLocaleString()}\n`;
    content += `Total Fees Collected: KES ${filtered.reduce((acc, s) => acc + Number(s.paidAmount), 0).toLocaleString()}\n`;
    content += `Remaining Balance: KES ${filtered.reduce((acc, s) => acc + (Number(s.totalFees) - Number(s.paidAmount)), 0).toLocaleString()}\n`;
    content += `=========================================\n`;

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Report_${status.replace(' ', '_')}_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Report Generated",
      description: `Successfully exported records for ${status} students.`,
    });
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
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter">ScholarlyPay</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-slate-900 border-r-white/10 p-0 text-white">
              <SidebarContent user={user} handleLogout={handleLogout} activePage="/institution/dashboard" />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="w-72 bg-slate-900 hidden lg:flex flex-col text-white p-6 sticky top-0 h-screen z-50">
          <SidebarContent user={user} handleLogout={handleLogout} activePage="/institution/dashboard" />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Institutional Health</span>
                <Sparkles className="h-3 w-3 text-accent fill-accent" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-foreground font-headline tracking-tighter">Overview</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm md:text-base">
                Operational metrics for <span className="font-bold text-foreground">Scholarly Academy</span>
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 rounded-2xl px-8 h-12 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5">
                <Link href="/institution/students">
                  <Plus className="mr-2 h-5 w-5" /> Register Student
                </Link>
              </Button>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

          {/* New Financial Tracking & Reporting Section */}
          <div className="space-y-8 mb-12">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tighter">Status Ledger & Reporting</h2>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Generate filtered financial statements</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="h-9 px-4 rounded-xl border-slate-200 bg-white font-black text-[10px] uppercase tracking-widest flex gap-2 items-center">
                    <Filter className="h-3 w-3" /> Filters Active
                  </Badge>
                </div>
             </div>

             <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-12 border border-slate-200 shadow-sm">
                    <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-[10px] uppercase tracking-widest">All</TabsTrigger>
                    <TabsTrigger value="paid" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-[10px] uppercase tracking-widest">Paid</TabsTrigger>
                    <TabsTrigger value="balance" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-[10px] uppercase tracking-widest">Balance</TabsTrigger>
                    <TabsTrigger value="pending" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-[10px] uppercase tracking-widest">Pending</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <TabsContent value="all" className="m-0"><ReportButton onClick={() => generateReport('All')} /></TabsContent>
                    <TabsContent value="paid" className="m-0"><ReportButton onClick={() => generateReport('Paid')} /></TabsContent>
                    <TabsContent value="balance" className="m-0"><ReportButton onClick={() => generateReport('Balance')} /></TabsContent>
                    <TabsContent value="pending" className="m-0"><ReportButton onClick={() => generateReport('Pending')} /></TabsContent>
                  </div>
                </div>

                <TabsContent value="all" className="mt-0">
                  <LedgerTable students={students} filter="All" />
                </TabsContent>
                <TabsContent value="paid" className="mt-0">
                  <LedgerTable students={students} filter="Paid" />
                </TabsContent>
                <TabsContent value="balance" className="mt-0">
                  <LedgerTable students={students} filter="Balance" />
                </TabsContent>
                <TabsContent value="pending" className="mt-0">
                  <LedgerTable students={students} filter="Pending" />
                </TabsContent>
             </Tabs>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
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

function SidebarContent({ user, handleLogout, activePage }: any) {
  return (
    <div className="flex flex-col h-full p-6 lg:p-0">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-2xl shadow-lg shadow-primary/20">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <span className="text-2xl font-black font-headline tracking-tighter text-white">ScholarlyPay</span>
      </div>
      
      <nav className="space-y-1.5 flex-1">
        <NavItem href="/institution/dashboard" icon={LayoutDashboard} label="Overview" active={activePage === '/institution/dashboard'} />
        <NavItem href="/institution/students" icon={Users} label="Student Directory" active={activePage === '/institution/students'} />
        <NavItem href="/institution/fees" icon={CreditCard} label="Fees Control" active={activePage === '/institution/fees'} />
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10 space-y-5">
        <div className="flex items-center gap-4 px-3 py-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0">
            {user?.email?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold truncate">{user?.email}</span>
            <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Administrator</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white/40 hover:text-white hover:bg-white/10 transition-all rounded-xl h-12" 
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" /> Logout Session
        </Button>
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
          ? "bg-white/10 text-white shadow-lg" 
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`} 
      asChild
    >
      <Link href={href}>
        <Icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${active ? "text-accent" : ""}`} />
        <span className="font-bold tracking-tight">{label}</span>
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
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-[2rem]">
      <div className={`h-1.5 w-full ${colorMap[color] || "bg-primary"}`} />
      <CardHeader className="pb-4 pt-6 px-6">
        <div className="flex items-center justify-between mb-2">
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            {label}
          </CardDescription>
          <div className={`p-2.5 rounded-xl ${colorMap[color]} bg-opacity-10`}>
            <Icon className={`h-4.5 w-4.5 ${color === 'foreground' ? 'text-slate-900' : 'text-' + color}`} />
          </div>
        </div>
        <CardTitle className="text-3xl font-black font-headline tracking-tighter">{value}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {progress !== undefined && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {avatars > 5 && (
              <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                +{avatars - 5}
              </div>
            )}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-4 font-bold opacity-50 uppercase tracking-widest">{description}</p>
      </CardContent>
    </Card>
  );
}

function LedgerTable({ students, filter }: { students: any[] | null, filter: string }) {
  const filtered = useMemo(() => {
    if (!students) return [];
    if (filter === 'All') return students;
    return students.filter(s => s.status === filter);
  }, [students, filter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'Balance': return <Clock className="h-3 w-3 text-orange-500" />;
      case 'Pending': return <AlertCircle className="h-3 w-3 text-destructive" />;
      default: return null;
    }
  };

  return (
    <Card className="border-none shadow-[0_20px_60px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                   <th className="p-6">Student Information</th>
                   <th className="p-6">Academic</th>
                   <th className="p-6 text-right">Commitment</th>
                   <th className="p-6 text-right">Collected</th>
                   <th className="p-6 text-right">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                     <td className="p-6">
                        <div className="flex flex-col">
                           <span className="text-sm font-black text-slate-800">{s.name}</span>
                           <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{s.admissionNumber}</span>
                        </div>
                     </td>
                     <td className="p-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-primary uppercase">{s.grade}</span>
                           <span className="text-[10px] font-bold text-slate-400 tracking-widest">{s.year} {s.term}</span>
                        </div>
                     </td>
                     <td className="p-6 text-right">
                        <span className="text-xs font-black text-slate-600">KES {Number(s.totalFees).toLocaleString()}</span>
                     </td>
                     <td className="p-6 text-right">
                        <span className="text-xs font-black text-primary">KES {Number(s.paidAmount).toLocaleString()}</span>
                     </td>
                     <td className="p-6 text-right">
                        <Badge variant="outline" className={`rounded-xl px-3 py-1 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 ml-auto w-fit ${
                          s.status === 'Paid' ? 'border-green-100 bg-green-50 text-green-600' :
                          s.status === 'Balance' ? 'border-orange-100 bg-orange-50 text-orange-600' :
                          'border-destructive/10 bg-destructive/5 text-destructive'
                        }`}>
                           {getStatusIcon(s.status)} {s.status}
                        </Badge>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
       {filtered.length === 0 && (
         <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner">
               <Users className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest opacity-30">No matching records</p>
         </div>
       )}
    </Card>
  );
}

function ReportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onClick}
      className="rounded-xl px-5 h-10 gap-2 border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm"
    >
      <Download className="h-3.5 w-3.5" /> Export PDF/Report
    </Button>
  );
}

function SectionCard({ title, description, items, href }: any) {
  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 p-6 md:p-8">
        <div>
          <CardTitle className="text-2xl font-black font-headline tracking-tighter">{title}</CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{description}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-primary rounded-xl font-black hover:bg-primary/5">
          <Link href={href}>View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-4">
        {items?.length > 0 ? items.map((item: any) => (
          <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer">
            <div className="flex flex-col">
              <span className="font-black text-sm text-slate-800">{item.title}</span>
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">{item.subtitle}</span>
            </div>
            <Badge 
              variant={item.variant === "destructive" ? "destructive" : "secondary"} 
              className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-tight"
            >
              {item.badge}
            </Badge>
          </div>
        )) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-sm text-muted-foreground font-bold italic">No records to display</p>
          </div>
        )}
        <Button variant="ghost" className="w-full text-primary font-black group rounded-2xl h-14 mt-4" asChild>
          <Link href={href}>
            Explore Full Records <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
