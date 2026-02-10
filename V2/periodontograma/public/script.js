let ultimoSnapshot = null;
let periodontogramaId = "2026-02-10";
let autoSaveTimeout = null;

const dientes = {};

const supIzq = [18, 17, 16, 15, 14, 13, 12, 11];
const supDer = [21, 22, 23, 24, 25, 26, 27, 28];

const infIzq = [48, 47, 46, 45, 44, 43, 42, 41];
const infDer = [31, 32, 33, 34, 35, 36, 37, 38];

function inicializarDientes() {
  [...supIzq, ...supDer, ...infIzq, ...infDer].forEach((n) => {
    dientes[n] = {
      ausente: false,
      implante: false,
      movilidad: 0,
      anchuraEncia: 0,
      vestibular: {
        placa: [false, false, false],
        sangrado: [false, false, false],
        margenGingival: [0, 0, 0],
        profundidadSondaje: [0, 0, 0],
        NIC: [0, 0, 0],
        furca: 0
      },
      palatino: {
        placa: [false, false, false],
        sangrado: [false, false, false],
        margenGingival: [0, 0, 0],
        profundidadSondaje: [0, 0, 0],
        NIC: [0, 0, 0],
        furca: 0
      }
    };
  });
}

function crearDienteHTML(numero, mostrarNombres = false) {

  const esInferior = numero === 48;

  return `
    <div class="diente-wrapper">
    
      ${mostrarNombres ? `
        <div class="titulos-fila ${esInferior ? 'invertido' : ''}">
          <div class="titulo">Movilidad</div>
          <div class="titulo">Furca</div>
          <div class="titulo">Sangrado</div>
          <div class="titulo">Placa</div>
          <div class="titulo">Anchura encía</div>
          <div class="titulo">Margen gingival</div>
          <div class="titulo">Prof. sondaje</div>
          <div class="titulo">NIC</div>
          <div class="titulo">Diente</div>
          <div class="titulo">NIC</div>
          <div class="titulo">Prof. sondaje</div>
          <div class="titulo">Margen gingival</div>
          <div class="titulo">Placa</div>
          <div class="titulo">Sangrado</div>
          <div class="titulo">Furca</div>
        </div>
      ` : ""}

      
    <div class="diente">

       <!-- MOVILIDAD -->
        <div class="fila">
           <!-- <div class="campo unico" id="${numero}-movilidad"></div> -->
            <input class="campo unico" type="text" maxlength="1" id="${numero}-movilidad" name="movilidad-${numero}">
        </div>

        <!-- VESTIBULAR -->

        <!-- FURCA -->
        <div class="fila">
            <!--<div class="campo unico" id="${numero}-furca"></div> -->
            <input class="campo unico" type="text" maxlength="1" id="${numero}-furca_v" name="furca-${numero}">
        </div>

        <!-- SANGRADO -->
        <div class="valores-sangrado">
            <div class="valor" id="${numero}-sv-0"></div>
            <div class="valor" id="${numero}-sv-1"></div>
            <div class="valor" id="${numero}-sv-2"></div>
        </div>

        <!-- PLACA -->
        <div class="valores-placa">
            <div class="valor" id="${numero}-pv-0"></div>
            <div class="valor" id="${numero}-pv-1"></div>
            <div class="valor" id="${numero}-pv-2"></div>
        </div>
        
        <!-- ANCHURA DE ENCIA -->
        <div class="fila">
            <input class="campo unico" type="text"  maxlength="1" id="${numero}-anchura_encia" name="anchura_e">
        </div>

        <!-- MARGEN GINGIVAL -->
        <div class="fila triple">
            <!--<div class="campo" id="${numero}-mg-0"></div>-->
            <input class="campo" type="text"  maxlength="1" id="${numero}-mgv-0" name="margen_gingival-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-mgv-1" name="margen_gingival-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-mgv-2" name="margen_gingival-${numero}">
        </div>

        <!-- PROFUNDIDAD VESTIBULAR -->
        <div class="fila triple">
            <input class="campo" type="text"  maxlength="1" id="${numero}-psv-0" name="profundidad_vestibular-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-psv-1" name="profundidad_vestibular-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-psv-2" name="profundidad_vestibular-${numero}">
        </div>

        <!-- NIC -->
         <div class="fila triple">
            <input class="campo" type="text"  maxlength="1" id="${numero}-NV-0" name="nic-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-NV-1" name="nic-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-NV-2" name="nic-${numero}">
        </div>

        <div class="diente-box" id="box-${numero}">
            <div class="numero-diente">${numero}</div>
            <div class="extra-info" id="info-${numero}"></div>
        </div>
        
<!-- PALATINO -->
        <div class="fila triple">
            <input class="campo" type="text"  maxlength="1" id="${numero}-NP-0" name="nic-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-NP-1" name="nic-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-NP-2" name="nic-${numero}">
        </div>

        <div class="fila triple">
            <input class="campo" type="text"  maxlength="1" id="${numero}-psp-0" name="profundidad_palatina-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-psp-1" name="profundidad_palatina-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-psp-2" name="profundidad_palatina-${numero}">
        </div>

        <div class="fila triple">
            <input class="campo" type="text"  maxlength="1" id="${numero}-mgp-0" name="margen_gingival-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-mgp-1" name="margen_gingival-${numero}">
            <input class="campo" type="text"  maxlength="1" id="${numero}-mgp-2" name="margen_gingival-${numero}">
        </div>
    
        <div class="valores-placa">
            <div class="valor" id="${numero}-pp-0"></div>
            <div class="valor" id="${numero}-pp-1"></div>
            <div class="valor" id="${numero}-pp-2"></div>
        </div>

        <div class="valores-sangrado">
            <div class="valor" id="${numero}-sp-0"></div>
            <div class="valor" id="${numero}-sp-1"></div>
            <div class="valor" id="${numero}-sp-2"></div>
        </div>

        <div class="fila">
            <input class="campo unico" type="text" maxlength="1" id="${numero}-furca_p" name="furca-${numero}">
        </div>

    </div>
    </div>`
}

