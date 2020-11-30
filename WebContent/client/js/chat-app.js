
    var wse = null;

    var lastColor = "#eeeeee";

    var peers = {

    }

    var nodeModel;

    var reconnectId;

    var reconnectDelay = 5000;

    function updateTarget(uri, relPath) {
	var target = uri;
	if (relPath != null) {
	    
	    /* get the path prefix relative to the specified relative path */
	    var pathname = window.location.pathname;
	    var i = pathname.indexOf(relPath);
	    if (i >= 0) {
		target = pathname.substring(0, i) + uri;
	    }

	}

	if (window.location.protocol == 'http:') {
	    document.getElementById('target').value = 'ws://'
		    + window.location.host + target;
	} else {
	    document.getElementById('target').value = 'wss://'
		    + window.location.host + target;
	}
    }

    function setConnected(connected) {

    }

    function setVisible(id, visible) {
	var elem = document.getElementById(id);
	if (visible) {
	    $(elem).show();
	} else {
	    $(elem).hide();
	}
    }

    function connect() {
	var target = document.getElementById('target').value;
	if (target == '') {
	    alert('Please select server side connection implementation.');
	    return;
	}
	log("connecting...")
	reconnectId = null;
	var wshandler = {
	    onopen : function() {
		clearTimeout(reconnectId);
		setConnected(true);
		log('Info: WebSocket connection opened.');
		reconnectId = null;
	    },
	    onmessage : function(event) {
		log('Received: ' + event.data);
	    },
	    onclose : function(event) {
		setConnected(false);
		var msg = 'WebSocket connection closed, Code: '
			+ event.code
			+ (event.reason == "" ? "" : ", Reason: "
				+ event.reason);
		log(msg);
		$("#infoCont").text(msg).show();
		$("#peers-data").empty();
		$("#msg").val('').prop("disabled", true);

		/* reconnect if the user din't close on purpose*/
		reconnect();
	    },
	    onerror : function(event) {
		log("Ws error " + event);
		if(wse !=null){
		    wse.close();
		}
	    }
	};

	wse = new StatusAppClient(target, true, wshandler, appState);

    }

    function disconnect() {
	if(wse==null){
	    return;
	}
	wse.close();
	setConnected(false);
	wse=null;
	log("Disconnected.")
    }

    function joinChat() {
	if (wse) {
//	    sendJoinChatRequest();
	} else {
	    connect();
	}
    }

    function reconnect() {
	if (reconnectId != null) {
	    /* already in the process of reconnecting */
	    return;
	}
	$("#infoCont").text("Reconnecting...").show();
	reconnectId = setTimeout(function() {
	    if(reconnectId != null){
		connect();
		reconnectId=null;
	    }
	}, reconnectDelay);
    }

    function sendJoinChatRequest() {
	var chatKey = $("#chatKey").val();
	wse.joinChat(chatKey);
    }

    function initNode(event) {
	nodeModel = event.data.model;

    }

    function initChat(event) {
	$("#connect-container").hide();
	$("#chat-container").show();
	$("#peers-data").empty();
	$("#msg").val('').prop("disabled", false);

	var ourChatData;
	/* reset last color */
	lastColor = "#eeeeee";

	/* reset chat participants */
	peers = {};

	if (event.data.participants) {
	    event.data.participants.forEach(function(p) {
		if (p.peerId != nodeModel.clientId) {
		    addChatParticipant(p);
		} else {
		    ourChatData = p;
		}
	    });
	}

	$("#infoCont").empty();

	/* get our alias */

	var ourAlias;

	if (ourChatData != null) {
	    ourAlias = getShortAlias(ourChatData.alias);
	} else {
	    ourAlias = getShortAlias(nodeModel.clientId);
	}

	$("#infoCont").append($("<label>").text("Connected as ")).append(
		$("<div>").text(ourAlias).addClass("peer-id"));

    }

    function addChatParticipant(p) {

	/* generate a color for this peer */
	lastColor = generateColors(parseInt(lastColor.substring(1), 16),
		30303040, 1)[0];

	var pContext = {
	    color : lastColor,
	    data : p,
	    shortAlias : getShortAlias(p.alias),
	    settings : {}
	}

	peers[p.peerId] = pContext;

	// 	$("#peers-data")
	// 		.append(
	// 			$("<div>").attr("id", p.peerId).text(
	// 				pContext.shortAlias).addClass("peer-id").css(
	// 				'background-color', lastColor));

	var peerInfo = getPeerInfoElem(pContext.shortAlias, p.peerId, {
	    color : lastColor
	});
	peerInfo.attr("id", p.peerId);
	$("#peers-data").append(peerInfo);
    }

    function removeChatParticipant(peerId) {
	$("#peers-data").find("#" + escapeSelector(peerId)).remove();

	delete peers[peerId];
    }

    function escapeSelector(myid) {
	return myid.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");
    }

    function addChatMessage(message, from) {
	var alias;
	if (from == wse.remoteId) {
	    alias = "Me: ";
	}
	appendChatMessage(message, alias, from);
	autoscroll("messages-area");

    }

    function appendChatMessage(message, alias, from) {
	var pContext = peers[from];

	if (pContext != null && pContext.settings["mutedPeer"]) {
	    log("ignoring message from " + from + ". Peer is muted.");
	    return;
	}

	var msgArea = $("#messages-area");

	var msgCont = $("<div>").addClass("msg-cont");

	var na = $("<div>").addClass("sender-name-area");
	var ta = $("<div>").addClass("msg-text-area");

	var color = "#aaaaaa";

	if (pContext) {
	    color = pContext.color;
	    if (alias == null) {
		alias = pContext.shortAlias;
	    }
	}
	if (alias == null) {
	    alias = getShortAlias(from);
	}

	var peerInfo = getPeerInfoElem(alias, from, {
	    color : color
	});

	na.append(peerInfo);

	var msgText = $("<div>").text(message).addClass("msg-text");
	var msgMask = $("<div>").addClass("msg-mask").css("background", color)
		.text(message);

	var msgDiv = $("<div>").addClass("msg-div");
	msgDiv.append(msgText);
	msgDiv.append(msgMask);

	ta.append(msgDiv);

	msgCont.append(na);
	msgCont.append(ta);

	msgArea.append(msgCont);
    }

    function getPeerInfoElem(alias, peerId, options) {
	var peerInfoCont = $("#peerInfoTemp").clone();
	/* set alis as class */
	peerInfoCont.addClass(alias);
	/* reset id */
	peerInfoCont.attr("id", "");

	var peerIdElem = peerInfoCont.find(".peerIdElem");
	peerIdElem.text(alias).addClass("peer-id").css('background-color',
		options.color);

	var mutedCk = peerInfoCont.find(".mutedPeer");
	log("add change list " + mutedCk.length);
	mutedCk.change(function(e) {
	    var mutedVal = mutedCk.prop("checked");
	    log("blacklist peer " + peerId + " " + mutedVal);
	    peers[peerId].settings["mutedPeer"] = mutedVal;
	    if (mutedVal) {
		$("#" + peerId + " .peerState").css("background", "black")
			.attr("title", "is muted").show();
	    } else {
		$("#" + peerId + " .peerState").hide();
	    }
	});
	peerIdElem.off('click');
	peerIdElem.click(function(e) {
	    /* don't display menu if we're clicking on our id */
	    if (peerId == nodeModel.clientId) {
		return;
	    }

	    var pc = peerInfoCont.find(".peerControls");
	    if (pc.css("display") == 'none') {
		if (peers[peerId] == null) {
		    /* has left */
		    var peerNotif = peerInfoCont.find(".peerNotif");
		    peerNotif.text("has left");
		    peerNotif.removeClass("notif");
		    void peerNotif[0].offsetWidth;
		    peerNotif.addClass("notif");
		    return;

		}

		populatePeerControls(peerId, pc);
		/* hide all peer controls before opening this one */
		$(".peerControls").hide();
		pc.css("z-index", 99);
		pc.css("display", "inline-block");

	    } else {
		pc.hide();
	    }
	});

	peerInfoCont.find(".peerControls").hide();
	peerInfoCont.show();
	return peerInfoCont;
    }

    function populatePeerControls(peerId, controls) {
	var pContext = peers[peerId];
	var settings = pContext.settings;
	if (settings == null) {
	    pContext.settings = {};
	    return;
	}

	for ( var s in settings) {
	    controls.find("." + s).prop('checked', settings[s]);
	    log("setting control " + s + " to " + settings[s]);
	}
    }

    function getShortAlias(alias) {
	if (alias != null) {
	    return alias.substring(0, 10);
	}
	return "N/A";
    }

    function sendMessage() {
	var chatKey = $("#chatKey").val();
	var message = $("#msg").val();

	if (message.trim() != "") {
	    addChatMessage(message, wse.remoteId);

	    wse.sendChatMessage(chatKey, message);
	}
	$("#msg").val('');
    }

    function onKeyPress(event) {

	var key = event.keyCode;
	// If the user has pressed enter
	if (key == 13) {
	    sendMessage();
	    return false;
	} else {
	    return true;
	}
    }

    function autoscroll(elemId) {
	var objDiv = document.getElementById(elemId);
	objDiv.scrollTop = objDiv.scrollHeight;
    }

    function generateColors(startCol, step, count) {
	var out = [];
	var nextColor = startCol;

	for (var i = 0; i < count; i++) {
	    nextColor += step;
	    color = '#' + ('00000' + (nextColor | 0).toString(16)).substr(-6);
	    out.push(color);
	}

	return out;
    }

    function showHidePeers() {
	console.log($("#peersButton").text());
	if ($("#peers-area").css('display') == 'none'
		|| $("#peers-area").css("visibility") == "hidden") {
	    $("#peers-area").show();
	    $("#chat-area").removeClass("chat-fullscreen");
	    $("#peersButton").removeClass("closed").addClass("open");
	} else {
	    $("#peers-area").hide();
	    $("#chat-area").addClass("chat-fullscreen");
	    $("#peersButton").removeClass("open").addClass("closed");
	}
    }

    function toggleHelp() {
	$("#help").dialog({
	    modal : true,
	    width : 300
	});
    }

    var appState = new WsState("APP_STATE", {

	/* now we can init */
	"STATUS-APP:PEER:INIT" : function(ec) {
	    initNode(ec.event);
	    sendJoinChatRequest();
	},

	"PEER:CHAT:INIT" : function(ec) {
	    initChat(ec.event);
	},

	"PEER:CHAT:JOINED" : function(ec) {
	    addChatParticipant(ec.event.data);
	},

	"PEER:CHAT:LEFT" : function(ec) {
	    removeChatParticipant(ec.event.data.peerId);
	},

	"PEER:CHAT:MESSAGE" : function(ec) {
	    addChatMessage(ec.event.data.message, ec.event.header.from);
	}
    });