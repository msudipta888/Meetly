import React, {   useMemo } from 'react'
import {io} from 'socket.io-client'
import { SocketContext } from './Context'
const SocketProvider = (props) => {
  const socket =useMemo(()=> io('http://localhost:5000'),[]) 
  return (
   <SocketContext.Provider value={socket}>
    {props.children}
   </SocketContext.Provider>
  )
}

export  {SocketProvider};
