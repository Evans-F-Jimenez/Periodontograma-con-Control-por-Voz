const fs = require("fs");
const path = require("path");

class Periodontograma {
    constructor() {
        this.dientes = {};
        const todos = [
            18,17,16,15,14,13,12,11,
            21,22,23,24,25,26,27,28,
            31,32,33,34,35,36,37,38,
            41,42,43,44,45,46,47,48
        ];

        todos.forEach(n => {
            this.dientes[n] = this._crearDiente();
        });
    }

    _crearDiente() {
        return {
            ausente: false,
            implante: false,
            movilidad: 0,
            vestibular: {
                furca: 0,
                sangrado: [false, false, false],
                placa: [false, false, false],
                margenGingival: [0,0,0],
                profundidadSondaje: [0,0,0],
                anchuraEncia: 0
            },
            palatino: {
                furca: 0,
                sangrado: [false, false, false],
                placa: [false, false, false],
                margenGingival: [0,0,0],
                profundidadSondaje: [0,0,0],
                anchuraEncia: 0
            }
        };
    }

    marcarAusente(diente) {
        if (this.dientes[diente]) {
            this.dientes[diente].ausente = true;
            console.log(`✓ Diente ${diente} marcado como ausente`);
            return true;
        }
        return false;
    }

    marcarImplante(diente) {
        if (this.dientes[diente]) {
            this.dientes[diente].implante = true;
            console.log(`✓ Diente ${diente} marcado como implante`);
            return true;
        }
        return false;
    }

    registrarProfundidad(diente, cara, posicion, valor) {
        if (this.dientes[diente] && ["vestibular","palatino","lingual"].includes(cara)) {
            const caraReal = cara === "lingual" ? "palatino" : cara;
            if (posicion >= 0 && posicion < 3) {
                this.dientes[diente][caraReal].profundidadSondaje[posicion] = valor;
                console.log(`✓ Diente ${diente}, ${cara}, posición ${posicion+1}: ${valor}mm`);
                return true;
            }
        }
        return false;
    }

    registrarMovilidad(diente, grado) {
        if (this.dientes[diente] && grado >=0 && grado <=3) {
            this.dientes[diente].movilidad = grado;
            console.log(`✓ Diente ${diente}, movilidad: grado ${grado}`);
            return true;
        }
        return false;
    }

    registrarFurca(diente, cara, grado) {
        if (this.dientes[diente] && !this.dientes[diente].ausente) {
            const caraReal = cara === "lingual" ? "palatino" : cara;
            if (grado >=0 && grado <=3) {
                this.dientes[diente][caraReal].furca = grado;
                console.log(`✓ Diente ${diente}, furca: grado ${grado}`);
                return true;
            }
        }
        return false;
    }

    registrarSangrado(diente, cara, posicion) {
        if (this.dientes[diente] && !this.dientes[diente].ausente) {
            const caraReal = cara === "lingual" ? "palatino" : cara;
            if (posicion >=0 && posicion < 3) {
                this.dientes[diente][caraReal].sangrado[posicion] = true;
                console.log(`✓ Diente ${diente}, ${cara}, posición ${posicion+1}: sangrado`);
                return true;
            }
        }
        return false;
    }

    registrarPlaca(diente, cara, posicion) {
        if (this.dientes[diente] && !this.dientes[diente].ausente && !this.dientes[diente].implante) {
            const caraReal = cara === "lingual" ? "palatino" : cara;
            if (posicion >=0 && posicion < 3) {
                this.dientes[diente][caraReal].placa[posicion] = true;
                console.log(`✓ Diente ${diente}, ${cara}, posición ${posicion+1}: placa`);
                return true;
            }
        }
        return false;
    }

    registrarMargenGingival(diente, cara, posicion, valor) {
        if (this.dientes[diente] && !this.dientes[diente].ausente) {
            const caraReal = cara === "lingual" ? "palatino" : cara;
            if (posicion >=0 && posicion < 3) {
                this.dientes[diente][caraReal].margenGingival[posicion] = valor;
                console.log(`✓ Diente ${diente}, ${cara}, posición ${posicion+1}: MG ${valor}mm`);
                return true;
            }
        }
        return false;
    }

    registrarAnchuraEncia(diente, cara, valor) {
        if (this.dientes[diente] && !this.dientes[diente].ausente && valor >=0) {
            const caraReal = cara === "lingual" ? "palatino" : cara;
            this.dientes[diente][caraReal].anchuraEncia = valor;
            console.log(`✓ Diente ${diente}, anchura de encía: ${valor}mm`);
            return true;
        }
        return false;
    }

    exportarJSON() {
        const dir = path.join(__dirname, "..", "public", "Data");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const fecha = new Date().toISOString().slice(0,10);
        const file = `periodontograma_${fecha}.json`;
        fs.writeFileSync(
            path.join(dir, file),
            JSON.stringify(this.dientes, null, 2)
        );
        console.log(`✓ Periodontograma exportado a ${file}`);
        return file;
    }
}

module.exports = Periodontograma;
