angular.module('app', ['ngFileUpload'])


.controller("AppController", function ($scope, $cbmWaterMarks, $cbmSources, $window) {


    $scope.MAX_WIDTH = 700;
    $scope.MAX_HEIGHT = 500;
    
    $scope.activeObject = null;
    
    $scope.image = {};

    $scope.waterMark = {};
    $scope.waterMarks = $cbmWaterMarks;

    $scope.source = null;
    $scope.sources = $cbmSources;

    var canvas = $scope.canvas = new fabric.Canvas('canvas', {preserveObjectStacking: true});

    $scope.dimensions = {
        height: canvas.height,
        width: canvas.width
    };

    canvas.setBackgroundColor('#fefefe');

    canvas.on('mouse:down', function (event) {

        if (! event.target) return;

        $scope.activeObject = canvas.getActiveObject();

        $scope.$applyAsync();
    });

    canvas.on('selection:cleared', function () {

        $scope.activeObject = null;
        $scope.$applyAsync();
    });




    $scope.selectWaterMark = function ($index) {
        
        if ($scope.waterMark.object) 
        {
            canvas.remove($scope.waterMark.object);
        }

        $scope.waterMark = $scope.waterMarks[$index];

        fabric.Image.fromURL($scope.waterMark.url, function (image) {
        
            image.scale(0.3);

            image.opacity = .7;

            canvas.add(image);

            canvas.centerObject(image)

            image.isWaterMark = true;

            $scope.waterMark.object = image;
        });

    };

    $scope.render = function () {
        $scope.image.result = canvas.toDataURL('png');
    };

    $scope.removeObject = function (activeObject) {

        if (activeObject.name === 'waterMark') return;

        canvas.remove(activeObject);
    };


    $scope.addText = function () {

        var textbox = new fabric.Textbox('DIGITE O TEXTO', {
            left: 100,
            top: 0,
            fill: '#fff',
            strokeWidth: 3,
            stroke: "#222",
            fontSize: 55,
            fontFamily: 'impact',
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

    $scope.addCustomSource = function ($file) {

        $scope.addSource({
            url: URL.createObjectURL($file)
        });
    };

    $scope.addSource = function (source) {

        if ($scope.source) {
            canvas.remove($scope.source);
        }
        
        fabric.Image.fromURL(source.url, function (image) {
            
            var width = Math.min(image.width, $scope.MAX_WIDTH);
            var height = Math.round(Math.min(image.height, image.height/image.width * $scope.MAX_WIDTH));
            
            //image.selectable = false;
            
            canvas.setHeight(height);
            canvas.setWidth(width);

            canvas.add(image);

            $scope.waterMark.object.moveTo(canvas.getObjects().length);

            $scope.source = image;

            $scope.dimensions = {height: height, width: width};

            $scope.$applyAsync();
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


    $scope.resizeCanvas = function () {

        if (window.innerWidth > 768) return;

        var width = Math.min(window.innerWidth || screen.width, $scope.MAX_WIDTH) - 50;

        var height = Math.min((canvas.height/canvas.width) * width, $scope.MAX_HEIGHT);

        canvas.setWidth(width);

        canvas.setHeight(height);

        canvas.centerObject($scope.waterMark.object)

    };


    angular.element($window).on('keydown', function (e) {


        var object = canvas.getActiveObject(),
            currentIndex = canvas.getObjects().indexOf(object);


        if ([36, 107].indexOf(e.keyCode) >= 0 && object) {

            e.preventDefault();

            object.moveTo(currentIndex + 1);

        } else if ([109, 35].indexOf(e.keyCode) >= 0 && object) {

            e.preventDefault();

            object.moveTo(Math.max(0, currentIndex - 1));

        } else if (e.keyCode === 46 && e.ctrlKey) {

            object.isWaterMark || canvas.remove(object);
        }
        
    })
    .on('resize load', $scope.resizeCanvas)
    
})

.service('$cbmWaterMarks', function () {

    var list = [
        'original', 'une', 'mst', 'psol', 'cunha'
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

    var list = [
        'dois-botoes', 'marido-infiel', 'bolso-peixe', 'bolso-tiro',
        'drake',
        'ave-temer'
    ];

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