const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
const messagesDiv = document.getElementById('messages');

ws.onmessage = event => {
    messagesDiv.innerHTML += `<p>${event.data}</p>`;
};

document.addEventListener('DOMContentLoaded', () => {
    
    // Manejo de pestañas dinámicas en request_managment.php
    const tabs = document.querySelectorAll(".nav-link");
    const contents = document.querySelectorAll(".content-tab");

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", (event) => {
            event.preventDefault();

            // Remueve la clase 'active' de todas las pestañas
            tabs.forEach(item => item.classList.remove("active"));
            // Oculta todos los contenidos
            contents.forEach(content => content.classList.add("d-none"));

            // Activa la pestaña y muestra el contenido correspondiente
            tab.classList.add("active");
            contents[index].classList.remove("d-none");
        });
    });

    // Filtro de búsqueda en la lista de resultados
    $("#search").on("keyup", function() {
        let value = $(this).val().toLowerCase();
        $("#results li").each(function() {
            $(this).toggle($(this).text().toLowerCase().includes(value));
        });
    });

   
});

// Botones iniciar/detener

document.addEventListener('DOMContentLoaded', function() {
    const botonesInicioDetener = document.getElementById('botonesInicioDetener');
    const botonesPausarReiniciar = document.getElementById('botonesPausarReiniciar');

    // Evento para el botón Iniciar
    document.getElementById('btnIniciar').addEventListener('click', function() {
        botonesInicioDetener.innerHTML = `
            <button type="button" id="btnDetener" class="btn btn-detener btn-lg">
                <img src="assets/img/detener.png" class="icono me-2"> Detener
            </button>
        `;

        // Evento para el botón Detener
        document.getElementById('btnDetener').addEventListener('click', function() {
            botonesInicioDetener.innerHTML = `
                <button type="button" id="btnIniciar" class="btn btn-success btn-lg">
                    <img src="assets/img/iniciar.png" class="icono me-2"> Iniciar
                </button>
            `;

            // Volver a agregar el evento al botón Iniciar
            document.getElementById('btnIniciar').addEventListener('click', arguments.callee);
        });
    });

    // Evento para el botón Pausar
    document.getElementById('btnPausar').addEventListener('click', function() {
        botonesPausarReiniciar.innerHTML = `
            <button type="button" id="btnReiniciar" class="btn btn-reiniciar btn-lg">
                <img src="assets/img/reiniciar.png" class="icono me-2"> Reiniciar
            </button>
        `;

        // Evento para el botón Reiniciar
        document.getElementById('btnReiniciar').addEventListener('click', function() {
            botonesPausarReiniciar.innerHTML = `
                <button type="button" id="btnPausar" class="btn btn-warning btn-lg">
                    <img src="assets/img/pausa.png" class="icono me-2"> Pausar
                </button>
            `;

            // Volver a agregar el evento al botón Pausar
            document.getElementById('btnPausar').addEventListener('click', arguments.callee);
        });
    });
});

