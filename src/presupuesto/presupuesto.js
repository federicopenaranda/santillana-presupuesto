export default function ($scope, $http) {

  $http({
      method: 'GET',
      url: 'http://localhost:8090/presupuesto-zonas'
    })
  .then(function(datosPpto) {
      $scope.pptoZonas = datosPpto.data;

      var ciudades = [];
      var presupuesto = [];

      var totalCantidad = 0, totalValor = 0;
      angular.forEach(datosPpto.data, function(el) {
          totalCantidad += el.Cantidad;
          totalValor += el.Total;
      });

      angular.forEach(datosPpto.data, function(el) {
          ciudades.push(el.Ciudad + ' | ' + Math.round(el.Total/totalValor * 100) + '%');
          presupuesto.push(el.Total);
      });

      $scope.pptoTotalCantidad = totalCantidad;
      $scope.pptoTotalValor = totalValor;

      $scope.labels = ciudades;
      $scope.data = presupuesto;
      $scope.options = {legend: {display: true}};
    
  })
  .catch(function(errRes) {
      console.log("Error:");
      console.log(errRes);
  });

}