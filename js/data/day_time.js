var real_data = {};
var day_brand = {};
var day_product = {};

real_data.init  = function () {
    init_event();
    // init.get_brands(init.show_brand);
    init.get_products();
    // init_product();
    init_day_brand();
    inti_day_products();
}

init_event = function () {
    console.info("init_event");
    $('#brand').bind("change",function () {
        console.info("brand change");
        var brand = $('#brand').val();
        $('#product').empty();
        $('#product').append("<option value='all'>all</option>");
        show_brand_info(brand);

        if(brand == 'all') {
            return;
        }

        var p_datas = init.product[brand];
        console.info(p_datas);
        jQuery(p_datas).each(function () {
            $('#product').append("<option value='"+this.code+"'>"+this.name+"</option>");
        });
    });

    $('#product').bind("change",function () {
        show_product_info();
    });
}

init_product = function () {
    option.series = [];
    var serve = {};
    serve.name = '销售数据';
    serve.type = 'bar';
    serve.showSymbol = false;
    serve.hoverAnimation = false;
    serve.data = getProductData();
    option.series.push(serve);
    show_img(getProductData());
    // myChart.setOption(option, true);
}

init_day_brand = function () {
    var url = "file/day_brand.json";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;

    var data_brands = JSON.parse(dataString);
    for(var item in data_brands) {
        var datas = data_brands[item];  //item is brand name
        day_brand[item] = [];
        for(let key in datas){
            var time = key;
            var value = datas[key];

            var data = {};
            data.name = time;
            data.value = value;

            day_brand[item].push(data);
        }
    }

    console.info(day_brand);
    show_brand_info();
}

inti_day_products = function (callback) {
    var url = "file/day_product.json";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;

    var data_brands = JSON.parse(dataString);
    for(var item in data_brands) {
        var datas = data_brands[item];  //item is brand name
        day_product[item] = [];
        for(let key in datas){
            var time = key;
            var value = datas[key];

            var data = {};
            data.name = time;
            data.value = value;

            day_product[item].push(data);
        }
    }
    if(callback)
        callback();
}

show_brand_info = function () {
    var brand = $('#brand').val();
    var data = day_brand[brand];

    show_img(data);
}

var inter = null;
show_img = function (data) {
    if(data) {
        // myChart.setOption(option,true);
        if(inter || inter!= null)
            clearInterval(inter);


        data = data.sort(function (a, b) {
            return new Date(a.name) - new Date(b.name);
        });

        var days = get_day(data);

        var show_data = [];
        for(let i = 0; i < data.length && i < 100; i++){
            show_data.push(format_data(data[i]));
        }

        option.series[0].data = show_data;
        option.xAxis.data = days;
        myChart.setOption(option,true);

        if(show_data.length >= 100) {
            var n = 100;
            inter = setInterval(function () {
                if(n >= data.length){
                    clearInterval(inter);
                    console.info("clearInterval");
                }else {
                    for(let i = 0; i < 5 && n < data.length; i++){
                        show_data.shift();
                        show_data.push(format_data(data[n]));
                        n++;
                    }
                    // console.info(show_data);
                    option.series[0].data = show_data;
                    myChart.setOption(option);
                }
            }, 1000);
        }


    }else
        toastr.error("该商品没有订单,请选择其他商品");
}
Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

format_data = function (data) {
    var now = new Date(data.name).format("yyyy-MM-dd");
    var value = data.value;
    return {
        name: now.toString(),
        value: [
            now,
            Math.round(value)
        ]
    }
}

getProductData = function () {
    var product = $('#product').val();
    var data = null;
    if(product == 'all'){
        var brand = $('#brand').val();
        data = day_brand[brand];
    }else {
        data = day_product[product];
    }
    return data;
}

show_product_info = function() {
    var product = $('#product').val();
    if(product == "all")
        show_brand_info();
    else {
        var data = day_product[product];
        show_img(data);
    }
}

get_day = function (data) {
    var days = [];
    for (let i = 0; i < data.length; i++) {
        days.push(data.name);
    }
}