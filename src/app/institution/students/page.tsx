
"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CreditCard,
  Eye,
  Download,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Stethoscope,
  Clock
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useAuth, useUser, useCollection, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, addDoc, query, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function InstitutionStudents() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [viewingStudent, setViewingStudent] = useState<any>(null);

  const studentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "students"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: students, loading: studentsLoading } = useCollection(studentsQuery);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleAddStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;

    const formData = new FormData(e.currentTarget);
    
    const newStudent = {
      name: formData.get("name") as string,
      admissionNumber: formData.get("admissionNumber") as string,
      grade: formData.get("grade") as string,
      year: formData.get("year") as string,
      term: formData.get("term") as string,
      gender: formData.get("gender") as string,
      dob: formData.get("dob") as string,
      address: formData.get("address") as string,
      parentName: formData.get("parentName") as string,
      parentEmail: formData.get("parentEmail") as string,
      parentPhone: formData.get("parentPhone") as string,
      background: formData.get("background") as string,
      medicalNotes: formData.get("medicalNotes") as string,
      totalFees: Number(formData.get("totalFees")),
      paidAmount: Number(formData.get("paidAmount") || 0),
      status: (Number(formData.get("paidAmount") || 0) >= Number(formData.get("totalFees"))) ? "Paid" : "Balance",
      createdAt: serverTimestamp()
    };

    addDoc(collection(db, "students"), newStudent)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'students',
          operation: 'create',
          requestResourceData: newStudent,
        }));
      });

    setIsAddingStudent(false);
    toast({
      title: "Success",
      description: "Student record has been registered.",
    });
  };

  const handleUpdateStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || !editingStudent) return;

    const formData = new FormData(e.currentTarget);
    const totalFees = Number(formData.get("totalFees"));
    const paidAmount = Number(editingStudent.paidAmount || 0);
    const status = paidAmount >= totalFees ? "Paid" : "Balance";

    const updatedData = {
      name: formData.get("name") as string,
      admissionNumber: formData.get("admissionNumber") as string,
      grade: formData.get("grade") as string,
      year: formData.get("year") as string,
      term: formData.get("term") as string,
      gender: formData.get("gender") as string,
      dob: formData.get("dob") as string,
      address: formData.get("address") as string,
      parentName: formData.get("parentName") as string,
      parentEmail: formData.get("parentEmail") as string,
      parentPhone: formData.get("parentPhone") as string,
      background: formData.get("background") as string,
      medicalNotes: formData.get("medicalNotes") as string,
      totalFees: totalFees,
      status: status
    };

    const studentRef = doc(db, "students", editingStudent.id);
    updateDoc(studentRef, updatedData)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: studentRef.path,
          operation: 'update',
          requestResourceData: updatedData,
        }));
      });

    setEditingStudent(null);
    toast({
      title: "Success",
      description: "Student record updated successfully.",
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!db || !window.confirm("Are you sure you want to delete this student record?")) return;

    const studentRef = doc(db, "students", studentId);
    deleteDoc(studentRef)
      .catch(async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: studentRef.path,
          operation: 'delete',
        }));
      });

    toast({
      title: "Success",
      description: "Student record has been removed.",
    });
  };

  const downloadStudentInfo = (student: any) => {
    const info = `
STUDENT REPORT: ${student.name}
-----------------------------------
Admission #: ${student.admissionNumber}
Academic Period: ${student.year || 'N/A'} - ${student.term || 'N/A'}
Grade: ${student.grade}
Gender: ${student.gender || 'N/A'}
DOB: ${student.dob || 'N/A'}
Address: ${student.address || 'N/A'}

PARENT CONTACT:
Name: ${student.parentName}
Email: ${student.parentEmail}
Phone: ${student.parentPhone}

FINANCIAL STATUS:
Total Fees: KES ${Number(student.totalFees).toLocaleString()}
Paid Amount: KES ${Number(student.paidAmount).toLocaleString()}
Outstanding Balance: KES ${(Number(student.totalFees) - Number(student.paidAmount)).toLocaleString()}
Status: ${student.status}

ADDITIONAL INFO:
Background: ${student.background || 'N/A'}
Medical Notes: ${student.medicalNotes || 'N/A'}

Generated by ScholarlyPay on ${new Date().toLocaleDateString()}
    `;
    
    const element = document.createElement("a");
    const file = new Blob([info], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${student.admissionNumber}_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download Started",
      description: `Report for ${student.name} is being downloaded.`,
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
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleAddStudent}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Register New Student</DialogTitle>
                    <DialogDescription>
                      Enter comprehensive student and financial details.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> Academic Information
                      </h4>
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
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade / Class</Label>
                          <Input id="grade" name="grade" placeholder="Primary 4" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Academic Year</Label>
                          <Select name="year" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                              <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="term">Term</Label>
                          <Select name="term" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Term 1">Term 1</SelectItem>
                              <SelectItem value="Term 2">Term 2</SelectItem>
                              <SelectItem value="Term 3">Term 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select name="gender" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth</Label>
                          <Input id="dob" name="dob" type="date" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Residential Address</Label>
                        <Input id="address" name="address" placeholder="123 Nairobi St, Westlands" />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Parent / Guardian Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parentName">Guardian Name</Label>
                          <Input id="parentName" name="parentName" placeholder="Sarah Thompson" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parentPhone">Phone Number</Label>
                          <Input id="parentPhone" name="parentPhone" placeholder="+254 700 000000" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentEmail">Email Address</Label>
                        <Input id="parentEmail" name="parentEmail" type="email" placeholder="sarah@example.com" required />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Financial Setup
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="totalFees">Total Fees (KES)</Label>
                          <Input id="totalFees" name="totalFees" type="number" placeholder="50000" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paidAmount">Initial Deposit (KES)</Label>
                          <Input id="paidAmount" name="paidAmount" type="number" placeholder="0" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" /> Additional Information
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="background">Background / Notes</Label>
                        <Textarea id="background" name="background" placeholder="Any special achievements or character notes..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medicalNotes">Medical Notes</Label>
                        <Textarea id="medicalNotes" name="medicalNotes" placeholder="Allergies, chronic conditions, etc." />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6">
                    <Button variant="outline" type="button" onClick={() => setIsAddingStudent(false)}>Cancel</Button>
                    <Button type="submit">Register Student</Button>
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
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Period</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Parent Info</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-right text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s: any) => (
                    <tr key={s.id} className="border-b hover:bg-muted/5 transition-colors group">
                      <td className="p-4">
                        <span className="font-bold text-sm text-foreground">{s.name}</span>
                        <div className="text-[10px] text-muted-foreground font-medium">{s.grade}</div>
                      </td>
                      <td className="p-4 text-sm font-mono text-muted-foreground">{s.admissionNumber}</td>
                      <td className="p-4 text-xs font-medium">
                        <div className="flex flex-col">
                          <span>{s.year}</span>
                          <span className="opacity-70">{s.term}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{s.parentName}</span>
                          <span className="text-xs text-muted-foreground">{s.parentPhone}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => setViewingStudent(s)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => setEditingStudent(s)}
                        >
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
              {filteredStudents.length === 0 && !studentsLoading && (
                <div className="p-12 text-center text-muted-foreground italic">
                  No students found in the directory.
                </div>
              )}
            </div>
          </Card>

          {/* View Student Dialog */}
          <Dialog open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)}>
            <DialogContent className="sm:max-w-[600px]">
              {viewingStudent && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-start pr-8">
                      <div>
                        <DialogTitle className="text-3xl font-headline">{viewingStudent.name}</DialogTitle>
                        <DialogDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="font-mono">{viewingStudent.admissionNumber}</Badge>
                          <Badge className="bg-primary text-white">{viewingStudent.grade}</Badge>
                        </DialogDescription>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => downloadStudentInfo(viewingStudent)}
                      >
                        <Download className="h-4 w-4" /> Download Report
                      </Button>
                    </div>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Academic Status</Label>
                          <div className="mt-2 space-y-2 text-sm">
                            <p className="flex items-center gap-2 font-bold text-primary"><Clock className="h-3.5 w-3.5 opacity-50" /> {viewingStudent.year} - {viewingStudent.term}</p>
                            <p className="flex items-center gap-2"><UserIcon className="h-3.5 w-3.5 opacity-50" /> {viewingStudent.gender || 'N/A'}</p>
                            <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 opacity-50" /> {viewingStudent.dob || 'N/A'}</p>
                            <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 opacity-50" /> {viewingStudent.address || 'N/A'}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Financial Status</Label>
                          <div className="mt-2 p-3 rounded-lg bg-muted/40 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Total Fees</span>
                              <span className="font-bold">KES {Number(viewingStudent.totalFees).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-primary">
                              <span>Paid</span>
                              <span className="font-bold">KES {Number(viewingStudent.paidAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-destructive border-t pt-1 mt-1">
                              <span>Balance</span>
                              <span className="font-bold">KES {(Number(viewingStudent.totalFees) - Number(viewingStudent.paidAmount)).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Guardian Information</Label>
                          <div className="mt-2 space-y-2 text-sm">
                            <p className="font-bold">{viewingStudent.parentName}</p>
                            <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5 opacity-50" /> {viewingStudent.parentPhone}</p>
                            <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5 opacity-50" /> {viewingStudent.parentEmail}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Medical & Background</Label>
                          <div className="mt-2 space-y-3">
                            <div className="p-2 rounded bg-destructive/5 text-[11px] border border-destructive/10">
                              <span className="font-bold flex items-center gap-1 mb-1"><Stethoscope className="h-3 w-3" /> Medical</span>
                              {viewingStudent.medicalNotes || "No medical records noted."}
                            </div>
                            <div className="text-[11px] text-muted-foreground italic">
                              "{viewingStudent.background || "No additional background information available."}"
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="border-t pt-4">
                    <Button variant="ghost" onClick={() => setViewingStudent(null)}>Close Profile</Button>
                    <Button onClick={() => { setViewingStudent(null); setEditingStudent(viewingStudent); }}>Edit Records</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Student Dialog */}
          <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              {editingStudent && (
                <form onSubmit={handleUpdateStudent}>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Edit Student Record</DialogTitle>
                    <DialogDescription>
                      Modify detailed records for {editingStudent.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> Academic Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Full Name</Label>
                          <Input id="edit-name" name="name" defaultValue={editingStudent.name} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-admissionNumber">Admission #</Label>
                          <Input id="edit-admissionNumber" name="admissionNumber" defaultValue={editingStudent.admissionNumber} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-grade">Grade / Class</Label>
                          <Input id="edit-grade" name="grade" defaultValue={editingStudent.grade} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-year">Academic Year</Label>
                          <Select name="year" defaultValue={editingStudent.year}>
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024">2024</SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                              <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-term">Term</Label>
                          <Select name="term" defaultValue={editingStudent.term}>
                            <SelectTrigger>
                              <SelectValue placeholder="Term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Term 1">Term 1</SelectItem>
                              <SelectItem value="Term 2">Term 2</SelectItem>
                              <SelectItem value="Term 3">Term 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-gender">Gender</Label>
                          <Select name="gender" defaultValue={editingStudent.gender}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-dob">Date of Birth</Label>
                          <Input id="edit-dob" name="dob" type="date" defaultValue={editingStudent.dob} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-address">Residential Address</Label>
                        <Input id="edit-address" name="address" defaultValue={editingStudent.address} />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Guardian Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-parentName">Guardian Name</Label>
                          <Input id="edit-parentName" name="parentName" defaultValue={editingStudent.parentName} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-parentPhone">Phone</Label>
                          <Input id="edit-parentPhone" name="parentPhone" defaultValue={editingStudent.parentPhone} required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-parentEmail">Email</Label>
                        <Input id="edit-parentEmail" name="parentEmail" type="email" defaultValue={editingStudent.parentEmail} required />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Financials
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="edit-totalFees">Total Fees (KES)</Label>
                        <Input id="edit-totalFees" name="totalFees" type="number" defaultValue={editingStudent.totalFees} required />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" /> Notes
                      </h4>
                      <div className="space-y-2">
                        <Label htmlFor="edit-background">Background / Notes</Label>
                        <Textarea id="edit-background" name="background" defaultValue={editingStudent.background} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-medicalNotes">Medical Notes</Label>
                        <Textarea id="edit-medicalNotes" name="medicalNotes" defaultValue={editingStudent.medicalNotes} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6">
                    <Button variant="outline" type="button" onClick={() => setEditingStudent(null)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
