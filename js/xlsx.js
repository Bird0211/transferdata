var xlsx = {};
var rABS = true; //是否将文件读取为二进制字符串
var reg = new RegExp('"',"g");


xlsx.option = {}; //1:taobao;
xlsx.option.type = 1;//1:taobao;2:Enring
xlsx.option.isFilter = true;
xlsx.option.split = true;
xlsx.option.name = "";//名字:后缀
xlsx.url = {};
xlsx.url.products = "file/Mee_products.xlsx";
xlsx.url.split = "file/Mee_split.xls";
xlsx.url.gift = "file/gift_role.xlsx";
xlsx.url.customer = "file/customer.xlsx";

xlsx.customer = null;

xlsx.importdata = function (obj,callback) {
    if(!obj.files) {
        return;
    }
    var oridatas = [];
    for(var i = 0; i < obj.files.length; i++){
        var reader = new FileReader();
        var f = obj.files[i];
        reader.fileName = f.name; // file came from a input file element. file = el.files[0];
        (function (i) {
            reader.onload = function(e) {
                var oriFile = {};
                oriFile.data = [];
                oriFile.name = e.target.fileName;

                var data = e.target.result;
                var wb;//读取完成的数据
                if(rABS) {
                    wb = XLSX.read(btoa(fixdata(data)), {//手动转化
                        type: 'base64'
                    });
                } else {
                    wb = XLSX.read(data, {
                        type: 'binary'
                    });
                }

                // 遍历每张表读取
                for (var sheet in wb.Sheets) {
                    if (wb.Sheets.hasOwnProperty(sheet)) {
                        var oridata = {};
                        oridata.name = wb.SheetNames[sheet];
                        oridata.fromTo = wb.Sheets[sheet]['!ref'];
                        oridata.range = wb.Sheets[sheet]['!range'];
                        oridata.manges = wb.Sheets[sheet]['!merges'];
                        oridata.data = XLSX.utils.sheet_to_json(wb.Sheets[sheet],{raw:true});
                        // console.info(wb);
                        // break; // 如果只取第一张表，就取消注释这行
                        oriFile.data.push(oridata);
                    }
                }
                oridatas.push(oriFile);
            };
            if(rABS) {
                reader.readAsArrayBuffer(f);
            } else {
                reader.readAsBinaryString(f);
            };

        })(i)
        reader.onloadend = function (e) {
            if(oridatas != null && oridatas.length == obj.files.length)
                callback(oridatas);
        }
    }
};

xlsx.downloadExl = function (data, type,filename,isSkipHeader) {
    if(!data || data == null || data.length <= 0) {
        toastr.error("数据错误，请检查数据");
        return;
    }
   /* var skip = 0;
    if(isSkipHeader)
        skip = 1;*/

    // var reName = filename.split(".")[0]+xlsx.option.name+"."+filename.split(".")[1];

var reName = filename.replace("."+type , "_"+xlsx.option.name+"."+type);
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(data,{skipHeader: isSkipHeader});//通过json_to_sheet转成单页(Sheet)数据
    saveAs(new Blob([s2ab(XLSX.write(wb, {bookType: (type == undefined ? 'xlsx':type),bookSST: false, type: 'binary'}))],
        { type: "application/octet-stream" }),reName);
}

xlsx.checkFile = function (files) {
    for(let i = 0; i < files.length - 1; i++){
        if(files[i].name == files[files.length-1].name)
            return false;


    }
    return true;
}

xlsx.format_data = function (ori_datas) {
    if(ori_datas == null || ori_datas.length <= 0)
        return;

    var formatDatas = null;
    if(ori_datas.length == 1 && ori_datas[0].name.indexOf('订单发货明细表') > -1) {
        //taobao
        this.option.type = 1;
        formatDatas = format_Taobao(ori_datas);
    }else {
        //商城
        this.option.type = 2;
        formatDatas = format_Enring(ori_datas);
    }
    return formatDatas;

}

