import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./socket/socketProvider.jsx";
createRoot(document.getElementById("root")).render(
    <BrowserRouter>
  
      <SocketProvider>
        <App />
      </SocketProvider>
    </BrowserRouter>
 
);
