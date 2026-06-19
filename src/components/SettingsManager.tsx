import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Settings, 
  Download, 
  Upload, 
  RefreshCw, 
  Check, 
  AlertTriangle,
  School,
  FileCode
} from 'lucide-react';
import { SchoolInfo } from '../types';

interface SettingsManagerProps {
  schoolInfo: SchoolInfo;
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  onImportBackup: (importedJson: string) => boolean;
  onExportBackup: () => void;
  onResetToDemo: () => void;
}

export default function SettingsManager({
  schoolInfo,
  onUpdateSchoolInfo,
  onImportBackup,
  onExportBackup,
  onResetToDemo
}: SettingsManagerProps) {
  // Local Form state
  const [formData, setFormData] = useState<SchoolInfo>({ ...schoolInfo });
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // File import state refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolInfo(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Simple validation check
        if (!parsed.schoolInfo || !parsed.students || !parsed.teachers) {
          throw new Error('Sifat format salinan data tidak kompatibel.');
        }

        const success = onImportBackup(text);
        if (success) {
          setImportSuccess(true);
        } else {
          setImportError('Gagal memulihkan cadangan. Pastikan file valid.');
        }
      } catch (err: any) {
        setImportError(err.message || 'Gagal memproses file cadangan.');
      }
    };
    reader.readAsText(file);
  };

  const handleTriggerReset = () => {
    onResetToDemo();
    setFormData({ ...schoolInfo });
    setShowResetConfirm(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT PANEL: School profile form */}
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-neutral-800 text-base flex items-center gap-2 border-b border-neutral-100 pb-2">
          <School className="w-5 h-5 text-indigo-600" />
          <span>Profil Identitas {schoolInfo.name}</span>
        </h3>

        {saveSuccess && (
          <div className="p-3 bg-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Semua pemutakhiran identitas/data sekolah sukses diamankan.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* School Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nama Resmi Lembaga Sekolah</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                placeholder="Contoh: SMP Negeri 4 Harapan Bangsa"
                required
              />
            </div>

            {/* NPSN */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
              <input 
                type="text" 
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white font-mono"
                placeholder="2010XXXX"
                required
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Website Sekolah</label>
              <input 
                type="text" 
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                placeholder="www.nama_sekolah.sch.id"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">No. HP / Telepon Kerja</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                placeholder="021-XXXXXXXX"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Surel Resmi (Email)</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                placeholder="info@sekolah.sch.id"
                required
              />
            </div>

            {/* Principal Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nama Lengkap Kepala Sekolah</label>
              <input 
                type="text" 
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                placeholder="Nama beserta gelar akademik"
                required
              />
            </div>

            {/* Principal NIP */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">NIP Kepala Sekolah</label>
              <input 
                type="text" 
                value={formData.principalNip}
                onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white font-mono"
                placeholder="19xxxxxxxxxxxxxxxx"
                required
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Tahun Ajaran Aktif</label>
              <select 
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
              >
                <option value="2024/2025">2024/2025</option>
                <option value="2025/2026">2025/2026</option>
                <option value="2026/2027">2026/2027</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Semester Dinas</label>
              <select 
                value={formData.semester}
                onChange={(e: any) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white font-bold"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>

            {/* Accreditation */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Peringkat Akreditasi BAN-S/M</label>
              <input 
                type="text" 
                value={formData.accreditation}
                onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                placeholder="Contoh: Accreditated A (Sangat Baik)"
                required
              />
            </div>

            {/* School Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Alamat Lembaga Utama</label>
              <textarea 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white min-h-[70px]"
                placeholder="Masukkan lokasi koordinat jalan kelurahan dan kecamatan lengkap..."
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit"
              id="btn-save-settings"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Simpan Perubahan Profil
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT PANEL: Database backup administrator tools */}
      <div className="space-y-6">
        
        {/* Backup / Restore Controls */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-neutral-800 text-sm uppercase tracking-wide flex items-center gap-1.5 border-b border-neutral-150 pb-2">
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Cadangan Basis Data</span>
          </h3>

          <p className="text-xs text-neutral-500 leading-relaxed">
            Ekspor seluruh lembar data administrasi sekolah (Siswa, Guru, Keuangan SPP, Laporan Rapor, Naskah Surat) ke dalam file eksternal JSON. Anda bisa mengunggah cadangan ini kapan saja untuk memulihkan seluruh status database.
          </p>

          <div className="space-y-2 pt-2">
            {/* Export */}
            <button 
              id="btn-export-json"
              onClick={onExportBackup}
              className="w-full py-2.5 bg-neutral-105 hover:bg-neutral-100 text-indigo-700 font-bold text-xs rounded-xl border border-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Backup Database (.json)</span>
            </button>

            {/* Import file handler */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden" 
            />
            <button 
              id="btn-import-json"
              onClick={handleUploadClick}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>Impor File Backup (.json)</span>
            </button>
          </div>

          {importError && (
            <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-2 rounded-lg text-center">
              {importError}
            </p>
          )}

          {importSuccess && (
            <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center">
              Restorasi Data Sukses Diluncurkan!
            </p>
          )}
        </div>

        {/* Danger zone / Reset to default preset */}
        <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-150 shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-widest flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Zona Bahaya Administrator</span>
          </h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Menyetel ulang seluruh isi administrasi saat ini kembali seperti versi set awal pabrik demo (Default Seed Data).
          </p>

          {showResetConfirm ? (
            <div className="space-y-2 pt-2 animate-fade-in">
              <p className="text-[11px] text-rose-700 font-bold">Lanjutkan penyetelan ulang? Tindakan menghapus seluruh data kustom.</p>
              <div className="flex gap-2">
                <button 
                  onClick={handleTriggerReset}
                  className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Ya, Setel Ulang
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              Setel Ulang ke Preset Skenario Demo
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
