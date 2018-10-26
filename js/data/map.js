var map_data = {};
var products = null;
var area_brand = {};
var area_product = {};
map_data.init  = function () {
    init_event();
    init_brand();
    init_product();
    init_area_brand();
}

init_event = function () {
    $('#brand').bind("change",function () {
        var brand = $('#brand').val();
        $('#product').empty();
        $('#product').append("<option value='all'>all</option>");
        show_brand_info(brand);

        if(brand == 'all') {
            return;
        }

        var p_datas = products[brand];
        jQuery(p_datas).each(function () {
            $('#product').append("<option value='"+this.code+"'>"+this.name+"</option>");
        })
    });

    $('#product').bind("change",function () {
        show_product_info();

    })
}

init_brand = function() {
    var url = "file/brand.json";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;
    var brands = JSON.parse(dataString);
    jQuery(brands).each(function () {
        $('#brand').append("<option value='"+this+"'>"+this+"</option>");
    })
};

init_product = function () {
    var url = "file/products.json";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;
    products = JSON.parse(dataString);
}

init_area_brand = function () {
    var url = "file/area_brand.json";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;

    var data_brands = JSON.parse(dataString);
    for(var item in data_brands) {
        var datas = data_brands[item];
        area_brand[item] = [];
        for(let key in datas){
            var city = key;
            var value = datas[key];

            var data = {};
            data.name = city;
            data.value = value;

            area_brand[item].push(data);
        }
    }
    show_brand_info();
}

init_area_prodcut = function (callback) {
    var url = "file/area_product.json";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;

    var data_products = JSON.parse(dataString);
    for(var item in data_products) {
        var datas = data_products[item];
        area_product[item] = [];
        for(let key in datas){
            var city = key;
            var value = datas[key];

            var data = {};
            data.name = city;
            data.value = value;

            area_product[item].push(data);
        }
    }

    callback();
}

show_brand_info = function (brand) {
    if(!brand)
        brand = $('#brand').val();

    var data = area_brand[brand];
    if(data) {
        set_option(data);

    }else
        toastr.error("该商品没有订单,请选择其他商品");
}

show_product_info = function() {
    var product = $('#product').val();
    if(product == "all")
        show_brand_info();
    else {
        var data = area_product[product];
        if(!data){
            init_area_prodcut(show_product);
        }else {
            show_product();
        }
    }
}

show_product = function () {
    var product = $('#product').val();
    var data = area_product[product];
    if(data) {
       set_option(data);

    }else {
        toastr.error("该商品没有订单,请选择其他商品");
    }
}

set_option = function (data) {
    var convert_data = convertData(data);
    var top5_data = convertData(data.sort(function (a, b) {
        return b.value - a.value;
    }).slice(0, 6));
    map_option.series[0].data = convert_data;
    map_option.series[1].data = top5_data;
    map_option.series[0].symbolSize = setNomalSize;
    map_option.series[1].symbolSize = setTopSize;


    map_option.geo.center = [top5_data[0].value[0],top5_data[0].value[1]];
    myChart.setOption(map_option, true);
    renderBrushed();
}

getDataItem = function (rawIndex) {
    var convert_data = getConvertData();
    return convert_data[rawIndex];
}

getConvertData = function () {
    var brand = $('#brand').val();
    var product = $('#product').val();
    var data = null;
    if(product == 'all')
        data = area_brand[brand];
    else
        data = area_product[product];

    var convert_data = convertData(data);
    return convert_data;
}

setNomalSize = function (val) {
    return Math.max(Math.log(val[2])*2, 8);

}

setTopSize = function (val) {
    return Math.max(Math.log(val[2])*4, 10);

}

