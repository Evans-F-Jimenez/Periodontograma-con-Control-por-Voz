const express = require("express");
const path = require("path");
const formattedDate = new Date().toISOString().split('T')[0];

const Periodontograma = require("./core/Periodontograma");
const CommandProcessor = require("./core/CommandProcessor");

const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= ALMACENAMIENTO EN MEMORIA =================
// Guarda instancias por ID mientras el servidor esté vivo
const periodos = {};

// Obtener o crear periodontograma por ID
function obtenerPerio(id = formattedDate) {
    if (!id) {
        throw new Error("ID requerido");
    }

    if (!periodos[id]) {
        console.log("📂 Cargando periodontograma:", id);
        periodos[id] = new Periodontograma(id);
    }

    return periodos[id];
}

// ================= API =================

// 🔹 Procesar comando (texto o voz)
app.post("/api/comando/:id", (req, res) => {
    try {
        const { texto } = req.body;
        const { id } = req.params;

        if (!texto) {
            return res.status(400).json({ error: "Texto requerido" });
        }

        const perio = obtenerPerio(id);
        const processor = new CommandProcessor(perio);

        const result = processor.procesar(texto);

        // Guardado automático después de procesar comando
        perio.guardarJSON();

        res.json({ ok: true, result });

    } catch (err) {
        console.error("Error procesando comando:", err);
        res.status(500).json({ ok: false, error: "Error interno" });
    }
});

// 🔹 Obtener periodontograma
app.get("/api/periodontograma/:id", (req, res) => {
    try {
        const { id } = req.params;
        const perio = obtenerPerio(id);

        res.json(perio.dientes);

    } catch (err) {
        console.error("Error obteniendo periodontograma:", err);
        res.status(500).json({ ok: false, error: "Error interno" });
    }
});

// 🔹 Guardar desde UI (cuando frontend hace cambios manuales)
app.post("/api/periodontograma/:id", (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (!data || typeof data !== "object") {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        const perio = obtenerPerio(id);

        perio.dientes = data;
        perio.guardarJSON();

        res.json({ ok: true });

    } catch (err) {
        console.error("Error guardando periodontograma:", err);
        res.status(500).json({ ok: false, error: "Error guardando" });
    }
});

// ================= START =================
app.listen(PORT, () => {
    console.log(`🦷 Periodontograma en http://localhost:${PORT}`);
});
