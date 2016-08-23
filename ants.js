//TODO: Enable enclosure on production
/*(function () {*/
    var startingAnts = 100,
        //maxAnts = 5000, //Not used temporally
        width = 300,
        height = 300,
        colors = {
			empty: [255, 255, 255],
			ant: {
				normal: [0, 0, 0],
				inDanger: [255, 0, 0],
				dead: [192, 192, 192]
			},
			food: [0, 255, 0],
			trail: {
				weak: [219, 246, 255],
				strong: [255, 255, 0]
			}
		},
        context,
        imageData,
        canvas,
        pheromones = [],
        ants = [],
        foods = [],
        defaultAnt = {
            "x" : 10,
            "y" : 10,
            "life" : 255,
            "inDanger" : true, //True for an over aroused ant
            "foodFound" : false, //True for an ant that has found food and is returning
            "exploring" : true/*, //True for an ant that is actively looking for food
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
                    "x": xCenter + _.random(0, 10),
                    "y": yCenter + _.random(0, 10)
                });
            });
        });
        
        processWorld();
    }

    processWorld = function() {
        function paint(x, y, color) {
            imageData.data[0] = color[0];
            imageData.data[1] = color[1];
            imageData.data[2] = color[2];
            imageData.data[3] = 255;
            
            context.putImageData(imageData, x, y);
            return;
        }

        _.each(foods, function(food) {
			paint(food.x, food.y, colors.food);
        })
        
        _.each(ants, function(ant) {
            //selfPaint(ant.x, ant.y, colors.empty);
            paint(ant.x, ant.y, colors.trail.weak);
            
            ant.x += _.random(-1, 1); //Move X
            ant.x = _.clamp(ant.x, width);
            
            ant.y += _.random(-1, 1); //Move Y
            ant.y = _.clamp(ant.y, height);
            _.each(foods, function(food) {
                function insideRange(a, b) {
                    if (Math.abs(a - b) < 2) return true;
                    return false;
                }
                if ((insideRange(food.x, ant.x)) && (insideRange(food.y, ant.y)) && (ant.foodFound == false)) {
                    ant.foodFound = true;
                    ant.returning = true;
                    ant.exploring = false;
                    console.log(food);
                }
            });
            
            
			paint(ant.x, ant.y, colors.ant.normal);
        });
        
        setTimeout(function() {
            processWorld();
        }, 50);
    }
    
    init();
/*})();*/
