var message = new Message();
var socket = io();
var secret = "";   //this is a token for socket connection
var receiver_uid = ''; //this is uid for target client

socket.on("gettoken", (data) => {
    console.log("my token : " + data.secret);
    secret = data.secret;
});
socket.on("new_request", (data) => {
    var number = Number($(".f-number").html());
    $(".f-number").html(++number);
});

socket.on("receive", (data) => {
    page.update({ message: data.message, target: data.sender, time: data.time });
    $(".message").html($(".message").html() + '<div class="separate">' +
        '<div class="receive"><span></span>' + data.message +
        '<text>' + time(data.time) + '</text></div></div>');
    if ($('.message').is(":visible"))
        $('.message').animate({
            scrollTop: $(".message")[0].scrollHeight
        }, 1000);
})


function send_message(data) {
    var now = new Date().getTime();
    page.update({ message: data, target: receiver_uid, time: now });
    socket.emit("send", { uid: receiver_uid, token: secret, message: data });
    $(".message").html($(".message").html() + '<div class="separate">' +
        '<div class="send"><span></span>' + data +
        '<text>' + time(new Date()) + '</text></div></div>');
}

function set_receiver_uid(uid) { receiver_uid = uid; }

// message constractor for using in other scripts
function Message()
{
    this.check_user_status = function(uid)
    {
        return new Promise(resolve => {
            socket.emit("status", (uid));
            socket.on("status", (data) => {
                resolve(data);
            })
        });
    }
    this.uid = receiver_uid;
    this.get_user_status = function(uid)
    {
        return new Promise(resolve => {
            socket.emit("status", (uid));
            socket.on("status", (data) => {
                if(data) data="online";
                else data="offline";
                resolve(data);
            })
        });
    }
    // this will set status data to a html div
    this.set_user_status = function (to,uid) {
        socket.emit("status", (uid));
        socket.on("status", (data) => {
            if (data) data = "online";
            else data = "offline";
            $(to).html(data);
        })
    }
}