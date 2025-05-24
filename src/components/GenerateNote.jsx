import { useEffect, useState } from 'react';
import '../styles/GenerateNote.css';
import OutputBox from './OutputBox.jsx';

export default function GenerateNote() {
  const [isSendable, setisSendable] = useState(false)
  const [topic, setTopic] = useState('');
  const [dropdownValues, setDropdownValues] = useState({
    academicLevel: '',
    detailLevel: '',
    format: '',
    includeCode: '',
    urgency: '',
    examFocused: '',
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

    try {
      const response = await fetch('/api/generate-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Server response:", result);

      // Pass result to OutputBox or handle however you want
      // ......

    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <div className='generatenote-page'>
      <div className="note-section">
        <div className="card">
          <h1 className="title">✨ Generate Study Notes</h1>
          <p className="subtitle">Create comprehensive study materials tailored to your needs</p>

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
              label="📚 Include Code Examples:"
              options={["Yes", "No"]}
              onChange={(val) => handleDropdownChange("includeCode", val)}
            />
            <Dropdown
              label="⏳ Urgency Level:"
              options={["Quick Summary", "Full Explanation"]}
              onChange={(val) => handleDropdownChange("urgency", val)}
            />
            <Dropdown
              label="🎯 Exam-Focused:"
              options={["Yes", "No"]}
              onChange={(val) => handleDropdownChange("examFocused", val)}
            />
          </div>

          {/* Submit Button */}
          <div className="button-container">
            <button className="generate-button" onClick={handleSubmit}>
              ✏️ Generate Notes
            </button>
          </div>
        </div>
      </div>

      <OutputBox />
    </div>
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
    <div className="form-group">
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
  );
};
