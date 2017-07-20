export default function ($scope, $http) {

  $http({
      method: 'GET',
      url: 'http://localhost:8090/ventas_ppto-items'
    })
  .then(function(ventasPptoItems) {
      $scope.ventasPptoItems = ventasPptoItems.data;

      var items = [];
      var presupuesto = [];

      var 
        totalCantidadVentas = 0, 
        totalValorVentas = 0,
        totalCantidadPresupuesto = 0, 
        totalValorPresupuesto = 0;

      angular.forEach(ventasPptoItems.data, function(el) {
          totalCantidadVentas += el.cantidad_ventas;
          totalValorVentas += el.valor_ventas;
          totalCantidadPresupuesto += el.cantidad_presupuesto;
          totalValorPresupuesto += el.valor_presupuesto;

      });

      var dataPresupuesto = [],
          dataVentas = [];


      angular.forEach(ventasPptoItems.data, function(el) {
          items.push(el.item);
          el.avance_ppto = parseFloat(el.avance_ppto*100).toFixed(2);
          presupuesto.push(el.avance_ppto);
          dataPresupuesto.push(el.valor_presupuesto);
          dataVentas.push(el.valor_ventas);
      });

      $scope.series = ['Presupuestado', 'Ejecutado'];

      $scope.totalCantidadVentas = totalCantidadVentas;
      $scope.totalValorVentas = totalValorVentas;
      $scope.totalCantidadPresupuesto = totalCantidadPresupuesto;
      $scope.totalValorPresupuesto = totalValorPresupuesto;

      console.log(dataPresupuesto);
      console.log(dataVentas);

      $scope.labels = items;
      $scope.data = [ dataPresupuesto, dataVentas ];
      $scope.options = {legend: {display: true}};
    
  })
  .catch(function(errRes) {
      console.log("Error:");
      console.log(errRes);
  });


}