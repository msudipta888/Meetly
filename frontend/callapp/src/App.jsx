import {  Routes, Route } from "react-router-dom";
import Lobby from './screen/Lobby'
import Videocall from "./pages/Videocall.jsx";


const App = () => {

  return (
    <div className='App'>
     
      <Routes>
        <Route path='/' element={<Lobby/>} />
        <Route path="/room/group/:roomId" element={<Videocall/>}/>
      </Routes>
  
    </div>
  )
}

export default App
