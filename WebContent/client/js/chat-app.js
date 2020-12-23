
    var wse = null;

    var lastColor = "#eeeeee";

    var peers = {

    }

    var nodeModel;

    var reconnectId;

    var reconnectDelay = 5000;
    
    var CHAT = CHAT || {
	testMode:false,
	countPackets:false,
	PARAMS: {
	  chatKey:"k"  
	},
	DATA:{
	    chatKey:null
	},
	VIDEO: {
	    userPermittedAutoplay:false,
	    defaultMimeType:"video/webm;codecs=vp8,opus",
	    defaultWidth:120,
	    defaultHeight:120,
	    videoSampleRate:12,
	    outputPeriod:1000,
	    selfStreamId:"self",
	    selfStreamSessionId:null,
	    
	    PEER_STREAMS:{
		/*
		 * add session id as key and an object as value, that contains
		 * at least the container displaying the stream
		 */
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
// log('Received: ' + event.data);
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

    function joinChat(createNew) {
	CHAT.DATA.createNew=createNew;
	if (wse) {
	    sendJoinChatRequest();
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
	var chatKey = CHAT.DATA.chatKey;
	if(chatKey == null && !CHAT.DATA.createNew){
	    chatKey = $("#chatKey").val();
	    CHAT.DATA.chatKey=chatKey;
	}
	wse.joinChat(chatKey);
    }

    function initNode(event) {
	nodeModel = event.data.model;

    }
    
    function initApp(){
	/* see if a key is provided */
	CHAT.DATA.chatKey = getUrlParam(CHAT.PARAMS.chatKey);
	
	log("init app with chat key "+CHAT.DATA.chatKey);
	if(CHAT.DATA.chatKey != null){
	    joinChat();
	}
	
	/* detect user interaction */
	$(window).bind("scroll click", function(){
	    CHAT.VIDEO.userPermittedAutoplay=true;
	});
    }
    
    function exitChat(){
	log("display exit dialog");
	    $( "#exit-confirm" ).dialog({
		      resizable: false,
		      height: "auto",
		      width: 300,
		      modal: true,
		      buttons: {
		        "Yes": function() {
		          $( this ).dialog( "close" );
		          closeChat();
		        },
		        "No": function() {
		          $( this ).dialog( "close" );
		        }
		      }
		    });
	
	
	
    }
    
    function closeChat(){
	disconnect();
	CHAT.DATA={};
	window.location.href="chat.html";
    }

    function initChat(event) {
	$("#connect-container").hide();
	$("#chat-container").show();
	$("#peers-data").empty();
	$("#msg").val('').prop("disabled", false);
	
	CHAT.DATA.chatKey=event.data.chatKey;
	log("init chat from event "+event.data.chatKey);
	
	/* set url chat key */
	setUrlParam(CHAT.PARAMS.chatKey,event.data.chatKey,true);

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
	
	/* if peers is streaming setup that */
	if(p.streamData != null){
	    
	    if(CHAT.VIDEO.userPermittedAutoplay){	    
		handlePeerStreamStarted(p.streamData);
	    }
	    else{
		log("requesting permission to autoplay");
		requestPermissionToAutoplay(function(){
		    CHAT.VIDEO.userPermittedAutoplay=true;
		    handlePeerStreamStarted(p.streamData);
		});
	    }
	}
	
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
	var chatKey = CHAT.DATA.chatKey;
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
        	    appTopicId: CHAT.DATA.chatKey,
        	    streamType:"video/webm"
	    }
	});
    }
    
    function toggleVideo(){
	var vidState = $("#videoState");
	if(vidState.hasClass("fa-video")){
	    /* video is on. turn it off */
	    stopVideo('self-video');
	}
	else{
	    /* video is turned off. start it */
	    sendStartStreamRequest();
	}
    }
    
    function toggleAudio(state){
	var audioState = $("#audioState");
	
	var isOn=audioState.hasClass("fa-microphone");
	
	if(isOn || (state != null && !state)){
	    audioState.removeClass("fa-microphone");
	    audioState.addClass("fa-microphone-slash");
	    /* audio is on. turn it off */
	    CHAT.VIDEO.selfSampler.setAudioState(false);
	}
	else if(!isOn || state){
	    /* audio is off. turn it on */
	    audioState.removeClass("fa-microphone-slash");
	    audioState.addClass("fa-microphone");
	    CHAT.VIDEO.selfSampler.setAudioState(true);
	}
    }
    
    function startVideo(containerId, streamingFq, streamingBufferSize){
	$("#video-area").show();
	var cont = $("#"+containerId);
// cont.show();
	log("streming to container "+containerId+" obj "+cont);
	if(streamingFq==null){
	    streamingFq=1;
	}
	
	if(streamingBufferSize==null){
	    streamingBufferSize=1000;
	}
	
	startVideoStreaming(cont[0],streamingFq,streamingBufferSize);
	

    }
    
    
    function stopVideo(containerId) {
	if(containerId == null){
	    containerId="self-video";
	}
	
	var cont = $("#"+containerId);
	var stream = cont[0].srcObject;
	if(stream != null){
	    stream.getTracks().forEach(track => track.stop());
	}
	
	cont.hide();  
	
	if(CHAT.VIDEO.selfSampler != null){
	    CHAT.VIDEO.selfSampler.stop();
	}
	
	/* send end strem event */
	if(CHAT.VIDEO.selfStreamSessionId != null){
	    wse.sendEndStream(CHAT.VIDEO.selfStreamSessionId);
	}
	
	/* clean up video session */
	CHAT.VIDEO.selfStreamSessionId=null;
	
	$("#self-canvas").hide();
	
	var vidState = $("#videoState");
	vidState.removeClass("fa-video");
	vidState.addClass("fa-video-slash");
	
	toggleAudio(false);
	$("#audioBtn").hide();
	
    }
    
    function onStreamDataAvailable(recordedBlob){
// log("Successfully recorded " + recordedBlob.size + " bytes of " +
// recordedBlob.type + " media. type "+ (typeof recordedBlob));
	
	if(recordedBlob.size == 0){
	    log("skip send 0 bytes");
	    return;
	}
	
	
	recordedBlob.arrayBuffer().then(buffer => {
// log("buffer "+buffer.byteLength);
	    
	    var bd=Array.from(new Uint8Array(buffer));
	    
	    wse.sendStreamPacket({
		streamSessionId: CHAT.VIDEO.selfStreamSessionId,
		data: bd
	    });
	    
//	   if(CHAT.DATA.packetsSent == null){
//	       CHAT.DATA.packetsSent=0;
//	   }	    
//	    log("sent packet: "+CHAT.DATA.packetsSent);
//	    CHAT.DATA.packetsSent++;
	});
    }
    
    function startVideoStreaming(videoContainer, streamingFq,streamingBufferSize){
	log("start video streaming with fq "+streamingFq);
	navigator.mediaDevices.getUserMedia({
	    video: { width: {ideal: CHAT.VIDEO.defaultWidth}, height: {ideal:CHAT.VIDEO.defaultHeight}},
	    audio: true
	  }).then(stream => {
	      
	      const videoTrack = stream.getVideoTracks()[0];
	      
	      var videoSettings = videoTrack.getSettings();
	      printObjectProps(videoSettings, "video settings");
	      
	      
	      videoContainer.srcObject = stream;
	    
	      videoContainer.captureStream = videoContainer.captureStream || videoContainer.mozCaptureStream;
	      videoContainer.play();
	      
	      
	      $("#self-canvas").show();
	      var canvasHolder = $("#self-canvas")[0];
	      CHAT.VIDEO.selfSampler = new VideoToCanvasSampler({sampleRate:CHAT.VIDEO.videoSampleRate, outputPeriod:CHAT.VIDEO.outputPeriod, onDataAvailable:onStreamDataAvailable}, videoContainer, canvasHolder);
	      CHAT.VIDEO.selfSampler.start();
	      
	      /* change video button state */
		var vidState = $("#videoState");
		vidState.removeClass("fa-video-slash");
		vidState.addClass("fa-video");
		
		$("#audioBtn").show();
		
		/* disable audio after the sampler starts sending data */
		setTimeout(function(){
		    log("chat video = "+CHAT.VIDEO);
		    CHAT.VIDEO.selfSampler.setAudioState(false);
		},200);
	      
	      /* only for testing */
	      if(CHAT.testMode){
        	      $("#test-video").show();
        	      $("#test-video")[0].src = URL.createObjectURL(CHAT.VIDEO.selfSampler.getMediaSource());
	      }
// startStreamRecording(stream, streamingBufferSize, onStreamDataAvailable);
	      
	      
	      
	    return new Promise(resolve => videoContainer.onplaying = resolve);
	  }).then(
		  () => {
		      var capturedStream = videoContainer.captureStream(streamingFq);
		      const csVideoTrack = capturedStream.getVideoTracks()[0];
		      log("cs video track "+csVideoTrack);
		      
		       csVideoTrack.applyConstraints({
			  width: {ideal: 640},
			  height: {ideal: 480},
			  frameRate: {ideal: 10, max: 15}
		       }).then(() => {})
		       .catch(e => {
			   log("failed to apply constraints on cs stream -> "+e);
		       });
		      
		       printObjectProps(csVideoTrack.getSettings(), "captured stream");

		      }
		  ).catch(e => {
		      log("get user media failed.");
		      stopVideo("self-video");
		  });
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
// recorder.start();
	}
    
    function handleDataStreamAccepted(event){
	/* setup our stream data */
	
	var streamData = event.data;
	var streamInfo = streamData.streamInfo;
	
	var streamSessionId = streamData.streamSessionId;
	CHAT.VIDEO.selfStreamSessionId=streamSessionId;
	
	/* start transmission */
	startVideo("self-video");
    }
    
    function handlePeerStreamStarted(streamData){
	/* create a container to display this stream */
// var streamData = data.streamData;
	var streamInfo = streamData.streamInfo;
	
	var streamSessionId = streamData.streamSessionId;
	
	var sCont = $("#videoStreamTemp").clone();
	
	/* make sure the video container is visible */
	$("#video-area").show();
	log("Showing peers video container");
	$("#peers-video").append(sCont);
	sCont.show();
	    
	    
	var vidCont = sCont.find("video");
	vidCont.show();
	vidCont.attr("id",streamSessionId);
	sCont.attr("id",streamSessionId+"-cont");
	
//	vidCont[0].addEventListener("loadeddata", e =>{
//	   log("video frame loaded"); 
//	   
//	});
//	vidCont[0].addEventListener("canplay", e=>{
//	   log("video can play"); 
//	   vidCont[0].play();
//	});
	
	/* create an object to store video data for this peer */
	var peerData={};
	
	peerData.videoController=new VideoController(vidCont[0],streamData);
	
	CHAT.VIDEO.PEER_STREAMS[streamSessionId]=peerData;
    }
    
    function handlePeerStreamEnded(event){
	var data = event.data;
	var peerStreamData = data.peerStreamData;
	var streamData = peerStreamData.streamData;
	var streamSessionId = streamData.streamSessionId;
	
	log("removing peer session "+streamSessionId);
	
	/* remove peer data for this stream */
	delete CHAT.VIDEO.PEER_STREAMS[streamSessionId];
	
	/* remove video container for this peer */
	$("#"+streamSessionId+"-cont").remove();
	
    }
    
    function syncToBuffer(mediaBuffer, video, offset){
	log("sync to buffer");
	var buffered = mediaBuffer.buffered;
	if(buffered.length <= 0){
	    return;
	}
	
	var bufTime = buffered.end(buffered.length-1);
	
	var vidTime = video.currentTime;
	
	log("syncing buf time="+bufTime+" to vid time "+vidTime+" with offset "+offset);
	if( (bufTime - vidTime) > offset ){
	    video.currentTime=(bufTime-offset);
	}
	log("new vid time "+video.currentTime);
    }
    
    function handleStreamDataPacket(event){
	var packet = event.data;
	/* get peer data for this stream */
	var peerData = CHAT.VIDEO.PEER_STREAMS[packet.streamSessionId];
	if(peerData == null || packet.data.length==0){
	    return;
	}
	
	peerData.videoController.dataHandler(packet.data);
	
 var buffered = peerData.videoController.mediaSourceBuffer.buffered;
// if(buffered.length>0){ 
//     log("got packet "+event.params.pc +" buffered="+buffered.end(buffered.length-1) +" playing at "+$("#"+packet.streamSessionId)[0].currentTime);
// }
    }
    
    function testAndRequestPlayPermission(grantedCallback,deniedCallback){
	if(CHAT.VIDEO.userPermittedAutoplay){
	    if(grantedCallback != null){
	              grantedCallback();
	          }
	}
	else{
	    requestPermissionToAutoplay(function(){
		CHAT.VIDEO.userPermittedAutoplay=true;
		grantedCallback();
	    },deniedCallback);
	}
    }
    
    /**
     * Asks for user permission to play video if autoplay is blocked by the browser
     */
    
    function requestPermissionToAutoplay(grantedCallback,deniedCallback){
	var div = $( "<div>" ).attr("title","Permission required").text("Peers are currently broadcasting video. Do you want to see them?");
	div.dialog({
	      modal: true,
	      buttons: {
	        Ok: function() {
	          $( this ).dialog( "close" );
	          if(grantedCallback != null){
	              grantedCallback();
	          }
	        },
	        No: function(){
	            $( this ).dialog( "close" );
	            if(deniedCallback != null){
	        	deniedCallback();
	            }
	        }
	      }
	    });
    }
    
    function handleDataStreamRejected(event){
	var msg = "Streaming rejected by the server.";
	var data = event.data;
	if(data != null && data.reason != null && data.reason.message != null){
	    msg = data.reason.message;
	}
	
	    $( "<div>" ).attr("title","Streaming error").text(msg).dialog({
		      modal: true,
		      buttons: {
		        Ok: function() {
		          $( this ).dialog( "close" );
		        }
		      }
		    });
    }
    
    function handleChatError(event){
	var msg = "Couldn't join chat at this time. Try again later.";
	var data = event.data;
	if(data != null && data.reason != null){
	    msg = data.reason;
	}
	
	    $( "<div>" ).attr("title","Chat error").text(msg).dialog({
		      modal: true,
		      buttons: {
		        Ok: function() {
		          $( this ).dialog( "close" );
		        }
		      }
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
	"PEER:CHAT:ERROR" : function(ec){
	    handleChatError(ec.event);
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
	"DATA:STREAM:REJECTED" : function(ec){
	    handleDataStreamRejected(ec.event);
	},
	"PEER:STREAM:STARTED" : function(ec){
	    handlePeerStreamStarted(ec.event.data.streamData);
	},
	
	"DATA:STREAM:PACKET" : function(ec){
	    handleStreamDataPacket(ec.event);
	},
	
	"PEER:STREAM:ENDED" : function(ec){
	    handlePeerStreamEnded(ec.event);
	}
    });