async function crearProyecto() {
    const id = document.getElementById('sale_order').value;
    const nombre= document.getElementById('project_name').value;
    const fecha_alta= document.getElementById('fecha_alta').value;

    const datos={
        id: id,
        nombre: nombre,
        fecha_alta: fecha_alta
    };

    try {
        const respuesta = await fetch("http://127.0.0.1:8000/proyectos/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });
        
        if(!respuesta.ok){
            const error=await respuesta.json();
            alert("Error: "+ (error.detail || "No se pudo crear el proyecto"));
            return;
        }
        const resultado = await respuesta.json();
        alert("Proyecto creado con éxito: "+ resultado.nombre);

        //limpiamos los campos
        document.getElementById('sale_order').value = "";
        document.getElementById('project_name').value = "";
        document.getElementById('fecha_alta').value = "";
        location.reload();
    } catch (error){
        console.error("Error de red o de backend: ", error);
        alert("No se pudo conecta con el servidor");
    }

}

async function modificarCNC(proyecto_id){
    const cnc=document.getElementById('cncSelect').value;//tomamos el valor que tenga el select
        
    if (cnc ==="Selecciona"){
        alert("Error. Selecciona un CNC.")
        return;   
    }
    //Hacemos una consulta para pedir todas las maquinas que tenemos en la db
    const respMaquinas = await fetch("http://127.0.0.1:8000/maquinas", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })

    //generamos otra variable que guardé la consulta anterior en formato json
    const maquinas= await respMaquinas.json();

    //for each que recorre el array generado buscando el que coincida con el nombre, al encontrarlo copia el valor (id y nombre)
    const id_maquina= maquinas.find(maq=>maq.nombre===cnc);

    if(!id_maquina){
        alert("No se encontró la máquina seleccionada.");
        return;
    }

    const datos={
        maquina_id: id_maquina.id
    };    
        
    try{
        console.log(datos)
        console.log(proyecto_id)

        const resp = await fetch(`http://127.0.0.1:8000/actMaquina/${proyecto_id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        });

        if(!resp.ok){
            const resultado= await resp.json();
            alert("Error: "+ (error.detail || "Ingreso de máquina erróneo."));
            return;
        }
        
        const resultado=await resp.json();
        alert("CNC seleccionado con éxito.");
        location.reload();

    }catch(error){
        console.error("Error de red o de backend: ", error);
        alert("No se pudo conecta con el servidor");
    }
}

//Funcion para mostrar la tabla de pendientes
document.addEventListener("DOMContentLoaded", function(){
    fetch("http://localhost:8000/pendientes/")
    .then(response => response.json())
    .then(data=>{
        const tbody = document.querySelector("#pendientes tbody");
        tbody.innerHTML = "";
        data.forEach(pendiente =>{
            console.log("Pendiente recibido:", pendiente); // 👈 Verifica la estructura aquí

            const tr = document.createElement("tr");
            tr.innerHTML =`
            <td>${pendiente.id}</td>
            <td>${pendiente.nombre}</td>
            <td>${new Date(pendiente.fecha_alta).toLocaleString()}</td>
            <td>${pendiente.maquina}</td>
            <td>
                <button 
                    type="button" 
                    data-bs-toggle="modal"
                    data-bs-target="#editarPendiente" 
                    class="btn-espaciado"
                    data-id="${pendiente.id}" 
                    data-nombre="${pendiente.nombre}" 
                    data-fecha="${pendiente.fecha_alta}"
                    data-maquina="${pendiente.maquina}">
                        <img src="assets/img/editar.png" class="icono">
                </button>
                <button type="button" data-bs-toggle="modal" data-bs-target="#miModal" class="btn-espaciado">
                    <img src="assets/img/eliminar.png" class="icono">
                </button>

            </td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error=> console.error("Error cargando los datos: ", error));

});

//funcion para mostrar el modal dando clic en el boton editar
document.addEventListener("DOMContentLoaded", function () {
    const btnMostrarModal = document.getElementById("btnMostrarModal");

    if (btnMostrarModal) {
        btnMostrarModal.addEventListener("click", function () {
            const modal = new bootstrap.Modal(document.getElementById("editarPendiente"));
            modal.show();
        });
    }
});


