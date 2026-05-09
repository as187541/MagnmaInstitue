import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getColleges, getCourses } from "../api/client";
import { SERVICES, OFFICE_LOCATIONS } from "@magnma/shared";
import { supabase } from "../lib/supabase";
import ContactForm from "../components/ContactForm";
import SEO from "../components/SEO";
import ScrollReveal from "../components/ScrollReveal";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  created_at: string;
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const collegeFromQuery = searchParams.get("college");
  const contactRef = useRef<HTMLDivElement>(null);

  const [colleges, setColleges] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [activeOffice, setActiveOffice] = useState(OFFICE_LOCATIONS[0]);

  useEffect(() => {
    getColleges({ featured: true, limit: 10 }).then((res) => {
      if (res.success) setColleges(res.data || []);
    });
    getCourses({ featured: true }).then((res) => {
      if (res.success) setCourses(res.data || []);
    });
    fetchBlogPosts();
  }, []);

  // Auto-scroll to contact section when college param is present
  useEffect(() => {
    if (collegeFromQuery && contactRef.current) {
      setTimeout(() => {
        contactRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  }, [collegeFromQuery]);

  async function fetchBlogPosts() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(5);

      clearTimeout(timeoutId);
      if (error) {
        if (error.code === "42P17" || error.message?.includes("recursion")) {
          console.warn("Blog section unavailable - RLS policy needs update");
          return;
        }
        throw error;
      }
      setBlogPosts(data || []);
    } catch (error: any) {
      if (error?.name === "AbortError" || error?.message?.includes("fetch")) {
        console.warn("Blog section unavailable - network issue");
        return;
      }
      console.warn("Blog section temporarily unavailable");
    }
  }

  const filteredColleges = colleges.filter((c) =>
    c.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );
  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <>
      <SEO
        title="Home"
        description="Magnma Institute is your trusted partner in education. We provide expert guidance for college admissions, scholarships, and career coaching across India and abroad."
        canonical="/"
      />
      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-text">
          <ScrollReveal animation="fade-down" delay={0}>
            <p className="intro-text">GUIDING YOUR FUTURE</p>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h1>Your Trusted Partner in Education</h1>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={200}>
            <h3>Do you have a dream? We will share it with you and make it real.</h3>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={300}>
            <div className="hero-btn">
              <a href="#services">
                Explore Services <i className="fa fa-arrow-down"></i>
              </a>
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal animation="scale-in" delay={200} duration={1000}>
          <div className="hero-img">
            <img src="/assets/images/about-banner.png" alt="Education illustration" />
          </div>
        </ScrollReveal>
      </section>

      {/* Services Section */}
      <section id="services" className="light-bg">
        <ScrollReveal animation="fade-up">
          <h1 className="section-heading">Our Services</h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <p className="section-intro">
            Our team of experts provides professional assistance tailored to your educational journey.
          </p>
        </ScrollReveal>
        <div className="service-grid">
          {SERVICES.map((service, index) => (
            <ScrollReveal key={service.id} animation="fade-up" delay={index * 100}>
              <div className="service-box card-hover-lift">
                <img
                  src={`/${service.image}`}
                  alt={service.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/80x80/0a4d68/FFF?text=Service";
                  }}
                />
                <h2>{service.title}</h2>
                <p>{service.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="about-container">
          <ScrollReveal animation="fade-left" className="about-img">
            <img src="/assets/images/about-banner.png" alt="Our mission" />
          </ScrollReveal>
          <div className="about-text">
            <ScrollReveal animation="fade-right">
              <h1 className="section-heading" style={{ textAlign: "left" }}>
                About Us
              </h1>
            </ScrollReveal>
            <ScrollReveal animation="fade-right" delay={100}>
              <p>
                We are contemporary education consulting firm established in 2019 with a specialty
                in delivering educational services. The team consists of knowledgeable educational
                consultants, researchers, academic experts, service providers, and customer service
                staff. We have achieved significant milestones in academic research at various
                universities and have a strong track record of delivering exceptional results.
              </p>
            </ScrollReveal>
            <ScrollReveal animation="fade-right" delay={200}>
              <div className="hero-btn">
                <a href="#contact">Get In Touch</a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Colleges Section */}
      <section id="college" className="colleges-section light-bg">
        <ScrollReveal animation="fade-up">
          <h1 className="section-heading">Our Partner Colleges</h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <p className="section-intro">
            We have affiliations with a wide range of prestigious institutions around the globe.
          </p>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={150}>
          <div className="in-section-search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search for colleges..."
              value={collegeSearch}
              onChange={(e) => setCollegeSearch(e.target.value)}
            />
          </div>
        </ScrollReveal>
        <div className="colleges-container" id="main-colleges-grid">
          {filteredColleges.map((college: any, index: number) => (
            <ScrollReveal key={college.id} animation="scale-in" delay={index * 80}>
              <CollegeCard college={college} />
            </ScrollReveal>
          ))}
        </div>
        {filteredColleges.length === 0 && collegeSearch && (
          <div className="no-results" style={{ display: "block" }}>
            No colleges found matching your search.
          </div>
        )}
        <div className="view-more-container">
          <Link to="/colleges" className="view-more-btn">
            View More Colleges
          </Link>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="courses-section">
        <ScrollReveal animation="fade-up">
          <h1 className="section-heading">Popular Courses</h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <p className="section-intro">
            Explore a variety of courses tailored to your career aspirations.
          </p>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={150}>
          <div className="in-section-search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search for courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
          </div>
        </ScrollReveal>
        <div className="courses-grid" id="main-courses-grid">
          {filteredCourses.slice(0, 8).map((course: any, index: number) => (
            <ScrollReveal key={course.id} animation="fade-up" delay={index * 80}>
              <Link
                to={`/course/${course.id}`}
                className="course-card card-hover-lift"
              >
                <img
                  src={course.image || "https://placehold.co/60x60/F7FAFC/0A4D68?text=📚"}
                  alt={course.name}
                />
                <h3>{course.name.split("(")[0].trim()}</h3>
                <p>{course.description.slice(0, 100)}...</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        {filteredCourses.length === 0 && courseSearch && (
          <div className="no-results" style={{ display: "block" }}>
            No courses found matching your search.
          </div>
        )}
        <div className="view-more-container">
          <Link to="/courses" className="view-more-btn">
            View More Courses
          </Link>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="blog-section light-bg">
        <ScrollReveal animation="fade-up">
          <h1 className="section-heading">Latest Insights</h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <p className="section-intro">
            Stay updated with the latest news, tips, and guides from the world of education.
          </p>
        </ScrollReveal>

        {blogPosts.length > 0 ? (
          <>
            <div className="blog-grid home-blog-grid">
              {blogPosts.map((post, index) => (
                <ScrollReveal key={post.id} animation="fade-up" delay={index * 100}>
                  <article className="blog-card home-blog-card card-hover-lift">
                    <Link to={`/blog/${post.slug}`}>
                      <div className="blog-card-image img-zoom-container">
                        {post.featured_image ? (
                          <img src={post.featured_image} alt={post.title} />
                        ) : (
                          <div className="blog-card-placeholder">
                            <i className="fa fa-newspaper-o"></i>
                          </div>
                        )}
                      </div>
                      <div className="blog-card-content">
                        <h3>{post.title}</h3>
                        <p>{post.excerpt || "Read more..."}</p>
                        <div className="blog-card-meta">
                          <span>
                            <i className="fa fa-calendar"></i>{" "}
                            {new Date(post.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
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
                </ScrollReveal>
              ))}
            </div>
            <ScrollReveal animation="fade-up">
              <div className="view-more-container">
                <Link to="/blog" className="view-more-btn">
                  View All Articles <i className="fa fa-arrow-right"></i>
                </Link>
              </div>
            </ScrollReveal>
          </>
        ) : (
          <ScrollReveal animation="scale-in">
            <div className="blog-coming-soon">
              <i className="fa fa-newspaper-o"></i>
              <p>Exciting articles coming soon! Check back later for updates.</p>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="contact-sec light-bg">
        <ScrollReveal animation="fade-up">
          <h1 className="section-heading">Get In Touch</h1>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <p className="section-intro">
            Have questions? Select an office to see its location, or book a free session below.
          </p>
        </ScrollReveal>
        <div className="contact-grid">
          <ScrollReveal animation="fade-left" className="office-list">
            <h3 className="form-title" style={{ textAlign: "left" }}>
              Our Offices
            </h3>
            <div className="office-grid">
              {OFFICE_LOCATIONS.map((office, index) => (
                <ScrollReveal key={office.id} animation="fade-up" delay={index * 100}>
                  <div
                    className={`office-box ${activeOffice.id === office.id ? "active" : ""}`}
                    onClick={() => setActiveOffice(office)}
                  >
                    <h4>
                      <i className="fa fa-map-marker"></i> {office.city}
                    </h4>
                    <p>
                      <i className="fa fa-home"></i> {office.address}
                    </p>
                    <p>
                      <i className="fa fa-phone"></i> {office.phone}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal animation="fade-right" delay={200}>
            <div className="map-container">
              <iframe
                title="Office Map"
                src={activeOffice.mapSrc}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </ScrollReveal>
        </div>
        <ScrollReveal animation="fade-up" delay={300}>
          <ContactForm collegeName={collegeFromQuery || undefined} />
        </ScrollReveal>
      </section>
    </>
  );
}

function CollegeCard({ college }: { college: any }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const allImages = [college.logoImage, ...(college.images || [])].filter(Boolean);

  const startSlideshow = () => {
    if (allImages.length <= 1) return;
    let idx = 0;
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % allImages.length;
      if (imgRef.current) {
        imgRef.current.src = allImages[idx];
        imgRef.current.classList.add("slideshow-active");
      }
    }, 2000);
  };

  const stopSlideshow = () => {
    clearInterval(intervalRef.current);
    if (imgRef.current) {
      imgRef.current.src = college.logoImage;
      imgRef.current.classList.remove("slideshow-active");
    }
  };

  return (
    <Link
      to={`/college/${college.id}`}
      className="college-item card-hover-lift img-zoom-container"
      onMouseEnter={startSlideshow}
      onMouseLeave={stopSlideshow}
    >
      <img ref={imgRef} src={college.logoImage} alt={`${college.name} Logo`} />
      <div className="college-item-text">
        <h3>{college.name}</h3>
        <p>{college.location?.split(",")[0]}</p>
      </div>
    </Link>
  );
}
