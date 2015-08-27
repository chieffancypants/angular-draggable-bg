/*
 * angular-draggable-bg
 *
 * Directive that allows users to drag a background image to change its
 * positioning.
 *
 * (c) 2015 Wes Cruver
 * License: MIT
 */


(function() {

'use strict';

// Alias the loading bar for various backwards compatibilities since the project has matured:
angular.module('chieffancypants.draggableBg', [])
  .directive('draggableBg', function ($document, $rootScope) {
    return {
      scope: {
        'imgSrc': '=draggableBg',
        'displayPosX': '=?draggableBgX',
        'displayPosY': '=?draggableBgY',
        'realTimeUpdate': '@draggableBgRealtime',
      },
      link: function (scope, element) {
        var startX = 0;
        var startY = 0;
        var x = 0;
        var y = 0;
        var bgSrc;
        var imageDimensions = { width: 0, height: 0 };
        var image = new Image();

        // rerun all this if imgSrc changes.  Particularly useful when imgSrc
        // is only set after some kind of XHR comes back
        scope.$watch('imgSrc', function (newVal) {
          element.css('background-image', 'url(' + newVal + ')');
          element.addClass('draggable-bg');
          setImageDimensions();
        });

        element.on('mousedown', function (event) {
          event.preventDefault();
          startX = event.pageX - x;
          startY = event.pageY - y;
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });

        // when the image is loaded, grab the dimensions
        image.onload = function () {
          var el = element[0];

          // warning, inconsistent with older IE:
          // https://github.com/angular/angular.js/issues/2866
          var bgSize = el.ownerDocument.defaultView.getComputedStyle(el, null)['background-size'];
          var elementWidth = el.clientWidth;
          var elementHeight = el.clientHeight;

          if (bgSize === 'cover') {
            var elementAspectRatio = elementWidth / elementHeight;
            var imageAspectRatio = image.width / image.height;
            var scale = 1;

            if (imageAspectRatio >= elementAspectRatio) {
              scale = elementHeight / image.height;
            } else {
              scale = elementWidth / image.width;
            }
            imageDimensions.width = image.width * scale;
            imageDimensions.height = image.height * scale;
          } else {
            imageDimensions.width = image.width;
            imageDimensions.height = image.height;
          }

          setBgPos(scope.moment, element);
          $rootScope.$broadcast('draggableBg:ready', {x: scope.displayPosX, y: scope.displayPosY});
        };

        function setImageDimensions () {
          bgSrc = (element.css('background-image').match(/^url\(['"]?(.*?)['"]?\)$/i) || [])[1];
          // element.css('background-image');
          image.src = bgSrc;
        }

        function setBgPos (img, element) {
          var el = element[0];
          // TODO: Won't work when display_pos_x is 0:
          x = scope.displayPosX || Math.round((el.clientWidth - imageDimensions.width) / 2);
          y = scope.displayPosY || Math.round((el.clientHeight - imageDimensions.height) / 2);
          element.css('background-position', x + 'px ' + y + 'px');

          // TODO: only $apply() if the values were changed due to displayPosX/Y
          // not being set
          scope.displayPosX = x;
          scope.displayPosY = y;
          // scope.$evalAsync(function () {
          //
          // });
        }

        function limit (low, hi, value, bool) {
          if (arguments.length === 3 || bool) {
            if (value < low) {
              return Math.ceil(low);
            }

            if (value > hi) {
              return Math.ceil(hi);
            }
          }
          return value;
        }

        function mousemove (event) {
          y = event.pageY - startY;
          y = limit(element[0].clientHeight - imageDimensions.height, 0, y, true);

          x = event.pageX - startX;
          x = limit(element[0].clientWidth - imageDimensions.width, 0, x, true);

          element.css({
            backgroundPosition: x + 'px ' + y + 'px'
          });

          scope.displayPosX = x;
          scope.displayPosY = y;
          if (scope.$eval(scope.realTimeUpdate)) {
            scope.$apply();
          }
        }

        function mouseup () {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);

          // update the parent scope to reflect new background position:
          scope.$apply();
          $rootScope.$emit('draggableBg:repositioned', {x: scope.displayPosX, y: scope.displayPosY});
        }
      }
    };
  });

})();
