export interface SchoolInfo {
  name: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  accreditation: string;
  principalName: string;
  principalNip: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
}

export interface Student {
  id: string; // UUID or short ID
  nisn: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  className: string; // e.g., "7-A", "10-IPA-1"
  address: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Pemberhentian';
}

export interface Teacher {
  id: string;
  nip: string; // NIP (Nomor Induk Pegawai)
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  subject: string; // Main teaching subject
  email: string;
  phone: string;
  address: string;
  position: string; // e.g., "Guru Kelas", "Kepala Jurusan", "Guru Mapel"
  status: 'Aktif' | 'Cuti' | 'Non-Aktif';
}

export interface Classroom {
  id: string;
  className: string;
  gradeLevel: string; // e.g. "VII", "X"
  guardianTeacherId: string; // foreign key to Teacher.id
  guardianTeacherName?: string;
  room: string; // room physical number
  capacity: number;
}

export interface SppInvoice {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  month: string; // e.g., "Januari", "Februari"
  year: number;
  amount: number;
  status: 'Lunas' | 'Belum Lunas';
  paymentDate?: string;
  paymentMethod?: 'Tunai' | 'Transfer' | 'Gopay/OVO' | 'Lainnya';
  refNo?: string;
}

export interface StudentReport {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  semester: 'Ganjil' | 'Genap';
  academicYear: string; // e.g. "2025/2026"
  
  // Subject Grades (0-100)
  mathematics: number;
  science: number;
  english: number;
  indonesian: number;
  civics: number; // Pendidikan Pancasila / PKn
  religion: number;
  physicalEd: number; // PJOK
  art: number;
  
  // Attendance
  sickDays: number; // Sakit
  excusedDays: number; // Izin
  unexcusedDays: number; // Alpa
  
  // Character & Extra
  conduct: 'Amat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  notes: string;
}

export interface AdministrativeLetter {
  id: string;
  referenceNumber: string; // Nomor Surat, e.g., "421/045/SMP-ID/2026"
  title: string;
  type: 'Keterangan Aktif' | 'Panggilan Wali Murid' | 'Undangan Rapat' | 'Rekomendasi';
  recipientName: string;
  dateCreated: string;
  content: string; // Raw markdown text or custom paragraph
  studentId?: string; // Optional reference
  studentName?: string;
  teacherId?: string; // Optional reference
  teacherName?: string;
}
