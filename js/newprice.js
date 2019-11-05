init = function () {
    var url = "file/weimobproduct.json";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;

    var products = JSON.parse(dataString);
    var datas = [];
    for (let i in products.data) {
        let product = products.data[i];

        let skuId = product.skuId;
        let goodsId = product.goodsId;
        let weight = product.weight;
        let yiyunCostPrice = product.yiyunCostPrice;
        let title = product.title;
        if(title.indexOf('新西兰仓') <= 0)
            continue;

        if (yiyunCostPrice <= 0)
            continue;

        //易云成本x1.15x1.05+重量x6）x4.7=
        let newprice = (yiyunCostPrice * 1.15 * 1.05 + weight/1000 * 6) * 4.7

        let data = {};
        data["商品ID"] = goodsId;
        data["SKUID"] = skuId;
        data["优惠力度"] = new Number(newprice).toFixed(2);
        data["SKU"] = product.sku;
        data["重量"] = weight;
        data["yiyunCostPrice"] = yiyunCostPrice;
        data["name"] = title;

        datas.push(data);
    }

    console.log(datas);
    xlsx.downloadExl(datas,'xlsx','newprice.xlsx',false);

}
