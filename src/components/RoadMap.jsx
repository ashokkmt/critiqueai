import { useEffect, useState } from 'react';
import '../styles/RoadMap.css'
import { FaRoute, FaMapSigns } from 'react-icons/fa';
import OutputBox from './OutputBox';

export default function RoadMap() {

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


    const [topic, setTopic] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!topic.trim()) return;
        console.log('Generating roadmap for:', topic);
        // Add logic for roadmap generation here
    };


    return (
        <>
            <div className='Roadmap-page'>
                <div className="roadmap-outer">
                    <div className="roadmap-box">
                        <div className="roadmap-glow"></div>

                        <div className="roadmap-header">
                            <h1 className="roadmap-title">
                                <FaMapSigns className="icon" /> Skill Roadmap Generator
                            </h1>
                            <p className="roadmap-tagline">Chart your learning journey with a personalized roadmap</p>
                        </div>

                        <form onSubmit={handleSubmit} className="roadmap-form">
                            <label htmlFor="topic" className="roadmap-label">
                                What would you like to learn?
                            </label>
                            <textarea
                                id="topic"
                                className="roadmap-textarea"
                                placeholder="e.g., Python, Web Development, Machine Learning"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            ></textarea>

                            <button type="submit" className="roadmap-button">
                                <FaRoute className="icon" /> Generate Roadmap
                            </button>
                        </form>
                    </div>
                </div>


              <OutputBox/>

            </div>



        </>
    )
}
