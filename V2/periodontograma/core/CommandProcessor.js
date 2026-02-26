
class CommandProcessor {
    constructor(perio) {
        this.perio = perio;

        this.caras = {
            vestibular: ["vestibular", "bucal", "vesti"],
            palatino: ["palatino", "palatina", "pala", "lingual", "lingu"],
            // Palatino es lo mismo que lingual, solo que la parte de abajo. lingual: ["lingual", "lingu"]
        };

        this.posiciones = {
            mesial: 0,
            centro: 1,
            central: 1,
            medio: 1,
            distal: 2
        };

        this._saveTimeout = null;
    }

    // ===============================
    // AUTOGUARDADO (DEBOUNCE 300ms)
    // ===============================
    autoSave() {
        clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
            this.perio.guardarJSON();
        }, 300);
    }

    ejecutarYGuardar(resultado) {
        if (resultado) {
            this.autoSave();
        }
        return resultado;
    }

    // ===============================
    // PROCESADOR PRINCIPAL
    // ===============================
    procesar(texto) {
        if (!texto) return false;

        texto = texto
            .toLowerCase()
            .trim()
            .replace(/,/g, '')
            .replace(/ /g, '');

        // ---------- SALIR ----------
        if (["salir","finalizar","cerrar"].some(p => texto.includes(p))) {
            return "SALIR";
        }

        // ---------- EXPORTAR ----------
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
            return this.ejecutarYGuardar(
                this.perio.marcarAusente(numDiente, true)
            );
        }

        if (["presente"].some(p => texto.includes(p))) {
            return this.ejecutarYGuardar(
                this.perio.marcarAusente(numDiente, false)
            );
        }

        // ---------- IMPLANTE ----------
        if (["implante","repuesto","falso"].some(p => texto.includes(p))) {
            return this.ejecutarYGuardar(
                this.perio.marcarImplante(numDiente, true)
            );
        }

        if (["original"].some(p => texto.includes(p))) {
            return this.ejecutarYGuardar(
                this.perio.marcarImplante(numDiente, false)
            );
        }

        // ---------- CARA ----------
        let cara = null;
        for (const [nombre, palabras] of Object.entries(this.caras)) {
            if (palabras.some(p => texto.includes(p))) {
                cara = nombre;
                break;
            }
        }

        // ---------- NÚMEROS (excluye número de diente) ----------
        const numeros = Array.from(texto.matchAll(/\d+/g), m => parseInt(m[0]))
            .filter(n => n !== numDiente);

        // ==========================================
        // PROFUNDIDAD DE SONDAJE
        // ==========================================
        if (cara && numeros.length >= 1 && ["profundidad","sondaje"].some(p => texto.includes(p))) {

            let posicion = Object.keys(this.posiciones)
                .find(p => texto.includes(p));

            if (posicion && numeros.length >= 1) {
                return this.ejecutarYGuardar(
                    this.perio.registrarProfundidad(
                        numDiente,
                        cara,
                        this.posiciones[posicion],
                        numeros[0]
                    )
                );
            }

            if (numeros.length >= 3) {
                let success = true;

                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarProfundidad(
                        numDiente,
                        cara,
                        i,
                        numeros[i]
                    )) success = false;
                }

                return this.ejecutarYGuardar(success);
            }
        }

        // ==========================================
        // MOVILIDAD
        // ==========================================
        if (texto.includes("movilidad") && numeros.length >= 0) {
            const grado = numeros.find(n => n <= 3);

            if (grado !== undefined) {
                return this.ejecutarYGuardar(
                    this.perio.registrarMovilidad(numDiente, grado, "registrar")
                );
            }
            if (grado == undefined && texto.includes("limpiar")) {
                return this.ejecutarYGuardar(
                    this.perio.registrarMovilidad(numDiente, 0, "limpiar")
                );
            }
        }

        // ==========================================
        // FURCA
        // ==========================================
        if (["furca","furcación"].some(p => texto.includes(p)) && numeros.length >= 0 && cara) {

            const grado = numeros.find(n => n >= 0 && n <= 3);

            if (grado !== undefined) {
                return this.ejecutarYGuardar(
                    this.perio.registrarFurca(numDiente, cara, grado, "registrar")
                );
            }
            if (grado == undefined && ["limpiar","borrar","eliminar"].some(p => texto.includes(p))) {
                return this.ejecutarYGuardar(
                    this.perio.registrarFurca(numDiente, cara, 0, "limpiar")
                );
            }
        }

        // ==========================================
        // SANGRADO / PLACA
        // ==========================================
        if (["placa","sangrado"].some(p => texto.includes(p)) && cara) {

            const tipo = texto.includes("sangrado") ? "sangrado" : "placa";

            let pos = Object.keys(this.posiciones)
                .find(p => texto.includes(p));

            if (pos !== undefined && !isNaN(this.posiciones[pos])) {

                const idx = this.posiciones[pos];

                return this.ejecutarYGuardar(
                    tipo === "sangrado"
                        ? this.perio.registrarSangrado(numDiente, cara, idx, "registrar")
                        : this.perio.registrarPlaca(numDiente, cara, idx, "registrar")
                );
            } 
            else if (["limpiar","borrar","eliminar"].some(p => texto.includes(p))) {
                for (let i = 0; i < 3; i++) {
                    tipo === "sangrado"
                        ? this.perio.registrarSangrado(numDiente, cara, i, "limpiar")
                        : this.perio.registrarPlaca(numDiente, cara, i, "limpiar");
                }

                return this.ejecutarYGuardar(true);
            }
            else {
                for (let i = 0; i < 3; i++) {
                    tipo === "sangrado"
                        ? this.perio.registrarSangrado(numDiente, cara, i, "registrar")
                        : this.perio.registrarPlaca(numDiente, cara, i, "registrar");
                }

                return this.ejecutarYGuardar(true);
            }
        }

        // ==========================================
        // MARGEN GINGIVAL
        // ==========================================
        if (["margen","gingival"].some(p => texto.includes(p)) && cara) {

            let pos = Object.keys(this.posiciones)
                .find(p => texto.includes(p));

            if (pos !== undefined && numeros.length > 0) {

                return this.ejecutarYGuardar(
                    this.perio.registrarMargenGingival(
                        numDiente,
                        cara,
                        this.posiciones[pos],
                        numeros[0]
                    )
                );
            }

            if (numeros.length >= 3) {

                let success = true;

                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarMargenGingival(
                        numDiente,
                        cara,
                        i,
                        numeros[i]
                    )) success = false;
                }

                return this.ejecutarYGuardar(success);
            }
        }

        // ==========================================
        // NIC
        // ==========================================
        if (["nic","insercion clinica"].some(p => texto.includes(p)) && cara) {

            let pos = Object.keys(this.posiciones)
                .find(p => texto.includes(p));

            if (pos !== undefined && numeros.length > 0) {

                return this.ejecutarYGuardar(
                    this.perio.registrarNIC(
                        numDiente,
                        cara,
                        this.posiciones[pos],
                        numeros[0]
                    )
                );
            }

            if (numeros.length >= 3) {

                let success = true;

                for (let i = 0; i < 3; i++) {
                    if (!this.perio.registrarNIC(
                        numDiente,
                        cara,
                        i,
                        numeros[i]
                    )) success = false;
                }

                return this.ejecutarYGuardar(success);
            }
        }

        // ==========================================
        // ANCHURA DE ENCÍA
        // ========================================== 
        // // Cambiar el orden, si detecta limpiar primero se limpiar, y si no busca el numero
        if (["encía","encia","anchura"].some(p => texto.includes(p)) && numeros.length >= 0) {
            if (["limpiar encia","borrar encia","eliminar encia"].some(p => texto.includes(p))) {
                return this.ejecutarYGuardar(
                this.perio.registrarAnchuraEncia(
                    numDiente,
                    0
                )
            )}
            else{
                return this.ejecutarYGuardar(
                this.perio.registrarAnchuraEncia(
                    numDiente,
                    numeros[0]
                )
            )
            }
        }
        return false;
    }
}

module.exports = CommandProcessor;
