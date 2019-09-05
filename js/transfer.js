const appToken = "";
const appKey = "";
const method_createOrder = "";

init_data = function () {

    /*
    var storage = sessionStorage.getItem("_products");
    if(!storage || storage == '') {
        console.info("init products");
        xlsx.readWorkbookFromRemoteFile(xlsx.url.products,setLocalStorage);
    }*/

    /*
    var customer = sessionStorage.getItem("_customer");
    if(!customer || customer == '') {
        console.info("init customer");
        xlsx.init_customer();
    }
    */

    var gift_role = sessionStorage.getItem("_giftrole")
    if(!gift_role || gift_role == '') {
        console.info("init gift_role")
        xlsx.init_gifr_role();
    }

}

import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,show_data);
}

setLocalStorage = function (oridata) {
    sessionStorage.setItem("_products", JSON.stringify(oridata[0].data));
}

show_data = function (ori_datas) {

    for(let i = 0; i < ori_datas.length; i++){
        var name = ori_datas[i].name;
        if(name.indexOf("_") > -1){
            var names = name.split("_");
            xlsx.option.name = names[names.length - 1].split(".")[0];
            console.info("set name = "+xlsx.option.name);
            break;
        }
    }

    xlsx.getCustomer();
    /*
    if(!customer || customer == null){
        table.showMissOrder(["请联系管理员，添加用户("+xlsx.option.name+") ID"], "用户基本信息有误!");
    }*/


    if(getStep(ori_datas) == 1) {
        var format_data = xlsx.format_data(ori_datas);
        if (format_data == null) {
            toastr.error("文件有误，请检查数据");
            return;
        }
        xlsx.transferName(format_data);


    }else if(getStep(ori_datas) == 2) {
        var download_data = xlsx.merge_data(ori_datas);
        if(download_data == null) {
            console.info("download_data is null")
            toastr.error("文件有误，请检查数据");
            return;
        }
        xlsx.downloadExl(download_data,"csv",month + "." + date + "MEE-Import" + ".csv",true);

        var settle_info = xlsx.merge_settle_data(ori_datas);
        // settlement(settle_info);

        saveData(download_data);

        setTimeout(function () {
            myDropzone.removeAllFiles();
        }, 1000);
    }
}

getStep = function (ori_datas) {
    if (ori_datas.length == 1 && ori_datas[0].name.indexOf('订单发货明细表') > -1) {
        return 1;
    }else if(ori_datas.length == 2 && (
            ori_datas[0].name.indexOf('New订单') > -1 ||
            ori_datas[1].name.indexOf('New订单') > -1
        )) {
        return 2;
    }else
        return 1;
}

getGift = function () {
    var giftString = sessionStorage.getItem("_giftrole");
    var gift = null;
    if(giftString){
        gift = JSON.parse(giftString);
    }
    return gift[xlsx.option.name];
}

gift_data = function () {
    //1、获取所以订单
    var all_data = table.getJQAllData();

    var gifts = getGift();
    if(!gifts){
        toastr.error("缺少配置文件，请联系管理员");
        return;
    }

    var isAddGift = false;
    //2、匹配
    jQuery(all_data).each(function () {
        var add_gifts = match_gift(this,gifts);
        if(add_gifts && add_gifts.length > 0){
            //merge gift
            var gift_content = "";
            var gift_num = 0;
            for(let i in add_gifts) {
                var add_gift = add_gifts[i];
                var add_content = add_gift.name+" X "+parseInt(add_gift.num)+";"+add_gift.sku+"<br>";
                gift_content += add_content;
                gift_num = parseInt(gift_num) + parseInt(add_gift.num);
            }
            this.content += "<br>"+gift_content;
            this.num = parseInt(this.num) + parseInt(gift_num);

            isAddGift = true;
        }
    });

    //3、刷新
    if(isAddGift)
        table.setTableData(all_data);

};

match_gift = function (row_data,gifts) {
    var add_gift = null;
    var datas = table.splitOrder_detail(row_data);
    var prudict_skus = [];
    jQuery(datas).each(function () {
        prudict_skus.push(this.sku);
    });

    var match_gift;
    for(let i in gifts){
        var gift = gifts[i];
        var num = intersectNum(prudict_skus,gift.skus);
        if(num >= gift.num) {
            match_gift = gift;
            break;
        }
    }

    if(match_gift) {
        add_gift = [];
        var gift_pruducts = match_gift.gift;
        if(gift_pruducts && gift_pruducts.length > 0) {
            jQuery(gift_pruducts).each(function () {
                let gift_detail = this.split(";");
                if(gift_detail && gift_detail.length > 0){
                    var g = {};
                    g.sku = gift_detail[0];
                    g.name = gift_detail[1].split('X')[0];
                    g.num = gift_detail[1].split('X')[1];
                    add_gift.push(g);
                }
            });
        }
    }

    return add_gift;
}

arr_extend = function (arr,num) {
    if(num == 1)
        return arr;
    return arr.concat(arr_extend(arr,--num));
}

intersectNum = function (orderSKU,giftSKU) {
    if(!orderSKU || !giftSKU)
        return 0;

    var num = 0;
    for(let i in orderSKU){
        var sku = orderSKU[i].replace(/[\r\n]/g,"");
        for(let v in giftSKU){
            let g_sku = giftSKU[v].replace(/[\r\n]/g,"");
            if(g_sku.toString() == sku.toString()){
                ++num;
                break;
            }
        }
    }

    return num;
}

