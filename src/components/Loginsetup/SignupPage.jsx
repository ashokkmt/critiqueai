import { useEffect, useState } from 'react';
import '../../styles/LoginSetup/SignupPage.css';
import { FaEye, FaGoogle } from 'react-icons/fa';
import { FiEyeOff } from 'react-icons/fi';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { setDoc, doc } from 'firebase/firestore';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function SignUpPage() {
  const [eye, seteye] = useState(false);
  const [passtype, setpasstype] = useState("password");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");

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

  const SubmitSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.success("Password Doesn't Match", {
        position: "top-center"
      });
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          password: user.reloadUserInfo.passwordHash,
          Date: Date.now()
        })
      }

      console.log("User created:", user);
      console.log("Name:", firstName, lastName);

      toast.success("Account Created SuccessFully", {
        position: "top-center"
      });

    } catch (error) {
      console.error(error.message);
      toast.error("Email/Password Allready in Use ", {
        position: "bottom-center",
        autoClose: 2000,
        transition: Slide,
      });
    }

    setFirstName("");
    setLastName("");
    setemail("");
    setpassword("");
    setconfirmPassword("");
  };

  return (
    <>
    <div id='particles-js'></div>
    <div className="login-main-box">
      <div className="login-box">
        <div className="login-header">
          <div className="logo-shield">
            <img width={50} height={50} src="/images/favicon.png" alt="Logo" />
          </div>
          <h2>Create Account</h2>
        </div>

        <form className="login-form" onSubmit={SubmitSignUp}>

          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
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

          <div className="password-box">
            <input
              type={passtype}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setconfirmPassword(e.target.value)}
              required
            />
            <span onClick={showpass} className="eye-icon">
              {eye ? <FiEyeOff /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-button">Sign Up</button>
          <ToastContainer />

          <p className="signup-text">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>

          <div className="divider"><span>OR</span></div>

          <button type="button" className="google-button">
            <FaGoogle color="green" className="google-icon" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
