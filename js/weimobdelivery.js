
import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,show_delivery);
}

show_delivery = function (ori_datas) {
    var file_data = ori_datas[0];
    var wb = file_data.data;
    var sheet = wb[0];
    var data = sheet.data;

    const datas = [];
    for(var i = 0; i < data.length; i++) {
        const  d = data[i];
        console.log(d);
        for (let key in d) {
            console.log(key);
            if (i == 0) {
                let v = key.split(',');

                let orderId = v[0];
                let name = v[1];
                let id_num = v[2];
                let address = v[3];
                let phone = v[4];
                let sku = v[5];
                let sku_name = v[6];
                let num = v[7];
                let expId = v[8];

                let o = {};
                o.orderId = orderId;
                o.name = name;
                o.id_num = id_num;
                o.address = address;
                o.phone = phone;
                o.sku = sku;
                o.content = sku_name;
                o.skuNum = num;
                o.deliveryId = expId;
                datas.push(o);

            }

            let v = d[key].split(',');

            let orderId = v[0];
            let name = v[1];
            let id_num = v[2];
            let address = v[3];
            let phone = v[4];
            let sku = v[5];
            let sku_name = v[6];
            let num = v[7];
            let expId = v[8];

            let o = {};
            o.orderId = orderId;
            o.name = name;
            o.id_num = id_num;
            o.address = address;
            o.phone = phone;
            o.sku = sku;
            o.content = sku_name;
            o.skuNum = num;
            o.deliveryId = expId;

            datas.push(o);
        }
    }

    const mergeData = merge_order(datas);

    send_data(mergeData);
}


merge_order = function (datas) {
    var merge_data = {};
    for(let i in datas) {
        const data = datas[i];
        console.log(data);
         let orderId = data.orderId;
         let d = merge_data[orderId];
         if(!d || d == null) {
             d = {};
             d.orderId = orderId;
             d.name = data.name;
             d.phone = data.phone;
             d.id_num = data.id_num;
             d.address = data.address;
             d.deliveryId = data.deliveryId;

             d.skuInfo = [];
         }

        let s = {};
        s.sku =  data.sku;
        s.content = data.content;
        s.skuNum = data.skuNum;

        d.skuInfo.push(s);
        merge_data[orderId] = d;
    }

    return merge_data;

}

send_data = function (datas) {
    const delivery = [];
    for(let key in datas) {
        let data = datas[key];
        delivery.push(data);
    }

    sendJData($weimob_order_delivery_url,JSON.stringify(delivery),true,function (data) {
        if(data.statusCode != 0) {
            toastr.error("发货失败，请稍后再试!");
        }else {
            let orderDeliveryResult = data.data;
            if(orderDeliveryResult.success) {
                toastr.success("发货成功，请稍后再试!");
            } else {
                 toastr.error("发货失败，请稍后再试!");
            }

            table.showErrInfo(orderDeliveryResult.errorOrderIds,"发货失败订单号")
        }
    })

}