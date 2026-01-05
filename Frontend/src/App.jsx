import React, { useEffect, useState } from 'react'
import {Navigate, Route, Routes} from 'react-router'
import HomePage from './pages/HomePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotificationPage from './pages/NotificationsPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CallPage from './pages/CallPage.jsx'
import toast, {Toaster} from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import {axiosInstance} from './lib/axios.js'
import axios from 'axios'
import PageLoader from './components/PageLoader.jsx'
import { getAuthUser } from './lib/api.js'
import useAuthuser from './hooks/useAuthuser.js'

const App = () => {


  const {isLoading,authUser} = useAuthuser()

  if(isLoading) return <PageLoader/>

  return (
    <div className='h-screen' data-theme="night">
      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login"/>} />
        <Route path='/register' element={!authUser ? <RegisterPage/> : <Navigate to="/"/>} />
        <Route path='/login' element={!authUser ? <LoginPage/>  : <Navigate to="/"/>} />
        <Route path='/notification' element={authUser ? <NotificationPage/> : <Navigate to="/login"/>} />
        <Route path='/onboarding' element={authUser ? <OnboardingPage/> : <Navigate to="/login"/>} />
        <Route path='/chat' element={authUser ? <ChatPage/> : <Navigate to="/login"/>} />
        <Route path='/call' element={authUser ? <CallPage/> : <Navigate to="/login"/>} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App