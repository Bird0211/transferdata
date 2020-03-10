import_data = function (myDropzone) {
    xlsx.importdata(myDropzone,0,show_data);
    xlsx.option.type = 4;
}

var confirmData = [];

init_data = function() {
    var allProject = getAllProductByBizId('24');
    if(allProject != null) {
        for(let key in allProject) {
            let product = allProject[key];
            let value = product.code;
            let text = product.name; 
            $("#selectName").append("<option value='"+value+"'>"+text+"</option>");
        }
    }
}

show_data = function (ori_datas) {
    let file_data = ori_datas[0];
    let file_name = file_data.name;
    let sheet_data = file_data.data[0];
    let datas = sheet_data.data;

    if(confirmData != null && confirmData.length > 0)
        confirmData = [];

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

        let contents = content.split('\n');

        let cont = "";
        let num = 0;
        let ds = [];
        for(let i in contents) {
            let data = {};

            let d = contents[i];
            d = d.toString().replace("X"," X ");
            cont += d;
            if(i != contents.length -1 )
                cont += '</br>';

            let sku = "";
            let s = d.split(';');
            if(s.length > 1) {
                sku = s[1];
            }

            let n = s[0].split('X')[1];
            num += Number(n.trim());

            data.num = n;
            data.sku = sku;
            data.name = s[0].split('X')[0];
            data.newSku = "";
            data.newName = "";
            data.newCnName = "";

            ds.push(data);
        }

        let orderdatas = {};
        orderdatas.order = order;
        orderdatas.content = cont;
        orderdatas.datas = ds;
        orderdatas.num = num;
        orderdatas.name = name;
        orderdatas.sender = sender;
        orderdatas.phone = phone;
        orderdatas.id_num = id_num;
        orderdatas.address = address;
        orderdatas.remark = remark;


        confirmData.push(orderdatas);
        setConfirmTable();
        if(jQuery('#accordionMatch').attr("class")) {
            if (jQuery('#accordionMatch').attr("class").indexOf("collapsed") > 0) {
                $('#accordionMatch').trigger("click");
            }
        }
    }
}

setConfirmTable = function () {
    if(!confirmData || confirmData.length <= 0)
        return;


    let titles = [];

    let skus = [];

    let names = [];

    let newSkus = [];

    let newNames = [];

    let newCnNames = [];

    let totalNum = 0;

    for(let i in confirmData) {
        let d = confirmData[i];
        let datas = d.datas;
        for(let j in datas){
            let data = datas[j];
            if(j == 0) {
                titles.push(d.order);
            } else {
                titles.push("");
            }

            skus.push(data.sku);
            names.push(data.name);
            newSkus.push(data.newSku);
            newNames.push(data.newName);
            newCnNames.push(data.newCnName);
            totalNum++;
        }
    }

    var htmlTitle = "";
    for (let i in titles) {
        htmlTitle += '<li>'+titles[i]+'</li>'
    }

    let promiseTitle = setHtmlData('titles',htmlTitle);

    var htmlSkus = "";
    for (let i in skus) {
        htmlSkus += '<li>'+skus[i]+'</li>';
    }

    let promiseSkus = setHtmlData('skus',htmlSkus);

    var htmlNames = "";
    for (let i in names) {
        htmlNames += '<li>'+names[i]+'</li>';
    }
    let promiseNames = setHtmlData('names',htmlNames);

    var htmlNewSkus = "";
    for (let i in newSkus) {
        htmlNewSkus += '<li>'+newSkus[i]+'</li>';
    }
    let promiseNewSkus = setHtmlData('newSkus',htmlNewSkus);


    var htmlNewNames = "";
    for (let i in newNames) {
        htmlNewNames += '<li>'+newNames[i]+'</li>';
    }
    let promiseNewNames = setHtmlData('newNames',htmlNewNames);


    var htmlCnNames = "";
    var htmlOption = "";
    for (let i in newCnNames) {
        htmlCnNames += '<li>'+newCnNames[i]+'</li>';
        htmlOption += '<li><button data-toggle="modal" href="#" data-target="#editModal" data-whatever='+i+' class="btn btn-info btn-xs"><i class="ace-icon fa fa-pencil-square-o bigger-110 icon-only"></i></button></li>';
    }
    let promiseCnNames = setHtmlData('newCnNames',htmlCnNames);
    let promiseOptions = setHtmlData('options',htmlOption);

    let promiseArr = [promiseTitle,promiseSkus,promiseNames,promiseNewSkus,promiseNewNames,promiseCnNames,promiseOptions];
    Promise.all(promiseArr).then(function (data) {
        console.info(data);
        reSize(totalNum);
    });


}


setHtmlData = function (item,htmldata) {
    var p = new Promise(function(resolve, reject){
        $('#'+item).html(htmldata);
        resolve(item);
    });
    return p;
}


