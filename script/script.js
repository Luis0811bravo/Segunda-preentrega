// VARIABLES GLOBALES
let productos = [];
let articulosCarrito = [];

// ELEMENTOS DEL DOM
const productosContainer = document.getElementById('lista-productos');
const carrito = document.querySelector('#carrito');
const contenedorCarrito = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito');

// CARGAR PRODUCTOS CON FETCH
async function cargarProductos() {
    try {
        const response = await fetch('./data/productos.json');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        productos = data.productos;
        
        mostrarProductosEnHTML(productos);
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarError('Error al cargar los productos. Por favor, recarga la página.');
    }
}

// MOSTRAR PRODUCTOS EN EL HTML
function mostrarProductosEnHTML(productosArray) {
    productosContainer.innerHTML = '';
    
    productosArray.forEach((producto) => {
        productosContainer.innerHTML += `
            <div class="producto">
                <h3 class="producto__titulo">${producto.titulo}</h3>
                <div class="producto__imagen">
                    <img src="${producto.imagen}" alt="${producto.titulo}">
                </div>
                <div class="producto__informacion">
                    <p>${producto.descripcion}</p>
                    <p class="precio">Precio: <span class="negritas">$${producto.precio}</span></p>
                </div>
                <button class="agregar-carrito" type="button" data-id="${producto.id}"> 
                    Agregar al carrito
                </button>
            </div>
        `;
    });
}

// MOSTRAR ERRORES
function mostrarError(mensaje) {
    productosContainer.innerHTML = `<div class="error">${mensaje}</div>`;
}

