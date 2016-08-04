//TODO: Enable enclosure when deploying
/*(function () {*/
    var canvas,
        context,
        imageData,
        startingAnts = 1000,
        maxAnts = 1000,
        ants = [],
        defaultAnt = {
            "x" : 10,
            "y" : 10,
            "life" : 255,
            "status" : 0, //0=searching for food, 1=food found and returning, 2=over arousal over danger
            
        };
    
    function init() {
        var i;

        canvas = document.getElementById('world');
        context = canvas.getContext('2d');
        imageData = context.createImageData(1, 1);
        
        for (i = 0; i < startingAnts; i++) {
            ants.push(_.extend(_.clone(defaultAnt), {
                "x" : (Math.floor(Math.random() * 200)),
                "y" : (Math.floor(Math.random() * 200))
            }));
        }
        console.log(ants);
        step(); //Start the engine
    }

    function moveAnt(ant) {
        function selfPaint(x, y, inverse) {
            imageData.data[0] = 255 * inverse;
            imageData.data[1] = 255 * inverse;
            imageData.data[2] = 255 * inverse;
            imageData.data[3] = 255;
            context.putImageData(imageData, x, y);
            
            return;
        }
        function randMove() {
            return (Math.floor(Math.random() * 3) - 1);
        }
        
        selfPaint(ant.x, ant.y, true);
        ant.x += randMove();
        ant.y += randMove();
        selfPaint(ant.x, ant.y, false);
    }

    function step() {
        _.each(ants, moveAnt);
        
        setTimeout(function() {
            step();
            //console.log("ok");
        }, 10);
    }
    
    init();
/*})();*/