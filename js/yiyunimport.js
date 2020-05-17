import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,0,show_data);
    xlsx.option.type = 4;
    xlsx.option.name = 'yiyun';
}



init_data = function() {
    const bizId = mee.getBizId();
    if(!bizId) {
        toastr.error("系统异常,请重新登录！");
        return;
    }
    
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

        let order = data["单号"];
        let express = data["物流"];
        let product = data['产品'];
        let remark = data['附加说明'];

        let name = "";
        let phone = "";
        let address = "";
        let id_num = "";

        if(!express || express.length <= 0) {
            error.push(order);
        } else {
            let expData = express.split('\n');
            name = expData[0];
            phone = expData[1];
            address = expData[2];
            id_num = expData[3] != 'undefined' ? expData[3] : "";
            if(!address || address.length <= 0)
                error.push(order);
        }

        let sender = data["顾客"];
        let sendAddress = "";
        let sendPhone = "";
       
        let contents = product.split('\n'); // 9400501001116X1X4;9400097041930X2

        let cont = "";
        let num = 0;
        
        for(let i = 0; i < contents.length -1 ; i++) {
            let d = contents[i];

            let sku = "";
            
            let n = d.substring(d.indexOf('@') + 1,d.indexOf('=>'));
            num += Number(n.trim());
            let name = d.split('|')[0];
           
            cont += name;
            cont += " X " + Number(n.trim());
            cont += ";";
            cont += sku;

            if(i != contents.length -1)
                cont += '</br>';
        }

        let orderdatas = {};
        orderdatas.order = order.toString().replace("\n",'');
        orderdatas.content = cont;
        orderdatas.num = num;
        orderdatas.name = name;
        orderdatas.sender = sender;
        orderdatas.phone = phone;
        orderdatas.id_num = id_num;
        orderdatas.address = address;
        orderdatas.remark = remark;
        confirmData.push(orderdatas);
    }
    table.setTableData(confirmData);
    if(jQuery('#accordionMatch').attr("class")) {
        if (jQuery('#accordionMatch').attr("class").indexOf("collapsed") > 0) {
            $('#accordionMatch').trigger("click");
        }
    }
    if(error && error.length > 0)
        table.showMissOrder(error,"订单缺少地址信息",'');
}
