//TODO: Enable enclosure when deploying
/*(function () {*/
    var startingAnts = 1000,
        //maxAnts = 5000, //Not used temporally
        width = 300,
        height = 300,
        context,
        imageData,
        canvas,
        ants = [],
        food = [{x: 10, y: 10}, {x: 100, y: 100}],
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
        canvas = document.getElementById('world');
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        imageData = context.createImageData(1, 1);
        
        _.times(startingAnts, function(i) {
            ants.push(_.extend(_.clone(defaultAnt), {
                "x" : _.random(0, width),
                "y" : _.random(0, height)
            }));
            ants[i].step();
        });
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
        
        //Avoid the ants from disappearing on the canvas limits
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