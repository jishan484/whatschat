var globalConfig = {
    audio:true,
    video: false
};

// global
var calling_to = "";
var is_line_busy = false;
var gpeer = null, endcall = null;  //gpeer is the global peer variable
var view_box_data = "";
var clone_gpeer = null;
var timmer;   //this is used to cut the call after 60sec if not received
var action = "default";


const audio = new Audio(init_saved_data_audio());
audio.loop = true;

async function call(a, uid , action)   //this function only has uid of other person
{
    if (is_line_busy) {
        show_error("a call is on going please end it !");
        return 0;
    }
    var status = await message.get_user_status(uid);
    if (status == 'offline') {
        show_error("user is currently offline !");
        return 0;
    }
    calling_to = uid;
    init_view_box();
    open_view_box();
    socket.emit("call_req", uid);
    is_line_busy = true;
    timmer = setTimeout(() => { finish() }, 30000);  //30 sec ring time

    if(action != null){
        action = "video";
    }
}



socket.on("call_req", (uids) => {  //this uid has two value (from_uid , to_uid)
    if (is_line_busy) {
        socket.emit("end_call_line_busy", (uids.fromuid));
        console.log("you have a missed call from :", uids.fromuid);
    }
    else {
        init_calling_box(uids.fromuid);
        is_line_busy = true;
        calling_to = uids.fromuid;
        audio.play();
    }
})

socket.on("call_end", (uids) => {  //this uids has no value 
    audio.currentTime = 0;
    audio.pause();
    hide_calling_box();
    clearTimeout(timmer);
    if (view_box_data != '') {
        complete_view_box();
        hide_view_box(false);
    }
    is_line_busy = false;
    if (endcall != null) endcall();
})

socket.on("call_accept", (data) => {  //this is bool value
    if (data) { peer(true); is_line_busy = true; clearTimeout(timmer); }
    else { endcall(); is_line_busy = false }
})

socket.on("signal", (data) => {    //data is the sdp of others
    gpeer.signal(JSON.parse(data));
})
socket.on("end_call_line_busy", (data) => {
    show_error("user is busy in another call !");
    complete_view_box();
    hide_view_box(false);
    is_line_busy = false;
})
function send_to(data) {
    if (data.type && typeof data.type != 'undefined') {
    }
    else {
        socket.emit("signal", { signal: data, touid: calling_to });
    }
}

function finish() {
    socket.emit("call_end", calling_to);
    clearTimeout(timmer);
    complete_view_box();
    hide_view_box(false);
    is_line_busy = false;
    if (endcall != null) endcall();
}
async function accept() {
    clearTimeout(timmer);
    hide_calling_box();
    init_view_box();
    open_view_box();
    audio.currentTime = 0;
    audio.pause();
    is_line_busy = true;
    await peer(false);
    socket.emit("call_accept", calling_to);
}

function cancel(uid) {
    clearTimeout(timmer);
    audio.currentTime = 0;
    audio.pause();
    socket.emit("call_end", calling_to);
    hide_calling_box();
    is_line_busy = false;
}

async function peer(type) {
    var peer = new SimplePeer({ initiator: type, trickle: false });
    gpeer = peer;
    peer.on("connect", (data) => {
        setConfig(action);
        console.log("connected")
    })
    peer.on("signal", (data) => send_to(JSON.stringify(data)));
    peer.on('stream', streams => {
        console.log("getting new streams");
        var video = document.querySelector('.remote_video');
        if ('srcObject' in video) { video.srcObject = streams }
        else { video.src = window.URL.createObjectURL(streams) }
        video.play();
        video.muted = false;
        if (video.paused) video.controls = true;
    });
    peer.on('close', () => {
        finish();
    })
    peer.on('error', err => { console.log('error', err); finish(); })
    endcall = function () {
        peer.destroy();
        streams.getTracks().forEach(device => {
            device.stop();
        });
        complete_view_box();
        hide_view_box(false);
        endcall = null;
    }
    clone_gpeer = peer;
}

function getStream(type){
    if(type == "screen"){
        getScreen().then((stream) => {
            gpeer.addStream(stream);
        })
    }
    else{
        getVideo().then((stream) => {
            gpeer.addStream(stream);
        })
    }
}


function handleButtons(type){
    if(type == "default"){
        call_audio.className = "";
    }
    else if(type == "audio"){
        (call_audio.className == "off") ? call_audio.className="" : call_audio.className="off"
    }
    else if (type == "video") {
        (call_video.className == "off") ? call_video.className = "" : call_video.className = "off"
        call_screen.className = "off"
    }
    else{
        (call_screen.className == "off") ? call_screen.className = "" : call_screen.className = "off"
        call_video.className = "off"
    }
}

