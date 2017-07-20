export default function ($scope, $http) {

	$scope.items2 = [];

    $scope.onSincronizaProductosClick = function () {
   		$scope.items2.push( {texto: 'Iniciando Sincronización...'} );

   		console.log($scope.items2);

		$http({
		    method: 'GET',
		    url: 'http://localhost:8090/sincronizar-items'
	  	})
	    .then(function(result) {
			console.log(result);
    		$scope.items2.push( {texto: "Libros Importados: " + result.data.affectedRows} );
	    })
	    .catch(function(errRes) {
		      console.log("Error:");
		      console.log(errRes);
	    });
	}

}