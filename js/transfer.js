const appToken = "";
const appKey = "";
const method_createOrder = "";

init_data = function () {
    var storage = localStorage.getItem("_products");
    if(!storage || storage == '')
        xlsx.readWorkbookFromRemoteFile(xlsx.url.products,setLocalStorage);

    //update special_goods

}

import_data = function (myDropzone) {
    console.info("import_data");
    xlsx.importdata(myDropzone,show_data);
}

setLocalStorage = function (data) {
    localStorage.setItem("_products", JSON.stringify(data));
}

show_data = function (ori_datas) {
    if(getStep(ori_datas) == 1) {
        var format_data = xlsx.format_data(ori_datas);
        if (format_data == null) {
            toastr.error("文件有误，请检查数据");
            return;
        }
        console.info(format_data);
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


