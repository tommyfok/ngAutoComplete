angular.module('ngCombo', [])
.directive('ngCombo', function () {
  return {
    restrict: 'AE',
    template: '<div class="nacContainer" ng-mouseover="showUp=true" ng-mouseout="showUp=false">'
             +'    <div class="input-group">'
             +'      <input placeholder="{{placeholder}}" type="{{type||\'text\'}}"'
             +'             ng-model="input" class="form-control" ng-focus="showMorePkgs=true">'
             +'      <div class="input-group-btn">'
             +'        <button type="button" class="btn btn-default" ng-click="focusInput()">'
             +'          <span class="glyphicon glyphicon-chevron-down" ng-show="showUp&&showMorePkgs"></span>'
             +'          <span class="glyphicon glyphicon-chevron-up" ng-hide="showUp&&showMorePkgs"></span>'
             +'        </button>'
             +'      </div>'
             +'    </div>'
             +'    <div class="nacOuter" ng-show="showMorePkgs">'
             +'      <div class="nacInner">'
             +'        <div ng-repeat="item in data | filter: inputArray[inputArray.length-1]">'
             +'          <div class="unchecked" ng-if="inputArray.indexOf(item) === -1" ng-click="set(item)"> {{item}}</div>'
             +'          <div class="checked" ng-if="inputArray.indexOf(item) > -1" ng-click="unset(item)"><i class="glyphicon glyphicon-ok"></i> {{item}}</div>'
             +'        </div>'
             +'      </div>'
             +'    </div>'
             +'    <style>.nacContainer:hover .nacOuter{display: block;}.nacOuter{position: relative; display: none;}.nacInner{width: 100%; max-height: 250px; overflow: auto; position: absolute; left: 0; top: 0; z-index: 10; background: #fff; border: 1px solid #eee; border-top: none; box-shadow: 0 0 5px rgba(0,0,0,.1);}.nacInner div > div{padding: 10px; cursor: pointer;}.nacInner > div:hover{background: #fafafa; color: #369;}.nacInner div.checked{background:#fffaf0;border-bottom:1px dashed #eee}</style>'
             +'</div>',
    scope: {
      input: '=ngModel',
      data: '=ncData',
      type: '@type',
      placeholder: '@placeholder'
    },
    require: 'ngModel',
    link: function (scope, elem, attrs, ngModelCtrl) {
      scope.$watch('input', function (newVal, oldVal) {
        if (typeof scope.input === 'undefined') {
          scope.input = '';
        }
        scope.inputArray = scope.input.split(',');
      });

      scope.focusInput = function () {
        elem.find('input').focus();
      };

      scope.set = function (item) {
        if (scope.inputArray === []) {
          scope.inputArray = [item];
        } else {
          scope.inputArray.splice(scope.inputArray.length-1,1,[item]);
        }
        scope.inputArray = scope.inputArray.filter(function (item) {
          return item !== '';
        });
        scope.input = scope.inputArray.join(',') + ',';
      }

      scope.unset = function (item) {
        scope.inputArray.splice(scope.inputArray.indexOf(item), 1);
        scope.input = scope.inputArray.join(',');
      }

      ngModelCtrl.$parsers.push(function (viewValue) {
        console.log('viewValue')
      });
    }
  };
});
