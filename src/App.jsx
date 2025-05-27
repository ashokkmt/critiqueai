import { BrowserRouter, Route, Routes } from "react-router-dom"
import Homepage from './components/HomePage.jsx'
import NavbarFooter from "./components/Navbar.jsx"
import EvaluateInput from "./components/EvaluateInput.jsx"
import Footer from "./components/Footer.jsx"
import RoadMap from "./components/RoadMap.jsx"
import Summary from "./components/Summary.jsx"
import GenerateNote from "./components/GenerateNote.jsx"
import LoginPage from "./components/Loginsetup/LoginPage.jsx"
import SignUpPage from "./components/Loginsetup/SignupPage.jsx"

function Homepagefunc() {
  return (
    <>
      <NavbarFooter />
      <Homepage />
      <Footer />
    </>
  )
}

function EvaluateInputFunc() {
  return (
    <>
      <NavbarFooter />
      <EvaluateInput />
    </>
  )
}

function RoadMapFunc() {
  return (
    <>
      <NavbarFooter />
      <RoadMap />
    </>
  )
}

function Summarypage() {
  return (
    <>
      <NavbarFooter />
      <Summary />
    </>
  )
}

function Generatenote() {
  return (
    <>
      <NavbarFooter />
      <GenerateNote />
    </>
  )
}


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepagefunc />} />
          <Route path="/input" element={<EvaluateInputFunc />} />
          <Route path="/roadmap" element={<RoadMapFunc />} />
          <Route path="/summary" element={<Summarypage />} />
          <Route path="/notes" element={<Generatenote />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signUp" element={<SignUpPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
