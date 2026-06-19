import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Home, 
  User, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Users2
} from 'lucide-react';
import { Classroom, Teacher, Student } from '../types';

interface ClassesManagerProps {
  classes: Classroom[];
  teachers: Teacher[];
  students: Student[];
  onAddClass: (newClass: Classroom) => void;
  onUpdateClass: (updatedClass: Classroom) => void;
  onDeleteClass: (id: string) => void;
}

export default function ClassesManager({
  classes,
  teachers,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass
}: ClassesManagerProps) {
  // UI states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  
  // Selected classroom to show roster list
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Classroom>>({
    className: '',
    gradeLevel: 'VII',
    guardianTeacherId: '',
    room: '',
    capacity: 32
  });

  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setEditingClass(null);
    setFormData({
      className: '',
      gradeLevel: 'VII',
      guardianTeacherId: teachers[0]?.id || '',
      room: '',
      capacity: 32
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: Classroom) => {
    setEditingClass(cls);
    setFormData({ ...cls });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.className?.trim()) return setFormError('Nama Rombel wajib diisi');
    if (!formData.room?.trim()) return setFormError('Lokasi Ruang Kelas wajib diisi');
    if (!formData.guardianTeacherId) return setFormError('Pilih Wali Kelas untuk rombel ini');

    const teacher = teachers.find(t => t.id === formData.guardianTeacherId);
    const teacherName = teacher ? teacher.name : '';

    if (editingClass) {
      onUpdateClass({
        ...editingClass,
        ...formData,
        guardianTeacherName: teacherName
      } as Classroom);
    } else {
      const newClass: Classroom = {
        id: 'c-' + Date.now(),
        ...(formData as Omit<Classroom, 'id'>),
        guardianTeacherName: teacherName
      } as Classroom;
      onAddClass(newClass);
    }

    setIsModalOpen(false);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteClass(deleteConfirmId);
      setDeleteConfirmId(null);
      if (expandedClassId === deleteConfirmId) {
        setExpandedClassId(null);
      }
    }
  };

  const toggleExpandClass = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <Home className="w-5 h-5 text-violet-600" />
              <span>Manajemen Kelas & Rombongan Belajar (Rombel)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Atur daftar ruang kelas teori, kapasitas bangku, kepala/wali kelas terdelegasi, serta lihat indeks murid terdaftar.
            </p>
          </div>

          <button 
            id="btn-add-kelas"
            onClick={handleOpenAdd}
            className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-250 flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Rombel Baru</span>
          </button>
        </div>

        {/* Classes Card Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const roster = students.filter(s => s.className === cls.className);
            const isExpanded = expandedClassId === cls.id;
            const guardianText = teachers.find(t => t.id === cls.guardianTeacherId)?.name || cls.guardianTeacherName || 'Belum ditugaskan';

            return (
              <div 
                key={cls.id}
                className={`border rounded-2xl transition-all duration-200 relative overflow-hidden ${
                  isExpanded ? 'border-violet-400 bg-violet-50/10 shadow-sm' : 'border-neutral-200 bg-white hover:border-neutral-350 hover:shadow-xs'
                }`}
              >
                {/* Classroom Card Content */}
                <div className="p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold tracking-wider rounded uppercase">
                          Tingkat {cls.gradeLevel}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono">
                          Ruang {cls.room}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-neutral-800 mt-1">Kelas {cls.className}</h3>
                    </div>

                    <div className="inline-flex items-center gap-1">
                      <button 
                        id={`btn-edit-kelas-${cls.id}`}
                        onClick={() => handleOpenEdit(cls)}
                        className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title="Modifikasi Rombel"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        id={`btn-delete-kelas-${cls.id}`}
                        onClick={() => handleDeleteTrigger(cls.id)}
                        className="p-1.5 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Rombel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-neutral-100/70 pt-3">
                    {/* Guardian Teacher info */}
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <User className="w-4 h-4 text-violet-500 shrink-0" />
                      <span className="font-medium text-neutral-500">Wali Kelas:</span>
                      <span className="font-bold truncate text-neutral-800">{guardianText}</span>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="flex items-center justify-between text-xs text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Users2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium text-neutral-500">Kuota Terisi:</span>
                        <span className="font-bold text-neutral-800">{roster.length} / {cls.capacity} Siswa</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 italic">
                        {Math.round((roster.length / cls.capacity) * 100)}% kuota kelas
                      </span>
                    </div>

                    {/* Simple gauge path */}
                    <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          roster.length >= cls.capacity ? 'bg-amber-500' : 'bg-violet-600'
                        }`}
                        style={{ width: `${Math.min(100, (roster.length / cls.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Expand roster toggle */}
                  <div className="mt-4 pt-2 border-t border-neutral-100/70 flex justify-center">
                    <button 
                      id={`btn-expand-roster-${cls.id}`}
                      onClick={() => toggleExpandClass(cls.id)}
                      className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1.5 focus:outline-hidden cursor-pointer active:scale-95"
                    >
                      <span>{isExpanded ? 'Sembunyikan Roster Murid' : 'Tampilkan Roster Murid'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub roster list */}
                {isExpanded && (
                  <div className="border-t border-violet-100 bg-violet-50/10 px-5 py-3 transition-all duration-350">
                    <h4 className="text-xs font-bold text-violet-800 uppercase tracking-wider mb-2">Daftar Siswa Terdaftar:</h4>
                    <div className="max-h-52 overflow-y-auto space-y-1 divide-y divide-violet-100/50 pr-1">
                      {roster.map((s, idx) => (
                        <div key={s.id} className="pt-2 pb-1.5 flex justify-between items-center text-xs">
                          <span className="font-mono text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{idx+1}</span>
                          <span className="font-bold text-neutral-800 flex-1 ml-2.5 truncate">{s.name}</span>
                          <span className="text-[11px] text-neutral-550 font-mono text-neutral-500">{s.nisn}</span>
                        </div>
                      ))}
                      {roster.length === 0 && (
                        <p className="text-xs text-neutral-400 italic text-center py-4">Belum ada siswa terdaftar di rombel ini. Ubah kelas siswa di Modul Siswa.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {classes.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <div className="flex flex-col items-center justify-center space-y-2">
                <Home className="w-8 h-8 text-neutral-300" />
                <p className="text-neutral-500 font-semibold">Belum Ada Rombel Ditambahkan</p>
                <p className="text-xs text-neutral-400">Klik "Tambah Rombel Baru" untuk mengawali pembuatan kelas.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rombel Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 text-lg">
                {editingClass ? `Atur Rombel: ${editingClass.className}` : 'Daftar Rombel & Wali Kelas Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-200 transition-colors text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-xs font-semibold rounded-r-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Rombel Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nama Rombel / Kelas <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.className || ''}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 bg-white"
                  placeholder="Contoh: 7-A, 10-IPA-1, 12-IPS-3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Grade Level */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Tingkatan Kelas</label>
                  <select 
                    value={formData.gradeLevel || 'VII'}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    <option value="VII">VII (Tujuh)</option>
                    <option value="VIII">VIII (Delapan)</option>
                    <option value="IX">IX (Sembilan)</option>
                    <option value="X">X (Sepuluh)</option>
                    <option value="XI">XI (Sebelas)</option>
                    <option value="XII">XII (Duabelas)</option>
                  </select>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Kapasitas Maks Belajar</label>
                  <input 
                    type="number" 
                    min={1}
                    max={100}
                    value={formData.capacity || 32}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 32 })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    required
                  />
                </div>
              </div>

              {/* Room physical number */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Ruang Lokasi Pembelajaran <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.room || ''}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  placeholder="Contoh: Gedung A Gd 2 Ruang 5, Lab Biologi, dll"
                  required
                />
              </div>

              {/* Guardian Teacher */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Delegasikan Wali Kelas <span className="text-rose-500">*</span></label>
                <select 
                  value={formData.guardianTeacherId || ''}
                  onChange={(e) => setFormData({ ...formData, guardianTeacherId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  required
                >
                  <option value="">Pilih guru sebagai wali kelas</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Mapel {t.subject})</option>
                  ))}
                </select>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Pendidik didelegasikan hak pengisian nilai rapor dari semua siswa yang tergabung di rombel ini.
                </span>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50 -mx-6 -mb-6 p-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-605 text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  id="btn-submit-kelas"
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <h4 className="font-bold text-lg text-neutral-800">Hapus Rombel ini?</h4>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus rombel ini secara permanen dari basis data? Semua siswa yang berasosiasi dengan rombel ini tidak akan terhapus, melainkan membutuhkan penugasan kelas baru.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-600 text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                id="btn-confirm-delete-kelas"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm cursor-pointer"
              >
                Hapus Rombel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
