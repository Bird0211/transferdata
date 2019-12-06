import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,getInfo);
}

getInfo = function (ori_Data) {
    var datas = ori_Data[0].data;
    var data = datas[0].data;

    var sale_data = {};
    for (let i = 0; i < data.length; i++) {
        var d = data[i];
        console.info(d);
        let product = d["__EMPTY_6"];
        let payment = d["付款"];
        let optioner = d["做单人"];
        let orderId = d["单号"].toString();
        let date = d["__EMPTY_44"];
        let money = d["__EMPTY_30"];
        let express = d["__EMPTY_28"];
        let status = d["__EMPTY_35"];
        let customer = d["__EMPTY_8"];

        var date_order = sale_data[date];
        if(!date_order || date_order == null)
            date_order = [];

        var order_info = {};
        console.info("orderId",orderId)
        order_info.orderId = orderId.substring(orderId.indexOf('"')+1, orderId.indexOf("\t")).trim();
        order_info.products = [];
        console.info("product",product)

        var p = product.substring(product.indexOf("\t"),product.indexOf("共")).replace(" ","");
        var ps = p.split('=>');
        for(let j = 0; j < ps.length; j++) {
            var n = ps[j].trim();
            if (n.indexOf('$') == 0) {
                if (n.split(' ').length == 1) {
                    continue;
                }
                n = n.substring(n.indexOf(' ')).trim();
            }
            if(n == "")
                continue;

            let sku = n.toString().split(' ')[0];
            let content = n.toString().substring(sku.length + 1);
            let name = content.split('|')[0];
            let price = content.split('|')[1].split('@')[0];
            let num = content.split('|')[1].split('@')[1];

            let pro = {};
            pro.sku = sku.trim();
            pro.name = name.trim();
            pro.price = price.trim();
            pro.num = num.trim();

            order_info.products.push(pro);
        }
        // order_info.products.push(order_info)
        date_order.push(order_info);
        sale_data[date] = date_order;
    }

    let mitoq_data = getMitoQ(sale_data);
    download_info(mitoq_data);
}

getMitoQ = function (datas) {
    console.info(datas)
    let mitoQInfo = [];
    for (let key in datas) {
        let info = {};
        let date = key;
        info["Date"] = date;

        let data = datas[key];
        for(let i = 0 ; i < data.length; i++) {
           let order = data[i];
           let products = order.products;
           for(let j = 0; j < products.length; j ++) {
                let product = products[j];
                if (product.name.toLowerCase().includes('mitoq')) {
                    if(!info[product.name] || info[product.name] == null)
                        info[product.name] = 0;

                    console.info("before Num",info[product.name])
                    info[product.name] += Number(product.num);
                    console.info("add Num", product.num)
                    console.info("after Num",info[product.name])
                }
           }

        }
        mitoQInfo.push(info);
    }
    return mitoQInfo;
}

download_info = function(mitoQ_info) {
    let keys = [];
    for (let i = 0; i < mitoQ_info.length; i++) {
        let data = mitoQ_info[i];
        for(let key in data) {
            if(keys.indexOf(key) == -1) {
                keys.push(key);
            }
        }
    }

    var info = [];
    for (let i = 0; i < mitoQ_info.length; i++) {
        let data = mitoQ_info[i];
        let d = {};
        for(let k in keys) {
            let key = keys[k];
            let value = data[key];
            if(!value || value == null)
                value = 0;
            d[key] = value;
        }
        info.push(d);
    }

    xlsx.downloadExl(info,"xlsx","MitoQ订单统计" + ".xlsx",false);
}