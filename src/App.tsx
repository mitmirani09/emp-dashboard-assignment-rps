import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { Layout } from './components/common/Layout';
import { Dashboard } from './pages/Dashboard';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { NotFound } from './pages/NotFound';
import { Toaster } from 'sonner';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <EmployeeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="leaves" element={<LeavesPage />} />
              <Route path="directory" element={<DirectoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors />
      </EmployeeProvider>
    </ThemeProvider>
  );
};

export default App;
