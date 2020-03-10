import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,0,getInfo);
}

getInfo = function (ori_Data) {
    var datas = ori_Data[0].data;
    var data = datas[0].data;

    // getBrandInfo(data);

    // init_area_data(data);

    // init_area_prodcuts(data);

    // init_sale_data(data);

    // init_user_data(data);

    import_products(data);
}

getBrandInfo = function (datas) {
    var reg = new RegExp('"',"g");
    var brands = [];
    var brand_product = {};

    jQuery(datas).each(function () {
        var brand = this.brand.replace(reg,"").replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLocaleUpperCase();
        if(brand == '开发测试产品' || brand == '包材及工时费' || brand == 'MEE')
            return;

        var code = this.code;
        var name = this.name_1;
        let p = {};
        p.code = code;
        p.name = name;

        var p_datas = brand_product[brand];
        if(p_datas) {
            let flag = false;
            for(var key in p_datas){
                var item = p_datas[key];
              if(item.code == code){
                  flag = true;
                  break;
              }
            }
            if(flag)
                return;

        }else {
            p_datas = [];
        }

        p_datas.push(p);
        brand_product[brand] = p_datas;
    });

    for(var item in brand_product){
        brands.push(item);
    }

    console.info(JSON.stringify(brand_product));

    console.info(JSON.stringify(brands));

}

