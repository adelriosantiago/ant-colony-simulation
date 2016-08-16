//TODO: Enable enclosure when deploying
/*(function () {*/
    var canvas,
        width = 600,
        height = 600,
        context,
        imageData,
        startingAnts = 1000,
        maxAnts = 500,
        ants = [],
        defaultAnt = {
            "x" : 10,
            "y" : 10,
            "life" : 255,
            "overArousal" : true, //True for an over aroused ant
            "foodFound" : false, //True for an ant that found and carries food
            "exploring" : true, //True for an ant that is actively looking for food
            "returning" : false, //True for an ant that is returning home
            "step" : function() {
                moveAnt(this);
                setTimeout(function() {
                    this.step();
                }.bind(this), 200 - (200 * this.overArousal));
            }
        };
    
    function init() {
        var i;

        canvas = document.getElementById('world');
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        imageData = context.createImageData(1, 1);
        
        for (i = 0; i < startingAnts; i++) {
            ants.push(_.extend(_.clone(defaultAnt), {
                "x" : (Math.floor(Math.random() * 600)),
                "y" : (Math.floor(Math.random() * 600))
            }));
            ants[i].step();
        }
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
        if (ant.x > width) {
            ant.x = 0;
        } else if (ant.x < 0) {
            ant.x = width;
        }
        if (ant.y > height) {
            ant.y = 0;
        } else if (ant.y < 0) {
            ant.y = height;
        }
        
        selfPaint(ant.x, ant.y, false);
    }
    
    init();
/*})();*/