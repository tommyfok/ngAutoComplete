import './ngAutoComplete.less';

angular
.module('ngAutoComplete', [])
.filter('redKeyword', function () {
    function escapeRegExp(str) {
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
            return keyword ? (str ? str.replace(re, '<span style="color:#d40">$1</span>') : str) : str;
        }
    };
})
.directive('ngAutoComplete', ['$filter', '$timeout', function ($filter, $timeout) {
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
            placeholder: '@placeholder',
            formatter: '=?nacFormatter',
            parser: '=?nacParser'
        },
        require: 'ngModel',
        link: function ($scope, $elem, $attrs) {
            // 变量
            var currentItem;
            var el              = $($elem);
            var inputElem       = el.find('input');
            var dorpdownElem    = el.find('.nacOuter');
            var isOverComponent = false;
            var isBlur          = true;
            var isDirty         = false;
            var blurWithCommit  = true;

            // 数据
            $scope.filteredList = $scope.data;

            // 公开方法和属性
            $scope.formatter = $scope.formatter || _rawOutput;
            $scope.parser    = $scope.parser || _rawOutput;
            $scope.set       = _setItem;

            // 事件侦听
            $scope.onfocus          = _onfocus;
            $scope.onblur           = _onblur;
            $scope.onkeydown        = _onkeydown;
            $scope.onentercomponent = _onentercomponent;
            $scope.onleavecomponent = _onleavecomponent;

            // 变量侦听
            $scope.$watch('domInput', _updateFilterList);
            $scope.$watch('input', _oninputchange, true);
            $scope.$watch('data', _oninputchange, true);

            // 私有函数
            function _setItem (item) {
                if (item) {
                    // 设置一个item
                    currentItem = item;
                    $scope.domInput = $scope.formatter(item);
                    $scope.input = $scope.parser(item);
                    blurWithCommit = false;
                    inputElem.trigger('blur');
                } else {
                    $scope.domInput = '';
                    $scope.input = undefined;
                }

                $scope.showMore = false;
            }

            function _clearItem () {
                _setItem();
            }

            function _rawOutput (item) {
                return item;
            }

            function _onfocus () {
                var items, itemIndex;
                isDirty = false;
                isBlur = false;
                $scope.filteredList = $scope.data;
                $scope.showMore = true;

                if (currentItem) {
                    setTimeout(function () {
                        items = el.find('.nacInner > div').removeClass('active');
                        itemIndex = $scope.filteredList.indexOf(currentItem);
                        items.eq(itemIndex).addClass('active');
                        _centerActiveItem();
                    });
                }
            }

            function _onblur () {
                isBlur = true;
                if (!isOverComponent) {
                    $scope.showMore = false;
                    if (blurWithCommit) {
                        _defaultCommit();
                    } else {
                        blurWithCommit = true;
                    }
                }
            }

            function _onkeydown (e) {
                var container = el.find('.nacInner');
                var items = el.find('.nacInner > div');
                var hoverItem = el.find('.nacInner > div.active');
                if (e.keyCode === 13) {
                    if (hoverItem[0]) {
                        _setItem($scope.filteredList[hoverItem.index()]);
                    } else {
                        _defaultCommit();
                    }
                } else {
                    if ($scope.filteredList.length > 1) {
                        if (e.keyCode === 38) {
                            // up
                            if (hoverItem[0]) {
                                hoverItem.removeClass('active');
                                if (hoverItem.prev()[0]) {
                                    hoverItem.prev().addClass('active');
                                } else {
                                    items.last().addClass('active');
                                }
                            } else {
                                items.last().addClass('active');
                            }
                        } else if (e.keyCode === 40) {
                            // down
                            if (hoverItem[0]) {
                                hoverItem.removeClass('active');
                                if (hoverItem.next()[0]) {
                                    hoverItem.next().addClass('active');
                                } else {
                                    items.first().addClass('active');
                                }
                            } else {
                                items.first().addClass('active');
                            }
                        }
                        _centerActiveItem();
                    } else {
                        items.removeClass('active');
                    }
                    $scope.showMore = true;
                }
            }

            function _onentercomponent () {
                isOverComponent = true;
                if (!isBlur) {
                    $scope.showMore = true;
                }
            }

            function _onleavecomponent () {
                isOverComponent = false;
                if (isBlur) {
                    $scope.showMore = false;
                }
            }

            function _updateFilterList () {
                isDirty = true;
                $scope.filteredList = $filter('filter')($scope.data, $scope.domInput);
                $timeout(function () {
                    el.find('.nacInner > div').removeClass('active');
                });
            }

            function _defaultCommit () {
                if (isDirty) {
                    if ($scope.cleanOnBlur) {
                        if ($scope.filteredList.length === 1) {
                            _setItem($scope.filteredList[0]);
                        } else {
                            _clearItem();
                            currentItem = undefined;
                        }
                    } else {
                        $scope.showMore = false;
                        $scope.input = $scope.domInput;
                        currentItem = undefined;
                    }
                }

                blurWithCommit = true;
                inputElem.trigger('blur');
            }

            function _oninputchange () {
                currentItem = undefined;
                var matchList = _getMatchItems();
                if (matchList.length === 1) {
                    _setItem(matchList[0]);
                } else {
                    $scope.domInput = $scope.input;
                }
            }

            function _getMatchItems () {
                var matchList = [];
                if ($scope.data && $scope.data.forEach) {
                    $scope.data.forEach(function (item) {
                        if ($scope.parser(item) == $scope.input) {
                            matchList.push(item);
                        }
                    });
                }
                return matchList;
            }

            function _centerActiveItem (index) {
                var container = el.find('.nacInner');
                var activeItems = typeof index === 'number' ? el.find('.nacInner > div').eq(index) : el.find('.nacInner > div.active');
                if (activeItems.length === 1) {
                    container.stop().animate({
                        scrollTop: activeItems[0].offsetTop - (el.find('.nacOuter').height() - activeItems[0].getBoundingClientRect().height) / 2
                    }, 200);
                }
            }
        }
    };
}]);
