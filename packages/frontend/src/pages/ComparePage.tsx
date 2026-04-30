import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCollege } from "../api/client";
import { useCompare } from "../contexts/CompareContext";

export default function ComparePage() {
  const { compareIds, clearCompare } = useCompare();
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (compareIds.length === 0) {
      setLoading(false);
      return;
    }
    Promise.all(compareIds.map((id) => getCollege(id))).then((results) => {
      setColleges(results.map((r) => r.data).filter(Boolean));
      setLoading(false);
    });
  }, [compareIds]);

  if (loading) {
    return (
      <main className="main-container">
        <p style={{ textAlign: "center", padding: 60 }}>Loading comparison...</p>
      </main>
    );
  }

  if (colleges.length === 0) {
    return (
      <main className="main-container">
        <div style={{ textAlign: "center", padding: 60 }}>
          <h1 className="page-heading">Compare Colleges</h1>
          <p>No colleges selected for comparison.</p>
          <Link to="/colleges" className="view-more-btn" style={{ marginTop: 20, display: "inline-block" }}>
            Browse Colleges
          </Link>
        </div>
      </main>
    );
  }

  // Build comparison rows
  const rows: { label: string; getValue: (c: any) => string | string[] }[] = [
    { label: "Location", getValue: (c) => c.location || "—" },
    { label: "Ranking", getValue: (c) => c.ranking || "—" },
    { label: "Fees", getValue: (c) => c.fees || "—" },
    { label: "Affiliated To", getValue: (c) => c.affiliatedTo || "—" },
    { label: "Approved By", getValue: (c) => (c.approvedBy?.length ? c.approvedBy.join(", ") : "—") },
    { label: "Courses Offered", getValue: (c) => c.courses || [] },
    { label: "Admission Process", getValue: (c) => c.admissionProcess || [] },
    { label: "Documents Required", getValue: (c) => c.documentsRequired || [] },
  ];

  return (
    <main className="main-container compare-page">
      <div className="compare-header">
        <h1 className="page-heading">Compare Colleges</h1>
        <button className="compare-clear-btn" onClick={clearCompare}>
          <i className="fa fa-refresh"></i> Start Over
        </button>
      </div>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-label-cell">College</th>
              {colleges.map((college) => (
                <th key={college.id} className="compare-college-cell">
                  <Link to={`/college/${college.id}`} className="compare-college-link">
                    <div className="compare-college-image">
                      <img
                        src={college.logoImage || "https://placehold.co/200x200/0a4d68/FFF?text=College"}
                        alt={college.name}
                      />
                    </div>
                    <h3>{college.name}</h3>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="compare-label-cell">{row.label}</td>
                {colleges.map((college) => {
                  const val = row.getValue(college);
                  return (
                    <td key={college.id} className="compare-value-cell">
                      {Array.isArray(val) ? (
                        <ul className="compare-list">
                          {val.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
