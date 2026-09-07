import React from 'react';
import axios from 'axios';
import Home from '../components/HomeComponent';
import Inventario from '../components/InventarioComponent';
import Shop from '../components/ShopComponent';
import Retail from '../components/RetailComponent';
import Admin from '../components/AdminComponent';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './MainLayout';


const Main = () => {

  const sendTransaction = async (transaction) => {
    
    const url = "https://multipokerdrf.onrender.com/api/transaction/"

    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    try {
      await axios.post(url, transaction, config)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home axios={axios} />} />
        <Route element={<MainLayout />}>
          <Route path='/inventario/:pagina' element={<Inventario />} />
          <Route path='/shop' element={<Shop axios={axios} sendTransaction={sendTransaction}/>} />
          <Route path='/retail' element={<Retail axios={axios} sendTransaction={sendTransaction}/>} />
          <Route path='/admin' element={<Admin axios={axios} sendTransaction={sendTransaction}/>} />
          <Route path='*' element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default Main;