import {  Routes, Route } from "react-router-dom";
import Lobby from './screen/Lobby'
//import GroupVideo from './pages/GroupVideo.jsx';
import LivePollForm from './pages/LivePollForm.jsx';
import Videocall from "./pages/Videocall.jsx";


const App = () => {

  return (
    <div className='App'>
     
      <Routes>
        <Route path='/' element={<Lobby/>} />
       <Route path='/live-poll/:roomId' element={<LivePollForm/>} />
        <Route path="/room/group/:roomId" element={<Videocall/>}/>
      </Routes>
  
    </div>
  )
}

export default App
