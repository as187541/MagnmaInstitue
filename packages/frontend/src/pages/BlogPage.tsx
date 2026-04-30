// ============================================================
// Public Blog Listing Page
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  published: boolean;
  created_at: string;
  author_id: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <h1>Education Insights &amp; News</h1>
        <p>
          Stay updated with the latest in education, college admissions, and
          career guidance.
        </p>
      </section>

      <section className="blog-content">
        <div className="blog-search">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="blog-loading">
            <i className="fa fa-spinner fa-spin"></i> Loading articles...
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="blog-grid">
            {filteredPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <Link to={`/blog/${post.slug}`}>
                  <div className="blog-card-image">
                    {post.featured_image ? (
                      <img src={post.featured_image} alt={post.title} />
                    ) : (
                      <div className="blog-card-placeholder">
                        <i className="fa fa-newspaper-o"></i>
                      </div>
                    )}
                  </div>
                  <div className="blog-card-content">
                    <h2>{post.title}</h2>
                    <p>{post.excerpt || "Read more..."}</p>
                    <div className="blog-card-meta">
                      <span>
                        <i className="fa fa-calendar"></i>{" "}
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="read-more">
                        Read More <i className="fa fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <i className="fa fa-inbox"></i>
            <h3>No articles found</h3>
            <p>
              {searchQuery
                ? "Try a different search term"
                : "Check back soon for new articles!"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
