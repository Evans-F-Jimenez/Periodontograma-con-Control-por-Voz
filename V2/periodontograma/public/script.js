const dientes = {};

const supIzq = [18, 17, 16, 15, 14, 13, 12, 11];
const supDer = [21, 22, 23, 24, 25, 26, 27, 28];

const infIzq = [48, 47, 46, 45, 44, 43, 42, 41];
const infDer = [31, 32, 33, 34, 35, 36, 37, 38];

function inicializarDientes() {
  [...supIzq, ...supDer, ...infIzq, ...infDer].forEach((n) => {
    dientes[n] = {
      vestibular: [0, 0, 0],
      palatino: [0, 0, 0],
      movilidad: 0,
      ausente: false,
      implante: false,
    };
  });
}

function crearDienteHTML(numero) {
  return `
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
            <div class="valor" id="${numero}-v-0"></div>
            <div class="valor" id="${numero}-v-1"></div>
            <div class="valor" id="${numero}-v-2"></div>
        </div>

        <!-- PLACA -->
        <div class="valores-placa">
            <div class="valor" id="${numero}-p-0"></div>
            <div class="valor" id="${numero}-p-1"></div>
            <div class="valor" id="${numero}-p-2"></div>
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

    </div>`;
}

function renderizar(lista, contenedor) {
  document.getElementById(contenedor).innerHTML = lista
    .map((num) => {
      const mostrarNombres = num === 18 || num === 48; // solo dientes a la izquierda
      return crearDienteHTML(num, mostrarNombres);
    })
    .join("");
}


function actualizarValor(diente, cara, pos, valor) {
  const pref = cara === "vestibular" ? "v" : "p";
  const el = document.getElementById(`${diente}-${pref}-${pos}`);
  el.textContent = valor;
  el.classList.add("filled");
  if (valor >= 6) el.classList.add("danger");
  else if (valor >= 4) el.classList.add("warning");
}

async function cargarPeriodontogramaDesdeJSON(id) {
  const res = await fetch(`Data/periodontograma_${id}.json`);
  const data = await res.json();

  Object.entries(data).forEach(([num, d]) => {
    if (d.ausente) {
      document.getElementById(`box-${num}`)?.classList.add("ausente");
      return;
    }

    if (d.movilidad > 0) {
      document.getElementById(`info-${num}`).textContent = `M${d.movilidad}`;
    }

    d.vestibular?.profundidad_sondaje?.forEach((v, i) => {
      if (v > 0) actualizarValor(num, "vestibular", i, v);
    });

    d.palatino?.profundidad_sondaje?.forEach((v, i) => {
      if (v > 0) actualizarValor(num, "palatino", i, v);
    });
  });
}

window.onload = () => {
  inicializarDientes();

  // Arcada superior normal
  renderizar(supIzq, "arcada-superior-izquierda");
  renderizar(supDer, "arcada-superior-derecha");

  // Arcada inferior invertida
  renderizar(infIzq, "arcada-inferior-izquierda", true);
  renderizar(infDer, "arcada-inferior-derecha", true);

  cargarPeriodontogramaDesdeJSON("2026-02-04");

};
