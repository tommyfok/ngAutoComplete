angular
.module('ngAutoComplete', [])
.filter('redKeyword', function () {
  function escapeRegExp (str) {
    if (typeof str === 'string') {
      var specials = '([' + ('\\+*.|()[]{}-').split('').join('\\') + '])';
      var re = new RegExp(specials, 'gi');
      return str.replace(re, '\\$1');
    } else {
      return str;
    }
  }

  return function (str, keyword, bool) {
    if (!keyword) {
      return str;
    }
    var re = RegExp('(' + escapeRegExp(keyword) + ')', 'gi');
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
    template: '<div class="nacContainer" ng-mouseenter="mouseover=true" ng-mouseleave="onMouseLeave()">'
             +'    <input name="{{name}}"'
             +'           ng-model="_input"'
             +'           class="form-control"'
             +'           ng-blur="onInputBlur()"'
             +'           ng-focus="onInputFocus()"'
             +'           type="{{type||\'text\'}}"'
             +'           ng-class="{cp:inputBlured}"'
             +'           placeholder="{{placeholder}}"'
             +'           ng-keyup="onInputKeyUp($event)">'
             +'    <div class="icon-dropdown" ng-class="{up:showMore}"></div>'
             +'    <div class="nacOuter" ng-show="showMore">'
             +'        <div class="nacInner">'
             +'            <div ng-click="set(item)"'
             +'                 ng-bind-html="formatter(item)|redKeyword:_input"'
             +'                 ng-class="{active:(formatter(item)|redKeyword:_input:true)}"'
             +'                 ng-repeat="item in data|filter:(dropDown&&dropped)?\'\':_input track by $index"></div>'
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

      $scope.onMouseLeave = function () {
        if ($scope.inputBlured) {
          $scope.showMore = false;
        }
        $scope.mouseover = false;
      };

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
        $scope.inputBlured = false;
        $scope.showMore = true;
        $scope.dropped = $scope.dropDown;
        setTimeout(function () {
          var items = elem.find('div.active'), item;
          if (items.length == 1) {
            item = items[0];
            item.parentNode.scrollTop = item.offsetTop;
          }
        }, 100);
      };

      $scope.onInputBlur = function () {
        $scope.inputBlured = true;
        if (!$scope.mouseover) {
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
        }
      };
    },
    controller: function ($scope, $filter, $timeout) {
      var modifyModelFromInside;
      var formatterParserErr = {count:0};
      var inputChangeErr = {count:0};

      $scope.dropDown = (typeof $scope.dropDown === 'boolean') ? $scope.dropDown : true;
      $scope.isOneOf = false;
      try {
        $scope.formatter = angular.isFunction($scope.formatter) ? $scope.formatter : rawReturn;
        $scope.modelToOutput = angular.isFunction($scope.modelToOutput) ? $scope.modelToOutput : rawReturn;
      } catch (e) {
        formatterParserErr.count++;
        console.log(e);
      }
      $scope.inputBlured = true;

      $scope.set = function (item) {
        if (formatterParserErr.count > 10) {
          console.log('err count greater 10, retry 3s later.');
          if (!formatterParserErr.timer) {
            formatterParserErr.timer = setTimeout(function () {
              formatterParserErr.count = 0;
              clearTimeout(formatterParserErr.timer);
            }, 3000);
          }
          return;
        }
        $scope.selectedItem = item;
        try {
          $scope._input = $scope.formatter(item);
          $scope.input = $scope.modelToOutput(item);
        } catch (e) {
          formatterParserErr.count++;
          console.log(e);
        }
        $scope.rawItem = angular.copy(item);
        $scope.isOneOf = true;
        $scope.showMore = false;
        modifyModelFromInside = true;
      };

      $scope.$watch('input', function (newVal, oldVal) {
        if (inputChangeErr.count > 10) {
          console.log('err count greater 10, retry 3s later.');
          if (!inputChangeErr.timer) {
            inputChangeErr.timer = setTimeout(function () {
              inputChangeErr.count = 0;
              clearTimeout(inputChangeErr.timer);
            }, 3000);
          }
          return;
        }
        try {
          if (newVal != oldVal) {
            var returnValue = modifyModelFromInside ? ($scope.rawItem || $scope.input) : $scope.input;
            angular.isFunction($scope.onchange) && $scope.onchange(returnValue);
            $scope._input = modifyModelFromInside ? ($scope.rawItem ? $scope.formatter($scope.rawItem) : $scope.input) : $scope.input;
            if (!modifyModelFromInside) {
              $scope.set($scope.input);
              modifyModelFromInside = true;
            } else {
              modifyModelFromInside = false;
            }
          } else {
            modifyModelFromInside = false;
          }
        } catch (e) {
          inputChangeErr.count++;
          console.log(e);
        }
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
