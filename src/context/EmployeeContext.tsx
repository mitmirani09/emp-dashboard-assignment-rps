import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, AttendanceRecord, LeaveBalance, LeaveRequest, Announcement } from '../types';

import mockEmployees from '../data/mockEmployees.json';
import mockLeaves from '../data/mockLeaves.json';
import mockAttendanceRecords from '../data/mockAttendance.json';
import mockAnnouncements from '../data/mockAnnouncements.json';

interface EmployeeContextType {
  employees: Employee[];
  currentUser: Employee;
  attendanceRecords: AttendanceRecord[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  isPunchedIn: boolean;
  activePunchInTime: string | null;
  punchIn: () => void;
  punchOut: () => void;
  submitLeaveRequest: (req: { startDate: string; endDate: string; leaveType: 'casual' | 'sick' | 'earned'; reason: string }) => boolean;
  updateProfile: (profile: Partial<Employee>) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Core lists state with LocalStorage checking
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('emp_employees');
    return saved ? JSON.parse(saved) : (mockEmployees as Employee[]);
  });

  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    const saved = localStorage.getItem('emp_currentUser');
    return saved ? JSON.parse(saved) : (mockEmployees[0] as Employee);
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('emp_attendanceRecords');
    return saved ? JSON.parse(saved) : (mockAttendanceRecords as AttendanceRecord[]);
  });

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(() => {
    const saved = localStorage.getItem('emp_leaveBalances');
    return saved ? JSON.parse(saved) : (mockLeaves.balances as LeaveBalance[]);
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('emp_leaveRequests');
    return saved ? JSON.parse(saved) : (mockLeaves.requests as LeaveRequest[]);
  });

  const [announcements] = useState<Announcement[]>(mockAnnouncements as Announcement[]);

  // 2. Punch-in status state
  const [isPunchedIn, setIsPunchedIn] = useState<boolean>(() => {
    return localStorage.getItem('emp_isPunchedIn') === 'true';
  });

  const [activePunchInTime, setActivePunchInTime] = useState<string | null>(() => {
    return localStorage.getItem('emp_activePunchInTime');
  });

  // 3. Save states to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('emp_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('emp_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('emp_attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('emp_leaveBalances', JSON.stringify(leaveBalances));
  }, [leaveBalances]);

  useEffect(() => {
    localStorage.setItem('emp_leaveRequests', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('emp_isPunchedIn', String(isPunchedIn));
    if (activePunchInTime) {
      localStorage.setItem('emp_activePunchInTime', activePunchInTime);
    } else {
      localStorage.removeItem('emp_activePunchInTime');
    }
  }, [isPunchedIn, activePunchInTime]);

  // 4. Punch In Action
  const punchIn = () => {
    const now = new Date().toISOString();
    setIsPunchedIn(true);
    setActivePunchInTime(now);
  };

  // 5. Punch Out Action
  const punchOut = () => {
    if (!activePunchInTime) return;

    const punchInDate = new Date(activePunchInTime);
    const now = new Date();
    const durationMs = now.getTime() - punchInDate.getTime();
    const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100; // rounded to 2 decimals

    // Formatter helpers
    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const checkInTime = formatTime(punchInDate);
    const checkOutTime = formatTime(now);
    const dateStr = formatDate(now);

    // Determine status (Late if check-in is after 09:15 AM)
    const checkInHour = punchInDate.getHours();
    const checkInMinute = punchInDate.getMinutes();
    let status: 'present' | 'late' = 'present';
    if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15)) {
      status = 'late';
    }

    const newRecord: AttendanceRecord = {
      date: dateStr,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      status,
      duration: durationHours
    };

    // Prepend new record, avoiding duplicates for the same day (replaces today's if punched out again)
    setAttendanceRecords(prev => {
      const filtered = prev.filter(r => r.date !== dateStr);
      return [newRecord, ...filtered];
    });

    setIsPunchedIn(false);
    setActivePunchInTime(null);
  };

  // 6. Request Leave Action
  const submitLeaveRequest = (req: { 
    startDate: string; 
    endDate: string; 
    leaveType: 'casual' | 'sick' | 'earned'; 
    reason: string; 
  }): boolean => {
    // Calculate total days requested (inclusive of start/end dates)
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check balance
    const balanceIndex = leaveBalances.findIndex(b => b.type === req.leaveType);
    if (balanceIndex === -1) return false;
    const balance = leaveBalances[balanceIndex];

    if (balance.available < diffDays) {
      return false; // Insufficient balance
    }

    // Optimistic balance update
    const updatedBalances = [...leaveBalances];
    updatedBalances[balanceIndex] = {
      ...balance,
      used: balance.used + diffDays,
      available: balance.available - diffDays
    };
    setLeaveBalances(updatedBalances);

    // Add to leave requests list
    const newRequest: LeaveRequest = {
      id: `req-${Date.now()}`,
      startDate: req.startDate,
      endDate: req.endDate,
      leaveType: req.leaveType,
      reason: req.reason,
      status: 'approved', // Auto-approved for mock purposes to immediately showcase in calendar
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests(prev => [newRequest, ...prev]);
    return true;
  };

  // 7. Update User Profile Action
  const updateProfile = (profile: Partial<Employee>) => {
    const updatedUser = { ...currentUser, ...profile };
    setCurrentUser(updatedUser);

    // Sync in global directory list
    setEmployees(prev => prev.map(emp => emp.id === currentUser.id ? updatedUser : emp));
  };

  return (
    <EmployeeContext.Provider value={{
      employees,
      currentUser,
      attendanceRecords,
      leaveBalances,
      leaveRequests,
      announcements,
      isPunchedIn,
      activePunchInTime,
      punchIn,
      punchOut,
      submitLeaveRequest,
      updateProfile
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployee must be used within an EmployeeProvider');
  return context;
};
