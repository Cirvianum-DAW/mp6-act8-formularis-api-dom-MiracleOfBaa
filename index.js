// Selección de elementos y definición de variables
const eliminarCiudadButton = document.querySelectorAll('.eliminar-ciudad-btn') // Botones para eliminar ciudades

// URLs y claves de la API
const URL_JSON_SERVER = 'http://localhost:5000/ciudades' // URL del servidor JSON
const API_KEY = '859fe3de587a43b4865211338242502' // Clave de la API del clima
const URL_WEATHER_API = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}` // URL de la API del clima

// Variables para almacenar datos de la ciudad y la búsqueda
let lugar = '' // Nombre de la ciudad a buscar
var busqueda = '' // Variable de búsqueda

// Manejador de eventos para la búsqueda de ciudades
document
  .getElementById('buscar-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault() // Evitar el envío del formulario y la recarga de la página
    lugar = document.getElementById('search').value // Obtener el valor de la entrada de búsqueda
    mostrarDatosClima() // Mostrar los datos del clima para la ciudad ingresada
  })

// Función asincrónica para obtener los datos del clima
async function obtenerDatosClima () {
  try {
    // Verificar si se ingresó una ciudad
    if (lugar === '') {
      console.error('No se ingresó una ciudad')
      return null
    }

    let ciudades = await buscarCiudadEnJson(lugar) // Buscar la ciudad en el servidor JSON
    let ciudad_api // Variable para almacenar los datos de la ciudad desde la API del clima

    // Verificar si la ciudad no se encontró en el servidor JSON
    if (ciudades.length === 0) {
      console.log('No se encontró la ciudad en el JSON')
      ciudad_api = await buscarCiudadDesdeAPI(lugar) // Buscar la ciudad en la API del clima
    }

    const ciudad = {} // Objeto para almacenar los datos de la ciudad

    // Verificar si la ciudad no se encontró en el servidor JSON
    if (ciudades.length === 0) {
      // Asignar los datos de la ciudad desde la API del clima
      ciudad.nombre = ciudad_api.location.name
      ciudad.temperatura = ciudad_api.current.temp_c
      ciudad.velocidadViento = ciudad_api.current.wind_kph
      ciudad.descripcionClima = ciudad_api.current.condition.text
      await agregarCiudadAlJson(ciudad) // Agregar la ciudad al servidor JSON
    } else {
      // Asignar los datos de la ciudad desde el servidor JSON
      ciudad.nombre = ciudades[0].nombre
      ciudad.temperatura = ciudades[0].temperatura
      ciudad.velocidadViento = ciudades[0].velocidadViento
      ciudad.descripcionClima = ciudades[0].descripcionClima
    }
    return ciudad // Devolver los datos de la ciudad
  } catch (error) {
    console.error('Error al obtener los datos del clima:', error)
    alert('No se encontró la ciudad ingresada')
    return null
  }
}

// Función asincrónica para agregar una ciudad al servidor JSON
async function agregarCiudadAlJson (ciudad) {
  let ciudadEnJson = await buscarCiudadEnJson(ciudad.nombre) // Buscar la ciudad en el servidor JSON
  if (ciudadEnJson.length > 0) {
    console.log('La ciudad ya existe')
    return
  }
  try {
    // Enviar una solicitud POST para agregar la ciudad al servidor JSON
    const response = await fetch(URL_JSON_SERVER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ciudad)
    })
    const data = await response.json() // Convertir la respuesta a JSON
    console.log('Ciudad agregada:', data)
    return data // Devolver los datos de la ciudad agregada
  } catch (error) {
    console.error('Error al agregar la ciudad:', error)
    return null
  }
}

// Función asincrónica para buscar una ciudad en el servidor JSON
async function buscarCiudadEnJson (nombreCiudad) {
  try {
    // Enviar una solicitud GET para buscar la ciudad en el servidor JSON
    const response = await fetch(`${URL_JSON_SERVER}?nombre=${nombreCiudad}`)
    return await response.json() // Devolver los datos de la ciudad encontrada en JSON
  } catch (error) {
    console.error('Error al buscar ciudad en JSON:', error)
    return null
  }
}

// Función asincrónica para buscar una ciudad en la API del clima
async function buscarCiudadDesdeAPI (nombreCiudad) {
  try {
    // Enviar una solicitud GET para buscar la ciudad en la API del clima
    const response = await fetch(`${URL_WEATHER_API}&q=${nombreCiudad}`)
    return await response.json() // Devolver los datos de la ciudad encontrada en la API del clima
  } catch (error) {
    console.error('Error al buscar ciudad desde la API:', error)
    return null
  }
}

// Función asincrónica para eliminar una ciudad del servidor JSON
async function eliminarCiudad (id) {
  try {
    // Enviar una solicitud DELETE para eliminar la ciudad del servidor JSON
    await fetch(`${URL_JSON_SERVER}/${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error al eliminar la ciudad:', error)
  }
}

