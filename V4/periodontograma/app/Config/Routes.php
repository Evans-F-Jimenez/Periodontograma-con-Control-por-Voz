<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Periodontograma::index');
$routes->get('periodontograma', 'Periodontograma::index');

$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {

    $routes->post('comando/(:segment)', 'PeriodontogramaController::comando/$1');
    $routes->get('periodontograma/(:segment)', 'PeriodontogramaController::obtener/$1');
    $routes->post('periodontograma/(:segment)', 'PeriodontogramaController::guardar/$1');

});