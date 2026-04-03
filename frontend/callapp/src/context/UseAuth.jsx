import React, { useContext } from 'react'
import { userContext } from './ContextProvider';

export const UseAuth = () => {
   const ctx = useContext(userContext);
    if(!ctx) throw new Error("useAuth must be used within contextProvider");
  return ctx
}

export default UseAuth
