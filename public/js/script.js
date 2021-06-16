//global variables
var chat_list_data = [];
var unknown_list = '';
var screen_changed = false;
var page = new Page();
var chat = new Start_chat();
var profile = new Profile();
var view_box_open = false;
var view_box_ready = true;
page.getdata();
// we save image and audio to local storage so app load fast and consume less data
var img_data = "";  //this will change
init_saved_data_image();



function open_view_box() {
  view_box_open = true;
    if (check_mobile()) {
        $(".main").animate({ height: "0px" }, 400, () => {
            $(".view_box").show(400, () => {
                // $("header").hide(400);
                screen_changed = true;
            });
        });
    }
}
function hide_view_box(type) {
  view_box_ready = true;
  view_box_open = false;
    if (check_mobile()) {
        // $("header").show(400, () => {
        $(".view_box").hide(400, () => {
            $(".main").animate({ height: "90%" }, 400, () => {
                $(".main").css({ "height": "calc(100% - 67px)" });
                $(".view_box").html('<div class="view_box_bg">'+img_data+'</div>');
                screen_changed = false;
            });
        });
        // });
    }
  else
    {
      if(type || type==null || typeof type=='undefined')
          $(".view_box").html('<div class="view_box_bg">'+img_data+'</div>');
      screen_changed = false;
    }
}
function check_mobile() {
    return !$(".check").is(":visible");
}
// initialize screen if screen size and anything changes
$(window).resize(function () {
    var a = screen_changed;
    var b = !$(".view_box").is(":visible");
    var c = view_box_open;
    if ($(window).width() > 500 && (a || b)) {
        $(".main").animate({ height: "90%" }, 400, () => {
            $(".main").css({ "height": "calc(100% - 67px)" })
        });
        $("header").show(400);
        $(".view_box").show(400);
        screen_changed = false;
    }
    if(($(window).width() < 500 && !a && !b && c))
      {
        $(".main").animate({ height: "0px" }, 400);
        screen_changed = true;
      }
    if(($(window).width() < 500 && !a && b && c))
      {
        $(".main").animate({ height: "0px" }, 400);
        $(".view_box").show(400);
        screen_changed = true;
      }
});

