
    var wse = null;

    var lastColor = "#eeeeee";

    var peers = {

    }

    var nodeModel;

    var reconnectId;

    var reconnectDelay = 5000;
    
    var CHAT = CHAT || {
	VIDEO: {
	    selfStreamId:"self",
	    selfStreamSessionId:null,
	    
	    PEER_STREAMS:{
		/* add session id as key and an object as value, that contains at least the container displaying the stream */
	    }
	    
	    
	}
    };
    
    

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

		/* reconnect if the user din't close on purpose */
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
// sendJoinChatRequest();
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

	// $("#peers-data")
	// .append(
	// $("<div>").attr("id", p.peerId).text(
	// pContext.shortAlias).addClass("peer-id").css(
	// 'background-color', lastColor));

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
    
    
    function sendStartStreamRequest(){
	wse.sendStartStream({
	    streamInfo: {
        	    streamId:"self",
        	    appId:"CHAT",
        	    appTopicId: $("#chatKey").val(),
        	    streamType:"video/webm"
	    }
	});
    }
    
    function startVideo(containerId, streamingFq, streamingBufferSize){
	$("#video-area").show();
	var cont = $("#"+containerId);
	cont.show();
	log("streming to container "+containerId+" obj "+cont);
	if(streamingFq==null){
	    streamingFq=1;
	}
	
	if(streamingBufferSize==null){
	    streamingBufferSize=1000;
	}
	
	startVideoStreaming(cont[0],streamingFq,streamingBufferSize);
	
	 
	 
//	 canvasContext = canvasHolder.getContext('2d');
//	 var st = canvasHolder.captureStream();
//
//	 log("audio: "+st.getAudioTracks().length);
    }
    
    function stopVideo(containerId) {
	var cont = $("#"+containerId);
	var stream = cont[0].srcObject;
	stream.getTracks().forEach(track => track.stop());
	cont.hide();  
	
	if(CHAT.VIDEO.selfSampler != null){
	    CHAT.VIDEO.selfSampler.stop();
	}
	log("stop video");
    }
    
    function onStreamDataAvailable(recordedBlob){
	log("Successfully recorded " + recordedBlob.size + " bytes of " +
	        recordedBlob.type + " media. type "+ (typeof recordedBlob));
	
//	recordedBlob.arrayBuffer().then(buffer => {
//	    
//	    $("#test-video")[0].src = URL.createObjectURL(new Blob(buffer,{ type: "video/webm" }));
//	});
	
//	if($("#test-video")[0].src == ""){
//	    $("#test-video")[0].src = URL.createObjectURL(recordedBlob);
//	}
	
//	var buffer=[];
//	buffer.push(recordedBlob);
	
//	recordedBlob.arrayBuffer().then(buffer => {
//	    log("buffer "+buffer.byteLength);
//	    
//	    var bd=Array.from(new Uint8Array(buffer));
//	    
//	    wse.sendStreamPacket({
//		streamSessionId: CHAT.VIDEO.selfStreamSessionId,
//		data: bd
//	    })
//	    
//	});
    }
    
    function startVideoStreaming(videoContainer, streamingFq,streamingBufferSize){
	log("start video streaming with fq "+streamingFq);
	navigator.mediaDevices.getUserMedia({
	    video: { width: 160, height: 120},
	    audio: true
	  }).then(stream => {
	      
	      const videoTrack = stream.getVideoTracks()[0];
	      
	      var videoSettings = videoTrack.getSettings();
	      printObjectProps(videoSettings, "video settings");
	      
	      
	      videoContainer.srcObject = stream;
	    
	      videoContainer.captureStream = videoContainer.captureStream || videoContainer.mozCaptureStream;
	      
	      var canvasHolder = $("#self-canvas")[0];
	      CHAT.VIDEO.selfSampler = new VideoToCanvasSampler({sampleRate:12, outputPeriod:5000, onDataAvailable:onStreamDataAvailable}, videoContainer, canvasHolder);
	      CHAT.VIDEO.selfSampler.start();
	      
	      $("#test-video")[0].src = URL.createObjectURL(CHAT.VIDEO.selfSampler.getMediaSource());
	      
//	      startStreamRecording(stream, streamingBufferSize, onStreamDataAvailable);
	      
	      
	      
	    return new Promise(resolve => videoContainer.onplaying = resolve);
	  }).then(
		  () => {
		      var capturedStream = videoContainer.captureStream(streamingFq);
		      const csVideoTrack = capturedStream.getVideoTracks()[0];
		      log("cs video track "+csVideoTrack);
//		      csVideoTrack.applyConstraints({width:160, height:120});
		      
		       csVideoTrack.applyConstraints({
			  width: {exact: 640},
			  height: {exact: 480},
			  frameRate: {ideal: 10, max: 15}
		       }).then(() => {})
		       .catch(e => {
			   log("failed to apply constraints on cs stream -> "+e);
		       });
		      
		       printObjectProps(csVideoTrack.getSettings(), "captured stream");
		      
		      
//		      startStreamRecording(capturedStream, streamingBufferSize, onStreamDataAvailable);
		      }
		  );
    }
    
    function startStreamRecording(stream, lengthInMS, onData) {
	 const recorder = new MediaRecorder(stream);
	 
	 log("start stream recording: "+recorder.videoBitsPerSecond);

	        // fires every one second and passes an BlobEvent
	        recorder.ondataavailable = event => {

	            // get the Blob from the event
	            const blob = event.data;

	            // and send that blob to the server...
	            onData(blob);
	        };

	        // make data available event fire every one second
	        recorder.start(lengthInMS);
//	        recorder.start();
	}
    
    function handleDataStreamAccepted(event){
	startVideo("self-video");
    }
    
    function handlePeerStreamStarted(event){
	/* create a container to display this stream */
	var data = event.data;
	var streamData = data.streamData;
	var streamInfo = streamData.streamInfo;
	
	var streamSessionId = streamData.streamSessionId;
	CHAT.VIDEO.selfStreamSessionId=streamSessionId;
	
	var sCont = $("#videoStreamTemp").clone();
	
	$("#peers-video").append(sCont);
	sCont.show();
	    
	    
	var vidCont = sCont.find("video");
	vidCont.attr("id",streamSessionId);	
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
	},
	
	"DATA:STREAM:ACCEPTED" : function(ec){
	    handleDataStreamAccepted(ec.event);
	},
	
	"PEER:STREAM:STARTED" : function(ec){
	    handlePeerStreamStarted(ec.event);
	}
    });