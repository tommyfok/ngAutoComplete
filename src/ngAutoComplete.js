import './ngAutoComplete.less';

var modifyModelFromInside;

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
    template: require('./ngAutoComplete.html'),
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
