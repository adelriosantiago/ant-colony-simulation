//TODO: Enable enclosure when deploying
/*(function () {*/
    var canvas,
        context,
        imageData,
        startingAnts = 100,
        maxAnts = 500,
        ants = [],
        defaultAnt = {
            "x" : 10,
            "y" : 10,
            "life" : 255,
            "waitFor" : function() {
                return (Math.floor(Math.random() * 1000));
            },
            "move" : function() {
                function selfPaint(x, y, inverse) {
                    if (inverse) {
                        imageData.data[0] = 255;
                        imageData.data[1] = 255;
                        imageData.data[2] = 255;
                    } else {
                        imageData.data[0] = 0;
                        imageData.data[1] = 0;
                        imageData.data[2] = 0;
                    }
                    imageData.data[3] = 255;
                    context.putImageData(imageData, x, y);
                    
                    return;
                }
                function randMove() {
                    return (Math.floor(Math.random() * 3) - 1);
                }
                selfPaint(this.x, this.y, true);
                this.x += randMove();
                this.y += randMove();
                selfPaint(this.x, this.y, false);
                
                setTimeout(function() {
                    this.move();
                    //console.log("ok");
                }.bind(this), this.waitFor());
                
                return;
            }
        };
        
        //var test = _.extend(defaultAnt, {"a":1});
        //console.log(test);
        
    function init() {
        var i;

        canvas = document.getElementById('world');
        context = canvas.getContext('2d');
        imageData = context.createImageData(1, 1);
        
        drawPixel(5, 5, 0, 0, 0, 255);
        drawPixel(5, 6, 0, 0, 0, 255);
        drawPixel(5, 7, 255, 0, 0, 255);
        
        for (i = 0; i < startingAnts; i++) {
            ants.push(_.extend(_.clone(defaultAnt), {"x" : (Math.floor(Math.random() * 200)), "y" : (Math.floor(Math.random() * 200))}));
            ants[i].move();
        }
        console.log(ants);
        
        //ants[0].selfPaint();
    }

    function moveAnt(ant) {
        function selfPaint(x, y, inverse) {
            if (inverse) {
                imageData.data[0] = 255;
                imageData.data[1] = 255;
                imageData.data[2] = 255;
            } else {
                imageData.data[0] = 0;
                imageData.data[1] = 0;
                imageData.data[2] = 0;
            }
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
        }, 5);
    }

    function drawPixel(x, y, r, g, b, a) {
        imageData.data[0] = r;
        imageData.data[1] = g;
        imageData.data[2] = b;
        imageData.data[3] = a;
        context.putImageData(imageData, x, y);
    }

    init();
/*})();*/