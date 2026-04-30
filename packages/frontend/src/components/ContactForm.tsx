import { useState } from "react";
import { submitContactForm } from "../api/client";

export default function ContactForm({ collegeName }: { collegeName?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    date: "",
    time: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await submitContactForm({
        ...formData,
        collegeApplyingFor: collegeName || "",
      });
      if (res.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", number: "", date: "", time: "", message: "" });
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="form-container" style={{ maxWidth: 800, margin: "0 auto" }}>
        <div className="form" style={{ textAlign: "center", padding: "40px" }}>
          <h3 className="form-title">Thank You!</h3>
          <p>We'll get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="form">
        <h3 className="form-title">Book a Free Counselling Session</h3>
        {collegeName && (
          <p style={{ marginBottom: 20, color: "var(--primary-accent)", fontWeight: 600 }}>
            Applying for: {collegeName}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />

          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />

          <label htmlFor="number">Mobile Number</label>
          <input type="tel" id="number" name="number" required value={formData.number} onChange={handleChange} />

          <label htmlFor="date">Select a Date</label>
          <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} />

          <label htmlFor="time">Select a Time Slot</label>
          <select id="time" name="time" required value={formData.time} onChange={handleChange}>
            <option value="">-- Choose a time --</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="12:00 PM">12:00 PM</option>
            <option value="2:00 PM">2:00 PM</option>
            <option value="4:00 PM">4:00 PM</option>
            <option value="6:00 PM">6:00 PM</option>
          </select>

          <label htmlFor="message">Your Message (Optional)</label>
          <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleChange} />

          {error && <p style={{ color: "red", marginBottom: 15 }}>{error}</p>}

          <button type="submit" className="form-submit-btn">
            Send Message <i className="fa fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
