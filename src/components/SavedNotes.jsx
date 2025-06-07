import { useEffect, useState } from 'react';
import '../styles/SavedNotes.css';
import { auth } from './firebase/firebase';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function SavedNotes() {
  const navigate = useNavigate();
  const [udata, setudata] = useState([]);
  const [Loading, isLoading] = useState(false);
  const [notaUser, setnotaUser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
      if (user) {
        setCurrentUser(user);
        isLoading(true);
        try {
          const res = await axios.post("http://127.0.0.1:5000/get-output", {
            uid: user.uid
          });
          setudata(res.data.outputs);
        } catch (error) {
          console.log(error.message);
        }
        isLoading(false);
      } else {
        setnotaUser(true);
      }
    });
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);

  const shareOutput = async (id) => {
    try {
      const docResponse = await axios.post("http://127.0.0.1:5000/api/share-output", {
        user_id: currentUser.uid,
        doc_id: id
      });
      console.log(docResponse);
    } catch (error) {
      console.log(error.message);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await axios.delete("http://127.0.0.1:5000/api/delete-output", {
        data: {
          user_id: currentUser.uid,
          doc_id: id,
        },
      });
      fetchUserDetail();
    } catch (error) {
      console.log(error.message);
    }
  };

  const showSavedDoc = (id) => {
    // Implement your function or routing logic here
    console.log("View Doc ID:", id);

    navigate(`/view/${id}`);
  };


  return (
    <>
      <div id="particles-js"></div>

      <div className="saved-main-container">
        <div className="saved-sub-container">
          <h2>Saved Notes</h2>

          <ul className="sub-heading-title">
            <li>Name</li>
            <li>Type</li>
            <li>Filter</li>
          </ul>

          <div className="saved-notes-container">
            <div className="saved-table-wrapper">
              {
                Loading ?
                  (
                    <div className="loading-overlay">
                      <div className='circle'></div>
                      <p>Loading content...</p>
                    </div>
                  )
                  :
                  notaUser ?
                    (
                      <div className="Not-user">
                        <div className='notUserLogin'>
                          <h3>Not a User</h3>
                          <Link className='Go-login' to='/login'>Login</Link>
                        </div>
                      </div>
                    )
                    :
                    udata.length === 0 ?
                      (
                        <div className="no-saved-data">
                          <p>Haven't saved anything yet. Try saving a note.</p>
                        </div>
                      )
                      :
                      (
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
                            {
                              udata.map((val, key) => (
                                <tr key={val.id || key}>
                                  <td>{key + 1}</td>
                                  <td>{val.name}</td>
                                  <td>{val.type}</td>
                                  <td>{val.time}</td>
                                  <td>
                                    <button onClick={() => showSavedDoc(val.id)} className="action-btn view">View</button>
                                    <button onClick={() => shareOutput(val.id)} className="action-btn share">Share</button>
                                    <button onClick={() => deleteDocument(val.id)} className="action-btn delete">Delete</button>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      )
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
