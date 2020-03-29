import React, { createContext, useState, useEffect } from "react";

export const MainContext = createContext();

export const Context = props => {
    const [isLoggedIn, setLoggedIn ] = useState(false)
    const [user,setUser] = useState({})
    useEffect(() => {
        let u = localStorage.getItem('user');
        if(!u){
            return setLoggedIn(false)
        }
    },[])


    return(
        <MainContext.Provider value={
            {
                user:{isLoggedIn,setLoggedIn,user,setUser}
            }}>
            {props.children}
        </MainContext.Provider>
    )

}