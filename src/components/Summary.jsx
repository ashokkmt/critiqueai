import { useEffect, useRef, useState } from 'react';
import { FaCloudUploadAlt, FaFolderOpen, FaPaperPlane, FaFileAlt, FaTachometerAlt, FaBrain, FaTimes, FaFile, FaRobot, FaDownload } from 'react-icons/fa';
import '../styles/Summary.css';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { MdContentCopy } from 'react-icons/md';
import { RiCloseLargeLine } from 'react-icons/ri';
import { TfiSave } from 'react-icons/tfi';
import axios from 'axios';
import { auth } from './firebase/firebase';
import { Slide, toast, ToastContainer } from 'react-toastify';
import html2pdf from "html2pdf.js";

export default function Summary() {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [textInput, setTextInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [Loading, setLoading] = useState(false);
    const [showoutput, setshowoutput] = useState(false);
    const [FadeIn, setFadeIn] = useState(false);
    const [Maximize, setMaximize] = useState(false);
    const [SummaryOut, setSummaryOut] = useState("");
    const Summarydata = useRef(null)
    const [hide, sethide] = useState(true);

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

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = ''; // reset to allow re-upload of same files
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        if (textInput.trim()) formData.append('text', textInput.trim());

        // Temporary hardcoded guest ID
        formData.append('guestId', 'abc123');


        setFadeIn(true)
        setshowoutput(true)
        setLoading(true)


        console.log(files)
        console.log(textInput)

        try {
            const res = await axios.post('http://127.0.0.1:5000/summary-out', formData);
            console.log('Server response:', res);



            setSummaryOut(res.data.output);
            setLoading(false);
        } catch (err) {
            console.error('Error sending data:', err.message);
        }

    };


    useEffect(() => {
        if (Summarydata.current) {
            Summarydata.current.innerHTML = SummaryOut;
        }
    }, [SummaryOut])


    // Drag-and-drop handlers
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



    const DownloadFile = () => {
        console.log("Download Button Pressed.....")

        const element = Summarydata.current;
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

        clone.querySelectorAll("ul").forEach((ul) => {
            ul.style.paddingLeft = "20px";
            ul.style.marginTop = "10px";
            ul.style.marginBottom = "10px";
        });

        clone.querySelectorAll("li").forEach((li) => {
            li.style.marginBottom = "5px";
            li.style.paddingLeft = "10px";
            li.style.listStyleType = "disc";
            li.style.color = "black";
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
        navigator.clipboard.writeText(Summarydata.current.innerText);
        sethide(false)
        setTimeout(() => {
            sethide(true)
        }, 1200);
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
                        heading: "Summary",
                        content: SummaryOut,
                        type: "Summary"
                    })
                    console.log(res)


                    toast.success("Saved Successfully", {
                        position: "top-center",
                        autoClose: 2000,
                        transition: Slide,
                    });

                    // setshowoutput(false)


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
                                            <div className='note-icon sum-copy' onClick={CopyContent} >
                                                <div className={`show ${hide ? "" : "unhide"}`}>copied</div>
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
                                    <div className='note-content' ref={Summarydata} >

                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            <div className='summay-page'>
                <div className="summary-page-subbox">
                    <div className="content-title">
                        <h2><FaFileAlt color='#3fe493' /> Content Summarizer</h2>
                        <p className="tagline">Upload your files or enter text to get started</p>
                    </div>

                    <div className="summary-main-content">
                        <form className="upload-form summay-upload-form">

                            <div className="drag-upload-container">
                                <div
                                    className={`drag-area ${isDragging ? 'drag-over' : ''}`}
                                    onClick={handleBrowseClick}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                >
                                    {files.length === 0 ? (
                                        <div className="upload-content">
                                            <div className="icon" ><FaCloudUploadAlt size={40} color="#3fe493" /></div>
                                            <h3>Drag & Drop Files</h3>
                                            <span>OR</span>
                                            <button type="button" className="browse-btn">
                                                <FaFolderOpen /> Add Files
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="file-preview-list scrollable-list">
                                            {files.map((file, index) => (
                                                <div className="file-preview" key={index}>
                                                    <div className='file-show'>
                                                        <FaFile className="file-icon" />
                                                        <span className="file-name">{file.name}</span>
                                                    </div>
                                                    <FaTimes
                                                        className="remove-file"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFiles(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Always render the input so file browser can open anytime */}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        multiple
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className='second-summary-box'>
                                <div className="text-input-container">
                                    <textarea
                                        className='summary-textarea'
                                        required
                                        placeholder="Enter prompt to modify summary"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="submit-btn"
                                    disabled={textInput.trim() === '' && files.length === 0}
                                    onClick={handleSubmit}
                                >
                                    <FaPaperPlane /> Submit Content
                                </button>

                                <div className="features">
                                    <div className="feature"><FaFileAlt /><span>Multiple Formats</span></div>
                                    <div className="feature"><FaTachometerAlt /><span>Fast Analysis</span></div>
                                    <div className="feature"><FaBrain /><span>AI-Powered</span></div>
                                </div>
                            </div>
                        </form>
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
