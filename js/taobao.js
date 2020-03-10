
import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,0,show_data);
}



show_data = function (ori_datas) {

    var detailInfo = null;

    var orderInfo = null;

    for(let i = 0; i < ori_datas.length; i++) {
        var data = ori_datas[i];
        let name = data.name;
        if(name.indexOf('ExportOrderDetailList') > -1){
            //订单详情
            detailInfo = getDetailInfo(data.data);

        } else if (name.indexOf('ExportOrderList') > -1){
            //订单列表
            orderInfo = getOrderInfo(data.data);
        }
    }

    if(detailInfo != null && orderInfo != null) {
        console.info("detailInfo",detailInfo);
        console.info("orderInfo",orderInfo);
        xlsx.transferName(process_data(orderInfo,detailInfo));
    }
}

getDetailInfo = function(datas) {
    console.info("getDetailInfo",datas)

    var detail_data = {};
    var detailDatas = datas[0].data;
    for (let i = 0; i < detailDatas.length; i++) {
        let data = detailDatas[i];
        var item = {};
        item.order = data["订单编号"];
        item.sku = data["商家编码"];
        item.content = data["标题"];
        item.num = data["购买数量"];
        item.name = null;
        item.phone = null;
        item.address = null;
        item.id_num = null;

        var d = detail_data[item.order];
        if(!d)
            d = [];

        d.push(item);
        detail_data[item.order] = d;
    }

    return detail_data;
}

getOrderInfo = function (datas) {
    console.info("getOrderInfo",datas)

    var order_data = {};
    var orderDatas = datas[0].data;
    for(var i = 0; i<orderDatas.length; i++) {
        var d = orderDatas[i];
        var row_data = {};
        row_data.order = d["订单编号"];
        row_data.name = d["收货人姓名"];
        row_data.phone = d["联系手机"];
        row_data.addr = d["收货地址 "];
        row_data.sender = d["买家会员名"];

        row_data.content = null;
        row_data.id_num = null;
        row_data.num = null;

        let mark = d["订单备注"];
        if(mark != null && mark != "null") {
            let id_num = mark.match(/\d+(.\d+)?/g);
            if(mark.indexOf(id_num+'X') > -1) {
                id_num = id_num+'X';
            }
            row_data.id_num = id_num;

        }

        order_data[row_data.order] = row_data;
    }

    return order_data;
}