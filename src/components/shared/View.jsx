import { useEffect, useRef, useState } from 'react';
import '../../styles/shared/View.css'
import { FaDownload } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { useParams } from "react-router-dom";
import axios from 'axios';
import html2pdf from "html2pdf.js";

function Viewed() {

    const { id } = useParams();
    const [showoutput, setshowoutput] = useState(true);
    const [Loading, setLoading] = useState(false);
    const [shared, setshared] = useState("");
    const viewedout = useRef(null)
    const [notfound, setnotfound] = useState(false)


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
            const response = await axios.get(`http://127.0.0.1:5000/view/${id}`);
            console.log(response.data);

            setshared(response.data.content)
            setLoading(false)
        }
        catch (error) {
            setLoading(false)
            setnotfound(true)
            console.log(error.message);
        }

    }, [])


    const DownloadFile = () => {
        console.log("Download Button Pressed.....")

        const element = viewedout.current;
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
    }

    const CopyContent = () => {
        navigator.clipboard.writeText(sharedout.current.innerText);
    }




    return (
        <>
            <div id="particles-js"></div>

            {
                showoutput && (
                    <div className={`view-output`}>
                        <div className={`sub-view-output`}>
                            {Loading ? (
                                <div className='view-placeholder'>
                                    <div className="Loadcircle"></div>
                                    <p>Loading...</p>
                                </div>
                            ) : (
                                <>
                                    <div className='view-toolbar'>
                                        <h2>View Document</h2>
                                        <div className='viewed-btns'>

                                            <div className='view-icon' onClick={CopyContent} >
                                                <MdContentCopy />
                                            </div>
                                            <div className='view-icon' onClick={DownloadFile} >
                                                <FaDownload />
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        notfound ?
                                            <div className='not-viewed-content'>
                                                <p>sorry, you don't have any document to view</p>
                                            </div>
                                            :
                                            <div className='viewed-content' ref={viewedout} >
                                                {/* output Yha Ayega */}


                                            </div>
                                    }


                                </>
                            )}
                        </div>
                    </div>
                )
            }



        </>
    )
}

export default Viewed;








{/* <div className='share-icon' onClick={() => {
                                                setshowoutput(false)
                                            }}
                                            >
                                                <RiCloseLargeLine />
                                            </div> */}