var geoCoordMap = {
    "海门":[121.15,31.89],
    "鄂尔多斯":[109.781327,39.608266],
    "招远":[120.38,37.35],
    "舟山":[122.207216,29.985295],
    "齐齐哈尔":[123.97,47.33],
    "盐城":[120.13,33.38],
    "赤峰":[118.87,42.28],
    "青岛":[120.33,36.07],
    "乳山":[121.52,36.89],
    "金昌":[102.188043,38.520089],
    "泉州":[118.58,24.93],
    "莱西":[120.53,36.86],
    "日照":[119.46,35.42],
    "胶南":[119.97,35.88],
    "南通":[121.05,32.08],
    "拉萨":[91.11,29.97],
    "云浮":[112.02,22.93],
    "梅州":[116.1,24.55],
    "文登":[122.05,37.2],
    "上海":[121.48,31.22],
    "攀枝花":[101.718637,26.582347],
    "威海":[122.1,37.5],
    "承德":[117.93,40.97],
    "厦门":[118.1,24.46],
    "汕尾":[115.375279,22.786211],
    "潮州":[116.63,23.68],
    "丹东":[124.37,40.13],
    "太仓":[121.1,31.45],
    "曲靖":[103.79,25.51],
    "烟台":[121.39,37.52],
    "福州":[119.3,26.08],
    "瓦房店":[121.979603,39.627114],
    "即墨":[120.45,36.38],
    "抚顺":[123.97,41.97],
    "玉溪":[102.52,24.35],
    "张家口":[114.87,40.82],
    "阳泉":[113.57,37.85],
    "莱州":[119.942327,37.177017],
    "湖州":[120.1,30.86],
    "汕头":[116.69,23.39],
    "昆山":[120.95,31.39],
    "宁波":[121.56,29.86],
    "湛江":[110.359377,21.270708],
    "揭阳":[116.35,23.55],
    "荣成":[122.41,37.16],
    "连云港":[119.16,34.59],
    "葫芦岛":[120.836932,40.711052],
    "常熟":[120.74,31.64],
    "东莞":[113.75,23.04],
    "河源":[114.68,23.73],
    "淮安":[119.15,33.5],
    "泰州":[119.9,32.49],
    "南宁":[108.33,22.84],
    "营口":[122.18,40.65],
    "惠州":[114.4,23.09],
    "江阴":[120.26,31.91],
    "蓬莱":[120.75,37.8],
    "韶关":[113.62,24.84],
    "嘉峪关":[98.289152,39.77313],
    "广州":[113.23,23.16],
    "延安":[109.47,36.6],
    "太原":[112.53,37.87],
    "清远":[113.01,23.7],
    "中山":[113.38,22.52],
    "昆明":[102.73,25.04],
    "寿光":[118.73,36.86],
    "盘锦":[122.070714,41.119997],
    "长治":[113.08,36.18],
    "深圳":[114.07,22.62],
    "珠海":[113.52,22.3],
    "宿迁":[118.3,33.96],
    "咸阳":[108.72,34.36],
    "铜川":[109.11,35.09],
    "平度":[119.97,36.77],
    "佛山":[113.11,23.05],
    "海口":[110.35,20.02],
    "江门":[113.06,22.61],
    "章丘":[117.53,36.72],
    "肇庆":[112.44,23.05],
    "大连":[121.62,38.92],
    "临汾":[111.5,36.08],
    "吴江":[120.63,31.16],
    "石嘴山":[106.39,39.04],
    "沈阳":[123.38,41.8],
    "苏州":[120.62,31.32],
    "茂名":[110.88,21.68],
    "嘉兴":[120.76,30.77],
    "长春":[125.35,43.88],
    "胶州":[120.03336,36.264622],
    "银川":[106.27,38.47],
    "张家港":[120.555821,31.875428],
    "三门峡":[111.19,34.76],
    "锦州":[121.15,41.13],
    "南昌":[115.89,28.68],
    "柳州":[109.4,24.33],
    "三亚":[109.511909,18.252847],
    "自贡":[104.778442,29.33903],
    "吉林":[126.57,43.87],
    "阳江":[111.95,21.85],
    "泸州":[105.39,28.91],
    "西宁":[101.74,36.56],
    "宜宾":[104.56,29.77],
    "呼和浩特":[111.65,40.82],
    "成都":[104.06,30.67],
    "大同":[113.3,40.12],
    "镇江":[119.44,32.2],
    "桂林":[110.28,25.29],
    "张家界":[110.479191,29.117096],
    "宜兴":[119.82,31.36],
    "北海":[109.12,21.49],
    "西安":[108.95,34.27],
    "金坛":[119.56,31.74],
    "东营":[118.49,37.46],
    "牡丹江":[129.58,44.6],
    "遵义":[106.9,27.7],
    "绍兴":[120.58,30.01],
    "扬州":[119.42,32.39],
    "常州":[119.95,31.79],
    "潍坊":[119.1,36.62],
    "重庆":[106.54,29.59],
    "台州":[121.420757,28.656386],
    "南京":[118.78,32.04],
    "滨州":[118.03,37.36],
    "贵阳":[106.71,26.57],
    "无锡":[120.29,31.59],
    "本溪":[123.73,41.3],
    "克拉玛依":[84.77,45.59],
    "渭南":[109.5,34.52],
    "马鞍山":[118.48,31.56],
    "宝鸡":[107.15,34.38],
    "焦作":[113.21,35.24],
    "句容":[119.16,31.95],
    "北京":[116.46,39.92],
    "徐州":[117.2,34.26],
    "衡水":[115.72,37.72],
    "包头":[110,40.58],
    "绵阳":[104.73,31.48],
    "乌鲁木齐":[87.68,43.77],
    "枣庄":[117.57,34.86],
    "杭州":[120.19,30.26],
    "淄博":[118.05,36.78],
    "鞍山":[122.85,41.12],
    "溧阳":[119.48,31.43],
    "库尔勒":[86.06,41.68],
    "安阳":[114.35,36.1],
    "开封":[114.35,34.79],
    "济南":[117,36.65],
    "德阳":[104.37,31.13],
    "温州":[120.65,28.01],
    "九江":[115.97,29.71],
    "邯郸":[114.47,36.6],
    "临安":[119.72,30.23],
    "兰州":[103.73,36.03],
    "沧州":[116.83,38.33],
    "临沂":[118.35,35.05],
    "南充":[106.110698,30.837793],
    "天津":[117.2,39.13],
    "富阳":[119.95,30.07],
    "泰安":[117.13,36.18],
    "诸暨":[120.23,29.71],
    "郑州":[113.65,34.76],
    "哈尔滨":[126.63,45.75],
    "聊城":[115.97,36.45],
    "芜湖":[118.38,31.33],
    "唐山":[118.02,39.63],
    "平顶山":[113.29,33.75],
    "邢台":[114.48,37.05],
    "德州":[116.29,37.45],
    "济宁":[116.59,35.38],
    "荆州":[112.239741,30.335165],
    "宜昌":[111.3,30.7],
    "义乌":[120.06,29.32],
    "丽水":[119.92,28.45],
    "洛阳":[112.44,34.7],
    "秦皇岛":[119.57,39.95],
    "株洲":[113.16,27.83],
    "石家庄":[114.48,38.03],
    "莱芜":[117.67,36.19],
    "常德":[111.69,29.05],
    "保定":[115.48,38.85],
    "湘潭":[112.91,27.87],
    "金华":[119.64,29.12],
    "岳阳":[113.09,29.37],
    "长沙":[113,28.21],
    "衢州":[118.88,28.97],
    "廊坊":[116.7,39.53],
    "菏泽":[115.480656,35.23375],
    "合肥":[117.27,31.86],
    "武汉":[114.31,30.52],
    "大庆":[125.03,46.58],
    "广西":[108.479, 23.1152],
    "河南":[113.4668, 34.6234],
    "云南": [102.9199, 25.4663]

};

