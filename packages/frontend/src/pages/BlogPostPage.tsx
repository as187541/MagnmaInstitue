// ============================================================
// Public Blog Single Post Page
// ============================================================

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) fetchPost(slug);
  }, [slug]);

  async function fetchPost(postSlug: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", postSlug)
        .eq("published", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Blog post not found");
        } else {
          throw error;
        }
      } else {
        setPost(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="blog-loading">
        <i className="fa fa-spinner fa-spin"></i> Loading article...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-error">
        <i className="fa fa-exclamation-circle"></i>
        <h2>{error || "Post not found"}</h2>
        <Link to="/blog" className="btn-primary">
          <i className="fa fa-arrow-left"></i> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="blog-post-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <i className="fa fa-chevron-right"></i>
        <Link to="/blog">Blog</Link>
        <i className="fa fa-chevron-right"></i>
        <span>{post.title}</span>
      </nav>

      {/* Hero */}
      <header className="blog-post-header">
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="blog-post-featured-image"
          />
        )}
        <div className="blog-post-header-content">
          <h1>{post.title}</h1>
          {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}
          <div className="blog-post-meta">
            <span>
              <i className="fa fa-calendar"></i>{" "}
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {post.updated_at !== post.created_at && (
              <span>
                <i className="fa fa-refresh"></i>{" "}
                Updated{" "}
                {new Date(post.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="blog-post-body"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Share */}
      <div className="blog-post-share">
        <h3>Share this article</h3>
        <div className="share-buttons">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn facebook"
          >
            <i className="fa fa-facebook"></i>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              post.title
            )}&url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn twitter"
          >
            <i className="fa fa-twitter"></i>
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              post.title + " " + window.location.href
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn whatsapp"
          >
            <i className="fa fa-whatsapp"></i>
          </a>
          <button
            className="share-btn copy"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }}
          >
            <i className="fa fa-link"></i>
          </button>
        </div>
      </div>

      {/* Back to blog */}
      <div className="blog-post-footer">
        <Link to="/blog" className="btn-secondary">
          <i className="fa fa-arrow-left"></i> All Articles
        </Link>
      </div>
    </article>
  );
}
