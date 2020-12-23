class MediaSampler{
    /**
     * Expects a MediaStreamTrack
     */
    constructor(config={sampleRate:25}){
	
	this.config=config;
	this.interval;
    }
    start(){
	if(this.interval != null){
	    throw new Error("Already running.")
	}
	this.interval = setInterval(this.doSample.bind(this),1000/this.config.sampleRate);
    }
    stop(){
	if(this.interval != null){
	    clearInterval(this.interval);
	}
    }
    doSample(){
	let data = this.sample();
	if(this.config.callback != null){
	    this.config.callback(data);
	}
    }
    sample(){
	/* to implement */
    }
}

class VideoMediaTrackSampler extends MediaSampler{
    /**
     * output is a canvas container
     */
    constructor(config,output){
	super(track,config);
	this.imageCapture = new ImageCapture(track);
    }
    sample(){
	this.grabFrame();
    }
    grabFrame() {
	  this.imageCapture.grabFrame()
	  .then(imageBitmap =>{
// console.log('Grabbed frame:', imageBitmap);
	    canvas.width = imageBitmap.width;
	    canvas.height = imageBitmap.height;
	    canvas.getContext('2d').drawImage(imageBitmap, 0, 0);
	    canvas.classList.remove('hidden');
	  })
	  .catch(error => {
	    console.log('grabFrame() error: ', error);
	  });
	}
}


class VideoToCanvasSampler extends MediaSampler{
    
    constructor(config,video,canvas){
	super(config);
	this.video=video;
	this.canvas=canvas;
	this.canvasContext = canvas.getContext('2d');
	
	this.sxOffset=0;
	this.syOffset=0;
	
	this.sMinSize=Math.min(video.videoWidth,video.videoHeight);
	
	log("sMinSize="+this.sMinSize);
	
	/* compute source offsets */
	if(video.videoWidth > this.sMinSize){
	    this.sxOffset=(video.videoWidth-this.sMinSize)/2;
	}
	
	this.audioRecorder;
	
	this.compositeStream=new MediaStream();
	this.recorder=new MediaRecorder(this.compositeStream);
	
	if(this.config.outputPeriod==null){
	    this.config.outputPeriod=1000;
	}
	
	this.recorder.ondataavailable = this.onDataAvailable.bind(this);
	
	this.mediaSource=new MediaSource();
	
	this.defaultMimeType="video/webm;codecs=vp8,opus";
	
	this.outputBuffer;
	var self=this;
	this.mediaSource.addEventListener('sourceopen', function(_){
	    
	    self.outputBuffer = self.mediaSource.addSourceBuffer(self.defaultMimeType);
	    self.outputBuffer.mode="sequence";
	    log("source open -> "+self.outputBuffer);
// self.outputBuffer.addEventListener('updateend', function (_) {
// self.mediaSource.endOfStream();
//		     
// });
	});
    }
    start(){
	super.start();
	this.initVideoSampler();
	this.initAudioSampler();
	
	this.recorder.ignoreMutedMedia=true;
	this.recorder.start(this.config.outputPeriod);
//	this.recorder.start();
	
	this.recorder.requestData();
    }
    
    stop(){
	super.stop();
	this.recorder.stop();
	if(this.outputBuffer != null){
	    this.mediaSource.endOfStream();
	}
    }
    initVideoSampler(){
	log("init video sampler");
	this.compositeStream.addTrack(this.canvas.captureStream(this.config.sampleRate).getVideoTracks()[0]);
    }
    initAudioSampler(){
	var sourceStream = this.video.srcObject;
	var audioTracks = sourceStream.getAudioTracks();
	log("audio tracks available: "+audioTracks.length);
	if(audioTracks.length > 0){
// /* create a separate audio stream */
// var audioSourceStream = new MediaStream();
// audioSourceStream.addTrack(audioTracks[0]);
//	    
// this.audioRecorder=new MediaRecorder(audioSourceStream);
//	    
// this.audioRecorder.ondataavailable = this.sampleAudio.bind(this);
// this.audioRecorder.start();
// log("started audio recorder "+this.audioRecorder.mimeType);
	    
	    
	    this.compositeStream.addTrack(audioTracks[0]);
	}
    }
    getMediaSource(){
	return this.mediaSource;
    }
    
    onDataAvailable(event){
	var self = this;
	
	if(this.config.onDataAvailable){
	    this.config.onDataAvailable(event.data);
	}
	
	event.data.arrayBuffer().then(buffer =>{
	    if(self.outputBuffer != null){
		self.outputBuffer.appendBuffer(buffer);
	    }
	});
	
	
    }
    requestData(){
	this.recorder.requestData();
    }
    
