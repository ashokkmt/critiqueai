import { useState, useEffect } from 'react';
import '../../styles/LoginSetup/LoginPage.css';
import { FaEye, FaGoogle } from 'react-icons/fa';
import { FiEyeOff } from 'react-icons/fi';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleAuthProvider } from 'firebase/auth';


export default function LoginPage() {
    const [eye, seteye] = useState(false);
    const [passtype, setpasstype] = useState("password");
    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const navigate = useNavigate();

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

    const showpass = () => {
        seteye(!eye);
        setpasstype(passtype === "password" ? "text" : "password");
    };

    const SubmitLogin = async (e) => {
        e.preventDefault();


        try {
            await signInWithEmailAndPassword(auth, email, password);
            // console.log(auth.currentUser)
            console.log("Logged SuccessFully")
            toast.success("Logged in SuccessFully", {
                position: "top-center",
                autoClose: 2000,
                transition: Slide,
            });

            console.log("Email:", email);
            console.log("Password:", password);


            // Go to Home/Dashboard
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error) {
            toast.error("Doesn't have Account..", {
                position: "top-center",
                autoClose: 2000,
                transition: Slide,
            });
        }

        setemail("")
        setpassword("")
    };

    const signinWithGoogle = async () => {
        const Provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, Provider);
            console.log(result)
            toast.success("Logged in SuccessFully", {
                position: "top-center",
                autoClose: 2000,
                transition: Slide,
            });

        } catch (error) {
            console.log(error.message);
            toast.error(error.message, {
                position: "top-center",
                autoClose: 2000,
                transition: Slide,
            });
        }
    }

    return (
        <>
            <div id="particles-js"></div>

            <div className="login-main-box">
                <div className="login-box">
                    <div className="login-header">
                        <div className="logo-shield"><img width={50} height={50} src="/images/favicon.png" alt="Logo" /></div>
                        <h2>Welcome</h2>
                    </div>

                    <form className="login-form" onSubmit={SubmitLogin}>
                        <input
                            type="text"
                            placeholder="Username or email address"
                            value={email}
                            onChange={(e) => setemail(e.target.value)}
                            required
                        />

                        <div className="password-box">
                            <input
                                type={passtype}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setpassword(e.target.value)}
                                required
                            />
                            <span onClick={showpass} className="eye-icon">
                                {eye ? <FiEyeOff /> : <FaEye />}
                            </span>
                        </div>

                        <a href="#" className="forgot-link">Forgot password?</a>

                        <button type="submit" className="login-button">Continue</button>
                        <ToastContainer />

                        <p className="signup-text">
                            Don’t have an account? <Link to="/signUp">Sign up</Link>
                        </p>

                        <div className="divider"><span>OR</span></div>

                        <button onClick={signinWithGoogle} type="button" className="google-button">
                            <FaGoogle color="green" className="google-icon" />
                            Continue with Google
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