xlsx.checkFiles = function (files) {

    if(files.length == 1) {
        if(files[0].name.indexOf("订单发货明细表") > -1 &&
            files[0].name.indexOf('_') < 0) {
            toastr.error("请修改文件名，添加所属名称，例如: "+files[0].name.split('.')[0]+"_fiona"+"."+files[0].name.split('.')[1]);
            return false;
        }
        return true;
    }

    var isIncludeName = false;

    if(files[files.length-2].name == files[files.length-1].name){
        toastr.error("文件已存在，请重新上传！");
        return false;
    }

    for(let i = 0; i < files.length; i++){
        if(!isIncludeName && files[i].name.indexOf('_') > 0){
            isIncludeName = true;
            break;
        }
    }

    if(!isIncludeName) {
        toastr.error("请修改文件名，添加所属名称，例如: "+files[0].name.split('.')[0]+"_fiona"+"."+files[0].name.split('.')[1]);
        return false;
    }
    return true;
}

format_Enring = function (ori_datas) {
    if(ori_datas == null || ori_datas.length < 2){
        return;
    }

    var datas = type_datas(ori_datas);
    if(datas == null)
        return;

    var detail_data = datas["detail"];
    var order_data = datas["order"];
    if(detail_data && !$.isEmptyObject(order_data))
        return process_data(order_data,detail_data);

}

xlsx.merge_data = function(ori_datas) {
    if(ori_datas == null || ori_datas.length < 2){
        return;
    }

    console.info("xlsx.merge_data");
    var datas = type_datas(ori_datas);
    if(datas == null) {
        console.info("datas is null")
        return;
    }

    console.info(datas);
    var detail_data = datas["detail"];
    var express_data = datas["express"];

    if(express_data && !$.isEmptyObject(express_data) && detail_data) {
        return pre_down_data(detail_data,express_data);
    }
}



xlsx.new_express_data = function(table_datas) {
    if(table_datas == null)
        return;

    var format_data = [];
    var filtermodel = getFilterModel();

    jQuery(table_datas).each(function() {
        var content = this.content;
        var contents = content.split('<br>').sort();
        var format_content = "";
        var num = 0;
        for(var i = 0; i < contents.length; i++){
            var c = contents[i];
            if(!c || c == '')
                continue;

            if(filter_order(c.split(';')[0].split(' X ')[0].trim(),filtermodel))
                continue;

            format_content += c.split(";")[0] + ";";
            num = Number(num) + Number(c.split(';')[0].split(' X ')[1].trim());

        }
        if(format_content == '')
            return;

        var sender = this.sender;
        var is3pl = this.is3pl;

        if(is3pl == "true" || !sender) {
            sender = "3PL";
        }

        var d = {};
        d["运单编号"] = "";
        d["订单编号"] = this.order;
        d["收件人"] = this.name;
        d["收件人联系电话"] = this.phone;
        d["收货人详细地址"] = this.address;
        d["寄件人电话"] = sender;
        d["内件品名1"] =  xlsx.reNewContext(format_content);
        d["总数量"] = num.toString();
        d["*实际重量（kg）"] = "";
        format_data.push(d);
    });

    return format_data;
}

xlsx.new_detail_data = function(table_datas) {
    if(table_datas == null)
        return;

    var format_data = [];
    jQuery(table_datas).each(function() {
        var content = this.content;
        var contents = content.split('<br>');
        for(var i = 0; i < contents.length; i++){
            var c = contents[i];
            if(!c || c == '')
                continue;

            var sku = c.split(';')[1];
            var detail_content = c.split(';')[0].split(' X ')[0].trim();
            var num = c.split(';')[0].split(' X ')[1].trim();
            var d = {};
            d["订单编码"] = this.order;
            d["商品"] = detail_content;
            d["数量"] = num;
            d["SKU"] = sku;
            d["收件人"] = this.name;
            d["电话"] = this.phone;
            d["地址"] = this.address;
            d["身份证"] = this.id_num;
            format_data.push(d);

        }
    });
    return format_data;
}

type_datas = function (ori_datas) {
    if(ori_datas == null || ori_datas.length < 2){
        console.info("ori_datas.length < 2 " + ori_datas.length);
        return;
    }

    var types_datas = {};

    for(var f = 0; f < ori_datas.length; f++){
        var file_data = ori_datas[f];
        var wb = file_data.data;
        var sheet = wb[0];
        var data = sheet.data;
        var filename = file_data.name;
        switch (getFileType(data[0])){
            case 1 : types_datas["detail"] = getDetailData(data);
                console.info('This is detail_data');
                break;
            case 2 : types_datas["express"] = getExpData(data);
                console.info('This is express_data');
                break;
            case 3 : types_datas["order"] = getOrderData(data);
                console.info('This is order_data');
                break;
            case -1:
                toastr.error("文件内容有误，请确认文件包含必要列信息！"+ filename);
                return;
        }
    }
    console.info(types_datas);
    return types_datas;
}

