import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, ModalHeader, ModalBody, Row, Label, Input } from 'reactstrap';
import { useLocation } from 'react-router-dom'

const Retail = (props) => {
  const [shops, setShops] = useState([])
  const [shop, setShop] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState("")
  const [name, setName] = useState("")
  const [client, setClient] = useState("")
  const [users, setUsers] = useState([])
  const [user, setUser] = useState({})
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [cashCredit, setCashCredit] = useState("")
  const [note, setNote] = useState("")
  const location = useLocation()
  const { id, type } = location.state ?? {}

  const getShop = async (id, userId) => {
    try {
      var url = "https://multipokerdrf.onrender.com/api/shop/"

      if (userId !== "") {
        url = url + "?userId=" + userId
      }
      else
        url = url + id + "/"

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setShop(data)
        setName("")
        setClient("")
        setCashCredit("")
        setNote("")
        return data
      }
      else {
        alert("No hay tiendas registradas")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getUser = async (id) => {
    try {
      const url = "https://multipokerdrf.onrender.com/api/user/" + id + "/"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setUsername("")
        setPassword("")
        return data
      }
      else {
        alert("No hay usuarios registrados")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const createTransaction = (shopName, transactionType, quantity) => {
    const formData = new FormData()
    formData.append("clientType", type)
    formData.append("userId", id)
    formData.append("client", shopName)
    formData.append("type", transactionType)
    formData.append("cash", quantity)
    return formData
  }

  const manageShop = async (data, userId) => {
    var url = "https://multipokerdrf.onrender.com/api/shop/"
    var prevData = ""
    const formData = new FormData()

    if (data === null) {
      formData.append("id", shops.length + 1)
      if (name !== "")
        formData.append("name", name)
      if (client !== "")
        formData.append("client", client)
      if (cashCredit !== "")
        formData.append("cashCredit", cashCredit)
      if (note !== "")
        formData.append("note", note)
    }
    else {
      if(data.cashCredit === null)
        data.cashCredit = 0
      if (data.cash === null)
        data.cash = ""
      data.retailId = ""
      data.note = ""

      prevData = JSON.stringify(data)

      if (name !== "")
        data.name = name
      if (client !== "")
        data.client = client
      if (cashCredit !== "")
      {
        data.cashCredit = data.cashCredit + parseFloat(cashCredit)
        const formData = createTransaction(data.name, "recarga", cashCredit)
        props.sendTransaction(formData)
      }
      if (note !== "")
        data.note = note

      Object.keys(data).forEach((key) => {
        if (key !== "id")
          formData.append(key, data[key])
      })
    }

    formData.append("userId", userId)

    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    try {
      if (modalType !== "") {
        url = url + data.id + "/"
        await props.axios.put(url, formData, config)
        if (prevData !== JSON.stringify(data))
          alert("Se procede a actualizar la tienda")
      }
      else {
        await props.axios.post(url, formData, config)
        alert("Se procede a agregar la tienda")
      }
      setModalOpen(false)
    } catch (error) {
      console.log(error)
    }
  }

  const manageUser = async (user) => {
    var url = "https://multipokerdrf.onrender.com/api/user/"
    const formData = new FormData()

    if (user === null) {
      formData.append("id", users.length + 1)
      if (username !== "")
        formData.append("username", username)
      if (password !== "")
        formData.append("password", password)
    }
    else {
      if (username !== "")
        user.username = username
      if (password !== "")
        user.password = password

      Object.keys(user).forEach((key) => {
        if (key !== "id")
          formData.append(key, user[key])
      })
    }
    formData.append("type", "shop")

    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    try {
      if (user === null) {
        const response = await props.axios.post(url, formData, config)
        const data = await response.data
        manageShop(null, data.id)
      }
      else {
        url = url + user.id + "/"
        await props.axios.put(url, formData, config)
        const data = await getShop("", user.id)
        manageShop(data, user.id)
      }
      setModalOpen(false)
    } catch (error) {
      console.log(error)
    }
  }

  const toggleModal = () => {
    setModalOpen(!modalOpen)
  }

  const handleClick = async (e) => {
    e.preventDefault()
    setShop({})
    setUser({})
    setModalType("")
    setModalOpen(true)
  }


  const edit = async (id) => {
    const data = await getShop(id, "")
    await getUser(data.userId)
    setModalOpen(true)
    setModalType("edit")
  }

  const handleChange = (e) => {
    setName(e.target.value)
  }

  const handleChange1 = async (e) => {
    setClient(e.target.value)
  }

  const handleChange2 = (e) => {
    setUsername(e.target.value)
  }

  const handleChange3 = (e) => {
    setPassword(e.target.value)
  }

  const handleChange4 = (e) => {
    setCashCredit(e.target.value)
  }

  const handleChange5 = async (e) => {
    setNote(e.target.value)
  }

  const handleSubmit = async (e, id) => {
    e.preventDefault()

    if (modalType !== "") {
      const data = await getShop(id, "")
      const userData = await getUser(data.userId)
      await manageUser(userData)
    }
    else
      await manageUser(null)
  }

  const eliminar = async (id) => {
    var url = "https://multipokerdrf.onrender.com/api/shop/" + id + "/"
    const data = await getShop(id, "")
    const userId = data.userId
    try {
      var response = await props.axios.delete(url)
      if (response.status === 204) {
        url = "https://multipokerdrf.onrender.com/api/user/" + userId + "/"
        response = await props.axios.delete(url)
        if (response.status === 204)
          alert("Tienda eliminada con exito")
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const url = "https://multipokerdrf.onrender.com/api/shop/"
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setShops(data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    const fetchUsers = async () => {
      const url = "https://multipokerdrf.onrender.com/api/user/"
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
    fetchUsers()
  }, [users])

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-6'>
          <br></br>
          <Button onClick={(handleClick)}>Agregar Tienda</Button>
          <br></br><br></br>
          <Table
            size="sm"
            striped
          >
            <thead>
              <tr>
                <th>
                  id
                </th>
                <th>
                  Nombre
                </th>
                <th>
                  Cliente
                </th>
                <th>
                  Dinero
                </th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id}>
                  <th>
                    {shop.id}
                  </th>
                  <th>
                    {shop.name}
                  </th>
                  <th>
                    {shop.client}
                  </th>
                  <th>
                    {shop.cashCredit > 0 ? "$" : ""}{shop.cashCredit}
                  </th>
                  <th>
                    <Button outline color="info" onClick={() => edit(shop.id)}>
                      <span className="fa fa-edit"></span>
                    </Button>
                  </th>
                  <th>
                    <Button outline color="danger" onClick={() => eliminar(shop.id)}>
                      <span className="fa fa-times"></span>
                    </Button>
                  </th>
                </tr>))}
            </tbody>
          </Table>
          <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader> {modalType === "" ? "Agregar" : "Editar"} Tienda
            </ModalHeader>
            <ModalBody>
              <form>
                <Row className="form-group ml-2 mr-2">
                  <Label for="exampleTextBox">Nombre</Label>
                  <Input onChange={handleChange}
                    id="exampleTextBox"
                    name="text"
                    type="text"
                    className='form-control'
                    defaultValue={shop.name}
                  />
                  <Label for="exampleTextBox1">Cliente</Label>
                  <Input onChange={handleChange1}
                    id="exampleTextBox1"
                    name="text"
                    type="text"
                    className='form-control'
                    defaultValue={shop.client}
                  />
                  {(modalType === "edit" && type === "admin") || modalType === "" ?
                    <Label for="exampleTextBox2">Usuario</Label> : null}
                  {(modalType === "edit" && type === "admin") || modalType === "" ?
                    <Input onChange={handleChange2}
                      id="exampleTextBox2"
                      name="text"
                      type="text"
                      className='form-control'
                      defaultValue={user.username}
                    /> : null}
                  {(modalType === "edit" && type === "admin") || modalType === "" ?
                    <Label for="exampleTextBox3">Contraseña</Label> : null}
                  {(modalType === "edit" && type === "admin") || modalType === "" ?
                    <Input onChange={handleChange3}
                      id="exampleTextBox3"
                      name="text"
                      type="password"
                      className='form-control'
                      defaultValue={modalType === "edit" ? "cGFzc3dvcmQ=" : ""}
                    /> : null}
                  <Label for="exampleTextBox4">Dinero</Label>
                  <Input onChange={handleChange4}
                    id="exampleTextBox4"
                    name="text"
                    type="number"
                    className='form-control'
                  />
                  <Label htmlFor="comment">Nota</Label>
                  <Input onChange={handleChange5}
                    id="comment"
                    name="comment"
                    type='textarea'
                    rows="6"
                    className="form-control"
                    defaultValue={shop.note}
                  />
                </Row>
                <br></br>
                <Row className="form-group ml-2">
                  <Button type="submit" color="primary" onClick={(e) => handleSubmit(e, shop.id)}>
                    Guardar
                  </Button>
                </Row>
              </form>
            </ModalBody>
          </Modal>
        </div>
      </div>
    </div>
  )
}

export default Retail