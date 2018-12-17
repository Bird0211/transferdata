const appToken = "";
const appKey = "";
const method_createOrder = "";

init_data = function () {
    var storage = sessionStorage.getItem("_products");
    if(!storage || storage == ''){
        console.info("init products");
        xlsx.readWorkbookFromRemoteFile(xlsx.url.products,setLocalStorage);
    }

    var customer = sessionStorage.getItem("_customer");
    if(!customer || customer == '') {
        console.info("init customer");
        xlsx.init_customer();
    }

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
            break;
        }
    }

    if(getStep(ori_datas) == 1) {
        var format_data = xlsx.format_data(ori_datas);
        if (format_data == null) {
            toastr.error("文件有误，请检查数据");
            return;
        }

        var customer = xlsx.getCustomer();
        if(!customer || customer == null){
            table.showMissOrder(["请联系管理员，添加用户("+xlsx.option.name+") ID"], "用户基本信息有误!");
        }

        console.info("format_data");
        console.info(format_data);

        xlsx.transferName(format_data);

    }else if(getStep(ori_datas) == 2) {
        var download_data = xlsx.merge_data(ori_datas);
        if(download_data == null) {
            console.info("download_data is null")
            toastr.error("文件有误，请检查数据");
            return;
        }
        xlsx.downloadExl(download_data,"csv",month + "." + date + "MEE-Import" + ".csv",true);
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

