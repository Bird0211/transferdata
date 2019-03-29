
var $mongoDB_path = "http://47.74.253.166:5000";

var $manage_user_url = "http://47.74.253.166:8801/api/getuser";
//var $manage_user_url = "http://localhost:8801/api/getuser";
//var $manage_fee_url = "http://47.74.253.166:8801/api/settle";
var $manage_fee_url = "http://localhost:8801/api/settle";

var $manage_addproducts_url = "http://47.74.253.166:8801/api/addBathProduct";

function sendJsonData(url, data,async ,callBack) {
    jQuery.ajax({
        type: "post",
        async: async,
        dataType: "json",
        url: url,
        timeout: 25000,
        // contentType: "application/json; charset=utf-8",
        // crossDomain: true,
        // contentType: "application/json",
        // contentType: "charset=utf-8",
        // headers: {'Content-Type': 'application/json; charset=utf-8'},
        cache: false,
        data: data,
        beforeSend: function (request) {
            // $("body").Loading();
            // request.setRequestHeader("Access-Control-Allow-Origin", "*");
        },
        success: function (data) {
            // $("body").Loading("hide")
            if(callBack)
                return callBack(data);
        },
        error: function (e) {
            // $("body").Loading("hide");
            //console.log(e);
        }
    });
}

function sendJData(url, data,async ,callBack) {
    jQuery.ajax({
        type: "post",
        async: async,
        dataType: "json",
        url: url,
        timeout: 25000,
        contentType: "application/json; charset=utf-8",
        // crossDomain: true,
        // contentType: "application/json",
        // contentType: "charset=utf-8",
        // headers: {'Content-Type': 'application/json; charset=utf-8'},
        cache: false,
        data: data,
        beforeSend: function (request) {
            // $("body").Loading();
            // request.setRequestHeader("Access-Control-Allow-Origin", "*");
        },
        success: function (data) {
            // $("body").Loading("hide")
            if(callBack)
                return callBack(data);
        },
        error: function (e) {
            // $("body").Loading("hide");
            //console.log(e);
        }
    });
}


function getData(url,callBack) {
    jQuery.ajax({
        type: "get",
        async: true,
        dataType: "json",
        url: url,
        contentType: "application/json; charset=utf-8",
        timeout: 25000,
        // contentType: "application/json",
        // headers: {'Content-Type': 'application/json'},
        cache: false,
        // data: data,
        beforeSend: function (request) {
            // $("body").Loading();
            // request.setRequestHeader("EncryptType", "NONE");
        },
        success: function (data) {
            // $("body").Loading("hide");
            return callBack(data);
        },
        error: function (e) {
            // $("body").Loading("hide");
            //console.log(e);
        }
    });
}

function sendData(url, data,async ,callBack) {
    jQuery.ajax({
        type: "post",
        async: async,
        dataType: "json",
        url: url,
        timeout: 25000,
        contentType:"application/x-www-form-urlencoded; charset=utf-8",
        cache: false,
        data: data,
        beforeSend: function (request) {
            // $("body").Loading();
        },
        success: function (result) {
            if(callBack)
                return callBack(result);
        },
        error: function (e) {
            // $("body").Loading("hide");
            //console.log(e);
        }
    });
}

// 转为unicode 编码
function encodeUnicode(str) {

    return str.replace(/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])/g,function(newStr){
        return "\\u" + newStr.charCodeAt(0).toString(16);
    });
}


