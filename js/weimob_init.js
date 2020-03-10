var CLIENT_ID = "73CB87739147019B0A185720E6ED1EC9"
var CLIENT_SECRET = "C25CD25C2051AF6B5F9DA36737736457"

var return_uri = window.document.location;

init_weimob = function () {
    //checkToken
    var params = mee.getCurrentUrlQueryString();
    var code = params.code;
    if(code != null && code != "") {
        var obj = "code="+code;
        sendData($weimob_addcode_url,obj,true,function (data) {
            if(data.statusCode == 0) {
                toastr.success("授权成功！");
            }else {
                toastr.error("授权失败,请重新登录");
            }
        })
    }else {
        getData($weimob_checktoken_url,true,function (data) {
            if(data.statusCode != 0) {
                window.location.href = "https://dopen.weimob.com/fuwu/b/oauth2/authorize?enter=wm&view=pc&response_type=code&scope=default&client_id=" + CLIENT_ID + "&redirect_uri=" +return_uri;
            }
        })
    }
}