export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  role: string;
  location: string;
  reportingTo?: string;
  joinDate: string;
  bio?: string;
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;           // "YYYY-MM-DD"
  checkIn: string;        // "HH:MM AM/PM" or "-"
  checkOut: string;       // "HH:MM AM/PM" or "-"
  status: 'present' | 'absent' | 'late' | 'early-leave';
  duration: number;       // hours worked
}

export interface LeaveBalance {
  employeeId: string;
  type: 'casual' | 'sick' | 'earned';
  total: number;
  used: number;
  available: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;      // "YYYY-MM-DD"
  endDate: string;        // "YYYY-MM-DD"
  leaveType: 'casual' | 'sick' | 'earned';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;      // "YYYY-MM-DD"
  approvedAt?: string;
  approverComment?: string;
}


export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'hr' | 'company' | 'event' | 'policy';
  author: string;
  createdAt: string;      // "YYYY-MM-DD"
  imageUrl?: string;
  importance: 'high' | 'medium' | 'low';
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  createdAt: string;      // ISO String
}
