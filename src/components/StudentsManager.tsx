import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  X, 
  CheckCircle, 
  UserPlus, 
  Users,
  AlertTriangle
} from 'lucide-react';
import { Student, Classroom } from '../types';

interface StudentsManagerProps {
  students: Student[];
  classes: Classroom[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export default function StudentsManager({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}: StudentsManagerProps) {
  // Query state
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Selection / Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    nisn: '',
    name: '',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '',
    className: '',
    address: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    status: 'Aktif'
  });

  const [formError, setFormError] = useState('');

  // Handle open modal for ADD
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      nisn: '',
      name: '',
      gender: 'Laki-laki',
      birthPlace: '',
      birthDate: '',
      className: classes[0]?.className || '7-A',
      address: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      status: 'Aktif'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open modal for EDIT
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.name?.trim()) return setFormError('Nama lengkap harus diisi');
    if (!formData.nisn?.trim()) return setFormError('NISN harus diisi');
    if (formData.nisn.length !== 10) return setFormError('NISN harus tepat 10 digit angka');
    if (!formData.birthDate) return setFormError('Tanggal lahir wajib diisi');
    if (!formData.className) return setFormError('Pilih kelas rombel siswa');

    if (editingStudent) {
      // Edit mode
      onUpdateStudent({
        ...editingStudent,
        ...formData
      } as Student);
    } else {
      // Create mode
      const newStudent: Student = {
        id: 's-' + Date.now(),
        ...(formData as Omit<Student, 'id'>)
      } as Student;
      onAddStudent(newStudent);
    }

    setIsModalOpen(false);
  };

  // Delete handler
  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteStudent(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Filter & Search Logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn.includes(searchTerm) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === '' || student.className === classFilter;
    const matchesStatus = statusFilter === '' || student.status === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Header Panel */}
      <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Database Peserta Didik</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola data biografis siswa, wali kelas, status keanggotaan dan rekam kontak sekolah.
          </p>
        </div>

        <button 
          id="btn-add-siswa"
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-250 flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Siswa Baru</span>
        </button>
      </div>

      {/* Control Filters Area */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50/20 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari siswa berdasarkan Nama, NISN, atau Nama Wali..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          />
        </div>

        {/* Filter Kelas */}
        <div className="relative">
          <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm border border-neutral-200 rounded-xl appearance-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Semua Rombel (Kelas)</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.className}>Kelas {cls.className}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 w-3.5 h-3.5" />
        </div>

        {/* Filter Status */}
        <div className="relative">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm border border-neutral-200 rounded-xl appearance-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Lulus">Lulus</option>
            <option value="Pindah">Pindah sekolah</option>
            <option value="Pemberhentian">Diberhentikan</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Table & Grid view */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-xs tracking-wider uppercase">
              <th className="px-6 py-4">Biodata Siswa</th>
              <th className="px-6 py-4">NISN</th>
              <th className="px-6 py-4">Kelas</th>
              <th className="px-6 py-4">Kontak Wali Orang Tua</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Aksi Operasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-neutral-50/50 transition-colors">
                {/* Biodata info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      student.gender === 'Laki-laki' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                        : 'bg-pink-50 text-pink-700 border border-pink-100'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800">{student.name}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 uppercase tracking-wide">
                        {student.gender} • {student.birthPlace}, {new Date(student.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 font-mono text-neutral-600 text-xs">
                  {student.nisn}
                </td>

                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 font-semibold rounded-lg text-xs">
                    Rombel {student.className}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div>
                    <p className="text-xs font-semibold text-neutral-700">{student.parentName}</p>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{student.parentPhone || student.phone}</p>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                    student.status === 'Aktif' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                      : student.status === 'Lulus'
                      ? 'bg-blue-50 text-blue-700 border border-blue-150'
                      : student.status === 'Pindah'
                      ? 'bg-amber-50 text-amber-700 border border-amber-150'
                      : 'bg-rose-50 text-rose-700 border border-rose-150'
                  }`}>
                    {student.status}
                  </span>
                </td>

                {/* Operations */}
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button 
                      id={`btn-edit-siswa-${student.id}`}
                      onClick={() => handleOpenEdit(student)}
                      title="Ubah Biodata Siswa"
                      className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      id={`btn-delete-siswa-${student.id}`}
                      onClick={() => handleDeleteTrigger(student.id)}
                      title="Hapus Siswa"
                      className="p-1.5 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Users className="w-8 h-8 text-neutral-300" />
                    <p className="text-neutral-500 font-semibold">Tidak Ada Siswa Ditemukan</p>
                    <p className="text-xs text-neutral-400">Sesuaikan filter atau tambahkan siswa baru melalui tombol di atas.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD Add/Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 text-lg">
                {editingStudent ? `Ubah Biodata: ${editingStudent.name}` : 'Daftarkan Peserta Didik Baru'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NISN */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">NISN (10 Digit Angka) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text"
                    maxLength={10} 
                    value={formData.nisn || ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    placeholder="Contoh: 0112345678"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nama Lengkap Siswa <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 bg-white"
                    placeholder="Nama lengkap sesuai akta lahir"
                    required
                  />
                </div>

                {/* Kelas */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Pilih Kelas / Rombel <span className="text-rose-500">*</span></label>
                  <select 
                    value={formData.className || ''}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    required
                  >
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.className}>Kelas {cls.className}</option>
                    ))}
                    {classes.length === 0 && (
                      <option value="7-A">7-A (Default)</option>
                    )}
                  </select>
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Jenis Kelamin</label>
                  <div className="flex gap-4 mt-2">
                    <label className="inline-flex items-center text-xs font-semibold text-neutral-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="Laki-laki" 
                        checked={formData.gender === 'Laki-laki'}
                        onChange={() => setFormData({ ...formData, gender: 'Laki-laki' })}
                        className="mr-1.5 accent-indigo-600"
                      />
                      Laki-laki
                    </label>
                    <label className="inline-flex items-center text-xs font-semibold text-neutral-700 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        value="Perempuan" 
                        checked={formData.gender === 'Perempuan'}
                        onChange={() => setFormData({ ...formData, gender: 'Perempuan' })}
                        className="mr-1.5 accent-indigo-600"
                      />
                      Perempuan
                    </label>
                  </div>
                </div>

                {/* Tempat Lahir */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Tempat Lahir</label>
                  <input 
                    type="text" 
                    value={formData.birthPlace || ''}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Contoh: Jakarta"
                  />
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Tanggal Lahir <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    required
                  />
                </div>

                {/* Nama Wali */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nama Orang Tua / Wali <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Nama Bapak / Ibu / Wali asli"
                    required
                  />
                </div>

                {/* No Telepon Orang Tua */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">No. HP Orang Tua / Wali <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.parentPhone || ''}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Urutan nomor seluler wali siswa"
                    required
                  />
                </div>

                {/* Status Siswa */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Status Keanggotaan Siswa</label>
                  <select 
                    value={formData.status || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindah">Pindah Sekolah</option>
                    <option value="Pemberhentian">Diberhentikan</option>
                  </select>
                </div>

                {/* Telepon Siswa */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">No. HP Siswa (Opsional)</label>
                  <input 
                    type="text" 
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Nomor HP siswa sendiri"
                  />
                </div>
              </div>

              {/* Alamat Rumah */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Alamat Tinggal Lengkap</label>
                <textarea 
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white min-h-[70px]"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kelurahan, kota"
                />
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
                  id="btn-submit-student"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Simpan Data
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
              <h4 className="font-bold text-lg text-neutral-800">Hapus Data Siswa?</h4>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus siswa ini secara permanen dari basis data? Tindakan ini <strong>tidak dapat dibatalkan</strong>, semua database akademik atau pembayaran teringat siswa akan terdisosiasi.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-600 text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                id="btn-confirm-delete-student"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
