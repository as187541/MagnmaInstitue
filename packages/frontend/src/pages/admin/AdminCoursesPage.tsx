// ============================================================
// Courses Management Page (Admin + Staff)
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

interface Course {
  id: string;
  name: string;
  description: string;
  image: string;
  created_at: string;
}

export default function AdminCoursesPage() {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course.");
      return;
    }

    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Courses</h1>
        <Link to="/admin/courses/new" className="btn-primary">
          <i className="fa fa-plus"></i> Add Course
        </Link>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loading">
          <i className="fa fa-spinner fa-spin"></i> Loading courses...
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="course-cell">
                      <img
                        src={
                          course.image ||
                          "https://placehold.co/40x40/0a4d68/FFF?text=C"
                        }
                        alt={course.name}
                        className="course-thumb"
                      />
                      <span>{course.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="desc-text">
                      {course.description?.substring(0, 80) || "No description"}
                      {course.description?.length > 80 ? "..." : ""}
                    </span>
                  </td>
                  <td className="actions">
                    <Link
                      to={`/course/${course.id}`}
                      className="btn-icon"
                      title="View"
                      target="_blank"
                    >
                      <i className="fa fa-eye"></i>
                    </Link>
                    <Link
                      to={`/admin/courses/${course.id}/rankings`}
                      className="btn-icon"
                      title="Manage Rankings"
                    >
                      <i className="fa fa-list-ol"></i>
                    </Link>
                    {isAdmin && (
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => deleteCourse(course.id)}
                        title="Delete"
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCourses.length === 0 && (
            <div className="empty-state">
              <i className="fa fa-graduation-cap"></i>
              <p>No courses found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
