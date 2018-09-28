/*
            FileReader共有4种读取方法：
            1.readAsArrayBuffer(file)：将文件读取为ArrayBuffer。
            2.readAsBinaryString(file)：将文件读取为二进制字符串
            3.readAsDataURL(file)：将文件读取为Data URL
            4.readAsText(file, [encoding])：将文件读取为文本，encoding缺省值为'UTF-8'
                         */
var rABS = true; //是否将文件读取为二进制字符串

function importf() {//导入
    var obj = myDropzone;
    if(!obj.files) {
        return;
    }
    var reader = null;
    var oridatas = [];
    for(let i = 0; i < obj.files.length; i++){
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
                        oridata.data = XLSX.utils.sheet_to_json(wb.Sheets[sheet]);
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
        var dateObj = new Date();
        //var year = dateObj.getFullYear();
        var month = dateObj.getMonth()+1;//月  (注意：月份+1)
        var date = dateObj.getDate();//日
        /*var day = dateObj.getDay();
        var hours = dateObj.getHours();//小时
        var minutes = dateObj.getMinutes();//分钟
        var seconds = dateObj.getSeconds();//秒*/
        //导出微商城
        if(oridatas.length == 1)
            downloadExl(format_data(oridatas,true),"xlsx",month + "." + date + "微商城-Taobao" + ".xlsx");
        if(oridatas.length == 2)
            downloadExl(final_data(oridatas,false),"csv",month + "." + date + "MEE-Import-Taobao" + ".csv");
        //导出汇总表
        //downloadExl(total_data(oridatas),"xlsx","批量数据处理表.xlsx");
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
function format_data(ori_datas,isFilter) {
    if(ori_datas == null)
        return;

    var format_data = [];
    if(ori_datas.length == 1){
        var filename = ori_datas[0].name;

        if(filename.indexOf("订单发货明细表") < 0) {
            toastr.error("文件错误！请上传订单发货明细表");
            return;
        }

        var wb = ori_datas[0].data;
        var sheet = wb[0];
        var data = sheet.data;
        var order_data = getOrderData(data,true,true);

        if(order_data) {
            for(var item in order_data){
                var o = order_data[item];
                var d = {};
                d["运单编号"] = "";
                d["订单编号"] = item;
                d["收件人"] = o.name;
                d["收件人联系电话"] = o.phone;
                d["收货人详细地址"] = o.addr;
                d["寄件人电话"] = "3PL";
                d["内件品名1"] = o.content;
                d["总数量"] = o.num;
                d["*实际重量（kg）"] = "";
                format_data.push(d);
            }
        }

    }
    return format_data;
}

function getOrderData(data,isFilter,isMerge) {
    var start_row = -1;
    var order_data = {};
    var base_data = [];
    var isMac = true;
    var filtermodel;

    if(isFilter){
        filtermodel = getFilterModel();
    }
    for(var i = 0; i<data.length; i++){
        var d = data[i];
        var row_data = {};
        for(var item in d) {
            if(d[item].indexOf('行号') > -1){
                if(d[item] == '行号')
                    isMac = false;
                start_row = i;
                break;
            }

            if(d[item].indexOf('合计') > -1){
                start_row = -1;
                break;
            }
            if(i > start_row && start_row > -1) {
                if(isMac){
                    var jValue = d[item];
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
                        row_data.order = d[item].replace(reg, "").trim().toString();
                    else if(item == '__EMPTY')
                        row_data.name = d[item].replace(reg, "").trim();
                    else if(item == '__EMPTY_7')
                        row_data.phone = d[item].replace(reg, "").trim();
                    else if(item == '__EMPTY_6')
                        row_data.addr = d[item].replace(reg, "").trim();
                    else if(item == '__EMPTY_1')
                        row_data.content = d[item].replace(reg, "").trim();
                    else if(item == '__EMPTY_3')
                        row_data.num = d[item].replace(reg, "").trim();
                    else if(item == '__EMPTY_8')
                        row_data.express = d[item].replace(reg, "").trim();
                    else if(item == '__EMPTY_10')
                        row_data.id_num = d[item].replace(reg, "").trim();
                    else if(item == '__EMPTY_2')
                        row_data.sku = d[item].replace(reg, "").trim();

                }
            }
        }

        if(i > start_row && start_row > -1) {
            if(row_data.express != null && row_data.express != ''){   //存在物流公司 则跳过
                continue;
            }
            if(isFilter && filter_order(row_data.content,filtermodel)){
                continue;
            }
            if(isMerge) {
                if(order_data[row_data.order]) {
                    var o = order_data[row_data.order];
                    o.num = Number(o.num)+ Number(row_data.num);
                    o.content = o.content + row_data.content +" X "+ row_data.num + " ; ";
                    order_data[row_data.order] = o;
                }else {
                    var o = {};
                    o.order = row_data.order;
                    o.name = row_data.name;
                    o.phone = row_data.phone;
                    o.id_num = row_data.id_num?row_data.id_num:"";
                    o.addr = row_data.addr;
                    o.num = row_data.num;
                    o.content = row_data.content +" X "+ row_data.num + " ; ";
                    o.sku = row_data.sku;
                    order_data[row_data.order] = o;
                }
            }else {
                var o = {};
                o.order = row_data.order;
                o.name = row_data.name;
                o.phone = row_data.phone;
                o.id_num = row_data.id_num?row_data.id_num:"";
                o.addr = row_data.addr;
                o.num = row_data.num;
                o.content = row_data.content +" X "+ row_data.num + "; ";
                o.sku = row_data.sku;
                base_data.push(o);
            }
        }
    }

    if(isMerge)
        return order_data;
    else
        return base_data;
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

function final_data(ori_datas) {
    if(ori_datas == null || ori_datas.length < 2)
        return;

    var f_data = [];
    var express_data = {};
    var base_data = [];
    for(var f = 0; f < ori_datas.length; f++){
        var file_data = ori_datas[f];
        var wb = file_data.data;
        var sheet = wb[0];
        var data = sheet.data;
        var filename = file_data.name;
        if(filename.indexOf("订单发货明细表") < 0) {
            //物流订单
            for(var i = 0; i<data.length; i++){
                var d = data[i];
                let order;
                let express;
                for(var item in d){
                    if(item == '订单编号') {
                        order = d[item].replace(reg, "").trim().toString();
                    }
                    if(item == '运单编号') {
                        express = d[item];
                    }
                    if(order && express){
                        express_data[order] = express.replace(reg, "").trim();
                        break;
                    }
                }
            }
        }else {
            base_data = getOrderData(data,false,false);
        }
    }

    if(express_data && base_data) {
        var key;
        for (var item in base_data) {
            var data = base_data[item];
            var order = data.order;
            var expId = express_data[order];

            if(!expId || expId == null || expId == ''){
                continue;
            }

            if(item == 0){
                key = order+","+
                    data.name+","+
                    data.id_num+","+
                    data.addr+","+
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
                data.addr+","+
                data.phone+"," +
                data.sku+","+
                data.content+","+
                parseFloat(data.num)+","+
                expId+"\n";

            f_data.push(format_data);
        }
    }
    return f_data;
}


