import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getColleges } from "../api/client";
import { useCompare } from "../contexts/CompareContext";

export default function AllCollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { compareIds, toggleCompare, isSelected } = useCompare();

  useEffect(() => {
    getColleges().then((res) => {
      if (res.success) setColleges(res.data || []);
      setLoading(false);
    });
  }, []);

  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="main-container all-colleges-page">
      <h1 className="page-heading">Our Partner Colleges</h1>

      <div className="in-section-search-bar">
        <input
          type="text"
          id="college-search"
          className="search-input"
          placeholder="🔍 Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: 40 }}>Loading colleges...</p>
      ) : (
        <div id="colleges-grid" className="colleges-container">
          {filtered.map((college: any) => {
            const selected = isSelected(college.id);
            return (
              <div key={college.id} className={`college-item-wrapper ${selected ? "selected" : ""}`}>
                <Link
                  to={`/college/${college.id}`}
                  className="college-item"
                >
                  <div className="college-image-wrapper">
                    <img
                      src={college.logoImage || "https://placehold.co/400x400/0a4d68/FFF?text=College"}
                      alt={`${college.name} Logo`}
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
                <label
                  className={`compare-checkbox ${selected ? "checked" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCompare(college.id)}
                  />
                  <span className="checkmark">
                    {selected ? <i className="fa fa-check"></i> : <i className="fa fa-plus"></i>}
                  </span>
                  <span className="compare-label">Compare</span>
                </label>
              </div>
            );
          })}
        </div>
      )}

      <div
        id="no-colleges-found"
        className="no-results"
        style={{ display: filtered.length === 0 && !loading ? "block" : "none" }}
      >
        No colleges found matching your search.
      </div>

      {/* Floating compare bar */}
      <CompareBar colleges={colleges} />
    </main>
  );
}

function CompareBar({ colleges }: { colleges: any[] }) {
  const { compareIds, removeCompare, clearCompare } = useCompare();
  const selectedColleges = colleges.filter((c) => compareIds.includes(c.id));

  if (compareIds.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar-inner">
        <div className="compare-bar-items">
          {selectedColleges.map((college) => (
            <div key={college.id} className="compare-bar-item">
              <img src={college.logoImage || ""} alt={college.name} />
              <span className="compare-bar-name">{college.name}</span>
              <button className="compare-bar-remove" onClick={() => removeCompare(college.id)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
          ))}
        </div>
        <div className="compare-bar-actions">
          <span className="compare-count">{compareIds.length} / 4 selected</span>
          <Link to="/compare" className="compare-btn">
            <i className="fa fa-bar-chart"></i> Compare Now
          </Link>
          <button className="compare-clear-btn" onClick={clearCompare}>
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
