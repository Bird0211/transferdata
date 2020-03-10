var xlsx = {};
var rABS = true; //是否将文件读取为二进制字符串
var reg = new RegExp('"',"g");


xlsx.option = {}; //1:taobao;
xlsx.option.type = 1;//1:taobao;2:Enring
xlsx.option.isFilter = true;
xlsx.option.split = true;
xlsx.option.name = "";//名字:后缀
xlsx.option.exltitle = null;
xlsx.url = {};
xlsx.url.products = "file/Mee_products.xlsx";
xlsx.url.split = "file/Mee_split.xls";
xlsx.url.gift = "file/gift_role.xlsx";
xlsx.url.customer = "file/customer.xlsx";

xlsx.customer = null;

xlsx.importdata = function (obj,range,callback) {
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
                        oridata.data = XLSX.utils.sheet_to_json(wb.Sheets[sheet],{raw:true,range: range});
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
}

xlsx.downloadExl = function (data, type,filename,isSkipHeader) {
    if(!data || data == null || data.length <= 0) {
        toastr.error("数据错误，请检查数据");
        return;
    }
   /* var skip = 0;
    if(isSkipHeader)
        skip = 1;*/

    // var reName = filename.split(".")[0]+xlsx.option.name+"."+filename.split(".")[1];

var reName = (xlsx.option.name != null && xlsx.option.name != "") ? filename.replace("."+type , "_"+xlsx.option.name+"."+type):filename;
    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(data,{skipHeader: isSkipHeader});//通过json_to_sheet转成单页(Sheet)数据
    saveAs(new Blob([s2ab(XLSX.write(wb, {bookType: (type == undefined ? 'xlsx':type),bookSST: false, type: 'binary'}))],
        { type: "application/octet-stream" }),reName);
}

xlsx.downloadExls = function (datas,sheet_names,type,filename,isSkipHeader) {
    if(!datas || datas == null || datas.length <= 0) {
        toastr.error("数据错误，请检查数据");
        return;
    }
    var reName = filename.replace("."+type , "_"+xlsx.option.name+"."+type);
    const wb = { SheetNames: sheet_names, Sheets: {}, Props: {} };

    for(var i = 0; i < sheet_names.length; i ++){
        wb.Sheets[sheet_names[i]] = XLSX.utils.json_to_sheet(datas[i],{skipHeader: isSkipHeader});//通过json_to_sheet转成单页(Sheet)数据
    }
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
        xlsx.getExlTitle(xlsx.option.name);
        formatDatas = format_Taobao(ori_datas);
    } else if(ori_datas.length == 1 && ori_datas[0].name.indexOf('订单明细') > -1) {
        this.option.type = 1;
        formatDatas = format_Ymtou(ori_datas);
    } else {
        //商城
        this.option.type = 2;
        formatDatas = format_Enring(ori_datas);
    }
    return formatDatas;

}

xlsx.checkFiles = function (files) {

    if(files.length == 1) {
        if((files[0].name.indexOf("订单明细") > -1 || files[0].name.indexOf("订单发货明细表") > -1) &&
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

    var datas = type_datas(ori_datas);
    if(datas == null) {
        return;
    }

    var detail_data = datas["detail"];
    var express_data = datas["express"];

    if(express_data && !$.isEmptyObject(express_data) && detail_data) {
        return pre_down_data(detail_data,express_data);
    }
}

xlsx.merge_settle_data = function (ori_datas) {
    if(ori_datas == null || ori_datas.length < 2){
        return;
    }

    var datas = type_datas(ori_datas);
    if(datas == null) {
        return;
    }

    var detail_data = datas["detail"];
    var express_data = datas["express"];

    if(express_data && !$.isEmptyObject(express_data) && detail_data) {
         return pre_settle_data(detail_data,express_data);

    }
}

pre_settle_data = function (base_data,express_data) {
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
            var sender = expInfo.sender;
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
                    expId+","+
                    sender+"\n";
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
                expId+","+
                sender+"\n";

            f_data.push(format_data);
        }

    }

    if(missExpdata.length > 0){
        table.showMissOrder(missExpdata,"部分快递信息匹配错误，请确认以下订单",'');
    }

    return f_data;
}

