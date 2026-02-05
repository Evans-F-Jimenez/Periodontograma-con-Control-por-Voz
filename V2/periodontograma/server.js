const express = require("express");
const path = require("path");
const fs = require("fs");

const Periodontograma = require("./core/Periodontograma");
const CommandProcessor = require("./core/CommandProcessor");

const app = express();
const PORT = 3000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= CORE =================
const perio = new Periodontograma();
const processor = new CommandProcessor(perio);

// ================= API =================

// Procesar comando (texto o voz)
app.post("/api/comando", (req, res) => {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: "Texto requerido" });

    const result = processor.procesar(texto);
    res.json({ ok: true, result });
});

// Exportar JSON
app.get("/api/exportar", (req, res) => {
    const file = perio.exportarJSON();
    res.json({ ok: true, file });
});

// Obtener periodontograma
app.get("/api/periodontograma/:id", (req, res) => {
    const filePath = path.join(
        __dirname,
        "public",
        "Data",
        `periodontograma_${req.params.id}.json`
    );

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "No encontrado" });
    }

    res.sendFile(filePath);
});

// ================= START =================
app.listen(PORT, () => {
    console.log(`🦷 Periodontograma en http://localhost:${PORT}`);
});
