import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  X, 
  FileText, 
  Printer, 
  AlertTriangle,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { AdministrativeLetter, Student, Teacher, SchoolInfo } from '../types';

interface LetterManagerProps {
  letters: AdministrativeLetter[];
  students: Student[];
  teachers: Teacher[];
  schoolInfo: SchoolInfo;
  onAddLetter: (newLet: AdministrativeLetter) => void;
  onUpdateLetter: (updatedLet: AdministrativeLetter) => void;
  onDeleteLetter: (id: string) => void;
}

export default function LetterManager({
  letters,
  students,
  teachers,
  schoolInfo,
  onAddLetter,
  onUpdateLetter,
  onDeleteLetter
}: LetterManagerProps) {
  // Query
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Selection states
  const [editingLetter, setEditingLetter] = useState<AdministrativeLetter | null>(null);
  const [viewingLetter, setViewingLetter] = useState<AdministrativeLetter | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AdministrativeLetter>>({
    referenceNumber: '',
    title: '',
    type: 'Keterangan Aktif',
    recipientName: '',
    studentId: '',
    teacherId: '',
    content: ''
  });

  const [formError, setFormError] = useState('');

  // Auto-fill template content based on Letter Type selection
  useEffect(() => {
    if (editingLetter) return; // Ignore if we are editing an existing record

    const studObj = students.find(s => s.id === formData.studentId);
    const teachObj = teachers.find(t => t.id === formData.teacherId);
    
    // Auto populate reference number template
    const defaultRef = `421/${Math.floor(100 + Math.random() * 900)}/SMP-HB/${new Date().getFullYear()}`;
    
    let templateTitle = '';
    let templateRecipient = '';
    let templateBody = '';

    if (formData.type === 'Keterangan Aktif') {
      templateTitle = 'Surat Keterangan Aktivitas Belajar Siswa';
      templateRecipient = 'Orang Tua / Wali Murid';
      templateBody = `Menerangkan dengan sesungguhnya bahwa siswa yang namanya tercantum di bawah ini:
      
Nama: ${studObj ? studObj.name : '[Silahkan pilih siswa di bawah]'}
NISN: ${studObj ? studObj.nisn : ' - '}
Kelas: ${studObj ? 'Belajar Aktif di Kelas ' + studObj.className : ' - '}

Adalah benar-benar siswa aktif terdaftar di ${schoolInfo.name} pada Tahun Pelajaran berjalan ${schoolInfo.academicYear} semester ${schoolInfo.semester}. Demikian surat keterangan ini diterbitkan secara sah untuk dipergunakan sebagaimana mestinya.`;
    } 
    
    else if (formData.type === 'Panggilan Wali Murid') {
      templateTitle = 'Surat Undangan Pertemuan Wali Kelas';
      templateRecipient = studObj ? `Wali Murid dari Ananda ${studObj.name}` : '[Silahkan pilih siswa]';
      templateBody = `Dengan hormat,
      
Berkenaan dengan diadakannya bimbingan pengembangan minat bakat serta sinergi belajar siswa, kami mengharapkan kehadiran Bapak/Ibu Orang Tua / Wali dari siswa:

Nama Siswa: ${studObj ? studObj.name : ' - '}
Kelas Rombel: ${studObj ? studObj.className : ' - '}

Untuk menghadiri pertemuan konsultasi bersama Wali Kelas dan Kepala Sekolah pada hari kerja mendatang di kompleks sekolah. Atas perhatian bapak/Ibu kami haturkan terima kasih.`;
    } 
    
    else if (formData.type === 'Undangan Rapat') {
      templateTitle = 'Undangan Musyawarah Komite Dewan Guru';
      templateRecipient = teachObj ? teachObj.name : 'Seluruh Staf Tenaga Pendidik';
      templateBody = `Mengundang Bapak/Ibu Staf Pengajar:
      
Nama: ${teachObj ? teachObj.name : 'Staf Terkait'}
Bidang: ${teachObj ? 'Guru Mengampu ' + teachObj.subject : 'Dewan Komite Sekolah'}

Untuk hadir dalam forum resmi koordinasi evaluasi kurikulum dan penyusunan bahan ajar ujian akhir semester yang akan bertempat di Ruang Laboratorium Utama Sekolah. Kehadiran tepat waktu sangat dihargai.`;
    } 
    
    else if (formData.type === 'Rekomendasi') {
      templateTitle = 'Surat Rekomendasi Karir & Beasiswa Pendidik';
      templateRecipient = teachObj ? `Lembaga Penyelenggara Beasiswa (Dosen Penilai)` : 'Konsulat Dinas Pendidikan Kota';
      templateBody = `Merujuk pada kinerja mengajar, loyalitas dedikasi, serta nilai kompetensi yang bersangkutan, Kepala Sekolah ${schoolInfo.name} memberikan rekomendasi penuh kepada:

Nama Pendidik: ${teachObj ? teachObj.name : '[Pilih staf guru di bawah]'}
NIP Pegawai: ${teachObj ? teachObj.nip : ' - '}
Mampu Mengajar: ${teachObj ? teachObj.subject : ' - '}

Untuk mengikuti program sertifikasi kompetensi lanjut serta beasiswa tingkat lanjut. Yang bersangkutan menunjukkan karakter amat luhur selama masa bakti dinas.`;
    }

    setFormData(prev => ({
      ...prev,
      title: templateTitle,
      recipientName: templateRecipient,
      content: templateBody,
      referenceNumber: prev.referenceNumber || defaultRef
    }));

  }, [formData.type, formData.studentId, formData.teacherId, schoolInfo]);

  const handleOpenAdd = () => {
    setEditingLetter(null);
    setFormData({
      referenceNumber: '',
      title: 'Surat Keterangan Aktivitas Belajar Siswa',
      type: 'Keterangan Aktif',
      recipientName: 'Wali Murid',
      studentId: students[0]?.id || '',
      teacherId: teachers[0]?.id || '',
      content: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (letItem: AdministrativeLetter) => {
    setEditingLetter(letItem);
    setFormData({ ...letItem });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenPreview = (letItem: AdministrativeLetter) => {
    setViewingLetter(letItem);
    setIsPreviewOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.referenceNumber?.trim()) return setFormError('Nomor Surat wajib diisi');
    if (!formData.title?.trim()) return setFormError('Perihal Judul Surat wajib diisi');
    if (!formData.content?.trim()) return setFormError('Isi paragraf teks surat wajib diisi');

    const referencedStudent = students.find(s => s.id === formData.studentId);
    const referencedTeacher = teachers.find(t => t.id === formData.teacherId);

    if (editingLetter) {
      onUpdateLetter({
        ...editingLetter,
        ...formData,
        studentName: referencedStudent?.name,
        teacherName: referencedTeacher?.name
      } as AdministrativeLetter);
    } else {
      const newLet: AdministrativeLetter = {
        id: 'l-' + Date.now(),
        dateCreated: new Date().toISOString().split('T')[0],
        ...(formData as Omit<AdministrativeLetter, 'id' | 'dateCreated'>),
        studentName: referencedStudent?.name,
        teacherName: referencedTeacher?.name
      } as AdministrativeLetter;
      onAddLetter(newLet);
    }

    setIsModalOpen(false);
  };

  // Filter letters
  const filteredLetters = letters.filter(letItem => {
    const term = searchTerm.toLowerCase();
    return letItem.referenceNumber.toLowerCase().includes(term) ||
           letItem.title.toLowerCase().includes(term) ||
           letItem.type.toLowerCase().includes(term) ||
           letItem.recipientName.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Header Panel */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-600" />
              <span>Sistem Surat Menyurat & Dokumen Administrasi</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Buat surat resmi sekolah seperti Surat Keterangan Siswa Aktif atau Surat Panggilan Orang tua dengan cepat berbasis database.
            </p>
          </div>

          <button 
            id="btn-draft-surat"
            onClick={handleOpenAdd}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-250 flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Surat Resmi Baru</span>
          </button>
        </div>

        {/* Filter search bar */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/20">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari surat berdasarkan Nomor Surat, Perihal Judul, Tipe Surat, atau Penerima..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
            />
          </div>
        </div>

        {/* Table / Cards List */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-xs tracking-wider uppercase">
                <th className="px-6 py-4">Nomor & Judul Surat</th>
                <th className="px-6 py-4">Sifat / Jenis</th>
                <th className="px-6 py-4">Pihak Penerima</th>
                <th className="px-6 py-4 text-center">Tanggal Dibuat</th>
                <th className="px-6 py-4 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLetters.map((letItem) => (
                <tr key={letItem.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-bold text-neutral-805 text-neutral-850 text-neutral-800">{letItem.title}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{letItem.referenceNumber}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      letItem.type === 'Keterangan Aktif' ? 'bg-indigo-50 text-indigo-700' :
                      letItem.type === 'Panggilan Wali Murid' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'
                    }`}>
                      {letItem.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-neutral-700">{letItem.recipientName}</p>
                    {letItem.studentName && (
                      <p className="text-[10px] text-neutral-400">Ref Siswa: {letItem.studentName}</p>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center text-xs text-neutral-500 font-mono">
                    {letItem.dateCreated}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button 
                        id={`btn-open-surat-${letItem.id}`}
                        onClick={() => handleOpenPreview(letItem)}
                        className="bg-neutral-100 hover:bg-neutral-250 text-neutral-800 font-semibold px-3 py-1.5 rounded-lg text-xs hover:text-indigo-600 transition-colors"
                      >
                        Pratinjau
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(letItem)}
                        title="Edit Teks Surat"
                        className="px-1.5 py-1.5 text-neutral-400 hover:text-teal-600 rounded transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteLetter(letItem.id)}
                        title="Hapus Surat"
                        className="px-1.5 py-1.5 text-neutral-400 hover:text-rose-650 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLetters.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-neutral-300" />
                      <p className="text-neutral-500 font-semibold">Tafsiran Surat Tidak Ditemukan</p>
                      <p className="text-xs text-neutral-400">Silahkan sesuaikan kriteria cari atau ketik draf surat resmi baru.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAFTING / EDITING CREATOR FORM (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 text-base">
                {editingLetter ? 'Ubah Naskah Surat' : 'Tulis / Draf Surat Administrasi Resmi'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-200 text-neutral-400"
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
                {/* Letter Type */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Templat Tipe Surat</label>
                  <select 
                    value={formData.type || 'Keterangan Aktif'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    <option value="Keterangan Aktif">Surat Keterangan Aktif Belajar</option>
                    <option value="Panggilan Wali Murid">Surat Panggilan Orang Tua</option>
                    <option value="Undangan Rapat">Surat Undangan Rapat Staf</option>
                    <option value="Rekomendasi">Surat Rekomendasi Karir/Dinas</option>
                  </select>
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nomor Surat Kepala Sekolah *</label>
                  <input 
                    type="text" 
                    value={formData.referenceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white font-mono"
                    placeholder="Contoh: 421/045/SMP-HB/2026"
                    required
                  />
                </div>

                {/* If type references student, show Student dropdown selector */}
                {(formData.type === 'Keterangan Aktif' || formData.type === 'Panggilan Wali Murid') && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Hubungkan Database Siswa *</label>
                    <select 
                      value={formData.studentId || ''}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                      required
                    >
                      <option value="">-- Pilih Siswa Di Database --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Kelas {s.className})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If type references teacher, show Teacher dropdown selector */}
                {(formData.type === 'Undangan Rapat' || formData.type === 'Rekomendasi') && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Hubungkan Pendidik *</label>
                    <select 
                      value={formData.teacherId || ''}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                      required
                    >
                      <option value="">-- Pilih Guru Di Database --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (Mapel: {t.subject})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Recipient Input */}
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nama Pihak Penerima Surat *</label>
                  <input 
                    type="text" 
                    value={formData.recipientName || ''}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                    placeholder="Contoh: Hendra Pratama / Wali Aditya"
                    required
                  />
                </div>

                {/* Perihal / Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1 font-semibold text-neutral-800">Perihal / Hal Judul Surat *</label>
                  <input 
                    type="text" 
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white font-semibold text-neutral-800"
                    placeholder="Masukkan perihal ringkas surat"
                    required
                  />
                </div>
              </div>

              {/* Markdown Content Paragraph */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Teks Utama / Badan Surat *</label>
                <textarea 
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-3 text-xs border border-neutral-200 rounded-xl bg-white min-h-[220px] focus:outline-hidden font-mono leading-relaxed"
                  placeholder="Isi badan surat terformat..."
                  required
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50 -mx-6 -mb-6 p-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  id="btn-save-letter"
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Simpan Draf Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED HIGH-FIDELITY PRINTABLE CORRESPONDENCE DRAWER PREVIEW */}
      {isPreviewOpen && viewingLetter && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl border border-neutral-350 flex flex-col h-[90vh]">
            {/* Action panel */}
            <div className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex justify-between items-center sm:shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-sm">Pratinjau Surat Resmi Kelembagaan</h3>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-rose-600 hover:bg-rose-700 font-bold px-4 py-2 text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Lembar Surat</span>
                </button>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-neutral-400 hover:text-white p-2 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Content Sheet */}
            <div className="flex-1 overflow-y-auto p-8 bg-neutral-100 text-neutral-800 flex justify-center">
              <div className="w-[210mm] min-h-[297mm] bg-white border border-neutral-200 shadow-md p-12 md:p-14 text-xs font-serif leading-loose space-y-6 relative rounded-xs">
                
                {/* Official Kop Surat (Letter Head) */}
                <div className="text-center space-y-1.5 pb-3 border-b-4 border-double border-neutral-850">
                  <h2 className="text-xs font-bold uppercase tracking-wider font-sans">PEMERINTAH KOTA JAKARTA TIMUR • DINAS PENDIDIKAN</h2>
                  <h1 className="text-sm font-black uppercase tracking-widest font-sans">{schoolInfo.name}</h1>
                  <p className="text-[10px] text-neutral-500 font-sans">{schoolInfo.address} • Telp {schoolInfo.phone}</p>
                  <p className="text-[9px] text-neutral-400 italic font-mono font-sans font-semibold">NPSN: {schoolInfo.npsn} • Email: {schoolInfo.email}</p>
                </div>

                {/* Letter Metadata Strip */}
                <div className="flex justify-between items-start text-xs font-sans pb-4">
                  <div className="space-y-1">
                    <p><span className="font-bold">Nomor :</span> {viewingLetter.referenceNumber}</p>
                    <p><span className="font-bold">Perihal :</span> <span className="underline">{viewingLetter.title}</span></p>
                    <p><span className="font-bold">Sifat :</span> Penting / Segera</p>
                  </div>
                  <div className="text-right">
                    <p>Jakarta, {viewingLetter.dateCreated}</p>
                  </div>
                </div>

                {/* Recipient lines */}
                <div className="space-y-1 text-xs pt-2">
                  <p>Kepada Yth,</p>
                  <p className="font-bold">{viewingLetter.recipientName}</p>
                  <p className="text-neutral-500">Di Tempat</p>
                </div>

                {/* Body Content Paragraph */}
                <p className="whitespace-pre-line text-xs leading-relaxed pt-2 leading-8 tracking-wide indent-8 text-neutral-850">
                  {viewingLetter.content}
                </p>

                {/* Ending phrase */}
                <div className="pt-4 leading-relaxed font-sans text-xs">
                  <p>Mengetahui hal tersebut, kami mengharapkan sinergi penuh di semua pihak demi meningkatkan kualitas tumbuh kembang pembelajaran bersama.</p>
                  <p>Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.</p>
                </div>

                {/* Authorized Signatures Panel */}
                <div className="pt-10 flex justify-end text-xs font-sans">
                  <div className="text-center space-y-16 w-60">
                    <div>
                      <p>Hormat Kami,</p>
                      <p className="font-bold">Kepala {schoolInfo.name}</p>
                    </div>
                    <div>
                      <p className="font-extrabold underline">{schoolInfo.principalName}</p>
                      <p className="text-[10px] text-neutral-400 font-semibold font-mono">NIP. {schoolInfo.principalNip}</p>
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
