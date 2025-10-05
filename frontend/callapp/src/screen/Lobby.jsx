
import React, {  useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { useSocket } from '../socket/useSocket';

const Lobby = () => {
    const [data,setData] = useState({
        email:"",
        roomId:""
    });
    const navigate = useNavigate()
    const socket = useSocket();
   
   const handleSubmit = async(e)=>{
    e.preventDefault();
    socket.emit("createRoom",({email:data.email,roomId:data.roomId}))
   }
    useEffect(()=>{
    socket.on("roomCreated",({status,roomId})=>{
      if(status==="success") {
        navigate(`/room/group/${roomId}`)
      }
    })
    },[socket])
   
  return (
    <div className='bg-green-200'>
       <form onSubmit={handleSubmit} className="text-xl text-black">
        <div className="flex flex-col gap-4 p-20 items-center justify-center">
          <h1>Lobby</h1>
          <input
            type="email"
            placeholder="Enter your email..."
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Enter your room id..."
            value={data.roomId}
            onChange={(e) => setData({ ...data, roomId: e.target.value })}
          />
          <button>Join</button>
        </div>
      </form>
    </div>
  )
}

export default Lobby