function renderizar(lista, contenedor) {
  document.getElementById(contenedor).innerHTML = lista
    .map((num) => {
      const mostrarNombres = num === 18 || num === 48; // solo dientes a la izquierda
      return crearDienteHTML(num, mostrarNombres);
    })
    .join("");
}

// function actualizarValor(diente, cara, pos, valor) {
//   const pref = cara === "vestibular" ? "v" : "p";
//   const el = document.getElementById(`${diente}-${pref}-${pos}`);
//   el.textContent = valor;
//   el.classList.add("filled");
//   if (valor >= 6) el.classList.add("danger");
//   else if (valor >= 4) el.classList.add("warning");
// }

function setInputValue(id, valor) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = valor;
  el.classList.add("filled");

//  if (Number(valor) >= 6) el.classList.add("danger");
 // else if (Number(valor) >= 4) el.classList.add("warning");
}

function marcarImplante(num) {
  const box = document.getElementById(`box-${num}`);
  const info = document.getElementById(`info-${num}`);

  if (!box || !info) return;

  box.classList.add("implante");
  info.textContent = "IMP";
}

function ocultarFilasDiente(num) {
  const diente = document.getElementById(`box-${num}`)?.closest(".diente");

  if (!diente) return;

  diente.classList.add("ausente");

  // Oculta todo excepto la caja del diente
  [...diente.children].forEach((child) => {
    if (!child.classList.contains("diente-box")) {
      child.style.display = "none";
    }
  });
}

function marcarAusente(num) {
  const diente = document.getElementById(`box-${num}`)?.closest(".diente");

  if (!diente) return;

  diente.classList.add("ausente");
}

function marcarPlaca(num, cara, index, valor) {
  if (!valor) return;

  const pref = cara === "vestibular" ? "pv" : "pp";
  const el = document.getElementById(`${num}-${pref}-${index}`);

  if (!el) return;

  el.classList.add("placa-activa");
}

