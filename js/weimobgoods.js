var goods = {};
goods.goodTyps = {};

goods.getGroup = function () {
    var url = $weimob_classify_url;

    getData(url,true,function (data) {
        console.info(data);
        const goodsList = data.data;

        goodsList.forEach(function (item) {
            $("#goodType").append("<option value='"+item.classifyId+"'>"+item.title+"</option>");

            const children = [];
            item.childrenGroup.forEach(function (childItem) {
                children.push({"classifyId":childItem.classifyId,"title":childItem.title})
            });

            goods.goodTyps[item.classifyId] = children;

        })

    })
}

goods.getExangeRate = function () {
    const url = $exange_rage_url;
    getData(url,true,function (data) {
        const rate = data.data;
        $('#exchangerate').val(rate.rate);
    })
}

goods.search = function() {
    const status = $('#goodStatuses').val();
    const goodType = $('#goodType').val();
    const subGoodType = $('#subGoodType').val();
    const search = $('#searchTxt').val();

    let url = $weimob_goodlist_url;
    const param = {};
    if(status && status != null && status != "") {
        param.goodsStatus = status;
    }

    if(goodType && goodType != null && goodType != "") {
        if(subGoodType != null && subGoodType != "") {
            param.goodsClassifyId = subGoodType;
        }else {
            param.goodsClassifyId = goodType;
        }
    }

    if(search != null && search != "") {
        param.search = search;
    }

    sendJData(url,JSON.stringify(param),true,function (data) {

        console.info(data)
        const goods = [];
        const details = data.data;
        details.forEach(function (item) {
            const goodDetail = {};
            goodDetail.goodsId = item.goodsId;
            goodDetail.img = item.defaultImageUrl;
            goodDetail.title = item.title;
            goodDetail.costPrice = item.costPrice;
            goodDetail.salesPrice = item.salesPrice;
            goodDetail.sku = item.sku;
            goodDetail.yiyunCostPrice = item.yiyunCostPrice;
            goodDetail.yiyunSalesPrice = item.yiyunSalesPrice;
            goodDetail.weight = item.weight;
            goods.push(goodDetail);
        })

        table.setTableData(goods);
    })

}

$("#goodType").change(function(){
    const currenClassify = $("#goodType").val();
    const children = goods.goodTyps[currenClassify];
    $("#subGoodType").empty();

    if(children && children.length >= 0) {
        $("#subGoodType").append("<option value=''></option>");
        children.forEach(function (item) {
            $("#subGoodType").append("<option value='"+item.classifyId+"'>"+item.title+"</option>");
        })
    }
});

$("#search").on("click",goods.search);

$('#countBtn').on("click",function () {
    let rate = $('#exchangerate').val();
    if(!rate || rate == null || rate == "") {
        toastr.error("汇率为空，请输入汇率值!");
        return;
    }

    let freight = $('#freight').val();
    if(!freight || freight == null || freight == "") {
        toastr.error("运费为空，请输入运费!");
        return;
    }

    let coefficient = $('#coefficient').val();
    if(!coefficient || coefficient == null || coefficient == "") {
        toastr.error("系数为空，请输入运费!");
        return;
    }


    const selectData = table.getSelData();
    if(!selectData || selectData == null || selectData.length <= 0) {
        toastr.error("请选择需要计算的商品!");
        return;
    }

    console.info(selectData);

    selectData.forEach(function (item) {
        const costPrice = item.costPrice;
        const salePrice = item.salesPrice;
        const yiyunCostPrice = item.yiyunCostPrice;
        const yiyunSalesPrice = item.yiyunSalesPrice;
        const weight = item.weight == "" ? 0 : item.weight;

        const newCostPrice = yiyunCostPrice * rate + freight * rate * weight/1000;
        const newSalePrice = yiyunSalesPrice * 1.15 * rate * coefficient+ freight * rate * weight/1000;
        item.newCostPrice = newCostPrice.toFixed(2);;
        item.newSalePrice = newSalePrice.toFixed(2);;
    });

    table.setTableData(selectData);


});



$('#updateBtn').on("click",function () {
    const  selectData = table.getSelData();
    if(!selectData || selectData == null || selectData.length <= 0) {
        toastr.error("请选择需要更新的商品!");
        return;
    }

    console.info(selectData);

    const param = [];
    selectData.forEach(function (item) {
        const goods = {};
        goods.goodId = item.goodsId;
        goods.sku = item.sku;
        goods.updateCostPrice = item.newCostPrice;
        goods.updateSalesPrice = item.newSalePrice;
        param.push(goods);
    })


    sendJData($weimob_goodupdate_url,JSON.stringify(param),true,function (data) {
        console.info(data);
        if(data.statusCode != 0) {
            toastr.error("价格更新失败!");
            return;
        }else {
            toastr.success("价格更新成功!");
            const result = data.data;
            const errorSkus = [];
            result.forEach(function (item) {
                if (!item.success) {
                    errorSkus.push(item.sku);
                }
            });

            if(errorSkus && errorSkus.length > 0){
                table.showErrInfo(errorSkus,"部分SKU价格,更新失败:");
            }

        }

    });

});
