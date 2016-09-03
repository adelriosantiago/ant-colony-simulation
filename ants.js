//TODO: Enable enclosure on production
/*(function () {*/
	var startingAnts = 10,
		//maxAnts = 5000, //Not used temporarily
		width = 300,
		height = 300,
		colors = {
			empty: [255, 255, 255],
			ant: {
				normal: [0, 0, 0, 255],
				dead: [192, 192, 192, 255]
			},
			trail: [255, 0, 0, 255]
		},
		context,
		mainMap,
		canvas,
		ants = [],
		food = { sources: [], color: [0, 255, 0] }
		foods = [],
		trail = { count: 0, trigger: 10, wash: 1, color: [255, 0, 0, 255]} //Every "trigger" times, the pheromones trail will wash by "wash" times
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
		mainMap = context.createImageData(width, height);
		
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
		
		context.putImageData(mainMap, 0, 0);
		
		function getPixelChannel(imgData, x, y, channel) {
			return imgData.data[((y * imgData.width + x) * 4) + channel];
		}
		
		function setPixelChannel(imgData, x, y, channel, value, alpha, mixAlpha) {
			if (mixAlpha) {
				//value = (imgData.data[((y * imgData.width + x) * 4) + channel] + value) / 2;
				alpha = (imgData.data[((y * imgData.width + x) * 4) + 3] + alpha) / 2;
			}
			
			imgData.data[((y * imgData.width + x) * 4) + channel] = value;
			if (alpha) imgData.data[((y * imgData.width + x) * 4) + 3] = alpha;
			
		}
		
		/*function getPixelXYEx(imgData, x, y) {
			function getPixelEx(imgData, index) {
				var i = index * 4;
				
				return [imgData.data[i + 0], imgData.data[i + 1], imgData.data[i + 2], imgData.data[i + 3]];
			}
		
			return getPixelEx(imgData, y*imgData.width+x);
		}*/
		
		function paintTrail(x, y) {
			var index = ((y * width + x) * 4);
			
			mainMap.data[index] = 255;
			mainMap.data[index + 1] = 0;
			mainMap.data[index + 2] = 0;
			mainMap.data[index + 3] = 255;
		}
		
		trail.count++;
		if (trail.count >= trail.trigger) {
			console.log("wash");
			trail.count = 0;
			_.times(width, function(x) {
				_.times(height, function(y) {
					var index = ((y * width + x) * 4) + 3;
					mainMap.data[index] = mainMap.data[index] - trail.wash;
					//context.putImageData(newPixel, x, y);
					//data[((y*currentCanvas.width+x) * 4) + 3] = data[((y*currentCanvas.width+x) * 4) + 3] - 1;
				});
			});
			
			context.putImageData(mainMap, 0, 0);
		}
		
		_.each(food.sources, function(food) {
			setPixelChannel(mainMap, food.x, food.y, 1, 255, 255); //Paint ant G
		});
		
		_.each(ants, function(ant) {
			setPixelChannel(mainMap, ant.x, ant.y, 0, 255, 25, true); //Paint trail
			
			/*//TODO: Implement pheromone trail search here
			newX = _.clamp(ant.x + _.random(-1, 1), width); //Move X
			newY = _.clamp(ant.y + _.random(-1, 1), height); //Move Y
			getPixelChannel()*/
			
			ant.x += _.random(-1, 1); //Move X
			ant.x = _.clamp(ant.x, 0, width - 1);
			
			ant.y += _.random(-1, 1); //Move Y
			ant.y = _.clamp(ant.y, 0, height - 1);
			
			setPixelChannel(mainMap, ant.x, ant.y, 0, 0); //Paint ant R
			setPixelChannel(mainMap, ant.x, ant.y, 1, 0); //Paint ant G
			setPixelChannel(mainMap, ant.x, ant.y, 2, 0, 255); //Paint ant B
			
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
		});
		
		setTimeout(function() {
			processWorld();
		}, 5);
	}
	
	init();
/*})();*/
