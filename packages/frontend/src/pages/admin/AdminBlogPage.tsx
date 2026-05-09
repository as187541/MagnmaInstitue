// ============================================================
// Blog Management Page (Admin)
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import SEO from "../../components/SEO";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setIsLoading(true);
    try {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "published") {
        query = query.eq("published", true);
      } else if (filter === "draft") {
        query = query.eq("published", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function togglePublish(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating post:", error);
      return;
    }

    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !currentStatus } : p))
    );
  }

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <SEO title="Manage Blog" noindex />
      <div className="admin-page">
      <div className="admin-page-header">
        <h1>Blog Posts</h1>
        <Link to="/admin/blog/new" className="btn-primary">
          <i className="fa fa-plus"></i> New Post
        </Link>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => {
                setFilter(f);
                fetchPosts();
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loading">
          <i className="fa fa-spinner fa-spin"></i> Loading posts...
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <br />
                    <span className="slug-text">/{post.slug}</span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        post.published ? "published" : "draft"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => togglePublish(post.id, post.published)}
                      title={post.published ? "Unpublish" : "Publish"}
                    >
                      <i
                        className={`fa ${
                          post.published ? "fa-eye-slash" : "fa-eye"
                        }`}
                      ></i>
                    </button>
                    <Link
                      to={`/admin/blog/edit/${post.id}`}
                      className="btn-icon"
                      title="Edit"
                    >
                      <i className="fa fa-pencil"></i>
                    </Link>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => deletePost(post.id)}
                      title="Delete"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 && (
            <div className="empty-state">
              <i className="fa fa-inbox"></i>
              <p>No blog posts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  </>
  );
}
