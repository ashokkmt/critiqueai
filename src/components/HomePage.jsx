import { useEffect, useState } from 'react';
import '../styles/HomePage.css';
import 'aos/dist/aos.css';
import Toolsdata from '../data/tools.json'
import Featuredata from '../data/feature.json'
import aboutdata from '../data/about.json'
import AOS from 'aos';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircleSharp } from "react-icons/io5";
import { FaBolt, FaBook, FaBrain, FaBullseye, FaChartLine, FaFileAlt, FaFileImport, FaGoogle, FaRoad, FaSlack, FaUsers } from 'react-icons/fa';


const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS
    AOS.init({ duration: 500, offset: 100, once: true });

    // Typing Effect
    const words = [
      "AI-Powered Evaluation",
      "Smart Document Analysis",
      "Learning Roadmaps",
      "Instant Feedback"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeDelay = 100;

    const typeEffect = () => {
      const display = document.getElementById('typing-effect-text');
      if (!display) return;

      const currentWord = words[wordIndex];
      if (isDeleting) {
        display.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeDelay = 50;
      } else {
        display.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeDelay = 150;
      }

      const cursor = document.querySelector('.typing-effect-cursor');
      if (cursor) {
        cursor.style.opacity = '1';
        setTimeout(() => {
          cursor.style.opacity = '0';
        }, typeDelay / 2);
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeDelay = 2000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeDelay = 500;
      }

      setTimeout(typeEffect, typeDelay);
    };

    typeEffect();


    // Load particles.js
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/particles.js';
    script.async = true;
    script.onload = () => {
      // Delay execution to ensure #particles-js is in the DOM
      requestAnimationFrame(() => {
        if (window.particlesJS && document.getElementById('particles-js')) {
          window.particlesJS('particles-js', {
            particles: {
              number: { value: 50, density: { enable: true, value_area: 800 } },
              color: { value: "#3fe493" },
              shape: { type: "circle" },
              opacity: { value: 0.5, random: true },
              size: { value: 3, random: true },
              line_linked: {
                enable: true,
                distance: 150,
                color: "#3fe493",
                opacity: 0.2,
                width: 1,
              },
              move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
              },
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: { enable: true, mode: "grab" },
                resize: true,
              },
            },
            retina_detect: true,
          });
        }
      });
    };

    document.body.appendChild(script);

  }, []);

  function scrollToLastAbout(e) {
    e.preventDefault();
    const aboutSections = document.querySelectorAll('.main-about-section');
    const lastAbout = aboutSections[aboutSections.length - 1];
    if (lastAbout) {
      lastAbout.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const iconMap = {
    IoCheckmarkCircleSharp: IoCheckmarkCircleSharp,
    FaRoad: FaRoad,
    FaFileAlt: FaFileAlt,
    FaBook: FaBook,
    FaBrain: FaBrain,
    FaBolt: FaBolt,
    FaChartLine: FaChartLine,
    FaFileImport: FaFileImport,
    FaBullseye: FaBullseye,
    FaUsers: FaUsers,
    FaGoogle: FaGoogle
  };


  return (
    <>
      <div id="particles-js"></div>
      <div className="page">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1 className="gradient-text">Elevate Your Learning</h1>
              <div className="dynamic-text">
                <span>With </span>
                <span id="typing-effect-text" className="typing-effect-text"></span>
                <span className="typing-effect-cursor">|</span>
              </div>
              <p className="hero-subtitle">
                Experience AI-powered answer evaluation, smart document summarization, and personalized learning roadmaps
              </p>
              <div className="hero-buttons">
                <a onClick={scrollToLastAbout} href="#about" className="primary-btn">Learn More</a>
              </div>
            </div>
            <div className="hero-illustration">
              <img src="/images/feature-illustration-3-blue.svg" alt="Hero Illustration" className="hero-svg" />
            </div>
            <div className="hero-shapes">
              <div className="floating-shape"></div>
              <div className="floating-shape"></div>
              <div className="floating-shape"></div>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className='main-tools-section'>
          <div className='sub-tools'>
            <h2>Our Tools</h2>
            <div className='tools-cards'>

              {

                Toolsdata.map((tool) => {
                  const Icon = iconMap[tool.icon];
                  return (
                    <div className='tool-card'>
                      {Icon && <Icon size={18} style={{ marginBottom: '8px' }} />}
                      <h3>{tool.heading}</h3>
                      <p>{tool.Des}</p>
                      <button className='newBtn' onClick={() => navigate(tool.path)} >Try Now</button>
                    </div>
                  )
                })
              }

            </div>
          </div>
        </div>


        {/* Features */}
        <div className='main-feature-section'>
          <div className='sub-feature'>
            <h2>Why Choose CritiqueAI?</h2>
            <div className='features-cards'>
              {
                Featuredata.map((item) => {
                  const Icon = iconMap[item.icon];

                  return (
                    <div className='feature-card'>
                      {Icon && <Icon size={40} style={{ marginBottom: "16px", color: "rgb(63, 228, 147)" }} />}
                      <h3>{item.heading}</h3>
                      <p>{item.Des}</p>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>



        {/* About Section */}
        <div className='main-about-section'>
          <div className='sub-about'>
            <div className='sub-about-title'>
              <h2>About CritiqueAI</h2>
              <p>CritiqueAI is an innovative project developed for the Google Solution Challenge 2025. Our AI-powered learning companion is designed to revolutionize education through advanced technology, leveraging multiple Google technologies to create an impactful solution. Our platform combines answer evaluation, roadmap generation, and document summarization to create a comprehensive learning experience that addresses real-world educational challenges.</p>
            </div>
            <div className='about-cards'>
              {

                aboutdata.map((item) => {

                  const Icon = iconMap[item.icon];
                  return (
                    <>
                      <div className='about-card'>
                        {Icon && <Icon size={18} />}
                        <h3>{item.heading}</h3>
                        <p>{item.Des}</p>
                      </div>
                    </>
                  )
                })
              }
            </div>
          </div>
        </div>



      </div>

    </>
  );
};

export default HomePage;
