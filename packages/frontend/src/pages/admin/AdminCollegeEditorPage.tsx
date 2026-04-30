// ============================================================
// College Editor (Admin) - Create / Edit
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface CollegeFormData {
  id: string;
  name: string;
  logo_image: string;
  location: string;
  ranking: string;
  fees: string;
  featured: boolean;
  description: string;
  approved_by: string;
  affiliated_to: string;
  admission_process: string;
  documents_required: string;
  images: string;
  courses: string;
}

export default function AdminCollegeEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<CollegeFormData>({
    id: "",
    name: "",
    logo_image: "",
    location: "",
    ranking: "",
    fees: "Contact us for detailed fee structure.",
    featured: false,
    description: "",
    approved_by: "",
    affiliated_to: "",
    admission_process: "",
    documents_required: "",
    images: "",
    courses: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      fetchCollege(id);
    }
  }, [isEditing, id]);

  async function fetchCollege(collegeId: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("colleges")
        .select("*")
        .eq("id", collegeId)
        .single();

      if (error) throw error;
      if (data) {
        setForm({
          id: data.id,
          name: data.name,
          logo_image: data.logo_image || "",
          location: data.location || "",
          ranking: data.ranking || "",
          fees: data.fees || "Contact us for detailed fee structure.",
          featured: data.featured || false,
          description: data.description || "",
          approved_by: (data.approved_by || []).join(", "),
          affiliated_to: data.affiliated_to || "",
          admission_process: (data.admission_process || []).join("\n"),
          documents_required: (data.documents_required || []).join("\n"),
          images: (data.images || []).join("\n"),
          courses: (data.courses || []).join("\n"),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function generateId(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 60);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (!form.name.trim()) {
        throw new Error("College name is required");
      }

      const collegeId = isEditing ? form.id : generateId(form.name);

      const payload = {
        id: collegeId,
        name: form.name.trim(),
        logo_image: form.logo_image.trim(),
        location: form.location.trim(),
        ranking: form.ranking.trim(),
        fees: form.fees.trim(),
        featured: form.featured,
        description: form.description.trim(),
        approved_by: form.approved_by.split(",").map((s) => s.trim()).filter(Boolean),
        affiliated_to: form.affiliated_to.trim(),
        admission_process: form.admission_process.split("\n").map((s) => s.trim()).filter(Boolean),
        documents_required: form.documents_required.split("\n").map((s) => s.trim()).filter(Boolean),
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        courses: form.courses.split("\n").map((s) => s.trim()).filter(Boolean),
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from("colleges")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("colleges").insert(payload);
        if (error) throw error;
      }

      navigate("/admin/colleges");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fa fa-spinner fa-spin"></i> Loading college...
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{isEditing ? "Edit College" : "Add New College"}</h1>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>
      )}

      <form className="blog-editor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>College Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., IQ City Medical College"
            required
          />
        </div>

        <div className="form-group">
          <label>Logo Image URL</label>
          <input
            type="text"
            value={form.logo_image}
            onChange={(e) => setForm({ ...form, logo_image: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g., Durgapur, West Bengal"
              required
            />
          </div>

          <div className="form-group">
            <label>Ranking</label>
            <input
              type="text"
              value={form.ranking}
              onChange={(e) => setForm({ ...form, ranking: e.target.value })}
              placeholder="e.g., Top 10 in West Bengal"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Fees</label>
          <input
            type="text"
            value={form.fees}
            onChange={(e) => setForm({ ...form, fees: e.target.value })}
            placeholder="Fee structure or contact message"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of the college..."
            rows={5}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Affiliated To</label>
            <input
              type="text"
              value={form.affiliated_to}
              onChange={(e) => setForm({ ...form, affiliated_to: e.target.value })}
              placeholder="e.g., West Bengal University of Health Sciences"
            />
          </div>

          <div className="form-group">
            <label>Approved By (comma separated)</label>
            <input
              type="text"
              value={form.approved_by}
              onChange={(e) => setForm({ ...form, approved_by: e.target.value })}
              placeholder="e.g., MCI, UGC, NAAC"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Admission Process (one per line)</label>
          <textarea
            value={form.admission_process}
            onChange={(e) => setForm({ ...form, admission_process: e.target.value })}
            placeholder="Step 1: Fill application form&#10;Step 2: Submit documents&#10;Step 3: Entrance exam"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Documents Required (one per line)</label>
          <textarea
            value={form.documents_required}
            onChange={(e) => setForm({ ...form, documents_required: e.target.value })}
            placeholder="10th Marksheet&#10;12th Marksheet&#10;NEET Scorecard"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Courses Offered (one per line)</label>
          <textarea
            value={form.courses}
            onChange={(e) => setForm({ ...form, courses: e.target.value })}
            placeholder="MBBS&#10;BDS&#10;Nursing"
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Gallery Images (one URL per line)</label>
          <textarea
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            rows={4}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Feature this college on homepage
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/colleges")}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> Saving...
              </>
            ) : isEditing ? (
              "Update College"
            ) : (
              "Add College"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
