import { useEffect, useRef, useState } from 'react';
import OutputBox from './OutputBox';
import { FaCloudUploadAlt, FaFolderOpen, FaPaperPlane, FaFileAlt, FaTachometerAlt, FaBrain, FaTimes, FaFile } from 'react-icons/fa';
import '../styles/Summary.css';

export default function Summary() {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [textInput, setTextInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);




    useEffect(() => {
        // Load external JS files
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

        // Wait for particles.js to load, then configure
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

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Append files if present
        files.forEach((file, index) => {
            formData.append('files', file);
        });

        // Append text if present
        if (textInput.trim() !== '') {
            formData.append('text', textInput.trim());
        }

        try {
            const response = await fetch('http://your-backend-endpoint/api/summarize', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            console.log('Server response:', result);
        } catch (err) {
            console.error('Error sending data:', err);
        }
    };



    // Drag Drop Section
    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };



    return (
        <div className='summay-page'>
            <div className="container1">
                <div className="main-content">
                    <div className="content-title">
                        <h1>Content <span className="highlight">Summarizer</span></h1>
                        <p className="tagline">Upload your files or enter text to get started</p>
                    </div>

                    <form className="upload-form">
                        <div className="drag-upload-container">
                            <div
                                className={`drag-area ${isDragging ? 'drag-over' : ''}`}
                                onClick={handleBrowseClick}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                            >
                                <div className="upload-content">
                                    <div className="icon"><FaCloudUploadAlt size={40} color="#3fe493" /></div>
                                    <h3>Drag & Drop Files</h3>
                                    <span>OR</span>
                                    <button type="button" className="browse-btn" onClick={handleBrowseClick}>
                                        <FaFolderOpen /> Add Files
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        multiple
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* File list preview */}
                        {files.length > 0 && (
                            <div className="file-list">
                                <h4 className="file-list-title"><FaFile /> Selected Files</h4>
                                {files.map((file, index) => (
                                    <div className="file-item" key={index}>
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                        <button type='button' className="remove-file" onClick={() =>
                                            removeFile(index)
                                        }>
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-input-container">
                            <textarea
                                required
                                placeholder="Enter prompt to modify summary"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                            ></textarea>
                        </div>

                        <button
                            className="submit-btn"
                            disabled={textInput.trim() === '' && files.length === 0}
                            onClick={handleSubmit}
                        >
                            <FaPaperPlane /> Submit Content
                        </button>
                    </form>

                    <div className="features">
                        <div className="feature"><FaFileAlt /><span>Multiple Formats</span></div>
                        <div className="feature"><FaTachometerAlt /><span>Fast Analysis</span></div>
                        <div className="feature"><FaBrain /><span>AI-Powered</span></div>
                    </div>
                </div>
            </div>

            <OutputBox />
        </div>
    );
}
