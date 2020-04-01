import React, {Component} from 'react'
import { MainContext } from '../../context'

class Logout extends Component{

    constructor(props){
        super(props)
        this.state ={
        }
    }

    componentWillMount(){

    }

    componentDidMount(){
        localStorage.removeItem('user')
        this.context.setLoggedIn(false)
    }
    render(){
        return(
            <div>Logging Out</div>
        )
    }
}
Logout.contextType = MainContext;
export default Logout;