function search() {
    var data = { search: $("#search_input").val() };
    if ($("#search_input").val() == '') $(".search_result").hide(400);
    else {
        $.post("/search", data, (response) => {
            // $("#rstatus2").html(response.data);
            $(".search_result").show(400).html(search_result(response));
        });
    }
}
function close_search() {
    $('.search_result').hide(400);
    $("#search_input").val('');
}
function search_result(datas) {
    var head = '' +
        '<div class="friends" style="background-image:none;">' +
        '<div class="top" >' +
        'Search friends' +
        '<div class="close" onclick="close_search()">' +
        '<img src="icon/close.svg">' +
        '</div>' +
        '</div >';
    var mid = '' +
        '<div class="new_request">';
    var add = '';
    var i = 0;
    if (datas.length < 1) add = '<center>no people found</center>';
    for (i = 0; i < datas.length; i++) {
        var data = datas[i];
        var uid = "'" + data.uid + "'";
        add += '' +
            '<div class="friend" style="width:90%;left:5%;">' +
            '<div class="profile"><img src="img/'+data.uid+'.png"></div>' +
            '<div class="name">' + data.name + '</div>' +
            '<div class="add" onclick="send_request(' +
            uid + ',this)"><img src="icon/add-friend.svg"></div>' +
            '</div>';
    }
    var last = '' +
        '</div>' +
        '</div>';
    return head + mid + add + last;
}
function send_request(uid, div) {
    uid = { uid: uid };
    $.post("/send_request", uid, (response) => {
        if (response.send){
            $(div).hide(400);
            socket.emit("new_request",uid);
        }
    })
}
function my_friends() {
    if (view_box_ready)
    $.post("/friends", "data", (response) => {
        open_view_box();
        $(".view_box").html(friends_result(response));
    });
}
function friends_result(datas) {
    var head = '' +
        '<div class="friends">' +
        '<div class="top" >' +
        'My circle' +
        '<div class="close" onclick="hide_view_box()">' +
        '<img src="icon/close.svg">' +
        '</div>' +
        '</div >';
    var new_request = '' +
        '<div class="new_request">';
    var old_friend = '' +
        '<div class="new_request edit">';
        var new_requests='',old_friends='';
    var num_new = 0;
    var num_old = 0;
    if (datas.length < 1) new_requests = '<center>no people found</center>';
    for (var i = 0; i < datas.length; i++) {
        var data = datas[i];
        var uid = "'" + data.uid + "'";
        if (data.status == 0) {
            num_new++;
            new_requests += '' +
                '<div class="friend">' +
                '<div class="profile"><img src="img/'+data.uid+'.png"></div>' +
                '<div class="name">' + data.name + '</div>' +
                '<div class="add" onclick="accept_request(' +
                uid + ',this)"><img src="icon/add-friend.svg"></div>' +
                '</div>';
        }
        else {
            num_old++;
            old_friends += '' +
                '<div class="friend">' +
                '<div class="profile"><img src="img/'+data.uid+'.png"></div>' +
                '<div class="name">' + data.name + '</div>' +
                '<div class="add" onclick="delete_friends('+
                uid + ',this)"><img src="icon/delete.svg"></div>' +
                '</div>';
        }
    }
    var last = '</div>';
    num_new = "New friend requests : "+num_new;
    num_old = "Friends : "+num_old;
    new_requests = new_request+num_new+new_requests;
    old_friends = old_friend+num_old+old_friends;
    return head + new_requests + last + old_friends + last + last;
}
function accept_request(uid , div)
{
    uid = { uid: uid };
    $.post("/accept_request", uid, (response) => {
        if (response.accept){
          $(div).hide(400);
          page.getdata();
          my_friends();
          var number = Number($(".f-number").html());
          $(".f-number").html(--number);
        }
        else{console.log(response)}
    })
}
function delete_friends(uid , div)
{
    uid = { uid: uid };
    $.post("/delete_friends", uid, (response) => {
        if (response.delete){
          $(div).hide(400);
          page.getdata();
          my_friends();
        }
    })
}

function Page()
{
  this.target = $(".chat");
  this.notification = $(".n-number");
  this.friend = $(".f-number")
  this.sync = function()
  {
      $.get("/friends_data","",(res)=>{
          $(".f-number").html(res.data);
      })
  }
  this.update = function(datas)
    {
        var index = chat_list_data.findIndex(function(d){
            return d.uid == datas.target;
        });
        if (index >= 0){
            chat_list_data[index].message = datas.message;
            chat_list_data[index].time = datas.time;
            $(".chat").html(this.renderhtml(this.sortdata(chat_list_data)));
        }
        else{
            if(unknown_list != datas.target){
                unknown_list = datas.target;
                this.getdata();
            }
        }
    }
  this.refresh = function()
  {
      $(".chat").html(this.renderhtml(this.sortdata(chat_list_data)));
  }

  this.getdata=function()
  {
    $.post("/getdata", "data", (response) => {
        if(response)
          {
            chat_list_data = response;
            $(".chat").html(this.renderhtml(this.sortdata(response)));
            this.sync();
          }
    });
  }
  this.sortdata = function(datas)
  {
      return (datas.sort(function (a, b) {
          return (a.time === null) - (b.time === null) || +(a.time < b.time) || -(a.time > b.time);
      }));
  }
  this.sortchat = function(datas)
  {
      return (datas.sort(function (b, a) {
          return (a.time === null) - (b.time === null) || +(a.time < b.time) || -(a.time > b.time);
      }));
  }
  this.renderhtml=function(datas)
  {
    var html = '';
    for(var i=0;i<datas.length;i++)
    {
        var data = datas[i];
        if (data.message == null) data.message = "<text style='color:green;'>Tap to start chat</text>";
        if (data.time == null) data.time = "";
        var uid = "'"+data.uid+"'";
        html += ''+
        '<div class="card">'+
            '<div class="profile">'+
                '<img src="img/'+data.uid+'.png">'+
            '</div>'+
            '<div class="right" onclick="chat.init('+uid+')">'+
                '<div class="name">'+
                    data.name+
                '</div>'+
                '<div class="last_message ">'+
                    '<div class="text">'+
                        data.message+
                    '</div>'+
                    '<div class="last_time">'+
                        this.time(data.time)+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<div class="video_call" onclick="call(true,' + uid +')">'+
                '<img src="icon/call.png">'+
            '</div>'+
        '</div>';
    }
    return html;
  }
  this.time=function(time)
  {
      if(time == "")
      return time;
      else
      {
          var now = Math.floor(new Date().getTime() / 1000);
          var seconds = now-Math.floor(Number(time) / 1000);
          seconds = Number(seconds);
          var d = Math.floor(seconds / (3600 * 24));
          var h = Math.floor(seconds % (3600 * 24) / 3600);
          var m = Math.floor(seconds % 3600 / 60);
          var s = Math.floor(seconds % 60);
          if (d > 0) return (d + (d == 1 ? " day" : " days"));
          if (h > 0) return (h + (h == 1 ? " hour" : " hours"));
          if (m > 0) return (m + (m == 1 ? " minute" : " minutes"));
          if (s > 0) return (s + (s == 1 ? " second" : " seconds"));
          else return "0 sec";
      }
  }
}

