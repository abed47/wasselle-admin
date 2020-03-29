import React,{useState, useEffect,useContext} from 'react';
import { Link, useHistory } from 'react-router-dom';
import {MainContext} from './../../../context';
import { Button, Card, Alert, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import {fb} from './../../../firebase';
import Joi from '@hapi/joi'
const Login = () =>  {
  const fs = fb.firestore()
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [message,setMessage] = useState('');
  const [showMessage,setShowMessage] = useState(false);
  const contextValues = useContext(MainContext);
  const {isLoggedIn,setLoggedIn,user,setUser} = contextValues.user
  const history = useHistory()
  const validationSchema = Joi.object({
    username: Joi.string().alphanum().min(5).max(30),
    password: Joi.string().min(6).regex(/^[a-zA-Z0-9]{3,30}$/),
  })

  const validationRes = input => {return validationSchema.validate(input)};
    const authincation = async () => {
      let val = validationRes({username,password})
      setShowMessage(false)
      setMessage('')
      if(val.error){
        setMessage(val.error.message)
        setShowMessage(true)
        return
      }

      let ref = await fs.collection('users');

      ref.where('username','==',username).get().then(async res => {
        if(res.empty){
          setMessage('user does not exist')
          setShowMessage(true)
          return
        }

        let u = await res.docs[0].data();
        if(u.password !== password){
          setMessage('Wrong password!')
          setShowMessage(true)
          return
        }

        setUser(u)
        setLoggedIn(true)
      })

  }

  useEffect(() => {
    if(isLoggedIn && user){
      history.push('/#/dashboard')
    }
  },[user,isLoggedIn])

    return (
      <div className="app flex-row align-items-center">
        <Container>
        <Alert color="warning" isOpen={showMessage} toggle={() => setShowMessage(false)}>
          {message}
        </Alert>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input 
                        type="text" 
                        placeholder="Username" 
                        autoComplete="username" 
                        value={username} 
                        onChange={e => {
                          e.preventDefault()
                          setUsername(e.target.value)
                        }} />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input 
                        type="password" 
                        placeholder="Password" 
                        autoComplete="current-password"
                        value={password}
                        onChange={e => {
                          e.preventDefault()
                          setPassword(e.target.value)
                        }} />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button onClick={() => authincation()} color="primary" className="px-4">Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <a href="https://wa.me/96176402094?text=m3alem nset el password">
                          <Button color="link" className="px-0">Forgot password?</Button>
                          </a>
                        </Col>
                      </Row>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p>
                      <Link to="/register">
                        <Button color="primary" className="mt-3" active tabIndex={-1}>Register Now!</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    )
}

export default Login;
