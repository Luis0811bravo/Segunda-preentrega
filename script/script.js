// Array de productos
const productos = [
    {
        id: '1',
        titulo: 'Mocha',
        precio: 100,
        descripcion: 'Café con chocolate y crema',
        imagen: "../img/mocha.jpeg"
    },
    {
        id: '2',
        titulo: 'Irish Coffee',
        precio: 200,
        descripcion: 'Café con whisky y crema',
        imagen: "../img/irish.jpeg"
    },
    {
        id: '3',
        titulo: 'Latte',
        precio: 300,
        descripcion: 'Café con leche y espuma' ,
        imagen: "../img/latte.jpeg" 
    },
    {
        id: '4',
        titulo: 'Espresso',
        precio: 400,
        descripcion: 'Café solo con crema',
        imagen: "../img/espresso.jpeg"
    },
    {
        id: '5',
        titulo: 'Americano',
        precio: 500,
        descripcion: 'Café filtrado con agua caliente',
        imagen: "../img/americano.jpeg"
    },
    {
        id: '6',
        titulo: 'Cappuccino',
        precio: 600,
        descripcion: 'Café con leche vaporizada y espuma',
        imagen: "../img/capuchino.jpeg"
    }
];

// MOSTRAR PRODUCTOS EN EL HTML
const productosContainer = document.getElementById('lista-productos');

productos.forEach((producto) => {
    productosContainer.innerHTML += `
        <div class="producto">
            <h2 class="producto__titulo">${producto.titulo}</h2>
            <div class="producto__imagen">
                <img src="${producto.imagen}" alt="${producto.titulo}">
            </div>
            <div class="producto__informacion">
                <p>${producto.descripcion}</p>
                <p class="precio">Precio: <span class="negritas">$${producto.precio}</span></p>
            </div>
            <button class="agregar-carrito" type="button" data-id="${producto.id}"> Agregar al carrito </button>
        </div>
    `;
});


// CARRITO DE COMPRAS
const carrito = document.querySelector('#carrito');
const contenedorCarrito = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito');
const listaProductos = document.querySelector('#lista-productos');
let articulosCarrito = [];

cargarEventListeners();
function cargarEventListeners() {
    // Cuando agregas un Producto presionando "Agregar al Carrito"
    listaProductos.addEventListener('click', agregarProducto);

    // Elimina productos del carrito
    carrito.addEventListener('click', eliminarProducto);

    // Cargar productos del Local Storage
    document.addEventListener('DOMContentLoaded', () => {
        articulosCarrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carritoHTML();
    });

    // Vaciar el carrito
    vaciarCarritoBtn.addEventListener('click', () => {
        articulosCarrito = []; // Reseteamos el arreglo
        limpiarHTML(); // Eliminamos todo el HTML
    });
}

// Funciones
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
    // console.log(producto);

    // Crear un objeto con el contenido del producto actual
    const infoProducto = {
        imagen: producto.querySelector('img').src,
        titulo: producto.querySelector('h2').textContent,
        precio: producto.querySelector('.precio span').textContent,
        id: producto.querySelector('button').getAttribute('data-id'),
        cantidad: 1

    };

    console.log(infoProducto);

    // Revisa si un producto ya existe en el carrito
    const existe = articulosCarrito.some(producto => producto.id === infoProducto.id);

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
    } else {
        // Agregar el producto al carrito
        articulosCarrito = [...articulosCarrito, infoProducto];
    };

    carritoHTML();
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