// ENVIAR PEDIDO CON FETCH Y SWEETALERT2
async function enviarPedido() {
    if (articulosCarrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'No tienes productos en tu carrito para realizar el pedido.',
            confirmButtonColor: '#a5965a'
        });
        return;
    }
    
    // Mostrar confirmación antes de enviar
    const confirmResult = await Swal.fire({
        title: '¿Confirmar pedido?',
        text: 'Estás a punto de realizar tu pedido. ¿Deseas continuar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#a5965a',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, enviar pedido',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) {
        return;
    }

    // Mostrar loading mientras se procesa
    Swal.fire({
        title: 'Procesando pedido...',
        text: 'Por favor espera mientras procesamos tu pedido.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Calcular total
        let total = 0;
        articulosCarrito.forEach(producto => {
            total += producto.precio.substring(1,4) * producto.cantidad;
        });
        
        // Crear objeto de pedido
        const pedido = {
            id: Date.now(), // ID único basado en timestamp
            fecha: new Date().toISOString(),
            productos: articulosCarrito,
            total: total,
            estado: 'pendiente'
        };
        
        // Simular llamada API con fetch POST
        const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(pedido)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const resultado = await response.json();
        
        // Mostrar confirmación de éxito
        await Swal.fire({
            icon: 'success',
            title: '¡Pedido enviado exitosamente!',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p><strong>Número de orden:</strong> #${resultado.id}</p>
                    <p><strong>Total pagado:</strong> $${total}</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            `,
            confirmButtonColor: '#a5965a',
            confirmButtonText: 'Aceptar'
        });
        
        // Vaciar carrito después del envío exitoso
        articulosCarrito = [];
        carritoHTML();
        
    } catch (error) {
        console.error('Error al enviar pedido:', error);
        
        // Mostrar error con SweetAlert2
        Swal.fire({
            icon: 'error',
            title: 'Error al procesar el pedido',
            text: 'Hubo un problema al procesar tu pedido. Por favor, inténtalo nuevamente.',
            footer: `<small>Código de error: ${error.message}</small>`,
            confirmButtonColor: '#a5965a',
            confirmButtonText: 'Intentar nuevamente'
        });
    }
}

// OBTENER ESTADO DEL PEDIDO (simulación de consulta a API)
async function consultarPedido(numeroPedido) {
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${numeroPedido}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const pedido = await response.json();
        
        return pedido;
        
    } catch (error) {
        console.error('Error al consultar pedido:', error);
        throw error;
    }
}

// FUNCIONES CARRITO
cargarEventListeners();
function cargarEventListeners() {
    // Cuando agregas un Producto presionando "Agregar al Carrito"
    productosContainer.addEventListener('click', agregarProducto);

    // Elimina productos del carrito
    carrito.addEventListener('click', eliminarProducto);

    // Cargar productos del Local Storage y productos del JSON
    document.addEventListener('DOMContentLoaded', () => {
        articulosCarrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carritoHTML();
        // Cargar productos con fetch
        cargarProductos();
    });

    // Vaciar el carrito
    vaciarCarritoBtn.addEventListener('click', () => {
        articulosCarrito = []; // Reseteamos el arreglo
        limpiarHTML(); // Eliminamos todo el HTML
    });
    
    // Finalizar compra
    const finalizarCompraBtn = document.getElementById('finalizar-compra');
    if (finalizarCompraBtn) {
        finalizarCompraBtn.addEventListener('click', enviarPedido);
    }
}

function agregarProducto(e) {
    const productoSeleccionado = e.target.parentElement;

    if (e.target.classList.contains('agregar-carrito')) {
        leerDatosProducto(productoSeleccionado);
    }
}

function eliminarProducto(e) {
    if (e.target.classList.contains('borrar-producto')) {
        const productoId = e.target.getAttribute('data-id');
        articulosCarrito = articulosCarrito.filter(producto => producto.id !== productoId);
        carritoHTML();
    }
}

function leerDatosProducto(producto) {
    // Crear un objeto con el contenido del producto actual
    const infoProducto = {
        imagen: producto.querySelector('img').src,
        titulo: producto.querySelector('h3').textContent,
        precio: producto.querySelector('.precio span').textContent,
        id: producto.querySelector('button').getAttribute('data-id'),
        cantidad: 1
    };

    // Revisa si un producto ya existe en el carrito
    const existe = articulosCarrito.some(producto => producto.id === infoProducto.id);
    let mensajeAccion = '';

    if (existe) {
        // Actualizamos la cantidad
        const productos = articulosCarrito.map(producto => {
            if (producto.id === infoProducto.id) {
                producto.cantidad++;
                return producto; // Retorna el objeto actualizado
            } else {
                return producto;
            }
        });
        articulosCarrito = [...productos];
        mensajeAccion = 'Cantidad actualizada en el carrito';
    } else {
        // Agregar el producto al carrito
        articulosCarrito = [...articulosCarrito, infoProducto];
        mensajeAccion = 'Producto agregado al carrito';
    }

    // Actualizar el HTML del carrito
    carritoHTML();

    // Mostrar notificación con SweetAlert2
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: mensajeAccion,
        html: `<div style="text-align: left;">
                <strong>${infoProducto.titulo}</strong><br>
                <small>Precio: ${infoProducto.precio}</small>
               </div>`,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        toast: true,
        background: '#f8f9fa',
        color: '#333',
        customClass: {
            popup: 'swal-toast-custom'
        }
    });
};

function carritoHTML() {
    // Limpiar el HTML
    limpiarHTML();

    // Recorre el carrito y genera el HTML
    articulosCarrito.forEach(producto => {
        const { imagen, titulo, precio, cantidad, id } = producto;
        const row = document.createElement('tr');
        let subtotal = producto.precio.substring(1,4) * producto.cantidad;
        row.innerHTML = `
            <td><img src="${imagen}" width="100"></td>
            <td>${titulo}</td>
            <td>${precio}</td>
            <td>${cantidad}</td>
            <td>$${subtotal}</td>
            <td>
                <a href="#" class="borrar-producto" data-id="${id}"> X </a>
            </td>
        `;

        contenedorCarrito.appendChild(row);

        // Actualizar el total
        const totalCarrito = document.getElementById('total-carrito');
        let total = 0;
        articulosCarrito.forEach(producto => {
            total += producto.precio.substring(1,4) * producto.cantidad;
        });
        totalCarrito.textContent = `$${total}`;

    });

    // Agregar el carrito de compras al storage
    sincronizarStorage();
}

function sincronizarStorage() {
    localStorage.setItem('carrito', JSON.stringify(articulosCarrito));
}

function limpiarHTML() {
    while (contenedorCarrito.firstChild) {
        contenedorCarrito.removeChild(contenedorCarrito.firstChild);
    }
    const totalCarrito = document.getElementById('total-carrito');
    totalCarrito.textContent = '$0';
}