process_data = function (order_data,detail_data) {
    if (detail_data && order_data) {
        var process_data = [];
        var missOrder = [];
        for (var data in order_data) {
            var d = order_data[data];
            var order = d.order;
            var num = d.num;
            var name = d.name;
            var phone = d.phone;
            var address = d.addr;
            var id_num = d.id_num;
            var sender = d.sender;
            if(!sender)
                sender = "3PL";
            var detail = detail_data[d.order];

            if(!detail) {
                missOrder.push(d.order);
                continue;
            }
            var content = "";
            for(var item in detail){
                var d_data = detail[item];
                var c = d_data.content +" X "+ parseInt(d_data.num) +";" +d_data.sku + "</br>";
                content += c;
            }
            var f_data = {};
            f_data.order = order;
            f_data.num = num;
            f_data.name = name;
            f_data.phone = phone;
            f_data.address = address;
            f_data.id_num = id_num;
            f_data.content = content;
            f_data.sender = sender;
            process_data.push(f_data);

        }
        if(missOrder.length > 0){
            table.showMissOrder(missOrder,"部分订单信息有误,请确认！");
        }
        return process_data;
    }
}

pre_down_data = function (base_data,express_data) {
    var f_data = [];
    var key;
    var missExpdata = [];
    for (var item in base_data) {
        var datas = base_data[item];
        for(var i = 0; i < datas.length; i++){
            var data = datas[i];
            var order = data.order;
            var expInfo = express_data[order];
            if(!expInfo) {
                missExpdata.push(order);
                continue;
            }

            var expId = expInfo.express;
            if(!expId || expId == null || expId == ''){
                missExpdata.push(order);
                continue;
            }

            if(!key || key == ''){
                key = order+","+
                    data.name+","+
                    data.id_num+","+
                    data.address+","+
                    data.phone+"," +
                    data.sku+","+
                    data.content+","+
                    parseFloat(data.num)+","+
                    expId+"\n";
                console.info(key);
                // continue;
            }

            var format_data = {};
            format_data[key] = order+","+
                data.name+","+
                data.id_num+","+
                data.address+","+
                data.phone+"," +
                data.sku+","+
                data.content+","+
                parseFloat(data.num)+","+
                expId+"\n";

            f_data.push(format_data);
        }

    }

    if(missExpdata.length > 0){
        table.showMissOrder(missExpdata,"部分快递信息匹配错误，请确认以下订单");
    }


    return f_data;
}

