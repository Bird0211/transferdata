import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,getInfo);
}

getInfo = function (ori_Data) {
    var datas = ori_Data[0].data;
    var data = datas[0].data;

    getLogisticsInfo(data);
}

getLogisticsInfo = function (datas) {
    var reg = new RegExp('"',"g");
    var expInfo = [];
    var err = [];


    jQuery(datas).each(function () {
        var exp = this["物流"];
        var expInfos = exp.split(/\s+/);
        var e_id = "" ;
        for(var i = 0; i < expInfos.length ; i++){
            var expId = expInfos[i];
            console.info(expId);
            if(expId && (expId.indexOf('1000') >= 0 || expId.indexOf('77000') >= 0)){
                if((i+1) < expInfos.length && checkDateTime(expInfos[i+1].substring(0,10))){
                    var start = 0;
                    if(expId.indexOf('1000') >= 0)
                        start = expId.indexOf('1000')

                    if(expId.indexOf('77000') >= 0)
                        start = expId.indexOf('77000')

                    e_id = expId.substring(start);
                }
            }
        }

        if(!e_id && e_id == ""){
            err.push("ID: "+this["单号"] + ", 物流: " + exp);
        }else{
            let info = {};
            info["运单号"] = e_id;
            expInfo.push(info);
        }

    });

    if(err.length > 0) {
        table.showMissOrder(err, "物流信息有误!");
    }

    if(expInfo.length > 0){
        xlsx.downloadExl(expInfo,"xlsx",month + "." + date + "结算快递单号" + ".xlsx",false);

    }
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

