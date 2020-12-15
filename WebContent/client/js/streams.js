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
	
	this.audioRecorder;
	
	this.compositeStream=new MediaStream();
	this.recorder=new MediaRecorder(this.compositeStream);
	
	if(this.config.outputPeriod==null){
	    this.config.outputPeriod=1000;
	}
	
	this.recorder.ondataavailable = this.onDataAvailable.bind(this);
	
	this.mediaSource=new MediaSource();
	
	this.outputBuffer;
	var self=this;
	this.mediaSource.addEventListener('sourceopen', function(_){
	    
	    self.outputBuffer = self.mediaSource.addSourceBuffer("video/webm;codecs=vp9,opus");
	    self.outputBuffer.mode="sequence";
	    log("source open -> "+self.outputBuffer);
//	    self.outputBuffer.addEventListener('updateend', function (_) {
//		      self.mediaSource.endOfStream();
//		     
//		    });
	});
	
	
	
	
    }
    start(){
	super.start();
	this.initVideoSampler();
	this.initAudioSampler();
	
	this.recorder.start(this.config.outputPeriod);
    }
    
    stop(){
	super.stop();
	this.recorder.stop();
	this.mediaSource.endOfStream();
	log("stopped");
    }
    initVideoSampler(){
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
	event.data.arrayBuffer().then(buffer =>{
	    if(self.outputBuffer != null){
		self.outputBuffer.appendBuffer(buffer);
	    }
	});
	
	if(this.config.onDataAvailable){
	    this.config.onDataAvailable(event.data);
	}
    }
    requestData(){
	this.recorder.requestData();
    }
    
    sample(){
	   this.canvasContext.drawImage(this.video, 0, 0, this.canvas.width,this.canvas.height);
	   if(this.audioRecorder != null){
	       this.audioRecorder.requestData();
	   }
    }
}