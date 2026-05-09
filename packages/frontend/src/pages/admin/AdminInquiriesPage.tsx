// ============================================================
// Inquiry Management Page (Admin)
// ============================================================

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import SEO from "../../components/SEO";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  number: string;
  date: string;
  time: string;
  message: string;
  college_applying_for: string;
  created_at: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function deleteInquiry(id: string) {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting inquiry:", error);
      return;
    }

    setInquiries((prev) => prev.filter((i) => i.id !== id));
  }

  function exportToCSV() {
    const headers = ["Name", "Email", "Phone", "Date", "Time", "Message", "College", "Submitted"];
    const rows = inquiries.map((i) => [
      i.name,
      i.email,
      i.number,
      i.date,
      i.time,
      i.message,
      i.college_applying_for,
      new Date(i.created_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <SEO title="Manage Inquiries" noindex />
      <div className="admin-page">
      <div className="admin-page-header">
        <h1>Inquiries</h1>
        <button className="btn-secondary" onClick={exportToCSV}>
          <i className="fa fa-download"></i> Export CSV
        </button>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loading">
          <i className="fa fa-spinner fa-spin"></i> Loading inquiries...
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Date/Time</th>
                <th>Message</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>
                    <strong>{inquiry.name}</strong>
                    {inquiry.college_applying_for && (
                      <span className="college-tag">
                        {inquiry.college_applying_for}
                      </span>
                    )}
                  </td>
                  <td>
                    <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                    <br />
                    <a href={`tel:${inquiry.number}`}>{inquiry.number}</a>
                  </td>
                  <td>
                    {inquiry.date} at {inquiry.time}
                  </td>
                  <td className="message-cell">
                    {inquiry.message || "—"}
                  </td>
                  <td className="actions">
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => deleteInquiry(inquiry.id)}
                      title="Delete"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInquiries.length === 0 && (
            <div className="empty-state">
              <i className="fa fa-inbox"></i>
              <p>No inquiries found</p>
            </div>
          )}
        </div>
      )}
    </div>
  </>
  );
}
