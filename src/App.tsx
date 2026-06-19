import { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  Users, 
  UserSquare2, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  School,
  CalendarDays,
  Menu,
  X,
  LogOut,
  Sparkles
} from 'lucide-react';

import { 
  SchoolInfo, 
  Student, 
  Teacher, 
  Classroom, 
  SppInvoice, 
  StudentReport, 
  AdministrativeLetter 
} from './types';

import { 
  initialSchoolInfo, 
  initialStudents, 
  initialTeachers, 
  initialClassrooms, 
  initialSppInvoices, 
  initialStudentReports, 
  initialLetters 
} from './mockData';

// Subcomponents import
import Dashboard from './components/Dashboard';
import StudentsManager from './components/StudentsManager';
import TeachersManager from './components/TeachersManager';
import ClassesManager from './components/ClassesManager';
import FinanceManager from './components/FinanceManager';
import AcademicManager from './components/AcademicManager';
import LetterManager from './components/LetterManager';
import SettingsManager from './components/SettingsManager';

export default function App() {
  // Mobile navigation menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States with lazy initializations linked to LocalStorage
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    const saved = localStorage.getItem('sch_schoolInfo');
    return saved ? JSON.parse(saved) : initialSchoolInfo;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sch_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('sch_teachers');
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [classes, setClasses] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem('sch_classes');
    return saved ? JSON.parse(saved) : initialClassrooms;
  });

  const [invoices, setInvoices] = useState<SppInvoice[]>(() => {
    const saved = localStorage.getItem('sch_invoices');
    return saved ? JSON.parse(saved) : initialSppInvoices;
  });

  const [reports, setReports] = useState<StudentReport[]>(() => {
    const saved = localStorage.getItem('sch_reports');
    return saved ? JSON.parse(saved) : initialStudentReports;
  });

  const [letters, setLetters] = useState<AdministrativeLetter[]>(() => {
    const saved = localStorage.getItem('sch_letters');
    return saved ? JSON.parse(saved) : initialLetters;
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('sch_activeTab');
    return saved || 'dashboard';
  });

  // Effect triggers to periodically backup states to LocalStorage
  useEffect(() => {
    localStorage.setItem('sch_schoolInfo', JSON.stringify(schoolInfo));
  }, [schoolInfo]);

  useEffect(() => {
    localStorage.setItem('sch_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sch_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('sch_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('sch_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('sch_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('sch_letters', JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    localStorage.setItem('sch_activeTab', activeTab);
  }, [activeTab]);

  // DB Mutators / State Modifiers
  const handleAddStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    // Synchronize matching name inside reports / invoices
    setInvoices(prev => prev.map(inv => inv.studentId === updatedStudent.id ? { 
      ...inv, 
      studentName: updatedStudent.name,
      className: updatedStudent.className
    } : inv));
    setReports(prev => prev.map(rep => rep.studentId === updatedStudent.id ? { 
      ...rep, 
      studentName: updatedStudent.name,
      className: updatedStudent.className
    } : rep));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleAddTeacher = (teacher: Teacher) => {
    setTeachers(prev => [...prev, teacher]);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    // Synchronize guardian name on classes
    setClasses(prev => prev.map(cls => cls.guardianTeacherId === updatedTeacher.id ? {
      ...cls,
      guardianTeacherName: updatedTeacher.name
    } : cls));
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const handleAddClass = (newClass: Classroom) => {
    setClasses(prev => [...prev, newClass]);
  };

  const handleUpdateClass = (updatedClass: Classroom) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };

  const handleDeleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const handleAddInvoice = (newInv: SppInvoice) => {
    setInvoices(prev => [newInv, ...prev]);
  };

  const handleUpdateInvoice = (updatedInv: SppInvoice) => {
    setInvoices(prev => prev.map(i => i.id === updatedInv.id ? updatedInv : i));
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const handleBulkGeneratePrices = (month: string, year: number, amount: number) => {
    const activeStudentList = students.filter(s => s.status === 'Aktif');
    const newInvoices: SppInvoice[] = [];

    activeStudentList.forEach(student => {
      // Avoid creating double invoices
      const hasBill = invoices.some(
        i => i.studentId === student.id && i.month === month && i.year === year
      );

      if (!hasBill) {
        newInvoices.push({
          id: 'f-bulk-' + student.id + '-' + month + '-' + year,
          studentId: student.id,
          studentName: student.name,
          className: student.className,
          month: month,
          year: year,
          amount: amount,
          status: 'Belum Lunas'
        });
      }
    });

    if (newInvoices.length > 0) {
      setInvoices(prev => [...newInvoices, ...prev]);
    }
  };

  const handleAddReport = (newRep: StudentReport) => {
    setReports(prev => [...prev, newRep]);
  };

  const handleUpdateReport = (updatedRep: StudentReport) => {
    setReports(prev => prev.map(r => r.id === updatedRep.id ? updatedRep : r));
  };

  const handleAddLetter = (newLet: AdministrativeLetter) => {
    setLetters(prev => [newLet, ...prev]);
  };

  const handleUpdateLetter = (updatedLet: AdministrativeLetter) => {
    setLetters(prev => prev.map(l => l.id === updatedLet.id ? updatedLet : l));
  };

  const handleDeleteLetter = (id: string) => {
    setLetters(prev => prev.filter(l => l.id !== id));
  };

  // Profile mutator
  const handleUpdateSchoolInfo = (info: SchoolInfo) => {
    setSchoolInfo(info);
  };

  // EXPORT entire Local Storage State to single JSON download
  const handleExportBackup = () => {
    const backupDb = {
      schoolInfo,
      students,
      teachers,
      classes,
      invoices,
      reports,
      letters
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupDb, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BACKUP_SISADMIN_${schoolInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // IMPORT JSON structure back into React state
  const handleImportBackup = (backupJson: string): boolean => {
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.schoolInfo) setSchoolInfo(parsed.schoolInfo);
      if (parsed.students) setStudents(parsed.students);
      if (parsed.teachers) setTeachers(parsed.teachers);
      if (parsed.classes) setClasses(parsed.classes);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.reports) setReports(parsed.reports);
      if (parsed.letters) setLetters(parsed.letters);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Reset to default factory preset skenario
  const handleResetToDemo = () => {
    setSchoolInfo(initialSchoolInfo);
    setStudents(initialStudents);
    setTeachers(initialTeachers);
    setClasses(initialClassrooms);
    setInvoices(initialSppInvoices);
    setReports(initialStudentReports);
    setLetters(initialLetters);
  };

  // Simple clean screen tab selector routing
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            students={students} 
            teachers={teachers} 
            classes={classes} 
            invoices={invoices}
            setActiveTab={setActiveTab}
            schoolName={schoolInfo.name}
          />
        );
      case 'students':
        return (
          <StudentsManager 
            students={students}
            classes={classes}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case 'teachers':
        return (
          <TeachersManager 
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        );
      case 'classes':
        return (
          <ClassesManager 
            classes={classes}
            teachers={teachers}
            students={students}
            onAddClass={handleAddClass}
            onUpdateClass={handleUpdateClass}
            onDeleteClass={handleDeleteClass}
          />
        );
      case 'finance':
        return (
          <FinanceManager 
            invoices={invoices}
            students={students}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onBulkGenerate={handleBulkGeneratePrices}
          />
        );
      case 'academic':
        return (
          <AcademicManager 
            reports={reports}
            students={students}
            schoolInfo={schoolInfo}
            onAddReport={handleAddReport}
            onUpdateReport={handleUpdateReport}
          />
        );
      case 'letters':
        return (
          <LetterManager 
            letters={letters}
            students={students}
            teachers={teachers}
            schoolInfo={schoolInfo}
            onAddLetter={handleAddLetter}
            onUpdateLetter={handleUpdateLetter}
            onDeleteLetter={handleDeleteLetter}
          />
        );
      case 'settings':
        return (
          <SettingsManager 
            schoolInfo={schoolInfo}
            onUpdateSchoolInfo={handleUpdateSchoolInfo}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetToDemo={handleResetToDemo}
          />
        );
      default:
        return <Dashboard students={students} teachers={teachers} classes={classes} invoices={invoices} setActiveTab={setActiveTab} schoolName={schoolInfo.name} />;
    }
  };

  return (
    <div id="school-sys-root" className="min-h-screen bg-slate-100 flex flex-col font-sans text-neutral-800 antialiased selection:bg-indigo-650 selection:bg-indigo-600 selection:text-white">
      
      {/* Dynamic Top Indicator Warning Bar for Print Previewing */}
      <div className="bg-slate-900 text-slate-100 px-4 py-1.5 text-center text-[11px] font-bold tracking-wide flex items-center justify-center gap-1 shrink-0 print:hidden border-b border-indigo-950/20">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>SISTEM ADMINISTRASI TATA USAHA &bull; PORTAL UTAMA {schoolInfo.name.toUpperCase()} (BISA DI-EDIT & DI-BACKUP)</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row print:block">
        
        {/* SIDENAV: Main vertical navigation drawer (Hidden on print) */}
        <aside className="w-full md:w-68 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 print:hidden">
          
          <div className="flex flex-col">
            {/* School Profile and Emblem header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-650 bg-indigo-600 rounded-xl text-white shadow-md">
                  <School className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-extrabold text-sm text-white tracking-tight truncate">{schoolInfo.name}</h2>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wide mt-1">Sistem Tata Usaha</p>
                </div>
              </div>

              {/* Mobile menu trigger */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Sembunyikan Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Menu Links */}
            <nav className={`p-4 space-y-1 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
              {[
                { id: 'dashboard', label: 'Dashboard Hub', icon: HomeIcon },
                { id: 'students', label: 'Peserta Didik (Siswa)', icon: Users },
                { id: 'teachers', label: 'Tenaga Pendidik (Guru)', icon: UserSquare2 },
                { id: 'classes', label: 'Rombongan Kelas', icon: School },
                { id: 'finance', label: 'Keuangan SPP', icon: CreditCard },
                { id: 'academic', label: 'Rapor Nilai Siswa', icon: GraduationCap },
                { id: 'letters', label: 'Layanan Naskah Surat', icon: FileText },
                { id: 'settings', label: 'Pengaturan & Backup', icon: SettingsIcon },
              ].map((menu) => {
                const IconComp = menu.icon;
                const isActive = activeTab === menu.id;

                return (
                  <button
                    key={menu.id}
                    id={`sidebar-link-${menu.id}`}
                    onClick={() => {
                      setActiveTab(menu.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer active:scale-98 ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/40' 
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{menu.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* School details metadata */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-[10px] text-slate-500 space-y-1 font-mono hidden md:block">
            <p>PELAJARAN: {schoolInfo.academicYear}</p>
            <p>SEMESTER: {schoolInfo.semester.toUpperCase()}</p>
            <p className="text-slate-400 italic">Akreditasi: BAN-S/M "{schoolInfo.accreditation.charAt(0)}"</p>
          </div>
        </aside>

        {/* CONTAINER WORKSPACE: Dashboard rendering section */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full print:p-0">
          {renderActiveComponent()}
        </main>
      </div>

      {/* FOOTER: System metadata credits and statuses (Hidden on print) */}
      <footer className="bg-white border-t border-neutral-200 py-3.5 px-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-450 text-neutral-500 shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
          <span>{schoolInfo.name} &bull; Basis Data Administrasi Terintegrasi</span>
        </div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span className="font-semibold text-emerald-600">● Database Sinkron (LocalStorage)</span>
          <span>v1.2.0 - Stable Edition</span>
        </div>
      </footer>
    </div>
  );
}
