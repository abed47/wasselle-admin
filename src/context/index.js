import React, { createContext, useState, useEffect } from "react";

const Context = createContext();

export const MainContext = props => {
    const [isLoggedIn, setLoggedIn ] = useState(false)

    useEffect(() => {
        let u = localStorage.getItem('user');
        if(!u){
            return setLoggedIn(false)
        }
    },[])


    return(
        <Context.Provider value={{user:[isLoggedIn,setLoggedIn]}}>
            {props.children}
        </Context.Provider>
    )
    
}