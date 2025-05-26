import { useEffect, useRef, useState } from 'react';
import '../styles/RoadMap.css'
import { FaDownload, FaMapSigns, FaRobot } from 'react-icons/fa';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { MdContentCopy } from 'react-icons/md';
import { RiCloseLargeLine } from 'react-icons/ri';

export default function RoadMap() {

    const [topic, setTopic] = useState('');
    const [Loading, setLoading] = useState(false);
    const [showoutput, setshowoutput] = useState(false);
    const [FadeIn, setFadeIn] = useState(false);
    const [Maximize, setMaximize] = useState(false);
    const copyContent = useRef(null)

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



    const handleSubmit = (e) => {
        e.preventDefault();
        if (!topic.trim()) return;


        setFadeIn(true)
        setshowoutput(true)
        setLoading(true)

        const SummRes = topic.trim();
        console.log('Generating roadmap for:', SummRes);
        // Add logic for roadmap generation here


        setTimeout(() => {
            setLoading(false)
        }, 3000);


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



            <div className='Roadmap-page'>

                <div className="roadmap-outer">

                    <div className="roadmap-heading">
                        <h2> <FaMapSigns color='#3fe493' /> Skill RoadMap Generator</h2>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, nihil!</p>
                    </div>


                    <div className='second-Roadmapbox'>
                        <div className='roadmap-input-box'>
                            <div className='roadmap-box'>
                                <h3>What would you like to learn?</h3>
                                <textarea
                                    required
                                    placeholder='e.g. Python, Web Development, Machine Learning'
                                    className='roadmap-textarea'
                                    onChange={(e) => { setTopic(e.target.value) }}
                                    value={topic}
                                ></textarea>
                                <button
                                    onClick={handleSubmit}

                                > <FaMapSigns /> Generate Roadmap</button>

                            </div>
                            <div class="roadmap-input-tip">
                                <h3>How it works?</h3>
                                <ul>
                                    <li><strong>Enter Skills</strong> — Type what you want to learn (e.g. Python, Web Development).</li>
                                    <li><strong>Click Generate</strong> — Hit the <strong>Generate Roadmap</strong> button.</li>
                                    <li><strong>AI Builds Roadmap</strong> — The AI creates a personalized learning path.</li>
                                    <li><strong>Start Learning</strong> — Follow the roadmap and track your progress.</li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

            </div>



        </>
    )
}
