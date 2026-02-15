"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MOCK_STUDENTS, Student } from "@/app/lib/mock-data";
import { 
  Users, 
  Search, 
  TrendingUp, 
  CreditCard, 
  AlertCircle, 
  Plus, 
  LayoutDashboard,
  GraduationCap,
  MessageSquareText,
  Loader2,
  LogOut
} from "lucide-react";
import { generateFeeExplanation } from "@/ai/flows/generate-fee-explanation";
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

export default function InstitutionDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = MOCK_STUDENTS.reduce((acc, s) => acc + s.paidAmount, 0);
  const totalOutstanding = MOCK_STUDENTS.reduce((acc, s) => acc + (s.totalFees - s.paidAmount), 0);

  const handleExplain = async (student: Student) => {
    setIsExplaining(true);
    try {
      const result = await generateFeeExplanation({
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        outstandingBalance: student.totalFees - student.paidAmount,
        dueDate: "2024-05-31",
        additionalContext: "Term 2 tuition and lab fees inclusive."
      });
      setExplanation(result.explanation);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-primary min-h-screen hidden lg:flex flex-col text-white p-6 sticky top-0">
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
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white">
              <Users className="mr-3 h-5 w-5" /> Students
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white">
              <CreditCard className="mr-3 h-5 w-5" /> Fees Management
            </Button>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground">
                AD
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">Admin User</span>
                <span className="text-xs text-white/50 truncate">Head of Admin</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-white/50 hover:text-white hover:bg-white/10" asChild>
              <Link href="/institution/login">
                <LogOut className="mr-3 h-5 w-5" /> Logout
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground font-headline">Institution Overview</h1>
              <p className="text-muted-foreground">Real-time school financial and student tracking</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add New Student
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
                <CardTitle className="text-3xl font-headline font-bold">GHS {totalCollected.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '65%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">65% of projected term revenue collected</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden bg-white group hover:shadow-xl transition-all duration-300">
              <div className="h-1 bg-accent" />
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <AlertCircle className="mr-1.5 h-3 w-3 text-accent" /> Outstanding Balance
                </CardDescription>
                <CardTitle className="text-3xl font-headline font-bold">GHS {totalOutstanding.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: '35%' }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Target collection by end of month</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md overflow-hidden bg-white group hover:shadow-xl transition-all duration-300">
              <div className="h-1 bg-foreground" />
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Users className="mr-1.5 h-3 w-3 text-foreground" /> Active Students
                </CardDescription>
                <CardTitle className="text-3xl font-headline font-bold">{MOCK_STUDENTS.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-muted-foreground" />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">+3 registered this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Student Table */}
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="border-b bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-headline">Student Directory & Fee Status</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search name or ID..." 
                  className="pl-10 h-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Student Name</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Admission #</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Grade</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right">Balance</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{s.name}</span>
                          <span className="text-xs text-muted-foreground">{s.parentName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono">{s.admissionNumber}</td>
                      <td className="p-4 text-sm">{s.grade}</td>
                      <td className="p-4">
                        <Badge variant={s.status === 'Paid' ? 'default' : s.status === 'Balance' ? 'secondary' : 'destructive'} className="rounded-full px-2.5 py-0.5">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-right font-bold">
                        GHS {(s.totalFees - s.paidAmount).toFixed(2)}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 gap-2 border-primary text-primary hover:bg-primary/5"
                              onClick={() => {
                                setSelectedStudent(s);
                                setExplanation("");
                              }}
                            >
                              <MessageSquareText className="h-3.5 w-3.5" /> Explain Fees
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle className="font-headline text-2xl">AI Fee Assistant</DialogTitle>
                              <DialogDescription>
                                Generating a professional explanation for {selectedStudent?.name}'s current balance.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div className="p-4 rounded-xl bg-muted/40 border border-muted min-h-[150px] relative">
                                {isExplaining ? (
                                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                  </div>
                                ) : (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {explanation || "Click the button below to generate a contextual explanation for the parent."}
                                  </p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" onClick={() => setExplanation("")}>Reset</Button>
                              <Button 
                                className="bg-primary text-white" 
                                disabled={isExplaining}
                                onClick={() => selectedStudent && handleExplain(selectedStudent)}
                              >
                                {explanation ? "Regenerate" : "Generate Explanation"}
                              </Button>
                              {explanation && (
                                <Button className="bg-accent text-accent-foreground">Copy to Email</Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" className="h-8 px-3">View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 opacity-20" />
                  No students found matching your criteria.
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
