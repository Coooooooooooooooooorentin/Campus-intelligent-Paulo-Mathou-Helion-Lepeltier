import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import CourseCatalog from './pages/CourseCatalog';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherGrades from './pages/TeacherGrades';
import TeacherAttendance from './pages/TeacherAttendance';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminStudentProfile from './pages/AdminStudentProfile';
import AdminTeachers from './pages/AdminTeachers';
import AdminTeacherProfile from './pages/AdminTeacherProfile';
import AdminCourses from './pages/AdminCourses';
import Schedule from './pages/Schedule';
import StudentEnrollments from './pages/StudentEnrollments';
import StudentAttendance from './pages/StudentAttendance';
import StudentScan from './pages/StudentScan';
import Messages from './pages/Messages';
import AcademicAdvisor from './pages/AcademicAdvisor';
import Transcript from './pages/Transcript';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/student/dashboard" element={user && user.role === 'Etudiant' ? <StudentDashboard /> : <Navigate to="/login" />} />
        <Route path="/student/catalog" element={user && user.role === 'Etudiant' ? <CourseCatalog /> : <Navigate to="/login" />} />
        <Route path="/student/enrollments" element={user && user.role === 'Etudiant' ? <StudentEnrollments /> : <Navigate to="/login" />} />
        <Route path="/student/attendance" element={user && user.role === 'Etudiant' ? <StudentAttendance /> : <Navigate to="/login" />} />
        <Route path="/student/scan" element={user && user.role === 'Etudiant' ? <StudentScan /> : <Navigate to="/login" />} />
        <Route path="/student/advisor" element={user && user.role === 'Etudiant' ? <AcademicAdvisor /> : <Navigate to="/login" />} />
        <Route path="/student/transcript" element={user && user.role === 'Etudiant' ? <Transcript /> : <Navigate to="/login" />} />
        
        <Route path="/teacher/dashboard" element={user && user.role === 'Professeur' ? <TeacherDashboard /> : <Navigate to="/login" />} />
        <Route path="/teacher/grades" element={user && user.role === 'Professeur' ? <TeacherGrades /> : <Navigate to="/login" />} />
        <Route path="/teacher/attendance" element={user && user.role === 'Professeur' ? <TeacherAttendance /> : <Navigate to="/login" />} />
        
        <Route path="/admin/dashboard" element={user && user.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/students" element={user && user.role === 'Admin' ? <AdminStudents /> : <Navigate to="/login" />} />
        <Route path="/admin/students/:id" element={user && user.role === 'Admin' ? <AdminStudentProfile /> : <Navigate to="/login" />} />
        
        <Route path="/admin/teachers" element={user && user.role === 'Admin' ? <AdminTeachers /> : <Navigate to="/login" />} />
        <Route path="/admin/teachers/:id" element={user && user.role === 'Admin' ? <AdminTeacherProfile /> : <Navigate to="/login" />} />
        
        <Route path="/admin/courses" element={user && user.role === 'Admin' ? <AdminCourses /> : <Navigate to="/login" />} />

        <Route path="/schedule" element={user ? <Schedule /> : <Navigate to="/login" />} />
        <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
