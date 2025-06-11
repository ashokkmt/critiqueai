import { useEffect, useRef, useState } from 'react';
import '../../styles/shared/Shared.css'
import { FaDownload, FaRobot } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io'; // Add this import for close/cancel icon
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import axios from 'axios';
import html2pdf from "html2pdf.js";


function Shared() {

    const { id } = useParams();
    const navigate = useNavigate(); // Add this hook
    const [showoutput, setshowoutput] = useState(true);
    const [Loading, setLoading] = useState(false);
    const [shared, setshared] = useState("");
    const [notfound, setnotfound] = useState(false);
    // const [shareheading, setshareheading] = useState("");
    // const [sharetype, setsharetype] = useState("");
    const sharedout = useRef(null)
    const [hide, sethide] = useState(true);

    // Add this function to navigate to homepage
    const goToHomepage = () => {
        window.location.href = '/';  // Use direct page refresh instead of React Router navigation
    }

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
            const response = await axios.get(`https://critiqueai-app-react-952301619936.us-central1.run.app/shared/${id}`);
            console.log(response.data);

            // setshareheading(response.data.name)
            // setsharetype(response.data.type)
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

        const element = sharedout.current;
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
    }

    const CopyContent = () => {
        navigator.clipboard.writeText(sharedout.current.innerText);
         sethide(false)
        setTimeout(() => {
            sethide(true)
        }, 1200);
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
                                        <h2>Shared Output</h2>
                                        <div className='shared-btns'>
                                            <div className='share-icon share-copy' onClick={CopyContent} >
                                                <div className={`show ${hide ? "" : "unhide"}`}>Copied</div>
                                                <MdContentCopy />
                                            </div>
                                            <div className='share-icon' onClick={DownloadFile} >
                                                <FaDownload />
                                            </div>
                                            <div className='share-icon' onClick={goToHomepage}>
                                                <IoMdClose />
                                            </div>
                                        </div>
                                    </div>

                                    {
                                        notfound ?
                                            <div className='not-shared-content'>
                                                <p>Sorry, you Don't have any shared document</p>
                                            </div>
                                            :
                                            <div className='shared-content' ref={sharedout} >
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

export default Shared;
