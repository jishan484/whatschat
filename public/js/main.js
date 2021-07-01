var current_class = 0;
var has_image = false;

function show_singin()
{
    $(".welcome").hide(400,()=>{
        $(".signin_form").show(400);
    })
}
function hide_signin()
{
    $(".signin_form").hide(400, () => {
        $(".welcome").show(400);
    })
}
function show_singup() {
    $(".welcome").hide(400, () => {
        show_signup_fields(0);
        $(".signup_form").show(400);
        $("#remail").focus();
    })
}
function hide_signup() {
    var tag = document.getElementsByClassName("tag");
    $(tag[current_class]).hide(400);
    current_class = 0;
    $(".signup_form").hide(400, () => {
        $(".signup_button").val("next");
        $(".previous").hide("fast");
        $(".welcome").show(400);
    })
}

function show_signup_fields(value)
{
    var tag = document.getElementsByClassName("tag");
    if(value==0 && current_class==0)
    {
        $(tag[current_class]).css("display", "block");
        make_deactive();
        $("#remail").focus();
    }
    if (value == 1 && current_class >= 0) {
        $(tag[current_class]).hide(400, () => {
            $(tag[++current_class]).show(400);
            if(current_class == 1){
                make_active(current_class);
                $(".previous").show(400);
                $("#rname").focus();
            }
            if (current_class == 2)
                $(".signup_button").val("Sign up");
        });
    }
    if (value == -1 && current_class > 0) {
        $(tag[current_class]).hide(400,()=>
        {
            $(tag[--current_class]).show(400);
            if (current_class == 0)
            {
                make_deactive();
                $(".previous").hide(400);
            }
            if(current_class <= 1)
                $(".signup_button").val("Next");
        });
    } 
}

function validateform()
{
    var tag = document.getElementsByClassName("tag")[current_class];
    var elem = tag.getElementsByTagName("input");
    if (typeof elem[0].checkValidity == "function") {
        for(var i=0;i<elem.length;i++)
        {
            if (elem[i].validity.valid === false) return false;
        }
    }
    return true;
}

function make_active(current_class)
{
    var tag = document.getElementsByClassName("tag")[current_class];
    var elem = tag.getElementsByTagName("input");
    for (var i = 0; i < elem.length; i++) {
        $(elem[i]).attr("disabled", false);
    }
}
function make_deactive()
{
    var tag = document.getElementsByClassName("tag")[1];
    var elem = tag.getElementsByTagName("input");
    for (var i = 0; i < elem.length; i++) {
        $(elem[i]).attr("disabled", true);
    }
}

function signup_previous()
{
    if(current_class > 0)
        show_signup_fields(-1);
}
function signup()
{
    if (validateform() && current_class == 0)
    show_signup_fields(1);
    if (validateform() && current_class == 1)
      {
        var uname = $('#ruser').val().trim().replace(/[&\/\\#,! @#$^+()$~%;|'":*?<>{}]/ig, "");
        var data = {"username" : uname};
        $.post("/username", data, (response) => {
          $("#rstatus1").html(response.data);
          if(response.username){ show_signup_fields(1); }
          });
      }
    if(validateform() && current_class == 2)
      {
        var uname = $('#ruser').val().trim().replace(/[&\/\\#,! @#$^+()$~%;|'":*?<>{}]/ig, "");
        var data = {"username" : uname ,
                    "email" : $("#remail").val() ,
                    "password" : $("#rpass").val() ,
                    "name" : $("#rname").val() ,
                    "file" : final_image_data,
                    "img" : has_image
                   };
        $.post("/register", data, (response) => {
          $("#rstatus2").html(response.data);
          if(response.register){ document.location.href="/home"; }
          });
      }
    return false;
}
function login()
{
    var uname = $('#luser').val().trim().replace(/[&\/\\#,! @#$^+()$~%;|'":*?<>{}]/ig, "");
  var data = { "username": uname, "password": $("#lpass").val()};
  $.post("/login", data, (response) => {
        $("#lstatus").html(response.data);
        if(response.login)
        {
            setTimeout(() => { window.location.href = "/home";}, 1000);
        }
    });
}

function trim_it(div)
{
    var value = $(div).val().trim().replace(/[&\/\\#,! @#$^+()$~%;|'":*?<>{}]/ig, "");
    $(div).val(value);
}
// reset status div every time
$(document).click(()=>{
  $("#lstatus").html("");
  $("#rstatus1").html("");
  $("#rstatus2").html("");
});









if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}