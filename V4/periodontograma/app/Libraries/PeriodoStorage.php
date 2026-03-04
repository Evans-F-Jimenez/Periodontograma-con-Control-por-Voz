<?php

namespace App\Libraries;

use App\Libraries\Periodontograma;

class PeriodoStorage
{
    private static array $periodos = [];

    public static function obtener(string $id): Periodontograma
    {
        if (!isset(self::$periodos[$id])) {
            log_message('info', "📂 Cargando periodontograma: {$id}");
            self::$periodos[$id] = new Periodontograma($id);
        }

        return self::$periodos[$id];
    }

        public function guardarJSON()
{
    $ruta = WRITEPATH . 'periodontogramas/periodontograma_' . $this->id . '.json';

    file_put_contents(
        $ruta,
        json_encode($this->dientes, JSON_PRETTY_PRINT)
    );
}
}