saveData = function (datas) {
    var customer = xlsx.getCustomer();
    // var allProject = getAllProduct();
    var allProject = getAllProductFromUrl();
    var mongoDB = [];
    jQuery(datas).each(function () {
        $.each(this,function (i,value) {
            var infos = value.split(",");
            var obj = {};
            obj.order = infos[0];
                obj.name = infos[1];
                obj.id_num = infos[2];
                obj.address = infos[3];
                obj.phone = infos[4];
                obj.sku = infos[5].toString().replace(reg, "").trim();;
                obj.content = infos[6];
                obj.num = infos[7];
                obj.expId = infos[8];
                obj.date = new Date().Format('yyyyMMdd');
                obj.user = customer.ID;
                obj.username = customer.name;
                obj._id = obj.order + "_" + obj.sku;

                var project = allProject[obj.sku];
                if(project){
                    obj.brand = project.brand;
            }
            var body = {};
            body.body = encodeUnicode(JSON.stringify(obj));
            mongoDB.push(body);
        })
    });

    sendJsonData($mongoDB_path,JSON.stringify(mongoDB),true,function (data) {
        console.info(data);
    });
}

getAllProduct = function () {
    var datas = sessionStorage.getItem("_products");
    if(!datas)
        return null;

    var obj = JSON.parse(datas);
    if(!obj)
        return null;

    var products = {};
    jQuery(obj).each(function() {
        if(!this.oversea_name || !this.code)
            return;
        var code = this.code.toString().replace(reg, "").trim();
        var product = {};
        product.code = code;
        product.name = this.oversea_name.replace('[不含GST]','').replace('【不含GST】','');
        product.weight = this.weight;
        product.brand = this.brand;
        products[code] = product;
    });

    return products;

}


getAllProductFromUrl = function () {
    const products = {};

    getData($all_products_url,false,function (data) {
        if(data.statusCode == 0){
            var datas = data.data;
            if(!datas)
                return null;
            jQuery(datas).each(function () {
                var code = this.code.toString().replace(reg, "").trim();
                var product = {};
                product.code = code;
                product.name = this.chName.replace('[不含GST]','').replace('【不含GST】','');
                product.weight = this.weight;
                product.brand = this.brand;
                products[code] = product;
            })

            console.info(products);
        }
    });

    return products;
}

settlement = function (datas) {
    var customer = xlsx.getCustomer();

    var o = {};
    o.userId = customer.id;
    o.userName = customer.name;

    var orders = [];
    var order_info = {};
    var product_info = {};
    jQuery(datas).each(function () {
        $.each(this,function (i,value) {
            console.info(value);

            var infos = value.split(",");
            var obj = {};
            obj.order = infos[0];
            obj.name = infos[1];
            obj.id_num = infos[2];
            obj.address = infos[3];
            obj.phone = infos[4];
            obj.sku = infos[5].toString().replace(reg, "").trim();;
            obj.content = infos[6];
            obj.num = infos[7];
            obj.expId = infos[8];
            obj.sender = infos[9];

           var info = order_info[obj.order];
           if(!info){
               info = {};
               info.orderId = obj.order;
               info.name = obj.name;
               info.id_num = obj.id_num;
               info.phone = obj.phone;
               info.expId = obj.expId;
               info.num = obj.num;
               info.address = obj.address;
               info.sender = obj.sender;
           }else {
               info.num = Number(info.num) + Number(obj.num);
           }
            order_info[obj.order] = info;

           var products = product_info[obj.order];
           if(!products){
               products = [];
           }
           var product = {};
           product.sku = obj.sku;
           product.content = obj.content;
           product.num = obj.num;
           products.push(product);
           product_info[obj.order] = products;
        })
    });

    for(var key in order_info) {
        var order = order_info[key];
        var product = product_info[key];

        order.product = product;
        orders.push(order);
    }
    o.order = orders;

    sendJData($manage_fee_url,JSON.stringify(o),true,function (data) {
        if(data.statusCode == 0){
            download_settle(data.data);
        }
    });
}

download_settle = function(data){
    var settle_data = [];
    var exp_detail_data = [];
    var exl_sheet_name = ["汇总","快递明细"];
    var all_data = [];

    var error_sku = "";
    jQuery(data).each(function () {
        var obj = {};
        obj["订单编码"] = this.orderId;
        obj["商品"] = getProducts(this.products);
        obj["收件人"] = this.name;
        obj["运单编码"] = this.expId;
        obj["手机号"] = this.phone;
        obj["地址"] = this.address;
        obj["总费用"] = this.totalFee;

        var fees = this.feeDetail;
        jQuery(fees).each(function () {
            obj[this.feeTypeName] = this.fee;
            if(this.feeTypeName == '快递费'){
                if(this.remark != "")
                    error_sku += this.remark;

                var exp_details = this.details;
                if(exp_details){
                    jQuery(exp_details).each(function () {
                        var d = {};
                        d["订单编码"] = this.orderId;
                        d["SKU"] = this.sku;
                        d["商品"] = this.name;
                        d["数量"] = this.num;
                        d["发件人"] = this.sender;
                        d["快递单价"] = this.unitprice;
                        d["重量"] = this.weight + "g";
                        d["快递总价"] = this.totalprice;
                        exp_detail_data.push(d);
                    });
                }
            }
        })

        settle_data.push(obj);
    });

    if(error_sku != ""){
        table.showMissOrder(error_sku.split(";"),"系统缺少以下SKU，请联系管理员！");
    }
    all_data.push(settle_data,exp_detail_data);

    xlsx.downloadExls(all_data,exl_sheet_name,"xlsx",month + "." + date + "settlement.xlsx",false);
}

getProducts = function (products) {
    var p = "";
    jQuery(products).each(function () {
        console.info(this);
        p  = p.concat(this.content,"X",this.num,"[",this.sku,"]");
    })

    return p;
}



