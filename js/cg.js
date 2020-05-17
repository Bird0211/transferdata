const appToken = "";
const appKey = "";
const method_createOrder = "";

init_data = function () {
   /*
   var gift_role = sessionStorage.getItem("_giftrole")
    if(!gift_role || gift_role == '') {
        console.info("init gift_role")
        xlsx.init_gifr_role();
    }
*/
    // getAllProductFromUrl();

}

import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,0,show_data);
}

show_data = function (ori_datas) {

    var download_data = merge_data(ori_datas);
    if(download_data == null) {
        console.info("download_data is null")
        toastr.error("文件有误，请检查数据");
        return;
    }
    xlsx.downloadExl(download_data,"csv",month + "." + date + "MEE-Import-CG" + ".csv",true);

    setTimeout(function () {
        myDropzone.removeAllFiles();
    }, 1000);
}


merge_data = function (datas) {
    if(datas == null || datas.length < 2) {
        return null;
    }

    let detail_data = null;
    let express_data = null;
    for(let i = 0; i < datas.length; i++) {
        let data = datas[i];
        let d = data.data[0].data;
        if(data.name.indexOf('New') > -1 ) {
            detail_data = getDetailData(d);
        } else {
            express_data = getCgExpData(d);
        }
    }

    console.info("express_data",express_data);
    console.info("detail_data",detail_data);
    if(express_data && !$.isEmptyObject(express_data) && detail_data) {
        return pre_down_data(detail_data,express_data);
    }
}

getCgExpData = function (datas) {
    var express_data = {};
    for(var i = 0; i<datas.length; i++){
        var d = datas[i];
        if(!d["备注"])
            continue;
        
        let order = d["备注"].toString().replace(reg, "").trim();
        let item = {};
        item.express = d["运单号"];
        item.content = d["物品描述"];
        item.sender = d["发件人"];
        express_data[order.toUpperCase()] = item;
    }
    return express_data;

}



