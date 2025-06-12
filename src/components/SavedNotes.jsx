import { useEffect, useState } from 'react';
import '../styles/SavedNotes.css';
import { auth } from './firebase/firebase';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { IoMdClose } from "react-icons/io";
import { FaChevronDown, FaChevronUp, FaSearch, FaTimes } from "react-icons/fa";

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
  const [searchTerm, setSearchTerm] = useState("");

  const [expandedRowId, setExpandedRowId] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js';
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS('particles-js', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#4CAF50' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#4CAF50', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 1, random: true, out_mode: 'out' }
          },
          interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } }
          },
          retina_detect: true
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  const fetchUserDetail = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        isLoading(true);
        try {
          const res = await axios.post("https://critiqueai-app-react-952301619936.us-central1.run.app/get-output", { uid: user.uid });
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

  const shareOutput = async (e, id) => {
    e.stopPropagation();
    setshowURL(true);
    setLoadingURL(true);
    try {
      const docResponse = await axios.post("https://critiqueai-app-react-952301619936.us-central1.run.app/api/share-output", { user_id: currentUser.uid, doc_id: id });
      setURL(`https://critiqueai.dev/shared/${docResponse.data.sharedDocId}`);
      setLoadingURL(false);
    } catch (error) {
      setLoadingURL(false);
      console.log(error.message);
    }
  };

  const deleteDocument = async (e, id) => {
    e.stopPropagation();
    try {
      await axios.delete("https://critiqueai-app-react-952301619936.us-central1.run.app/api/delete-output", { data: { user_id: currentUser.uid, doc_id: id } });
      fetchUserDetail();
    } catch (error) {
      console.log(error.message);
    }
  };

  const showSavedDoc = (e, id) => {
    e.stopPropagation();
    navigate('/view', { state: { doc_id: id } });
  };

  const copypopup = () => {
    sethide(false);
    setTimeout(() => sethide(true), 1200);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <>
      <div id="particles-js"></div>
      {showURL && (
        <div className="share-popup-overlay">
          {LoadingURL ? (<div className='loading_url'><div className='loadingCircle'></div><p>Loading...</p></div>) : (
            <div className="share-popup">
              <div className="share-header"><h3>Share Your Note</h3><div className="close-btn-wrapper" onClick={() => setshowURL(false)}><IoMdClose size={20} color="white" className="close-share-btn" /></div></div>
              <p className="share-description">Anyone with this link can view this note. <span className="expiry-note">The link will expire in 1 hour.</span></p>
              <div className="share-input-wrapper">
                <input type="text" value={URL} readOnly className="share-input" />
                <button className="create-link-btn" onClick={() => { navigator.clipboard.writeText(URL); copypopup(); }}>
                  <div className={`show ${hide ? "" : "unhide"}`}>Copied</div>Copy link
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="saved-main-container">
        <div className="saved-sub-container">
          <h2>Saved Notes</h2>
          <div className="search-container">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search notes..." value={searchTerm} onChange={handleSearch} className="search-input" />
              {searchTerm && (<FaTimes className="clear-search" onClick={() => setSearchTerm("")} />)}
            </div>
          </div>
          <div className="saved-notes-container">
            <div className="saved-table-wrapper">
              {Loading ? (<div className="loading-overlay"><div className='circle'></div><p>Loading content...</p></div>) :
                notaUser ? (<div className="Not-user"><div className='notUserLogin'><h3>Not a User</h3><Link className='Go-login' to='/login'>Login</Link></div></div>) :
                  udata.length === 0 ? (<div className="no-saved-data"><p>Haven't saved anything yet.</p></div>) : (
                    <table className="saved-notes-table">
                      <thead>
                        <tr>
                          <th className="serial-number">Sno</th>
                          <th className="heading-name">Name</th>
                          <th className="time">Time</th>
                          <th className="title-type">Type</th>
                          <th className="actions-header">Actions</th>
                          <th className="drop-btn"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {udata
                          .filter(val => val.name.toLowerCase().includes(searchTerm.toLowerCase()) || val.type.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((val, key) => (
                            <>
                              <tr key={val.id} className="table-main-row" onClick={() => toggleRow(val.id)}>
                                <td className="serial-number">{key + 1}</td>
                                <td className="heading-name">{val.name}</td>
                                <td className="time">{val.time}</td>
                                <td className="title-type">{val.type}</td>
                                <td className="actions-cell">
                                  <div className="action-buttons-desktop">
                                    <button onClick={(e) => showSavedDoc(e, val.id)} className="action-btn view">View</button>
                                    <button onClick={(e) => shareOutput(e, val.id)} className="action-btn share">Share</button>
                                    <button onClick={(e) => deleteDocument(e, val.id)} className="action-btn delete">Delete</button>
                                  </div>
                                  <span className="expand-indicator">
                                    {expandedRowId === val.id ? <FaChevronUp /> : <FaChevronDown />}
                                  </span>
                                </td>
                              </tr>
                              <tr className={`expandable-row ${expandedRowId === val.id ? 'expanded' : ''}`}>
                                <td colSpan="5">
                                  <div className="expandable-content">
                                    <div className="detail-item">
                                      <strong>Type</strong> {val.type}
                                    </div>
                                    <div className="detail-item action-buttons-mobile">
                                      <strong>Actions</strong>

                                      <div>
                                        <button onClick={(e) => showSavedDoc(e, val.id)} className="action-btn view">View</button>
                                        <button onClick={(e) => shareOutput(e, val.id)} className="action-btn share">Share</button>
                                        <button onClick={(e) => deleteDocument(e, val.id)} className="action-btn delete">Delete</button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </>
                          ))}
                      </tbody>
                    </table>
                  )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}