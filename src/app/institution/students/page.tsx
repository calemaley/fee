
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Search, 
  Plus, 
  LayoutDashboard,
  GraduationCap,
  Loader2,
  LogOut,
  ChevronRight,
  Trash2,
  Edit2,
  CreditCard
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
import { collection, addDoc, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function InstitutionStudents() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time student data
  const studentsQuery = useMemo(() => {
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

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const newStudent = {
      name: formData.get("name") as string,
      admissionNumber: formData.get("admissionNumber") as string,
      grade: formData.get("grade") as string,
      parentName: formData.get("parentName") as string,
      parentEmail: formData.get("parentEmail") as string,
      totalFees: Number(formData.get("totalFees")),
      paidAmount: Number(formData.get("paidAmount") || 0),
      status: (Number(formData.get("paidAmount") || 0) >= Number(formData.get("totalFees"))) ? "Paid" : "Balance",
      createdAt: new Date().toISOString()
    };

    const studentsCol = collection(db, "students");
    
    addDoc(studentsCol, newStudent)
      .then(() => {
        setIsAddingStudent(false);
        toast({
          title: "Student Added",
          description: `${newStudent.name} has been successfully registered.`,
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'students',
          operation: 'create',
          requestResourceData: newStudent,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!db || !window.confirm("Are you sure you want to delete this student record?")) return;

    const studentDoc = doc(db, "students", studentId);
    deleteDoc(studentDoc)
      .then(() => {
        toast({
          title: "Student Deleted",
          description: "Record has been removed from the directory.",
        });
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: studentDoc.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
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
        <p className="text-muted-foreground font-medium">Synchronizing student directory...</p>
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
            <Button variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/institution/dashboard">
                <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-white/10 bg-white/10" asChild>
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
              <h1 className="text-3xl font-extrabold text-foreground font-headline">Student Management</h1>
              <p className="text-muted-foreground flex items-center gap-1.5">
                Directory & Registration <ChevronRight className="h-3.5 w-3.5" /> <span className="text-primary font-medium">{filteredStudents.length} Students</span>
              </p>
            </div>
            
            <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 h-11 px-6 shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> Register New Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleAddStudent}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Register New Student</DialogTitle>
                    <DialogDescription>
                      Enter student and financial details to add them to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="Emma Thompson" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admissionNumber">Admission #</Label>
                        <Input id="admissionNumber" name="admissionNumber" placeholder="SCH-2024-001" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade / Class</Label>
                        <Input id="grade" name="grade" placeholder="Primary 4" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalFees">Total Fees (KES)</Label>
                        <Input id="totalFees" name="totalFees" type="number" placeholder="50000" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent / Guardian Name</Label>
                      <Input id="parentName" name="parentName" placeholder="Sarah Thompson" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parentEmail">Parent Email</Label>
                      <Input id="parentEmail" name="parentEmail" type="email" placeholder="sarah@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paidAmount">Initial Deposit (KES)</Label>
                      <Input id="paidAmount" name="paidAmount" type="number" placeholder="0" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddingStudent(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Register Student
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </header>

          <Card className="border-none shadow-xl bg-white overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="border-b bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-headline">Student Directory</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search name or ID..." 
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
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Student Name</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Admission #</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Grade</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Parent Info</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s: any) => (
                    <tr key={s.id} className="border-b hover:bg-muted/5 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-sm text-foreground">{s.name}</span>
                      </td>
                      <td className="p-4 text-sm font-mono text-muted-foreground">{s.admissionNumber}</td>
                      <td className="p-4 text-sm">{s.grade}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm">{s.parentName}</span>
                          <span className="text-xs text-muted-foreground">{s.parentEmail}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteStudent(s.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="p-20 text-center text-muted-foreground flex flex-col items-center gap-4">
                  <div className="bg-muted/50 p-6 rounded-full">
                    <Search className="h-10 w-10 opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">No students found</p>
                    <p className="text-sm">Try adjusting your search or add a new student.</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
