angular.module('app', ['ngFileUpload', 'color.picker'])

.controller("AppController", function ($scope, $cbmWaterMarks, $cbmSources, $cbmCutouts, $window, $http) {


    var canvas = $scope.canvas = new fabric.Canvas('canvas', {preserveObjectStacking: true});

    var editorContainer = angular.element(document.querySelector('#editor-container'));

    $scope.ratio = 0.75;
    
    $scope.activeObject = null;
    
    $scope.image = {};

    $scope.waterMark = {};
    $scope.waterMarks = $cbmWaterMarks;

    $scope.source = null;
    $scope.sources = $cbmSources;

    $scope.cutouts = $cbmCutouts;


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
        
        if ($scope.source === activeObject) {
            $scope.source = null;
        }
    };


    $scope.addText = function () {

        var textbox = new fabric.Textbox('TEXTO', {
            left: 100,
            top: 0,
            fill: '#fff',
            strokeWidth: 3,
            stroke: "#222",
            fontSize: 45,
            fontFamily: 'impact',
            width: 300,
            editable: true,
        });


        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        $scope.activeObject = textbox;


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

            image.set({centeredRotation: true});

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
            
            var width = Math.min($window.innerWidth || $window.screen.width, image.width, editorContainer.prop('clientWidth')) - 50;

            image.scaleToWidth(width);

            canvas.add(image);
    
            canvas.setWidth(image.getScaledWidth());
            canvas.setHeight(image.getScaledHeight());

            $scope.waterMark.object.moveTo(canvas.getObjects().length);

            canvas.centerObject($scope.waterMark.object);

            canvas.setActiveObject(image);

            $scope.activeObject = $scope.source = image;

            image.lockMovementX = true;
            image.lockMovementY = true;

            canvas.renderAll();

            $scope.$applyAsync();

        }, {crossOrigin:'Anonymous'});
    };

    $scope.adjustCanvasToSource = function (width) {

        var width = width || Math.min($window.innerWidth || $window.screen.width, editorContainer.prop('clientWidth')) - 50;
       
        canvas.setWidth(width);
        $scope.source.scaleToWidth(width);
        canvas.setHeight($scope.source.getScaledHeight());

        $scope.$applyAsync();
    };

    $scope.sendObjectToBottom = function () {

        if (! $scope.source) return;

        $scope.activeObject.scaleToWidth($scope.source.getScaledWidth());

        canvas.setHeight($scope.source.getScaledHeight() + $scope.activeObject.getScaledHeight());

        $scope.source.top = 0;
        $scope.activeObject.top = $scope.source.getScaledHeight(); 

        canvas.renderAll();
    };

    $scope.sendObjectToTop = function () {

        if (! $scope.source) return;

        $scope.activeObject.scaleToWidth($scope.source.getScaledWidth());

        canvas.setHeight($scope.source.getScaledHeight() + $scope.activeObject.getScaledHeight());

        $scope.source.top = $scope.activeObject.getScaledHeight();
        $scope.activeObject.top = 0;; 

        canvas.renderAll();
    };

    $scope.set = function (key, value) {
        $scope.activeObject.set(key, value);
        canvas.renderAll();
    };

    $scope.aspectRatio = function () {
        canvas.setWidth(editorContainer.prop('clientWidth'));
        canvas.setHeight(Math.round(canvas.width * 0.75));
    };

    $scope.cloneObject = function () {
        
        var obj = fabric.util.object.clone(canvas.getActiveObject());

        delete obj.isWaterMark;
        
        obj.set({
            top: obj.top + 10,
            left: obj.left + 10,
            lockMovementX: false,
            lockMovementY: false,
        });

        canvas.add(obj);
    };

    $scope.reset = function () {

        angular.forEach(canvas.getObjects(), function (obj) {
            canvas.remove(obj)
        })

        $scope.source = null;

    };

    $scope.selectWaterMark(0);
    $scope.aspectRatio();

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
                $scope.removeObject(object);
            }
  
        })
        
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
        'ave-temer',
        'bicicleta',
        'bicicleta-real',
        'boa-ideia',
        'bob-esponja-fila',
        'bolso-chute',
        'bolso-peixe',
        'bolso-tiro',
        'boxe-temer',
        'buzz-olha',   
        'cachorro-nao-morde',
        'change-my-mind',
        'cola',
        'deve-estar-traindo',
        'dois-botoes-esquerda',
        'dois-botoes',
        'drake',
        'drift',
        'estrela-cadente',
        'faustao',
        'gaivota-do-mal',
        'gaivota-pistola',
        'homer-escondendo',
        'lendo-livro',
        'lula-molusco',
        'karnal',
        'kermit-carro',
        'kim-trump',
        'marido-infiel',
        'mas',
        'mcmahon-react',
        'nao-renunciarei',
        'nivel-de-gado',
        'passaros',
        'pergaminho',
        'pica-pau-femea',
        'pica-pau-fui-tapeado',
        'que-tipo',
        'represa',
        'reuniao',
        'rick-e-carl',
        'scooby-doo',
        'senhora',
        'spider-man',
        'the-rock',
        'tiro',
        'tom',
        'tom-ladrao',
        'tom-policia',
        'tom-jerry-gigante',
        'tom-capangas',
        'troll-vs-normies',
        'troy-bolton',
        'trump',
        'wolverine',
        'zeca-pagodinho',
    ];
    return list.map(function (item) {

        var url = 'img/sources/' + item + '.jpg';

        return {
            name: item,
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
        'cabelo-mulher-1',
        'cabelo-mulher-2',
        'glow-eye',
        'brasil',
        'chifre',
        'chapeu-comunista',
        'angry',
        'sad',
        'uau',
        'love', 
        'like',
        'bolsonaro-chutando',
        'bone-novo',
        'cruzada'
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