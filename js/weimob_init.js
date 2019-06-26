var CLIENT_ID = "AFB8952DCB6366424D303438DEE49231"
var CLIENT_SECRET = "E19DA15BD88B2D8B93DE80617C64FAD1"

var return_uri = "http://data.middle-earth.tech/index.html#page/meimob"

init_login = function () {
    var params = mee.getCurrentUrlQueryString();
    var code = params.code;
    if(code != null) {
        mee.cookie.set("_code",code,10*60);
    }else {
        code = mee.cookie.get("_code");
        if (code == null || code == '') {
            window.location.href = "https://dopen.weimob.com/fuwu/b/oauth2/authorize?enter=wm&view=pc&response_type=code&scope=default&client_id=" + CLIENT_ID + "&redirect_uri=" +return_uri;
        }
    }

    var token = mee.cookie.get("_token");
    if(token == null || token == "") {
        var refresh_token = mee.storage.get("_refresh_token");
        if(refresh_token != null && refresh_token != "") {
            var data = {};
            data.grant_type = "refresh_token";
            data.client_id = CLIENT_ID;
            data.client_secret = CLIENT_SECRET;
            data.refresh_token = refresh_token;
            data.redirect_uri = return_uri;
            sendJsonData($weimob_token_url, JSON.stringify, true, function (data) {
                if (data == null) {
                    //

                } else {
                    var access_token = data.access_token;
                    var refresh_token = data.refresh_token;
                    var expires_in = data.expires_in;
                    mee.cookie.set("_token", access_token, expires_in);
                    mee.storage.set("_refresh_token", refresh_token);
                    token = access_token;
                }
            })
        }else {
            var data = {};
            data.code = code;
            data.grant_type = "authorization_code";
            data.client_id = CLIENT_ID;
            data.client_secret = CLIENT_SECRET;
            data.redirect_uri = return_uri;
            sendJsonData($weimob_token_url, JSON.stringify, true, function (data) {
                if (data == null) {
                    //

                } else {
                    var access_token = data.access_token;
                    var refresh_token = data.refresh_token;
                    var expires_in = data.expires_in;
                    mee.cookie.set("_token", access_token, expires_in);
                    mee.storage.set("_refresh_token", refresh_token);
                    token = access_token;
                }
            })
        }
    }

}