function marcarSangrado(num, cara, index, valor) {
  if (!valor) return;

  const pref = cara === "vestibular" ? "sv" : "sp";
  const el = document.getElementById(`${num}-${pref}-${index}`);
  // console.log("Intentando marcar:", `${num}-${pref}-${index}`);
  // console.log(document.getElementById(`${num}-${pref}-${index}`));
  if (!el) return;

  el.classList.add("sangrado-activa");
}

async function refrescarPeriodontograma() {
  try {
    const res = await fetch(
      `Data/periodontograma_${periodontogramaId}.json?ts=${Date.now()}`,
      { cache: "no-store" },
    );
    const data = await res.json();

    const snapshot = JSON.stringify(data);

    if (snapshot !== ultimoSnapshot) {
      console.log("🔄 Cambios detectados en JSON");
      ultimoSnapshot = snapshot;

      //limpiarPeriodontograma();
      cargarPeriodontogramaDesdeObjeto(data);
    }
  } catch (err) {
    console.error("Error al refrescar periodontograma", err);
  }
}

function cargarPeriodontogramaDesdeObjeto(data) {
  Object.entries(data).forEach(([num, d]) => {
    // if (d.ausente) {
    //   ocultarFilasDiente(num);
    //   return;
    // }

    if (d.ausente) {
      marcarAusente(num);
      return;
    }

    if (d.implante) {
      marcarImplante(num);
    }

    if (d.movilidad > 0) {
      setInputValue(`${num}-movilidad`, d.movilidad);
    }

    if (d.anchuraEncia > 0) {
      setInputValue(`${num}-anchura_encia`, d.anchuraEncia);
    }

    if (d.vestibular.furca > 0) {
      setInputValue(`${num}-furca_v`, d.vestibular.furca);
    }

    if (d.palatino.furca > 0) {
      setInputValue(`${num}-furca_p`, d.palatino.furca);
    }

    d.vestibular?.placa?.forEach((v, i) => {
      marcarPlaca(num, "vestibular", i, v);
      // console.log("SANGRADO:", num, d.vestibular?.sangrado);
    });

    d.palatino?.placa?.forEach((v, i) => {
      marcarPlaca(num, "palatino", i, v);
    });

    d.vestibular?.sangrado?.forEach((v, i) => {
      marcarSangrado(num, "vestibular", i, v);
    });

    d.palatino?.sangrado?.forEach((v, i) => {
      marcarSangrado(num, "palatino", i, v);
    });

    d.vestibular?.NIC?.forEach((v, i) => {
      if (v !== 0) setInputValue(`${num}-NV-${i}`, v);
    });

    d.palatino?.NIC?.forEach((v, i) => {
      if (v !== 0) setInputValue(`${num}-NP-${i}`, v);
    });

    d.vestibular?.margenGingival?.forEach((v, i) => {
      if (v !== 0) setInputValue(`${num}-mgv-${i}`, v);
    });

    d.palatino?.margenGingival?.forEach((v, i) => {
      if (v !== 0) setInputValue(`${num}-mgp-${i}`, v);
    });

    d.palatino?.profundidadSondaje?.forEach((v, i) => {
      if (v > 0) setInputValue(`${num}-psp-${i}`, v);
    });

    d.vestibular?.profundidadSondaje?.forEach((v, i) => {
      if (v > 0) setInputValue(`${num}-psv-${i}`, v);
    });
  });
}

function limpiarPeriodontograma() {
  document.querySelectorAll("input.campo, input.campo.unico").forEach((i) => {
    i.value = "";
    i.classList.remove("filled");
  });

  document.querySelectorAll(".diente-box").forEach((box) => {
    box.classList.remove("implante");
  });

  document.querySelectorAll(".diente-box").forEach(box => {
  box.classList.remove("implante");
});


  document.querySelectorAll(".valor").forEach(v => {
  v.classList.remove("placa-activa");
  v.classList.remove("sangrado-activa");
});

  document.querySelectorAll(".extra-info").forEach((i) => (i.textContent = ""));

  document.querySelectorAll(".diente").forEach((d) => {
    d.classList.remove("ausente");
    [...d.children].forEach((c) => (c.style.display = ""));
  });
}

