var input=null;
var img = null;
var crop;
var final_image_data = null;
function show_editor() {
    input = document.getElementById("rfile");
    img = document.getElementById("edit_it");
    if (input.files && input.files[0]) {
      has_image=true;
        var reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            img.onload = () => {
                $(".image_editor").fadeIn(400);
                edit();
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}


function edit() {
    var opts = {
        enableExif: true,
        viewport: {
            width: 170,
            height: 170,
            type: 'circle'
        }
    }
    crop = $('#edit_it').croppie(opts);
}

function cancel_image() {
    $(".image_editor").hide(400);
    $('#edit_it').croppie('destroy');
}

function save_image(type)
{
    crop.croppie('result', {type: 'base64',circle: 0,format: 'png'}).then((data)=>{
        final_image_data = data; $(".image_editor").hide(400);
        $('#edit_it').croppie('destroy');
        if (type && typeof page != 'undefined') profile.update_img();
    });
}