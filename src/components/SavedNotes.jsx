import { useEffect, useState } from 'react';
import '../styles/SavedNotes.css';
import { auth } from './firebase/firebase';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";


export default function SavedNotes() {
  const navigate = useNavigate();
  const [udata, setudata] = useState([]);
  const [Loading, isLoading] = useState(false);
  const [notaUser, setnotaUser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [URL, setURL] = useState("");
  const [showURL, setshowURL] = useState(false);
  const [LoadingURL, setLoadingURL] = useState(false);
  const [hide, sethide] = useState(true);

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
    setshowURL(true)
    setLoadingURL(true);
    try {
      const docResponse = await axios.post("http://127.0.0.1:5000/api/share-output", {
        user_id: currentUser.uid,
        doc_id: id
      });
      console.log(docResponse.data.sharedDocId);
      setURL(`http://localhost:5173/shared/${docResponse.data.sharedDocId}`);
      setLoadingURL(false);
    } catch (error) {
      setLoadingURL(false);
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


    navigate('/view', {
      state: {
        doc_id: id,
      },
    })


  };



  const copypopup = () =>{
    sethide(false)
    setTimeout(() => {
      sethide(true)
    }, 1200);
  }

  return (
    <>
      <div id="particles-js"></div>

      {
        showURL && (
          <div className="share-popup-overlay">

            {

              LoadingURL ?
                (
                  <div className='loading_url'>
                    <div className='loadingCircle'></div>
                    <p>Loading...</p>
                  </div>
                )
                :
                (
                  <div className="share-popup">
                    <div className="share-header">
                      <h3>Share public link to chat</h3>

                      <div className="close-btn-wrapper" onClick={() =>
                        setshowURL(false)
                      }>
                        <IoMdClose
                          size={20}
                          color="white"
                          className="close-share-btn"
                        />
                      </div>

                    </div>
                    <p className="share-description">
                      Your name, custom instructions, and any messages you add after
                      sharing stay private.{" "}
                      <Link to="/" className="share-learn-more">
                        Learn more
                      </Link>
                    </p>
                    <div className="share-input-wrapper">
                      <input
                        type="text"
                        value={URL}
                        readOnly
                        className="share-input"
                      />
                      <button
                        className="create-link-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(URL);
                          copypopup();
                        }}
                      >
                        <div className={`show ${hide ? "" : "unhide"}`}>copied</div>
                        Copy link
                      </button>
                    </div>
                  </div>
                )
            }

          </div>
        )
      }

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
