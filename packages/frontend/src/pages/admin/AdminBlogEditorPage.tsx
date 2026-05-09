// ============================================================
// Blog Post Editor (Admin) - Create / Edit
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { uploadImage } from "../../lib/storage";
import { sanitizeHtml } from "../../lib/sanitize";
import ImageUpload from "../../components/ImageUpload";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  published: boolean;
}

export default function AdminBlogEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    published: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchPost(id);
    }
  }, [isEditing, id]);

  async function fetchPost(postId: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error) throw error;
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content: data.content || "",
          featured_image: data.featured_image || "",
          published: data.published,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 60);
  }

  function handleTitleChange(title: string) {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (!form.title.trim() || !form.slug.trim()) {
        throw new Error("Title and slug are required");
      }

      const payload = {
        ...form,
        author_id: user?.id,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }

      navigate("/admin/blog");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fa fa-spinner fa-spin"></i> Loading post...
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>{isEditing ? "Edit Blog Post" : "New Blog Post"}</h1>
        <div className="editor-actions">
          <button
            className={`btn-secondary ${previewMode ? "active" : ""}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <i className={`fa fa-${previewMode ? "pencil" : "eye"}`}></i>{" "}
            {previewMode ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {previewMode ? (
        <div className="blog-preview">
          <article className="blog-post-full">
            {form.featured_image && (
              <img
                src={form.featured_image}
                alt={form.title}
                className="blog-featured-image"
              />
            )}
            <h1>{form.title || "Untitled"}</h1>
            <p className="blog-excerpt">{form.excerpt}</p>
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(form.content) }}
            />
          </article>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="blog-editor-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="Enter post title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              required
              placeholder="url-friendly-slug"
            />
            <span className="field-hint">
              Used in the URL: /blog/{form.slug}
            </span>
          </div>

          <ImageUpload
            label="Featured Image"
            value={form.featured_image}
            onChange={(url) => setForm((prev) => ({ ...prev, featured_image: url }))}
            folder="blog"
            uploadFn={uploadImage}
          />

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              placeholder="Brief summary of the post..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content (HTML supported) *</label>
            <textarea
              id="content"
              rows={20}
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              required
              placeholder="{'<p>Write your blog post content here... HTML is supported.</p>'}"
            />
            <span className="field-hint">
              Supports HTML tags: &lt;p&gt;, &lt;h2&gt;-&lt;h4&gt;, &lt;ul&gt;/&lt;ol&gt;, &lt;a&gt;, &lt;img&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
            </span>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    published: e.target.checked,
                  }))
                }
              />
              <span>Publish immediately</span>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/admin/blog")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa fa-save"></i>{" "}
                  {isEditing ? "Update Post" : "Create Post"}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
