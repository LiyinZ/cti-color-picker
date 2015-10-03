(function() {
  'use strict';

  if (typeof angular === 'undefined') {
      throw Error("CTi Color Picker: AngularJS (window.angular) is undefined but is necessary.");
  }
  if (typeof Hammer === 'undefined') {
    throw Error("CTi Color Picker: HammerJS (window.Hammer) is undefined but is necessary.");
  }

  /**
   * @module ctiColorPicker
   * @description Angular.js directive for mobile touch friendly colour picker
   * made at CTi - Canadian Tire Innovation
   * @requires angular
   * @requires hammer
   */
  angular
    .module('ctiColorPicker', [])
    .directive('ctiColorPicker', ctiColorPicker);

  ctiColorPicker.$inject = [];

  /* @ngInject */
  function ctiColorPicker () {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      // TODO replace templateUrl with template
      templateUrl: 'src/ctiColorPicker.html',
      bindToController: true,
      controller: ColorPickerCtrl,
      controllerAs: 'cp',
      link: link,
      restrict: 'A',
      scope: {
        colorData: '=ctiColorPicker'
      }
    };
    return directive;

    function link(scope, element, attrs, cp) {
      /**
       * Variables initialization
       */
      var cpContainer = element[0];
      var cpWidth = cpContainer.clientWidth; // width is defined in CSS
      var circleEl = cpContainer.children[0];
      var circleR = circleEl.offsetWidth/2;
      var barEl = cpContainer.children[1];
      var barW = barEl.offsetWidth/2;
      var barH = 60;
      var colorDisplay = document.getElementById('cp-color-display');
      var cv0 = cpContainer.children[2]; // canvas square
      var cv1 = cpContainer.children[3]; // canvas strip
      var ctx0 = cv0.getContext('2d');
      var ctx1 = cv1.getContext('2d');
      var colorData = cp.colorData || {
        cv0_x: cpWidth - circleR,
        cv0_y: circleR,
        cv1_x: getRandomInt(0, cpWidth)
      };
      cv0.width = cpWidth; // canvas size defined by container width
      cv0.height = cpWidth;
      cv1.width = cpWidth;
      cv0.offsetRight = cv0.offsetLeft + cv0.width;
      cv0.offsetBottom = cv0.offsetTop + cv0.height;
      cv1.offsetRight = cv1.offsetLeft + cv1.width;
      /**
       * Color picker interface inittialization
       */
      createHorizontalSpectrum(ctx1, cpWidth, barH);
      var specRgba = getCanvasRgba(ctx1, colorData.cv1_x, barH/2);
      renderGradientCanvas(ctx0, cpWidth, specRgba);
      barEl.style.top = cv1.offsetTop + 'px';
      updateCirclePos(absX(cv0,colorData.cv0_x), absY(cv0,colorData.cv0_y));
      updateBarPos(absX(cv1, colorData.cv1_x));
      colorData.rgba = colorData.rgba ||
        getCanvasRgba(ctx0, colorData.cv0_x, colorData.cv0_y);
      displayColor(colorData.rgba);

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function getCanvasRgba(ctx, cvX, cvY) {
        var pixel = ctx.getImageData(cvX, cvY, 1, 1);
        var data = pixel.data;
        return 'rgba('+data[0]+','+data[1]+','+data[2]+','+data[3]+')';
      }

      // createLinearGradient(x1, y1, x2, y2)
      function renderGradientCanvas(ctx, width, rgba) {
        var grdLtR = ctx.createLinearGradient(0,width/2,width,width/2);
        var grdTtB = ctx.createLinearGradient(width/2,0,width/2,width);
        ctx.clearRect(0, 0, width, width);
        // fillRect(x, y, width, height)
        grdLtR.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grdLtR.addColorStop(1, rgba);
        ctx.fillStyle = grdLtR;
        ctx.fillRect(0, 0, width, width);

        grdTtB.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grdTtB.addColorStop(1, 'rgba(0, 0, 0, 1)');
        ctx.fillStyle = grdTtB;
        ctx.fillRect(0, 0, width, width);
      }

      function createHorizontalSpectrum(ctx, width, height) {
        // createLinearGradient(x1, y1, x2, y2)
        var grd = ctx.createLinearGradient(0,0,width,0);
        grd.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grd.addColorStop(0.15, 'rgba(255, 0, 255, 1)');
        grd.addColorStop(0.33, 'rgba(0, 0, 255, 1)');
        grd.addColorStop(0.49, 'rgba(0, 255, 255, 1)');
        grd.addColorStop(0.67, 'rgba(0, 255, 0, 1)');
        grd.addColorStop(0.84, 'rgba(255, 255, 0, 1)');
        grd.addColorStop(1, 'rgba(255, 0, 0, 1)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);
      }

      function updateCirclePos(x, y) {
        circleEl.style.left = x - circleR + 'px';
        circleEl.style.top = y - circleR + 'px';
      }
      function updateBarPos(x) { barEl.style.left = x - barW + 'px'; }
      function displayColor(rgba) { colorDisplay.style.background = rgba; }
      /**
       * Turn absolute screen x || y to canvas relative x || y
       * @param {Canvas} canvas canvas element
       * @param {Number} x || y absolute coordinate
       * @return {Number} x || y relative to given canvas
       */
      function cvX(canvas, x) { return x - canvas.offsetLeft; }
      function cvY(canvas, y) { return y - canvas.offsetTop; }
      /**
       * Opposite of cvX & cvY, convert canvas coords to screen coords
       */
      function absX(canvas, x) { return x + canvas.offsetLeft; }
      function absY(canvas, y) { return y + canvas.offsetTop; }

      /**
       * Give canvas a boundary for drag, pan event coords, x or y
       * @param {Canvas} canvas - specify which canvas
       * @param {Number} coord - x or y coord from an event
       * @param {String} upper - canvas property e.g. 'offsetTop'
       * @param {String} lower - custom canvas property e.g. 'offsetBottom'
       * @return {Number} coord - a coord that's within the given canvas
       */
      function bound(canvas, coord, upper, lower) {
        if (coord < canvas[upper]) coord = canvas[upper];
        else if (coord >= canvas[lower]) coord = canvas[lower]-1;
        return coord;
      }


      // init touch events
      var hm = new Hammer(cpContainer);
      hm.on('tap', cpHandleTap);
      hm.on('pan', cpHandlePan);

      function gradientCanvasEvents(e) {
        var x = bound(cv0, e.center.x, 'offsetLeft', 'offsetRight');
        var y = bound(cv0, e.center.y, 'offsetTop', 'offsetBottom');
        updateCirclePos(x, y);
        var rgba = getCanvasRgba(ctx0, cvX(cv0, x), cvY(cv0, y));
        displayColor(rgba);
        // update global color coords
        if (e.isFinal) {
          colorData.cv0_x = cvX(cv0, x);
          colorData.cv0_y = cvY(cv0, y);
          colorData.rgba = rgba;
        }
      }

      function spectrumCanvasEvents(e) {
        var x = bound(cv1, e.center.x, 'offsetLeft', 'offsetRight');
        updateBarPos(x);
        var specRgba = getCanvasRgba(ctx1, cvX(cv1, x), barH/2);
        renderGradientCanvas(ctx0, cv0.width, specRgba);
        var rgba = getCanvasRgba(ctx0,colorData.cv0_x,colorData.cv0_y);
        displayColor(rgba);
        // update global color coords
        if (e.isFinal) {
          colorData.cv1_x = cvX(cv1, x);
          colorData.rgba = rgba;
        }
      }

      function cpHandleTap(e) {
        switch(e.target.className) {
          case 'cti-canvas-square':
            gradientCanvasEvents(e);
            break;
          case 'cti-canvas-strip':
            spectrumCanvasEvents(e);
            break;
          default:
            return;
        }
        console.log(colorData);
      }

      function cpHandlePan(e) {
        switch(e.target.className) {
          case 'cti-canvas-square':
            gradientCanvasEvents(e);
            break;
          case 'cti-canvas-strip':
            spectrumCanvasEvents(e);
            break;
          default:
            return;
        }
      }
    }
  }

  /* @ngInject */
  function ColorPickerCtrl () {

  }
})();

