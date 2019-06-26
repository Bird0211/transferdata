
var $mongoDB_path = "http://47.74.253.166:5000";
var $manage_user_url = "http://47.74.253.166:8801/api/getuser";
// var $manage_user_url = "http://localhost:8801/api/getuser";

var $manage_fee_url = "http://47.74.253.166:8801/api/settle";
// var $manage_fee_url = "http://localhost:8801/api/settle";

var $manage_addproducts_url = "http://47.74.253.166:8801/api/addBathProduct";
// var $manage_addproducts_url = "http://localhost:8801/api/addBathProduct";


var $ocr_url = "http://47.74.253.166:8801/api/imageRecognition";
// var $ocr_url = "http://localhost:8801/api/imageRecognition";

//var $text_ocr_url = "http://47.74.253.166:8801/api/textocr";
var $text_ocr_url = "http://localhost:8801/api/textocr";

var $weimob_token_url = "https://dopen.weimob.com/fuwu/b/oauth2/token";

//cookie storage
if (!('mee' in window)) {
    window['mee'] = {}
}

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


function sendFile(url,data,async,callBack){
    jQuery.ajax({
        type: "post",
        async: async,
        dataType: "json",
        url: url,
        timeout: 25000,
        contentType: "multipart/form-data",
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

mee.cookie = {
    /**
     * 获取cookie指定name值
     */
    get: function (name) {
        var cookie = document.cookie,
            e, p = name + "=",
            b;
        if (!cookie)
            return;
        b = cookie.indexOf("; " + p);
        if (b == -1) {
            b = cookie.indexOf(p);
            if (b != 0)
                return null;
        } else {
            b += 2;
        }
        e = cookie.indexOf(";", b);
        if (e == -1)
            e = cookie.length;
        return decodeURIComponent(cookie.substring(b + p.length, e));
    },
    /**
     * 设置cookie
     *
     *  expires参数可以是js Data()对象或过期的秒数     *
     */
    set: function (name, value, expires, path, domain, secure) {
        var d = new Date();
        if (typeof(expires) == 'object' && expires.toUTCString) {
            expires = expires.toUTCString();
        } else if (parseInt(expires, 10)) {
            d.setTime(d.getTime() + (parseInt(expires, 10) * 1000));
            expires = d.toUTCString();
        } else {
            expires = '';
        }
        document.cookie = name + "=" + encodeURIComponent(value) +
            ((expires) ? "; expires=" + expires : "") +
            ((path) ? "; path=" + path : ";path=/") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
    },
    /**
     * 删除cookie
     */
    remove: function (name, path) {
        this.set(name, '', -1000, path);
    }
};

mee.storage = {
    get: function(key) {
        return window['sessionStorage'].getItem(key);
    },
    set: function(key, value) {
        //Safari 无痕浏览 禁止使用本地缓存
        try{
            window['sessionStorage'].setItem(key , value);
        }
        catch(e) {
            if(app.config.lang==='zh'){
                $.dialog.tips('您的手机浏览器不支持本地数据存储。一些功能将不能使用！',10)
            }
            else{
                $.dialog.tips('Your web browser does not support storing settings locally. Some settings may not save or some features may not work properly for you.',10)
            }

        }
    },
    remove: function(key) {
        window['sessionStorage'].removeItem(key);
    }
};

/**
 *获取当前url参数
 * 返回key value字典
 */
mee.getCurrentUrlQueryString = function () {
    var pattern = /(\w+)=([^&]*)/g;
    var parames = {};
    window.location.search.replace(pattern, function (a, b, c) {
        parames[b] = decodeURIComponent(c);
    });
    return parames;
};
