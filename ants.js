//TODO: Enable enclosure on production
/*(function () {*/
	var startingAnts = 100,
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
		food = { locations: [], color: [0, 255, 0] },
		nest = { x: _.random(10, width - 10), y: _.random(10, height - 10) },
		trail = { count: 0, trigger: 1, wash: 1, color: [255, 0, 0, 255] }, //Every "trigger" times, the pheromones trail will wash by "wash" times
		defaultAnt = {
			x : 10,
			y : 10,
			life : 255,
			inDanger : true, //True for an over aroused ant
			foodFound : false //True for an ant that has found food and is returning
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
				x: nest.x + _.random(0, 5),
				y: nest.y + _.random(0, 5)
			}));
		});
		
		//Create starting food locations
		_.times(_.random(5, 10), function(i) {
			var xCenter = _.random(0, width),
				yCenter = _.random(0, height);
				
			_.times(_.random(3, 8), function(i) {
				food.locations.push({
					"x": xCenter + _.random(-10, 10),
					"y": yCenter + _.random(-10, 10)
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
		
		//This gets a channel strength (channel * alpha)
		function getTrailStrength(channel, x, y) {
			var trail = getPixelChannel(mainMap, x, y, channel);
			var alpha = getPixelChannel(mainMap, x, y, 3);
			
			return (alpha * trail) / Math.pow(255, 2);
		}
		
		trail.count++;
		if (trail.count >= trail.trigger) {
			//console.log("wash");
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
		
		//Draw food locations
		_.each(food.locations, function(el) {
			setPixelChannel(mainMap, el.x, el.y, 1, 255, 255); //Paint ant G
		});
		
		//Draw nest locations
		_.times(5, function(ix) {
			_.times(5, function(iy) {
				setPixelChannel(mainMap, nest.x + ix, nest.y + iy, 0, 255, 255);
				setPixelChannel(mainMap, nest.x + ix, nest.y + iy, 2, 255, 255);
			});
		});
		
		_.each(ants, function(ant) {
			if (ant.foodFound) {
				setPixelChannel(mainMap, ant.x, ant.y, 0, 255, 255, true); //Paint food trail
			} else {
				setPixelChannel(mainMap, ant.x, ant.y, 2, 255, 255, true); //Paint walk trail
			}
			
			var newX = ant.x + _.random(-1, 1);
			var newY = ant.y + _.random(-1, 1);
			
			if (_.inRange(newX, width) && _.inRange(newY, height)) {
				
					var weakTrail = getTrailStrength(2, newX, newY);
					var foodTrail = getTrailStrength(0, newX, newY);
					
					var chance = _.random(true);
					/*console.log("c: " + chance);
					console.log("w:" + weakTrail);
					console.log("s: " + foodTrail);*/
					
					if (!ant.foodFound) {
						if (chance < foodTrail) {
							ant.x = newX; //Move X
							ant.y = newY; //Move Y
							return;
						}
						if (chance < weakTrail) {
							//console.log("xt");
							//console.log(ant.foodFound);
							return; //Return if ant is in explored territory
						}
					} else {
						if (chance < foodTrail) {
							ant.x = newX; //Move X
							ant.y = newY; //Move Y
							return;
						}
						if (chance > weakTrail) {
							//console.log("xt");
							//console.log(ant.foodFound);
							return; //Return if ant is in explored territory
						}
					}
				
				
				ant.x = newX; //Move X
				ant.y = newY; //Move Y
			}
			
			setPixelChannel(mainMap, ant.x, ant.y, 0, 0); //Paint ant R
			setPixelChannel(mainMap, ant.x, ant.y, 1, 0); //Paint ant G
			setPixelChannel(mainMap, ant.x, ant.y, 2, 0, 255); //Paint ant B
			
			_.each(food.locations, function(food) {
				function insideRange(a, b) {
					if (Math.abs(a - b) < 2) return true;
					return false;
				}
				if ((insideRange(food.x, ant.x)) && (insideRange(food.y, ant.y)) && (ant.foodFound == false)) {
					ant.foodFound = true;
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
