import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Search, 
  GraduationCap, 
  Printer, 
  X, 
  Check, 
  AlertTriangle,
  Award,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { StudentReport, Student, SchoolInfo } from '../types';

interface AcademicManagerProps {
  reports: StudentReport[];
  students: Student[];
  schoolInfo: SchoolInfo;
  onAddReport: (newReport: StudentReport) => void;
  onUpdateReport: (updatedReport: StudentReport) => void;
}

export default function AcademicManager({
  reports,
  students,
  schoolInfo,
  onAddReport,
  onUpdateReport
}: AcademicManagerProps) {
  // Query
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rapor selection
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // UI Panels
  const [isEditing, setIsEditing] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Form State for editing grades
  const [formReport, setFormReport] = useState<Partial<StudentReport>>({});
  const [formError, setFormError] = useState('');

  // Find selected student details
  const activeStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const activeReport = activeStudent 
    ? reports.find(r => r.studentId === activeStudent.id) 
    : undefined;

  // Handle open editor
  const handleStartEdit = () => {
    if (!activeStudent) return;

    if (activeReport) {
      setFormReport({ ...activeReport });
    } else {
      // Build default clean new report template
      setFormReport({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        className: activeStudent.className,
        semester: schoolInfo.semester,
        academicYear: schoolInfo.academicYear,
        mathematics: 75,
        science: 75,
        english: 75,
        indonesian: 75,
        civics: 75,
        religion: 75,
        physicalEd: 75,
        art: 75,
        sickDays: 0,
        excusedDays: 0,
        unexcusedDays: 0,
        conduct: 'Baik',
        notes: ''
      });
    }
    setFormError('');
    setIsEditing(true);
  };

  // Submit edits
  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Verification check range (0 - 100)
    const validateGrade = (grade: any) => {
      const g = parseInt(grade) || 0;
      return g >= 0 && g <= 100;
    };

    if (
      !validateGrade(formReport.mathematics) ||
      !validateGrade(formReport.science) ||
      !validateGrade(formReport.english) ||
      !validateGrade(formReport.indonesian) ||
      !validateGrade(formReport.civics) ||
      !validateGrade(formReport.religion) ||
      !validateGrade(formReport.physicalEd) ||
      !validateGrade(formReport.art)
    ) {
      setFormError('Semua nilai mata pelajaran wajib berupa angka dalam range 0 sampai 100.');
      return;
    }

    if (activeReport) {
      // update
      onUpdateReport({
        ...activeReport,
        ...formReport
      } as StudentReport);
    } else {
      // add new
      const newReport: StudentReport = {
        id: 'r-' + Date.now(),
        ...(formReport as Omit<StudentReport, 'id'>)
      } as StudentReport;
      onAddReport(newReport);
    }

    setIsEditing(false);
  };

  // Convert raw value to Letter Grade
  const getLetterGrade = (score: number) => {
    if (score >= 90) return { letter: 'A', text: 'Sangat Baik' };
    if (score >= 80) return { letter: 'B', text: 'Baik' };
    if (score >= 70) return { letter: 'C', text: 'Cukup' };
    return { letter: 'D', text: 'Kurang' };
  };

  // Compute average
  const getAverage = (rep: StudentReport) => {
    const total = 
      rep.mathematics + rep.science + rep.english + rep.indonesian + 
      rep.civics + rep.religion + rep.physicalEd + rep.art;
    return Math.round((total / 8) * 10) / 10;
  };

  // Filter Active / Registered students
  const filteredStudents = students.filter(student => {
    return student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           student.nisn.includes(searchTerm) ||
           student.className.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Sidebar search index of Students */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden h-[580px] flex flex-col">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/50">
          <h3 className="font-bold text-neutral-800 text-sm flex items-center gap-1.5 uppercase tracking-wide">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Pilih Siswa & Rapor</span>
          </h3>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Cari nama atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
            />
          </div>
        </div>

        {/* Scroll Student Items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {filteredStudents.map((student) => {
            const hasReportOnDb = reports.some(r => r.studentId === student.id);
            const isSelected = selectedStudentId === student.id || (!selectedStudentId && students[0]?.id === student.id);

            return (
              <div 
                key={student.id}
                id={`student-rapor-select-${student.id}`}
                onClick={() => { 
                  setSelectedStudentId(student.id); 
                  setIsEditing(false); 
                }}
                className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-55 bg-emerald-50/60 border-l-4 border-emerald-600' : 'hover:bg-neutral-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 truncate">{student.name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">NISN: {student.nisn} • Kelas {student.className}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    hasReportOnDb ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-red-700'
                  }`}>
                    {hasReportOnDb ? 'Terisi' : 'Kosong'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-neutral-300'}`} />
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <p className="text-xs text-neutral-400 text-center py-6">Siswa tidak terdaftar.</p>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN (2/3 width on desktop): Rapor Inspector / Editor */}
      <div className="lg:col-span-2 space-y-6">
        {activeStudent ? (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between">
            {/* Inner Inspector Header */}
            <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">INSPEKTOR AKADEMIS</span>
                <h2 className="text-xl font-extrabold text-neutral-800 mt-0.5">{activeStudent.name}</h2>
                <p className="text-xs text-neutral-500">Kelas: {activeStudent.className} | Angkatan Semester: {schoolInfo.academicYear} ({schoolInfo.semester})</p>
              </div>

              {!isEditing && (
                <div className="flex gap-2">
                  <button 
                    id="btn-input-rapor"
                    onClick={handleStartEdit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{activeReport ? 'Edit Nilai Rapor' : 'Isi Rapor Pertama Kali'}</span>
                  </button>
                  {activeReport && (
                    <button 
                      id="btn-print-rapor"
                      onClick={() => setIsPrintPreviewOpen(true)}
                      className="border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Kertas Rapor</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1">
              {isEditing ? (
                /* Edit Grade Form layout */
                <form onSubmit={handleSaveGrades} className="space-y-4">
                  <h3 className="font-bold text-sm text-neutral-800 border-b border-neutral-100 pb-2">INPUT DATA AKADEMIS</h3>
                  
                  {formError && (
                    <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs font-semibold rounded-r-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Math */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Matematika</label>
                      <input 
                        type="number" min={0} max={100} 
                        value={formReport.mathematics || 0}
                        onChange={(e) => setFormReport({ ...formReport, mathematics: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Science */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">IPA</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.science || 0}
                        onChange={(e) => setFormReport({ ...formReport, science: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Eng */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Bahasa Inggris</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.english || 0}
                        onChange={(e) => setFormReport({ ...formReport, english: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Indo */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Bahasa Indonesia</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.indonesian || 0}
                        onChange={(e) => setFormReport({ ...formReport, indonesian: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Civics */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Civics / PKn</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.civics || 0}
                        onChange={(e) => setFormReport({ ...formReport, civics: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Religion */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Pendidikan Agama</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.religion || 0}
                        onChange={(e) => setFormReport({ ...formReport, religion: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* PJOK */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">PJOK (Olahraga)</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.physicalEd || 0}
                        onChange={(e) => setFormReport({ ...formReport, physicalEd: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Seni */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Seni & Budaya</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.art || 0}
                        onChange={(e) => setFormReport({ ...formReport, art: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-neutral-800 border-b border-neutral-100 pt-2 pb-1">ABSENSI & KELAKUAN</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Sakit */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Sakit (Hari)</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.sickDays || 0}
                        onChange={(e) => setFormReport({ ...formReport, sickDays: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Izin */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Izin (Hari)</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.excusedDays || 0}
                        onChange={(e) => setFormReport({ ...formReport, excusedDays: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Alpa */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Alpa (Tanpa Ket)</label>
                      <input 
                        type="number" min={0} max={100}
                        value={formReport.unexcusedDays || 0}
                        onChange={(e) => setFormReport({ ...formReport, unexcusedDays: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-1.5 text-xs text-center border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                        required
                      />
                    </div>
                    {/* Kelakuan */}
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 mb-1">Predikat Sikap</label>
                      <select 
                        value={formReport.conduct || 'Baik'}
                        onChange={(e) => setFormReport({ ...formReport, conduct: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-xs border border-neutral-200 rounded-lg focus:outline-hidden bg-white"
                      >
                        <option value="Amat Baik">Amat Baik</option>
                        <option value="Baik">Baik</option>
                        <option value="Cukup">Cukup</option>
                        <option value="Kurang">Kurang</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1">Catatan Pendidik / Wali Kelas</label>
                    <textarea 
                      value={formReport.notes || ''}
                      onChange={(e) => setFormReport({ ...formReport, notes: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg min-h-[60px] focus:outline-hidden bg-white"
                      placeholder="Masukkan apresiasi serta motivasi bimbingan belajar bagi siswa..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-600 hover:bg-neutral-150 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      id="btn-save-rapor"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan Rapor Siswa</span>
                    </button>
                  </div>
                </form>
              ) : activeReport ? (
                /* Inspection View of the Grades */
                <div className="space-y-6">
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                      <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Rerata Nilai</p>
                      <p className="text-xl font-black text-emerald-800 mt-1">{getAverage(activeReport)}</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">Skala KKM (75)</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                      <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Nilai Karakter</p>
                      <p className="text-xl font-black text-indigo-700 mt-1">{activeReport.conduct}</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">Sikap Terpuji</p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                      <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Absen Alpa</p>
                      <p className="text-xl font-black text-rose-700 mt-1">{activeReport.unexcusedDays} Hari</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">Sakit: {activeReport.sickDays} | Izin: {activeReport.excusedDays}</p>
                    </div>
                  </div>

                  {/* Grades Matrix Grid */}
                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 font-bold text-neutral-600 uppercase">
                          <th className="px-4 py-3">No</th>
                          <th className="px-4 py-3">Mata Pelajaran (Mapel)</th>
                          <th className="px-4 py-3 text-center">Kriteria KKM</th>
                          <th className="px-4 py-3 text-center">Angka</th>
                          <th className="px-4 py-3 text-center">Predikat</th>
                          <th className="px-4 py-3">Keterangan Capaian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {[
                          { name: 'Matematika', score: activeReport.mathematics },
                          { name: 'Ilmu Pengetahuan Alam (IPA)', score: activeReport.science },
                          { name: 'Bahasa Inggris', score: activeReport.english },
                          { name: 'Bahasa Indonesia', score: activeReport.indonesian },
                          { name: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)', score: activeReport.civics },
                          { name: 'Pendidikan Agama & Budi Pekerti', score: activeReport.religion },
                          { name: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)', score: activeReport.physicalEd },
                          { name: 'Seni Budaya & Prakarya', score: activeReport.art }
                        ].map((sub, idx) => {
                          const letterObj = getLetterGrade(sub.score);
                          return (
                            <tr key={idx} className="hover:bg-neutral-50/50">
                              <td className="px-4 py-2 text-neutral-400 font-mono">{idx + 1}</td>
                              <td className="px-4 py-2 font-bold text-neutral-750">{sub.name}</td>
                              <td className="px-4 py-2 text-center text-neutral-600">75</td>
                              <td className={`px-4 py-2 text-center font-black ${
                                sub.score < 75 ? 'text-rose-600' : 'text-emerald-700'
                              }`}>{sub.score}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                  sub.score >= 90 ? 'bg-indigo-50 text-indigo-700' :
                                  sub.score >= 80 ? 'bg-emerald-50 text-emerald-700' :
                                  sub.score >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                                }`}>{letterObj.letter}</span>
                              </td>
                              <td className="px-4 py-2 text-neutral-550 truncate max-w-[180px]">{letterObj.text}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Notes Card Info */}
                  <div className="bg-slate-50 border border-neutral-200/80 rounded-xl p-4">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-neutral-700 mb-1 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>Catatan Pembina / Wali Rombel</span>
                    </h4>
                    <p className="text-xs text-neutral-700 italic leading-relaxed">
                      "{activeReport.notes || 'Belum ada catatan wali kelas yang ditambahkan.'}"
                    </p>
                  </div>
                </div>
              ) : (
                /* Blank Slate state when no academic records are logged yet */
                <div className="flex flex-col items-center justify-center space-y-3 py-16 h-full text-center">
                  <GraduationCap className="w-12 h-12 text-neutral-300" />
                  <h3 className="font-bold text-neutral-700">Rapor Rombel Belum Terisi</h3>
                  <p className="text-xs text-neutral-500 max-w-sm">
                    Siswa ini terdaftar aktif namun belum memiliki data lembar penilaian rapor dinas di sistem ini. Anda dapat dengan cepat mengisinya sekarang.
                  </p>
                  <button 
                    onClick={handleStartEdit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lengkapi Nilai Akademis Rapor</span>
                  </button>
                </div>
              )}
            </div>

            {/* Inner footer branding */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-between text-[11px] text-neutral-400">
              <span>Kurikulum Operasional Nasional</span>
              <span className="font-medium">{schoolInfo.name}</span>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-100 rounded-2xl flex items-center justify-center h-[580px] border border-dashed border-neutral-305 text-neutral-400 text-xs">
            Daftarkan siswa terlebih dahulu di tab sebelah kiri.
          </div>
        )}
      </div>

      {/* DETAILED HIGH-FIDELITY PRINTABLE REPORT SHEET OVERLAY */}
      {isPrintPreviewOpen && activeStudent && activeReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-neutral-350 flex flex-col h-[90vh]">
            {/* Action Bar */}
            <div className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex justify-between items-center sm:shrink-0 shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-sm">Pratinjau Kertas Rapor (Sesuai Format Dinas)</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 font-extrabold px-4 py-2 text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak File</span>
                </button>
                <button 
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-neutral-400 hover:text-white p-2 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Formatted Section Document */}
            <div className="flex-1 overflow-y-auto p-8 bg-neutral-100 text-neutral-805 text-neutral-800 flex justify-center">
              <div className="w-[210mm] min-h-[297mm] bg-white border border-neutral-200 shadow-lg p-10 md:p-14 text-xs font-sans space-y-6 printable-document relative">
                
                {/* School Header */}
                <div className="text-center space-y-1.5 pb-4 border-b-4 border-double border-neutral-800">
                  <h2 className="text-sm font-bold uppercase tracking-wider">PEMERINTAH KOTA JAKARTA TIMUR</h2>
                  <h1 className="text-base font-black uppercase tracking-widest">{schoolInfo.name}</h1>
                  <p className="text-[10px] text-neutral-500">{schoolInfo.address} • Telp {schoolInfo.phone}</p>
                  <p className="text-[9px] text-neutral-400 italic font-mono">NPSN: {schoolInfo.npsn} • Website: {schoolInfo.website}</p>
                </div>

                {/* Subtitle */}
                <div className="text-center pt-2">
                  <h3 className="text-sm font-extrabold uppercase underline">LAPORAN HASIL BELAJAR AKADEMIK</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Semester {schoolInfo.semester} • Tahun Pelajaran {schoolInfo.academicYear}</p>
                </div>

                {/* Biodata Table Strip */}
                <div className="grid grid-cols-2 gap-4 text-[11px] py-2 border-b border-neutral-100">
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-24 text-neutral-500 font-semibold">Nama Siswa</span>
                      <span className="w-4">:</span>
                      <span className="font-extrabold text-neutral-900">{activeStudent.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-neutral-500 font-semibold">NISN / ID</span>
                      <span className="w-4">:</span>
                      <span className="font-mono">{activeStudent.nisn} / {activeStudent.id}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex">
                      <span className="w-24 text-neutral-500 font-semibold">Kelas Rombel</span>
                      <span className="w-4">:</span>
                      <span className="font-bold">{activeStudent.className}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-neutral-500 font-semibold">Akreditasi Sekolah</span>
                      <span className="w-4">:</span>
                      <span>{schoolInfo.accreditation}</span>
                    </div>
                  </div>
                </div>

                {/* Grades Document Table */}
                <div className="pt-2">
                  <table className="w-full text-left text-[11px] border-collapse border border-neutral-800">
                    <thead>
                      <tr className="bg-neutral-100 border-b border-neutral-800 font-bold text-center">
                        <th className="border border-neutral-800 px-3 py-2 text-center w-8">No</th>
                        <th className="border border-neutral-800 px-3 py-2 text-left">Mata Pelajaran (Mapel)</th>
                        <th className="border border-neutral-800 px-3 py-2 w-16">KKM</th>
                        <th className="border border-neutral-805 border-neutral-800 px-3 py-2 w-18">Nilai Angka</th>
                        <th className="border border-neutral-800 px-3 py-2 w-16">Predikat</th>
                        <th className="border border-neutral-800 px-3 py-2">Deskripsi Kualitatif Belajar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Matematika', score: activeReport.mathematics },
                        { name: 'Ilmu Pengetahuan Alam (IPA)', score: activeReport.science },
                        { name: 'Bahasa Inggris', score: activeReport.english },
                        { name: 'Bahasa Indonesia', score: activeReport.indonesian },
                        { name: 'Pendidikan Pancasila & Kewarganegaraan (PPKn)', score: activeReport.civics },
                        { name: 'Pendidikan Agama & Budi Pekerti', score: activeReport.religion },
                        { name: 'Pendidikan Jasmani, Olahraga & Kesehatan (PJOK)', score: activeReport.physicalEd },
                        { name: 'Seni Budaya & Prakarya', score: activeReport.art }
                      ].map((sub, idx) => {
                        const letterObj = getLetterGrade(sub.score);
                        return (
                          <tr key={idx} className="border-b border-neutral-800">
                            <td className="border border-neutral-800 px-3 py-2 text-center font-mono">{idx + 1}</td>
                            <td className="border border-neutral-800 px-3 py-2 font-bold">{sub.name}</td>
                            <td className="border border-neutral-800 px-3 py-2 text-center">75</td>
                            <td className="border border-neutral-800 px-3 py-2 text-center font-black">{sub.score}</td>
                            <td className="border border-neutral-800 px-3 py-2 text-center font-bold text-xs">{letterObj.letter}</td>
                            <td className="border border-neutral-800 px-3 py-2 text-neutral-600 pl-4">{letterObj.text} - Memenuhi KKTM minimal kelas.</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-neutral-55 bg-neutral-50/50 font-bold">
                        <td colSpan={3} className="border border-neutral-800 px-3 py-2 text-right">Rerata Kumulatif:</td>
                        <td className="border border-neutral-800 px-3 py-2 text-center font-black">{getAverage(activeReport)}</td>
                        <td colSpan={2} className="border border-neutral-800 px-3 py-2 text-neutral-400 italic pl-4 text-[10px]">Predikat: Baik</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Conduct & Attendance grid */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  {/* Conduct table */}
                  <table className="w-full text-left text-[10px] border border-neutral-800">
                    <thead>
                      <tr className="bg-neutral-100 font-bold border-b border-neutral-800 text-center">
                        <th colSpan={2} className="px-3 py-1.5 border border-neutral-805 border-neutral-800">Penilaian Sikap Pelajar</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-800">
                        <td className="border border-neutral-800 px-3 py-2 font-bold w-24">Kelakuan</td>
                        <td className="border border-neutral-800 px-3 py-2 text-center font-bold text-neutral-800">{activeReport.conduct}</td>
                      </tr>
                      <tr>
                        <td className="border border-neutral-800 px-3 py-2 font-bold">Kerafian</td>
                        <td className="border border-neutral-800 px-3 py-2 text-center font-bold text-neutral-800">Sangat Baik</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Attendance table */}
                  <table className="w-full text-left text-[10px] border border-neutral-800">
                    <thead>
                      <tr className="bg-neutral-100 font-bold border-b border-neutral-800 text-center">
                        <th colSpan={2} className="px-3 py-1.5 border border-neutral-808 border-neutral-800">Rekapitulasi Kehadiran (Absensi)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-neutral-800">
                        <td className="border border-neutral-800 px-3 py-1.5 font-bold w-24">Sakit</td>
                        <td className="border border-neutral-800 px-3 py-1.5 text-center font-bold">{activeReport.sickDays} Hari</td>
                      </tr>
                      <tr className="border-b border-neutral-800">
                        <td className="border border-neutral-800 px-3 py-1.5 font-bold">Izin</td>
                        <td className="border border-neutral-800 px-3 py-1.5 text-center font-bold">{activeReport.excusedDays} Hari</td>
                      </tr>
                      <tr>
                        <td className="border border-neutral-800 px-3 py-1.5 font-bold">Tanpa Keterangan</td>
                        <td className="border border-neutral-800 px-3 py-1.5 text-center font-bold">{activeReport.unexcusedDays} Hari</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                <div className="border border-neutral-800 p-4 space-y-1 rounded">
                  <span className="font-bold text-[10px] uppercase tracking-wide">Catatan Wali Kelas:</span>
                  <p className="italic leading-relaxed text-neutral-700">
                    "{activeReport.notes || 'Aditya berpartisipasi dengan aktif sepanjang jam kelas. Tingkatkan kemampuan analisis logisnya.'}"
                  </p>
                </div>

                {/* Signatures Panel */}
                <div className="pt-8 flex justify-between text-[11px]">
                  <div className="text-center space-y-16">
                    <div>
                      <p className="text-neutral-400">Mengetahui,</p>
                      <p className="font-semibold text-neutral-600">Orang Tua / Wali Siswa</p>
                    </div>
                    <p className="border-b border-neutral-800 w-36 mx-auto pb-0.5" />
                  </div>

                  <div className="text-center space-y-16">
                    <div>
                      <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p className="font-bold">Wali Rombongan Belajar</p>
                    </div>
                    <div>
                      <p className="font-bold underline">Siti Rahmawati, S.Pd.</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">NIP. 198103152009042003</p>
                    </div>
                  </div>

                  <div className="text-center space-y-16">
                    <div>
                      <p className="text-neutral-400">Menyetujui,</p>
                      <p className="font-bold">Kepala {schoolInfo.name}</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{schoolInfo.principalName}</p>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">NIP. {schoolInfo.principalNip}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
