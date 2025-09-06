const carrito = document.querySelector('#carrito');
const contenedorCarrito = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito');
const listaProductos = document.querySelector('#lista-productos');

cargarEventListeners();
function cargarEventListeners() {
    // Cuando agregas un curso presionando "Agregar al Carrito"
    listaProductos.addEventListener('click', agregarCurso);

}

// Funciones
function agregarCurso(e) {
    const productoSeleccionado = e.target.parentElement.parentElement;
    if (e.target.classList.contains('agregar-carrito')) {
        leerDatosProducto(productoSeleccionado);
    }
}

function leerDatosProducto(producto) {
    console.log(producto);
}


