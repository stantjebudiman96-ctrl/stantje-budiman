import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Receipt,
  PiggyBank,
  Check
} from 'lucide-react';
import { SppInvoice, Student } from '../types';

interface FinanceManagerProps {
  invoices: SppInvoice[];
  students: Student[];
  onAddInvoice: (inv: SppInvoice) => void;
  onUpdateInvoice: (inv: SppInvoice) => void;
  onDeleteInvoice: (id: string) => void;
  onBulkGenerate: (month: string, year: number, amount: number) => void;
}

export default function FinanceManager({
  invoices,
  students,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onBulkGenerate
}: FinanceManagerProps) {
  // Queries
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  
  // UI states
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  
  // State variables for payment modal processing
  const [processingInvoice, setProcessingInvoice] = useState<SppInvoice | null>(null);
  const [payMethod, setPayMethod] = useState<'Tunai' | 'Transfer' | 'Gopay/OVO' | 'Lainnya'>('Tunai');
  const [payRefNo, setPayRefNo] = useState('');

  // Bulk Generator Fields
  const [bulkMonth, setBulkMonth] = useState('Januari');
  const [bulkYear, setBulkYear] = useState(2026);
  const [bulkAmount, setBulkAmount] = useState(150000);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Single Bill Generator Fields
  const [singleStudentId, setSingleStudentId] = useState('');
  const [singleMonth, setSingleMonth] = useState('Januari');
  const [singleYear, setSingleYear] = useState(2026);
  const [singleAmount, setSingleAmount] = useState(150000);
  const [singleError, setSingleError] = useState('');

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleOpenPayment = (inv: SppInvoice) => {
    setProcessingInvoice(inv);
    setPayMethod('Tunai');
    setPayRefNo('');
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingInvoice) return;

    onUpdateInvoice({
      ...processingInvoice,
      status: 'Lunas',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: payMethod,
      refNo: payRefNo?.trim() || undefined
    });

    setIsPayModalOpen(false);
    setProcessingInvoice(null);
  };

  const handleRefundInvoice = (inv: SppInvoice) => {
    onUpdateInvoice({
      ...inv,
      status: 'Belum Lunas',
      paymentDate: undefined,
      paymentMethod: undefined,
      refNo: undefined
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBulkGenerate(bulkMonth, bulkYear, bulkAmount);
    setBulkSuccessMsg(`Sukses mendelegasikan tagihan SPP ${bulkMonth} ${bulkYear} ke semua siswa AKTIF.`);
    setTimeout(() => {
      setBulkSuccessMsg('');
      setIsBulkOpen(false);
    }, 2500);
  };

  const handleAddSingleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSingleError('');

    if (!singleStudentId) {
      setSingleError('Pilih siswa penerima tagihan');
      return;
    }

    const studentObj = students.find(s => s.id === singleStudentId);
    if (!studentObj) return;

    // Check if bill already exists to prevent duplication
    const duplicate = invoices.find(
      i => i.studentId === singleStudentId && i.month === singleMonth && i.year === singleYear
    );

    if (duplicate) {
      setSingleError(`Tagihan SPP ${singleMonth} ${singleYear} untuk siswa ini sudah terbit.`);
      return;
    }

    const newInvoice: SppInvoice = {
      id: 'f-' + Date.now(),
      studentId: singleStudentId,
      studentName: studentObj.name,
      className: studentObj.className,
      month: singleMonth,
      year: singleYear,
      amount: singleAmount,
      status: 'Belum Lunas'
    };

    onAddInvoice(newInvoice);
    setIsAddBillOpen(false);
    setSingleStudentId('');
  };

  // Filter computation
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || inv.status === statusFilter;
    const matchesMonth = monthFilter === '' || inv.month === monthFilter;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  return (
    <div className="space-y-6">
      {/* Financial Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">Lunas Terbayar</p>
            <h3 className="text-xl font-bold text-neutral-800">
              IDR {invoices.filter(i => i.status === 'Lunas').reduce((s, i) => s + i.amount, 0).toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Dari {invoices.filter(i => i.status === 'Lunas').length} transaksi lunas
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">Tunggakan Tertangguh</p>
            <h3 className="text-xl font-bold text-neutral-800">
              IDR {invoices.filter(i => i.status === 'Belum Lunas').reduce((s, i) => s + i.amount, 0).toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Dari {invoices.filter(i => i.status === 'Belum Lunas').length} tagihan belum dibayar
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider">Total Tagihan SPP</p>
            <h3 className="text-xl font-bold text-neutral-800">
              IDR {invoices.reduce((s, i) => s + i.amount, 0).toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Total {invoices.length} tagihan tergenerasi
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Header Panel */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Sistem Pencatatan Pembayaran SPP Bulanan</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Pantau status tunggakan uang sekolah, terbitkan manifest tagihan bulanan secara massal, dan catat metode pelunasan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              id="btn-bulk-bill"
              onClick={() => setIsBulkOpen(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Generate Massal (Siswa Aktif)
            </button>
            <button 
              id="btn-single-bill"
              onClick={() => setIsAddBillOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Penerbitan Tunggal</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50/20 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search by Student */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari transaksi berdasarkan Nama Siswa atau Kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Month selective */}
          <div className="relative">
            <select 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm border border-neutral-200 rounded-xl appearance-none focus:outline-hidden bg-white"
            >
              <option value="">Semua Bulan Tagihan</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 w-3.5 h-3.5" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm border border-neutral-200 rounded-xl appearance-none focus:outline-hidden bg-white"
            >
              <option value="">Semua Status Bayar</option>
              <option value="Lunas">Terverifikasi Lunas</option>
              <option value="Belum Lunas">Belum Bayar (Menunggak)</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 w-3.5 h-3.5" />
          </div>
        </div>

        {/* Invoice List Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-xs tracking-wider uppercase">
                <th className="px-6 py-4">Siswa Penerima</th>
                <th className="px-6 py-4">Periode Tagihan</th>
                <th className="px-6 py-4">Nominal SPP</th>
                <th className="px-6 py-4">Detail Pelunasan</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Tindakan Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <h4 className="font-bold text-neutral-850 text-neutral-800">{inv.studentName}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 font-semibold">Kelas {inv.className}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-semibold text-neutral-700">
                      {inv.month} {inv.year}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-mono font-bold text-neutral-700">
                    IDR {inv.amount.toLocaleString('id-ID')}
                  </td>

                  <td className="px-6 py-4">
                    {inv.status === 'Lunas' ? (
                      <div className="text-xs">
                        <p className="font-medium text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Via {inv.paymentMethod}</span>
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Tgl: {inv.paymentDate} {inv.refNo ? `| Ref: ${inv.refNo}` : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Menunggu verifikasi kasir</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                      inv.status === 'Lunas' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                        : 'bg-rose-50 text-rose-700 border border-rose-150 animate-pulse'
                    }`}>
                      {inv.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {inv.status === 'Belum Lunas' ? (
                      <button 
                        id={`btn-pay-${inv.id}`}
                        onClick={() => handleOpenPayment(inv)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                      >
                        Tandai Lunas
                      </button>
                    ) : (
                      <div className="inline-flex gap-2">
                        <button 
                          onClick={() => handleRefundInvoice(inv)}
                          title="Batalkan Verifikasi Lunas"
                          className="bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-rose-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Batalkan Bayar
                        </button>
                        <button 
                          onClick={() => onDeleteInvoice(inv.id)}
                          title="Hapus Tagihan ini"
                          className="text-neutral-40s text-neutral-400 hover:text-rose-600 p-1.5 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CreditCard className="w-8 h-8 text-neutral-300" />
                      <p className="text-neutral-500 font-semibold">Tidak Ada Rekam Tagihan</p>
                      <p className="text-xs text-neutral-400">Gunakan filter atau buat manifest tagihan baru di tombol atas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT TRANSACTION VERIFICATION FORM (MODAL) */}
      {isPayModalOpen && processingInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 text-base">Pencatatan Pelunasan Kasir</h3>
              <button 
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-250 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-6 space-y-4">
              <div className="bg-indigo-50/50 p-3.5 border border-indigo-100 rounded-xl space-y-1">
                <p className="text-xs text-neutral-500">Nama Siswa:</p>
                <p className="font-extrabold text-indigo-900 text-sm">{processingInvoice.studentName}</p>
                <p className="text-xs text-indigo-700">Tagihan: {processingInvoice.month} {processingInvoice.year} • Kelas {processingInvoice.className}</p>
                <p className="text-sm font-bold text-indigo-950 mt-1">Uang Sekolah: IDR {processingInvoice.amount.toLocaleString('id-ID')}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Metode Setor Dana</label>
                <select 
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                >
                  <option value="Tunai">Tunai / Bayar di Sekolah</option>
                  <option value="Transfer">Transfer Bank (Mandiri/BCA/BNI)</option>
                  <option value="Gopay/OVO">Gopay / OVO / Dompet Digital</option>
                  <option value="Lainnya">Lainnya / Beasiswa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">No. Referensi / Kode Unik TRX (Opsional)</label>
                <input 
                  type="text" 
                  value={payRefNo}
                  onChange={(e) => setPayRefNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  placeholder="Contoh: TRX-998811 atau 12762"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="w-full py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-650 text-xs hover:bg-neutral-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  id="btn-submit-payment"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Konfirmasi Lunas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK BILL GENERATOR DIALOG */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 text-base">Generate Tagihan SPP Massal</h3>
              <button 
                onClick={() => setIsBulkOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-250 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
              <div className="bg-amber-50 text-amber-900 text-xs p-3.5 border-l-4 border-amber-500 rounded-r-xl leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>PERINGATAN OPERATOR:</span>
                </p>
                <p>Fitur ini akan mengecek semua siswa yang terdaftar dengan status <strong>AKTIF</strong>, lalu menerbitkan invoice tagihan SPP bulanan senilai Rp150.000 (atau sesuai regulasi Anda) dengan status <strong>Belum Bayar</strong> jika tagihan siswa bersangkutan pada bulan ini belum terbit.</p>
              </div>

              {bulkSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{bulkSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Bulan SPP</label>
                  <select 
                    value={bulkMonth}
                    onChange={(e) => setBulkMonth(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Tahun Anggaran</label>
                  <select 
                    value={bulkYear}
                    onChange={(e) => setBulkYear(parseInt(e.target.value) || 2026)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nominal Bulanan (IDR)</label>
                <input 
                  type="number" 
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white font-mono"
                  placeholder="Isi tarif tagihan bulanan default"
                  required
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="w-full py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-650 text-xs hover:bg-neutral-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  id="btn-submit-bulk"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Eksekusi Generate Massal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE BILL CREATOR DIALOG */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
              <h3 className="font-bold text-neutral-800 text-base">Penerbitan Tagihan Siswa</h3>
              <button 
                onClick={() => setIsAddBillOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-250 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSingleBillSubmit} className="p-6 space-y-4">
              {singleError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{singleError}</span>
                </div>
              )}

              {/* Select Student */}
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Pilih Siswa Penerima *</label>
                <select 
                  value={singleStudentId}
                  onChange={(e) => setSingleStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  required
                >
                  <option value="">-- Pilih Siswa Aktif --</option>
                  {students.filter(s => s.status === 'Aktif').map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Kelas {s.className})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Bulan SPP</label>
                  <select 
                    value={singleMonth}
                    onChange={(e) => setSingleMonth(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Tahun SPP</label>
                  <select 
                    value={singleYear}
                    onChange={(e) => setSingleYear(parseInt(e.target.value) || 2026)}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Nominal Tagihan (IDR)</label>
                <input 
                  type="number" 
                  value={singleAmount}
                  onChange={(e) => setSingleAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-hidden bg-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddBillOpen(false)}
                  className="w-full py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-650 text-xs hover:bg-neutral-100 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  id="btn-submit-single-bill"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Terbitkan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