// Función para mostrar los datos del clima
async function mostrarDatosClima () {
  const datosClima = await obtenerDatosClima() // Obtener los datos del clima para la ciudad ingresada
  console.log('Datos clima -> ')
  console.log(datosClima)
  if (datosClima) {
    mostrarDatos(datosClima)
  }
}

// Manejador de eventos para el botón de eliminar ciudad
document
  .getElementById('eliminar-ciudad-btn')
  .addEventListener('click', async function (event) {
    event.preventDefault() // Evitar el comportamiento predeterminado del botón
    let jsonciudad = await buscarCiudadEnJson(
      document.getElementById('lugar').value
    ) // Buscar la ciudad en el servidor JSON
    console.log('Json ciudad -> ' + jsonciudad[0].id)
    await eliminarCiudad(jsonciudad[0].id) // Eliminar la ciudad del servidor JSON
    // Borrar datos de la ciudad
    mostrarDatos({
      nombre: '',
      temperatura: '',
      velocidadViento: '',
      descripcionClima: ''
    })
    window.location.reload() // Recargar la página para reflejar los cambios
  })

// Manejador de eventos para el botón de crear ciudad
document
  .getElementById('crear-ciudad-btn')
  .addEventListener('click', async function (event) {
    event.preventDefault() // Evitar el comportamiento predeterminado del botón
    let ciudad = {
      nombre: document.getElementById('lugar').value,
      temperatura: parseFloat(document.getElementById('temperatura').value),
      velocidadViento: parseFloat(document.getElementById('viento').value),
      descripcionClima: document.getElementById('clima').value
    }
    await agregarCiudadAlJson(ciudad) // Agregar la ciudad al servidor JSON
    mostrarDatos(ciudad)
  })

// Manejador de eventos para el botón de editar ciudad
document
  .getElementById('editar-ciudad-btn')
  .addEventListener('click', async function (event) {
    event.preventDefault() // Evitar el comportamiento predeterminado del botón
    let ciudad = {
      nombre: document.getElementById('lugar').value,
      temperatura: parseFloat(document.getElementById('temperatura').value),
      velocidadViento: parseFloat(document.getElementById('viento').value),
      descripcionClima: document.getElementById('clima').value
    }
    let jsonciudad = await buscarCiudadEnJson(
      document.getElementById('lugar').value
    ) // Buscar la ciudad en el servidor JSON
    // Enviar una solicitud PUT para modificar la ciudad en el servidor JSON
    await fetch(`${URL_JSON_SERVER}/${jsonciudad[0].id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ciudad)
    })
    mostrarDatos(ciudad)
  })

// Función para mostrar los datos de la ciudad
async function mostrarDatos (ciudad) {
  // Actualizar los elementos HTML con los datos de la ciudad
  document.getElementById('p_nombre-lugar').innerText = ciudad.nombre
  document.getElementById(
    'p_temperatura'
  ).innerText = `Temperatura: ${ciudad.temperatura} °C`
  document.getElementById(
    'p_viento'
  ).innerText = `Velocidad del viento: ${ciudad.velocidadViento} km/h`
  document.getElementById(
    'p_clima'
  ).innerText = `Descripción del clima: ${ciudad.descripcionClima}`
  // Actualizar los campos de entrada con los datos de la ciudad
  document.getElementById('lugar').value = ciudad.nombre
  document.getElementById('temperatura').value = ciudad.temperatura
  document.getElementById('viento').value = ciudad.velocidadViento
  document.getElementById('clima').value = ciudad.descripcionClima
}
