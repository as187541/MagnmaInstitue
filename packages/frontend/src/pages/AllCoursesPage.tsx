import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../api/client";

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then((res) => {
      if (res.success) setCourses(res.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="main-container all-courses-page">
      <h1 className="page-heading">Explore Our Courses</h1>

      <div className="in-section-search-bar">
        <input
          type="text"
          id="course-search"
          className="search-input"
          placeholder="🔍 Search for courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: 40 }}>Loading courses...</p>
      ) : (
        <div id="courses-grid" className="courses-grid">
          {filtered.map((course: any) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="course-card"
            >
              <img
                src={course.image || "https://placehold.co/60x60/0a4d68/FFF?text=Course"}
                alt={course.name}
              />
              <div className="course-card-text">
                <h3>{course.name}</h3>
                <p>{course.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div
        id="no-courses-found"
        className="no-results"
        style={{ display: filtered.length === 0 && !loading ? "block" : "none" }}
      >
        No courses found matching your search.
      </div>
    </main>
  );
}
