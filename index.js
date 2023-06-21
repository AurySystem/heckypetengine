
var version = 111;
var keymap = new Map();
keymap.set("f", 102);
keymap.set("i", 105);
keymap.set("a", 97);
keymap.set("o", 111);
keymap.set("b", 98);
keymap.set(":", 58);
keymap.set(".", 46);
keymap.set("s", 115 );
keymap.set("bi", 11 );
keymap.set("end", 3 );
var mapkeys = [];
mapkeys[102] = "f";
mapkeys[105] = "i";
mapkeys[97] = "a";
mapkeys[111] = "o";
mapkeys[98] = "b";
mapkeys[58] = ":";
mapkeys[46] = ".";
mapkeys[115] = "s";
mapkeys[11] = "bi";
mapkeys[3] = "end";

var gamedata = load();
if(gamedata.saveTime == undefined) gamedata.saveTime = Date.now();
var loopdata = {running:true, time:gamedata.saveTime};
initModules(gamedata);
loopdata.running = false;

var gameloop = function(){
    if (loopdata.running) return;
    loopdata.running = true;
    let time = Date.now();
    
    updatemodules(gamedata, time - loopdata.time);
    loopdata.time = time;
    loopdata.running = false;
}

var interval = setInterval(() => {gameloop()}, 50);


var autosave = setInterval(() => {gamedata.saveTime = Date.now(); localStorage.setItem("heckypett",save(gamedata));}, 1000);

function save(object){
    let data = [];
    data.push("V".charCodeAt(0));
    data.push(version)
    let string;
    for(let property in object){
        let dat = object[property];
        for (var i = 0; i < property.length; i++) {
            data.push(property.charCodeAt(i));
        }
        data.push(":".charCodeAt(0));
        compressTypeToBin(data, dat);
    }
    string = String.fromCharCode(...data);
    
    
    return string;
}

function compressTypeToBin(data, generic){
    switch(typeof(generic)){
        case "string":{ //but why though
            data.push("s".charCodeAt(0));
            for (var i = 0; i < generic.length; i++) {
                data.push(generic.charCodeAt(i));
            }
            data.push(3);
            break;
        }
        case "number":{ 
            if(Math.floor(generic) != generic || generic >= Number.MAX_SAFE_INTEGER){//do we care about floats or not
                    let code = keymap.get("f");
                    code |= Math.sign(generic) == -1 ? 32768 : 0;
                    code |= Math.sign(Math.log10(generic)) == -1 ? (1<<14) : 0;
                    data.push(code);
                    
                    let array = toArray(Math.abs(+((generic/(10**Math.floor(Math.log10(generic)+1))).toString().split(".")[1])));
                    array[array.length-1] |= 32768; //1<<15
                    for (var i = 0; i < array.length; i++) {
                        data.push(array[i])
                    }
                    array = toArray(Math.abs(Math.floor(Math.log10(generic)+1)));
                    array[array.length-1] |= 32768; //1<<15
                    for (var i = 0; i < array.length; i++) {
                        data.push(array[i])
                    }
                }else{
                    let code = keymap.get("i");
                    code |= Math.sign(generic) == -1 ? 32768 : 0;
                    data.push(code);
                    let array = toArray(Math.abs(generic));
                    array[array.length-1] |= 32768; //1<<15
                    for (var i = 0; i < array.length; i++) {
                        data.push(array[i])
                    }
                }
            break;
        }
        case "bigint":{
            let code = keymap.get("bi");
            code |= (generic<0n) ? 32768 : 0;
            data.push(code);
            let array = BItoArray(generic < 0n? 0n-generic:generic);
            array[array.length-1] += 32768; //1<<15
            for (var i = 0; i < array.length; i++) {
                data.push(array[i])
            }
            break;
        }
        case "boolean":{
            let code = keymap.get("b");
            code |= generic ? 32768 : 0;
            data.push(code);
            break;
        }
        case "object":{
            if(Array.isArray(generic)){
                data.push("a".charCodeAt(0));
                for (var i = 0; i < generic.length; i++) {
                    compressTypeToBin(data,generic[i]);
                }
                data.push(".".charCodeAt(0));
                
            }else{
                data.push("o".charCodeAt(0));
                for(let property in generic){
                    let dat = generic[property];
                    for (var i = 0; i < property.length; i++) {
                        data.push(property.charCodeAt(i));
                    }
                    data.push(":".charCodeAt(0));
                    compressTypeToBin(data, dat);
                }
                data.push(".".charCodeAt(0));
                
            }
            break;
        }
    }
    return data;
}


function toArray(inp = 0) {
    let total = [];
    let val = Math.floor(inp);
    const len = 32768; //1<<15
    do {
        total.push(val % len);
        val = Math.floor(val / len);
    }
    while (val > 0)
    let out = [];
    for (var i = total.length; i >= 1; i--) {
        out[total.length - i] = total[i-1];
    }
    return out
}