xlsx.new_chengguang_data = function (table_datas) {
    if(table_datas == null)
        return;

    var format_data = [];
    jQuery(table_datas).each(function () {
        var content = this.content;
        var contents = content.split('<br>').sort();
        var format_content = "";
        for(var i = 0; i < contents.length; i++){
            var c = contents[i];
            if(!c || c == '')
                continue;

            format_content += c.split(";")[0].replace('X','*').trim()+',';
        }
        if(format_content == '')
            return;

        var sender = this.sender;
        var is3pl = this.is3pl;

        if(is3pl == "true" || !sender) {
            sender = "3PL";
        }

        let pattern=/[`~!@#$^&()=|{}':;',\\\[\]\.<>\/?~！@#￥……&（）——|{}【】'；：""'。，、？]/g;
        format_content = format_content.replace(pattern,"");

        var d = {};
        d["发件人"] = sender;
        d["发件地址"] = "";
        d["发件电话"] = "";
        d["收件人"] = this.name;
        d["收件地址"] = this.address;
        d["收件电话"] = this.phone;
        d["备注"] =  this.order;
        d["物品描述"] = format_content
        format_data.push(d);
    });

    return format_data;

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
        d["收件人身份证号"] = this.id_num;
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

            var sku = (c.split(';')[1]);
            sku = sku.split('_')[0];
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


xlsx.new_milk_data = function (table_datas) {
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

            var detail_content = c.split(';')[0].split(' X ')[0].trim();
            var num = c.split(';')[0].split(' X ')[1].trim();


            var d = {};
            d["收件人"] = this.name;
            d["收件人联系电话"] = this.phone;
            d["收货人详细地址"] = this.address;
            d["寄件人电话"] = "";
            d["内件品名1"] = detail_content +'*'+num+'箱';
            d["身份证号码"] = this.id_num;
            format_data.push(d);
        }

    });

    return format_data;

}

type_datas = function (ori_datas) {
    if(ori_datas == null || ori_datas.length < 2){
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
            table.showMissOrder(missOrder,"部分订单信息有误,请确认！",'');
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
            var order = data.order.toUpperCase();
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
        table.showMissOrder(missExpdata,"部分快递信息匹配错误，请确认以下订单",'');
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

    if (!xlsx.option.exltitle || xlsx.option.exltitle == null || xlsx.option.exltitle == 'null') {
        toastr.error("Excel标题还未设置,请点击'淘宝订单标题'按钮,设置Excel标题！");
        return null;
    }

    var indexMap = {};
    var isStart = false;
    for(var i = 0; i<data.length; i++){
        var d = data[i];
        var row_data = {};

        if(start_row == -1) {
            if(isStartLine(d)){
                if (d.length == 1) {
                    isMac = false;
                }
                indexMap = getIndex(d,isMac);
                start_row = i;
                isStart = true;
            }
        }

        if(i > start_row && start_row > -1) {
            if (isEndLine(d)) {
                start_row = -1;
                break;
            }

            row_data = getRowData(d,indexMap,isMac);
            if(row_data.express != null && row_data.express != ''){   //存在物流公司 则跳过
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
                o.id_num = row_data.idNo?row_data.idNo:"";
                o.address = row_data.addr;
                o.addr = row_data.addr;
                o.num = row_data.num;
                o.content = row_data.content +" X "+ parseInt(row_data.num) + ";" + row_data.sku + "</br>";
                o.sku = row_data.sku;
                order_data[row_data.order] = o;
            }
        }
    }

    if(!isStart) {
        toastr.error("无法获取Excel中信息,请点击'淘宝订单标题'按钮,确认Excel标题正确！");
        return null;
    }

    var datas = [];
    if(order_data != null && !$.isEmptyObject(order_data)){
        for(var key in order_data){
            datas.push(order_data[key]);
        }
    }
    return datas;
}


format_Ymtou = function(ori_datas) {
    var file_data = ori_datas[0];
    var wb = file_data.data;
    var sheet = wb[0];
    var data = sheet.data;

    var datas = [];
    for(var i = 0; i < data.length; i++) {
        const  d = data[i];
        const  row_data = getYamRowData(d);
        datas.push(row_data);
    }
    return datas;
}


getYamRowData = function (data) {
    const row_data = {};
    console.log(data);

    let order = data["订单号"]
    if(order && order != null)
        order = order.toString().replace(reg, "").trim();
    row_data.order = order;

    let name = data["收货人姓名"];
    if(name && name != null)
        name = name.toString().replace(reg, "").trim();
    row_data.name = name;

    let phone = data["收货人手机"];
    if (phone && phone != null)
        phone = phone.toString().replace(reg, "").trim();
    row_data.phone = phone;

    let addr = data["收货人地址"];
    if (addr && addr != null)
        addr = addr.toString().replace(reg, "").trim();
    row_data.addr = addr;

    let express = data["国际物流单号"];
    if (express && express != null)
        express = express.toString().replace(reg, "").trim();
    row_data.express = express;

    let idNo = data["收货人证件号"];
    if(idNo && idNo != null)
        idNo = idNo.toString().replace(reg, "").trim();
    row_data.idNo = idNo;

    let skuStr = data["商品编号"];
    let productStr = data["商品名"];
    let numStr = data["下单数量"];

    const skus = skuStr.split(";");
    const products = productStr.split(";");
    const nums = numStr.split(";");

    let content = "";
    let total_num = 0;
    for (let i = 0; i < skus.length; i ++ ){
        let p = products[i];
        if(p == null || p == "")
            continue;

        let sku = skus[i];
        let num = nums[i];

        let s = sku.split("X");
        if(s != null && s.length > 1)
            num = parseInt(num) * parseInt(s[1]);

        content += p + " X " + parseInt(num)+ ";" + s[0] +"</br>";
        total_num += parseInt(num);
    }
    row_data.content = content.toString().replace(reg, "").trim();;
    row_data.num = total_num;
    row_data.sender = data["买家用户名"];
    row_data.is3pl = "true";
    return row_data;
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
        item.sender = d["寄件人电话"];
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

                    remote_data.push(oridata);
                }
            }
            if(callback) callback(remote_data);
        }
    };
    xhr.send();
}

xlsx.transferName = function (format_data) {
    var new_data = reNewData(format_data);
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
        table.showMissOrder($.unique(error_sku),"以下SKU有误，请确认！",'');
    }

    table.setTableData(merge);
}

function isNumber(value) {
    return !Number.isNaN(Number(value))
}



reNewData = function (format_data) {
    // var products = getAllProduct();
    var products = getAllProductFromUrl();
    if(!products || products == null)
        return format_data;

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
        return context;

    var time = new Date().Format('MMdd');

    return customer.id + time +" " +context;

}

xlsx.getCustomer = function () {
    if(!xlsx.option.name || xlsx.option.name == "")
        return null;

    var _customer = xlsx.customer;
    if(_customer && _customer != "" && _customer.name == xlsx.option.name){
        return _customer;
    }

    var customer = xlsx.get_customerByName(xlsx.option.name);
    xlsx.customer = customer;
    return customer;
}

xlsx.init_customer = function () {
    xlsx.readWorkbookFromRemoteFile(xlsx.url.customer,set_customer);
}

function isStartLine(line){
    let title = xlsx.option.exltitle;
    let num = 0;
    for(let item in line) {
        let value = line[item];
        if(value == title.name ||
            value == title.orderNo ||
            value == title.addr ||
            value == title.express ||
            value == title.idNo ||
            value == title.num ||
            value == title.phone ||
            value == title.productName ||
            value == title.sku
        ) {
            num ++;
        }
    }

    if(num >= 9)
        return true;
    else
        return false;

}

function isEndLine(line) {
    for(let item in line) {
        let value = line[item].toString();
        if(value && value.indexOf("合计") > -1){
            return true;
        }
    }

    return false;

}

function getIndex(line,isMac) {
    const mapIndex = {};
    let title = xlsx.option.exltitle;
    var items = null;
    if(isMac){
        items = line;

    } else {
        items = line.split(",");
    }

    for (let i in items) {
        let value = items[i];
        if(value === title.name) {
            mapIndex.name = i;
        }else if(value === title.orderNo) {
            mapIndex.orderNo = i;
        }else if(value === title.addr){
            mapIndex.addr = i;
        }else if(value === title.express){
            mapIndex.express = i;
        }else if(value === title.idNo){
            mapIndex.idNo = i;
        }else if(value === title.num){
            mapIndex.num = i;
        }else if(value === title.phone){
            mapIndex.phone = i;
        }else if(value === title.productName){
            mapIndex.productName = i;
        }else if(value === title.sku){
            mapIndex.sku = i;
        }
    }
    return mapIndex;
}

function getRowData(line,mapIndex,isMac) {
    const row_data = {};
    var items = null;
    if(isMac){
        items = line;
    } else {
        items = line.split(",");
    }

    let order = items[mapIndex.orderNo];
    if(order && order != null)
        order = order.toString().replace(reg, "").trim();
    row_data.order = order;

    let name = items[mapIndex.name];
    if(name && name != null)
        name = name.toString().replace(reg, "").trim();
    row_data.name = name;

    let phone = items[mapIndex.phone];
    if (phone && phone != null)
        phone = phone.toString().replace(reg, "").trim();
    row_data.phone = phone;

    let addr = items[mapIndex.addr];
    if (addr && addr != null)
        addr = addr.toString().replace(reg, "").trim();
    row_data.addr = addr;

    let content = items[mapIndex.productName];
    if(content && content != null)
        content = content.toString().replace(reg, "").trim();
    row_data.content = content;

    let num = items[mapIndex.num];
    if(num && num != null)
        num = num.toString().replace(reg, "").trim();
    row_data.num = num;

    let express = items[mapIndex.express];
    if (express && express != null)
        express = express.toString().replace(reg, "").trim();
    row_data.express = express;

    let idNo = items[mapIndex.idNo];
    if(idNo && idNo != null)
        idNo = idNo.toString().replace(reg, "").trim();
    row_data.idNo = idNo;

    let sku = items[mapIndex.sku];
    if(sku && sku != null)
        sku = sku.toString().replace(reg, "").trim();
    row_data.sku = sku

    return row_data;
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
    var customer;

        var obj = "name="+name;
        sendData($manage_user_url,obj,false,function (data) {
          if(data){
              var result = data;
              if(result.statusCode == 0) {
                  customer = result.data;
              }
          }
        })


    return customer;
}

xlsx.init_gifr_role = function(){
    xlsx.readWorkbookFromRemoteFile(xlsx.url.gift,set_gift_role);
}

xlsx.getExlTitle = function(businessName) {
    sendData($exl_title_url,"name="+businessName,false,function (data) {
        if(data && data.statusCode == 0) {
            xlsx.option.exltitle = data.data;
        }
    });
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

$('#exltitle').on('click',function () {
    let title = xlsx.option.exltitle;
    if(title != null) {
        $('#orderNo').val(title.orderNo);
        $('#name').val(title.name);
        $('#phone').val(title.phone);
        $('#addr').val(title.addr);
        $('#content').val(title.productName);
        $('#num').val(title.num);
        $('#express').val(title.express);
        $('#idNo').val(title.idNo);
        $('#sku').val(title.sku);
    }

    var business_name = xlsx.option.name;
    $('#exlTitleModel').show();
})

$('#exlTitleModel').on('show.bs.modal', function (event) {
    var modal = $(this);
    var title = "淘宝订单Excel，Title对应关系表";

    modal.find('.modal-title').text(title);
});

$('#addBtn').on('click',function () {

    const exlTitle = getExlTitleVo();
    if(exlTitle != null) {
        let url = $add_exl_title_url;
        sendJData(url,JSON.stringify(exlTitle),true,function (data) {
            if(data.statusCode == 0) {
                toastr.success("添加成功！");
                $('.modal').modal('hide');
            }else {
                toastr.error("添加失败！");
            }
        })
    }

});

$('#updateBtn').on('click',function () {
    const exlTitle = getExlTitleVo();
    if(exlTitle != null) {
        let url = $update_exl_title_url;
        sendJData(url,JSON.stringify(exlTitle),true,function (data) {
            if(data.statusCode == 0) {
                toastr.success("更新成功！");
                $('.modal').modal('hide');
            }else {
                toastr.error("更新失败！");
            }
        })
    }
});

function getExlTitleVo() {
    var order = $('#orderNo').val();
    var name = $('#name').val();
    var phone = $('#phone').val();
    var addr = $('#addr').val();
    var content = $('#content').val();
    var num = $('#num').val();
    var express = $('#express').val();
    var idNo = $('#idNo').val();
    var sku = $('#sku').val();
    var business_name = xlsx.option.name;

    if(!order || order == "") {
        toastr.error("订单编码不能为空，请填写完整信息！");
        return null;
    }

    if(!name || name == "") {
        toastr.error("收件人不能为空，请填写完整信息！");
        return null;
    }

    if(!phone || phone == "") {
        toastr.error("收件人电话不能为空，请填写完整信息！");
        return null;
    }

    if(!addr || addr == "") {
        toastr.error("地址不能为空，请填写完整信息！");
        return null;
    }

    if(!content || content == "") {
        toastr.error("商品名称不能为空，请填写完整信息！");
        return null;
    }

    if(!num || num == "") {
        toastr.error("数量不能为空，请填写完整信息！");
        return;
    }

    if(!express || express == "") {
        toastr.error("物流信息不能为空，请填写完整信息！");
        return null;
    }

    if(!idNo || idNo == "") {
        toastr.error("身份证不能为空，请填写完整信息！");
        return null;
    }
    if(!sku || sku == "") {
        toastr.error("SKU编码不能为空，请填写完整信息！");
        return null;
    }

    if(!business_name || business_name == "") {
        toastr.error("商户名称为空，请先上传Excel文档！");
        return null;
    }

    const exlTitle = {};
    exlTitle.name = name;
    exlTitle.orderNo = order;
    exlTitle.addr = addr;
    exlTitle.express = express;
    exlTitle.idNo = idNo;
    exlTitle.num = num;
    exlTitle.phone = phone;
    exlTitle.productName = content;
    exlTitle.sku = sku;
    exlTitle.businessName = business_name;

    return exlTitle;
}
