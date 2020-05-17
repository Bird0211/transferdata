var CLIENT_ID = "73CB87739147019B0A185720E6ED1EC9"
var CLIENT_SECRET = "C25CD25C2051AF6B5F9DA36737736457"


init_weimob = function () {
    //checkToken
    var params = mee.getCurrentUrlQueryString();
    console.log(params);
    var bizId = mee.getBizId();
    console.log('bizId=',bizId);
    var userId = mee.getUserId();
    console.log('userId=',userId);

    var code = params.code;
    if(code != null && code != "") {
        var state = params.state;

        if(state && state != null && state != "") {
            bizId = state.split('/')[0];
            mee.storage.set('bid',bizId);
            const userId = state.split('/')[1];
            mee.storage.set('uid',userId);
        }

        var obj = "code="+code;
        sendData($weimob_addcode_url+'/'+bizId,obj,true,function (data) {
            if(data.statusCode == 0) {
                toastr.success("授权成功！");
            }else {
                toastr.error("授权失败,请重新登录");
            }
        })
    }else {
        var return_uri = 'https://external.yiyun.co.nz/data/index.html?page=weimob';
        
        var state = bizId+'/'+userId;
        console.log(state);
        getData($weimob_checktoken_url+'/'+bizId,true,function (data) {
            if(data.statusCode != 0) {
                window.location.href = "https://dopen.weimob.com/fuwu/b/oauth2/authorize?enter=wm&view=pc&response_type=code&scope=default&client_id=" + CLIENT_ID + "&redirect_uri=" +return_uri+ "&state="+state;
            }
        })
    }
}

getParentUrl = function() {
    var url = null;
    if(parent !== window) {
        try {
            url = parent.location.href;
        } catch {
            url = document.referrer;
        }
    }
    return url;
}