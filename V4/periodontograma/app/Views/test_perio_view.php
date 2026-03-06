<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Prueba Periodontograma</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
        background: #f4f4f4;
      }
      h1 {
        color: #444;
      }
      button {
        padding: 10px 20px;
        margin: 5px;
        cursor: pointer;
      }
      #log {
        margin-top: 20px;
        padding: 10px;
        background: #fff;
        border: 1px solid #ccc;
        height: 300px;
        overflow-y: auto;
      }
      #comando {
        width: 60%;
        padding: 5px;
      }
    </style>
  </head>
  <body>
    <h1>🦷 Prueba Periodontograma - Comandos de Voz</h1>

    <input type="text" id="comando" placeholder="Escribe el comando aquí" />
    <button id="enviar">Enviar Texto</button>
    <button id="voz">🎤 Hablar</button>

    <div id="log"></div>

    <script>
      const formattedDate = new Date().toISOString().split('T')[0];
      let periodontogramaId = formattedDate;
      const log = document.getElementById("log");
      const comandoInput = document.getElementById("comando");

      function addLog(msg) {
        const p = document.createElement("p");
        p.textContent = msg;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
      }

      async function enviarComando(texto) {
        addLog("➡️ Enviando: " + texto);
        try {
          const res = await fetch(`/api/comando/${periodontogramaId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto }),
          });
          const data = await res.json();
          addLog("✅ Respuesta: " + JSON.stringify(data));
        } catch (e) {
          addLog("❌ Error: " + e.message);
        }
      }
      // ================= COMANDO POR TEXTO =================

      document.getElementById("enviar").addEventListener("click", () => {
        const texto = comandoInput.value.trim();
        if (texto) enviarComando(texto);
      });

      // ================= RECONOCIMIENTO DE VOZ =================
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = "es-ES";
        recognition.interimResults = false;

        document.getElementById("voz").addEventListener("click", () => {
          addLog("🎙️ Escuchando...");
          recognition.start();
        });

        recognition.addEventListener("result", (e) => {
          const texto = e.results[0][0].transcript;
          addLog("🎤 Reconocido: " + texto);
          enviarComando(texto);
        });

        recognition.addEventListener("error", (e) => {
          addLog("⚠️ Error en reconocimiento: " + e.error);
        });
        recognition.addEventListener("end", () => {
          addLog("ℹ️ Reconocimiento finalizado. Puedes hablar de nuevo.");
        });
      } else {
        addLog("⚠️ Tu navegador no soporta SpeechRecognition");
      }
    </script>
  </body>
</html>