//funcion para editar pendiente
document.addEventListener("DOMContentLoaded", function() {
    const modalEditar = document.getElementById("editarPendiente");
    const select = document.getElementById("cncSelect");

     //activamos o desactivamos el campo si es que el usuario selecciona el cnc dentro del modal
    select.addEventListener("change", hab_deshab_Campos);
    select.addEventListener("change", actualiza_campo_fecha);
    

    modalEditar.addEventListener("show.bs.modal", function(event) {
       
        const button = event.relatedTarget.closest("button");
        const id = button.getAttribute("data-id");
        const nombre = button.getAttribute("data-nombre");
        const fecha = button.getAttribute("data-fecha");
        const maquina = button.getAttribute("data-maquina");

        console.log("Modal abierto con ID:", id, "Nombre:", nombre, "Fecha:", fecha, "maquina:", maquina);
        // Asigna los valores al formulario del modal
        document.getElementById("sale_order_edPend").value = id;
        document.getElementById("project_name_edPend").value = nombre;
        document.getElementById("fecha_alta_edPend").value = new Date(fecha).toLocaleString();
        
        
        //toma el valor de maquina y compara que tenga un valor y que sea diferente de "selecciona"
        if(maquina && maquina!=="Selecciona"){
            select.value=maquina;
            select.disabled=true;
        }else{//si no se cumple la condicion de arriba deja el campo en selecciona y no se bloquea
            select.value="Selecciona";
            select.disabled=false;
        }   
        
        hab_deshab_Campos(); //llamada a la funcion para habilitar o deshabilitar los campos segun sea el caso
        actualiza_campo_fecha(); //llamada a la funcion para actualizar el campo de fecha inicio
        protegerCampoFechaInicio();//llamada a la funcion para proteger el campo de fecha inicio
        
        document.getElementById("btnEnviarEditar").setAttribute("data-id", id);    
    
    });
});


document.addEventListener("DOMContentLoaded", function (){
    const btnEnviarEditar=document.getElementById("btnEnviarEditar");

    btnEnviarEditar.addEventListener("click", async function() {
        const proyecto_id=btnEnviarEditar.getAttribute("data-id");
        await modificarCNC(proyecto_id);
        await agregarHoraInicio(proyecto_id);
    });
});


