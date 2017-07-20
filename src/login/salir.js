export default function ($rootScope, $scope, $http, $window, $state) {

  $http.get('http://localhost:8090/salir')
  .then (function(response) {
      $scope.loggedUser = response;
      $rootScope.privilegios = [];
      $state.go ('login');
  });

}