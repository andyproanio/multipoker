import React, { useState, useEffect } from 'react';
import {
  Button, Table, Modal, ModalHeader, ModalBody, Row, Label, Input, Card, CardTitle, CardBody, CardText
} from 'reactstrap';
import { useLocation } from 'react-router-dom'

const Shop = (props) => {
  const [shop, setShop] = useState({})
  const [allMachines, setAllMachines] = useState([])
  const [machines, setMachines] = useState([])
  const [machine, setMachine] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState("")
  const [name, setName] = useState("")
  const [gameCash, setGameCash] = useState("")
  const location = useLocation()
  const { id, type } = location.state ?? {}

  const getMachine = async (id) => {
    try {
      const url = "https://multipokerdrf.onrender.com/api/machine/" + id + "/"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMachine(data)
        setName("")
        setGameCash("")
        return data
      }
      else {
        alert("No hay máquinas registradas")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const changeCredit = async (data) => {
    const url = "https://multipokerdrf.onrender.com/api/machine/" + data.id + "/"

    if (gameCash !== "") {
      data.gameCash = gameCash
      manageCash(data.name, "pay", gameCash)
    }
    if (name !== "")
      data.name = name

    try {
      if (data.getCredit)
        alert("Se procede a retirar los créditos")
      else if (!data.assigned)
        alert("Se procede a apagar la máquina")
      else if (gameCash !== "" || name !== "")
        alert("Se procede a actualizar la máquina")
      else if (data.creditImage) {
        const credit = prompt("Ingrese los créditos ganados")
        if (credit !== null && credit !== "") {
          data.creditImage = null
          manageCash(data.name, "", parseFloat(credit) / 20)
          alert("Se procede a eliminar la imagen")
        }
      }
      await props.axios.put(url, data)
      setModalOpen(false)
    } catch (error) {
      console.log(error)
    }
  }

  const createMachine = () => {
    const formData = new FormData()
    formData.append("id", allMachines.length + 1)
    if (gameCash !== "")
      formData.append("gameCash", gameCash)
    if (name !== "")
      formData.append("name", name)
    formData.append("shopId", id)
    return formData
  }

  const createTransaction = (machineName, transactionType, quantity) => {
    const formData = new FormData()
    formData.append("clientType", type)
    formData.append("userId", id)
    formData.append("client", machineName)
    formData.append("type", transactionType)
    formData.append("cash", quantity)
    return formData
  }

  const toggleModal = () => {
    setModalOpen(!modalOpen)
  }

  const handleClick = async (e) => {
    e.preventDefault()
    setMachine({})
    setModalOpen(true)
  }

  const downloadJSON = async (e) => {
    e.preventDefault()
    const jsonString = JSON.stringify(shop)
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const collegamento = document.createElement("a");
    collegamento.href = url;
    collegamento.download = "tienda.json";
    document.body.appendChild(collegamento);
    collegamento.click();
    document.body.removeChild(collegamento);
    URL.revokeObjectURL(url);
  }

  const getCredit = async (id) => {
    const data = await getMachine(id)
    data.getCredit = true
    await changeCredit(data)
  }

  const edit = async (id) => {
    await getMachine(id)
    setModalOpen(true)
    setModalType("edit")
  }

  const manageCash = async (machineName, type, quantity) => {
    var totalCash = 0
    var totalPaid = 0
    var formData = new FormData()
    if (shop.cashCredit !== null)
      totalCash = shop.cashCredit
    if (shop.cashCredit !== null)
      totalPaid = shop.cash
    if (type === "pay") {
      totalCash = totalCash - quantity
      formData = createTransaction(machineName, "recarga", -quantity)
      props.sendTransaction(formData)
    }
    else {
      totalCash = totalCash + parseFloat(quantity)
      totalPaid = totalPaid + parseFloat(quantity)
      formData = createTransaction(machineName, "reembolso", quantity)
      props.sendTransaction(formData)
    }
    shop.cashCredit = totalCash
    shop.cash = totalPaid
    const url = "https://multipokerdrf.onrender.com/api/shop/" + shop.id + "/"
    try {
      await props.axios.put(url, shop)
    } catch (error) {
      console.log(error)
    }

  }

  const handleChange = (e) => {
    setName(e.target.value)
  }

  const handleChange1 = async (e) => {
    setGameCash(e.target.value)
  }

  const handleSubmit = async (e, id) => {
    e.preventDefault()
    if (modalType !== "") {
      const data = await getMachine(id)
      await changeCredit(data)
    }
    else {
      const formData = createMachine()
      const url = "https://multipokerdrf.onrender.com/api/machine/"

      const config = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }

      try {
        await props.axios.post(url, formData, config)
        alert("Se procede a agregar la máquina")
        setModalOpen(false)
      } catch (error) {
        console.log(error)
      }
    }
  }

  const eliminar = async (id) => {
    const url = "https://multipokerdrf.onrender.com/api/machine/" + id + "/"
    try {
      const response = await props.axios.delete(url)
      if (response.status === 204)
        alert("Maquina eliminada con exito")
    } catch (error) {
      console.log(error)
    }
  }
  const disconnect = async (id) => {
    const data = await getMachine(id)
    data.assigned = false
    await changeCredit(data)
  }

  const clean = async (id) => {
    const data = await getMachine(id)
    await changeCredit(data)
  }

  useEffect(() => {
    const fetchData = async () => {
      var url = "https://multipokerdrf.onrender.com/api/shop/?userId=" + id
      try {
        var response = await fetch(url)
        if (response.ok) {
          const dataShop = await response.json()
          setShop(dataShop)
          url = "https://multipokerdrf.onrender.com/api/machine/?shopId=" + dataShop.id
          response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            setMachines(data)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    const fetchAllMachines = async () => {
      const url = "https://multipokerdrf.onrender.com/api/machine/"
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setAllMachines(data)
        }
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
    fetchAllMachines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMachines])

  return (
    <div className='container'>
      <div className='row'>
        <div className='d-flex justify-content-end'>
          <Card className="border-0">
            <CardBody>
              <CardTitle tag="h5">
                Créditos
              </CardTitle>
              <CardText className="text-center">
                {shop.cashCredit > 0 ? "$" : ""}{shop.cashCredit}
              </CardText>
            </CardBody>
          </Card>
          <Card className="border-0">
            <CardBody>
              <CardTitle tag="h5">
                Retiros
              </CardTitle>
              <CardText className="text-center">
                {shop.cash > 0 ? "$" : ""}{shop.cash}
              </CardText>
            </CardBody>
          </Card>
        </div>
        <div className='col-7'>
          <Button onClick={(handleClick)}>Agregar Máquina</Button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Button color='info' onClick={(downloadJSON)}>Descargar JSON</Button>
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
                  Recuperar Créditos
                </th>
                <th>
                  Créditos
                </th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr key={machine.id}>
                  <th>
                    {machine.id}
                  </th>
                  <th>
                    {machine.name}
                  </th>
                  <th>
                    <Button outline color="info" onClick={() => getCredit(machine.id)}>
                      <span className="fa fa-minus"></span>
                    </Button>
                  </th>
                  <th>
                    {machine.creditImage && <img src={"data:image/png;base64," + machine.creditImage} height={34} width={100} alt="" />}
                  </th>
                  <th>
                    {machine.creditImage && <Button outline color="secondary" onClick={() => clean(machine.id)}>
                      <span className="fa fa-eraser"></span>
                    </Button>}
                  </th>
                  <th>
                    <Button outline color="success" onClick={() => edit(machine.id)}>
                      <span className="fa fa-plus"></span>
                    </Button>
                  </th>
                  <th>
                    <Button outline color="danger" onClick={() => disconnect(machine.id)}>
                      <span className="fa fa-power-off"></span>
                    </Button>
                  </th>
                  <th>
                    <Button outline color="danger" onClick={() => eliminar(machine.id)}>
                      <span className="fa fa-times"></span>
                    </Button>
                  </th>
                </tr>))}
            </tbody>
          </Table>
          <Modal isOpen={modalOpen} toggle={toggleModal}>
            <ModalHeader> {modalType === "" ? "Agregar" : "Editar"} Máquina
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
                    defaultValue={machine.name}
                  />
                  <Label for="exampleTextBox1">Dinero</Label>
                  <Input onChange={handleChange1}
                    id="exampleTextBox1"
                    name="text"
                    type="number"
                    className='form-control'
                    defaultValue={machine.gameCash}
                  />
                </Row>
                <br></br>
                <Row className="form-group ml-2">
                  <Button type="submit" color="primary" onClick={(e) => handleSubmit(e, machine.id)}>
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

export default Shop