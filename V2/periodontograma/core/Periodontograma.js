const fs = require("fs");
const path = require("path");
//let id_perio = "2026-02-10";

class Periodontograma {
    
    constructor(id) {

        if (!id) {
            throw new Error("Se requiere un ID para el periodontograma");
        }

        this.id = id;

        this.filePath = path.join(
            __dirname,
            "..",
            "public",
            "Data",
            `periodontograma_${this.id}.json`
        );

        this.dientes = {};

        const todos = [
            18,17,16,15,14,13,12,11,
            21,22,23,24,25,26,27,28,
            31,32,33,34,35,36,37,38,
            41,42,43,44,45,46,47,48
        ];

        // Si ya existe archivo → cargar
        if (fs.existsSync(this.filePath)) {

            const contenido = fs.readFileSync(this.filePath, "utf8");
            this.dientes = JSON.parse(contenido);
            console.log("✔ Periodontograma cargado desde archivo");

        } else {

            // Crear estructura nueva
            todos.forEach(n => {
                this.dientes[n] = this._crearDiente();
            });

            // Crear carpeta si no existe
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            this.guardarJSON();
            console.log("✔ Nuevo periodontograma creado");
        }
    }

    // ===============================
    // AUTOGUARDADO
    // ===============================

    guardarJSON() {
        fs.writeFileSync(
            this.filePath,
            JSON.stringify(this.dientes, null, 2)
        );
        console.log("✔ Autoguardado backend");
    }

    // ===============================
    // ESTRUCTURA BASE
    // ===============================

    _crearDiente() {
        return {
            ausente: false,
            implante: false,
            movilidad: 0,
            anchuraEncia: 0,
            vestibular: this._crearCara(),
            palatino: this._crearCara()
        };
    }

    _crearCara() {
        return {
            furca: 0,
            sangrado: [false, false, false],
            placa: [false, false, false],
            margenGingival: [0, 0, 0],
            profundidadSondaje: [0, 0, 0],
            NIC: [0, 0, 0]
        };
    }

    // ===============================
    // MÉTODOS CLÍNICOS
    // ===============================

    marcarAusente(diente, estado) {
        if (this.dientes[diente]) {
            this.dientes[diente].ausente = estado;
            return true;
        }
        return false;
    }

    marcarImplante(diente, estado) {
        if (this.dientes[diente]) {
            this.dientes[diente].implante = estado;
            return true;
        }
        return false;
    }

    registrarProfundidad(diente, cara, posicion, valor) {
        if (!this.dientes[diente]) return false;

        const caraReal = cara === "lingual" ? "palatino" : cara;

        if (posicion >= 0 && posicion < 3) {
            this.dientes[diente][caraReal].profundidadSondaje[posicion] = valor;
            return true;
        }

        return false;
    }

    registrarMovilidad(diente, grado, accion) {
        if (this.dientes[diente] && grado >= 0 && grado <= 3 && accion === "registrar") {
            this.dientes[diente].movilidad = grado;
            return true;
        }
        if (this.dientes[diente] && accion === "limpiar") {
            this.dientes[diente].movilidad = 0;
            return true;
        }
        return false;
    }

    registrarFurca(diente, cara, grado, accion) {
        if (!this.dientes[diente] || this.dientes[diente].ausente) return false;

        const caraReal = cara === "lingual" ? "palatino" : cara;

        if (accion === "registrar" && grado >= 0 && grado <= 3) {
            this.dientes[diente][caraReal].furca = grado;
            return true;
        }

        return false;
    }

    registrarSangrado(diente, cara, posicion, accion) {
        if (!this.dientes[diente] || this.dientes[diente].ausente) return false;

        const caraReal = cara === "lingual" ? "palatino" : cara;

        if (posicion >= 0 && posicion < 3 && accion == "registrar") {
            this.dientes[diente][caraReal].sangrado[posicion] = true;
            return true;
        }

        if (posicion >= 0 && posicion < 3 && accion == "limpiar") {
            this.dientes[diente][caraReal].sangrado[posicion] = false;
            return true;
        }

        return false;
    }

    registrarPlaca(diente, cara, posicion) {
        if (
            !this.dientes[diente] ||
            this.dientes[diente].ausente ||
            this.dientes[diente].implante
        ) return false;

        const caraReal = cara === "lingual" ? "palatino" : cara;

        if (posicion >= 0 && posicion < 3) {
            this.dientes[diente][caraReal].placa[posicion] = true;
            return true;
        }

        return false;
    }

    registrarMargenGingival(diente, cara, posicion, valor) {
        if (!this.dientes[diente] || this.dientes[diente].ausente) return false;

        const caraReal = cara === "lingual" ? "palatino" : cara;

        if (posicion >= 0 && posicion < 3) {
            this.dientes[diente][caraReal].margenGingival[posicion] = valor;
            return true;
        }

        return false;
    }

    registrarNIC(diente, cara, posicion, valor) {
        if (!this.dientes[diente]) return false;

        const caraReal = cara === "lingual" ? "palatino" : cara;

        if (posicion >= 0 && posicion < 3) {
            this.dientes[diente][caraReal].NIC[posicion] = valor;
            return true;
        }

        return false;
    }

    registrarAnchuraEncia(diente, valor) {
        if (
            this.dientes[diente] &&
            !this.dientes[diente].ausente &&
            valor >= 0
        ) {
            this.dientes[diente].anchuraEncia = valor;
            return true;
        }
        return false;
    }

    // ===============================
    // EXPORTACIÓN MANUAL
    // ===============================

    exportarJSON() {

        const dir = path.join(__dirname, "..", "public", "Data");

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const fecha = new Date().toISOString().slice(0, 10);
        const file = `periodontograma_${this.id}.json`;

        fs.writeFileSync(
            path.join(dir, file),
            JSON.stringify(this.dientes, null, 2)
        );

        return file;
    }
}

module.exports = Periodontograma;
