angular.module('app', ['ngFileUpload'])


.controller("AppController", function ($scope, $cbmWaterMarks, $cbmSources) {


    $scope.MAX_WIDTH = 700;
    $scope.MAX_HEIGHT = 700;

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
            fontSize: 55,
            fontFamily: 'impact, sans-serif',
            width: 400
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
            
            var width = Math.min(image.width, $scope.MAX_WIDTH);
            var height = Math.round(Math.min(image.height, image.height/image.width * $scope.MAX_WIDTH));
            
            image.selectable = false;
            
            canvas.setHeight(height);
            canvas.setWidth(width);

            canvas.add(image);


            $scope.waterMark.object.moveTo(canvas.getObjects().length);

            $scope.source = image;
            $scope.dimensions = {height: height, width: width};

            $scope.$apply();
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