

angular.module('draggableBgExample', ['chieffancypants.draggableBg'])
  .controller('ExampleCtrl', function ($scope, $rootScope, $http, $timeout) {
    $scope.images = [
      {url: 'http://c2.staticflickr.com/6/5695/20824517862_866a0bb7c1_h.jpg', posX: -100, posY: 0},
      {url: 'http://c2.staticflickr.com/6/5767/20810643016_fd4af72a49_b.jpg', posX: -40, posY: 0},
    ];

    $scope.anotherImage = { url: 'http://c1.staticflickr.com/1/620/20660927439_c282c95dc2_h.jpg'  };

    $rootScope.$on('draggableBg:repositioned', function (event, args) {
      console.log($scope.images, args);
    })
  });
