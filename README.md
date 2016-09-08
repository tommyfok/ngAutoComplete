# ngAutoComplete
Auto Complete Module for AngularJS.

## [DEMO](//tommyfok.github.io/ngAutoComplete/demo.html)

## Installation
1. With Bower :
   - `bower install --save ngAutoComplete`

   Or download `build/ngAutoComplete.js` manually

2. include `build/ngAutoComplete.js` after your `angular.js` file

3. add `ngAutoComplete` as a module dependency to your application

## Useage
```javascript
$scope.pkgNames = ['apple', 'banana', 'car', 'desk', 'egg'];
$scope.fnFormatter = function (item) {
  // show 'appleapple' as the first item in the list
  return item + item;
};
$scope.fnParser = function (item) {
  // select the first item will output 'appleappleapple' to ng-model
  return item + item + item;
};
```
```html
<div ng-auto-complete
     ng-model="pkgName"
     nac-data="pkgNames"
     name="yourFieldName"
     clean-on-blur="true"
     nac-parser="fnParser"
     onchange="fnOnchange"
     selected-item="selected"
     nac-formatter="fnFormatter"
     placeholder="Type in package name."></div>
```

> too lazy to write more...
