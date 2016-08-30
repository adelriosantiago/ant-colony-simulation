//TODO: Enable enclosure on production
/*(function () {*/
	var startingAnts = 100,
		//maxAnts = 5000, //Not used temporarily
		width = 300,
		height = 300,
		colors = {
			empty: [255, 255, 255],
			ant: {
				normal: [0, 0, 255, 255],
				dead: [192, 192, 192, 255]
			},
			food: [0, 255, 0],
			trail: [255, 0, 0, 255]
		},
		context,
		newPixel,
		canvas,
		pheromones = [],
		ants = [],
		foods = [],
		trailTrigger = 10,
		trailWash = 5,
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
		//var oldCanvas = currentCanvas;
		var currentCanvas = context.getImageData(0, 0, width, height);
		
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
		
		function paint(x, y, color, fixedColor) {
			newPixel.data[0] = color[0];
			newPixel.data[1] = color[1];
			newPixel.data[2] = color[2];
			//if (fixedColor) {
			//	newPixel.data[3] = 255;
			//} else {
				//newPixel.data[3] = _.clamp(getPixelChannel(currentCanvas, x, y, 3) + 10, 255);
			//}
			
			newPixel.data[3] = color[3];
			
			context.putImageData(newPixel, x, y);
			return;
		}
		
		trailWash++;
		if (trailWash >= trailTrigger) {
			console.log("wash");
			trailWash = 0;
 
			_.times(width, function(x) {
				_.times(height, function(y) {
					var index = ((y * width + x) * 4) + 3;
					currentCanvas.data[index] = currentCanvas.data[index] - 3;
					//context.putImageData(newPixel, x, y);
					//data[((y*currentCanvas.width+x) * 4) + 3] = data[((y*currentCanvas.width+x) * 4) + 3] - 1;
				});
			});
			
			context.putImageData(currentCanvas, 0, 0);
			
			//context.putImageData(newPixel, x, y);
			
			/*var data = currentCanvas.data;
			_.times(width, function(x) {
				_.times(height, function(y) {
					//context.putImageData(newPixel, x, y);
					//data[((y*currentCanvas.width+x) * 4) + 3] = data[((y*currentCanvas.width+x) * 4) + 3] - 1;
				});
			});
			context.putImageData(data, 0, 0);*/
		}
		
		_.each(foods, function(food) {
			paint(food.x, food.y, colors.food, true);
		})
		
		_.each(ants, function(ant) {
			//if (ant.lastColor) paint(ant.x, ant.y, ant.lastColor, false);
			paint(ant.x, ant.y, colors.ant.normal, false);
			//_.each(ants, function(ant) {
			//	console.log("wait");
			//});
			//ant.lastColor = getPixelXYEx(currentCanvas, ant.x, ant.y);			
			//paint(ant.x, ant.y, colors.ant.normal, false);
			
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
			
			//paint(ant.x, ant.y, colors.ant.normal, true);
		});
		
		setTimeout(function() {
			processWorld();
		}, 50);
	}
	
	init();
/*})();*/
