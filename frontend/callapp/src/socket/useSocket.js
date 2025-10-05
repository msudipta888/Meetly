import { useContext } from "react";
import { SocketContext } from "./Context";

 
export const useSocket =()=>{
  const socket = useContext(SocketContext)
  return socket;
}