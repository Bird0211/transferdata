/*
            FileReader共有4种读取方法：
            1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
            2.readAsBinaryString(file)：将文件读取为二进制字符串
            3.readAsDataURL(file)：将文件读取为Data URL
            4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'
                         */
var rABS = true; //是否将文件读取为二进制字符串

$("#search").bind("click",function () {
   var start = $("#startTime").val();
   var end = $("#endTime").val();


});

function importdata(myDropzone) {//导入
    var obj = myDropzone;
    if(!obj.files) {
        return;
    }
    var reader = null;
    var oridatas = [];
    for(var i = 0; i < obj.files.length; i++){
        reader = new FileReader();
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
        })(i)

        if(rABS) {
            reader.readAsArrayBuffer(f);
        } else {
            reader.readAsBinaryString(f);
        }
    }

    reader.onloadend = function (e) {
        //var dateObj = new Date();
        //var year = dateObj.getFullYear();
        //var month = dateObj.getMonth()+1;//月  (注意：月份+1)
        //var date = dateObj.getDate();//日
        /*var day = dateObj.getDay();
        var hours = dateObj.getHours();//小时
        var minutes = dateObj.getMinutes();//分钟
        var seconds = dateObj.getSeconds();//秒*/


        /*
        //导出微商城
        if(oridatas.length == 1)
            downloadExl(format_data(oridatas,true),"xlsx",month + "." + date + "微商城" + ".xlsx");
        if(oridatas.length == 3)
            downloadExl(final_data(oridatas,false),"csv",month + "." + date + "MEE-Import" + ".csv");
        //导出汇总表
        //downloadExl(total_data(oridatas),"xlsx","批量数据处理表.xlsx");
        */
        //format_data
        show_data(oridatas);

    }

}

function fixdata(data) { //文件流转BinaryString
    var o = "",
        l = 0,
        w = 10240;
    for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
    return o;
}


//var tmpDown; //导出的二进制对象
function downloadExl(data, type,filename) {
    if(!data || data == null || data.length <= 0) {
        toastr.error("数据错误，请检查数据");
        return;
    }

    const wb = { SheetNames: ['Sheet1'], Sheets: {}, Props: {} };
    wb.Sheets['Sheet1'] = XLSX.utils.json_to_sheet(data);//通过json_to_sheet转成单页(Sheet)数据
    saveAs(new Blob([s2ab(XLSX.write(wb, {bookType: (type == undefined ? 'xlsx':type),bookSST: false, type: 'binary'}))],
        { type: "application/octet-stream" }),filename);

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

function checkFiles(files) {
    for(let i = 0; i < files.length - 1; i++){
        if(files[i].name == files[files.length-1].name)
            return false;
    }
    return true;
}

var reg = new RegExp('"',"g");

//格式化数据
function format_data(table_datas) {
    if(table_datas == null)
        return;

    var format_data = [];
    jQuery(table_datas).each(function() {
        var content = this.content;
        var contents = content.split('<br>');
        var format_content = "";
        for(var i = 0; i < contents.length; i++){
            var c = contents[i];
            if(!c || c == '')
                continue;
            format_content += c.split(";")[0] + ";";
        }
        var d = {};
        d["运单编号"] = "";
        d["订单编号"] = this.order;
        d["收件人"] = this.name;
        d["收件人联系电话"] = this.phone;
        d["收货人详细地址"] = this.address;
        d["寄件人电话"] = "3PL";
        d["内件品名1"] = format_content;
        d["总数量"] = this.num;
        d["*实际重量（kg）"] = "";
        format_data.push(d);
    });

    return format_data;
}

function createDetailData(table_datas) {
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

function getOrderData(data) {
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

function show_data(ori_datas) {
    if(ori_datas == null || ori_datas.length < 2)
        return;

    var detail_data = {};
    var express_data = {};
    var order_data = {};
    for(var f = 0; f < ori_datas.length; f++){
        var file_data = ori_datas[f];
        var wb = file_data.data;
        var sheet = wb[0];
        var data = sheet.data;
        var filename = file_data.name;
        switch (getFileType(data[0])){
            case 1 : detail_data = getDetailData(data);
                break;
            case 2 : express_data = getExpData(data);
                break;
            case 3 : order_data = getOrderData(data);
                break;
            case -1:
                toastr.error("文件内容有误，请确认文件包含必要列信息！");
                return;
        }
    }

    if(detail_data && !$.isEmptyObject(order_data)){
        data_processing(order_data,detail_data);
        $('#accordionTwo').trigger("click");
    }

    if(express_data && !$.isEmptyObject(express_data) && detail_data) {
        downloadExl(data_merge(detail_data,express_data),"csv",month + "." + date + "MEE-Import-Enring" + ".csv");
    }
}

function data_merge(base_data,express_data) {
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
                continue;
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
        showMissOrder(missExpdata,"部分快递信息匹配错误，请确认以下订单");
    }

    return f_data;
}


//处理数据
function data_processing(order_data,detail_data) {
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
            var detail = detail_data[d.order];

            if(!detail) {
                missOrder.push(d.order);
                continue;
            }
            var content = "";
            for(var item in detail){
                var d_data = detail[item];
                var c = d_data.content +" X "+ d_data.num +";" +d_data.sku + "</br>";
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
            process_data.push(f_data);

        }
        console.info(missOrder);
        setTableData(process_data);
        if(missOrder.length > 0){
            showMissOrder(missOrder,"部分订单信息有误,请确认！");
        }
    }
}

function getDetailData(data){
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

        var item = {};
        item.order = order;
        item.sku = sku;
        item.content = content;
        item.num = num;
        item.name = name;
        item.phone = phone;
        item.address = address;
        item.id_num = id_num;

        var d = detail_data[order];
        if(!d)
            d = [];

        d.push(item);
        detail_data[order] = d;
    }
    return detail_data;
}

