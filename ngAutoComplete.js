angular.module('ngAutoComplete', [])
.directive('ngAutoComplete', function () {
  return {
    restrict: 'AE',
    template: '<div class="nacContainer">'
             +'    <input placeholder="{{placeholder}}" type="{{type||\'text\'}}"'
             +'           ng-model="input" class="form-control" ng-focus="showMorePkgs=true">'
             +'    <div class="nacOuter" ng-show="showMorePkgs">'
             +'      <div class="nacInner">'
             +'        <div ng-repeat="item in data | filter: input"'
             +'             ng-click="set(item)" ng-bind-html="formatter(item)"></div>'
             +'      </div>'
             +'    </div>'
             +'    <style>.nacContainer:hover .nacOuter{display: block;}.nacOuter{position: relative; display: none;}.nacInner{width: 100%; max-height: 250px; overflow: auto; position: absolute; left: 0; top: 0; z-index: 10; background: #fff; border: 1px solid #eee; border-top: none; box-shadow: 0 0 5px rgba(0,0,0,.1);}.nacInner > div{padding: 10px; cursor: pointer;}.nacInner > div:hover{background: #fafafa; color: #f60;}</style>'
             +'</div>',
    scope: {
      input: '=ngModel',
      data: '=nacData',
      type: '@type',
      placeholder: '@placeholder',
      formatter: '=?nacFormatter',
      parser: '=?nacParser'
    },
    require: 'ngModel',
    controller: function ($scope) {
      $scope.formatter = angular.isFunction($scope.formatter) ? $scope.formatter : rawReturn;
      $scope.parser = angular.isFunction($scope.parser) ? $scope.parser : rawReturn;

      $scope.set = function (item) {
        $scope.input = $scope.parser(item);
        $scope.showMorePkgs = false;
      };

      function rawReturn (item) {
        return item;
      }
    }
  };
});
