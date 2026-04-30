import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { CompareProvider } from "./contexts/CompareContext";
import HomePage from "./pages/HomePage";
import AllCollegesPage from "./pages/AllCollegesPage";
import CollegeDetailPage from "./pages/CollegeDetailPage";
import AllCoursesPage from "./pages/AllCoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import ComparePage from "./pages/ComparePage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminBlogPage from "./pages/admin/AdminBlogPage";
import AdminBlogEditorPage from "./pages/admin/AdminBlogEditorPage";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";

import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCollegesPage from "./pages/admin/AdminCollegesPage";
import AdminCollegeEditorPage from "./pages/admin/AdminCollegeEditorPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import AdminCourseEditorPage from "./pages/admin/AdminCourseEditorPage";
import AdminCourseRankingsPage from "./pages/admin/AdminCourseRankingsPage";

export default function App() {
  return (
    <CompareProvider>
    <Routes>
      {/* Public Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/colleges" element={<AllCollegesPage />} />
        <Route path="/college/:id" element={<CollegeDetailPage />} />
        <Route path="/courses" element={<AllCoursesPage />} />
        <Route path="/course/:id" element={<CourseDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Admin Routes (Protected) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/blog" element={<AdminBlogPage />} />
        <Route path="/admin/blog/new" element={<AdminBlogEditorPage />} />
        <Route path="/admin/blog/edit/:id" element={<AdminBlogEditorPage />} />
        <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
        <Route path="/admin/colleges" element={<AdminCollegesPage />} />
        <Route path="/admin/colleges/new" element={<AdminCollegeEditorPage />} />
        <Route path="/admin/colleges/edit/:id" element={<AdminCollegeEditorPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/courses/new" element={<AdminCourseEditorPage />} />
        <Route path="/admin/courses/edit/:id" element={<AdminCourseEditorPage />} />
        <Route path="/admin/courses/:id/rankings" element={<AdminCourseRankingsPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
    </CompareProvider>
  );
}