function getExpData(data) {
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

function getFileType(row0) {
    //1:订单详情,2:快递信息,3:订单信息
    var detail_cloums = ["订单编码","SKU","商品","数量"];
    var exp_cloums = ["订单编号","运单编号","*内件品名"];
    var order_cloums = ["编号","收件人","货物","身份信息","地址","电话"];
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

            if(order_num == order_cloums.length)
                return 3;
            continue;
        }
    }
    return -1;
}


function getExpId(exp_data,context) {
    if(exp_data.length == 1)
        return 0;

    var degree = 0;
    var rum = -1;
    for(var i = 0; i < exp_data.length ; i++) {
        var goods = exp_data[i].content;
        var c = compare(goods.trim().split(/\s+/),context.trim().split(/\s+/));
        if(parseFloat(c) > parseFloat(degree)){
            degree = c;
            rum = i;
        }
    }

    if(rum == -1) {
        for(var i = 0; i < exp_data.length ; i++) {
            var goods = exp_data[i].content;
            var c = strSimilarity2Percent((goods), context);
            if (parseFloat(c) > parseFloat(degree)){
                degree = c;
                rum = i;
            }
        }
    }
    return rum;
}

function compare(x, y) {
    var z = 0;
    var s = x.length + y.length;

    x.sort();
    y.sort();
    var a = x.shift();
    var b = y.shift();

    while(a !== undefined && b !== undefined) {
        if (a === b) {
            z++;
            a = x.shift();
            b = y.shift();
        } else if (a < b) {
            a = x.shift();
        } else if (a > b) {
            b = y.shift();
        }
    }
    return z/s * 200;
}


function strSimilarity2Number(s, t){
    var n = s.length, m = t.length, d=[];
    var i, j, s_i, t_j, cost;
    if (n == 0) return m;
    if (m == 0) return n;
    for (i = 0; i <= n; i++) {
        d[i]=[];
        d[i][0] = i;
    }
    for(j = 0; j <= m; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= n; i++) {
        s_i = s.charAt (i - 1);
        for (j = 1; j <= m; j++) {
            t_j = t.charAt (j - 1);
            if (s_i == t_j) {
                cost = 0;
            }else{
                cost = 1;
            }
            d[i][j] = Minimum (d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + cost);
        }
    }
    return d[n][m];
}
//两个字符串的相似程度，并返回相似度百分比
function strSimilarity2Percent(s, t){
    var l = s.length > t.length ? s.length : t.length;
    var d = strSimilarity2Number(s, t);
    return (1-d/l).toFixed(4);
}
function Minimum(a,b,c){
    return a<b?(a<c?a:c):(b<c?b:c);
}