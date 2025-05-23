import { useEffect, useRef } from 'react';
import '../styles/EvaluateInput.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';

const EvaluateInput = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js';
    script.onload = () => {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#4CAF50' },
          shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
          opacity: {
            value: 0.5,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
          },
          size: {
            value: 3,
            random: true,
            anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#4CAF50',
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 1,
            random: true,
            out_mode: 'out'
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'push' },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: { opacity: 1 }
            },
            push: { particles_nb: 4 }
          }
        },
        retina_detect: true
      });
    };
    document.body.appendChild(script);
  }, []);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    const text = e.target.elements.fname.value;
    console.log('Text submitted:', text);
    navigate('/evaluate');
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File uploaded:', file);
    navigate('/evaluate');
  };

  return (
    <>
      <div id="particles-js"></div>

      {/* <div className='popup -output'>
        <div className='output-text'>
          Text Output
        </div>
      </div> */}

      <div className="main-wrapper">
        <div className="page-wrapper">

          <div className="card-header">
            <div className="header-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>Answer Evaluation</h1>
            <p className="tagline">Enter your answer or upload a file for AI-powered evaluation</p>
          </div>

          <div className="evaluation-card">

              {/* Text Input */}
              <div className="input-section input-section1">
                <h2><i className="fas fa-keyboard"></i> Text Input</h2>
                <form onSubmit={handleTextSubmit} className="input-form">
                  <div className="textarea-container">
                    <textarea
                      name="fname"
                      placeholder="Type or paste your question and answer here..."
                      required
                    />
                  </div>
                  <button type="submit" className="action-button primary-button">
                    <i className="fas fa-paper-plane"></i> Submit Text
                  </button>
                </form>
            </div>

            <div className='seprate'></div>

            {/* File Upload */}
            <div className="input-section input-section2">
              <h2><i className="fas fa-file-upload"></i> File Upload</h2>
              <form className='form-evaluate'>
                <div className="drag-area" id="drop-zone" onClick={handleBrowseClick}>
                  <div className="icon">
                    <FaCloudUploadAlt />
                    </div>
                  <h3>Drag & Drop Files</h3>
                  <span>OR</span>
                  <button type="button" className="browse-btn" onClick={handleBrowseClick}>
                    Browse Files
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  name="file"
                  id="eval_file"
                  hidden
                  onChange={handleFileChange}
                />
                <div className="file-info">
                  Supported formats: PDF, DOCX, TXT, PNG, JPEG
                </div>
                <div className="file-info">
                  Note: For now only support single file at a time.
                </div>
              </form>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default EvaluateInput;
