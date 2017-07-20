export default function ($scope, $http) {

  $http({
      method: 'GET',
      url: 'http://localhost:8090/ventas_ppto-consolidado'
    })
  .then(function(ventasPptoConsolidado) {
      $scope.ventasPptoConsolidado = ventasPptoConsolidado.data;

      var consolidado = [];
      var presupuesto = [];

      var 
        totalCantidadVentas = 0, 
        totalValorVentas = 0,
        totalCantidadPresupuesto = 0, 
        totalValorPresupuesto = 0;

      angular.forEach(ventasPptoConsolidado.data, function(el) {
          totalCantidadVentas += el.cantidad_ventas;
          totalValorVentas += el.valor_ventas;
          totalCantidadPresupuesto += el.cantidad_presupuesto;
          totalValorPresupuesto += el.valor_presupuesto;

      });

      var dataPresupuesto = [],
          dataVentas = [];


      angular.forEach(ventasPptoConsolidado.data, function(el) {
          consolidado.push(el.consolidado);
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

      $scope.labels = consolidado;
      $scope.data = [ dataPresupuesto, dataVentas ];
      $scope.data = [ dataPresupuesto, dataVentas ];
      $scope.options = {
        scales: {
          yAxes: [{
            ticks: {
                min: 0,
                beginAtZero:true
            }
          }]
        }   
  };

    
  })
  .catch(function(errRes) {
      console.log("Error:");
      console.log(errRes);
  });


}