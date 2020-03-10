import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,1,show_data);
    xlsx.option.type = 4;

}

show_data = function (ori_datas) {
    let file_data = ori_datas[0];
    let file_name = file_data.name;
    let sheet_data = file_data.data[0];
    let datas = sheet_data.data;

    var d = {};
    for(let i = 0; i < datas.length; i++) {
        var data = datas[i];
        let order = data["订单号"];
        let sender = data["买家姓名"];
        let content = data["商品名称"];
        let num = data["商品数量"];
        let sku = data["商品编码"];
        let speci = data["商品规格"];
        let name = data["收货人/提货人"];
        let phone = data["收货人手机号/提货人手机"];
        let id_num = data["收货人身份证号"];
        let address = data["收货地址/提货地址"];

        let orderdatas = {};
        orderdatas.order = order;
        orderdatas.content = content != '-' ? (content+" ["+speci+"] " + " X " + num + ";" + sku +"</br>").replace(",","") : null;
        orderdatas.num = num != '-' ? num : 0;
        orderdatas.name = name != '-' ? name : null;
        orderdatas.sender = sender != '-' ? sender : null;
        orderdatas.phone = phone != '-' ? phone : null;
        orderdatas.id_num = id_num != '-' ? id_num : null;
        orderdatas.address = address != '-' ? address : null;

        if(d[order] == null)
            d[order] = orderdatas;
        else {
            let old_data = d[order];
            if(old_data.content == null) {
                old_data.content = orderdatas.content;
            } else {
                old_data.content += orderdatas.content;
            }

            if(old_data.num == 0) {
                old_data.num = orderdatas.num;
            } else {
                old_data.num += Number(orderdatas.num);
            }

            if(old_data.name == null) {
                old_data.name = orderdatas.name;
            }

            if(old_data.sender == null) {
                old_data.sender = orderdatas.sender;
            }

            if(old_data.phone == null) {
                old_data.phone = orderdatas.phone;
            }

            if(old_data.id_num == null) {
                old_data.id_num = orderdatas.id_num;
            }

            if(old_data.address == null) {
                old_data.address = orderdatas.address;
            }
            d[order] = old_data;
        }
    }

    let table_data = [];
    for(let key in d) {
        let data = d[key];
        table_data.push(data);
    }

    table.setTableData(table_data);
}


