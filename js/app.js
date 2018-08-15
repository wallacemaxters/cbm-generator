angular.module('app', ['ngFileUpload', 'color.picker'])

.controller("AppController", function ($scope, $cbmWaterMarks, $cbmSources, $cbmCutouts, $window, $http) {


    $scope.MAX_WIDTH = 700;
    $scope.MAX_HEIGHT = 500;
    
    $scope.activeObject = null;
    
    $scope.image = {};

    $scope.waterMark = {};
    $scope.waterMarks = $cbmWaterMarks;

    $scope.source = null;
    $scope.sources = $cbmSources;

    $scope.cutouts = $cbmCutouts;



    var canvas = $scope.canvas = new fabric.Canvas('canvas', {preserveObjectStacking: true});

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
        canvas.renderAll();
        $scope.image.result = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.9
        });
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
            width: 300,
            editable: true,
        });

        setTimeout(function () {
            canvas.add(textbox);
        }, 200);

    };

    $scope.addImage = function (url, scale) {

        return fabric.Image.fromURL(url, function (image) {

            if (isFinite(scale))
            {
                image.scale(scale);
            }

            if (image.width > canvas.width) {
                image.scale(canvas.width / image.width)
            }

            canvas.add(image);

        }, {crossOrigin:'Anonymous'});
    }

    $scope.addFromUrl = function () {

        var url = prompt('Cole a url da imagem aqui');

        $scope.addImage(url);    
    };

    $scope.addImageFromBlob = function ($file) {
        
        if ($file === null) return;

        return $scope.addImage(URL.createObjectURL($file));
    };

    $scope.addSourceFromUrl = function () {

        var url = prompt('Cole a url da imagem aqui');

        $scope.addSource({
            url: url
        });
    };

    $scope.addSourceFromBlob = function ($file) {

        $scope.addSource({
            url: URL.createObjectURL($file)
        });
    };

    $scope.addSource = function (source) {

        if ($scope.source) {
            canvas.remove($scope.source);
        }

        fabric.Image.fromURL(source.url, function (image) {
            
            var width = Math.min($window.innerWidth || $window.screen.width, image.width, $scope.MAX_WIDTH) - 50;

            image.scaleToWidth(width);

            canvas.add(image);
    
            canvas.setWidth(image.getScaledWidth());
            canvas.setHeight(image.getScaledHeight());

            $scope.waterMark.object.moveTo(canvas.getObjects().length);

            $scope.source = image;

            canvas.renderAll();

            $scope.$applyAsync();

        }, {crossOrigin:'Anonymous'});
    };



    $scope.ajustCanvasToSource = function (width)
    {

        var width = width || Math.min($window.innerWidth || $window.screen.width, $scope.MAX_WIDTH) - 50;
       
        canvas.setWidth(width);
        $scope.source.scaleToWidth(width);
        canvas.setHeight($scope.source.getScaledHeight());

        $scope.$applyAsync();
    };

    $scope.resizeCanvas = function () {
        
        if ($window.innerWidth > 768) return;
        
        var width = Math.min($window.innerWidth || screen.width, $scope.MAX_WIDTH) - 50;
        
        var height = Math.min((canvas.height/canvas.width) * width, $scope.MAX_HEIGHT);
        
        if ($scope.source)
        {
            $scope.ajustCanvasToSource();
        }
        else
        {
            canvas.setWidth(width);    
            canvas.setHeight(height);
        }
        
        canvas.centerObject($scope.waterMark.object)
    };
    
    $scope.selectWaterMark(0);

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
            'original',
            '51',
            'ancap',
            'cunha',
            'cunha-miguxos',
            'cut',
            'mbl',
            'mdb',
            'mst',
            'petrobras',
            'psol',
            'tucano',
            'une',
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
        'mas', 'scooby-doo',
        'dois-botoes', 'marido-infiel', 'bolso-peixe', 'bolso-tiro',
        'drake', 'ave-temer', 'lula-molusco', 'nivel-de-gado', 'boxe-temer',
        'spider-man', 'reuniao', 'lendo-livro', 'cachorro-nao-morde',
        'que-tipo', 
        'dois-botoes-esquerda', 
        'boa-ideia',
        'gaivota-do-mal',
        'zeca-pagodinho',
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

.service('$cbmCutouts', function () {

    var list = [
        'placa-direita', 'placa-esquerda',
        'certo', 'errado', 'oculos-opressor',
        'boi-chifrudo', 'boi-mais-chifrudo',
        'comunismo',
        'minion-face',
    ];

    return list.map(function (item) {

        var url = 'img/recortes/' + item + '.png';

        return {
            url: url,
            style: {
                backgroundImage: 'url("$")'.replace('$', url)
            }
        };
    })
});