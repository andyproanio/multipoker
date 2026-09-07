import React, { useState, useEffect } from 'react'
import { Form, FormGroup, Label, Input, Table, Button, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { useDateFormat } from '../hooks/useDateFormat'
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Inventario = () => {
  const [mes, setmes] = useState(localStorage.getItem('mes') || "")
  const [anio, setanio] = useState(localStorage.getItem('anio') || "")
  const [fecha, setFecha] = useState(localStorage.getItem('fecha') || "")
  const [fechaFin, setFechaFin] = useState(localStorage.getItem('fechaFin') || "")
  const [inventario, setinventario] = useState(() => JSON.parse(localStorage.getItem('facturas')) || [])
  const pagina = parseInt(window.location.pathname.split("/").pop())
  const navigate = useNavigate()
  const location = useLocation()
  const { id, type } = location.state

  const DateFormat = (date) => {
    const { dateFormat } = useDateFormat(date)
    return dateFormat
  }

  const JsonToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Productos');

    worksheet.columns = [
      { header: 'id', key: 'id' },
      { header: 'fecha', key: 'date' },
      { header: 'Remitente', key: 'trader' },
      { header: 'Cliente', key: 'client' },
      { header: 'Tipo', key: 'type' },
      { header: 'Cantidad', key: 'cash' },
    ];

    const formatoMoneda = '"$"#,##0.00'

    inventario.forEach((item) => {
      const [datePart, hourPart] = item.date.split('T')
      const [year, month, day] = datePart.split('-')
      const hora = hourPart.substring(0, 8)
      const fila = worksheet.addRow({
        ...item, date: day + "/" + month + "/" + year + ", " + hora
      });
      fila.getCell(6).numFmt = formatoMoneda;
    });

    const ultimaFilaDatos = inventario.length + 1;
    const filaTotalNro = ultimaFilaDatos + 1;
    const filaTotal = worksheet.getRow(filaTotalNro);

    filaTotal.getCell(5).value = 'Total Acreditado';

    filaTotal.getCell(6).value = { formula: `SUBTOTAL(9, F2:F${ultimaFilaDatos})` };
    filaTotal.getCell(6).numFmt = formatoMoneda;

    filaTotal.font = { bold: true };
    filaTotal.getCell(5).alignment = { horizontal: 'right' };

    worksheet.columns.forEach((column) => {
      let maxLongitud = 0;

      column.eachCell({ includeEmpty: true }, (cell) => {
        let valorTexto = '';

        if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'object' && cell.value.formula) {
            valorTexto = 'TOTAL';
          } else if (cell.numFmt === formatoMoneda && typeof cell.value === 'number') {
            valorTexto = `$${cell.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          } else {
            valorTexto = cell.value.toString();
          }
        }

        if (valorTexto.length > maxLongitud) {
          maxLongitud = valorTexto.length;
        }
      });

      column.width = maxLongitud < 12 ? 12 : maxLongitud;
    });

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: ultimaFilaDatos, column: 6 }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Transacciones.xlsx');
  }

  useEffect(() => {
    localStorage.setItem("fecha", "")
    localStorage.setItem("fechaFin", "")
    localStorage.setItem("anio", "Seleccione")
    localStorage.setItem("mes", "")
    const fetchData = async () => {
      const clientName = fetchName("")
      var url = "https://multipokerdrf.onrender.com/api/transaction/"
      if (type !== "admin")
        url = url + "?userId=" + id + "&clientname=" + clientName
      else
        url = url + "?clientType=machine"
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          AddColumn(data)
        }
      } catch (error) {
        console.log(error)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInput = (e) => {
    localStorage.removeItem("mes")
    localStorage.setItem("fecha", "")
    localStorage.setItem("fechaFin", "")
    setFecha("")
    setFechaFin("")
    const mesElegido = e.target.value
    setmes(mesElegido)
    if (anio !== "")
      getData(mesElegido, anio, "", "")
  }

  const handleInput1 = (e) => {
    localStorage.removeItem("anio")
    localStorage.setItem("fecha", "")
    localStorage.setItem("fechaFin", "")
    localStorage.setItem("mes", "")
    setFecha("")
    setFechaFin("")
    setmes("")
    const anioElegido = e.target.value
    setanio(anioElegido)
    getData("", anioElegido, "", "")
  }

  const handleChange = (e) => {
    localStorage.removeItem("fecha")
    localStorage.setItem("anio", "")
    localStorage.setItem("mes", "")
    localStorage.setItem("fechaFin", "")
    setmes("")
    setanio("Seleccione")
    setFechaFin("")
    setFecha(e.target.value);
    getData("", "", e.target.value, "")
  }

  const handleChange1 = (e) => {
    localStorage.removeItem("fechaFin")
    localStorage.setItem("anio", "")
    localStorage.setItem("mes", "")
    setmes("")
    setanio("Seleccione")
    setFechaFin(e.target.value);
    if (fecha !== "")
      getData("", "", fecha, e.target.value)
  }

  const getData = async (mesElegido, anioElegido, fechaElegida, fechaFinElegida) => {
    navigate("/inventario/" + pagina, { state: location.state })
    const clientName = fetchName("")
    var url = "https://multipokerdrf.onrender.com/api/transaction/"
    if (type !== "admin")
      url = url + "?userId=" + id + "&clientname=" + clientName
    else if (type === "retail") {
      url = url + "?clientType=admin"
    }
    if (fechaElegida !== "") {
      url = url + "&initDate=" + fechaElegida + "&endDate=" + fechaElegida
      if (fechaFinElegida !== "")
        url = url.replace("&endDate=" + fechaElegida, "&endDate=" + fechaFinElegida)
    }
    else {
      if (anioElegido !== "") {
        url = url + "&year=" + anioElegido
        if (mesElegido !== "")
          url = url + "&month=" + mesElegido
      }
      else
        setinventario([])
    }
    try {
      const response = await fetch(url)
      if (response.ok) {
        const facturas = await response.json()
        AddColumn(facturas)
        if (facturas.length === 0)
          alert("No hay transferencias para la fecha elegida")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchName= async (userId) => {
    if(userId === "")
      userId = id
    var url = "https://multipokerdrf.onrender.com/api/user/" + userId
    try {
      var response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.type === "admin")
          return "Administrador"
        else {
          if (data.type === "shop")
            url = "https://multipokerdrf.onrender.com/api/shop/?userId=" + userId
          else
            url = "https://multipokerdrf.onrender.com/api/retail/?userId=" + userId
          response = await fetch(url)
          if (response.ok) {
            const dataUser = await response.json()
            return dataUser.name
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const AddColumn = async (data) => {
    const newData = await Promise.all(
      data.map(async (fila) => {
        const traderName = await fetchName(fila.userId)
        return { ...fila, trader: traderName }
      })
    )
    setinventario(newData)
  }

  const changePage = () => {
    localStorage.setItem("fecha", fecha)
    var textDate = ""
    if (fecha !== "")
      textDate = new Date(Date.parse(fecha.replace(/-/g, '/'))).toLocaleDateString("es", {
        year: 'numeric', month: '2-digit', day: '2-digit'
      })
    localStorage.setItem("textDate", textDate)
    localStorage.setItem("fechaFin", fechaFin)
    var textDate1 = ""
    if (fechaFin !== "")
      textDate1 = new Date(Date.parse(fechaFin.replace(/-/g, '/'))).toLocaleDateString("es", {
        year: 'numeric', month: '2-digit', day: '2-digit'
      })
    localStorage.setItem("textDate1", textDate1)
    localStorage.setItem("mes", mes)
    var textMonth = ""
    switch (mes) {
      case "1":
        textMonth = "Enero"
        break
      case "2":
        textMonth = "Febrero"
        break
      case "3":
        textMonth = "Marzo"
        break
      case "4":
        textMonth = "Abril"
        break
      case "5":
        textMonth = "Mayo"
        break
      case "6":
        textMonth = "Junio"
        break
      case "7":
        textMonth = "Julio"
        break
      case "8":
        textMonth = "Agosto"
        break
      case "9":
        textMonth = "Septiembre"
        break
      case "10":
        textMonth = "Octubre"
        break
      case "11":
        textMonth = "Noviembre"
        break
      case "12":
        textMonth = "Diciembre"
        break
      default:
        textMonth = "Seleccione"
        break
    }
    localStorage.setItem("textMonth", textMonth)
    localStorage.setItem("anio", anio)
    localStorage.setItem("facturas", JSON.stringify(inventario))
  }

  const RenderCeldas = ({ i }) => {
    return (
      inventario.length > 0 ? <tr>
        <td>
          {inventario[(pagina - 1) * 10 + i].id}
        </td>
        <td>
          {DateFormat(inventario[(pagina - 1) * 10 + i].date)}
        </td>
        <td>
          {inventario[(pagina - 1) * 10 + i].trader}
        </td>
        <td>
          {inventario[(pagina - 1) * 10 + i].client}
        </td>
        <td>
          {inventario[(pagina - 1) * 10 + i].type}
        </td>
        <td>
          {inventario[(pagina - 1) * 10 + i].cash < 0 ? `-$${Math.abs(inventario[(pagina - 1)
            * 10 + i].cash)}` : `$${inventario[(pagina - 1) * 10 + i].cash}`}
        </td>
      </tr> : null
    )
  }

  const celdas = Array.from({ length: 10 }, (_, i) => (
    <RenderCeldas i={i} />
  ))

  const celdasFaltantes = Array.from({ length: inventario.length % 10 }, (_, i) => (
    <RenderCeldas i={i} />
  ))

  const newLength = () => {
    if (inventario.length % 10 !== 0)
      return 1
    else
      return 0
  }

  const paginas = Array.from({ length: (inventario.length / 10 + newLength()) }, (_, i) => (
    i + 1 === pagina ? <PaginationItem active>
      <PaginationLink tag={Link} to={"/inventario/" + (i + 1)} state={location.state}>
        {i + 1}
      </PaginationLink>
    </PaginationItem> : <PaginationItem>
      <PaginationLink tag={Link} to={"/inventario/" + (i + 1)} state={location.state}>
        {i + 1}
      </PaginationLink>
    </PaginationItem>
  ))

  return (
    <>
      <div className='container'>
        <div className='row'>
          <div className='col-7'>
            <Form>
              <FormGroup className='d-flex justify-content-around'>
                <div className='p-2 mt-3'>
                  <Label for="exampleTextBox">
                    Fecha Inicio
                  </Label>
                  {pagina === 1 ? <Input onChange={handleChange}
                    id="exampleTextBox"
                    name="text"
                    type="date"
                    value={localStorage.getItem('fecha')}
                  ></Input> : <Input disabled
                    className='w-75'
                    value={localStorage.getItem('textDate')}
                  ></Input>}
                </div>
                <div className='p-2 mt-3'>
                  <Label for="exampleTextBox">
                    Fecha Fin
                  </Label>
                  {pagina === 1 ? <Input onChange={handleChange1}
                    id="exampleTextBox"
                    name="text"
                    type="date"
                    value={localStorage.getItem('fechaFin')}
                  ></Input> : <Input disabled
                    className='w-75'
                    value={localStorage.getItem('textDate1')}
                  ></Input>}
                </div>
                <div className='p-2'>
                  <Label for="exampleSelect" className='mt-3'>
                    Escoja el mes
                  </Label>
                  {pagina === 1 ? <Input onChange={handleInput}
                    id="exampleSelect"
                    name="select"
                    type="select"
                    value={localStorage.getItem('mes')}
                  >
                    <option value={""}>
                      Seleccione
                    </option>
                    <option value={1}>
                      Enero
                    </option>
                    <option value={2}>
                      Febrero
                    </option>
                    <option value={3}>
                      Marzo
                    </option>
                    <option value={4}>
                      Abril
                    </option>
                    <option value={5}>
                      Mayo
                    </option>
                    <option value={6}>
                      Junio
                    </option>
                    <option value={7}>
                      Julio
                    </option>
                    <option value={8}>
                      Agosto
                    </option>
                    <option value={9}>
                      Septiembre
                    </option>
                    <option value={10}>
                      Octubre
                    </option>
                    <option value={11}>
                      Noviembre
                    </option>
                    <option value={12}>
                      Diciembre
                    </option>
                  </Input> : <Input disabled
                    className='w-75'
                    value={localStorage.getItem('textMonth')}
                  ></Input>}
                </div>
                <div className='p-2'>
                  <Label for="exampleSelect" className='mt-3'>
                    Escoja el año
                  </Label>
                  {pagina === 1 ? <Input onChange={handleInput1}
                    id="exampleSelect"
                    name="select"
                    type="select"
                    value={localStorage.getItem('anio')}
                  >
                    <option>
                      Seleccione
                    </option>
                    <Options />
                  </Input> : <Input disabled
                    className='w-75'
                    value={localStorage.getItem('anio')}
                  ></Input>}
                </div>
              </FormGroup>
            </Form>
          </div>
          {inventario.length > 0 ? <div className='col-5 mt-4'>
            <Button className='mt-3' style={{ backgroundColor: "#4CAF50" }}
              onClick={JsonToExcel} size="lg" >Exportar a Excel</Button>
          </div> : null}
        </div>
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
                fecha
              </th>
              <th>
                Remitente
              </th>
              <th>
                Cliente
              </th>
              <th>
                Tipo
              </th>
              <th>
                Cantidad
              </th>
            </tr>
          </thead>
          {pagina <= (inventario.length / 10) ? <tbody>
            {celdas}
          </tbody> : <tbody>
            {celdasFaltantes}
          </tbody>}
        </Table>
        {inventario.length > 0 ? <Pagination onClick={changePage}
          aria-label="Page navigation example"
          size="sm"
        >
          <PaginationItem>
            <PaginationLink
              first
              tag={Link}
              to={"/inventario/1"}
              state={location.state}
            />
          </PaginationItem>
          {pagina - 1 > 0 ? <PaginationItem>
            <PaginationLink
              tag={Link}
              to={"/inventario/" + (pagina - 1)}
              state={location.state}
              previous
            />
          </PaginationItem> : <PaginationItem disabled>
            <PaginationLink
              previous
            />
          </PaginationItem>
          }
          {paginas}
          {pagina + 1 <= paginas.length ? <PaginationItem>
            <PaginationLink
              tag={Link}
              to={"/inventario/" + (pagina + 1)}
              state={location.state}
              next
            />
          </PaginationItem> : <PaginationItem disabled>
            <PaginationLink
              next
            />
          </PaginationItem>
          }
          <PaginationItem>
            <PaginationLink
              tag={Link}
              to={"/inventario/" + paginas.length}
              state={location.state}
              last
            />
          </PaginationItem>
        </Pagination> : null}
      </div>
    </>
  )
}

const Options = () => {

  let years = Array.from(new Array(16), (val, index) => index + 2024);
  return (
    years.map((year) => {
      return <option>{year}</option>
    }))
}

export default Inventario