    sample(){
	if(this.sMinSize==0){
	    this.computeSampleSizes();
	}
	
	   this.canvasContext.drawImage(this.video, this.sxOffset, this.syOffset, this.sMinSize, this.sMinSize, 0, 0, this.canvas.width,this.canvas.height);
	   if(this.audioRecorder != null){
	       this.audioRecorder.requestData();
	   }
	   
//	   this.recorder.requestData();
    }
    
    computeSampleSizes(){
	var video=this.video;
	this.sMinSize=Math.min(video.videoWidth,video.videoHeight);
	
	log("sMinSize="+this.sMinSize);
	
	/* compute source offsets */
	if(video.videoWidth > this.sMinSize){
	    this.sxOffset=(video.videoWidth-this.sMinSize)/2;
	}
    }
    setAudioState(state){
	var sourceStream = this.video.srcObject;
	if(sourceStream != null){
	    var audioTracks = sourceStream.getAudioTracks();
	    if(audioTracks.length > 0){
		audioTracks[0].enabled=state;
		log("set audio "+state);
	    }
	}
    }
}

class VideoController{
    constructor(videoCont,streamData){
	this.videoCont=videoCont;
	this.streamData=streamData;
	
	var self=this;
	this.handlers={
		"canplay":function(e){
		    self.onVideoStateChaged(e);
//		    videoCont.play();
		    self.playVideo();
		},
		"loadeddata":function(e){
		    self.onVideoStateChaged(e);
//		    videoCont.play();
		    self.playVideo();
		},
		"stalled":function(e){
		    self.onVideoStateChaged(e);
		},
		"waiting":function(e){
		    self.onVideoStateChaged(e);
		},
		"suspend":function(e){
		    self.onVideoStateChaged(e);
		},
		"ended":function(e){
		    self.onVideoStateChaged(e);
		},
		"playing":function(e){
		    self.onVideoStateChaged(e);
		}
		,
		"emptied":function(e){
		    self.onVideoStateChaged(e);
		}
		,
		"ended":function(e){
		    self.onVideoStateChaged(e);
		},
		"loadedmetadata":function(e){
		    self.onVideoStateChaged(e);
		},
		"complete":function(e){
		    self.onVideoStateChaged(e);
		}
	}
	this.videoState;
	this.mediaSource;
	this.mediaSourceBuffer;
	
	this.dataHandler=this.getDataHandler();
	this.init();
    }
    init(){
	/* register listeners */
	for(var l in this.handlers){
	    this.videoCont.addEventListener(l,this.handlers[l]);
	}
	
	/* create a media source to stream video for this session */
	this.mediaSource=new MediaSource();
	var self=this;
	this.mediaSource.addEventListener('sourceopen', function(_){
	    if(!MediaSource.isTypeSupported(CHAT.VIDEO.defaultMimeType)){
		alert(CHAT.VIDEO.defaultMimeType+" not supported");
	    }
	    
	    var sb = self.mediaSource.addSourceBuffer(CHAT.VIDEO.defaultMimeType);
	    sb.mode="sequence";
	    
	    sb.onerror=function(e){
		log("buffer error "+e);
	    }
	    sb.onabort=function(e){
		log("buffer abort "+e);
	    }
	    /* store media buffer for later use */
	    self.mediaSourceBuffer=sb;
	    
	    /* deliver start data if available */
	    if(self.streamData.startData != null){
		self.onData(self.streamData.startData);
	    }
	});
	
	/* bind this media source to the video container for the stream */
	this.videoCont.src = URL.createObjectURL(this.mediaSource);
    }
    onVideoStateChaged(e){
	log(e);
	this.videoState=e.type;
    }
    /**
     * The data as Blob
     */
    onData(data){
	if(data == null){
	    return;
	}
	log("onData media source "+this.mediaSource.readyState);
	
	var dataArray = new Uint8Array(data);
	/* write data to media buffer */
	this.mediaSourceBuffer.appendBuffer(dataArray);
	
    }
    getDataHandler(){
	var self=this;
	return (data)=>{self.onData(data)};
    }
    async playVideo(){
	var self=this;
	try{
	    await self.videoCont.play();
	    /* all good */
	}catch(e){
	    if(self.playPermissionRequired == null || !self.playPermissionRequired){
		self.playPermissionRequired=true;
	    }
	    else{
		/* don't ask permission twice */
		return;
	    }
	    log("test play permission on object "+self);
	    testAndRequestPlayPermission(function(){
		syncToBuffer(self.mediaSourceBuffer, self.videoCont,0.5);
		self.videoCont.play();
	    });
	}
    }
    
}
