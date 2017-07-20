export default function ($rootScope, $scope, $http, $window, $state) {
	$scope.loggedUser = [];

	$scope.username = 'prueba';
	$scope.password = '92j9fje29j982fz';

  	$scope.onLogin = function (username, password) {
    	$http.get('http://localhost:8090/login-santillana', {
  			params: {
  				"username": encodeURI(username),
  				"password": encodeURI(password)
  			}
	    })
	    .then (function(response) {

      		if (response.data.success == 'true')
      		{
            var theStatus = new Object;

            for (var i=0;i<response.data.privilegios.length;i++)
            {
              var theName = response.data.privilegios[i];
              theStatus[theName] = 1;
            }

            $rootScope.privilegios = theStatus;
            console.log($rootScope.privilegios);
      			//$window.location = './dashboard';
            $state.go('dashboard');
      		}
      		else
      		{
      			$scope.error = 'Error de autenticación. Intente nuevamente.';
      		}
    	});
  	};


}
