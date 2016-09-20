//TODO: Enable enclosure on production
/*(function () {*/
	var startingAnts = 1,
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
		DEBUG_DRAW = { locations: [] },
		food = { locations: [], color: [0, 255, 0] },
		nest = { x: _.random(10, width - 10), y: _.random(10, height - 10) },
		trail = { count: 0, trigger: 10, wash: 1, color: [255, 0, 0, 255] }, //Every "trigger" times, the pheromones trail will wash by "wash" times
		defaultAnt = {
			x: 10,
			y: 10,
			lastX: 0,
			lastY: 1,
			life: 255,
			inDanger: true, //True for an over aroused ant
			foodFound: false //True for an ant that has found food and is returning
		};
	
	function init() {
		canvas = document.getElementById('world');
		canvas.width = width;
		canvas.height = height;
		
		canvas.addEventListener('click', function(el) {
			console.log("click");
			console.log(el);
			
			_.times(30, function(i) {
				function getCursorPosition(canvas, event) {
					var rect = canvas.getBoundingClientRect();
					var x = event.clientX - rect.left;
					var y = event.clientY - rect.top;
					
					return { x: Math.round(x / 2), y: Math.round(y / 2) };
				}
				getCursorPosition(canvas, el);
				var toAdd = getCursorPosition(canvas, el);
				toAdd.x += i;
				toAdd.y += i;
				DEBUG_DRAW.locations.push(toAdd);
			});
			
			console.log(DEBUG_DRAW);
			
			
		}, false); //DEBUG MOUSE DRAWING
		
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
		
		//DRAW DEBUG LOCATIONS
		_.each(DEBUG_DRAW.locations, function(el) {
			setPixelChannel(mainMap, el.x, el.y, 0, 255, 255); //Paint ant G
		});
		
		//Draw nest locations
		_.times(5, function(ix) {
			_.times(5, function(iy) {
				setPixelChannel(mainMap, nest.x + ix, nest.y + iy, 0, 255, 255);
				setPixelChannel(mainMap, nest.x + ix, nest.y + iy, 2, 255, 255);
			});
		});
		
		_.each(ants, function(ant) {
			var diffX,
				diffY;
		
			if (ant.foodFound) {
				setPixelChannel(mainMap, ant.x, ant.y, 0, 255, 255, true); //Paint food trail
			} else {
				setPixelChannel(mainMap, ant.x, ant.y, 2, 255, 255, true); //Paint walk trail
			}
			
			//Calculate new position
			if ((ant.lastX != 0) && (ant.lastY != 0)) {
				var bestX = 0,
					bestY = 0,
					bestScore = 0;
					
				
				_.times(10, function() {
					function validMovement() {
						diffX = _.random(0, 1) * ant.lastX;
						diffY = _.random(0, 1) * ant.lastY;
						if (diffX + diffY == 0) validMovement();
					}
					validMovement();
					
					var foodScore = getTrailStrength(0, ant.x + diffX, ant.y + diffY);
					if (foodScore > bestScore) {
						bestX = diffX;
						bestY = diffY;
						bestScore = foodScore;
					}
					
				});
				
				if (bestX == 0 && bestY == 0) {
					diffX = _.random(0, 1) * ant.lastX;
					diffY = _.random(0, 1) * ant.lastY;
				} else {
					diffX = bestX;
					diffY = bestY;
				}
				
				console.log("bestscore: " + bestScore);
				console.log("bestX: " + diffX);
				console.log("bestY: " + diffY);
				
				
				
				
				
				
			} else {
				if (Math.abs(ant.lastX) == 1) {
					diffX = ant.lastX;
					diffY = _.random(-1, 1);
				} else {
					diffX = _.random(-1, 1);
					diffY = ant.lastY;
				}
			}
			
			ant.lastX = diffX;
			ant.lastY = diffY;
			ant.x += diffX;
			ant.y += diffY;
			
			//var newX = ant.x + diffX;
			//var newY = ant.y + diffY;
			
			/*if (_.inRange(newX, width) && _.inRange(newY, height)) {
			
				var pheromonesMap = [];

				_.times(3, function (x) {
					pheromonesMap[x] = [];
					
					_.times(3, function (y) {
						pheromonesMap[x][y] = getTrailStrength(0, newX, newY);
						
						
						
					})
				})*/
			
					/*var weakTrail = getTrailStrength(2, newX, newY);
					var foodTrail = getTrailStrength(0, newX, newY);
					
					var chance = _.random(true);
					console.log("c: " + chance);
					console.log("w: " + weakTrail);
					console.log("s: " + foodTrail);
					
					if (!ant.foodFound) {
						if (weakTrail) {
							//Bounce
							ant.lastX = -diffX;
							ant.lastY = -diffY;
							return;
						}
					}*/
					
					/*if (!ant.foodFound) {
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
					}*/
				
				
			/*	ant.x = newX; //Move X
				ant.y = newY; //Move Y
				ant.lastX = diffX;
				ant.lastY = diffY;
			} else {
				//Bounce
				ant.lastX = -diffX;
				ant.lastY = -diffY;
			}*/
			
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
		}, 25);
	}
	
	init();
/*})();*/
