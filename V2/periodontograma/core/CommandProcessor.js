class CommandProcessor {
    constructor(perio) {
        this.perio = perio;
    }

    procesar(texto) {
        texto = texto.toLowerCase();

        if (texto.includes("exportar")) {
            this.perio.exportarJSON();
            return "exportado";
        }

        return "comando no reconocido";
    }
}

module.exports = CommandProcessor;
