import React, { useState } from 'react';
import { 
  Users, 
  UserSquare2, 
  Home, 
  CreditCard, 
  GraduationCap, 
  FileText, 
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Award
} from 'lucide-react';
import { Student, Teacher, Classroom, SppInvoice } from '../types';

interface DashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: Classroom[];
  invoices: SppInvoice[];
  setActiveTab: (tab: string) => void;
  schoolName: string;
}

export default function Dashboard({ 
  students, 
  teachers, 
  classes, 
  invoices, 
  setActiveTab,
  schoolName
}: DashboardProps) {
  // Compute analytics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'Aktif').length;
  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  
  // Financial calculation (SPP)
  const paidInvoices = invoices.filter(i => i.status === 'Lunas');
  const unpaidInvoices = invoices.filter(i => i.status === 'Belum Lunas');
  
  const totalEarned = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPending = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paymentRatePercent = invoices.length > 0 
    ? Math.round((paidInvoices.length / invoices.length) * 100) 
    : 0;

  // Compute student gender distribution
  const maleCount = students.filter(s => s.gender === 'Laki-laki').length;
  const femaleCount = students.filter(s => s.gender === 'Perempuan').length;
  const malePercent = totalStudents > 0 ? Math.round((maleCount / totalStudents) * 100) : 0;
  const femalePercent = totalStudents > 0 ? Math.round((femaleCount / totalStudents) * 100) : 0;

  // Compute students per class
  const classCounts = classes.map(cls => {
    const studentCount = students.filter(s => s.className === cls.className).length;
    return {
      className: cls.className,
      count: studentCount,
      percentage: totalStudents > 0 ? Math.round((studentCount / totalStudents) * 100) : 0
    };
  });

  // Recent 4 registered students
  const recentStudents = [...students].slice(-4).reverse();

  // Get current date string in Indonesian formatting
  const formattedDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Bento Base Grid Row 1: Welcome Banner & Quick Stat total students */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Welcome Card Info: col-span-3 */}
        <div className="bento-card col-span-1 lg:col-span-3 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white min-h-[170px] flex flex-col justify-between border-none shadow-lg shadow-indigo-950/20 relative">
          <span className="edit-badge !bg-indigo-900/40 !text-indigo-200">Main Hub</span>
          
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-12 bottom-0 w-36 h-36 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-indigo-300 text-[10px] font-bold tracking-wider uppercase">
              <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formattedDate}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black mt-2 tracking-tight">
              Sistem Administrasi {schoolName}
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Selamat datang kembali, Administrator. Semua modul utama terkonfigurasi secara dinamis. Kelola data peserta didik, dewan guru pengajar, tagihan keuangan SPP tahunan, serta penerbitan surat resmi tata usaha dalam satu dasbor bento terpadu.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 relative z-10">
            <span className="text-[11px] text-slate-400 font-medium font-mono">ASISTENSI DIGITAL • LAPOR SINKRON</span>
            <button 
              onClick={() => setActiveTab('settings')}
              className="text-xs font-bold text-indigo-300 hover:text-white transition-colors flex items-center gap-1.5 group cursor-pointer active:scale-95"
            >
              <span>Ubah Profil Sekolah</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Total Siswa - Solid Indigo Bento Card */}
        <div 
          id="stat-siswa"
          onClick={() => setActiveTab('students')}
          className="bento-card bg-indigo-600 border-none text-white hover:scale-[1.02] cursor-pointer shadow-md shadow-indigo-650/10 flex flex-col justify-between"
        >
          <span className="edit-badge !bg-indigo-500/30 !text-white">Database</span>
          <div className="space-y-1">
            <h3 className="text-xs font-bold opacity-80 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-200" />
              <span>Total Siswa</span>
            </h3>
            <p className="text-5xl font-extrabold mt-3 tracking-tight">{totalStudents}</p>
          </div>
          <p className="text-[10px] mt-auto flex items-center gap-1.5 text-indigo-200 pt-6">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse z-10"></span>
            <span>{activeStudents} Siswa Berstatus Aktif</span>
          </p>
        </div>
      </div>

      {/* Bento Row 2: Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Total Pendidik */}
        <div 
          id="stat-guru"
          onClick={() => setActiveTab('teachers')}
          className="bento-card hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <span className="edit-badge">Pendidik</span>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <UserSquare2 className="w-4 h-4 text-emerald-500" />
              <span>Staf Pengajar</span>
            </h3>
            <p className="text-4xl font-black mt-2 text-slate-800 tracking-tight">{totalTeachers}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
            <span>Kompetensi Terpadu</span>
            <span className="text-indigo-600 font-bold hover:underline">Kelola &rarr;</span>
          </p>
        </div>

        {/* Card: Rombel */}
        <div 
          id="stat-kelas"
          onClick={() => setActiveTab('classes')}
          className="bento-card hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <span className="edit-badge">Rombel</span>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Home className="w-4 h-4 text-rose-500" />
              <span>Jumlah Kelas</span>
            </h3>
            <p className="text-4xl font-black mt-2 text-slate-800 tracking-tight">{totalClasses}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
            <span>Kurikulum Merdeka</span>
            <span className="text-indigo-600 font-bold hover:underline">Buka &rarr;</span>
          </p>
        </div>

        {/* Card: SPP Rate */}
        <div 
          id="stat-spp"
          onClick={() => setActiveTab('finance')}
          className="bento-card hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <span className="edit-badge bg-emerald-50 text-emerald-700">Realisasi</span>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>Rasio SPP</span>
            </h3>
            <p className="text-4xl font-black mt-2 text-slate-800 tracking-tight">{paymentRatePercent}%</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
            <span>{paidInvoices.length} Lunas / {invoices.length} Tagihan</span>
            <span className="text-indigo-600 font-bold hover:underline">Bayar &rarr;</span>
          </p>
        </div>

        {/* Capacity Widget */}
        <div className="bento-card flex flex-col justify-between">
          <span className="edit-badge">Status</span>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Kapasitas & Rasio
          </h3>
          <div className="space-y-2 mt-2">
            <div>
              <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-500">
                <span>Rasio Guru & Siswa</span>
                <span>{totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 0} : 1</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-500">
                <span>Ruang Pengajaran</span>
                <span>92%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full">
                <div className="bg-orange-400 h-full rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Row 3: Main Contents Dashboard Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Column Left (2/3 width on desktop): Visualizers & SPP Details */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          
          {/* SPP Finances Bento Card */}
          <div className="bento-card flex-1">
            <span className="edit-badge bg-emerald-50 text-emerald-700 font-semibold">Keuangan</span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Status Tata Kelola Keuangan SPP</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-100">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Pemasukan SPP</span>
                </div>
                <p className="text-2xl font-black text-emerald-950">IDR {totalEarned.toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">Total SPP lunas dibayar saat ini</p>
              </div>

              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                <div className="flex items-center gap-1.5 text-rose-800 mb-1">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Tunggakan SPP</span>
                </div>
                <p className="text-2xl font-black text-rose-950">IDR {totalPending.toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-rose-600 mt-0.5">Total tagihan jatuh tempo tertunggak</p>
              </div>
            </div>

            {/* Visual allocation bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                <span>Rasio Pembayaran Teralokasi</span>
                <span>{paymentRatePercent}% ({paidInvoices.length} dari {invoices.length} transaksi)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                  style={{ width: `${paymentRatePercent}%` }}
                />
                <div 
                  className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
                  style={{ width: `${100 - paymentRatePercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-center italic mt-1.5">
                Sistem menghitung SPP secara otomatis berbasis database siswa berstatus aktif.
              </p>
            </div>
          </div>

          {/* Demographics and Classroom Visual splits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Class distribution bento block */}
            <div className="bento-card">
              <span className="edit-badge">Rombel</span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-violet-500" />
                <span>Distribusi Siswa per Kelas</span>
              </h4>

              <div className="space-y-3">
                {classCounts.map((cls, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-700">Kelas {cls.className}</span>
                      <span className="text-slate-400 font-bold font-mono">{cls.count} Siswa ({cls.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${cls.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                {classCounts.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Belum ada rombel dikonfigurasi.</p>
                )}
              </div>
            </div>

            {/* Gender demographics bento card */}
            <div className="bento-card flex flex-col justify-between">
              <span className="edit-badge">Gender</span>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Demografi Siswa</span>
                </h4>

                <div className="grid grid-cols-2 gap-2 my-1">
                  <div className="p-2.5 bg-blue-50/50 rounded-xl text-center border border-blue-100/30">
                    <p className="text-[10px] text-slate-500">Laki-laki</p>
                    <p className="text-lg font-extrabold text-blue-700 mt-0.5">{maleCount}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{malePercent}%</p>
                  </div>
                  <div className="p-2.5 bg-pink-50/50 rounded-xl text-center border border-pink-100/30">
                    <p className="text-[10px] text-slate-500">Perempuan</p>
                    <p className="text-lg font-extrabold text-pink-600 mt-0.5">{femaleCount}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{femalePercent}%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 mt-2">
                <div className="w-full bg-pink-400 h-2 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-505 bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${malePercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>● Laki {malePercent}%</span>
                  <span>Perempuan {femalePercent}% ●</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Column Right (1/3 width): Quick actions and recents */}
        <div className="space-y-4">
          
          {/* Quick Actions Bento panel */}
          <div className="bento-card z-0">
            <span className="edit-badge bg-amber-50 text-amber-700">Akses</span>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-3">Akses Jalan Pintas</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                id="btn-goto-siswa"
                onClick={() => setActiveTab('students')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 transition-colors flex flex-col gap-1 cursor-pointer active:scale-95"
              >
                <Users className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="text-xs font-bold text-slate-800">Siswa Baru</span>
                <span className="text-[9px] text-slate-400">Pendaftaran</span>
              </button>

              <button 
                id="btn-goto-spp"
                onClick={() => setActiveTab('finance')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 transition-colors flex flex-col gap-1 cursor-pointer active:scale-95"
              >
                <CreditCard className="w-5 h-5 text-amber-500 mb-1" />
                <span className="text-xs font-bold text-slate-800">Bayar SPP</span>
                <span className="text-[9px] text-slate-400">Kas Keuangan</span>
              </button>

              <button 
                id="btn-goto-rapor"
                onClick={() => setActiveTab('academic')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 transition-colors flex flex-col gap-1 cursor-pointer active:scale-95"
              >
                <GraduationCap className="w-5 h-5 text-emerald-500 mb-1" />
                <span className="text-xs font-bold text-slate-800">Cetak Rapor</span>
                <span className="text-[9px] text-slate-400">Akademik</span>
              </button>

              <button 
                id="btn-goto-surat"
                onClick={() => setActiveTab('letters')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 transition-colors flex flex-col gap-1 cursor-pointer active:scale-95"
              >
                <FileText className="w-5 h-5 text-rose-500 mb-1" />
                <span className="text-xs font-bold text-slate-800">Bikin Surat</span>
                <span className="text-[9px] text-slate-400">Tata Usaha</span>
              </button>
            </div>
          </div>

          {/* Recent Registrations Card */}
          <div className="bento-card">
            <span className="edit-badge">Siswa Baru</span>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-2 flex items-center justify-between">
              <span>Registrasi Terkini</span>
              <span className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer" onClick={() => setActiveTab('students')}>
                Semua Siswa
              </span>
            </h4>

            <div className="divide-y divide-slate-100">
              {recentStudents.map((stud) => (
                <div key={stud.id} className="py-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0">
                    {stud.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{stud.name}</p>
                    <p className="text-[9px] text-slate-400">NISN: {stud.nisn} • Kls {stud.className}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                    stud.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {stud.status}
                  </span>
                </div>
              ))}
              {recentStudents.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">Belum ada siswa terdaftar.</p>
              )}
            </div>
          </div>

          {/* Mini info / System rules block styled like Bento Card */}
          <div className="bento-card bg-slate-900 border-none text-slate-100 flex flex-col justify-between p-5 shadow-inner">
            <span className="edit-badge !bg-slate-850/50 !text-slate-400">Aturan</span>
            <div>
              <h5 className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase mb-2">Pemberitahuan Sistem</h5>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Penyimpanan aktif berjalan otomatis dalam cache browser (<strong>LocalStorage</strong>). Silahkan unduh cadangan JSON sekolah di halaman Pengaturan secara rutin agar data tersimpan aman permanen.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
