import { useEffect, useState } from 'react';
import '../styles/SavedNotes.css';
import { auth } from './firebase/firebase';
import axios from 'axios';


export default function SavedNotes() {

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



  const fetchUserDetail = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user.uid);

      try {
        const res = await axios.post("http://127.0.0.1:5000/set-output", {
          Heading: "Heading",
          Time: "20/20/20",
          Content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam corrupti quia accusamus, aspernatur assumenda odit repudiandae ab libero beatae amet obcaecati praese",
          Uid: user.uid
        })

        console.log(res)
      } catch (error) {

      }

    })
  }

  useEffect(() => {
    fetchUserDetail();
  }, [])


  return (
    <>
      <div id="particles-js"></div>

      <div className="saved-main-container">
        <div className="saved-sub-container">
          <h2>Saved Notes</h2>

          <ul className="sub-heading-title">
            <li>Title1</li>
            <li>Title2</li>
            <li>Title3</li>
            <li>Title4</li>
          </ul>

          <div className="saved-notes-container">
            <div className="saved-table-wrapper">
              <table className="saved-notes-table">
                <thead>
                  <tr>
                    <th className="serial-number">Sno</th>
                    <th className="heading-name">Name</th>
                    <th className="title-type">Type</th>
                    <th className="time">Time</th>
                    <th className="feature-buttons">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr >
                    <td>01</td>
                    <td>Heading</td>
                    <td>Answer Evaluation</td>
                    <td>May 28, 2025 • 3:45 PM</td>
                    <td>
                      <button className="action-btn view">View</button>
                      <button className="action-btn share">Share</button>
                      <button className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