function select_image()
{
    $("#rfile").click();
}
function Profile()
{
    this.load_profile = function () {
        $('.view_box').html(`<div class="friends">
            <div class="top"> Your profile
                <div class="close" onclick="hide_view_box()">			
                    <img src="icon/close.svg">	
                </div>
            </div>
            <div class="my_profile">
                <div class="image">
                    <img class="profile_image" id="edit_profile_img" src="my_profile_img/profile.png">
                </div>
                <button class="upload_image" onclick="select_image()">
                    <img src="icon/upload_image.svg">
                    <text>upload new image</text>
                </button>
                <texts>Enter new name or new password and press update info</texts>
                <div class="edit_data">
                    <img src="icon/edit.svg">
                    <input type="text" class="edit_name" autocomplete="off" placeholder="Change name">
                </div>
                <div class="edit_data">
                    <img src="icon/edit.svg">
                    <input type="text" class="edit_password" autocomplete="off" placeholder="Change password">
                </div>
                <button class="upload_image bt1" onclick="profile.update_info()">
                    <img src="icon/edit.svg">
                    <text>Update info</text>
                </button>
                <button class="upload_image bt2" onclick="location.href='/logout'">
                    <img src="icon/logout.svg">
                    <text>Logout</text>
                </button>
                <input onchange="show_editor()" id="rfile" type="file" placeholder="profile picture" accept="image/*" hidden style="display:none;">
            </div>
        </div>`);
        open_view_box();
    }
    this.update_img = function()
    {
        if (final_image_data != null) {
            var data = { file: final_image_data, type: "img" };
            show_error("uploading image <br>please wait !");
            $.post("/edit_profile", data, (res) => {
                if (res.err) show_error(res.err);
                else {
                    $("#edit_profile_img")[0].src = "my_profile_img/profile.png?" + new Date().getTime();
                    $("#my_profile_img")[0].src = "my_profile_img/profile.png?" + new Date().getTime();
                }
            });
        }
    }
    this.update_info=function()
    {
        var name = $(".edit_name").val();
        var password = $(".edit_password").val();
        if(name=='' && password ==''){
            show_error("please provide your new data and press update !");
            return;
        }
        else{
            var data = {name:name,password:password,type:"info"};
            $.post("/edit_profile", data, (res) => {
                if (res.err) show_error(res.err);
                else {
                    show_error(res.text);
                }
            });
        }
    }
}


