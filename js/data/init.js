var init = {};
init.brand = null;
init.product = null

init.get_brands = function (callback) {
    var brandString = sessionStorage.getItem("_brands");
    if(brandString == null){
        var url = "file/brand.json";
        var htmlobj= $.ajax({url:url,async:false});
        brandString = htmlobj.responseText;
        sessionStorage.setItem("_brands",brandString);
    }
    init.brand = JSON.parse(brandString);
    console.info(init.brand);
    if(callback)
        callback(init.brand);
}

init.get_products = function () {
    var products = sessionStorage.getItem("_products");
    if(products == null) {
        var url = "file/products.json";
        var htmlobj= $.ajax({url:url,async:false});
        products = htmlobj.responseText;
        sessionStorage.setItem("_products",products);
    }
    init.product = JSON.parse(products);
}


init.show_brand = function(brands) {
    console.info(brands);
    jQuery(brands).each(function () {
        $('#brand').append("<option value='"+this+"'>"+this+"</option>");
    })
}


Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}


jQuery(function($) {
    init.get_brands(init.show_brand);
    init.get_products();
})

/*

init.show_product = function () {
    var products = init.get_products();
    jQuery(products).each(function () {
        $('#product').append("<option value='"+this.code+"'>"+this.name+"</option>");
    })
}*/
