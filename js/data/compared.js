import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,0,getInfo);
}

getInfo = function (ori_Data) {
    console.info(ori_Data);
    var datas = ori_Data[0].data;
    var datas2 = ori_Data[1].data;

    console.info(datas);
    console.info(datas2);

    // "Taobao_1.23未上架订单";

    var we_data = [];
    var ku_data = [];
    /*
    if(datas.name == "微商城上线"){
        we_data = datas[0].data;
        ku_data = datas2[0].data;
    }else {
        we_data = datas2[0].data;
        ku_data = datas[0].data;
    }*/
    if(datas.name == "1.23未上架订单_wei"){
        we_data = datas[0].data;
        ku_data = datas2[0].data;
    }else {
        we_data = datas2[0].data;
        ku_data = datas[0].data;
    }
    getLogisticsInfo(we_data,ku_data);
}



getLogisticsInfo = function (we_data,ku_data) {
    var reg = new RegExp('"',"g");
    var expInfo = [];
    var err = [];

    var a = [];
    var b = [];

    jQuery(ku_data).each(function () {
        if(this["SKU"])
            a.push(this["SKU"]);
    })

    jQuery(we_data).each(function () {
        if(this["SKU"])
            b.push(this["SKU"].toString());
    })

    console.info("A:");
    console.info(a);
    console.info("B:")
    console.info(b);

    var c = a.filter(function(v){ return b.indexOf(v) == -1 });

    console.info("C:")
    console.info(c);

    var product = getProduct(ku_data);
    jQuery(c).each(function () {
        let sku = this;
        // console.info(sku.toString());
        if(product[sku]){
            let info = {};
            info["SKU"] = sku.toString();
            // console.info(product[sku]);
            info["Name"] = product[sku]["name"];
            expInfo.push(info);
        }
    })

    if(expInfo.length > 0){
        xlsx.downloadExl(expInfo,"xlsx",month + "." + date + "未上架订单" + ".xlsx",false);

    }
}

getProduct = function (ku_data) {
    var info = {};
    jQuery(ku_data).each(function () {
        if(this.SKU && this.SKU != ""){
            let sku = this.SKU.toString();
            info[sku] = this;
        }
    })

    return info;
}

function checkDateTime(strInputDate) {
    console.info("checkDateTime："+strInputDate);

    if (strInputDate == "") return false;
    strInputDate = strInputDate.replace(/-/g, "/");
    var d = new Date(strInputDate);
    if (isNaN(d)) return false;
    var arr = strInputDate.split("/");
    return ((parseInt(arr[0], 10) == d.getFullYear()) &&
        (parseInt(arr[1], 10) == (d.getMonth() + 1)) &&
        (parseInt(arr[2], 10) == d.getDate()));

}

