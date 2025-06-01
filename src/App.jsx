import { BrowserRouter, Route, Routes } from "react-router-dom"
import Homepage from './components/HomePage.jsx'
import Navbar from "./components/Navbar.jsx"
import EvaluateInput from "./components/EvaluateInput.jsx"
import Footer from "./components/Footer.jsx"
import RoadMap from "./components/RoadMap.jsx"
import Summary from "./components/Summary.jsx"
import GenerateNote from "./components/GenerateNote.jsx"
import LoginPage from "./components/Loginsetup/LoginPage.jsx"
import SignUpPage from "./components/Loginsetup/SignupPage.jsx"
import SavedNotes from "./components/SavedNotes.jsx"
import { useEffect, useState } from "react"
import { auth } from './components/firebase/firebase.js';


function Homepagefunc() {
  return (
    <>
      <Navbar />
      <Homepage />
      <Footer />
    </>
  )
}

function EvaluateInputFunc() {
  return (
    <>
      <Navbar />
      <EvaluateInput />
    </>
  )
}

function RoadMapFunc() {
  return (
    <>
      <Navbar />
      <RoadMap />
    </>
  )
}

function Summarypage() {
  return (
    <>
      <Navbar />
      <Summary />
    </>
  )
}

function Generatenote() {
  return (
    <>
      <Navbar />
      <GenerateNote />
    </>
  )
}

function SavedNotesPage() {
  return (
    <>
      <Navbar />
      <SavedNotes />
    </>
  )
}




function App() {

  const [userPresent, setuserPresent] = useState(false)




  const fetchUserDetail = async () => {
    auth.onAuthStateChanged(async (user) => {
      if ((user)) {
        setuserPresent(true)
      }
    })
  }

  useEffect(() => {
    fetchUserDetail();
  }, [])

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepagefunc />} />
          <Route path="/input" element={<EvaluateInputFunc />} />
          <Route path="/roadmap" element={<RoadMapFunc />} />
          <Route path="/summary" element={<Summarypage />} />
          <Route path="/notes" element={<Generatenote />} />
          <Route path="/savedNotes" element={userPresent ? <SavedNotesPage /> : <Homepagefunc />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signUp" element={<SignUpPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