reSize = function (n) {
    console.info("reSize: ",n);
   for(let i = 0; i < n; i++) {

       let maxHeight = 0;

       let title =  $('#titles li').eq(i);
       if(title.height() > maxHeight)
           maxHeight = title.height();

       let sku = $('#skus li').eq(i);
       if(sku.height() > maxHeight)
           maxHeight = sku.height();

       let name = $('#names li').eq(i);
       if(name.height() > maxHeight)
           maxHeight = name.height();

       let newSku = $('#newSkus li').eq(i);
       if(newSku.height() > maxHeight)
           maxHeight = newSku.height();

       let newName = $('#newNames li').eq(i);
       if(newName.height() > maxHeight)
           maxHeight = newName.height();

       let newCnName = $('#newCnNames li').eq(i);
       if(newCnName.height() > maxHeight)
           maxHeight = newCnName.height();

       let options = $('#options li').eq(i);
       if(options.height() > maxHeight)
           maxHeight = options.height();

       if(maxHeight > 0) {
           title.height(maxHeight);
           sku.height(maxHeight);
           name.height(maxHeight);
           newSku.height(maxHeight);
           newName.height(maxHeight);
           newCnName.height(maxHeight);
           options.height(maxHeight);
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
    exl["物品"] = "Comvita UMF5+ Manuka Honey 500gX1;9400501001116\nMitoQ 抗氧化胶囊X4";

    var data = [];
    data.push(exl);
    xlsx.downloadExl(data,"xlsx","import-data.xlsx",false);

})


$('#matchBtn').on("click",function () {
    if(!confirmData || confirmData.length <= 0)
        return;

    var names = [];
    for(let i in confirmData) {
        let d = confirmData[i];
        let datas = d.datas;
        for(let j in datas){
            let data = datas[j];
            names.push(data.name);
        }
    }

    var data = {};
    data.name = names;

    var headers = {};
    headers.bizId = 24;

    sendJDataWithHeader($text_match_url,JSON.stringify(data),headers,true,function (datas) {
        if(datas.statusCode == 0) {
            var matchDatas = datas.data;
            console.info(matchDatas);
            for(let i in confirmData) {
                let d = confirmData[i];
                let datas = d.datas;
                for(let j in datas){
                    let data = datas[j];

                    let n = Number(i * datas.length) + Number(j);
                    let matchData = matchDatas[n];
                    data.newSku = matchData.code == null ? "" : matchData.code;
                    data.newName = matchData.name == null ? "" : matchData.name;
                    data.newCnName = matchData.chName == null ? "" : matchData.chName;
                }
            }

            setConfirmTable();
        } else {
            toastr.error("匹配失败,请稍后再试！");

        }
    })
});



$('#confirmBtn').on('click',function () {
    if(!confirmData || confirmData.length <= 0) {
        toastr.error("数据出错,请重新导入订单！");
        return;
    }

    confirmData.forEach(function (item) {
        item.content = getContent(item.datas);
    })

    table.setTableData(confirmData);
})

getContent = function (datas) {
    let content = "";
    for(let i = 0; i < datas.length; i++) {
        let data = datas[i];
        let num = data.num;
        let sku = data.sku;
        let name = data.name;
        let newSku = data.newSku;
        let newName = data.newName;
        let newCnName = data.newCnName;

        content += (newName == null || newName == "") ? name : newName;
        content += " X "+num;
        content += ";";
        content += (newSku == null || newSku == "") ? sku : newSku;

        if(i != datas.length -1)
            content += '</br>';

    }
    return content;
}

$('#editModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var selectNum = button.data('whatever') // Extract info from data-* attributes
    var modal = $(this);

    var selectData = getSelectData(selectNum);

    if(selectData == null)
        return;


    $("#selectName").val("");

    $("#selectName").trigger("chosen:updated");

    $('#formSku').val(selectData.sku);
    $('#formName').val(selectData.name);
    $('#selectnum').val(selectNum);

});

$('#selectName').on('change',function () {
    let code = $('#selectName').val();
    let name = $("#selectName").find("option:selected").text();  //获取Select选择的Text

    $('#formSku').val(code);
    $('#formName').val(name);
})

updateInfo = function () {
    let sku = $('#formSku').val();
    let name = $("#formName").val();

    if(name == "" || name == null){
        toastr.error("请填写商品名称！");
        return;
    }

    let selectnum = $('#selectnum').val();
    let selectData = getSelectData(selectnum);
    if(selectData == null)
        return;

    selectData.sku = sku;
    selectData.name = name;

    selectData.newSku = "";
    selectData.newName = "";
    selectData.newCnName = "";


    $('#editModal').modal('hide');
    setConfirmTable();
}


getSelectData = function (selectNum) {
    var selectData = null;
    let num = 0;
    for(let i in confirmData) {
        let data = confirmData[i];
        let datas = data.datas;
        for(let j in datas){
            if(num == selectNum){
                selectData = datas[j];
                break;
            }
            num ++;
        }
    }

    return selectData
}
