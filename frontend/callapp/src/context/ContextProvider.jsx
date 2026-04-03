import { createContext, useState } from "react"
export const userContext = createContext();

export const ContextProvider = ({ children }) => {
  const [users, setUsers] = useState({
    name: "",
    profileImage: ""
  });
  return (
    <userContext.Provider value={{ users, setUsers }}>
      {children}
    </userContext.Provider>
  )
}
