import React, { useState } from 'react';
import Login, { Username, Password, Submit } from '@react-login-page/page6'
import { Icon } from 'react-icons-kit'
import { eyeOff, eye } from 'react-icons-kit/feather'
import { useNavigate } from 'react-router-dom';

const Home = (props) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState('password')
  const [icon, setIcon] = useState(eyeOff)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setUsername(e.target.value)
  }

  const handleChange1 = (e) => {
    setPassword(e.target.value)
  }

  const handleClick = async (e) => {
    e.preventDefault()
    const url = "https://multipokerdrf.onrender.com/api/user/verifyPassword/"
    const formData = new FormData()
    formData.append("username", username)
    formData.append("password", password)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    try {
      const response = await props.axios.post(url, formData, config)
      const jsonData = response.data
      const id = jsonData.id
      const type = jsonData.type
      if (type === "shop")
        navigate('/shop', { state: { id: id, type: type } })
      else if (type === "retail")
        navigate('/retail', { state: { id: id, type: type } })
      else if (type === "admin")
        navigate('/admin', { state: { id: id, type: type } })
      else
        navigate('/inventario/1', { state: { id: id, type: type } })
    } catch (error) {
      alert("Credenciales Incorrectas")
    }
  }

  const togglePassword = () => {
    if (visible === 'password') {
      setIcon(eye)
      setVisible('text')
    } else {
      setIcon(eyeOff)
      setVisible('password')
    }
  }

  const css = {
    '--login-bg': '#000097',
    '--login-color': '#fff',
    '--login-input': '#333',
    '--login-input-bg': '#fff',
    '--login-inner-before': '#000097',
    '--login-inner-after': '#000097',
    '--login-btn': '#fff',
    '--login-btn-bg': '#5b6ef4',
    '--login-btn-focus': '#3648c6',
    '--login-btn-hover': '#3648c6',
    '--login-btn-active': '#5b6ef4',
    '--login-footer': '#ffffff99',
  };

  return (
    <Login style={{ height: 690, ...css }} >
      <Username label="Usuario" name="userUserName" placeholder="" onChange={handleChange} />
      <Password label="Contraseña" name="userPassword" placeholder="" type={visible} onChange={handleChange1}>
        <span onClick={togglePassword}>
          <Icon icon={icon} size={25} />
        </span>
      </Password>
      <Submit onClick={handleClick}>Ingresar</Submit>
    </Login>

  );
};
export default Home;