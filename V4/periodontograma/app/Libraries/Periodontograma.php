<?php

namespace App\Libraries;

class Periodontograma
{
    public string $id;
    public string $filePath;
    public array $dientes = [];
    private bool $dirty = false;
    
    public function __construct(string $id)
    {
        if (!$id) {
            throw new \Exception("Se requiere un ID para el periodontograma");
        }

        $this->id = $id;

        $this->filePath = WRITEPATH .
            'periodontogramas/periodontograma_' .
            $this->id .
            '.json';

        $todos = [
            18,17,16,15,14,13,12,11,
            21,22,23,24,25,26,27,28,
            31,32,33,34,35,36,37,38,
            41,42,43,44,45,46,47,48
        ];

        // Si ya existe archivo → cargar
        if (file_exists($this->filePath)) {

            $contenido = file_get_contents($this->filePath);
            $this->dientes = json_decode($contenido, true);

            log_message('info', "✔ Periodontograma cargado desde archivo");

        } else {

            foreach ($todos as $n) {
                $this->dientes[$n] = $this->crearDiente();
            }

            $dir = dirname($this->filePath);

            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }

            $this->guardarJSON();

            log_message('info', "✔ Nuevo periodontograma creado");
        }
    }

    // ===============================
    // AUTOGUARDADO
    // ===============================
    public function guardarJSON(): void
    {
        
        foreach (array_keys($this->dientes) as $num) {
            $this->sanitizarDiente($num);
        }

        file_put_contents(
            $this->filePath,
            json_encode($this->dientes, JSON_PRETTY_PRINT)
        );

        log_message('info', "✔ Autoguardado backend");
    }

    // ===============================
    // ESTRUCTURA BASE
    // ===============================

    private function crearDiente(): array
    {
        return [
            "ausente" => false,
            "implante" => false,
            "movilidad" => 0,
            "anchuraEncia" => 0,
            "vestibular" => $this->crearCara(),
            "palatino" => $this->crearCara()
        ];
    }

    private function crearCara(): array
    {
        return [
            "furca" => 0,
            "sangrado" => [false, false, false],
            "placa" => [false, false, false],
            "margenGingival" => [0, 0, 0],
            "profundidadSondaje" => [0, 0, 0],
            "NIC" => [0, 0, 0]
        ];
    }

    // ===============================
    // MÉTODOS CLÍNICOS
    // ===============================

    public function marcarAusente(int $diente, bool $estado): bool
    {
        if (isset($this->dientes[$diente])) {
            $this->dientes[$diente]["ausente"] = $estado;
            return true;
        }
        return false;
    }

    public function marcarImplante(int $diente, bool $estado): bool
    {
        if (isset($this->dientes[$diente])) {
            $this->dientes[$diente]["implante"] = $estado;
            return true;
        }
        return false;
    }

    public function registrarProfundidad(int $diente, string $cara, int $posicion, int $valor): bool
    {
        if (!isset($this->dientes[$diente])) return false;

        $caraReal = $cara === "lingual" ? "palatino" : $cara;

        if ($posicion >= 0 && $posicion < 3) {
            $this->dientes[$diente][$caraReal]["profundidadSondaje"][$posicion] = $valor;
            return true;
        }

        return false;
    }

    public function registrarMovilidad(int $diente, int $grado, string $accion): bool
    {
        if (!isset($this->dientes[$diente])) return false;

        if ($accion === "registrar" && $grado >= 0 && $grado <= 3) {
            $this->dientes[$diente]["movilidad"] = $grado;
            return true;
        }

        if ($accion === "limpiar") {
            $this->dientes[$diente]["movilidad"] = 0;
            return true;
        }

        return false;
    }

    public function registrarFurca(int $diente, string $cara, int $grado, string $accion): bool
    {
        if (!isset($this->dientes[$diente]) || $this->dientes[$diente]["ausente"]) return false;

        $caraReal = $cara === "lingual" ? "palatino" : $cara;

        if ($accion === "registrar" && $grado >= 0 && $grado <= 3) {
            $this->dientes[$diente][$caraReal]["furca"] = $grado;
            return true;
        }

        return false;
    }

    public function registrarSangrado(int $diente, string $cara, int $posicion, string $accion): bool
    {
        if (!isset($this->dientes[$diente]) || $this->dientes[$diente]["ausente"]) return false;

        $caraReal = $cara === "lingual" ? "palatino" : $cara;

        if ($posicion >= 0 && $posicion < 3) {
            $this->dientes[$diente][$caraReal]["sangrado"][$posicion] =
                $accion === "registrar";
            return true;
        }

        return false;
    }

    public function registrarPlaca(int $diente, string $cara, int $posicion, string $accion): bool
    {
        if (
            !isset($this->dientes[$diente]) ||
            $this->dientes[$diente]["ausente"] ||
            $this->dientes[$diente]["implante"]
        ) return false;

        $caraReal = $cara === "lingual" ? "palatino" : $cara;

        if ($posicion >= 0 && $posicion < 3) {
            $this->dientes[$diente][$caraReal]["placa"][$posicion] =
                $accion === "registrar";
            return true;
        }

        return false;
    }

    public function registrarMargenGingival(int $diente, string $cara, int $posicion, int $valor): bool
    {
        if (!isset($this->dientes[$diente]) || $this->dientes[$diente]["ausente"]) return false;

        $caraReal = $cara === "lingual" ? "palatino" : $cara;

        if ($posicion >= 0 && $posicion < 3) {
            $this->dientes[$diente][$caraReal]["margenGingival"][$posicion] = $valor;
            return true;
        }

        return false;
    }

    public function registrarNIC(int $diente, string $cara, int $posicion, int $valor): bool
    {
        if (!isset($this->dientes[$diente])) return false;

        $caraReal = $cara === "lingual" ? "palatino" : $cara;

        if ($posicion >= 0 && $posicion < 3) {
            $this->dientes[$diente][$caraReal]["NIC"][$posicion] = $valor;
            return true;
        }

        return false;
    }

    public function registrarAnchuraEncia(int $diente, int $valor): bool
    {
        if (
            isset($this->dientes[$diente]) &&
            !$this->dientes[$diente]["ausente"] &&
            $valor >= 0
        ) {
            $this->dientes[$diente]["anchuraEncia"] = $valor;
            return true;
        }

        return false;
    }

    // ===============================
    // EXPORTACIÓN MANUAL
    // ===============================

    public function exportarJSON(): string
    {
        $dir = WRITEPATH . 'periodontogramas/';

        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        $file = 'periodontograma_' . $this->id . '.json';

        file_put_contents(
            $dir . $file,
            json_encode($this->dientes, JSON_PRETTY_PRINT)
        );

        return $file;
    }

    // ===============================
    // SANITIZACIÓN
    // ===============================

    private function sanitizarDiente($num): void
    {
        $d = $this->dientes[$num] ?? null;

        if (!$d) return;

        if ($d["ausente"]) {

            $this->dientes[$num]["movilidad"] = 0;
            $this->dientes[$num]["anchuraEncia"] = 0;

            $this->dientes[$num]["vestibular"] = $this->crearCara();
            $this->dientes[$num]["palatino"] = $this->crearCara();
        }
    }
}