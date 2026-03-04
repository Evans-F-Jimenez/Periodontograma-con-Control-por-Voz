<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\PeriodoStorage;
use App\Libraries\CommandProcessor;

class PeriodontogramaController extends BaseController
{
    // 🔹 Procesar comando (voz o texto)
    public function comando($id)
    {
        try {

            $json = $this->request->getJSON(true);
            $texto = $json['texto'] ?? null;

            if (!$texto) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Texto requerido']);
            }

            $perio = PeriodoStorage::obtener($id);
            $processor = new CommandProcessor($perio);

            $result = $processor->procesar($texto);

            // ✅ Guardado automático tras comando válido
            $perio->guardarJSON();

            return $this->response->setJSON([
                'ok' => true,
                'result' => $result
            ]);

        } catch (\Throwable $e) {

            log_message('error', $e->getMessage());

            return $this->response->setStatusCode(500)
                ->setJSON([
                    'ok' => false,
                    'error' => 'Error interno'
                ]);
        }
    }

    // 🔹 Obtener periodontograma
    public function obtener($id)
    {
        try {

            $perio = PeriodoStorage::obtener($id);

            return $this->response->setJSON($perio->dientes);

        } catch (\Throwable $e) {

            log_message('error', $e->getMessage());

            return $this->response->setStatusCode(500)
                ->setJSON([
                    'ok' => false,
                    'error' => 'Error interno'
                ]);
        }
    }

    // 🔹 Guardar desde UI
    public function guardar($id)
    {
        try {

            $data = $this->request->getJSON(true);

            if (!$data || !is_array($data)) {
                return $this->response->setStatusCode(400)
                    ->setJSON(['error' => 'Datos inválidos']);
            }

            $perio = PeriodoStorage::obtener($id);

            $perio->dientes = $data;
            $perio->guardarJSON();

            return $this->response->setJSON(['ok' => true]);

        } catch (\Throwable $e) {

            log_message('error', $e->getMessage());

            return $this->response->setStatusCode(500)
                ->setJSON([
                    'ok' => false,
                    'error' => 'Error guardando'
                ]);
        }
    }
}