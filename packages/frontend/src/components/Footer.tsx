import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="up-footer">
        <div className="logo">
          <Link to="/">
            <span>Magnma</span>Institute
          </Link>
        </div>
      </div>
      <div className="footer-social-links">
        <a href="https://www.instagram.com/magnma_institute/" target="_blank" rel="noopener noreferrer">
          <i className="fa fa-instagram"></i>
        </a>
        <a href="https://wa.me/7384736917" target="_blank" rel="noopener noreferrer">
          <i className="fa fa-whatsapp"></i>
        </a>
        <a href="https://www.facebook.com/share/18Ar3puxfu/" target="_blank" rel="noopener noreferrer">
          <i className="fa fa-facebook"></i>
        </a>
      </div>
      <hr />
      <div className="foot-links">
        <Link to="/">Home</Link>
        <a href="/#services">Services</a>
        <a href="/#about">About</a>
        <Link to="/colleges">Colleges</Link>
        <Link to="/courses">Courses</Link>
        <a href="/#contact">Contact</a>
      </div>
      <div className="bottom-footer">
        <p>© Copyright 2024 MagnmaInstitute. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
