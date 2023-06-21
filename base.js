

function calcPopulation(data, dt){
	
}

function calcMaxPop(data){
	var max = 0;
	for(let i = 0; i < data.structureTypes; i++){
		max += data.structureTypes * data.structureTypeMult;
	}
	return max;
}

modulelist.push({
	title:"base",
	initData: function(data){
		initDefault(data, "structures", 0);
		initDefault(data, "structureTypes", []);
		initDefault(data, "structureTypeMult", [2]);
		initDefault(data, "population", 0);
		initDefault(data, "maxPop", 0);
		initDefault(data, "startingMats", 1491000); //7,455kg 3.10625m^3 basic concrete room
		initDefault(data, "startTime", Date.now());
		initDefault(data, "gamePhase", 0);
	},
	init: function(data){
		let body = document.getElementById("body");
		let div = document.createElement("div");
		div.id = "topbox";
		
		
		let buildingText = counterBuilder("structures", "Buildings: ", data.structures);
		div.appendChild(buildingText);
		div.appendChild(document.createElement("br"));
		
		let populationText = counterBuilder("population", "Population: ", data.population);
		div.appendChild(populationText);
		div.appendChild(document.createElement("br"));
		
		let supplyText = counterBuilder("startingMats", "Supplies: ", data.startingMats +" kg");
		div.appendChild(supplyText);
		div.appendChild(document.createElement("br"));
		
		let button = elementBuilder("button", "basicstructurebut", {onclick: function(e){
			if(gamedata.startingMats > 0){
				gamedata.startingMats -= 7455;
				gamedata.structures += 1;
				gamedata.structureTypes[0] += 1;
			}
			if(gamedata.startingMats <= 0){
				document.getElementById("basicstructurebut").style = "display:none; visiblity:hidden;";
				document.getElementById("basicstructurelab").style = "display:none; visiblity:hidden;";
				document.getElementById("startingMats").style = "display:none; visiblity:hidden;";
				document.getElementById("startingMatstext").style = "display:none; visiblity:hidden;";
			}
		}, innerText: "Build Basic Structure"});
		div.appendChild(button);
		let buttonlabel = elementBuilder("label", "basicstructurelab", {htmlFor: "basicstructurebut", innerText:" Requires 7,445kg of materials", title: "Basic concrete room with amenities, about 7,455 kilo1grams"});
		div.appendChild(buttonlabel);
		body.append(div);
		if(data.startingMats < 1){
			document.getElementById("basicstructurebut").style = "display:none; visiblity:hidden;";
			document.getElementById("basicstructurelab").style = "display:none; visiblity:hidden;";
			document.getElementById("startingMats").style = "display:none; visiblity:hidden;";
			document.getElementById("startingMatstext").style = "display:none; visiblity:hidden;";
		}
	},
	update: function(data, dt) {
		let body = document.getElementById("body");
		let buildings = document.getElementById("structures");
		buildings.innerText = data.structures;
		
		data.maxPop = calcMaxPop(data);
		calcPopulation(data, dt)
		let population = document.getElementById("population");
		population.innerText = data.population;
		
		if(data.startingMats>0){
			let startingMats = document.getElementById("startingMats");
			startingMats.innerText = data.startingMats + " kg";
		}
		
	}
});
