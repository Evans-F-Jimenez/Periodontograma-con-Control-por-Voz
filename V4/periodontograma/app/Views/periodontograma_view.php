<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Periodontograma</title>
    <link rel="stylesheet" href="<?= base_url('css/body.css') ?>">
    <link rel="stylesheet" href="<?= base_url('css/diente.css') ?>">
    <link rel="stylesheet" href="<?= base_url('css/titulos_segmento.css') ?>">
    <link rel="stylesheet" href="<?= base_url('css/sangrado_placa.css') ?>">
    <link rel="stylesheet" href="<?= base_url('css/periodontograma.css') ?>">
    <link rel="stylesheet" href="<?= base_url('css/boton.css') ?>">
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>🦷 Periodontograma</h1>
      </div>

      <div class="main-content">
        <!-- ARCADA SUPERIOR -->
        <div class="arcada">
          <div class="barra-superior">
            <div class="arcada-title">ARCADA SUPERIOR</div>
            <button id="voz" class="button-container">🎤 Hablar</button>
          </div>
          <div class="arcada-wrapper">
            <div class="cuadrantes">
              <div
                class="dientes-container"
                id="arcada-superior-izquierda"
              ></div>
              <div class="dientes-container" id="arcada-superior-derecha"></div>
            </div>
          </div>
        </div>

        <!-- ARCADA INFERIOR -->
        <div class="arcada">
          <div class="arcada-wrapper">
            <div class="cuadrantes">
              <div
                class="dientes-container"
                id="arcada-inferior-izquierda"
              ></div>
              <div class="dientes-container" id="arcada-inferior-derecha"></div>
            </div>
          </div>
          <div class="barra-inferior">
            <div class="arcada-title">ARCADA INFERIOR</div>
            <button id="guardar" class="button-container-guardar">Guardar</button>
          </div>
        </div>
      </div>
    </div>
    <script src="<?= base_url('js/script.js') ?>"></script>
  </body>
</html>
