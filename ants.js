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
		foodStored = 0,
		trail = { count: 0, trigger: 100, wash: 1, color: [255, 0, 0, 255] }, //Every "trigger" times, the pheromones trail will wash by "wash" times
		defaultAnt = {
			x: 10,
			y: 10,
			lastX: 0,
			lastY: 1,
			life: 255,
			foodFound: false //True for an ant that has found food and is returning
		};
	
	function init() {
		canvas = document.getElementById('world');
		canvas.width = width;
		canvas.height = height;
		
		canvas.addEventListener('click', function(el) {
			console.log("click");
			console.log(el);
			
			function getPixelChannel(imgData, x, y, channel) {
				return imgData.data[((y * imgData.width + x) * 4) + channel];
			}
			
			function getCursorPosition(canvas, event) {
				var rect = canvas.getBoundingClientRect();
				var x = event.clientX - rect.left;
				var y = event.clientY - rect.top;
				
				return { x: Math.round(x / 2), y: Math.round(y / 2) };
			}
			
			var rgba = [getPixelChannel(mainMap, getCursorPosition(canvas, el).x,  getCursorPosition(canvas, el).y, 0),
				getPixelChannel(mainMap, getCursorPosition(canvas, el).x,  getCursorPosition(canvas, el).y, 1),
				getPixelChannel(mainMap, getCursorPosition(canvas, el).x,  getCursorPosition(canvas, el).y, 2),
				getPixelChannel(mainMap, getCursorPosition(canvas, el).x,  getCursorPosition(canvas, el).y, 3)];
			
			console.log(rgba.join("-"));
			
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
				//toAdd.y += i;
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
			setPixelChannel(mainMap, el.x, el.y, 1, 255, 255);
		});
		
		//Draw nest locations
		_.times(6, function(ix) {
			_.times(6, function(iy) {
				setPixelChannel(mainMap, nest.x + ix - 3, nest.y + iy - 3, 1, 255, 255);
			});
		});
		
		_.each(ants, function(ant) {
			var diffX,
				diffY;
		
			if (ant.foodFound) {
				setPixelChannel(mainMap, ant.x, ant.y, 0, 255, 255, true); //Paint food trail
			} else {
				setPixelChannel(mainMap, ant.x, ant.y, 2, 255, 255, true); //Paint walk trail
				
				_.times(3, function(px) {
					_.times(3, function(py) {
						setPixelChannel(mainMap, ant.x - ant.lastX + (px - 1), ant.y - ant.lastY + (py - 1), 2, 255, 50, true); //Paint walk trail
					});
				});
				
				
			}
			
			var bestPos = [],
				bestScore = -1;
			
			//Generate initial trail map
			var trailMap = [[0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]];
			
			//Blue score
			trailMap = _.map(trailMap, function(arr, x) {
				return _.map(arr, function(val, y) {
					var blueScore = getTrailStrength(2, ant.x + (x - 1), ant.y + (y - 1)); //Get blue trail strength
					
					//if (blueScore) return 0;
					
					blueScore = Math.abs(blueScore - 1);
					
					
					return blueScore * val;
				});
			});
			
			//trailMap[ant.lastX + 1][ant.lastY + 1] = (trailMap[ant.lastX + 1][ant.lastY + 1] + 1) / 2;
			
			console.log(trailMap);
			
			
			//Take out currentScore calculation
			_.times(3, function (tx) {
				return _.times(3, function(ty) {
					var currentScore = trailMap[tx][ty];
					
					if (currentScore == bestScore) {
						bestPos.push({ x: (tx - 1), y: (ty - 1) });
					} else if (currentScore > bestScore) {
						bestScore = currentScore;
						bestPos = [{ x: (tx - 1), y: (ty - 1) }];
					}
				});
			});
			
			console.log(trailMap);
			
			
			//console.log(bestPos);
			
			bestPos = _.sample(bestPos);
			
			
			
			/*//Get the best match by probability
			var getNextLocation = function () {
				var testX = _.random(2),
					testY = _.random(2);
				if (_.random(1, true) < trailMap[testX][testY]) {
					return {x: testX - 1, y: testY - 1};
				} else {
					return getNextLocation();
				}
			}
			var nextPos = getNextLocation();*/
			
			
			
			
			//console.log(nextPos);
			
			ant.lastX = bestPos.x;
			ant.lastY = bestPos.y;
			ant.x += bestPos.x;
			ant.y += bestPos.y;
			
			//Bounce ant on canvas limits
			if ((ant.x <= 0) || (ant.x >= (width - 1)) || (ant.y <= 0) || (ant.y >= (height - 1))) {
				bounceAnt();
			}
			
			function insideRange(a, b, range) {
				if (Math.abs(a - b) < range) return true;
				return false;
			}
			
			//Make a 180 degrees turn
			function bounceAnt() {
				ant.lastX = -ant.lastX;
				ant.lastY = -ant.lastY;
				ant.x += ant.lastX;
				ant.y += ant.lastY;
			}
			
			_.each(food.locations, function(food) {
				if ((insideRange(food.x, ant.x, 2)) && (insideRange(food.y, ant.y, 2)) && (ant.foodFound == false)) {
					console.log("foodFound");
					
					ant.foodFound = true; //Take food
					bounceAnt();
					console.log(food);
				}
			});
			
			//Check if ant is carrying food and is near the base
			if (ant.foodFound) {
				if (insideRange(nest.x, ant.x, 6) && insideRange(nest.y, ant.y, 6)) {
					console.log("nest");
					
					ant.foodFound = false; //Drop food
					bounceAnt();
					foodStored++;
					document.getElementsByClassName('foodStored')[0].innerHTML = foodStored; //Update food counter
				}
			}
		});
		
		setTimeout(function() {
			processWorld();
		}, 50);
	}
	
	init();
/*})();*/
