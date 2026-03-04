<?php

namespace App\Controllers;

class Periodontograma extends BaseController
{
    public function index()
    {
        return view('periodontograma_view');
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