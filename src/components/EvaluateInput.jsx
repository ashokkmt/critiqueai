import { useEffect, useRef, useState } from 'react';
import '../styles/EvaluateInput.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';
import { FaClipboardCheck, FaCloudUploadAlt, FaCopy, FaRedo, FaRobot, FaStar } from 'react-icons/fa';

const EvaluateInput = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [showres, setshowres] = useState(false);
  const [loading, isloading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const output = useRef(null);
  const evaluation = useRef(null)




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
    navigate('/input');
    setshowres(true);
    setTimeout(() => {
      isloading(false);
    }, 3000);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File uploaded:', file);
    navigate('/input');
    setshowres(true);
    setTimeout(() => {
      isloading(false);
    }, 3000);
  };


  const copyEvaluation = (e) => {
    if (evaluation.current) {
      navigator.clipboard.writeText(evaluation.current.innerText)
    }
  }


  useEffect(() => {
    if (showres) {
      setTimeout(() => setFadeIn(true), 100);
    } else {
      setFadeIn(false);
    }
  }, [showres]);



  return (
    <>
      <div id="particles-js"></div>

      {
        showres && <div className={`popup-output ${fadeIn ? 'show-fadein' : ''}`}>
          <div className='output-text'>

            {
              loading ? <div className='output-placeholder' >
                <FaRobot size={40} color="#3fe493" />
                <p>AI is ready to generate your result...</p>
                <div className="shimmer-line"></div>
                <div className="shimmer-line short"></div>
              </div>

                :

                <>
                  <div className='res-heading'>
                    <h2> <FaStar style={{ color: "#3fe493" }} /> Evaluation Results</h2>
                    <div className='marks-circle'>
                      <span className='mark'>-/</span>
                      <span className='score-head'>Score</span>
                    </div>
                  </div>

                  <div className='result-text'>
                    <h3><FaClipboardCheck />  Detailed Feedback</h3>
                    <p
                      ref={evaluation}
                    >
                      Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti ex atque ea tempora quae illum aliquid quo consequuntur perspiciatis sint.
                      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officiis possimus excepturi tenetur quo suscipit et cum odio minus est accusantium iste exercitationem recusandae illum maiores animi culpa ex saepe voluptate vitae, repellat amet quasi officia fugit. Porro distinctio perspiciatis debitis similique minima voluptatum atque aperiam velit reprehenderit placeat! Adipisci, eos.
                    </p>
                  </div>

                  <div className='res-buttons'>
                    <button
                      onClick={() => { setshowres(false); isloading(true) }}
                      className='res-btn'
                    >
                      <FaRedo />
                      New Evaluation
                    </button>
                    <button
                      className='res-btn'
                      onClick={copyEvaluation}
                    > <FaCopy /> Copy Feedback</button>
                  </div>
                </>
            }

          </div>

        </div>
      }

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
                  <button type="button" className="browse-btn" >
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