function Start_chat()
{
    this.init=function(uid)
    {
        set_receiver_uid(uid);
        open_view_box();
        uids = { uid: uid };
        if (view_box_ready)
        $.post("/getchat", uids, (response) => {
            if (typeof (response.length) != 'undefined')
                response = page.sortchat(response);
            $(".view_box").html(this.renderhtml(response, uid));
            $('.message').show(200).animate({
                scrollTop: $(".message")[0].scrollHeight
            }, 1000);
            message.set_user_status(".status", uid);
        });
    }
    this.renderhtml=function(datas,uid)
    {
        if(typeof (datas.length)=='undefined') var name=datas.name;
        else var name = datas[0].name;
        var coated_uid="'"+uid+"'";
        var mid='';
        var head = ''+
        '<div class="header">'+
            '<img src="img/' +uid + '.png">' +
            '<div class="data">'+
                '<div class="name">'+name+'</div>'+
                '<div class="status">offline</div>'+
            '</div>'+
            '<div class="audio_call" onclick="share_screen(true,'+coated_uid+')">'+
            '<img src="icon/call.png">'+
            '</div> '+
            '<div class="call" onclick="call(true,'+coated_uid+')">'+
                '<img src="icon/video.svg">'+
            '</div>' +
            // '<div class="audio_call" onclick="share_screen(true,'+coated_uid+')">'+
            // '<img class="f-image" src="icon/call.png">'+
            // '</div> '+
            '<div class="close" onclick="hide_view_box()">' +
                '<img src="icon/close.svg">' +
            '</div>' +
        '</div>'+
        '<div class="message">';
        var end=''+
        '</div>'+
        '<div class="send_message">'+
            '<center>'+
            '<input type="text" id="message" placeholder="Type a message" onkeyup="send(event)">'+
                '<button onclick="sendb()"><img src="icon/send.svg"></button>'+
            '</center>'+
        '</div>';
        if(typeof (datas.length)!='undefined')
        {
            for(var i=0;i<datas.length;i++)
            {
                var type = 'send';
                mid+='<div class="separate">';
                if(datas[i].sid == uid){type='receive';}
                mid+='<div class="'+type+'"><span></span>'+
                    datas[i].message+'<text>'+time(datas[i].time)+'</text></div>';
                mid+='</div>';
            }
        }
        return head+mid+end;
    }
}
function time(time)
{
    time = Number(time);
    var d = new Date(time);
    return d.getHours()+":"+(d.getMinutes() < 10 ? "0"+d.getMinutes():d.getMinutes());
}
function send(e)
{
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 13) { //Enter keycode
        var data = $("#message").val().replace(/[>,/,',<]/ig, "");
        $("#message").val('');
        $('.message').animate({
            scrollTop: $(".message")[0].scrollHeight
        }, 1000);
        if(data != '')send_message(data);
    }
}
function sendb()
{
    var data = $("#message").val().replace(/[>,/,',<]/ig, "");
    $("#message").val('');
    if(data != '')send_message(data);
    $('.message').animate({
        scrollTop: $(".message")[0].scrollHeight
    }, 1000);
}



// get saved data from LS
function init_saved_data_image()
{
    if (window.localStorage) {
        if (localStorage.getItem("imgData") == null)
        {
            $.get("data/bg2.txt", null, (res) => {
                localStorage.setItem("imgData",res);
                $(".view_box_bg").html("<img id='ls-image' src='"+res+"'>");
                img_data = "<img id='ls-image' src='" + res + "'>";
            })
        }
        else
        {
            var data = localStorage.getItem('imgData');
            $(".view_box_bg").html("<img id='ls-image' src='"+data+"'>");
            img_data = "<img id='ls-image' src='" + data + "'>";
        }
    }
    else
    {
        $(".view_box_bg").html("<img id='ls-image' src='bg2.png'>");
        img_data = "<img id='ls-image' src='bg2.png'>";
    }
}


// set focus chat input if it is visible and any key is pressed
$(document).keypress(function (evt) {
    if (!$('#search_input').is(":focus") && $('#message').is(":visible") && !$('#message').is(":focus") && /^[a-zA-Z0-9]$/i.test(event.key))
    {
        $('#message').focus();  // &#128512;
    }
});

setTimeout(()=>{
$.ajaxSetup({
    error: function (err, exception) {
        var msg = '';
        if (err.status === 0) {
            msg = 'Not connect.<br> Verify Network.';
        } else if (err.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (err.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error. <br>maybe internet speed slow !';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + err.responseText;
        }
        hide_view_box();
        show_error("request failed !\n"+msg);
    },
    timeout: 12000
});
}, 20000)

// async function share_screen(){
//   let captureStream = null;
//   var displayMediaOptions = {
//   video: {
//     cursor: "always"
//   },
//     audio: false
//   };
//   try {
//     captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
//   } catch(err) {
//     console.error("Error: " + err);
//   }
  
// }