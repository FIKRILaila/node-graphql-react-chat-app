import React from 'react'
import { Container } from 'react-bootstrap'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ApolloProvider from './ApolloProvider'
import './App.scss'
import Home from './pages/home/Home'
import Register from './pages/Register'
import Login from './pages/Login'

import { AuthProvider } from './context/auth'
import { MessageProvider } from './context/message'
import GuardRoute from './util/guardRoute'

function App() {
  return (
    <ApolloProvider>
      <AuthProvider>
      <MessageProvider>
      <BrowserRouter>
        <Container className="pt-5">
          <Routes>
            <Route path="/" element={
            <GuardRoute authenticated={true} guest = {false}>
            <Home/>
            </GuardRoute>
            } />
            <Route path="/register" element={
            <GuardRoute authenticated={false} guest={true}>
            <Register/>
            </GuardRoute>
            } />
            <Route path="/login" element={
            <GuardRoute authenticated={false} guest={true}>
            <Login/>
            </GuardRoute>
            } />
          </Routes>
        </Container>
      </BrowserRouter>
      </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App;