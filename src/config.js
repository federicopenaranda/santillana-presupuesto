import angular from 'angular';
import uiRouter from 'angular-ui-router';
import loginController from 'login/login';
import salirController from 'login/salir';
import dashboardController from 'dashboard/dashboard';
import datepicker from 'angular-ui-bootstrap/src/datepickerPopup';
import modal from 'angular-ui-bootstrap/src/modal';
import chart from 'angular-chart.js';

import importarVentasController from 'importar-ventas/importar-ventas';
import presupuestoController from 'presupuesto/presupuesto';

import pptoVentasConsolidadoController from 'ventas_ppto/ventas_ppto-consolidado';
import pptoVentasZonasController from 'ventas_ppto/ventas_ppto-zonas';
import pptoVentasProductosController from 'ventas_ppto/ventas_ppto-productos';
import pptoVentasDelegadosController from 'ventas_ppto/ventas_ppto-delegados';
import pptoVentasLineasNegocioController from 'ventas_ppto/ventas_ppto-lineasnegocio';
var uiBootstrap = require('angular-ui-bootstrap');

const app = angular.module('app', [uiBootstrap, uiRouter, datepicker, modal, chart]);

app.config(($stateProvider, $urlRouterProvider, $locationProvider, $controllerProvider) => {
	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('login', {
			url: '/',
			template: require('login/login.html'),
			controller: loginController
		})
		.state('salir', {
			url: '/salir',
			//template: require('dashboard/dashboard.html'),
			controller: salirController
		})
		.state('dashboard', {
			url: '/dashboard',
			template: require('dashboard/dashboard.html'),
			controller: dashboardController
		})
		.state('importar-ventas', {
			url: '/importar-ventas',
			template: require('importar-ventas/importar-ventas.html'),
			controller: importarVentasController
		})
		.state('presupuesto', {
			url: '/presupuesto',
			template: require('presupuesto/presupuesto.html'),
			controller: presupuestoController
		})

		.state('ventas_ppto-consolidado', {
			url: '/ventas_ppto-consolidado',
			template: require('ventas_ppto/ventas_ppto-consolidado.html'),
			controller: pptoVentasConsolidadoController
		})
		.state('ventas_ppto-zonas', {
			url: '/ventas_ppto-zonas',
			template: require('ventas_ppto/ventas_ppto-zonas.html'),
			controller: pptoVentasZonasController
		})
		.state('ventas_ppto-productos', {
			url: '/ventas_ppto-productos',
			template: require('ventas_ppto/ventas_ppto-productos.html'),
			controller: pptoVentasProductosController
		})
		.state('ventas_ppto-delegados', {
			url: '/ventas_ppto-delegados',
			template: require('ventas_ppto/ventas_ppto-delegados.html'),
			controller: pptoVentasDelegadosController
		})
		.state('ventas_ppto-lineasnegocio', {
			url: '/ventas_ppto-lineasnegocio',
			template: require('ventas_ppto/ventas_ppto-lineasnegocio.html'),
			controller: pptoVentasLineasNegocioController
		})



	$locationProvider.html5Mode(true);

} );

export default app;