import React, { createContext, useState, useEffect } from "react";

export const MainContext = createContext();

export const Context = props => {
    const [isLoggedIn, setLoggedIn ] = useState(Boolean)
    const [user,setUser] = useState({})

    useEffect(() => {
        let u = localStorage.getItem('user');
        if(!u){
            return setLoggedIn(false)
        }else{
            setLoggedIn(true)
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