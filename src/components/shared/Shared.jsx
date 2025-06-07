import { useEffect, useRef, useState } from 'react';
import '../../styles/shared/Shared.css'
import { FaDownload, FaRobot } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { useParams } from "react-router-dom";
import axios from 'axios';


function Shared() {

    const { id } = useParams();
    const [showoutput, setshowoutput] = useState(true);
    const [Loading, setLoading] = useState(false);
    const [shared, setshared] = useState("");
    // const [shareheading, setshareheading] = useState("");
    // const [sharetype, setsharetype] = useState("");
    const sharedout = useRef(null)


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


    useEffect(() => {
        if (sharedout.current) {
            sharedout.current.innerHTML = shared;
        }
    }, [shared])



    useEffect(async () => {

        try {

            setLoading(true)
            // const id = "fXFjWxU3iqNpEZ77gPJS";
            const response = await axios.get(`http://127.0.0.1:5000/shared/${id}`);
            console.log(response.data);

            // setshareheading(response.data.name)
            // setsharetype(response.data.type)
            setshared(response.data.content)
            setLoading(false)
        }
        catch (error) {
            console.log(error.message);
        }

    }, [])


    const DownloadFile = () => {
        console.log("Download Button Pressed.....")
    }

    const CopyContent = () => {
        navigator.clipboard.writeText(sharedout.current.innerText);
    }




    return (
        <>
            <div id="particles-js"></div>

            {
                showoutput && (
                    <div className={`shared-output`}>
                        <div className={`sub-shared-output`}>
                            {Loading ? (
                                <div className='shared-placeholder'>
                                    <div className="Loadcircle"></div>
                                    <p>Loading...</p>
                                </div>
                            ) : (
                                <>
                                    <div className='shared-toolbar'>
                                        {/* <h2>{shareheading} {sharetype}</h2> */}
                                        <h2>Shared</h2>
                                        <div className='shared-btns'>
                                            <div className='share-icon' onClick={CopyContent} >
                                                <MdContentCopy />
                                            </div>
                                            <div className='share-icon' onClick={DownloadFile} >
                                                <FaDownload />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='shared-content' ref={sharedout} >
                                        {/* output Yha Ayega */}

                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }



        </>
    )
}

export default Shared;






{/* <div className='share-icon' >
                                                <TfiSave />
                                            </div> */}



{/* <div className='share-icon' onClick={() => {
                                                setshowoutput(false)
                                            }}
                                            >
                                                <RiCloseLargeLine />
                                            </div> */}