format_Taobao = function (ori_datas) {
    var start_row = -1;
    var order_data = {};
    var isMac = true;
    var file_data = ori_datas[0];
    var wb = file_data.data;
    var sheet = wb[0];
    var data = sheet.data;

    for(var i = 0; i<data.length; i++){
        var d = data[i];
        var row_data = {};
        for(var item in d) {
            if(!d[item])
                continue;

            var item_data = d[item].toString();
            if(item_data.indexOf('行号') > -1){
                if(item_data == '行号')
                    isMac = false;
                start_row = i;
                break;
            }

            console.info(item_data)
            if(item_data.indexOf('合计') > -1){
                start_row = -1;
                break;
            }
            if(i > start_row && start_row > -1) {
                if(isMac){
                    var jValue = item_data;
                    var values = jValue.split(',');

                    row_data.order = values[1].replace(reg, "").trim().toString();
                    row_data.name = values[2].replace(reg, "").trim();
                    row_data.phone = values[9].replace(reg, "").trim();
                    row_data.addr = values[8].replace(reg, "").trim();
                    row_data.content = values[3].replace(reg, "").trim();
                    row_data.num = values[5].replace(reg, "").trim();
                    row_data.express = values[10].replace(reg, "").trim();
                    row_data.id_num = values[12].replace(reg, "").trim();
                    row_data.sku = values[4].replace(reg, "").trim();

                }else {
                    if(item == '线上订单')
                        row_data.order = item_data.replace(reg, "").trim().toString();
                    else if(item == '__EMPTY')
                        row_data.name = item_data.replace(reg, "").trim();
                    else if(item == '__EMPTY_7')
                        row_data.phone = item_data.replace(reg, "").trim();
                    else if(item == '__EMPTY_6')
                        row_data.addr = item_data.replace(reg, "").trim();
                    else if(item == '__EMPTY_1')
                        row_data.content = item_data.replace(reg, "").trim();
                    else if(item == '__EMPTY_3')
                        row_data.num = item_data.replace(reg, "").trim();
                    else if(item == '__EMPTY_8')
                        row_data.express = item_data.replace(reg, "").trim();
                    else if(item == '__EMPTY_10')
                        row_data.id_num = item_data.replace(reg, "").trim();
                    else if(item == '__EMPTY_2')
                        row_data.sku = item_data.replace(reg, "").trim();

                }
            }
        }

        if(i > start_row && start_row > -1) {
            if(row_data.express != null && row_data.express != ''){   //存在物流公司 则跳过
                console.info("express not null")
                continue;
            }

            if(order_data[row_data.order]) {
                var o = order_data[row_data.order];
                o.num = Number(o.num)+ Number(row_data.num);
                o.content = o.content + row_data.content +" X "+ parseInt(row_data.num) + ";" + row_data.sku + "</br>";
                order_data[row_data.order] = o;
            }else {
                var o = {};
                o.order = row_data.order;
                o.name = row_data.name;
                o.phone = row_data.phone;
                o.id_num = row_data.id_num?row_data.id_num:"";
                o.address = row_data.addr;
                o.addr = row_data.addr;
                o.num = row_data.num;
                o.content = row_data.content +" X "+ parseInt(row_data.num) + ";" + row_data.sku + "</br>";
                o.sku = row_data.sku;
                order_data[row_data.order] = o;
            }
        }
    }
    var datas = [];
    if(order_data != null && !$.isEmptyObject(order_data)){
        for(var key in order_data){
            datas.push(order_data[key]);
        }
    }
    return datas;


}

getFileType = function(row0) {
    //1:订单详情,2:快递信息,3:订单信息
    var detail_cloums = ["订单编码","SKU","商品","数量"];
    var exp_cloums = ["订单编号","运单编号","*内件品名"];
    var order_cloums = ["编号","收件人","货物","地址","电话"];//"身份信息"
    var detail_num = 0,exp_num = 0,order_num = 0;
    for(var key in row0){
        if(detail_cloums.includes(key)) {
            detail_num++;
            if(detail_num == detail_cloums.length)
                return 1;
            continue;
        }
        if(exp_cloums.includes(key)) {
            exp_num++;

            if(exp_num == exp_cloums.length)
                return 2;
            continue;
        }

        if(order_cloums.includes(key)) {
            order_num++;
            if(order_num == order_cloums.length){
                return 3;
            }
            continue;
        }
    }
    return -1;
}

getDetailData = function(data){
    var detail_data = {};
    for(var i = 0; i<data.length; i++){
        var d = data[i];
        let order = d["订单编码"].toString().replace(reg, "").trim();
        let sku = d["SKU"].toString().replace(reg, "").trim();
        let content = d["商品"];
        let num = d["数量"];
        let name = d["收件人"];
        let phone = d["电话"];
        let address = d["地址"];
        let id_num = d["身份证"];
        // let sender = d["客户"];

        var item = {};
        item.order = order;
        item.sku = sku;
        item.content = content;
        item.num = num;
        item.name = name;
        item.phone = phone;
        item.address = address;
        item.id_num = id_num;
        // item.sender = sender;

        var d = detail_data[order];
        if(!d)
            d = [];

        d.push(item);
        detail_data[order] = d;
    }
    return detail_data;
}

getExpData = function (data) {
    var express_data = {};
    for(var i = 0; i<data.length; i++){
        var d = data[i];
        if(!d["订单编号"])
            continue;
        let order = d["订单编号"].toString().replace(reg, "").trim();
        let item = {};
        item.express = d["运单编号"];
        item.content = d["*内件品名"];
        express_data[order] = item;
    }
    return express_data;
}

