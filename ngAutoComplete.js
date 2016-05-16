angular
.module('ngAutoComplete', [])
.filter('redKeyword', function () {
  return function (str, keyword, bool) {
    var re = RegExp('(' + keyword + ')', 'gi');
    if (bool) {
      return re.test(str);
    } else {
      return keyword ? str.replace(re, '<span style="color:#f60">$1</span>') : str;
    }
  };
})
.directive('ngAutoComplete', function () {
  return {
    restrict: 'AE',
    template: '<div class="nacContainer">'
             +'    <input name="{{name}}"'
             +'           ng-model="_input"'
             +'           class="form-control"'
             +'           ng-focus="onInputFocus()"'
             +'           ng-blur="onInputBlur()"'
             +'           type="{{type||\'text\'}}"'
             +'           placeholder="{{placeholder}}"'
             +'           ng-keyup="onInputKeyUp($event)">'
             +'    <div class="nacOuter" ng-show="showMore">'
             +'        <div class="nacInner">'
             +'            <div ng-click="set(item)"'
             +'                 ng-bind-html="formatter(item)|redKeyword:_input"'
             +'                 ng-class="{active:(formatter(item)|redKeyword:_input:true)}"'
             +'                 ng-repeat="item in data|filter:(dropDown&&dropped)?\'\':_input"></div>'
             +'        </div>'
             +'    </div>'
             +'</div>',
    scope: {
      name: '@?',
      type: '@type',
      onchange: '=?',
      data: '=nacData',
      input: '=ngModel',
      cleanOnBlur: '=?',
      dropDown: '=?nacDropdown',
      placeholder: '@placeholder',
      formatter: '=?nacFormatter',
      modelToOutput: '=?nacParser'
    },
    require: 'ngModel',
    link: function ($scope, elem) {
      var elem = $(elem[0]);

      $scope.onInputKeyUp = function (e) {
        e.preventDefault();
        if (e.keyCode == 13 && elem.find('div.active').length == 1) {
          var items = $scope.getSelectedItems();
          if (items.length == 1) {
            $scope.set(items[0]);
          }
        } else {
          $scope.isOneOf = false;
        }
        $scope.dropped = false;
      };

      $scope.onInputFocus = function () {
        $scope.showMore = true;
        $scope.dropped = $scope.dropDown;
        setTimeout(function () {
          var items = elem.find('div.active');
          if (items.length == 1) {
            items[0].scrollIntoView();
          }
        }, 100);
      };

      $scope.onInputBlur = function () {
        setTimeout(function () {
          if ($scope.cleanOnBlur && !$scope.isOneOf) {
            $scope._input = '';
            $scope.rawItem = $scope.input = undefined;
            modifyModelFromInside = true;
          } else if (!$scope.isOneOf) {
            $scope.input = $scope._input;
            $scope.rawItem = undefined;
            modifyModelFromInside = true;
          }
          $scope.showMore = false;
          try {
            $scope.$digest();
          } catch (e) {}
        }, 100);
      };
    },
    controller: function ($scope, $filter, $timeout) {
      var modifyModelFromInside;

      $scope.dropDown = (typeof $scope.dropDown === 'boolean') ? $scope.dropDown : true;
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
        $scope.showMore = false;
        modifyModelFromInside = true;
      };

      $scope.$watch('input', function (newVal, oldVal) {
        if (newVal != oldVal) {
          var returnValue = modifyModelFromInside ? ($scope.rawItem || $scope.input) : $scope.input;
          angular.isFunction($scope.onchange) && $scope.onchange(returnValue);
          $scope._input = modifyModelFromInside ? ($scope.rawItem ? $scope.formatter($scope.rawItem) : $scope.input) : $scope.input;
        }
        modifyModelFromInside = false;
      });

      $scope.getSelectedItems = function () {
        return $filter('filter')($scope.data, $scope._input);
      };

      function rawReturn (item) {
        return item;
      }
    }
  };
});
