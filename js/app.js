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
            left: 0,
            top: 0,
            fill: '#FFD700',
            strokeWidth: 3,
            stroke: "#222222",
            fontSize: 45,
            fontFamily: 'Impact',
            width: canvas.width - (canvas.width / 4),
            editable: true,
            textAlign: 'center'
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

        if (! url) return;

        $scope.addImage(url);    
    };

    $scope.addImageFromBlob = function ($file) {
        
        if ($file === null) return;

        return $scope.addImage(URL.createObjectURL($file));
    };

    $scope.addSourceFromUrl = function () {

        var url = prompt('Cole a url da imagem aqui');

        if (url === null) return;

        $scope.addSource({
            url: url
        });
    };

    $scope.addSourceFromBlob = function ($file) {

        if  ($file === null) return;

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
        {path: 'anjo-recado', name: 'Anjo entregando recado'},
        {path: 'ave-temer', name: 'Ave Temer - presidento'},
        {path: 'batman-react', name: 'Batman react'},
        {path: 'batman-pensativo', name: 'Batman pensativo'},
        {path: 'bicicleta', name: 'Caindo da bibicleta'},
        {path: 'bicicleta-real', name: 'Caindo da bibicleta 4k'},
        {path: 'boa-ideia', name: 'Ideia'},
        {path: 'bob-esponja-fila', name: 'Bob Esponja'},
        {path: 'bob-esponja-fogueira', name: 'Bob Esponja'},
        {path: 'bolso-chute', name: 'Bolsonaro chutando'},
        {path: 'bolso-peixe', name: 'Bolsonaro segurando peixe'},
        {path: 'bolso-tiro', name: 'Bolsonaro fazendo a arma'},
        {path: 'bolsonaro-chorando', name: 'Bolsonaro chorando'},
        {path: 'bolsonaro-rindo', name: 'Bolsonaro rindo'},
        {path: 'boxe-temer', name: 'Temer presidento lutando boxe'},
        {path: 'buzz-olha', name: 'Buzz Lightyear - Olha Buzz'}, 
        {path: 'cachorro-nao-morde'},
        {path: 'cachorro-bravo-calmo'},
        {path: 'change-my-mind', name: 'Change my mind'},
        {path: 'cola', name: 'Passando o papel com cola na sala de aula'},
        {path: 'dalai-lama-surpreso', name: 'Dalai lama'},
        {path: 'denilson-futebol', name: 'Denilson correndo dos turcos - futebol'},
        {path: 'deve-estar-traindo'},
        {path: 'dois-botoes', name: 'Dois Botões'},
        {path: 'dois-botoes-esquerdista', name: 'Dois Botões - esquerdista/feminista/comunista'},
        {path: 'dois-botoes-npc', name: 'Dois Botões NPC'},
        {path: 'drake'},
        {path: 'drift'},
        {path: 'estrela-cadente'},
        {path: 'evolucao-gado'},
        {path: 'faustao'},
        {path: 'gaivota-do-mal'},
        {path: 'gaivota-pistola'},
        {path: 'gorila-react'},
        {path: 'gorila-react-2'},
        {path: 'homer-escondendo', name: 'Homer Simpsons escondendo na moita'},
        {path: 'lendo-livro'},
        {path: 'lula-molusco', name: 'Lula molusco - Bob Esponja'},
        {path: 'karnal', name: 'Leandro Karnal'},
        {path: 'kermit-carro'},
        {path: 'kim-trump', name: 'Kim cumprimentando o Trump'},
        {path: 'kogos-inditoso-esquerdista', name: 'Paulo Kogos - Inditoso esquerdista'},
        {path: 'marido-infiel'},
        {path: 'monica-cascao', name: 'Turma da Mônica - Cascão na janela/casa'},
        {path: 'mas', name: 'Mas, refutado'},
        {path: 'mcmahon-react'},
        {path: 'nao-renunciarei', name: 'Temer Presidento - Não renunciarei'},
        {path: 'npc', name: 'Meme NPC Wojak'},
        {path: 'passaros', name: 'Pássaros'},
        {path: 'pergaminho'},
        {path: 'pica-pau-femea', name: 'Pica Pau fêmea'},
        {path: 'pica-pau-fui-tapeado', name: 'Pica pau - fui tapeado'},
        {path: 'pica-pau-racao', name: 'Pica pau - ração'},
        {path: 'que-tipo', name: 'Que tipo de * é esse?'},
        {path: 'represa', name: 'Represa'},
        {path: 'reuniao', name: 'Reunião'},
        {path: 'rick-e-carl', name: 'Rick e Carl'},
        {path: 'scooby-doo', name: 'Scooby Doo'},
        {path: 'senhora'},
        {path: 'spider-man', name: 'Homem Aranha - Spider man'},
        {path: 'the-rock', name: 'The rock no carro'},
        {path: 'tiro', name: 'Tiro'},
        {path: 'to-feliz-e-puto', name: 'Estou feliz e puto'},
        {path: 'tom', name: 'Tom e Jerry - Arma/Suicída'},
        {path: 'tom-ladrao', name: 'Tom e Jerry - Abrindo a porta'},
        {path: 'tom-policia', name: 'Tom e Jerry'},
        {path: 'tom-jerry-gigante', name: 'Tom e Jerry'},
        {path: 'tom-capangas', name: 'Tom e Jerry'},
        {path: 'troll-vs-normies', name: 'Troll e os normies'},
        {path: 'troy-bolton', name: 'Troy Bolton'},
        {path: 'yugioh'},
        {path: 'wolverine', name: 'Wolverine com saudades'},
        {path: 'zeca-pagodinho', name: 'Zeca Pagodinho - Indo embora'},
    ];
    return list.map(function (item) {

        var url = 'img/sources/' + item.path + '.jpg';

        return {
            name: item.name,
            url: url,
            style: {
                backgroundImage: 'url("$")'.replace('$', url)
            }
        };
    });
})

.service('$cbmCutouts', function () {

    var list = [
        'ancap',
        'ancap-2',
        'placa-direita', 
        'placa-esquerda',
        'certo', 
        'errado', 
        'oculos-opressor',
        'boi-chifrudo',
        'boi-mais-chifrudo',
        'comunismo',
        'minion-face',
        'cabelo-mulher-1',
        'cabelo-mulher-2',
        'cabelo-mulher-3',
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
        'cruzada-capacete', 
        'cruzada-capacete-2',
        'cruzada-escudo',
        'feminismo',
        'barba',
        'psdb',
        'lula',
        'che',
        'bolsonaro'
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
})