getOrderData = function (data) {
    var order_data = {};
    for(var i = 0; i<data.length; i++){
        var d = data[i];
        var row_data = {};
        for(var item in d) {
            var drowData = d[item].toString();
            if(item == '编号'){
                var order = drowData.toString().replace(reg, "").trim();
                row_data.order = order;
            }
            else if(item == '收件人')
                row_data.name = drowData.replace(reg, "").trim();
            else if(item == '电话')
                row_data.phone = drowData.replace(reg, "").trim();
            else if(item == '地址')
                row_data.addr = drowData.replace(reg, "").trim();
            else if(item == '货物'){
                var c = drowData.replace(reg, "");
                row_data.content = c;
                var goods = c.split(';');
                var num = 0;
                for(var g in goods){
                    var vs = goods[g].trim().split(/\s+/);
                    var isX = false;
                    for(var v in vs){
                        if(isX){
                            num = parseInt(num) + parseInt(vs[v]);
                            break;
                        }
                        if(vs[v] == 'X'){
                            isX = true;
                            continue;
                        }
                    }
                }
                row_data.num = num;
            }
            else if(item == '身份信息')
                row_data.id_num = drowData.replace(reg, "").trim();
            else if(item == '客户')
                row_data.sender = drowData.replace(reg, "").trim();

        }
        row_data.express ;
        order_data[row_data.order] = row_data;

    }
    return order_data;
}


function filter_order(content,filterModel) {
    //读取文件内容
    if(!filterModel || filterModel == '')
        return false;
    var models = filterModel.split('\n');
    return models.includes(content);
}

function getFilterModel() {
    var url = "filter.txt";
    var htmlobj= $.ajax({url:url,async:false});
    var dataString = htmlobj.responseText;
    return dataString;
}

function fixdata(data) { //文件流转BinaryString
    var o = "",
        l = 0,
        w = 10240;
    for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
    return o;
}

function saveAs(obj, fileName) {//当然可以自定义简单的下载文件实现方式
    var tmpa = document.createElement("a");
    tmpa.download = fileName || "下载";
    tmpa.href = URL.createObjectURL(obj); //绑定a标签
    tmpa.click(); //模拟点击实现下载
    setTimeout(function () { //延时释放
        URL.revokeObjectURL(obj); //用URL.revokeObjectURL()来释放这个object URL
    }, 100);
}

function s2ab(s) { //字符串转字符流
    if (typeof ArrayBuffer !== 'undefined') {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    } else {
        var buf = new Array(s.length);
        for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
}

// 从网络上读取某个excel文件，url必须同域，否则报错
xlsx.readWorkbookFromRemoteFile = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        if(xhr.status == 200) {
            var remote_data = [];
            var data = new Uint8Array(xhr.response)
            var wb = XLSX.read(data, {type: 'array'});
            console.info(wb);
            console.info(wb.Props.ModifiedDate);
            // 遍历每张表读取
            for (var sheet in wb.Sheets) {
                if (wb.Sheets.hasOwnProperty(sheet)) {
                    var oridata = {};
                    oridata.name = sheet
                    oridata.fromTo = wb.Sheets[sheet]['!ref'];
                    oridata.range = wb.Sheets[sheet]['!range'];
                    oridata.manges = wb.Sheets[sheet]['!merges'];
                    oridata.data = XLSX.utils.sheet_to_json(wb.Sheets[sheet],{raw:true});
                    // break; // 如果只取第一张表，就取消注释这行
                    console.info(oridata);

                    remote_data.push(oridata);
                }
            }
            if(callback) callback(remote_data);
        }
    };
    xhr.send();
}

xlsx.transferName = function (format_data) {
    var datas = sessionStorage.getItem("_products");
    var new_data = reNewData(JSON.parse(datas),format_data);
    var error_sku = [];
    var merge = [];
    jQuery(new_data).each(function () {
        var goods = this.content.split('<br>');
        var details = [];
        for(var i = 0; i < goods.length ; i++){
            var good = goods[i];
            if(!good || good == '')
                continue;
            var c = good.split(';');
            var sku = c[1];
            var content = c[0].split(' X ')[0].trim();
            var num = c[0].split(' X ')[1].trim();

            var item = {};
            item.content = content;
            item.sku = sku;
            item.num = parseInt(num);
            details.push(item);

            if(!isNumber(item.sku)){
                //不是数字
                error_sku.push("order : "+this.order + " SKU : "+item.sku);
            }

        }
        var merge_date = table.merge(details);
        this.content = merge_date.content;
        this.num = merge_date.num;
        merge.push(this);
    })

    if(error_sku && error_sku.length > 0) {
        table.showMissOrder($.unique(error_sku),"以下SKU有误，请确认！");
    }

    table.setTableData(merge);

}

