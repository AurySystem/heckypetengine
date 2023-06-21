var modulelist = [];

var initModuleData = function(data){
	for(let mod of modulelist){
		if(mod?.initData != undefined){
			mod.initData(data);
		}
	}
}

var initModules = function(data){
	for(let mod of modulelist){
		if(mod?.init != undefined){
			mod.init(data);
		}
	}
	
}

var updatemodules = function(data, dt){
	for(let mod of modulelist){
		if(mod?.update != undefined){
			mod.update(data, dt);
		}
	}
	
}

function jsSort(arr, key) {
    let out = [];
    let mid = [];
    for (i = 0; i < arr.length; i++) {

        if (mid[arr[i][key]] !== undefined) {
            mid[arr[i][key]].push(arr[i]);
        } else {
            mid[arr[i][key]] = [];
            mid[arr[i][key]].push(arr[i]);
        }

    }

    for (i = 0; i < mid.length; i++) {
        if (mid[i] !== undefined) {
            for (j = 0; j < mid[i].length; j++) {
                out.push(mid[i][j]);
            }
        }
    }
    return out;
}

function initDefault(data, field, defualt){
		data[field] = data[field] != undefined ? data[field] : defualt;
}

function elementBuilder(type, id, properties){
	let element = document.createElement(type);
	element.id = id;
	for(let prop in properties){
		element[prop] = properties[prop];
	}
	return element;
}

function counterBuilder(id, text, field){
	let counter = document.createElement("span");
	counter.id = id+"text";
	counter.innerText = text
	let counterNum = document.createElement("span");
	counterNum.id = id;
	counterNum.innerText = field;
	counter.appendChild(counterNum);
	return counter;
}

actionlog = [];

function actionEvent(message){
	actionlog.push(message);
}