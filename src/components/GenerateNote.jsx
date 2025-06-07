import { useEffect, useRef, useState } from 'react';
import '../styles/GenerateNote.css';
import { FaDownload, FaRobot } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { RiCloseLargeLine } from 'react-icons/ri';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { TfiSave } from 'react-icons/tfi';
import axios from 'axios';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { auth } from './firebase/firebase';
import html2pdf from "html2pdf.js";


export default function GenerateNote() {

  const [Loading, isLoading] = useState(false);
  const [showoutput, setshowoutput] = useState(false);
  const [topic, setTopic] = useState('');
  const [FadeIn, setFadeIn] = useState(false);
  const [Maximize, setMaximize] = useState(false);
  const [Notes_Out, setNotes_Out] = useState("");
  const ShowOut = useRef(null);


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

  const handleSubmit = async () => {
    if (topic === "") {
      return;
    }

    const data = {
      topic,
      ...dropdownValues,
    };

    console.log(data);

    setFadeIn(true);
    setshowoutput(true);
    isLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/content-out', data);
      console.log("Server response:", res);

      // Output yha se Krenge...
      // console.log(res.data.output)
      setNotes_Out(res.data.output)
      isLoading(false);

    } catch (error) {
      console.error('Error sending data:', error.message);
    }
  };


  useEffect(() => {
    if (ShowOut.current) {
      ShowOut.current.innerHTML = Notes_Out;
    }
  }, [Notes_Out])


  const DownloadFile = () => {
    console.log("Download Button Pressed.....")

    const element = ShowOut.current;
    if (!element) return;

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const filename = `critiqueai_output_${randomNum}.pdf`;
    // Clone the node to apply export-specific styles
    const clone = element.cloneNode(true);

    // Clean PDF styles
    clone.style.backgroundColor = "white";
    clone.style.color = "black";
    clone.style.padding = "20px";
    clone.style.fontFamily = "Arial, sans-serif";
    clone.style.fontSize = "14px";
    clone.style.width = "100%";

    // Fix overflow and page breaks
    clone.style.overflow = "visible";
    clone.style.pageBreakInside = "auto";

    // Optional: set minHeight to ensure spacing is not squashed
    clone.style.minHeight = "100vh";

    clone.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
      el.style.color = "black";
      el.style.marginBottom = "10px";
    });


    // Page break styles for child elements
    clone.querySelectorAll("p, div, li, strong").forEach((el) => {
      el.style.pageBreakInside = "avoid";
      el.style.breakInside = "avoid";
      el.style.color = "black";
      el.style.lineHeight = "1.6";
    });

    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait"
      }
    };

    html2pdf().set(opt).from(clone).save();
  };


  const CopyContent = () => {
    navigator.clipboard.writeText(ShowOut.current.innerText);
  }

  const MaximizeNotesSize = () => {
    setMaximize(!Maximize);
  }



  const SendDataBackend = () => {
    console.log("Sending Data Backend....")

    auth.onAuthStateChanged(async (user) => {

      if (user) {
        console.log(user);
        const formatted = new Date(Date.now()).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        try {
          const res = await axios.post("http://127.0.0.1:5000/set-output", {
            uid: user.uid,
            time: formatted,
            heading: topic,
            content: Notes_Out,
            type: "Generated Notes"
          })
          console.log(res)

          toast.success("Saved Successfully", {
            position: "top-center",
            autoClose: 2000,
            transition: Slide,
          });

          // setshowoutput(false);

        } catch (error) {
          console.log(error.message)
        }
      }
      else {
        return;
      }
    })
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
                      <div onClick={SendDataBackend} className='note-icon' >
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
                  <div className='note-content' ref={ShowOut} >

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


      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        style={{ zIndex: 10000 }}
      />

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