function isNumber(value) {
    return !Number.isNaN(Number(value))
}



reNewData = function (datas,format_data) {
    if(!datas)
        return format_data;

    /*var data = datas[0];
    console.info(data);*/
    var products = {};
    jQuery(datas).each(function() {
        if(!this.oversea_name || !this.code)
            return;
        var code = this.code.toString().replace(reg, "").trim()
        var product = {};
        product.code = code;
        product.name = this.oversea_name.replace('[不含GST]','').replace('【不含GST】','');
        product.weight = this.weight;
       products[code] = product;
    });
    var d_data = [];
    jQuery(format_data).each(function() {
        var order = this.order;
        var content = this.content;
        var contents = content.split("</br>");
        var format_content = "";
        for(var i = 0; i < contents.length; i++){
            var c = contents[i];
            if(!c || c == '')
                continue;
            let sku = c.split(";")[1];
            let con = c.split(";")[0].split(' X ')[0];
            let num = c.split(';')[0].split(' X ')[1];
            let short = products[sku.toString().replace(reg, "").trim()];

            if(short && short.name)
                con = short.name;
            format_content += con + ' X '+num + ";"+sku + "<br>";
            // Red Seal 红印儿童牙膏 无氟可吞咽 75g X 1
        }
        if(format_content == '')
            format_content = content;

        var new_data = this;
        new_data.content = format_content;
        // new_data.order = reNewOrder(order);
        d_data.push(new_data);
    });
    return d_data;

}

xlsx.reNewContext = function (context) {
    var customer = xlsx.getCustomer();
    if(!customer || customer == null)
        return order;

    var time = new Date().Format('MMdd');

    return customer.ID + time +" " +context;

}

xlsx.getCustomer = function () {
    if(!xlsx.option.name || xlsx.option.name == "")
        return null;

    var customer = xlsx.get_customerByName(xlsx.option.name);
    return customer;
}

xlsx.init_customer = function () {
    xlsx.readWorkbookFromRemoteFile(xlsx.url.customer,set_customer);
}


set_customer = function (oridata) {
    if(!oridata || oridata == null)
        return;

    var data = oridata[0].data;
    var datas = {};
    jQuery(data).each(function () {
        datas[this.name] = this;
    });

    var dataString = JSON.stringify(datas);
    sessionStorage.setItem("_customer",dataString);
}

xlsx.get_customerByName = function (name) {
    if(!xlsx.customer || xlsx.customer == null){
        var customerString = sessionStorage.getItem("_customer");
        if(customerString && customerString!= null) {
            xlsx.customer = JSON.parse(customerString);
        }
    }

    var customer;
    if(xlsx.customer){
        customer = xlsx.customer[name];
    }
    return customer;
}

xlsx.init_gifr_role = function(){
    xlsx.readWorkbookFromRemoteFile(xlsx.url.gift,set_gift_role);
}

set_gift_role = function (oridata) {
    if(!oridata || oridata == null)
        return;

    var giftdata = {};
    jQuery(oridata).each(function () {
        var data = this.data;
        var sheet_name = this.name;
        var gifts = [];
        jQuery(data).each((i,v)=>{
            var sku = v["商品SKU"];
            if(!sku)
                return;

            var skus = sku.split('\n');
            var gift = v["赠品"].split('\n');

            var g = {};
            g.skus = skus;
            g.num = v["匹配数量"];
            g.gift = gift;
            g.order = v["优先级"];

            gifts.push(g);
        });

        if(gifts && gifts.length > 0){
            gifts = gifts.sort(function (a,b) {
                return a.order - b.order;
            });
            giftdata[sheet_name] = gifts;
        }

    });

    var giftString = JSON.stringify(giftdata);
    sessionStorage.setItem("_giftrole",giftString);
}
