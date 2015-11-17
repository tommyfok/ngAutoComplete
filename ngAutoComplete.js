angular.module('ngAutoComplete', [])
.directive('ngAutoComplete', function () {
  return {
    restrict: 'AE',
    template: '<div class="nacContainer" ng-mouseleave="cleanIfEmpty()">'
             +'    <input placeholder="{{placeholder}}" type="{{type||\'text\'}}"'
             +'           ng-model="_input" class="form-control" ng-focus="showMorePkgs=true" ng-keyup="isOneOf=false">'
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
      $scope.modelToOutput = angular.isFunction($scope.modelToOutput) ? $scope.modelToOutput : false;

      $scope.set = function (item) {
        $scope.selectedItem = item;
        $scope._input = $scope.formatter(item);
        $scope.input = $scope.modelToOutput ? $scope.modelToOutput(item) : $scope._input;
        $scope.isOneOf = true;
        $scope.showMorePkgs = false;
      };

      $scope.cleanIfEmpty = function () {
        if ($scope.cleanOnBlur && !$scope.isOneOf) {
          $scope._input = '';
          $scope.input = undefined;
        } else if (!$scope.isOneOf) {
          $scope.input = $scope._input;
        }
      }

      $scope.$watch('input', function (newVal, oldVal) {
        if (newVal != oldVal) {
          angular.isFunction($scope.onchange) && $scope.onchange($scope.input);
        }
      });

      function rawReturn (item) {
        return item;
      }
    }
  };
});
