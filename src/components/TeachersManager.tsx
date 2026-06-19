import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  X, 
  Briefcase, 
  UserSquare2, 
  AlertTriangle 
} from 'lucide-react';
import { Teacher } from '../types';

interface TeachersManagerProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export default function TeachersManager({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}: TeachersManagerProps) {
  // Query state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Selection / Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Teacher>>({
    nip: '',
    name: '',
    gender: 'Laki-laki',
    subject: '',
    email: '',
    phone: '',
    address: '',
    position: 'Guru Mapel',
    status: 'Aktif'
  });

  const [formError, setFormError] = useState('');

  // Handle open modal for ADD
  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      nip: '',
      name: '',
      gender: 'Laki-laki',
      subject: '',
      email: '',
      phone: '',
      address: '',
      position: 'Guru Mapel',
      status: 'Aktif'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open modal for EDIT
  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ ...teacher });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.name?.trim()) return setFormError('Nama lengkap harus diisi');
    if (!formData.nip?.trim()) return setFormError('NIP harus diisi');
    if (formData.nip.length < 9) return setFormError('NIP minimal berisi 9 digit angka pegawai');
    if (!formData.subject?.trim()) return setFormError('Mata pelajaran yang diampu wajib ditentukan');

    if (editingTeacher) {
      // Edit
      onUpdateTeacher({
        ...editingTeacher,
        ...formData
      } as Teacher);
    } else {
      // Create
      const newTeacher: Teacher = {
        id: 't-' + Date.now(),
        ...(formData as Omit<Teacher, 'id'>)
      } as Teacher;
      onAddTeacher(newTeacher);
    }

    setIsModalOpen(false);
  };

  // Delete trigger
  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDeleteTeacher(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Search filter
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.nip.includes(searchTerm) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || teacher.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Header Panel */}
      <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
            <UserSquare2 className="w-5 h-5 text-teal-600" />
            <span>Database Tenaga Pendidik (Guru)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola data guru pengajar, Nomor Induk Pegawai (NIP), mata pelajaran utama, dan perizinan tugas aktif.
          </p>
        </div>

        <button 
          id="btn-add-guru"
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-250 flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tenaga Pendidik</span>
        </button>
      </div>

      {/* Control Filters */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50/20 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari guru berdasarkan Nama, NIP, atau Mata Pelajaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
          />
        </div>

        {/* Filter Status */}
        <div className="relative">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm border border-neutral-200 rounded-xl appearance-none focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 bg-white"
          >
            <option value="">Semua Status Pengajar</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Non-Aktif">Non-Aktif</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 w-3.5 h-3.5" />
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-xs tracking-wider uppercase">
              <th className="px-6 py-4">Nama Lengkap & Jabatan</th>
              <th className="px-6 py-4">NIP</th>
              <th className="px-6 py-4">Mata Pelajaran Utama</th>
              <th className="px-6 py-4">Kontak / Email</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Aksi Operasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-neutral-50/50 transition-colors">
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-teal-50 text-teal-700 border border-teal-100">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800">{teacher.name}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 uppercase tracking-wide">
                        {teacher.gender} • {teacher.position}
                      </p>
                    </div>
                  </div>
                </td>

                {/* NIP */}
                <td className="px-6 py-4 font-mono text-neutral-600 text-xs">
                  {teacher.nip}
                </td>

                {/* Subject */}
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-teal-55 text-teal-800 font-semibold rounded-lg text-xs bg-teal-50/80">
                    {teacher.subject}
                  </span>
                </td>

                {/* Contact */}
                <td className="px-6 py-4">
                  <div className="text-xs">
                    <p className="font-semibold text-neutral-700">{teacher.phone}</p>
                    <p className="text-neutral-400 font-mono mt-0.5 truncate max-w-[180px]">{teacher.email}</p>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                    teacher.status === 'Aktif' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                      : teacher.status === 'Cuti'
                      ? 'bg-amber-50 text-amber-700 border border-amber-150'
                      : 'bg-rose-50 text-rose-700 border border-rose-150'
                  }`}>
                    {teacher.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button 
                      id={`btn-edit-guru-${teacher.id}`}
                      onClick={() => handleOpenEdit(teacher)}
                      title="Ubah Profil Guru"
                      className="p-1.5 hover:bg-neutral-100 text-neutral-500 hover:text-teal-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      id={`btn-delete-guru-${teacher.id}`}
                      onClick={() => handleDeleteTrigger(teacher.id)}
                      title="Hapus Data Guru"
                      className="p-1.5 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTeachers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Briefcase className="w-8 h-8 text-neutral-300" />
                    <p className="text-neutral-500 font-semibold">Tidak Ada Guru Ditemukan</p>
                    <p className="text-xs text-neutral-400">Silahkan sesuaikan filter pencarian atau tambahkan guru baru.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 text-lg">
                {editingTeacher ? `Ubah Guru: ${editingTeacher.name}` : 'Tambah Tenaga Pendidik Baru'}
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
                {/* NIP */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">NIP (Nomor Induk Pegawai) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 bg-white"
                    placeholder="Contoh: 198509202011011005"
                    required
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nama Lengkap Guru (Beserta Gelar) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 bg-white"
                    placeholder="Contoh: Siti Rahmawati, S.Pd."
                    required
                  />
                </div>

                {/* Gender */}
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
                        className="mr-1.5 accent-teal-650"
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
                        className="mr-1.5 accent-teal-650"
                      />
                      Perempuan
                    </label>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Mata Pelajaran Utama <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Contoh: Matematika, IPA, Seni Musik, dll"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nomor Kontak Seluler (HP) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Contoh: 0812XXXXXXXX"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Alamat Email Pendidik <span className="text-rose-500">*</span></label>
                  <input 
                    type="email" 
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Contoh: siti.rahma@smpn4.sch.id"
                    required
                  />
                </div>

                {/* Jabatan/Position */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Tipe Penugasan / Jabatan</label>
                  <select 
                    value={formData.position || 'Guru Mapel'}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    <option value="Guru Kelas">Guru Kelas</option>
                    <option value="Guru Mapel">Guru Mapel / Bidang Studi</option>
                    <option value="Guru Kelas / Wali Kelas">Guru Kelas / Wali Kelas</option>
                    <option value="Kepala Jurusan">Kepala Jurusan / Program Studi</option>
                    <option value="Staf Tata Usaha">Staf Administrasi / TU</option>
                    <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Status Keaktifan Dinas</label>
                  <select 
                    value={formData.status || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    <option value="Aktif">Aktif Mengajar</option>
                    <option value="Cuti">Cuti Penugasan</option>
                    <option value="Non-Aktif">Non-Aktif / Pensiun</option>
                  </select>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Alamat Domisili Lengkap</label>
                <textarea 
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white min-h-[70px]"
                  placeholder="Isikan alamat rumah lengkap pendidik"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50 -mx-6 -mb-6 p-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-600 text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  id="btn-submit-teacher"
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  Simpan Data Guru
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
              <h4 className="font-bold text-lg text-neutral-800">Hapus Data Guru?</h4>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Apakah Anda yakin ingin menghapus guru ini secara permanen? Data wali kelas atau penugasan rombel yang terkait dengan guru ini akan membutuhkan konfigurasi ulang.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-600 text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button 
                id="btn-confirm-delete-teacher"
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
