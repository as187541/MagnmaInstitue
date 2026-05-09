// ============================================================
// Admin Dashboard Overview Page
// ============================================================

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";
import SEO from "../../components/SEO";

interface DashboardStats {
  totalColleges: number;
  totalCourses: number;
  totalInquiries: number;
  totalBlogPosts: number;
  recentInquiries: any[];
  recentBlogPosts: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalColleges: 0,
    totalCourses: 0,
    totalInquiries: 0,
    totalBlogPosts: 0,
    recentInquiries: [],
    recentBlogPosts: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      // Fetch counts in parallel
      const [
        { count: collegesCount },
        { count: coursesCount },
        { count: inquiriesCount },
        { count: blogPostsCount },
        { data: recentInquiries },
        { data: recentBlogPosts },
      ] = await Promise.all([
        supabase.from("colleges").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase
          .from("contact_submissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalColleges: collegesCount || 0,
        totalCourses: coursesCount || 0,
        totalInquiries: inquiriesCount || 0,
        totalBlogPosts: blogPostsCount || 0,
        recentInquiries: recentInquiries || [],
        recentBlogPosts: recentBlogPosts || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-loading">
        <i className="fa fa-spinner fa-spin"></i> Loading dashboard...
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin Dashboard" noindex />
      <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Dashboard</h1>
        <div className="admin-dashboard-actions">
          <Link to="/admin/colleges" className="btn-primary">
            <i className="fa fa-plus"></i> Add College
          </Link>
          <Link to="/admin/courses" className="btn-primary">
            <i className="fa fa-plus"></i> Add Course
          </Link>
          <Link to="/admin/blog/new" className="btn-primary">
            <i className="fa fa-plus"></i> Add Blog
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Link to="/admin/colleges" className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-university"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalColleges}</span>
            <span className="stat-label">Colleges</span>
          </div>
        </Link>

        <Link to="/admin/inquiries" className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-envelope"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalInquiries}</span>
            <span className="stat-label">Inquiries</span>
          </div>
        </Link>

        <Link to="/admin/blog" className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-newspaper-o"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalBlogPosts}</span>
            <span className="stat-label">Blog Posts</span>
          </div>
        </Link>

        <Link to="/admin/courses" className="stat-card">
          <div className="stat-icon">
            <i className="fa fa-graduation-cap"></i>
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalCourses}</span>
            <span className="stat-label">Courses</span>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>Recent Inquiries</h2>
          {stats.recentInquiries.length > 0 ? (
            <div className="recent-list">
              {stats.recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="recent-item">
                  <div className="recent-item-info">
                    <strong>{inquiry.name}</strong>
                    <span>{inquiry.email}</span>
                  </div>
                  <span className="recent-item-date">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No inquiries yet</p>
          )}
          <Link to="/admin/inquiries" className="view-all-link">
            View all inquiries →
          </Link>
        </div>

        <div className="dashboard-section">
          <h2>Recent Blog Posts</h2>
          {stats.recentBlogPosts.length > 0 ? (
            <div className="recent-list">
              {stats.recentBlogPosts.map((post) => (
                <div key={post.id} className="recent-item">
                  <div className="recent-item-info">
                    <strong>{post.title}</strong>
                    <span className={`status-badge ${post.published ? "published" : "draft"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <span className="recent-item-date">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No blog posts yet</p>
          )}
          <Link to="/admin/blog" className="view-all-link">
            View all posts →
          </Link>
        </div>
      </div>
    </div>
  </>
  );
}
