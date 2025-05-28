import { useEffect, useRef, useState } from 'react';
import '../styles/GenerateNote.css';
import { FaDownload, FaRobot } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { RiCloseLargeLine } from 'react-icons/ri';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { TfiSave } from 'react-icons/tfi';

export default function GenerateNote() {

  const [Loading, isLoading] = useState(false);
  const [showoutput, setshowoutput] = useState(false);
  const [topic, setTopic] = useState('');
  const [FadeIn, setFadeIn] = useState(false);
  const [Maximize, setMaximize] = useState(false);
  const copyContent = useRef(null);

  const [dropdownValues, setDropdownValues] = useState({
    academicLevel: '',
    detailLevel: '',
    format: '',
    includeCode: '',
  });

  useEffect(() => {
    const loadScript = (src) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    };

    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js');
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js');
    loadScript('../static/script/scriptroad.js');

    const particlesInterval = setInterval(() => {
      if (window.particlesJS) {
        clearInterval(particlesInterval);
        window.particlesJS('particles-js', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#4CAF50' },
            shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
            opacity: {
              value: 0.5,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
            },
            size: {
              value: 3,
              random: true,
              anim: { enable: true, speed: 2, size_min: 0.1, sync: false },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#4CAF50',
              opacity: 0.4,
              width: 1,
            },
            move: {
              enable: true,
              speed: 1,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'out',
              bounce: false,
              attract: { enable: false, rotateX: 600, rotateY: 1200 },
            },
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: { enable: true, mode: 'grab' },
              onclick: { enable: true, mode: 'push' },
              resize: true,
            },
            modes: {
              grab: { distance: 140, line_linked: { opacity: 1 } },
              push: { particles_nb: 4 },
            },
          },
          retina_detect: true,
        });
      }
    }, 100);
  }, []);

  const handleDropdownChange = (field, value) => {
    setDropdownValues(prev => ({ ...prev, [field]: value }));
  };




  // Data To Backend
  const handleSubmit = async () => {
    if (topic == "") {
      return;
    }

    const data = {
      topic,
      ...dropdownValues,
    };


    console.log(data);


    setFadeIn(true)
    setshowoutput(true)
    isLoading(true)

    setTimeout(() => {
      isLoading(false)
    }, 3000);


    // try {
    //   const response = await fetch('/api/generate-notes', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    //   });

    //   const result = await response.json();
    // console.log("Server response:", result);

    // Pass result to OutputBox or handle however you want
    // ......

    // } catch (error) {
    //   console.error('Error sending data:', error);
    // }
  };


  const DownloadFile = () => {
    console.log("Download Button Pressed.....")
  }

  const CopyContent = () => {
    navigator.clipboard.writeText(copyContent.current.innerText);
  }

  const MaximizeNotesSize = () => {
    setMaximize(!Maximize);
  }


  return (
    <>
      {
        showoutput && (
          <div className={`note-output ${FadeIn ? "fadein" : ""}`}>
            <div className={`sub-note-output ${Maximize ? "sub-note-output-max" : ""}`}>
              {Loading ? (
                <div className='output-placeholder'>
                  <FaRobot size={40} color="#3fe493" />
                  <p>AI is ready to generate your result...</p>
                  <div className="shimmer-line"></div>
                  <div className="shimmer-line short"></div>
                </div>
              ) : (
                <>
                  <div className='note-toolbar'>
                    <h2>Generated Notes</h2>
                    <div className='notes-btns'>
                      <div className='note-icon' onClick={MaximizeNotesSize} >
                        {Maximize ? <FiMinimize /> : <FiMaximize />}
                      </div>
                      <div className='note-icon' onClick={CopyContent} >
                        <TfiSave />
                      </div>
                      <div className='note-icon' onClick={CopyContent} >
                        <MdContentCopy />
                      </div>
                      <div className='note-icon' onClick={DownloadFile} >
                        <FaDownload />
                      </div>
                      <div className='note-icon' onClick={() => {
                        setshowoutput(false)
                        setMaximize(false)
                      }}
                      >
                        <RiCloseLargeLine />
                      </div>
                    </div>
                  </div>
                  <div className='note-content' ref={copyContent} >
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam corrupti quia accusamus, aspernatur assumenda odit repudiandae ab libero beatae amet obcaecati praese
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }



      <div className='generatenote-page'>

        <div className="card">
          <div className='note-heading'>
            <h1 className="title">✨ Generate Study Notes</h1>
            <p className="subtitle">Create comprehensive study materials tailored to your needs</p>
          </div>

          {/* Topic Input */}
          <div className="form-group">
            <label className="label pink">📌 Topic:</label>
            <textarea
              placeholder="Enter your topic in detail..."
              className="textarea"
              rows="3"
              required
              style={{ resize: "none" }}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Dropdown Grid */}
          <div className="dropdown-grid">
            <Dropdown
              label="🏫 Academic Level:"
              options={["School (1-12)", "College"]}
              onChange={(val) => handleDropdownChange("academicLevel", val)}
            />
            <Dropdown
              label="📘 Notes Detail Level:"
              options={["Concise", "Detailed", "Summary", "Exam-Oriented"]}
              onChange={(val) => handleDropdownChange("detailLevel", val)}
            />
            <Dropdown
              label="🗂 Format:"
              options={["Bullet Points", "Paragraphs", "Mind Map Style", "Q&A Format"]}
              onChange={(val) => handleDropdownChange("format", val)}
            />
            <Dropdown
              label="📚 Code Examples:"
              options={["Yes", "No"]}
              onChange={(val) => handleDropdownChange("includeCode", val)}
            />
          </div>

          {/* Submit Button */}
          <div className="button-container">
            <button
              className="generate-button-note"
              onClick={() => {
                handleSubmit()
              }}>
              ✏️ Generate Notes
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

// Controlled Dropdown component
const Dropdown = ({ label, options, onChange }) => {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    onChange(val);
  };

  return (
    <div className="dropdown-options">
      <div className='dropdown-sub-box'>
        <label className="label green">{label}</label>
        <select className="select" value={selected} onChange={handleChange}>
          {selected === "" && <option value="">-- Select Option --</option>}
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
