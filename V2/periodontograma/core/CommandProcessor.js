class CommandProcessor {
    constructor(perio) {
        this.perio = perio;
        this.caras = {
            vestibular: ["vestibular", "bucal", "vesti"],
            palatino: ["palatino", "palatina", "pala"],
            lingual: ["lingual", "lingu"]
        };
    }

    procesar(texto) {
        if (!texto) return false;
        texto = texto.toLowerCase();

        // SALIR
        if (["salir","terminar","finalizar","cerrar"].some(p => texto.includes(p))) {
            return "SALIR";
        }

        // EXPORTAR
        if (texto.includes("exportar")) {
            const file = this.perio.exportarJSON();
            return { action: "exportar", file };
        }

        // Determinar diente
        const matchDiente = texto.match(/diente\s*(\d+)|^(\d+)/);
        if (!matchDiente) return false;
        const numDiente = parseInt(matchDiente[1] || matchDiente[2]);

        // AUSENTE
        if (["ausente","falta","perdido"].some(p => texto.includes(p))) {
            return this.perio.marcarAusente(numDiente);
        }

        // IMPLANTE
        if (["implante","repuesto","falso"].some(p => texto.includes(p))) {
            return this.perio.marcarImplante(numDiente);
        }

        // CARA
        let cara = null;
        for (const [nombre, palabras] of Object.entries(this.caras)) {
            if (palabras.some(p => texto.includes(p))) {
                cara = nombre;
                break;
            }
        }

        const numeros = Array.from(texto.matchAll(/\d+/g), m => parseInt(m[0])).filter(n => n !== numDiente);

        // PROFUNDIDAD
        if (cara && numeros.length >= 1) {
            const posiciones = { mesial: 0, centro: 1, central: 1, medio: 1, distal: 2 };
            let posicion = Object.keys(posiciones).find(p => texto.includes(p));
            if (posicion) {
                return this.perio.registrarProfundidad(numDiente, cara, posiciones[posicion], numeros[0]);
            } else if (numeros.length >= 3) {
                let success = true;
                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarProfundidad(numDiente, cara, i, numeros[i])) success = false;
                }
                return success;
            }
        }

        // MOVILIDAD
        if (texto.includes("movilidad") && numeros.length > 0) {
            const grado = numeros.find(n => n <= 3);
            if (grado !== undefined) return this.perio.registrarMovilidad(numDiente, grado);
        }

        // FURCA
        if ((texto.includes("furca") || texto.includes("furcación")) && numeros.length > 0) {
            const grado = numeros.find(n => n <= 3);
            if (grado !== undefined && cara) return this.perio.registrarFurca(numDiente, cara, grado);
        }

        // SANGRADO / PLACA
        if ((texto.includes("sangrado") || texto.includes("placa")) && cara) {
            const tipo = texto.includes("sangrado") ? "sangrado" : "placa";
            const posicionesMap = { mesial: 0, centro: 1, central: 1, medio: 1, distal: 2 };
            let pos = Object.keys(posicionesMap).find(p => texto.includes(p));
            if (pos !== undefined) {
                pos = posicionesMap[pos];
                return tipo === "sangrado"
                    ? this.perio.registrarSangrado(numDiente, cara, pos)
                    : this.perio.registrarPlaca(numDiente, cara, pos);
            } else {
                // marcar las 3
                for (let i = 0; i < 3; i++) {
                    tipo === "sangrado"
                        ? this.perio.registrarSangrado(numDiente, cara, i)
                        : this.perio.registrarPlaca(numDiente, cara, i);
                }
                return true;
            }
        }

        // MARGEN GINGIVAL
        if ((texto.includes("margen") || texto.includes("gingival")) && cara) {
            const numerosMG = numeros;
            const posicionesMap = { mesial: 0, centro: 1, central: 1, medio: 1, distal: 2 };
            let pos = Object.keys(posicionesMap).find(p => texto.includes(p));
            if (pos !== undefined && numerosMG.length > 0) {
                return this.perio.registrarMargenGingival(numDiente, cara, posicionesMap[pos], numerosMG[0]);
            } else if (numerosMG.length >= 3) {
                let success = true;
                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarMargenGingival(numDiente, cara, i, numerosMG[i])) success = false;
                }
                return success;
            }
        }

        // ANCHURA DE ENCÍA
        if ((texto.includes("encía") || texto.includes("encia")) && cara && numeros.length > 0) {
            return this.perio.registrarAnchuraEncia(numDiente, cara, numeros[0]);
        }

        return false;
    }
}

module.exports = CommandProcessor;
