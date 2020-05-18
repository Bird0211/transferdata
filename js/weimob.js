
$("#search").bind("click",function () {
    const bizId = mee.getBizId();
    if(!bizId) {
        toastr.error("系统异常,请重新登录！");
        return;
    }

    var start = $("#startTime").val();
    var end = $("#endTime").val();
    var orderStatuses = $("#orderStatuses").val();
    var sendarea = $('#sendarea').val();
    var orderType = $('#orderType').val();

    var data = {};
    data.pageNum = 1;
    data.pageSize = 20;
    data.createStartTime = new Date(start.split("-").reverse().join("-")).getTime();
    data.createEndTime = new Date(end.split("-").reverse().join("-")).getTime();
    data.orderStatuses = orderStatuses;
    data.orderType = orderType;
    data.sendarea = sendarea;

    var url = $weimob_orderlist_url+'/'+bizId;

    sendJData(url, JSON.stringify(data),true,function (calldata) {
        var code = calldata.statusCode;
        if(code == 0) {
            var data = calldata.data;
            let pageNum = data.pageNum;
            let pageSize = data.pageSize;
            let totalCount = data.totalCount;
            let pageList = data.items;
            setTable(pageNum,pageSize,pageList,totalCount)

        } else if (code == 118004) {
            toastr.error("授权失败,重新需要重新授权！");
        } else {
            toastr.error("系统错误,请稍后再试！");
        }
    })

    xlsx.option.type = 3;
    xlsx.option.name = "fiona"

});

setTable = function (pageNum,pageSize,pageList,totalCount) {
    var datas = [];
    for (let i in pageList) {
        let list = pageList[i];
        var data = {};
        data.content = list.content;
        data.num = list.num;
        data.address = list.address;
        data.phone = list.phone;
        data.name = list.name;
        data.order = list.orderNo;
        data.id_num = list.idCardNo != null ? list.idCardNo.match(/\d+(.\d+)?/g) : null;
        data.sender = 'MEE';
        data.is3pl = false;
        
        datas.push(data);
    }

    table.setTableData(datas);
}

