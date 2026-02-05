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
            this.dientes[n] = {
                ausente: false,
                implante: false,
                movilidad: 0,
                vestibular: {
                    profundidad_sondaje: [0,0,0],
                    sangrado: [false,false,false],
                    placa: [false,false,false]
                },
                palatino: {
                    profundidad_sondaje: [0,0,0],
                    sangrado: [false,false,false],
                    placa: [false,false,false]
                }
            };
        });
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
        return file;
    }
}

module.exports = Periodontograma;
