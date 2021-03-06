var EBUS = EBUS || {
    logging : false,
    /* specific events configs */
    ECONF:{
	"DATA:STREAM:PACKET": {
	    logging: false
	}
    },
    WS : {
	/**
	 * each state may define handlers for different event types
	 * 
	 */
	STATES : {},

	STATS : {
	    /* how many ws endpoints have been created */
	    instantiated : 0
	}
    }
};

EBUS.isEventLogEnabled=function(event){
    if(!EBUS.logging){
	return false;
    }
    var conf = EBUS.ECONF[event.et];
    if(conf != null && conf.logging != null){
	return conf.logging;
    }
    return true;
}

/**
 * Defines the state of a websocket endpoint
 */
function WsState(name, handlers) {
    this.name;
    this.handlers = handlers;
    this.extraHandlers = {};
}

WsState.prototype = Object.create(WsState.prototype);
WsState.prototype.constructor = WsState;

/**
 * will receive as parameter an object of this type : {event : <the event>, wse :
 * <the source ws endpoint> }
 */
WsState.prototype.handle = function(ec) {
    /* see if we have a handler */
    var h = this.handlers[ec.event.et];
    if (h) {
	/* call it */
	h(ec);
    }

    /* handle nested */

    var eh = this.extraHandlers[ec.event.et];
    if (eh && eh.nh) {
	eh.nh.forEach(function(ehi) {
	    try {
		ehi(ec);
	    } catch (e) {
		self.log("error: " + e + "handler: " + ehi);
	    }
	});
    }
}

WsState.prototype.registerHandler = function(et, h) {
    var eh = this.extraHandlers[et];

    if (eh == null) {
	eh = {
	    "nh" : []
	};
	this.extraHandlers[et] = eh;
    }
    eh.nh.push(h);
}

EBUS.WS.STATES.OPENED = new WsState("OPENED", {
    "EBUS:PEER:CONNECTED" : function(ec) {

	/* set on the endpoint the id assigned by the server */
	ec.wse.remoteId = ec.event.params.clientId;

	var authEvent = {
	    et : "EBUS:PEER:AUTH",
	    params : {
		clientId : ec.event.params.clientId
	    }
	}
	ec.wse.state = EBUS.WS.STATES.CONNECTED;
	ec.wse.send(authEvent);
    }

});

EBUS.WS.STATES.CONNECTED = new WsState("CONNECTED", {
    "EBUS:PEER:AUTHENTICATED" : function(ec) {
	ec.wse.active = true;
	ec.wse.state = ec.wse.activeState;

	/* notify the active state that we're authenticated */
	ec.wse.activeState.handle(ec);
    }
});

function EventWsEndpoint(url, autoConnect, handler, activeState) {
    this.id = "WSE-" + ++EBUS.WS.STATS.instantiated;
    /* target url */
    this.url = url;

    /* ws handlers */
    this.handlers = [ this ];

    /**
     * This is the normal functioning state, after we were successfully accepted
     * by the server
     */
    this.activeState = activeState;

    if (handler) {
	this.handlers.push(handler);
    }

    /* websocket instance */
    this.ws;

    /* the current state of the endpoint */
    this.state;

    /* the id assigned by the server */
    this.remoteId;

    /* internal data for this endpoint */
    this.data = {};

    /* the last event received */
    this.lastEvent;

    /* true if we are in the active state */
    this.active;

    if (autoConnect) {
	this.connect();
    }

}

EventWsEndpoint.prototype = Object.create(EventWsEndpoint.prototype);

EventWsEndpoint.prototype.constructor = EventWsEndpoint;

/**
 * Starts ws connection
 */
EventWsEndpoint.prototype.connect = function() {
    this.log("Creating ws for url "+this.url);
    if ('WebSocket' in window) {
	this.ws = new WebSocket(this.url);
    } else if ('MozWebSocket' in window) {
	this.ws = new MozWebSocket(this.url);
    } else {
	throw 'WebSocket is not supported by this browser.';
    }

    this.bindWs();
}

EventWsEndpoint.prototype.close = function() {
    if (this.ws) {
	this.ws.close();
	this.ws = null;
    }
}

EventWsEndpoint.prototype.handlersDelegate = function(funcName) {
    var that = this;
    return function() {
	that.callHandlers(funcName, arguments);
    }
}

EventWsEndpoint.prototype.callHandlers = function(funcName, args) {
    var self = this;
    this.handlers.forEach(function(h) {
	try {
	    h[funcName].apply(h, args);
	} catch (e) {
	    self.log("error: " + e + "handler: " + h + " func: " + funcName);
	}
    });
}

/**
 * adds ws handlers
 */
EventWsEndpoint.prototype.bindWs = function() {
    this.log("binding ws");
    this.ws.onopen = this.handlersDelegate("onopen");
    this.ws.onclose = this.handlersDelegate("onclose");
    this.ws.onmessage = this.handlersDelegate("onmessage");
    this.ws.onerror = this.handlersDelegate("onerror");
}

EventWsEndpoint.prototype.log = function(message) {
    if (EBUS.logging) {
	console.log(this.id + " : " + message);
    }
}

EventWsEndpoint.prototype.send = function(event) {
    var s = JSON.stringify(event);
    if(EBUS.isEventLogEnabled(event)){
    	this.log("sending: " + s);
    }
    try {
	this.ws.send(s);
    } catch (e) {
	log("Send failed: " + e);
    }
}

/* ws.onopen */
EventWsEndpoint.prototype.onopen = function() {
    this.state = EBUS.WS.STATES.OPENED;
    this.log("opened");
}

/* ws.onclose */
EventWsEndpoint.prototype.onclose = function(event) {
    this.log("closed -> " + event);
    if (this.ws) {
	this.ws = null;
    }
}

/* ws.onmessage */
EventWsEndpoint.prototype.onmessage = function(event) {
    var evData = event.data;

    if (evData instanceof Blob) {
	var reader = new FileReader();
	var that = this;
	reader.onload = function() {
	    that.handleEvent(reader.result);
	}
	reader.readAsText(evData);
    } else {
	this.handleEvent(evData);
    }

}

EventWsEndpoint.prototype.handleEvent = function(event) {
    this.lastEvent = JSON.parse(event);
    if(EBUS.isEventLogEnabled(this.lastEvent)){
	this.log("handling: " + event);
    }
    
    if (this.state != null) {
	this.state.handle({
	    event : this.lastEvent,
	    wse : this
	});
    }
}

/* ws.onerror */
EventWsEndpoint.prototype.onerror = function(event) {
    this.log("error: "
	    + JSON.stringify(event, [ "message", "arguments", "type", "name",
		    "details" ]));
}

EventWsEndpoint.prototype.sendStartStream=function(data){
    this.send({
	et : "DATA:STREAM:START",
	data : data
    });
}
EventWsEndpoint.prototype.sendEndStream=function(streamSessionId,closeCode){
    this.send({
	et : "DATA:STREAM:END",
	data : {
	    streamSessionId: streamSessionId,
	    reason: {
		code: (closeCode != null)?closeCode:0
	    }
	}
    });
}

EventWsEndpoint.prototype.sendStreamPacket=function(data,params){
    this.send({
	et : "DATA:STREAM:PACKET",
	data : data,
	params:params
    });
}
