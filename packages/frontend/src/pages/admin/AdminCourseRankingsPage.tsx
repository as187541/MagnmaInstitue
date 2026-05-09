// ============================================================
// Course-College Rankings Management Page
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import SEO from "../../components/SEO";

interface Course {
  id: string;
  name: string;
}

interface College {
  id: string;
  name: string;
  location: string;
  logo_image: string;
  courses: string[];
}

interface CourseRanking {
  college_id: string;
  display_order: number;
  ranking_label: string;
}

export default function AdminCourseRankingsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [colleges, setColleges] = useState<College[]>([]);
  const [rankings, setRankings] = useState<Map<string, CourseRanking>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchColleges();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchRankings(selectedCourse);
    }
  }, [selectedCourse]);

  async function fetchCourses() {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, name")
        .order("name");
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  }

  async function fetchColleges() {
    try {
      const { data, error } = await supabase
        .from("colleges")
        .select("id, name, location, logo_image, courses")
        .order("name");
      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRankings(courseId: string) {
    try {
      const { data, error } = await supabase
        .from("course_college_rankings")
        .select("college_id, display_order, ranking_label")
        .eq("course_id", courseId)
        .order("display_order", { ascending: true });

      if (error) throw error;

      const map = new Map<string, CourseRanking>();
      (data || []).forEach((r: any) => {
        map.set(r.college_id, {
          college_id: r.college_id,
          display_order: r.display_order,
          ranking_label: r.ranking_label || "",
        });
      });
      setRankings(map);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  }

  function getCollegesForCourse(courseId: string): College[] {
    const courseKey = courseId.toLowerCase();
    return colleges.filter((college) => {
      if (!college.courses || !Array.isArray(college.courses)) return false;
      return college.courses.some((c: any) => {
        const courseName = (typeof c === "object" ? c.key || "" : String(c)).toLowerCase();
        return courseName === courseKey || courseName.startsWith(courseKey) || courseKey.startsWith(courseName);
      });
    });
  }

  function getOrderedColleges(courseId: string): College[] {
    const courseColleges = getCollegesForCourse(courseId);
    
    // Sort by ranking display_order if exists, otherwise by college display_order
    return courseColleges.sort((a, b) => {
      const rankA = rankings.get(a.id)?.display_order ?? 9999;
      const rankB = rankings.get(b.id)?.display_order ?? 9999;
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });
  }

  async function moveCollege(collegeId: string, direction: "up" | "down") {
    if (!selectedCourse) return;

    const ordered = getOrderedColleges(selectedCourse);
    const index = ordered.findIndex((c) => c.id === collegeId);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= ordered.length) return;

    const updated = [...ordered];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    // Update display_order for all in this course
    const newRankings = new Map(rankings);
    for (let i = 0; i < updated.length; i++) {
      const cid = updated[i].id;
      const existing = newRankings.get(cid);
      newRankings.set(cid, {
        college_id: cid,
        display_order: i + 1,
        ranking_label: existing?.ranking_label || "",
      });
    }
    setRankings(newRankings);

    // Save to database
    await saveRankings(selectedCourse, newRankings);
  }

  async function updateRankingLabel(collegeId: string, label: string) {
    if (!selectedCourse) return;

    const newRankings = new Map(rankings);
    const existing = newRankings.get(collegeId);
    newRankings.set(collegeId, {
      college_id: collegeId,
      display_order: existing?.display_order || 9999,
      ranking_label: label,
    });
    setRankings(newRankings);

    await saveRankings(selectedCourse, newRankings);
  }

  async function saveRankings(courseId: string, rankMap: Map<string, CourseRanking>) {
    setIsSaving(true);
    try {
      // Upsert all rankings for this course
      const rows = Array.from(rankMap.entries()).map(([collegeId, rank]) => ({
        course_id: courseId,
        college_id: collegeId,
        display_order: rank.display_order,
        ranking_label: rank.ranking_label,
      }));

      for (const row of rows) {
        const { error } = await supabase
          .from("course_college_rankings")
          .upsert(row, { onConflict: "course_id,college_id" });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving rankings:", error);
      alert("Failed to save rankings.");
    } finally {
      setIsSaving(false);
    }
  }

  const orderedColleges = selectedCourse ? getOrderedColleges(selectedCourse) : [];

  return (
    <>
      <SEO title="Course Rankings" noindex />
      <div className="admin-page">
      <div className="admin-page-header">
        <h1>Course-College Rankings</h1>
        <Link to="/admin/courses" className="btn-secondary">
          <i className="fa fa-arrow-left"></i> Back to Courses
        </Link>
      </div>

      <div className="admin-filters">
        <div className="form-group" style={{ minWidth: 300 }}>
          <label>Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "var(--radius-8)",
              border: "1px solid var(--border-color)",
              fontSize: "1rem",
            }}
          >
            <option value="">-- Choose a course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSaving && (
        <div className="admin-loading" style={{ padding: "10px 0" }}>
          <i className="fa fa-spinner fa-spin"></i> Saving rankings...
        </div>
      )}

      {selectedCourse && (
        <div className="admin-table-container">
          <h2 style={{ marginBottom: 16, fontSize: "1.2rem" }}>
            Colleges for{" "}
            {courses.find((c) => c.id === selectedCourse)?.name}
          </h2>

          {orderedColleges.length === 0 ? (
            <div className="empty-state">
              <i className="fa fa-university"></i>
              <p>No colleges found offering this course.</p>
              <p style={{ fontSize: "0.85rem", marginTop: 8 }}>
                Make sure colleges have this course in their &quot;courses&quot; array.
              </p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Order</th>
                  <th>College</th>
                  <th>Location</th>
                  <th>Ranking Label</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderedColleges.map((college, index) => (
                  <tr key={college.id}>
                    <td>
                      <div className="order-controls">
                        <button
                          className="btn-icon"
                          onClick={() => moveCollege(college.id, "up")}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <i className="fa fa-chevron-up"></i>
                        </button>
                        <span className="order-number">{index + 1}</span>
                        <button
                          className="btn-icon"
                          onClick={() => moveCollege(college.id, "down")}
                          disabled={index === orderedColleges.length - 1}
                          title="Move down"
                        >
                          <i className="fa fa-chevron-down"></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="college-cell">
                        <img
                          src={
                            college.logo_image ||
                            "https://placehold.co/40x40/0a4d68/FFF?text=C"
                          }
                          alt={college.name}
                          className="college-thumb"
                        />
                        <span>{college.name}</span>
                      </div>
                    </td>
                    <td>{college.location}</td>
                    <td>
                      <input
                        type="text"
                        className="ranking-input"
                        value={rankings.get(college.id)?.ranking_label || ""}
                        onChange={(e) =>
                          setRankings((prev) => {
                            const next = new Map(prev);
                            const existing = next.get(college.id);
                            next.set(college.id, {
                              college_id: college.id,
                              display_order: existing?.display_order || 9999,
                              ranking_label: e.target.value,
                            });
                            return next;
                          })
                        }
                        onBlur={(e) =>
                          updateRankingLabel(college.id, e.target.value)
                        }
                        placeholder="e.g. #1"
                        title="Click to edit ranking label"
                      />
                    </td>
                    <td className="actions">
                      <Link
                        to={`/college/${college.id}`}
                        className="btn-icon"
                        title="View"
                        target="_blank"
                      >
                        <i className="fa fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {!selectedCourse && !isLoading && (
        <div className="empty-state">
          <i className="fa fa-list-ol"></i>
          <p>Select a course above to manage its college rankings.</p>
        </div>
      )}
    </div>
  </>
  );
}