function BItoArray(inp = 0n) {
    let total = [];
    let val = inp;
    const len = 32768n; //1<<15
    do {
        total.push(Number(val % len));
        val = (val / len);
    }
    while (val > 0n)
    let out = [];
    for (var i = total.length; i >= 1; i--) {
        out[total.length - i] = total[i-1];
    }
    return out
}
    
function arrayToBI(inp = [0]) {
    let total = 0n;
    let copy = [];
    for (var i = inp.length; i >= 1; i--) {
        copy[i-1] = inp[i-1];
    }
    for (let i = 0; i < copy.length; i++) {
        let x = BigInt(copy[i]);
        total += x * (32768n ** BigInt((copy.length - 1) - i));
    }
    return total
}
function arrayToInt(inp = [0]) {
    let total = 0;
    let copy = [];
    for (var i = inp.length; i >= 1; i--) {
        copy[i-1] = inp[i-1];
    }
    for (let i = 0; i < copy.length; i++) {
        let x = copy[i];
        total += x * (32768 ** ((copy.length - 1) - i));
    }
    return total
}

function decompressObject(string){
    let pos = 0;
    let flag1 = false;
    let flag2 = false;
    let flag3 = false;
    let flag4 = false;
    let time = Date.now();
    let processFlags = function(charcode){
        if((charcode & (1<<15)) != 0){
            flag1 = true;
            charcode &= ~(1<<15);
        }
        
        if((charcode & (1<<14)) != 0){
            flag2 = true;
            charcode &= ~(1<<14);
        }
        
        if((charcode & (1<<13)) != 0){
            flag3 = true;
            charcode &= ~(1<<13);
        }
        
        if((charcode & (1<<12)) != 0){
            flag4 = true;
            charcode &= ~(1<<12);
        }
        
        return charcode;
    }
    let processObjectString = function(string){
        let object = {};
        let key = [];
        while(pos < string.length && string.charCodeAt(pos)!=".".charCodeAt()){
            if(string.charCodeAt(pos)==":".charCodeAt()){
                pos++
                object[String.fromCharCode(...key)] = processTypeString(string);
                key = [];
                // console.log(object)
            } else {
                key.push(string.charCodeAt(pos));
            }
            pos++;
        }
        return object;
    }

    let processTypeString = function(string){
        let value = undefined;
        let code = processFlags(string.charCodeAt(pos));
        // console.log(String.fromCharCode(code)+", "+flag1+", "+flag2+", "+flag3+", "+flag4+" pos: "+pos);
        switch(code){
            case 11:{
                pos++;
                let array = [];
                while((string.charCodeAt(pos) & 32768) == 0){
                    array.push(string.charCodeAt(pos));
                    pos++
                }
                array.push(string.charCodeAt(pos) & (~32768));
                value = arrayToBI(array)*(flag1?-1n:1n);
                break;
            }
            case "i".charCodeAt():{
                pos++;
                let array = [];
                while((string.charCodeAt(pos) & 32768) == 0){
                    array.push(string.charCodeAt(pos));
                    pos++
                }
                array.push(string.charCodeAt(pos) & (~32768));
                value = arrayToInt(array)*(flag1?-1:1);
                break;
            }
            case keymap.get("f"):{
                pos++;
                let array = [];
                let num = 0;
                while((string.charCodeAt(pos) & 32768) == 0){
                    array.push(string.charCodeAt(pos));
                    pos++
                }
                array.push(string.charCodeAt(pos) & (~32768));
                pos++
                num = arrayToInt(array);
                num = +("0."+num);
                num = (flag1?0-num:num);
                array = [];
                
                while((string.charCodeAt(pos) & 32768) == 0){
                    array.push(string.charCodeAt(pos));
                    pos++
                }
                array.push(string.charCodeAt(pos) & (~32768));
                // console.log(array)
                value = num * (10**(arrayToInt(array)*(flag2?-1:1)));
                break;
            }
            case keymap.get("s"):{
                pos++;
                let array = [];
                while(string.charCodeAt(pos) != 3){
                    array.push(string.charCodeAt(pos));
                    pos++
                }
                value = String.fromCharCode(...array);
                break;
            }
            case keymap.get("a"):{
                pos++;
                let array = [];
                while(string.charCodeAt(pos) != ".".charCodeAt()){
                    array.push(processTypeString(string));
                    pos++
                    // console.log(array)
                }
                value = array;
                break;
            }
            case keymap.get("b"):{
                value = flag1;
                break;
            }
            case keymap.get("o"):{
                pos++;
                value = processObjectString(string);
                break;
            }
        }
        flag1 = false;
        flag2 = false;
        flag3 = false;
        flag4 = false;
        // if(value == undefined) throw new Error("stop");
        // console.log(value)
        // console.log("return pos: "+pos);
        return value;
    }
    let out = processObjectString(string);
    console.log("Took: "+((Date.now()-time)/1000)+" to load compressed data");
    return out;
}


function load(){
    let string = localStorage.getItem("theeternalcitysaves")??"V00";
    let version = string.charCodeAt(1);
    let data = decompressObject(string.substring(2));
    
    initModuleData(data);
    
    return data;
}