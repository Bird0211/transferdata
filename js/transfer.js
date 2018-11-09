const appToken = "";
const appKey = "";
const method_createOrder = "";

init_data = function () {
    var storage = localStorage.getItem("_products");
    if(!storage || storage == '')
        xlsx.readWorkbookFromRemoteFile(xlsx.url.products,setLocalStorage);

}

import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,show_data);
}

setLocalStorage = function (data) {
    localStorage.setItem("_products", JSON.stringify(data));
}

show_data = function (ori_datas) {

    for(let i = 0; i < ori_datas.length; i++){
        var name = ori_datas[i].name;
        if(name.indexOf("_") > -1){
            var names = name.split("_");
            xlsx.option.name = "_"+ names[names.length - 1].split(".")[0];
            break;
        }
    }

    if(getStep(ori_datas) == 1) {
        var format_data = xlsx.format_data(ori_datas);
        if (format_data == null) {
            toastr.error("文件有误，请检查数据");
            return;
        }
        init_gift();
        xlsx.transferName(format_data);

    }else if(getStep(ori_datas) == 2) {
        var download_data = xlsx.merge_data(ori_datas);
        if(download_data == null) {
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

init_gift = function () {
    var gift_url = xlsx.url.gift.split('.')[0]+xlsx.option.name+'.'+xlsx.url.gift.split('.')[1];
    xlsx.readWorkbookFromRemoteFile(gift_url,setGift);
}

setGift = function (data) {
    var gifts = [];
    jQuery(data[0]).each(function () {
        var sku = this["商品SKU"];
        if(!sku)
            return;

        var skus = sku.split('\n');
        var gift = this["赠品"].split('\n');

        var g = {};
        g.skus = skus;
        g.num = this["匹配数量"];
        g.gift = gift;
        g.order = this["优先级"];

        gifts.push(g);
    });

    if(gifts && gifts.length > 0){
        gifts = gifts.sort(function (a,b) {
            return a.order - b.order;
        });
        var giftString = JSON.stringify(gifts);
        sessionStorage.setItem("_gift"+xlsx.option.name,giftString);
    }
}

getGift = function () {
    var giftString = sessionStorage.getItem("_gift"+xlsx.option.name);
    var gift = null;
    if(giftString){
        gift = JSON.parse(giftString);
    }
    return gift;
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
    var datas = splitOrder_detail(row_data);
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


