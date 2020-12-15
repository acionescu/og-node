var JSAPP = JSAPP || {
    
    logging:true
}

function log(message) {
	if(JSAPP.logging){
		console.log(message);
	}
}

function printObjectProps(obj, desc){
    console.log(desc+" props ->");
    for(var p in obj){
	console.log(p+":"+obj[p]);
    }
    
    console.log("<- "+desc+" props");
}