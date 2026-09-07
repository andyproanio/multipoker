import React from 'react'
import Header from '../components/HeaderComponent'
import { Outlet, useLocation } from 'react-router-dom'

const MainLayout = () => {
  const location = useLocation()
  const { id, type } = location.state

  return (
    <>
      <Header id={id} type={type}/>
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default MainLayout
