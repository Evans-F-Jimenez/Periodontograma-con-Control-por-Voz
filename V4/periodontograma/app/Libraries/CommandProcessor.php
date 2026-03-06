<?php

namespace App\Libraries;

class CommandProcessor
{
    private Periodontograma $perio;

    private array $caras = [
        "vestibular" => ["vestibular", "bucal", "vesti"],
        "palatino"   => ["palatino", "palatina", "pala", "lingual", "lingu"],
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
        // -------------------
        // FURCA
        // -------------------
        if (str_contains($texto, "furca")) {

            $grado = null;
            foreach ($numeros as $n) {
                if ($n <= 3) $grado = $n;
            }

            if ($grado !== null) {
                return $this->ejecutarYGuardar(
                    $this->perio->registrarFurca($numDiente, $cara, $grado, "registrar")
                );
            }

            if (str_contains($texto, "limpiar")) {
                return $this->ejecutarYGuardar(
                    $this->perio->registrarFurca($numDiente, $cara, 0, "limpiar")
                );
            }
        }
        //--------------------
        // Anchura Encia
        // --------------------
        if (str_contains($texto, "encia")) {

            if (preg_match('/(\d+)$/', $texto, $valorMatch)) {
                $valor = intval($valorMatch[1]);

                $this->perio->registrarAnchuraEncia($numDiente, $valor);

                return ["ok" => true, "accion" => "anchura encia"];
            }
        }
        // ---------------------------
        // Profundidad de sondaje
        // ---------------------------

        if (str_contains($texto, "profundidad")) {

            $pos = $this->detectarPosicion($texto);

            if ($pos !== null && preg_match('/(\d+)$/', $texto, $m)) {
                $valor = intval($m[1]);

                $this->perio->registrarProfundidad(
                    $numDiente,
                    $cara,
                    $pos,
                    $valor
                );

                return ["ok"=>true, "accion" => "Profundidad"];
            }
        }
        // ---------------------------
        // Margen gingival
        // ---------------------------
        if (str_contains($texto, "MARGEN")) {

            $pos = $this->detectarPosicion($texto);

            if ($pos !== null && preg_match('/(\d+)$/', $texto, $m)) {
                $valor = intval($m[1]);

                $this->perio->registrarMargenGingival(
                    $numDiente,
                    $cara,
                    $pos,
                    $valor
                );

                return ["ok"=>true, "accion" => "Profundidad"];
            }
        }

        // ==========================================
        // SANGRADO / PLACA
        // ==========================================
        if ($this->contiene($texto, ["sangrado","placa"]) && $cara) {

            $tipo = str_contains($texto,"sangrado") ? "sangrado" : "placa";

            $pos = $this->detectarPosicion($texto);

            // ------------------------
            // LIMPIAR
            // ------------------------
            if ($this->contiene($texto, ["limpiar","borrar","eliminar"])) {

                for ($i=0; $i<3; $i++) {

                    if ($tipo === "sangrado") {

                        $this->perio->registrarSangrado(
                            $numDiente,
                            $cara,
                            $i,
                            "limpiar"
                        );

                    } else {

                        $this->perio->registrarPlaca(
                            $numDiente,
                            $cara,
                            $i,
                            "limpiar"
                        );
                    }
                }

                $this->perio->guardarJSON();

                return ["ok"=>true,"accion"=>"limpiar ".$tipo];
            }

            // ------------------------
            // REGISTRAR POSICIÓN
            // ------------------------
            if ($pos !== null) {

                if ($tipo === "sangrado") {

                    return $this->ejecutarYGuardar(
                        $this->perio->registrarSangrado(
                            $numDiente,
                            $cara,
                            $pos,
                            "registrar"
                        )
                    );

                } else {

                    return $this->ejecutarYGuardar(
                        $this->perio->registrarPlaca(
                            $numDiente,
                            $cara,
                            $pos,
                            "registrar"
                        )
                    );
                }
            }

            // ------------------------
            // REGISTRAR TODA LA CARA
            // ------------------------
            for ($i=0; $i<3; $i++) {

                if ($tipo === "sangrado") {

                    $this->perio->registrarSangrado(
                        $numDiente,
                        $cara,
                        $i,
                        "registrar"
                    );

                } else {

                    $this->perio->registrarPlaca(
                        $numDiente,
                        $cara,
                        $i,
                        "registrar"
                    );
                }
            }

            $this->perio->guardarJSON();

            return ["ok"=>true,"accion"=>$tipo];
        }
            
            // ------------------------
            // NIC
            // ------------------------
        if (str_contains($texto, "NIC")) {

            $pos = $this->detectarPosicion($texto);

            if ($pos !== null && preg_match('/(\d+)$/', $texto, $m)) {
                $valor = intval($m[1]);

                $this->perio->registrarNIC(
                    $numDiente,
                    $cara,
                    $pos,
                    $valor
                );

                return ["ok"=>true, "accion" => "NIC"];
            }
        }

        return ["ok" => false, "mensaje" => "Comando no reconocido"];
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
    
    private function detectarPosicion($texto)
    {
        if (str_contains($texto, "mesial")) return 0;

        if (str_contains($texto, "centro") || str_contains($texto, "central")) return 1;

        if (str_contains($texto, "distal")) return 2;

        return null;
    }
}