function obtenerHora(){
    const ahora= new Date(); //pasamos la fecha real a la variable ahora 
    const año = ahora.getFullYear();//obtenemos el año
    const mes = String(ahora.getMonth()+1).padStart(2,'0');//obtenemos el mes y le sumamos 1 ya que enero es 0
                                                            //padStart es para darle espacio a que muestre dos numeros
    const dia = String(ahora.getDate()).padStart(2,'0');
    const hora= String(ahora.getHours()).padStart(2,'0');
    const minutos= String(ahora.getMinutes()).padStart(2,'0');
    const segundos= String(ahora.getSeconds()).padStart(2,'0');

    const fechaHora= `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
    return fechaHora;
}



//funcion para poner la hora actual al dar de alta un nuevo proyecto
function horaNuevoProyecto(){
    fechaHora=obtenerHora();
    document.getElementById("fecha_alta").value=fechaHora;
}

function horaEditarPendiente(){
    fechaHora=obtenerHora();
    document.getElementById("fecha_inicio_pend").value=fechaHora;
}


//funcion para cargar la hora actual en el modal "registro nuevo"
document.addEventListener("DOMContentLoaded", function() {
    const modalNuevo = document.getElementById("registroNuevo");
    //document.getElementById("fecha_alta").value=fechaHora
    modalNuevo.addEventListener("show.bs.modal", function() {
        horaNuevoProyecto(); // llama la función al mostrar el modal
    });
});
 

//Funcion para activar o desactivar los campos de inicio y fin de pendientes
async function hab_deshab_Campos(proyecto_id){
    //seleccionamos el campo que será el que de la bandera
    const selectCNC = document.getElementById("cncSelect");
    //obtenemos los id de los campos a bloquear
    const fechaInicio=document.getElementById("fecha_inicio_pend");
    const fechafin=document.getElementById("fecha_fin_pend");
    
    //activamos o desactivamos los campos segun el valor del select
    /*En este if dependiendo del valor del select bloqueamos los demas camposde fecha, para impedir que ingresen valores
    quue no corresponden. Además, sirve para validar cuando el campo de maquina aun no está lleno, si esté ya se llenó
    previamente, ni siquiera va a entrar a la condición*/
    if(selectCNC.value==="Selecciona"){
        selectCNC.disabled=false;
        fechaInicio.disabled=true;
        fechafin.disabled=true;
        return;
    }else{
         //selectCNC.disabled=false;
         fechaInicio.disabled=false;
         fechafin.disabled=true;
    }

    /*Consulta para determinar si el proyecto ya tiene una fecha de inicio en base de datos*/
    try{
        const consulta=await fetch("http://localhost:8000/actividades/", {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        });

        if(!consulta){
            console.error("Error al obtener datos de actividades");
            return;
        }


        const temp=consulta.json();
        const fechaTemp = temp.find(fecha => fecha.proyecto_id === proyecto_id);

        if(!fechaTemp){
            console.warn("No se encontró actividad con ese proyecto_id");
            return;
        }

        const tieneFechaInicio = fechaTemp.inicio !== null;
        const tieneFechaFin = fechaTemp.fin !== null;

        /*dependiendo del resultado de la busqueda se bloquearan los y desbloquearan los datos correspondientes*/
        if(!tieneFechaInicio){
            selectCNC.disabled=true;
            fechaInicio.disabled=false;
            fechafin.disabled=true;
        }else if(tieneFechaInicio && !tieneFechaFin){
            selectCNC.disabled=true;
            fechaInicio.disabled=true;
            fechafin.disabled=false;
        }else{
            selectCNC.disabled=true;
            fechaInicio.disabled=true;
            fechafin.disabled=true;
        }
    }catch(error){
        console.error("Error al consultar actividades: ", error);
    }
}


/*Funcion que actualiza el campo de la fecha, si el select tiene el valor de "Selecciona", este campo
aparecerá vacio, si no, llamará a la función "editarHoraPendiente y colocará la fecha en el campo"*/
function actualiza_campo_fecha(){
    const select = document.getElementById("cncSelect");
    if(select.value==="Selecciona"){
        const fechainicio=document.getElementById("fecha_inicio_pend");
        fechainicio.value="";
    }else{
        horaEditarPendiente();
    }
    //console.log(fechaInicio);
}


/*funcion de evento que borrará el campo de fecha inicio si se presiona la tecla retroceso o delete
Impidiendo que se ingresen fechas erroneas o incompletas*/
function protegerCampoFechaInicio() {
    const campoFechaInicio=document.getElementById("fecha_inicio_pend");

    campoFechaInicio.addEventListener("keydown", function (e) {
        const teclasPermitidas = ["Backspace", "Delete"];
        if (teclasPermitidas.includes(e.key)) {
            e.preventDefault(); // Evita el comportamiento por defecto
            this.value = "";    // Borra todo el campo
        } else {
            e.preventDefault(); // Evita cualquier otra entrada
        }
    });
        
    // Prevenir pegado manual
    campoFechaInicio.addEventListener("paste", function (e) {
           e.preventDefault();
    });
}

async function agregarHoraInicio(proyecto_id){
    const fecha=document.getElementById("fecha_inicio_pend").value;
    console.log("Fecha capturada: ", fecha)

    const datos={
        inicio: fecha
    }

    try{
        console.log(datos)
        console.log(proyecto_id)

        const resp = await fetch(`http://127.0.0.1:8000/actDatos/${proyecto_id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        });

        if(!resp.ok){
            const resultado= await resp.json();
            alert("Error: "+ (error.detail || "Ingreso de fecha erroneo."));
            return;
        }
        
        const resultado=await resp.json();
        alert("Fecha de inicio cargada con exito");
    }catch(error){
        console.log("Error");
    }

}

async function agregarHoraFin(proyecto_id){
    const fecha_fin=document.getElementById("fecha_fin_pend").value;
    const datos={
        fin: fecha_fin
    }

    try{
        const resp= fetch(`http://127.0.0.1:8000/actDatos/${proyecto_id}`,{
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        });

        if(!respuesta.ok){
            const resultado= await resp.json();
            alert("Error "+ (error.detail || "Fecha de fin errónea"));
            return;
        }
        
        const resultado= await resp.json();
        alert("Fecha de fin cargada con exito");

    }catch(error){
        console.log("Error");
    }
}