import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourse, getCollegesForCourse } from "../api/client";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState("all");

  useEffect(() => {
    if (!id) return;
    Promise.all([getCourse(id), getCollegesForCourse(id)]).then(
      ([courseRes, collegesRes]) => {
        if (courseRes.success) {
          setCourse(courseRes.data);
          document.title = `${courseRes.data.name} - Magnma Institute`;
        }
        if (collegesRes.success) {
          setColleges(collegesRes.data || []);
        }
        setLoading(false);
      }
    );
  }, [id]);

  if (loading) {
    return (
      <main>
        <section style={{ textAlign: "center", padding: 100 }}>
          <p>Loading course details...</p>
        </section>
      </main>
    );
  }

  if (!course) {
    return (
      <main>
        <section style={{ textAlign: "center", padding: 100 }}>
          <h1>Course Not Found</h1>
          <p>The course you are looking for does not exist.</p>
          <Link to="/courses" className="view-more-btn" style={{ marginTop: 20 }}>
            Back to Courses
          </Link>
        </section>
      </main>
    );
  }

  const filteredColleges =
    id === "btech" && selectedSpec !== "all"
      ? colleges.filter((c) =>
          c.courses?.some(
            (courseName: string) =>
              courseName.toLowerCase() === selectedSpec.toLowerCase()
          )
        )
      : id === "btech" && selectedSpec === "all"
      ? colleges.filter((c) =>
          c.courses?.some((courseName: string) =>
            courseName.toLowerCase().startsWith("b.tech")
          )
        )
      : colleges;

  return (
    <main>
      {/* Course Header */}
      <section className="course-header">
        <h1>{course.name}</h1>
        <p>{course.description}</p>
      </section>

      {/* B.Tech Specialization Filter */}
      {id === "btech" && course.specializations && (
        <section className="specialization-filter" style={{ padding: "30px 5%", textAlign: "center" }}>
          <label htmlFor="btech-specialization-select" style={{ fontWeight: 600, marginRight: 15 }}>
            Filter by Specialization:
          </label>
          <select
            id="btech-specialization-select"
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid var(--border-color)",
              fontSize: "1rem",
            }}
          >
            <option value="all">All Specializations</option>
            {course.specializations.map((spec: string) => (
              <option key={spec} value={`B.Tech in ${spec}`}>
                {spec}
              </option>
            ))}
          </select>
        </section>
      )}

      {/* Colleges Offering This Course */}
      <section className="colleges-section" style={{ padding: "0 5% 80px" }}>
        <h2 className="section-heading" style={{ fontSize: "2rem" }}>
          Colleges Offering {course.name}
        </h2>
        <div className="colleges-container">
          {filteredColleges.map((college: any) => (
            <Link
              key={college.id}
              to={`/college/${college.id}`}
              className="college-item"
            >
              <div className="college-image-wrapper">
                <img
                  src={college.logoImage || "https://placehold.co/400x400/0a4d68/FFF?text=College"}
                  alt={college.name}
                />
              </div>
              <div className="college-item-text">
                <h3>{college.name}</h3>
                <p>{college.location}</p>
                {college.ranking && (
                  <span className="college-ranking-badge">{college.ranking}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
        {filteredColleges.length === 0 && (
          <div className="no-results" style={{ display: "block" }}>
            No colleges found offering this course.
          </div>
        )}
      </section>
    </main>
  );
}
