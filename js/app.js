
const API_URL = "https://rickandmortyapi.com/api/episode";

const formulario = document.querySelector("#formulario-busqueda");
const campoNombre = document.querySelector("#nombre");
const campoTemporada = document.querySelector("#temporada");
const botonBuscar = document.querySelector("#boton-buscar");
const listaEpisodios = document.querySelector("#lista-episodios");
const mensaje = document.querySelector("#mensaje");
const contador = document.querySelector("#contador");

const mostrarMensaje = (texto) => {
    mensaje.textContent = texto;
};

const limpiarResultados = () => {
    listaEpisodios.replaceChildren();
    contador.textContent = "0 episodios";
};

const mostrarValor = (valor) => {
    if (
        valor === null ||
        valor === undefined ||
        String(valor).trim() === "" ||
        String(valor).toLowerCase() === "unknown"
    ) {
        return "Desconocido";
    }

    return valor;
};

const crearTarjeta = (episodio) => {
    const tarjeta = document.createElement("article");
    tarjeta.classList.add("tarjeta");

    const titulo = document.createElement("h3");
    titulo.textContent = mostrarValor(episodio.name);

    const codigo = document.createElement("span");
    codigo.classList.add("codigo-episodio");
    codigo.textContent = mostrarValor(episodio.episode);

    const fecha = document.createElement("p");
    const etiquetaFecha = document.createElement("strong");
    etiquetaFecha.textContent = "Fecha de emisión: ";
    fecha.append(etiquetaFecha);
    fecha.append(document.createTextNode(mostrarValor(episodio.air_date)));

    const personajes = document.createElement("p");
    const etiquetaPersonajes = document.createElement("strong");
    etiquetaPersonajes.textContent = "Cantidad de personajes: ";
    personajes.append(etiquetaPersonajes);
    personajes.append(
        document.createTextNode(
            mostrarValor(episodio.characters.length)
        )
    );

    tarjeta.append(titulo, codigo, fecha, personajes);

    return tarjeta;
};

const mostrarEpisodios = (episodios) => {
    limpiarResultados();

    const tarjetas = episodios.map((episodio) => crearTarjeta(episodio));
    listaEpisodios.append(...tarjetas);

    contador.textContent =
        episodios.length === 1
            ? "1 episodio"
            : `${episodios.length} episodios`;

    mostrarMensaje(
        episodios.length === 0
            ? "No se encontraron episodios con esos criterios."
            : `Se encontraron ${episodios.length} episodios.`
    );
};

const obtenerEpisodios = async (nombre, temporada) => {
    const url = new URL(API_URL);

    if (nombre) {
        url.searchParams.set("name", nombre);
    }

    if (temporada) {
        url.searchParams.set("episode", temporada);
    }

    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    if (respuesta.status === 404) {
        return [];
    }

    if (!respuesta.ok) {
        throw new Error("No fue posible consultar la API.");
    }

    return datos.results || [];
};

const buscarEpisodios = async (nombre, temporada) => {
    botonBuscar.disabled = true;
    botonBuscar.textContent = "Buscando...";
    limpiarResultados();
    mostrarMensaje("Buscando episodios...");

    try {
        const episodios = await obtenerEpisodios(nombre, temporada);
        mostrarEpisodios(episodios);
    } catch (error) {
        limpiarResultados();
        mostrarMensaje(
            "No se pudieron cargar los episodios. Comprueba tu conexión e inténtalo de nuevo."
        );
        console.error("Error al buscar episodios:", error);
    } finally {
        botonBuscar.disabled = false;
        botonBuscar.textContent = "Buscar episodios";
    }
};

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nombre = campoNombre.value.trim();
    const temporada = campoTemporada.value;

    if (!nombre && !temporada) {
        limpiarResultados();
        mostrarMensaje(
            "Escribe un nombre o selecciona una temporada antes de buscar."
        );
        return;
    }

    const busqueda = { nombre, temporada };

    localStorage.setItem("ultimaBusquedaEpisodios", JSON.stringify(busqueda));

    buscarEpisodios(nombre, temporada);
});

const restaurarBusqueda = () => {
    const guardado = localStorage.getItem("ultimaBusquedaEpisodios");

    if (!guardado) {
        return;
    }

    try {
        const busqueda = JSON.parse(guardado);

        campoNombre.value = busqueda.nombre || "";
        campoTemporada.value = busqueda.temporada || "";

        if (campoNombre.value.trim() || campoTemporada.value) {
            buscarEpisodios(
                campoNombre.value.trim(),
                campoTemporada.value
            );
        }
    } catch (error) {
        localStorage.removeItem("ultimaBusquedaEpisodios");
        console.error("No se pudo restaurar la búsqueda:", error);
    }
};

restaurarBusqueda();
