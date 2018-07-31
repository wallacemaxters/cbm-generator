angular.module('app', ['uiCropper', 'ngFileUpload'])


.controller("AppController", function ($scope, $cbmWaterMarks, $cbmSources) {

    var canvas = new fabric.Canvas('canvas');


    canvas.setBackgroundColor('#fefefe');

    $scope.image = {};

    $scope.dimensions = {
        height: canvas.height,
        width: canvas.width
    };

    $scope.waterMark = {};
    $scope.waterMarks = $cbmWaterMarks;

    $scope.source = null;
    $scope.sources = $cbmSources;

    $scope.selectWaterMark = function ($index) {
        
        if ($scope.waterMark.object) 
        {
            canvas.remove($scope.waterMark.object);
        }

        $scope.waterMark = $scope.waterMarks[$index];

        fabric.Image.fromURL($scope.waterMark.url, function (image) {
        
            image.scale(0.2);

            image.opacity = .7;

            image.lockRotation = true;

            canvas.add(image);

            $scope.waterMark.object = image;
        });

    };

    $scope.render = function () {
        $scope.image.result = canvas.toDataURL('png');
    };


    $scope.addText = function () {

        var textbox = new fabric.Textbox('DIGITE O TEXTO', {
            left: 100,
            top: 0,
            fill: '#fff',
            strokeWidth: 3,
            stroke: "#222",
            fontSize: 50,
            fontFamily: 'impact'
        });

        canvas.add(textbox);
    };

    $scope.addImage = function ($file) {
        
        if ($file === null) return;

        fabric.Image.fromURL(URL.createObjectURL($file), function (image) {

            if (image.width > canvas.width) {
                image.scale(canvas.width / image.width)
            }

            canvas.add(image)
        });
    };

    $scope.addSource = function (source) {

        if ($scope.source) {
            canvas.remove($scope.source);
        }

        
        fabric.Image.fromURL(source.url, function (image) {
            
            var width = Math.min(image.width, 800);
            var height = Math.min(image.height, image.height/image.width * 800);
            
            image.selectable = false;
            
            canvas.setHeight(height);
            canvas.setWidth(width);

            canvas.add(image);


            $scope.waterMark.object.moveTo(canvas.getObjects().length);

            $scope.source = image;
        });
    }

    $scope.changeCanvasHeight = function () {
        if (! $scope.dimensions.height) return;
        canvas.setHeight($scope.dimensions.height);
    };

    $scope.changeCanvasWidth = function () {
        if (! $scope.dimensions.width) return;
        canvas.setWidth($scope.dimensions.width);
    };
       
    $scope.selectWaterMark(0);
    
})

.service('$cbmWaterMarks', function () {

    var list = [
        'une', 'mst', 'psol', 'original'
    ];
    
    return list.map(function (item) { 

        var url = 'img/cbm-'+ item + '.png';

        return {
            url: url,
            style: {
                backgroundImage: 'url("$")'.replace('$', url)
            }
        };
    })
})

.service('$cbmSources', function () {

    var list = ['dois-botoes', 'marido-infiel'];

    return list.map(function (item) {

        var url = 'img/sources/' + item + '.jpg';

        return {
            url: url,
            style: {
                backgroundImage: 'url("$")'.replace('$', url)
            }
        };
    });

})


.directive('cbmCanvas', function () {

    var FIXED_HEIGHT = 500;

    return {

        restrict: 'E',

        scope: {
            srcObject: '=',
            waterMark: '=',
        },

        link: function (scope, el, attr) {

            var canvas = angular.element('<canvas></canvas>').addClass('cbm-canvas');
            var cxt  = canvas[0].getContext('2d');
            var img = document.createElement('img');
            
            el.append(canvas);

            scope.$watch('srcObject', function (srcObject) {

                if (! srcObject) return;

                img.src && URL.revokeObjectURL(img.src);
                    
                var src = URL.createObjectURL(srcObject);

                function onLoad() {   
                    scope.defineCanvas();
                    scope.defineWaterMark();
                    angular.element(img).off('load');
                }

                angular.element(img).attr({src: src}).on('load', onLoad);
            });

            scope.$watch('waterMark', function (waterMark) {

                if (! waterMark || !scope.srcObject) return;

                scope.defineCanvas();
                scope.defineWaterMark();
            });

            scope.defineCanvas = function () {

                var geometry = {
                    height: FIXED_HEIGHT,
                    width: img.width/img.height * FIXED_HEIGHT
                };
                
                canvas.attr(geometry);

                cxt.drawImage(img, 0, 0, geometry.width, geometry.height);

                cxt.save();
            };

            scope.defineWaterMark = function () {
                
                var imgWm = document.createElement('img'),
                    src   = scope.waterMark;

                angular.element(imgWm).attr({src: src, height: 40}).on('load', function () {

                    angular.element(this).off('load');

                    cxt.drawImage(imgWm, canvas[0].width - 100, canvas[0].height - 100, 100, 100);
                });
            };
        }
    }
})