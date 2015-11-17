angular.module('ngAutoComplete', [])
.directive('ngAutoComplete', function () {
  return {
    restrict: 'AE',
    template: '<div class="nacContainer">'
             +'    <input placeholder="{{placeholder}}" type="{{type||\'text\'}}"'
             +'           ng-model="_input" class="form-control" ng-focus="showMorePkgs=true" ng-blur="cleanIfEmpty()">'
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
    controller: function ($scope) {
      $scope.formatter = angular.isFunction($scope.formatter) ? $scope.formatter : rawReturn;
      $scope.modelToOutput = angular.isFunction($scope.modelToOutput) ? $scope.modelToOutput : rawReturn;

      $scope.set = function (item) {
        $scope.showMorePkgs = false;
        $scope._input = $scope.formatter(item);
        $scope.input = $scope.modelToOutput(item);
        angular.isFunction($scope.onchange) && $scope.onchange($scope.input, item);
      };

      $scope.cleanIfEmpty = function () {
        if ($scope.cleanOnBlur) {
          $scope._input = '';
          $scope.input = undefined;
        }
      }

      function rawReturn (item) {
        return item;
      }
    }
  };
});
