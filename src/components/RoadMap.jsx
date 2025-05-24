import { useEffect, useState } from 'react';
import '../styles/RoadMap.css'
import { FaMapSigns } from 'react-icons/fa';
import OutputBox from './OutputBox';

export default function RoadMap() {


    const [Loading, isLoading] = useState(false)
    const [topic, setTopic] = useState('');

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


        isLoading(true)

        const SummRes = topic.trim();
        console.log('Generating roadmap for:', SummRes);
        // Add logic for roadmap generation here


        setTimeout(() => {
            isLoading(false);
        }, 3000);

    };


    return (
        <>
            <div className='Roadmap-page'>

                <div className="roadmap-outer">

                    <div className="roadmap-heading">
                        <h2> <FaMapSigns color='#3fe493' /> Skill RoadMap Generator</h2>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, nihil!</p>
                    </div>

                    <div className='sub-sum-box'>
                        <h3>What would you like to learn?</h3>
                        <div className='second-Roadmapbox'>
                            <div className='roadmap-box'>
                                <textarea
                                    required
                                    placeholder='e.g. Python, Web Development, Machine Learning'
                                    className='roadmap-textarea'
                                    onChange={(e) => { setTopic(e.target.value) }}
                                    value={topic}
                                ></textarea>
                                <button
                                    onClick={handleSubmit}

                                > <FaMapSigns/> Generate Roadmap</button>
                            </div>
                            <OutputBox Loading={Loading} />
                        </div>
                    </div>
                </div>

            </div>



        </>
    )
}
