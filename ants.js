//TODO: Enable enclosure on production
/*(function () {*/
    var startingAnts = 1000,
        //maxAnts = 5000, //Not used temporally
        width = 300,
        height = 300,
        context,
        imageData,
        canvas,
        pheromones = [],
        ants = [],
        foods = [],
        defaultAnt = {
            "id" : null,
            "x" : 10,
            "y" : 10,
            "life" : 255,
            "overArousal" : true, //True for an over aroused ant
            "foodFound" : false, //True for an ant that found and carries food
            "exploring" : true, //True for an ant that is actively looking for food
            "returning" : false/*, //True for an ant that is returning home
            "moveNext" : false, //True for an ant that is about to move on the next step
            "step" : function() {
                this.moveNext = true;
                setTimeout(function() {
                    this.step();
                }.bind(this), 200 - (200 * this.overArousal));
            }*/
        };
    
    function init() {
        canvas = document.getElementById('world');
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext('2d');
        imageData = context.createImageData(1, 1);
        
        //Create starting ants
        _.times(startingAnts, function(i) {
            ants.push(_.extend(_.clone(defaultAnt), {
                "id" : _.sampleSize("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 10).join(""),
                "x" : _.random(0, width),
                "y" : _.random(0, height)
            }));
            //ants[i].step();
        });
        
        //Create pheromones map
        /*_.times(width, function(x) {
            _.times(height, function(y) {
                console.log(x + ", " + y);
            });
        });*/
        
        
        //console.log(ants);
        
        //Create starting food sources
        _.times(_.random(2, 8), function(i) {
            var xCenter = _.random(0, width),
                yCenter = _.random(0, height);
                
            _.times(_.random(10, 30), function(i) {
                foods.push({
                    owner: null,
                    "x": xCenter + _.random(0, 10),
                    "y": yCenter + _.random(0, 10)
                });
            });
        });
        
        processWorld();
    }

    processWorld = function() {
        function selfPaint(x, y, color) {
            imageData.data[0] = color[0];
            imageData.data[1] = color[1];
            imageData.data[2] = color[2];
            imageData.data[3] = 255;
            
            context.putImageData(imageData, x, y);
            return;
        }

        _.each(foods, function(food) {
            if (food.owner != null) {
                selfPaint(food.x + 1, food.y, [255, 255, 255]);
                selfPaint(food.x - 1, food.y, [255, 255, 255]);
                selfPaint(food.x, food.y + 1, [255, 255, 255]);
                selfPaint(food.x, food.y - 1, [255, 255, 255]);
                food.x = _.find(ants, _.matchesProperty('id', food.owner)).x;
                food.y = _.find(ants, _.matchesProperty('id', food.owner)).y;
                selfPaint(food.x + 1, food.y, [0, 255, 0]);
                selfPaint(food.x - 1, food.y, [0, 255, 0]);
                selfPaint(food.x, food.y + 1, [0, 255, 0]);
                selfPaint(food.x, food.y - 1, [0, 255, 0]);
            } else {
                selfPaint(food.x, food.y, [255, 0, 0]);
            }
        })
        
        _.each(ants, function(ant) {
            selfPaint(ant.x, ant.y, [255, 255, 255]);
            
            ant.x += _.random(-1, 1); //Move X
            ant.x = _.clamp(ant.x, width);
            
            ant.y += _.random(-1, 1); //Move Y
            ant.y = _.clamp(ant.y, height);
            _.each(foods, function(food) {
                function insideRange(a, b) {
                    if (Math.abs(a - b) < 2) return true;
                    return false;
                }
                if ((insideRange(food.x, ant.x)) && (insideRange(food.y, ant.y)) && (food.owner == null) && (ant.foodFound == false)) {
                    //console.log("TEST");
                    ant.foodFound = true;
                    ant.returning = true;
                    ant.exploring = false;
                    //ant.inventory.push(food);
                    food.owner = ant.id;
                    console.log(food);
                }
            });
            
            selfPaint(ant.x, ant.y, [0, 0, 0]);
        });
        
        setTimeout(function() {
            processWorld();
        }, 50);
    }
    
    init();
/*})();*/
