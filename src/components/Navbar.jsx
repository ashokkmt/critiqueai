import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/Navbar.css';

const Navbar = () => {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      offset: 100,
      once: true,
    });

    // Load particles.js
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS.load('particles-js', '/particles-config.json', function () {
          console.log('particles.js config loaded');
        });
      }
    };
    document.body.appendChild(script);

    // Load custom script.js if needed
    const customScript = document.createElement('script');
    customScript.src = '/script.js';
    customScript.async = true;
    document.body.appendChild(customScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(customScript);
    };
  }, []);


  function scrollToLastAbout(e) {
    e.preventDefault();
    const aboutSections = document.querySelectorAll('.main-about-section');
    const lastAbout = aboutSections[aboutSections.length - 1];
    if (lastAbout) {
      lastAbout.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <>
      <div id="particles-js"></div>

      <div className='navbar-main'>
        <div className="navbar">
          <div className="title-links" data-aos="fade-right">
            <Link className="title" to="/">
              <img src="/images/logo-svg.svg" alt="CritiqueAI Logo" className="title-img" />
              <span className="title-text">CritiqueAI</span>
            </Link>
          </div>

          <div className="link-area" data-aos="fade-left">
            <Link to="/" className="nav-link">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>

            <div className="nav-dropdown">
              <button className="nav-dropdown-btn">
                <i className="fas fa-tools"></i>
                <span>Tools</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              <div className="nav-dropdown-content">
                <Link to="/input" className="dropdown-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Answer Evaluation</span>
                </Link>
                <Link to="/roadmap" className="dropdown-item">
                  <i className="fas fa-road"></i>
                  <span>Learning Roadmap</span>
                </Link>
                <Link to="/summary" className="dropdown-item">
                  <i className="fas fa-file-alt"></i>
                  <span>Document Summary</span>
                </Link>
                <Link to="/notes" className="dropdown-item">
                  <i className="fas fa-book"></i>
                  <span>Generate Notes</span>
                </Link>
              </div>
            </div>

            <a href="/#about" onClick={scrollToLastAbout} className="nav-link">
              <i className="fas fa-info-circle"></i>
              <span>About</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
