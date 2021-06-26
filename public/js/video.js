
var config = {
    audio: true,
    video: false
};
var globalConfig = {
    audio: true,
    video: false
};


// global
var calling_to = "";
var is_line_busy = false;
var gpeer = null, endcall = null;  //gpeer is the global peer variable
var view_box_data = "";
var clone_gpeer = null;
var timmer;   //this is used to cut the call after 60sec if not received



const audio = new Audio(init_saved_data_audio());
audio.loop = true;
// var 
async function call(a, uid)   //this function only has uid of other person
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
    var r = await set_config();
    var streams = await video();
    var peer = new SimplePeer({ initiator: type, trickle: false, stream: streams });
    gpeer = peer;
    peer.on("connect", (data) => {
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


function video() {
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia(config)
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


// checking device has video audio inputs or not
function set_config() {
    return new Promise(resolve => {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((data) => {
                data.forEach(device => {
                    if (device.kind == 'audioinput') config.audio = { sampleSize: 8, echoCancellation: true };
                    if (device.kind == 'videoinput') config.video = true;
                });
                console.log(config);
                resolve(config);
            }).catch((err) => { console.log("try-1 :", err) });
        }
        else {
            if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
                navigator.enumerateDevices().then((data) => {
                    data.forEach(device => {
                        if (device.kind == 'audioinput') config.audio = true;
                        if (device.kind == 'videoinput') config.video = true;
                    });
                    console.log(config);
                    resolve(config);
                }).catch((err) => { console.log("try-2 :", err) });
            }
        }
    });
}


function show_error(data) {
    $(".middle").html("<center>" + data + "<center>").show(200).delay(3000).fadeOut();
}

function init_saved_data_audio() {
    if (window.localStorage) {
        if (localStorage.getItem("audioData") == null) {
            $.get("data/audio.txt", null, (res) => {
                localStorage.setItem("audioData", res);
            });
            return "ring.mp3";
        }
        else {
            return localStorage.getItem('audioData');
        }
    }
    else {
        $.get("data/audio.txt", null, (res) => { return res; });
    }
}

async function screen_share() {

    var displayMediaOptions = {
        video: {
            cursor: "always"
        },
        audio: true
    };

    var stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    gpeer.addStream(stream);
}

function getStream(type) {
    if (type == "screen") {
        getScreen().then((stream) => {
            gpeer.addStream(stream);
        })
    }
    else {
        getVideo().then((stream) => {
            gpeer.addStream(stream);
        })
    }
}


function handleButtons(type) {
    if (type == "default") {
        call_audio.className = "";
    }
    else if (type == "audio") {
        (call_audio.className == "off") ? call_audio.className = "" : call_audio.className = "off"
    }
    else if (type == "video") {
        (call_video.className == "off") ? call_video.className = "" : call_video.className = "off"
        call_screen.className = "off"
    }
    else {
        (call_screen.className == "off") ? call_screen.className = "" : call_screen.className = "off"
        call_video.className = "off"
    }
}

function setConfig(type) {
    if (type == "default") {
        globalConfig.audio = true;
    }
    else if (type == "audio") {
        globalConfig.audio = !globalConfig.audio;
    } else if (type == "video") {
        if (globalConfig.video == false || globalConfig.video == true) {
            globalConfig.video = !globalConfig.video;
        }
        else {
            globalConfig.video = true;
        }
    }
    else {
        if (globalConfig.video == false || globalConfig.video == true) {
            globalConfig.video = {
                cursor: "always"
            };
        }
        else {
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

function getScreen() {
    return new Promise(resolve => {
        navigator.mediaDevices.getDisplayMedia(globalConfig).then((stream) => {
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
