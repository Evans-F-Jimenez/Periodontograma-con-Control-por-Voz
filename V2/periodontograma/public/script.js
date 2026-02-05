const dientes = {};

const supIzq = [18,17,16,15,14,13,12,11];
const supDer = [21,22,23,24,25,26,27,28];

const infIzq = [48,47,46,45,44,43,42,41];
const infDer = [31,32,33,34,35,36,37,38];

function inicializarDientes() {
    [...supIzq, ...supDer, ...infIzq, ...infDer].forEach(n => {
        dientes[n] = {
            vestibular: [0,0,0],
            palatino: [0,0,0],
            movilidad: 0,
            ausente: false,
            implante: false
        };
    });
}

function crearDienteHTML(numero) {
    return `
    <div class="diente">
        <div class="valores-vestibular">
            <div class="valor" id="${numero}-v-0"></div>
            <div class="valor" id="${numero}-v-1"></div>
            <div class="valor" id="${numero}-v-2"></div>
        </div>

        <div class="diente-box" id="box-${numero}">
            <div class="numero-diente">${numero}</div>
            <div class="extra-info" id="info-${numero}"></div>
        </div>

        <div class="valores-palatino">
            <div class="valor" id="${numero}-p-0"></div>
            <div class="valor" id="${numero}-p-1"></div>
            <div class="valor" id="${numero}-p-2"></div>
        </div>
    </div>`;
}

function renderizar(lista, contenedor) {
    document.getElementById(contenedor).innerHTML =
        lista.map(crearDienteHTML).join("");
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

        d.vestibular?.profundidad_sondaje?.forEach((v,i)=>{
            if (v>0) actualizarValor(num,"vestibular",i,v);
        });

        d.palatino?.profundidad_sondaje?.forEach((v,i)=>{
            if (v>0) actualizarValor(num,"palatino",i,v);
        });
    });
}

window.onload = () => {
    inicializarDientes();
    renderizar(supIzq,"arcada-superior-izquierda");
    renderizar(supDer,"arcada-superior-derecha");
    renderizar(infIzq,"arcada-inferior-izquierda");
    renderizar(infDer,"arcada-inferior-derecha");
    cargarPeriodontogramaDesdeJSON("2026-02-04");
};