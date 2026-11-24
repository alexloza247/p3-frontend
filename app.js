const API_URL = "https://p3-api-nube.onrender.com/api/productos"; 
const API_KEY = "holaMundo67"; // solo para la práctica 

const mensaje = document.getElementById("mensaje");
const resultados = document.getElementById("resultados");
const btnSubmit = document.querySelector("#formProducto button");
let idEditando = null;

async function listar() {
  mensaje.textContent = "Cargando...";
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error(`código ${respuesta.status}`);
    const productos = await respuesta.json();

    resultados.innerHTML = productos.map(p => `
      <article class="tarjeta">
        <h3>${p.nombre}</h3>
        <p>Precio: $${p.precio} | Stock: ${p.stock}</p>
        <button class="editar" data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio}" data-stock="${p.stock}">Editar</button>
        <button class="eliminar" data-id="${p.id}">Eliminar</button>
      </article>
    `).join("");

    mensaje.textContent = `${productos.length} producto(s)`;
  } catch (error) {
    mensaje.textContent = "No se pudo conectar con la API: " + error.message;
  }
}

async function peticionProtegida(url, metodo, datos) {
  const respuesta = await fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: datos ? JSON.stringify(datos) : undefined
  });
  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.errores ? error.errores.join(", ") : error.error);
  }
}

document.getElementById("formProducto").addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = {
    nombre: document.getElementById("txtNombre").value.trim(),
    precio: Number(document.getElementById("txtPrecio").value),
    stock: parseInt(document.getElementById("txtStock").value, 10)
  };
  try {
    if (idEditando) {
      await peticionProtegida(`${API_URL}/${idEditando}`, "PUT", datos);
      idEditando = null;
      btnSubmit.textContent = "Agregar";
    } else {
      await peticionProtegida(API_URL, "POST", datos);
    }
    e.target.reset();
    listar();
  } catch (error) {
    mensaje.textContent = "No se pudo guardar: " + error.message;
  }
});

resultados.addEventListener("click", async (e) => {
  if (e.target.classList.contains("eliminar")) {
    try {
      await peticionProtegida(`${API_URL}/${e.target.dataset.id}`, "DELETE");
      listar();
    } catch (error) {
      mensaje.textContent = "No se pudo eliminar: " + error.message;
    }
  }

  if (e.target.classList.contains("editar")) {
    const { id, nombre, precio, stock } = e.target.dataset;
    document.getElementById("txtNombre").value = nombre;
    document.getElementById("txtPrecio").value = precio;
    document.getElementById("txtStock").value = stock;
    idEditando = id;
    btnSubmit.textContent = "Actualizar";
  }
});

listar();
