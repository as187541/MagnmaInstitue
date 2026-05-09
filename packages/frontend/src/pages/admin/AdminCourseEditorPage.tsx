// ============================================================
// Course Editor (Admin) - Create / Edit
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { uploadImage } from "../../lib/storage";
import ImageUpload from "../../components/ImageUpload";
import SEO from "../../components/SEO";

interface CourseFormData {
  id: string;
  name: string;
  description: string;
  image: string;
  specializations: string;
  featured: boolean;
}

export default function AdminCourseEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<CourseFormData>({
    id: "",
    name: "",
    description: "",
    image: "",
    specializations: "",
    featured: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing && id) {
      fetchCourse(id);
    }
  }, [isEditing, id]);

  async function fetchCourse(courseId: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (error) throw error;
      if (data) {
        setForm({
          id: data.id,
          name: data.name,
          description: data.description || "",
          image: data.image || "",
          specializations: (data.specializations || []).join("\n"),
          featured: data.featured || false,
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
        throw new Error("Course name is required");
      }

      let courseId = isEditing ? form.id : generateId(form.name);

      // If creating new, ensure ID is unique
      if (!isEditing) {
        const { data: existing } = await supabase
          .from("courses")
          .select("id")
          .eq("id", courseId)
          .maybeSingle();

        if (existing) {
          const randomSuffix = Math.random().toString(36).slice(2, 6);
          courseId = `${courseId}-${randomSuffix}`;
        }
      }

      const payload = {
        id: courseId,
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        specializations: form.specializations.split("\n").map((s) => s.trim()).filter(Boolean),
        featured: form.featured,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from("courses")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }

      navigate("/admin/courses");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fa fa-spinner fa-spin"></i> Loading course...
      </div>
    );
  }

  return (
    <>
      <SEO title={isEditing ? "Edit Course" : "Create Course"} noindex />
      <div className="admin-page">
      <div className="admin-page-header">
        <h1>{isEditing ? "Edit Course" : "Add New Course"}</h1>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>
      )}

      <form className="blog-editor-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Course Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Bachelor of Medicine and Bachelor of Surgery"
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detailed description of the course..."
            rows={5}
            required
          />
        </div>

        <ImageUpload
          label="Course Image"
          value={form.image}
          onChange={(url) => setForm({ ...form, image: url })}
          folder="courses"
          uploadFn={uploadImage}
        />

        <div className="form-group">
          <label>Specializations (one per line)</label>
          <textarea
            value={form.specializations}
            onChange={(e) => setForm({ ...form, specializations: e.target.value })}
            placeholder="General Medicine&#10;Surgery&#10;Pediatrics"
            rows={4}
          />
          <span className="field-hint">Enter each specialization on a new line</span>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            <span>Featured (show on homepage)</span>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/admin/courses")}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> Saving...
              </>
            ) : isEditing ? (
              "Update Course"
            ) : (
              "Add Course"
            )}
          </button>
        </div>
      </form>
    </div>
  </>
  );
}
