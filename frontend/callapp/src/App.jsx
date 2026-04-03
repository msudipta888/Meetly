import { Routes, Route, Navigate } from "react-router-dom";
import Videocall from "./pages/Videocall.jsx";
import Routing from "../Routing";
import { Lobby } from "./screen/Lobby.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuthSync from "./components/AuthSync.jsx";
import Contacts from "./pages/Contacts.jsx";

const App = () => {
  return (
    <div className="App">

      <main>
        <Routes>
          <Route path="/" element={<Routing />} />
          <Route path="/signin" element={<AuthSync />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/room/group/:roomId" element={<Videocall />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
        </Routes>

      </main>
    </div>
  );
};

export default App;