function inicializarEventosValores() {
  document.querySelectorAll(".valor").forEach(el => {
    el.addEventListener("click", () => {
      manejarClickValor(el);
    });
  });
}

function inicializarEventosDientes() {
  document.querySelectorAll(".diente-box").forEach(box => {
    box.addEventListener("click", () => {
      manejarClickDiente(box);
    });
  });
}

function manejarClickValor(el) {
  const id = el.id; 
  // Ejemplo: "18-pv-0" o "18-sp-1"

  const [num, tipo, index] = id.split("-");
  const cara = tipo.includes("v") ? "vestibular" : "palatino";

  const esPlaca = tipo.startsWith("pv") || tipo.startsWith("pp");
  const esSangrado = tipo.startsWith("sv") || tipo.startsWith("sp");

  if (esPlaca) {
    el.classList.toggle("placa-activa");
    actualizarModelo(num, cara, "placa", index, el.classList.contains("placa-activa"));
  }

  if (esSangrado) {
    el.classList.toggle("sangrado-activa");
    actualizarModelo(num, cara, "sangrado", index, el.classList.contains("sangrado-activa"));
  }
}

function manejarClickDiente(box) {
  const num = box.id.replace("box-", "");
  const diente = box.closest(".diente");
  const info = document.getElementById(`info-${num}`);

  const estadoActual = obtenerEstadoDiente(diente);

  // limpiar todo
  diente.classList.remove("ausente");
  box.classList.remove("implante");
  info.textContent = "";

  let nuevoEstado;

  if (estadoActual === "normal") {
    nuevoEstado = "ausente";
    diente.classList.add("ausente");
  } 
  else if (estadoActual === "ausente") {
    nuevoEstado = "implante";
    box.classList.add("implante");
    info.textContent = "IMP";
  } 
  else {
    nuevoEstado = "normal";
  }

  actualizarEstadoModelo(num, nuevoEstado);
}



function obtenerEstadoDiente(diente) {
  const box = diente.querySelector(".diente-box");

  if (diente.classList.contains("ausente")) return "ausente";
  if (box.classList.contains("implante")) return "implante";
  return "normal";
}



function actualizarModelo(num, cara, propiedad, index, valor) {
  if (!dientes[num][cara][propiedad]) {
    dientes[num][cara][propiedad] = [false, false, false];
  }

  dientes[num][cara][propiedad][index] = valor;

  autoGuardar();
}

function actualizarEstadoModelo(num, estado) {
  dientes[num].ausente = estado === "ausente";
  dientes[num].implante = estado === "implante";

  autoGuardar();
}


async function guardarPeriodontograma() {
  try {
    const res = await fetch(
      `/api/periodontograma/${periodontogramaId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dientes),
      }
    );

    const result = await res.json();
    console.log("Guardado:", result);
  } catch (err) {
    console.error("Error guardando:", err);
  }
}

function autoGuardar() {
  console.log("🔥 autoGuardar llamado");

  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

  autoSaveTimeout = setTimeout(async () => {
    console.log("📤 Enviando al backend...");

    try {
      const res = await fetch(`/api/periodontograma/${periodontogramaId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dientes),
      });

      const data = await res.json();
      console.log("✔ Guardado:", data);
      // cargarPeriodontogramaDesdeObjeto(data);
    } catch (err) {
      console.error("❌ Error:", err);
    }
  }, 800);
}

