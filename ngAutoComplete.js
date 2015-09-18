angular.module('ngAutoComplete', [])
.directive('ngAutoComplete', function () {
  return {
    restrict: 'AE',
    template: '<div class="nacContainer">'
             +'    <input placeholder="{{placeholder}}" type="{{type||\'text\'}}"'
             +'           ng-value="input" class="form-control" ng-focus="showMorePkgs=true" ng-keypress="parse($event)">'
             +'    <div class="nacOuter" ng-show="showMorePkgs">'
             +'      <div class="nacInner">'
             +'        <div ng-repeat="item in data | filter: inputArray[inputArray.length-1]" ng-click="set(item)" ng-bind="item"></div>'
             +'      </div>'
             +'    </div>'
             +'    <style>.nacContainer:hover .nacOuter{display: block;}.nacOuter{position: relative; display: none;}.nacInner{width: 100%; max-height: 250px; overflow: auto; position: absolute; left: 0; top: 0; z-index: 10; background: #fff; border: 1px solid #eee; border-top: none; box-shadow: 0 0 5px rgba(0,0,0,.1);}.nacInner > div{padding: 10px; cursor: pointer;}.nacInner > div:hover{background: #fafafa; color: #f60;}</style>'
             +'</div>',
    scope: {
      input: '=ngModel',
      data: '=nacData',
      type: '@type',
      placeholder: '@placeholder'
    },
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModelCtrl) {
      scope.inputArray = [];

      scope.parse = function (event) {
        scope.inputArray = scope.input.split(',');
      };

      scope.set = function (item) {
        if (item) {
          scope.inputArray.push(item);
        }
        scope.input = scope.inputArray.join(',');
      };
    }
  };
});
