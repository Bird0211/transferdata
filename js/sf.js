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
    var download_data = xlsx.merge_data(ori_datas);
    if(download_data == null) {
        console.info("download_data is null")
        toastr.error("文件有误，请检查数据");
        return;
    }
    xlsx.downloadExl(download_data,"csv",month + "." + date + "MEE-Import-SF" + ".csv",true);

    setTimeout(function () {
        myDropzone.removeAllFiles();
    }, 1000);

}