function setConfig(type) {
    if (type == "default") {
        function init_calling_box(uid) {
            data = `<div class="caller_image"><img src="img/` + uid + `.png"></div>
                <div class="name">`+ uid + `</div>
                <div class="others">
                    <button onclick="accept('`+ uid + `')">accept</button>
                    <button onclick="cancel('`+ uid + `')">cancel</button>
            </div>`;
            $(".middle").html(data).show(400);
        }
        function hide_calling_box() {
            $(".middle").html("").hide(400);
        }
        function init_view_box() {
            view_box_ready = false;
            view_box_data = $(".view_box").html();
            var data =
                `<div class="video_chat" style="width:100%">
        <video autoplay="" playsinline="" class="remote_video"></video>
        <video autoplay="" playsinline="" muted="" id="video" class="local_video"></video>
    
    <div class="buttons">
      
      <button id="call_audio" onclick="setConfig('audio');">
          <img src="icon/voice.svg">
      </button>
      
      <button id="call_video" class="off" onclick="setConfig('video');">
          <img src="icon/video.svg">
      </button>
      
      <button id="call_screen" class="off" onclick="setConfig('screen');">
          <img src="icon/screenshare.svg">
      </button>
      
      <button id="call_end" onclick="finish();">
          <img src="icon/cut.svg">
      </button>
      
      
    </div>
    
    </div>`;
            $(".view_box").html(data);
            open_view_box();
        }
        function complete_view_box() {
            if (view_box_data != '')
                $(".view_box").html(view_box_data);
            view_box_data = '';
            view_box_ready = true;
        }


        globalConfig.audio = true;
    }
    else if(type == "audio"){
        globalConfig.audio = !globalConfig.audio;
    }else if(type == "video"){
        if (globalConfig.video == false || globalConfig.video == true){
            globalConfig.video = !globalConfig.video;
        }
        else{
            globalConfig.video = true;
        }
    }
    else{
        if (globalConfig.video == false || globalConfig.video == true){
            globalConfig.video = {
                cursor: "always"
            };
        }
        else{
            globalConfig.video = false;
        }
    }
    handleButtons(type);
    getStream(type);
    console.log(globalConfig);
}

function getVideo() {
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia(globalConfig)
            .then(function (stream) {
                var local_video = document.getElementsByClassName('local_video')[0];
                if ("srcObject" in local_video) local_video.srcObject = stream;
                else local_video.src = window.URL.createObjectURL(stream);
                local_video.onloadedmetadata = function (e) {
                    local_video.play();
                };
                resolve(stream);
            })
            .catch(function (err) { console.log(err.name + ": " + err.message); });
    });
}

function getScreen(){
    return new Promise(resolve => {
        navigator.mediaDevices.getDisplayMedia(globalConfig).then((stream)=>{
            var local_video = document.getElementsByClassName('local_video')[0];
            if ("srcObject" in local_video) local_video.srcObject = stream;
            else local_video.src = window.URL.createObjectURL(stream);
            local_video.onloadedmetadata = function (e) {
                local_video.play();
            };
            resolve(stream);
        })
    });
}


function init_calling_box(uid) {
    data = `<div class="caller_image"><img src="img/` + uid + `.png"></div>
                <div class="name">`+ uid + `</div>
                <div class="others">
                    <button onclick="accept('`+ uid + `')">accept</button>
                    <button onclick="cancel('`+ uid + `')">cancel</button>
            </div>`;
    $(".middle").html(data).show(400);
}
function hide_calling_box() {
    $(".middle").html("").hide(400);
}
function init_view_box() {
    view_box_ready = false;
    view_box_data = $(".view_box").html();
    var data =
        `<div class="video_chat" style="width:100%">
        <video autoplay="" playsinline="" class="remote_video"></video>
        <video autoplay="" playsinline="" muted="" id="video" class="local_video"></video>
    
    <div class="buttons">
      
      <button id="call_audio" onclick="setConfig('audio');">
          <img src="icon/voice.svg">
      </button>
      
      <button id="call_video" class="off" onclick="setConfig('video');">
          <img src="icon/video.svg">
      </button>
      
      <button id="call_screen" class="off" onclick="setConfig('screen');">
          <img src="icon/screenshare.svg">
      </button>
      
      <button id="call_end" onclick="finish();">
          <img src="icon/cut.svg">
      </button>
      
      
    </div>
    
    </div>`;
    $(".view_box").html(data);
    open_view_box();
}
function complete_view_box() {
    if (view_box_data != '')
        $(".view_box").html(view_box_data);
    view_box_data = '';
    view_box_ready = true;
}

