import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,0,show_data);
    xlsx.option.type = 4;
}


var allProject = null;

init_data = function() {
    const bizId = mee.getBizId();
    if(!bizId) {
        toastr.error("系统异常,请重新登录！");
        return;
    }

    
    allProject = getAllProductByBizId(bizId);
    
}

show_data = function (ori_datas) {
    let file_data = ori_datas[0];
    let file_name = file_data.name;
    let sheet_data = file_data.data[0];
    let datas = sheet_data.data;

    var confirmData = [];
    let error = [];

    for(let i = 0; i < datas.length; i++) {
        var data = datas[i];

        let order = data["订单号"];
        let sender = data["发件人"];
        let sendAddress = data["发货地址"];
        let sendPhone = data["发件电话"];
        let name = data["收件人"];
        let address = data["收件地址"];
        let phone = data["收件电话"];
        let id_num = data["收货人身份证号"];
        let remark = data["备注"];
        let content = data["物品"];

        let contents = content.split(';'); // 9400501001116X1X4;9400097041930X2

        let cont = "";
        let num = 0;
     
        for(let i = 0; i < contents.length; i++) {
            let d = contents[i];
            let s = d.split('X');
            let sku = "";
            if(s.length > 1) {
                sku = s[0];
            }
            let n = s[1];
            num += Number(n.trim());
            let name = ""
            let product = allProject[sku];
            if(!product || product === null) {
                error.push(sku);
            } else {
                name = product.name;
            }
            cont += name;
            cont += " X " + Number(n.trim());
            cont += ";";
            cont += sku;

            if(i != contents.length -1)
                cont += '</br>';
        }

        let orderdatas = {};
        orderdatas.order = order;
        orderdatas.content = cont;
        orderdatas.num = num;
        orderdatas.name = name;
        orderdatas.sender = sender;
        orderdatas.phone = phone;
        orderdatas.id_num = id_num;
        orderdatas.address = address;
        orderdatas.remark = remark;
        confirmData.push(orderdatas);
        // setConfirmTable();
       
    }
    if(error && error.length > 0)
    table.showMissOrder(error,"商品SKU错误，请确认以下SKU商品",'');
    
    table.setTableData(confirmData);
    if(jQuery('#accordionMatch').attr("class")) {
        if (jQuery('#accordionMatch').attr("class").indexOf("collapsed") > 0) {
            $('#accordionMatch').trigger("click");
        }
    }
}

$('#exlmodel').on("click",function () {
    var exl = {};
    exl["订单号"] = "1234567890";
    exl["发件人"] = "张三";
    exl["发货地址"] = "XXX市XXX街道";
    exl["发件电话"] = "138XXXXXXXX";
    exl["收件人"] = "李四";
    exl["收件地址"] = "XXX市XXX街道";
    exl["收件电话"] = "139XXXXXXXX";
    exl["收货人身份证号"] = "1111222233334444";
    exl["备注"] = "备注内容";
    exl["物品"] = "9400501001116X4;9400097041930X2";

    var data = [];
    data.push(exl);
    xlsx.downloadExl(data,"xlsx","import-data.xlsx",false);

});
