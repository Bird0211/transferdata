
$('#search').on('click',function() {
    let platFormId = $('#platform').val();
    if(!platFormId) {
        toastr.error("请选择要查询的店铺！");
        return;
    }

    let data = {
        "createStartTime": $('#createStartTime').val()  != "" ? $('#createStartTime').val()+ ' 00:00:00' : null,
        "createEndTime": $('#createEndTime').val() != "" ? $('#createEndTime').val()+ ' 23:59:59' : null,
        "payStartTime": $('#payStartTime').val() != "" ? $('#payStartTime').val()+ ' 00:00:00' : null,
        "payEndTime": $('#payEndTime').val() != "" ? $('#payEndTime').val()+ ' 23:59:59' : null,
        "state": $('#state').val() != "" ? $('#state').val() : null,
        "filter": $('#filter').val() != "" ? $('#filter').val() : null
    };

    
    sendJData($nineteen_order_list_url+'/'+platFormId, JSON.stringify(data), true, function(callback){
        var code = callback.statusCode;
        if(code == 0) {
            var data = callback.data;
            if(data) {
                setTable(data.pageNum,data.pageNum,data.items,data.totalCount);
            }

        } else {
            toastr.error("查询失败,请稍后再试！");
        }
    });
});


setTable = function (pageNum,pageSize,pageList,totalCount) {
    var datas = [];
    for (let i in pageList) {
        let list = pageList[i];
        var data = {};
        data.content = getContent(list.products);
        data.num = list.num;
        data.address = list.address;
        data.phone = list.phone;
        data.name = list.name;
        data.order = list.orderNo;
        data.id_num = list.idCardNo != null ? list.idCardNo.match(/\d+(.\d+)?/g) : null;
        data.sender = list.sender;
        data.remark = list.remark != null && list.remark !== '无' ? list.remark : null;
        data.is3pl = false;
        datas.push(data);
    }

    table.setTableData(datas);
}

function getContent(products) {
    let content = ""
    for(let i = 0; i< products.length; i++) {
        let product = products[i];
        content +=product.content + ' X '+product.num + ';' + product.sku + '<br>';
    }
    return content;
}