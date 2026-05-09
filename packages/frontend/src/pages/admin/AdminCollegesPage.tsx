// ============================================================
// Colleges Management Page (Admin + Staff)
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import SEO from "../../components/SEO";

interface College {
  id: string;
  name: string;
  location: string;
  logo_image: string;
  featured: boolean;
  ranking: string;
  display_order: number;
  created_at: string;
}

export default function AdminCollegesPage() {
  const { isAdmin } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchColleges();
  }, []);

  async function fetchColleges() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCollege(id: string) {
    if (!confirm("Are you sure you want to delete this college?")) return;

    const { error } = await supabase.from("colleges").delete().eq("id", id);

    if (error) {
      console.error("Error deleting college:", error);
      alert("Failed to delete college.");
      return;
    }

    setColleges((prev) => prev.filter((c) => c.id !== id));
  }

  async function toggleFeatured(id: string, current: boolean) {
    const { error } = await supabase
      .from("colleges")
      .update({ featured: !current })
      .eq("id", id);

    if (error) {
      console.error("Error updating college:", error);
      return;
    }

    setColleges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, featured: !current } : c))
    );
  }

  async function updateRanking(id: string, newRanking: string) {
    const { error } = await supabase
      .from("colleges")
      .update({ ranking: newRanking })
      .eq("id", id);

    if (error) {
      console.error("Error updating ranking:", error);
      alert("Failed to update ranking.");
      return;
    }

    setColleges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ranking: newRanking } : c))
    );
  }

  async function moveCollege(collegeId: string, direction: "up" | "down") {
    if (searchQuery) {
      alert("Please clear the search filter to reorder colleges.");
      return;
    }

    const index = colleges.findIndex((c) => c.id === collegeId);
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= colleges.length) return;

    const updated = [...colleges];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    // Update display_order for all affected colleges
    const updates = updated.map((college, i) => ({
      id: college.id,
      display_order: i + 1,
    }));

    try {
      for (const update of updates) {
        await supabase
          .from("colleges")
          .update({ display_order: update.display_order })
          .eq("id", update.id);
      }
      setColleges(updated);
    } catch (error) {
      console.error("Error reordering colleges:", error);
      alert("Failed to reorder colleges.");
    }
  }

  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEO title="Manage Colleges" noindex />
      <div className="admin-page">
      <div className="admin-page-header">
        <h1>Colleges</h1>
        <Link to="/admin/colleges/new" className="btn-primary">
          <i className="fa fa-plus"></i> Add College
        </Link>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loading">
          <i className="fa fa-spinner fa-spin"></i> Loading colleges...
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Order</th>
                <th>College</th>
                <th>Location</th>
                <th>Ranking</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredColleges.map((college, index) => (
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
                        disabled={index === filteredColleges.length - 1}
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
                      value={college.ranking || ""}
                      onChange={(e) =>
                        setColleges((prev) =>
                          prev.map((c) =>
                            c.id === college.id
                              ? { ...c, ranking: e.target.value }
                              : c
                          )
                        )
                      }
                      onBlur={(e) => updateRanking(college.id, e.target.value)}
                      placeholder="e.g. #1"
                      title="Click to edit ranking"
                    />
                  </td>
                  <td>
                    <button
                      className={`btn-toggle ${college.featured ? "active" : ""}`}
                      onClick={() => toggleFeatured(college.id, college.featured)}
                      title={college.featured ? "Unfeature" : "Feature"}
                    >
                      <i
                        className={`fa ${
                          college.featured ? "fa-star" : "fa-star-o"
                        }`}
                      ></i>
                    </button>
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
                    <Link
                      to={`/admin/colleges/edit/${college.id}`}
                      className="btn-icon"
                      title="Edit"
                    >
                      <i className="fa fa-pencil"></i>
                    </Link>
                    {isAdmin && (
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => deleteCollege(college.id)}
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

          {filteredColleges.length === 0 && (
            <div className="empty-state">
              <i className="fa fa-university"></i>
              <p>No colleges found</p>
            </div>
          )}
        </div>
      )}
    </div>
  </>
  );
}
