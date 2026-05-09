import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCollege } from "../api/client";
import ContactForm from "../components/ContactForm";
import SEO from "../components/SEO";

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getCollege(id).then((res) => {
      if (res.success) {
        setCollege(res.data);
        document.title = `${res.data.name} - Magnma Institute`;
      }
      setLoading(false);
    });
  }, [id]);

  const allImages = (college?.images || []).filter(Boolean);
  const slideshowImages = allImages.length > 0 ? allImages : [college?.logoImage].filter(Boolean);

  // Auto slideshow
  useEffect(() => {
    if (!slideshowImages.length) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  if (loading) {
    return (
      <>
        <SEO title="Loading College..." />
        <main>
          <section style={{ textAlign: "center", padding: 100 }}>
            <p>Loading college details...</p>
          </section>
        </main>
      </>
    );
  }

  if (!college) {
    return (
      <>
        <SEO title="College Not Found" noindex />
        <main>
        <section style={{ textAlign: "center", padding: 100 }}>
          <h1>College Not Found</h1>
          <p>The college you are looking for does not exist.</p>
        </section>
      </main>
    </>
  );
}

  return (
    <>
      <SEO
        title={college.name}
        description={college.description?.substring(0, 160)}
        keywords={`${college.name}, ${college.location}, ${college.courses?.join(", ")}, medical college, admission`}
        ogImage={college.logoImage}
        ogType="article"
        canonical={`/college/${college.id}`}
      />
      <main>
      {/* Hero Slideshow */}
      <section className="college-hero-slideshow">
        <div className="slideshow-container">
          {slideshowImages.length > 0 && (
            <img
              src={slideshowImages[currentImage % slideshowImages.length]}
              alt={college.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </div>
        <div className="hero-text-overlay">
          <h1 id="college-name">{college.name}</h1>
          <p id="college-location-hero">{college.location}</p>
        </div>
        <button
          className="view-gallery-btn"
          onClick={() => setShowModal(true)}
        >
          <i className="fa fa-th-large"></i> View Gallery
        </button>
      </section>

      {/* Details Section */}
      <section className="college-details-section">
        <div className="details-grid">
          <div className="main-content">
            <h2>About The College</h2>
            <p className="college-description">{college.description}</p>

            <h2>Courses Offered</h2>
            <ul className="styled-list">
              {college.courses?.map((course: string, i: number) => (
                <li key={i}>{course}</li>
              ))}
            </ul>

            <h2>Admission Process</h2>
            <ul className="styled-list">
              {college.admissionProcess?.map((step: string, i: number) => (
                <li key={i}>{step}</li>
              ))}
            </ul>

            <h2>Documents Required for Admission</h2>
            <ul className="styled-list">
              {college.documentsRequired?.map((doc: string, i: number) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>
          </div>

          <aside className="college-sidebar">
            <h3>College at a Glance</h3>
            <div className="fact-item">
              <i className="fa fa-university"></i>
              <div>
                <strong>Affiliated To</strong>
                <span>{college.affiliatedTo}</span>
              </div>
            </div>
            <div className="fact-item">
              <i className="fa fa-check-circle"></i>
              <div>
                <strong>Approved By</strong>
                <span>{college.approvedBy?.join(", ")}</span>
              </div>
            </div>
            <div className="fact-item">
              <i className="fa fa-map-marker"></i>
              <div>
                <strong>Location</strong>
                <span>{college.location}</span>
              </div>
            </div>
            <button
              className="cta-button"
              onClick={() => {
                setShowForm(true);
                setTimeout(() => {
                  document.getElementById("booking-form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
            >
              Apply Now
            </button>
          </aside>
        </div>
      </section>

      {/* Contact Form */}
      {showForm && (
        <section id="booking-form-section" className="form-section-container">
          <ContactForm collegeName={college.name} />
        </section>
      )}

      {/* Image Modal */}
      {showModal && (
        <div className="image-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grid">
              {allImages.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt={`${college.name} ${i + 1}`}
                  onClick={() => setEnlargedImage(img)}
                />
              ))}
            </div>
          </div>
          {enlargedImage && (
            <div className="enlarged-view" onClick={() => setEnlargedImage(null)}>
              <img src={enlargedImage} alt="Enlarged" />
            </div>
          )}
          <span className="modal-close-btn" onClick={() => setShowModal(false)}>
            ×
          </span>
        </div>
      )}
    </main>
  </>
  );
}
