<?php

namespace App\Libraries;

class CommandProcessor
{
    private Periodontograma $perio;

    private array $caras = [
        "vestibular" => ["vestibular", "bucal", "vesti"],
        "palatino"   => ["palatino", "palatina", "pala", "lingual", "lingu"],
    ];

    private array $posiciones = [
        "mesial"  => 0,
        "centro"  => 1,
        "central" => 1,
        "medio"   => 1,
        "distal"  => 2
    ];

    public function __construct(Periodontograma $perio)
    {
        $this->perio = $perio;
    }

    // ===============================
    // EJECUTAR Y GUARDAR
    // ===============================
    private function ejecutarYGuardar($resultado)
    {
        if ($resultado) {
            $this->perio->guardarJSON();
        }
        return $resultado;
    }

    // ===============================
    // PROCESADOR PRINCIPAL
    // ===============================
    public function procesar(?string $texto)
    {
        if (!$texto) return false;

        $texto = strtolower(trim($texto));
        $texto = str_replace([",", " "], "", $texto);

        // ---------- SALIR ----------
        if ($this->contiene($texto, ["salir","finalizar","cerrar"])) {
            return "SALIR";
        }

        // ---------- EXPORTAR ----------
        if (str_contains($texto, "exportar") || str_contains($texto, "guardar")) {
            $file = $this->perio->exportarJSON();
            return ["action" => "exportar", "file" => $file];
        }

        // ---------- DETECTAR DIENTE ----------
        if (!preg_match('/(?:diente)?(\d+)/', $texto, $match)) {
            return false;
        }

        $numDiente = (int)$match[1];

        // ---------- AUSENTE ----------
        if ($this->contiene($texto, ["ausente","falta","perdido"])) {
            return $this->ejecutarYGuardar(
                $this->perio->marcarAusente($numDiente, true)
            );
        }

        if ($this->contiene($texto, ["presente"])) {
            return $this->ejecutarYGuardar(
                $this->perio->marcarAusente($numDiente, false)
            );
        }

        // ---------- IMPLANTE ----------
        if ($this->contiene($texto, ["implante","repuesto","falso"])) {
            return $this->ejecutarYGuardar(
                $this->perio->marcarImplante($numDiente, true)
            );
        }

        if ($this->contiene($texto, ["original"])) {
            return $this->ejecutarYGuardar(
                $this->perio->marcarImplante($numDiente, false)
            );
        }

        // ---------- CARA ----------
        $cara = $this->detectarCara($texto);

        // ---------- NÚMEROS ----------
        preg_match_all('/\d+/', $texto, $nums);
        $numeros = array_filter(
            array_map('intval', $nums[0]),
            fn($n) => $n !== $numDiente
        );

        // ==========================================
        // MOVILIDAD
        // ==========================================
        if (str_contains($texto, "movilidad")) {

            $grado = null;
            foreach ($numeros as $n) {
                if ($n <= 3) $grado = $n;
            }

            if ($grado !== null) {
                return $this->ejecutarYGuardar(
                    $this->perio->registrarMovilidad($numDiente, $grado, "registrar")
                );
            }

            if (str_contains($texto, "limpiar")) {
                return $this->ejecutarYGuardar(
                    $this->perio->registrarMovilidad($numDiente, 0, "limpiar")
                );
            }
        }

        // ==========================================
        // Aquí debes replicar exactamente los bloques:
        // - PROFUNDIDAD
        // - FURCA
        // - SANGRADO
        // - PLACA
        // - MARGEN GINGIVAL
        // - NIC
        // - ENCÍA
        // (idénticos a tu versión JS pero en sintaxis PHP)
        // ==========================================

        return false;
    }

    // ===============================
    // HELPERS
    // ===============================

    private function contiene(string $texto, array $palabras): bool
    {
        foreach ($palabras as $p) {
            if (str_contains($texto, $p)) {
                return true;
            }
        }
        return false;
    }

    private function detectarCara(string $texto): ?string
    {
        foreach ($this->caras as $nombre => $palabras) {
            foreach ($palabras as $p) {
                if (str_contains($texto, $p)) {
                    return $nombre;
                }
            }
        }
        return null;
    }
}