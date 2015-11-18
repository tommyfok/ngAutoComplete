angular.module('ngAutoComplete', [])
.directive('ngAutoComplete', function () {
  return {
    restrict: 'AE',
    template: '<div class="nacContainer" ng-mouseleave="leaved=true" ng-mouseenter="leaved=false">'
             +'    <input placeholder="{{placeholder}}" type="{{type||\'text\'}}"'
             +'           ng-model="_input" class="form-control" ng-focus="showMorePkgs=true" ng-blur="cleanIfEmpty()" ng-keyup="isOneOf=false">'
             +'    <div class="nacOuter" ng-show="showMorePkgs">'
             +'      <div class="nacInner">'
             +'        <div ng-repeat="item in data | filter: _input"'
             +'             ng-click="set(item)" ng-bind-html="formatter(item)"></div>'
             +'      </div>'
             +'    </div>'
             +'</div>',
    scope: {
      input: '=ngModel',
      data: '=nacData',
      type: '@type',
      placeholder: '@placeholder',
      formatter: '=?nacFormatter',
      modelToOutput: '=?nacParser',
      onchange: '=?',
      cleanOnBlur: '=?'
    },
    require: 'ngModel',
    controller: function ($scope, $filter) {
      $scope.isOneOf = false;
      $scope.formatter = angular.isFunction($scope.formatter) ? $scope.formatter : rawReturn;
      $scope.modelToOutput = angular.isFunction($scope.modelToOutput) ? $scope.modelToOutput : rawReturn;

      $scope.set = function (item) {
        $scope.selectedItem = item;
        $scope._input = $scope.formatter(item);
        $scope.input = $scope.modelToOutput(item);
        $scope.rawItem = angular.copy(item);
        delete $scope.rawItem['$$hashKey'];
        $scope.isOneOf = true;
        $scope.showMorePkgs = false;
      };

      $scope.cleanIfEmpty = function () {
        if ($scope.leaved) {
          if ($scope.cleanOnBlur && !$scope.isOneOf) {
            $scope._input = '';
            $scope.rawItem = $scope.input = undefined;
          } else if (!$scope.isOneOf) {
            $scope.input = $scope._input;
            $scope.rawItem = undefined;
          }
        }
      }

      $scope.$watch('input', function (newVal, oldVal) {
        if (newVal != oldVal) {
          angular.isFunction($scope.onchange) && $scope.onchange($scope.rawItem || $scope.input);
        }
      });

      function rawReturn (item) {
        return item;
      }
    }
  };
});
