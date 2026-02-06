class CommandProcessor {
    constructor(perio) {
        this.perio = perio;
        this.caras = {
            vestibular: ["vestibular", "bucal", "vesti"],
            palatino: ["palatino", "palatina", "pala"],
            lingual: ["lingual", "lingu"]
        };
        this.posiciones = { mesial: 0, centro: 1, central: 1, medio: 1, distal: 2 };
    }

    procesar(texto) {
        if (!texto) return false;
        texto = texto.toLowerCase().trim().replace(/,/g, '').replace(/ /g, '');

        // ---------- COMANDO SALIR ----------
        if (["salir","terminar","finalizar","cerrar"].some(p => texto.includes(p))) {
            return "SALIR";
        }

        // ---------- COMANDO EXPORTAR ----------
        if (texto.includes("exportar") || texto.includes("guardar")) {
            const file = this.perio.exportarJSON();
            return { action: "exportar", file };
        }

        // ---------- DETECTAR DIENTE ----------
        const matchDiente = texto.match(/(?:diente\s*)?(\d+)/);
        if (!matchDiente) return false;
        const numDiente = parseInt(matchDiente[1]);

        // ---------- AUSENTE ----------
        if (["ausente","falta","perdido"].some(p => texto.includes(p))) {
            return this.perio.marcarAusente(numDiente);
        }

        // ---------- IMPLANTE ----------
        if (["implante","repuesto","falso"].some(p => texto.includes(p))) {
            return this.perio.marcarImplante(numDiente);
        }

        // ---------- CARA ----------
        let cara = null;
        for (const [nombre, palabras] of Object.entries(this.caras)) {
            if (palabras.some(p => texto.includes(p))) {
                cara = nombre;
                break;
            }
        }

        // ---------- NÚMEROS (sin el número del diente) ----------
        const numeros = Array.from(texto.matchAll(/\d+/g), m => parseInt(m[0]))
                             .filter(n => n !== numDiente);

        // ---------- PROFUNDIDAD ----------
        if (cara && numeros.length >= 1 && texto.includes("profundidad") || true) {
            let posicion = Object.keys(this.posiciones).find(p => texto.includes(p));
            if (posicion && numeros.length >= 1) {
                return this.perio.registrarProfundidad(numDiente, cara, this.posiciones[posicion], numeros[0]);
            } else if (numeros.length >= 3) {
                let success = true;
                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarProfundidad(numDiente, cara, i, numeros[i])) success = false;
                }
                return success;
            }
        }

        // ---------- MOVILIDAD ----------
        if (texto.includes("movilidad") && numeros.length > 0) {
        const grado = numeros.find(n => n <= 3);
        if (grado !== undefined) {
        console.log("DEBUG: Registrando movilidad", numDiente, grado);
        return this.perio.registrarMovilidad(numDiente, grado);
    }
}

        // ---------- FURCA ----------
        if ((texto.includes("furca") || texto.includes("furcación")) && numeros.length > 0 && cara) {
            const grado = numeros.find(n => n >= 0 && n <= 3);
            if (grado !== undefined) return this.perio.registrarFurca(numDiente, cara, grado);
        }

        // ---------- SANGRADO / PLACA ----------
        if ((texto.includes("sangrado") || texto.includes("placa")) && cara) {
            const tipo = texto.includes("sangrado") ? "sangrado" : "placa";
            let pos = Object.keys(this.posiciones).find(p => texto.includes(p));
            if (pos !== undefined && !isNaN(this.posiciones[pos])) {
                const idx = this.posiciones[pos];
                return tipo === "sangrado"
                    ? this.perio.registrarSangrado(numDiente, cara, idx)
                    : this.perio.registrarPlaca(numDiente, cara, idx);
            } else {
                // marcar las 3 posiciones
                for (let i = 0; i < 3; i++) {
                    tipo === "sangrado"
                        ? this.perio.registrarSangrado(numDiente, cara, i)
                        : this.perio.registrarPlaca(numDiente, cara, i);
                }
                return true;
            }
        }

        // ---------- MARGEN GINGIVAL ----------
        if ((texto.includes("margen") || texto.includes("gingival")) && cara) {
            const numerosMG = numeros;
            let pos = Object.keys(this.posiciones).find(p => texto.includes(p));
            if (pos !== undefined && numerosMG.length > 0) {
                return this.perio.registrarMargenGingival(numDiente, cara, this.posiciones[pos], numerosMG[0]);
            } else if (numerosMG.length >= 3) {
                let success = true;
                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarMargenGingival(numDiente, cara, i, numerosMG[i])) success = false;
                }
                return success;
            }
        }

        // ---------- NIC ----------
        if ((texto.includes("NIC") || texto.includes("Insercion clinica")) && cara) {
            const numerosMG = numeros;
            let pos = Object.keys(this.posiciones).find(p => texto.includes(p));
            if (pos !== undefined && numerosMG.length > 0) {
                return this.perio.registrarNIC(numDiente, cara, this.posiciones[pos], numerosMG[0]);
            } else if (numerosMG.length >= 3) {
                let success = true;
                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarNIC(numDiente, cara, i, numerosMG[i])) success = false;
                }
                return success;
            }
        }

        // ---------- ANCHURA DE ENCÍA ----------
        if ((texto.includes("encía") || texto.includes("encia")) && numeros.length > 0) {
            return this.perio.registrarAnchuraEncia(numDiente, numeros[0]);
        }

        return false;
    }
}

module.exports = CommandProcessor;