init_area_data = function (datas) {
    var area_data = {};

    jQuery(datas).each(function () {

        var brand = this.brand;
        if(!brand || brand == '开发测试产品' || brand == '包材及工时费' || brand == 'MEE')
            return;

        brand = brand.replace(reg,"").replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLocaleUpperCase()
        var address = this.address;
        var phone = this.phone;
        var num = this.qty;
        if(!address || address == null || address == "")
            return;

        var isCity = false;
        for(var city in geoCoordMap){
            if(address.toString().indexOf(city) > -1) {
                var all_area = area_data["all"];
                var brand_area = area_data[brand];
                if(!all_area)
                    all_area = {};

                if(!brand_area)
                    brand_area = {};

                if(!all_area[city])
                    all_area[city] = parseInt(num);
                else
                    all_area[city] += parseInt(num);

                if(!brand_area[city])
                    brand_area[city] = parseInt(num);
                else
                    brand_area[city] += parseInt(num);

                area_data["all"] = all_area;
                area_data[brand] = brand_area;

                isCity = true;
                break;
            }
        }

        if(!isCity) {
            if(!phone || phone == null || phone == "")
                console.info("!IsCity & phone null : " + address)
                return;

            for(var city in geoCoordMap){
                if(phone.toString().indexOf(city) > -1) {
                    var all_area = area_data["all"];
                    var brand_area = area_data[brand];
                    if(!all_area)
                        all_area = {};

                    if(!brand_area)
                        brand_area = {};

                    if(!all_area[city])
                        all_area[city] = parseInt(num);
                    else
                        all_area[city] += parseInt(num);

                    if(!brand_area[city])
                        brand_area[city] = parseInt(num);
                    else
                        brand_area[city] += parseInt(num);

                    area_data["all"] = all_area;
                    area_data[brand] = brand_area;

                    isCity = true;
                    break;
                }
            }
        }

        if(!isCity){
            console.info("!IsCity: "+address);
        }

    });

    console.info(area_data);
    console.info(JSON.stringify(area_data));
}

init_area_prodcuts = function (datas) {
    var area_data = {};

    jQuery(datas).each(function () {
        var brand = this.brand;
        if(!brand || brand == '开发测试产品' || brand == '包材及工时费' || brand == 'MEE')
            return;

        brand = brand.replace(reg,"").replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLocaleUpperCase();

        var address = this.address;
        var phone = this.phone;
        var num = this.qty;
        var code = this.code;
        if(!address || address == null || address == "")
            return;

        var isCity = false;
        for(var city in geoCoordMap){
            if(address.toString().indexOf(city) > -1) {
                var code_area = area_data[code];

                if(!code_area)
                    code_area = {};

                if(!code_area[city])
                    code_area[city] = parseInt(num);
                else
                    code_area[city] += parseInt(num);

                area_data[code] = code_area;

                isCity = true;
                break;
            }
        }

        if(!isCity) {
            if(!phone || phone == null || phone == "")
                console.info("!IsCity & phone null : " + address)
            return;

            for(var city in geoCoordMap){
                if(phone.toString().indexOf(city) > -1) {
                    var code_area = area_data[code];

                    if(!code_area)
                        code_area = {};


                    if(!code_area[city])
                        code_area[city] = parseInt(num);
                    else
                        code_area[city] += parseInt(num);

                    area_data[code] = code_area;

                    isCity = true;
                    break;
                }
            }
        }

        if(!isCity){
            console.info("!IsCity: "+address);
        }

    });

    console.info(area_data);
    console.info(JSON.stringify(area_data));
}

