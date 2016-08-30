//TODO: Enable enclosure on production
/*(function () {*/
	var startingAnts = 3,
		//maxAnts = 5000, //Not used temporarily
		width = 300,
		height = 300,
		colors = {
			empty: [255, 255, 255],
			ant: {
				normal: [0, 0, 0, 255],
				dead: [192, 192, 192, 255]
			},
			food: [0, 255, 0],
			trail: [255, 0, 0, 255]
		},
		context,
		newPixel,
		pheromones,
		canvas,
		ants = [],
		food = { sources: [], color: [0, 255, 0] }
		foods = [],
		trail = { count: 0, trigger: 10, wash: 3 } //Every "trigger" times, the pheromones trail will wash by "wash" times
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
		newPixel = context.createImageData(1, 1);
		pheromones = context.createImageData(width, height);
		
		//Create starting ants
		_.times(startingAnts, function(i) {
			ants.push(_.extend(_.clone(defaultAnt), {
				"x" : _.random(0, width),
				"y" : _.random(0, height)
			}));
		});
		
		//Create starting food sources
		_.times(_.random(2, 8), function(i) {
			var xCenter = _.random(0, width),
				yCenter = _.random(0, height);
				
			_.times(_.random(10, 30), function(i) {
				food.sources.push({
					"x": xCenter + _.random(0, 10),
					"y": yCenter + _.random(0, 10)
				});
			});
		});
		
		processWorld();
	}

	processWorld = function() {
		//var oldCanvas = currentCanvas;
		//var currentCanvas = context.getImageData(0, 0, width, height);
		
		context.putImageData(pheromones, 0, 0);
		
		function getPixelChannel(imgData, x, y, channel) {
			return imgData.data[((y * imgData.width + x) * 4) + channel];
		}
		
		/*function getPixelXYEx(imgData, x, y) {
			function getPixelEx(imgData, index) {
				var i = index * 4;
				
				return [imgData.data[i + 0], imgData.data[i + 1], imgData.data[i + 2], imgData.data[i + 3]];
			}
		
			return getPixelEx(imgData, y*imgData.width+x);
		}*/
		
		function paint(x, y, color) {
			newPixel.data[0] = color[0];
			newPixel.data[1] = color[1];
			newPixel.data[2] = color[2];
			newPixel.data[3] = color[3];
			context.putImageData(newPixel, x, y);
		}
		
		function paintTrail(x, y) {
			var index = ((y * width + x) * 4);
			
			pheromones.data[index] = 255;
			pheromones.data[index + 1] = 0;
			pheromones.data[index + 2] = 0;
			pheromones.data[index + 3] = 255;
		}
		
		//trail.count++;
		if (trail.count >= trail.trigger) {
			console.log("wash");
			trail.count = 0;
			_.times(width, function(x) {
				_.times(height, function(y) {
					var index = ((y * width + x) * 4) + 3;
					pheromones.data[index] = pheromones.data[index] - trail.wash;
					//context.putImageData(newPixel, x, y);
					//data[((y*currentCanvas.width+x) * 4) + 3] = data[((y*currentCanvas.width+x) * 4) + 3] - 1;
				});
			});
			
			context.putImageData(pheromones, 0, 0);
		}
		
		_.each(food.sources, function(food) {
			paint(food.x, food.y, colors.food);
		});
		
		_.each(ants, function(ant) {
			paint(ant.x, ant.y, colors.empty, true);
			paintTrail(ant.x, ant.y, colors.trail);
			
			//TODO: Implement pheromone trail search here
			
			ant.x += _.random(-1, 1); //Move X
			ant.x = _.clamp(ant.x, width);
			
			ant.y += _.random(-1, 1); //Move Y
			ant.y = _.clamp(ant.y, height);
			
			
			_.each(food.sources, function(food) {
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
		}, 5);
	}
	
	init();
/*})();*/