async function cargarDesdeBackend() {
  try {
    const res = await fetch(
      `/api/periodontograma/${periodontogramaId}?ts=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("No se pudo cargar");

    const data = await res.json();

    // 🔥 SINCRONIZA EL MODELO
    Object.keys(dientes).forEach(k => delete dientes[k]);
    Object.assign(dientes, data);

    limpiarPeriodontograma();
    cargarPeriodontogramaDesdeObjeto(dientes);

    ultimoSnapshot = JSON.stringify(dientes);

    console.log("✔ Modelo sincronizado con backend");

  } catch (err) {
    console.error("Error cargando backend:", err);
  }
}


window.onload =  async() => {
  // inicializarDientes();

  // Arcada superior normal
  renderizar(supIzq, "arcada-superior-izquierda");
  renderizar(supDer, "arcada-superior-derecha");

  // Arcada inferior invertida
  renderizar(infIzq, "arcada-inferior-izquierda");
  renderizar(infDer, "arcada-inferior-derecha");

  inicializarEventosValores();
  inicializarEventosDientes();

  await cargarDesdeBackend();
  //refrescarPeriodontograma();

  document.addEventListener("input", (e) => {
  const id = e.target.id;
  if (!id) return;

  const partes = id.split("-");
  const num = partes[0];

  if (!dientes[num]) return;

  const valor = Number(e.target.value) || 0;

  // =========================
  // MOVILIDAD
  // =========================
  if (id.includes("movilidad")) {
    dientes[num].movilidad = valor;
  }

  // =========================
  // ANCHURA ENCÍA
  // =========================
  if (id.includes("anchura_encia")) {
    dientes[num].anchuraEncia = valor;
  }

  // =========================
  // FURCA VESTIBULAR
  // =========================
  if (id.includes("furca_v")) {
    if (!dientes[num].vestibular) dientes[num].vestibular = {};
    dientes[num].vestibular.furca = valor;
  }

  // =========================
  // FURCA PALATINO
  // =========================
  if (id.includes("furca_p")) {
    if (!dientes[num].palatino) dientes[num].palatino = {};
    dientes[num].palatino.furca = valor;
  }

  // =========================
  // MARGEN GINGIVAL VESTIBULAR (mgv)
  // =========================
  if (id.includes("mgv")) {
    const index = Number(partes[2]);
    if (!dientes[num].vestibular.margenGingival)
      dientes[num].vestibular.margenGingival = [0, 0, 0];

    dientes[num].vestibular.margenGingival[index] = valor;
  }

  // =========================
  // MARGEN GINGIVAL PALATINO (mgp)
  // =========================
  if (id.includes("mgp")) {
    const index = Number(partes[2]);
    if (!dientes[num].palatino.margenGingival)
      dientes[num].palatino.margenGingival = [0, 0, 0];

    dientes[num].palatino.margenGingival[index] = valor;
  }

  // =========================
  // PROFUNDIDAD VESTIBULAR (psv)
  // =========================
  if (id.includes("psv")) {
    const index = Number(partes[2]);
    if (!dientes[num].vestibular.profundidadSondaje)
      dientes[num].vestibular.profundidadSondaje = [0, 0, 0];

    dientes[num].vestibular.profundidadSondaje[index] = valor;
  }

  // =========================
  // PROFUNDIDAD PALATINO (psp)
  // =========================
  if (id.includes("psp")) {
    const index = Number(partes[2]);
    if (!dientes[num].palatino.profundidadSondaje)
      dientes[num].palatino.profundidadSondaje = [0, 0, 0];

    dientes[num].palatino.profundidadSondaje[index] = valor;
  }

  // =========================
  // NIC VESTIBULAR (NV)
  // =========================
  if (id.includes("NV")) {
    const index = Number(partes[2]);
    if (!dientes[num].vestibular.NIC)
      dientes[num].vestibular.NIC = [0, 0, 0];

    dientes[num].vestibular.NIC[index] = valor;
  }

  // =========================
  // NIC PALATINO (NP)
  // =========================
  if (id.includes("NP")) {
    const index = Number(partes[2]);
    if (!dientes[num].palatino.NIC)
      dientes[num].palatino.NIC = [0, 0, 0];

    dientes[num].palatino.NIC[index] = valor;
  }

  autoGuardar();
});



  // 🔄 refresco cada 2 segundos (ajustable)
  // setInterval(refrescarPeriodontograma, 2000);
};