init_sale_data = function (datas) {
    var product_data = {};
    var sale_Data = {};

    jQuery(datas).each(function () {
        var brand = this.brand;
        if (!brand || brand == '开发测试产品' || brand == '包材及工时费' || brand == 'MEE')
            return;

        brand = brand.replace(reg, "").replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLocaleUpperCase();
        // var address = this.address;
        // var phone = this.phone;
        var num = this.qty;
        var code = this.code;
        var time = this.sales_time;
        /*
        console.info(time.toTimeString());
        console.info(time.toDateString());
        console.info(time.toISOString());
        console.info(time.toUTCString());
        console.info(this.sales_time);
        console.info([time.getFullYear(), time.getMonth() + 1, time.getDate()].join('/'));
        */
        // [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/')
        if(!time)
            console.info(this);

        var key = new Date(time).format('yyyy-MM-dd').toString();
        var all_data = sale_Data["all"];
        var brand_sale = sale_Data[brand];
        var product_sale = product_data[code];

        if(!all_data)
            all_data = {};

        if(!brand_sale)
            brand_sale = {};

        if(!product_sale)
            product_sale = {};

        if(all_data[key])
           all_data[key] += parseInt(num);
        else
           all_data[key] = parseInt(num);

        if(brand_sale[key])
            brand_sale[key] += parseInt(num);
        else
            brand_sale[key] = parseInt(num);

        if(product_sale[key])
            product_sale[key] += parseInt(num);
        else
            product_sale[key] = parseInt(num);

        sale_Data["all"] = all_data;
        sale_Data[brand] = brand_sale;
        product_data[code] = product_sale;
    });
    /*
        var data = {};
        data.name = time.toString();
        data.value = [];

        name: now.toString(),
            value: [
            [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
            Math.round(value)
        ]*/

    console.info(sale_Data);
    console.info(JSON.stringify(sale_Data));
    console.info(product_data);
    console.info(JSON.stringify(product_data));
}


import_products = function(datas) {
    var products = [];
    var i = 0;
    var count = 0;
    jQuery(datas).each(function () {
        if(!this.brand || !this.code)
            return;

        var obj = {};
        obj.name = this.name;
        obj.sku = this.code;
        obj.overseaName = this.oversea_name;
        obj.costPrice = this.cost_price;
        obj.retailPrice = this.retail_price;
        obj.overseaCostPrice = this.oversea_cost_price;
        obj.overseaRetailPrice = this.oversea_retail_price;
        obj.brand = this.brand;
        // obj.weight = this.weight;
        if(isNaN(this.code)){
            console.info("SKU-Error:" + this.code);
            return;
        }

        let weight = this.weight;

        if(!weight || weight == null || weight == "" || weight == 'NULL')
            weight = 0;

        if(weight.toString().indexOf("g") > -1){
            weight = weight.toString().replace("g","");
        }

        if(weight.toString().indexOf("ml") > -1){
            weight = weight.toString().replace("ml","");
        }

        obj.weight = weight;

        let categoryId = this.category_id;
        if(!categoryId || categoryId == null || categoryId == 0 || categoryId === 'NULL')
            categoryId = 0;
        obj.categoryId = categoryId;

        products.push(obj);
        i++;
        count++;
        if(i == 49){
            var object = {};
            object.proVos = products;
            sendJData($manage_addproducts_url,JSON.stringify(object),true,function (data) {
                console.info("i = "+ i);
            });

            i = 0;
            products = [];
        }
    })
    var object = {};
    object.proVos = products;
    console.count(count);
    sendJData($manage_addproducts_url,JSON.stringify(object),true,function (data) {
        console.info("i = "+ i);
    });

}


init_user_data = function (datas) {
    var mongoDB = [];
    var i = 0;
    jQuery(datas).each(function () {
        if(!this.brand || !this.external_sale_id || !this.code)
            return;

        var brand = this.brand.replace(reg, "").replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLocaleUpperCase();
        if (brand == '开发测试产品' || brand == '包材及工时费' || brand == 'MEE')
            return;


        var address = this.address;
        var phone = this.phone;
        var num = this.qty;
        var code = this.code;
        var time = this.sales_time;
        var name = this.name;

        var obj = {};
        obj.order = this.external_sale_id.replace(reg, "").replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLocaleUpperCase();
        obj.name = this.name;
        obj.id_num = this.id_number;
        obj.address = address;
        obj.phone = phone;
        obj.sku = code.toString().replace(reg, "").trim();
        obj.content = this.oversea_name;
        obj.num = num;
        // obj.expId = infos[8];
        obj.date = new Date(time).Format('yyyyMMdd');
        obj.user = this.name;
        var username = "fiona";
        if(this.customer_id == 1118)
            username = "fiona";
        else if(this.customer_id == 1129)
            username = "smile";

        obj.username = username;
        obj._id = obj.order + "_" + obj.sku;
        obj.brand = this.brand;

        var body = {};
        body.body = encodeUnicode(JSON.stringify(obj));
        mongoDB.push(body);

    })

    console.info(mongoDB);
    sendJsonData($mongoDB_path,JSON.stringify(mongoDB),true,function (data) {
        console.info(data);
    });

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
