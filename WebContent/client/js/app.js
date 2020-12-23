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

function getUrlParam(param){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(param);
}

function setUrlParam(param, value, replace){
    // Construct URLSearchParams object instance from current URL querystring.
    var queryParams = new URLSearchParams(window.location.search);
     
    log("setting url param "+param+" to "+value);
    // Set new or modify existing parameter value. 
    queryParams.set(param, value);
     
    if(replace){
    // Replace current querystring with the new one.
	history.replaceState(null, null, "?"+queryParams.toString());
    }
    else{
	history.pushState(null, null, "?"+queryParams.toString());
    }
}