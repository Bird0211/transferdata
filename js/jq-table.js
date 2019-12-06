
console.info("grid-table init start")
var grid_selector = "#grid-table";
var pager_selector = "#grid-pager";
//resize to fit page size
$(window).on('resize.jqGrid', function () {
    $(grid_selector).jqGrid('setGridWidth', $(".page-content").width());
})
//resize on sidebar collapse/expand
var parent_column = $(grid_selector).closest('[class*="col-"]');
$(document).on('settings.ace.jqGrid' , function(ev, event_name, collapsed) {
    if( event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed' ) {
        //setTimeout is for webkit only to give time for DOM changes and then redraw!!!
        setTimeout(function() {
            $(grid_selector).jqGrid( 'setGridWidth', parent_column.width() );
        }, 0);
    }
});

console.info("grid-table init end")

var grid_data = {};
jQuery(grid_selector).jqGrid({
    data: grid_data,
    datatype: "local",
    height: '600',
    colNames:['','订单编号','商品名称','数量','发件人','sender','is3pl','收件人' ,'电话','身份证','地址','物流','expresstype'],
    colModel:[
        {name:'option',width:20,sortable:false, align:"center",editable:false,
            formatter:function (cellvalue, options, rowObject) {

                var detail = '<div style="text-align: center; ">';
                detail +='<a id="splitorder" style="margin: 2px;" data-toggle="modal" href="#" data-target="#myModal" data-original-title="拆分订单" data-type="split" data-whatever='+options.rowId+'>';
                if(rowObject.num > 5)
                    detail += '<i class="ui-icon ace-icon fa fa-plus-circle red"></i>';
                else
                    detail += '<i class="ui-icon ace-icon fa fa-plus-circle purple"></i>';
                detail += "</a>";

                if(rowObject.option.isMerge && rowObject.option.isMerge == 1) {
                    detail += '<a id="mergeOrder" style="text-decoration: none;margin: 2px;" data-toggle="modal" href="#" data-target="#myModal" data-original-title="合并订单" data-type="merge" data-whatever='+options.rowId+'>';
                    detail += '<span class="ui-icon iconfont ace-icon icon-hebing1 "></span>';
                    detail += '</a>';
                }
                detail += '</div>';
                return detail;
            }
        },
        {name:'order',index:'order', width:60, sorttype:"int", editable: false},
        {name:'content',index:'content',width:200, editable:false},
        {name:'num',index:'num', width:15,editable: false},
        {name:'', width:25,editable: false,
            formatter:function (cellvalue, options, rowObject) {
            if(!rowObject.sender || rowObject.sender == ''){
                rowObject.sender == "3PL"
                return "3PL";
            }

                var checked = 'checked';
                if(rowObject.is3pl && rowObject.is3pl == "true"){
                    checked = ''
                }
            var value = subString(rowObject.sender,6).padEnd(6);
            var detail = "<label>";
                detail +="<input name='switch-field-1' onclick='change_row_3pl("+options.rowId+")' "+checked+" class='ace ace-switch' type='checkbox' />"
                detail +="<span class='lbl middle' data-lbl='"+value+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3PL'></span>"
                detail += "</label>"

                return detail;
            },
        },
        {name:'sender',index:'sender', width:70, editable: false,hidden:true},
        {name:'is3pl',index:'is3pl', width:70, editable: false,hidden:true},
        {name:'name',index:'name', width:70, editable: false,hidden:true},
        {name:'phone',index:'phone', width:90, editable: false,hidden:true},
        {name:'id_num',index:'id_num', width:90, editable: false,hidden:true},
        {name:'address',index:'address', width:150, sortable:false,editable:false,hidden:true},
        {name:'express',width:35, editable:false,
            formatter:function (cellvalue, options, rowObject) {
                <!-- #section:elements.button.group -->
                if(!rowObject.expresstype || rowObject.expresstype === '') {
                    rowObject.expresstype = "1";
                }

                var value ='';
                value+='<div data-toggle="buttons" class="btn-group btn-overlap btn-corner">';

                value+='<label class="btn btn-sm btn-white btn-info '+(rowObject.expresstype === "1"?'active':'')+'" onclick="selectExp('+options.rowId+',1)">';
                value+='<input type="radio" value="1" />';
                value+='<span class="iconfont icon-wuliu" ></span>';
                value+='</label>';

                value+='<label class="btn btn-sm btn-white btn-info '+(rowObject.expresstype === "2"?'active':'')+'" onclick="selectExp('+options.rowId+',2)">';
                value+='<input type="radio" value="2" />';
                value+='<span class="iconfont icon-tianmaoshunfengbaoyou"></span>';
                value+='</label>';

                value+='</div>';

                return value;
            }},
        {name:'expresstype',index:'expresstype', width:10, editable: false,hidden:true},
    ],
    cellEdit:true,
    cellsubmit:"clientArray",
    viewrecords : false,
    autowidth: true,
    rowNum:20,
    pgbuttons:true,
    page: 1,
    rowList:[10,20,50],
    pager : pager_selector,
    altRows: true,
    //toppager: true,

    multiselect: false,
    //multikey: "ctrlKey",
    multiboxonly: false,

    loadComplete : function() {
        var table = this;
        setTimeout(function(){
            styleCheckbox(table);
            updateActionIcons(table);
            updatePagerIcons(table);
            enableTooltips(table);

        }, 0);
    }

});
$(window).triggerHandler('resize.jqGrid');//trigger window resize to make the grid get the correct size



//enable search/filter toolbar
//jQuery(grid_selector).jqGrid('filterToolbar',{defaultSearch:true,stringResult:true})
//jQuery(grid_selector).filterToolbar({});


//switch element when editing inline
function aceSwitch( cellvalue, options, cell ) {
    setTimeout(function(){
        $(cell) .find('input[type=checkbox]')
            .addClass('ace ace-switch ace-switch-5')
            .after('<span class="lbl"></span>');
    }, 0);
}
//enable datepicker
function pickDate( cellvalue, options, cell ) {
    setTimeout(function(){
        $(cell) .find('input[type=text]')
            .datepicker({format:'yyyy-mm-dd' , autoclose:true});
    }, 0);
}


//navButtons
jQuery(grid_selector).jqGrid('navGrid',pager_selector,
    { 	//navbar options
        edit: false,
        editicon : 'ace-icon fa fa-pencil blue',
        add: false,
        addicon : 'ace-icon fa fa-plus-circle purple',
        del: false,
        delicon : 'ace-icon fa fa-trash-o red',
        search: false,
        searchicon : 'ace-icon fa fa-search orange',
        refresh: false,
        refreshicon : 'ace-icon fa fa-refresh green',
        view: false,
        viewicon : 'ace-icon fa fa-search-plus grey'
    },
    {
        //edit record form
        //closeAfterEdit: true,
        //width: 700,
        recreateForm: true,
        beforeShowForm : function(e) {
            var form = $(e[0]);
            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
            style_edit_form(form);
        }
    },
    {
        //new record form
        //width: 700,
        closeAfterAdd: true,
        recreateForm: true,
        viewPagerButtons: false,
        beforeShowForm : function(e) {
            var form = $(e[0]);
            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
                .wrapInner('<div class="widget-header" />')
            style_edit_form(form);
        }
    },
    {
        //delete record form
        recreateForm: true,
        beforeShowForm : function(e) {
            var form = $(e[0]);
            if(form.data('styled')) return false;

            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
            style_delete_form(form);

            form.data('styled', true);
        },
        onClick : function(e) {
            alert(1);
        }
    },
    {
        //search form
        recreateForm: true,
        afterShowSearch: function(e){
            var form = $(e[0]);
            form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
            style_search_form(form);
        },
        afterRedraw: function(){
            style_search_filters($(this));
        }
        ,
        multipleSearch: true,
        /**
         multipleGroup:true,
         showQuery: true
         */
    },
    {
        //view record form
        recreateForm: true,
        beforeShowForm: function(e){
            var form = $(e[0]);
            form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
        }
    }
).navButtonAdd(pager_selector,{
    caption: "",
    title:"Gift",
    buttonicon: "ace-icon fa fa-gift pink",
    onClickButton: function () {
        gift_data();
    },
    position: "last"

}).navSeparatorAdd(pager_selector,{sepclass : "ui-separator",sepcontent: ''
}).navButtonAdd(pager_selector,{
    id:'3pl',
    caption: "3PL",
    title:"3PL",
    buttonicon: "ace-icon fa fa-exchange btn-yellow",
    onClickButton: function () {
        change_3pl();
    },
    position: "last"

}).navSeparatorAdd(pager_selector,{sepclass : "ui-separator",sepcontent: ''
}).navButtonAdd(pager_selector,{
    id:'express',
    caption: "物流切换",
    title:"物流切换",
    buttonicon: "ace-icon fa-bookmark-o",
    onClickButton: function () {
        //
        change_express();
    },
    position: "last"

}).navSeparatorAdd(pager_selector,{sepclass : "ui-separator",sepcontent: ''
}).navButtonAdd(pager_selector,{
    caption: "",
    title:"Download",
    buttonicon: "ace-icon fa fa-download purple",
    onClickButton: function () {
        download_data();
    },
    position: "last"

}).navSeparatorAdd(pager_selector,{sepclass : "ui-separator",sepcontent: ''});


$('#grid-pager_left').css("width",'15px');

function style_edit_form(form) {
    //enable datepicker on "sdate" field and switches for "stock" field
    form.find('input[name=sdate]').datepicker({format:'yyyy-mm-dd' , autoclose:true})
        .end().find('input[name=stock]')
        .addClass('ace ace-switch ace-switch-5').after('<span class="lbl"></span>');
    //don't wrap inside a label element, the checkbox value won't be submitted (POST'ed)
    //.addClass('ace ace-switch ace-switch-5').wrap('<label class="inline" />').after('<span class="lbl"></span>');

    //update buttons classes
    var buttons = form.next().find('.EditButton .fm-button');
    buttons.addClass('btn btn-sm').find('[class*="-icon"]').hide();//ui-icon, s-icon
    buttons.eq(0).addClass('btn-primary').prepend('<i class="ace-icon fa fa-check"></i>');
    buttons.eq(1).prepend('<i class="ace-icon fa fa-times"></i>')

    buttons = form.next().find('.navButton a');
    buttons.find('.ui-icon').hide();
    buttons.eq(0).append('<i class="ace-icon fa fa-chevron-left"></i>');
    buttons.eq(1).append('<i class="ace-icon fa fa-chevron-right"></i>');
}

function style_delete_form(form) {
    var buttons = form.next().find('.EditButton .fm-button');
    buttons.addClass('btn btn-sm btn-white btn-round').find('[class*="-icon"]').hide();//ui-icon, s-icon
    buttons.eq(0).addClass('btn-danger').prepend('<i class="ace-icon fa fa-trash-o"></i>');
    buttons.eq(1).addClass('btn-default').prepend('<i class="ace-icon fa fa-times"></i>')
}

function style_search_filters(form) {
    form.find('.delete-rule').val('X');
    form.find('.add-rule').addClass('btn btn-xs btn-primary');
    form.find('.add-group').addClass('btn btn-xs btn-success');
    form.find('.delete-group').addClass('btn btn-xs btn-danger');
}
function style_search_form(form) {
    var dialog = form.closest('.ui-jqdialog');
    var buttons = dialog.find('.EditTable')
    buttons.find('.EditButton a[id*="_reset"]').addClass('btn btn-sm btn-info').find('.ui-icon').attr('class', 'ace-icon fa fa-retweet');
    buttons.find('.EditButton a[id*="_query"]').addClass('btn btn-sm btn-inverse').find('.ui-icon').attr('class', 'ace-icon fa fa-comment-o');
    buttons.find('.EditButton a[id*="_search"]').addClass('btn btn-sm btn-purple').find('.ui-icon').attr('class', 'ace-icon fa fa-search');
}

function beforeDeleteCallback(e) {
    var form = $(e[0]);
    if(form.data('styled')) return false;

    form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
    style_delete_form(form);

    form.data('styled', true);
}

function beforeEditCallback(e) {
    var form = $(e[0]);
    form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
    style_edit_form(form);
}



//it causes some flicker when reloading or navigating grid
//it may be possible to have some custom formatter to do this as the grid is being created to prevent this
//or go back to default browser checkbox styles for the grid
function styleCheckbox(table) {
    /**
     $(table).find('input:checkbox').addClass('ace')
     .wrap('<label />')
     .after('<span class="lbl align-top" />')


     $('.ui-jqgrid-labels th[id*="_cb"]:first-child')
     .find('input.cbox[type=checkbox]').addClass('ace')
     .wrap('<label />').after('<span class="lbl align-top" />');
     */
}


//unlike navButtons icons, action icons in rows seem to be hard-coded
//you can change them like this in here if you want
function updateActionIcons(table) {

     var replacement =
     {
         'ui-ace-icon fa fa-pencil' : 'ace-icon fa fa-pencil blue',
         'ui-ace-icon fa fa-trash-o' : 'ace-icon fa fa-trash-o red',
         'ui-icon-disk' : 'ace-icon fa fa-check green',
         'ui-icon-cancel' : 'ace-icon fa fa-times red'
     };

     $(table).find('.ui-pg-div span.ui-icon').each(function(){
						var icon = $(this);
						var $class = $.trim(icon.attr('class').replace('ui-icon', ''));
						if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
					})
}

//replace icons with FontAwesome icons like above
function updatePagerIcons(table) {
    var replacement =
        {
            'ui-icon-seek-first' : 'ace-icon fa fa-angle-double-left bigger-140',
            'ui-icon-seek-prev' : 'ace-icon fa fa-angle-left bigger-140',
            'ui-icon-seek-next' : 'ace-icon fa fa-angle-right bigger-140',
            'ui-icon-seek-end' : 'ace-icon fa fa-angle-double-right bigger-140'
        };
    $('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function(){
        var icon = $(this);
        var $class = $.trim(icon.attr('class').replace('ui-icon', ''));

        if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
    })
}

function enableTooltips(table) {
    $('.navtable .ui-pg-button').tooltip({container:'body'});
    $(table).find('.ui-pg-div').tooltip({container:'body'});
}

//var selr = jQuery(grid_selector).jqGrid('getGridParam','selrow');

$(document).on('ajaxloadstart', function(e) {
    $(grid_selector).jqGrid('GridUnload');
    $('.ui-jqdialog').remove();
});

$('#splitorder').bind("click",function (e) {
    $('#myModal').show();
});

$('#myModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var rowId = button.data('whatever') // Extract info from data-* attributes
    var type = button.data('type')

    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.

    var rowData = jQuery(grid_selector).jqGrid("getRowData",rowId);
    var modal = $(this);
    var title = "";
    var orders;
    var footer = "";
    footer = '<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">关闭</button>';
    if(type == 'split') {
        title = "拆分订单";
        orders = splitOrders(table.getRelatedRowData(rowData));
        footer += '<button id="splitOrder" onclick="table.split_order()" type="button" class="btn btn-success btn-sm">确认拆分</button>';
        $(".dd").css("pointer-events","");
    }
    else {
        title = "合并订单";
        orders = mergeOrders(table.getSameRowData(rowData));
        footer += '<button id="mergeOrder" onclick="table.merge_order()" type="button" class="btn btn-success btn-sm">确认合并</button>';
        $(".dd").css("pointer-events","none");
    }
    // var order = rowData.order;


    var body = getContentHtml(orders);
    modal.find('.modal-title').text(title);
    modal.find('.dd-list').html(body);
    modal.find('.modal-footer').html(footer);

});


getContentHtml = function(datas) {
    if(!datas)
        return;

    var content_hteml = '';
    for(var item in datas){
        var data = datas[item];
        content_hteml += "<li class=\"dd-item\" data-id='"+item+"'>";
        content_hteml += "<div class=\"dd-handle\">"+item+"</div>";
        content_hteml += "<ol class=\"dd-list\">";

        for(var i = 0; i < data.length; i++){
            var d = data[i];
            content_hteml += "<li class=\"dd-item\" data-id='"+d.sku+"' data-sku='"+d.sku+"' data-content='"+d.content+"' data-num='"+d.num+"' data-sender='"+d.sender+"' data-expresstype='"+d.expresstype+"'>";
            content_hteml += "<div class=\"dd-handle\">"+d.content + ' X ' + d.num + "</div>"
            content_hteml += "</li>";
        }
        content_hteml += "</ol></li>";
    }

    return content_hteml;
}

function splitOrders(rowDatas) {
    var result = {};
    for(var r in rowDatas) {
        var rowData = rowDatas[r];
        var order = rowData.order;
        result[order] = table.splitOrder_detail(rowData,true);
    }
    return result;
}

function mergeOrders(rowDatas) {
    var result = {};
    for(var r in rowDatas) {
        var rowData = rowDatas[r];
        var order = rowData.order;
        result[order] = table.splitOrder_detail(rowData,false);
    }
    return result;
}

function nestableChange() {
    /* on change event */
    var datas = $('.dd').nestable('serialize');
    var id ;
    var childrens = [];
    for(var i = 0; i < datas.length; i++){
        var data = datas[i];
        var children = data["children"];
        if(!children){ //第一层
            if(!data["sku"]){   //没有sku 跳过
                continue;
            }
            if(data instanceof Array)
                childrens.push(data);
            else{
                var d = [];
                d.push(data)
                childrens.push(d);
            }
        } else {
            childrens.push(children);
            if(!id || id == ''){
                id = data["id"].toString().split('-')[0];
            }
        }
    }

    if(!id)
        return;

    var newDatas = {};
    for(var i = 0; i < childrens.length; i++){
        var d = childrens[i];
        var key = id;
        if(i > 0)
            key += '-'+i;
        newDatas[key] = d;
    }
    $('#myModal').find('.dd-list').html(getContentHtml(newDatas));
}

download_data = function () {
    //get all data
    var table_data=table.getJQAllData();
    var type = "";
    if(xlsx.option.type == 1)
        type = "Taobao";
    else if(xlsx.option.type == 2)
        type = "Enring";
    else if(xlsx.option.type == 3)
        type = "Weimob";


    if(!checkExpress(table_data)){
        return;
    }

    var expData = splitExpData(table_data);

    if(expData && expData.ftd.length > 0) {
        xlsx.downloadExl(xlsx.new_express_data(expData.ftd),"xlsx",month + "." + date + "富腾达_"+type + ".xlsx",false);
        xlsx.downloadExl(xlsx.new_detail_data(expData.ftd),"xlsx",month + "." + date + "New订单[富腾达]_"+type + ".xlsx",false);
    }

    if(expData && expData.sf.length > 0) {
        xlsx.downloadExl(xlsx.new_express_data(expData.sf),"xlsx",month + "." + date + "顺丰_"+type + ".xlsx",false);
        xlsx.downloadExl(xlsx.new_detail_data(expData.sf),"xlsx",month + "." + date + "New订单[顺丰]_"+type + ".xlsx",false);
    }
    /*
    if($('#accordionOne')) {
        $('#accordionOne').trigger("click");
    }
    if(myDropzone)
        myDropzone.removeAllFiles();
    */

}

change_3pl = function () {

    var is3pl = "false";
    if($('#3pl div span').hasClass("btn-yellow")){
        console.info("has Class")
        $('#3pl div span').addClass('info');
        $('#3pl div span').removeClass('btn-yellow');
        is3pl = "true";
    }else {
        console.info("No Class")
        $('#3pl div span').addClass('btn-yellow');
        $('#3pl div span').removeClass('info');
    }

    var table_data=table.getJQAllData();
    jQuery(table_data).each(function(){
        this.is3pl = is3pl;
    })
    table.setTableData(table_data);
}

change_row_3pl = function (rowId) {
    var rowData = jQuery(grid_selector).jqGrid("getRowData",rowId);
    var is3pl = rowData.is3pl;
    if(is3pl == "true")
        is3pl = "false";
    else
        is3pl = "true";

    jQuery(grid_selector).setCell(rowId,'is3pl',is3pl);
}

var table = {};
table.getJQAllData = function () {
    var o = jQuery(grid_selector);
    //获取当前显示的数据
    var rows = o.jqGrid('getRowData');
    var rowNum = o.jqGrid('getGridParam', 'rowNum'); //获取显示配置记录数量
    var total = o.jqGrid('getGridParam', 'records'); //获取查询得到的总记录数量
    var page = o.jqGrid('getGridParam','page');

    //设置rowNum为总记录数量并且刷新jqGrid，使所有记录现出来调用getRowData方法才能获取到所有数据
    o.jqGrid('setGridParam', { rowNum: total ,page:1}).trigger('reloadGrid');
    var rows = o.jqGrid('getRowData');  //此时获取表格所有匹配的

    /*var rows = [];
    var ids = $("#grid-table").jqGrid("getGridParam", "selarrrow");
    //遍历访问这个集合
    $(ids).each(function (index, id) {
        //由id获得对应数据行
        var row = $("#grid-table").jqGrid('getRowData', id);
        rows.push(row);
    }*/

    o.jqGrid('setGridParam', { rowNum: rowNum ,page:page}).trigger('reloadGrid'); //还原原来显示的记录数量
    return rows;
};

table.splitOrder_detail = function (rowData,isSplit) {
    var contents = rowData.content;
    var sender = rowData.sender;
    var is3pl = rowData.is3pl;
    var expresstype = rowData.expresstype;
    var name = rowData.name;
    var phone = rowData.phone;
    var id_num = rowData.id_num;


    var goods = contents.split('<br>');
    var details = [];
    for(var i = 0; i < goods.length ; i++){
        var good = goods[i];
        if(!good || good == '')
            continue;
        var c = good.split(';');
        var sku = c[1];
        var content = c[0].split(' X ')[0].trim();
        var num = c[0].split(' X ')[1].trim();

        if(isSplit) {
            for (var n = 0; n < Number(num); n++) {
                var item = {};
                item.content = content;
                item.name = name;
                item.phone = phone;
                item.id_num = id_num;
                item.sku = sku;
                item.num = 1;
                item.sender = sender;
                item.is3pl = is3pl;
                item.expresstype = expresstype;
                details.push(item);
            }
        }else {
            var item = {};
            item.content = content;
            item.sku = sku;
            item.num = num;
            item.sender = sender;
            item.is3pl = is3pl;
            details.push(item);
        }

    }
    return details;
}


table.split_order = function () {

    var split_datas = $('.dd').nestable('serialize');
    if(!checkSplipOrder(split_datas)){
        var text = "检测到有同一商品被拆分到不同订单:<br><br>是否继续拆分订单<br><br>";
        text += '<button type="button" onclick="cancelUpdate()" class="btn btn-white btn-pink btn-sm">No</button>';
        text += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        text += '<button type="button" onclick="goUpdate()" class="btn btn-white btn-success btn-sm">Yes</button>';

        $.gritter.add({
            title: '确认拆单',
            text: text,
            class_name: 'gritter-info gritter-center gritter-light'
        });
        return;
    }

    goUpdate();
};

table.merge_order = function () {
    var datas = $('.dd').nestable('serialize');

    var obj = table.getJQAllData();

    var rowDatas = [];
    jQuery(obj).each(function(){
        var isAdd = false;
        for(var i = 0; i < datas.length; i++){
            var data = datas[i];
            if(this.order.toString() === data.id.toString()) {

                isAdd = true;
                if(i == 0) {
                    var d = this;
                    d.order = "";

                    var allChilren = [];
                    for(var i = 0; i < datas.length; i++){
                        var data = datas[i];
                        var children = data["children"];
                        for(let i = 0; i < children.length; i++){
                            allChilren.push(children[i]);
                        }
                        d.order += data.id;
                        if(i != datas.length -1)
                            d.order += ";";
                    }

                    var merge_data = table.merge(allChilren);
                    d.content = merge_data.content;
                    d.num = merge_data.num;
                    rowDatas.push(d);
                }
            }
        }

        if(!isAdd)
            rowDatas.push(this);
    });

    $('.modal').modal('hide');
    table.setTableData(rowDatas);
}


cancelUpdate = function () {
    $.gritter.removeAll();
}

goUpdate = function () {
    var datas = $('.dd').nestable('serialize');
    var rowDatas = [];
    // var obj=$(grid_selector).jqGrid("getRowData");
    var obj = table.getJQAllData();
    var order = datas[0].id.toString();
    var isAdd = false;
    var o = order.split("-")[0];
    jQuery(obj).each(function(){
        if(this.order.indexOf(o) > -1 ){
            if(!isAdd){
                for(var i = 0; i < datas.length; i++){
                    var data = datas[i];
                    var children = data["children"];
                    var d = {};
                    d.order = data.id;
                    var merge_data = table.merge(children);
                    d.content = merge_data.content;
                    d.num = merge_data.num;
                    d.name = this.name;
                    d.address = this.address;
                    d.phone = this.phone;
                    d.id_num = this.id_num;
                    d.sender = this.sender;
                    rowDatas.push(d);
                }
                isAdd = true;
            }
        }else {
            rowDatas.push(this);
        }
    });

    $('.modal').modal('hide');
    $.gritter.removeAll();
    table.setTableData(rowDatas);
}


checkSplipOrder = function(datas) {
    for (var i = 0; i < datas.length; i++){
        var data = datas[i];
        var children = data["children"];

        for (let j = 0; j < datas.length; j++) {
            if(i == j)
                continue;

            var next_data = datas[j];
            var next_children = next_data["children"];

            for (var k = 0; k < children.length; k++) {
                let sku = children[k].sku;
                for (var l = 0; l < next_children.length; l++) {
                    let next_sku = next_children[l].sku;
                    if(sku === next_sku) {
                        return false;
                    }
                }
            }
        }
    }

    return true;
}


table.merge = function (data) {
    var content = "";
    var num = 0 ;
    var merge = {};
    for(var c = 0; c < data.length; c ++){
        var child = data[c];
        num += parseInt(child.num);
        var childData = merge[child.sku];
        if(!childData) {
            childData = child;
        }else {
            childData.num = parseInt(childData.num) + parseInt(child.num);
        }
        merge[child.sku] = childData;
    }

    for(var item in merge){
        var mergeData = merge[item];
        content += mergeData.content +" X " + mergeData.num +";" + mergeData.sku + "<br/>";
    }

    var merge_data = {};
    merge_data.num = num;
    merge_data.content = content;
    return merge_data;
}

table.setTableData = function (data) {

    data = table.isMergeOrder(data);

    var page = jQuery(grid_selector).jqGrid('getGridParam','page');
    // var rowNum = o.jqGrid('getGridParam', 'rowNum'); //获取显示配置记录数量

    $(grid_selector).setGridParam({ datastr: data, datatype:'jsonstring' ,page:1}).trigger('reloadGrid');
// .jqgrow td

    jQuery(grid_selector).jqGrid('setGridParam', { page:page}).trigger('reloadGrid'); //还原原来显示的记录数量

/*
    $('.ui-jqgrid tr.jqgrow td').css(
        {
            "text-overflow":"ellipsis",
            "white-space":"normal !important",
            "height":"auto"});
*/

    if(jQuery('#accordionTwo').attr("class")) {
        if (jQuery('#accordionTwo').attr("class").indexOf("collapsed") > 0) {
            $('#accordionTwo').trigger("click");
        }
    }
}

table.showMissOrder = function (data,title,time) {

    let text = "<ol>";
    jQuery(data).each(function () {
        if(this && this != ""){
            text+= "<li>"+this+"</li>";
        }
    });
    text += "</ol>";

    $.gritter.add({
        title: title,
        text: text,
        // image: $path_assets+'/avatars/avatar.png',
        sticky: true,
        time: time,
        class_name: 'gritter-error gritter-light'
    });
}

table.getRelatedRowData = function(rowData) {
    //
    var rowDatas = [];
    // var obj=$(grid_selector).jqGrid("getRowData");
    var obj = table.getJQAllData();
    var order = rowData.order;

    var o = order.split("-")[0];
    jQuery(obj).each(function(){
        if(this.order.indexOf(o) > -1){
            rowDatas.push(this);
        }
    });

    return rowDatas;
}

table.getSameRowData = function (rowData) {
    var rowDatas = [];
    var datas = table.getJQAllData();
    rowDatas.push(rowData);

    jQuery(datas).each(function(){
        if(rowData.name == this.name &&
            rowData.address == this.address &&
            rowData.phone == this.phone &&
            rowData.order.toString().split('_')[0] != this.order.toString().split('_')[0])
            rowDatas.push(this);
    });

    return rowDatas;
}


table.isMergeOrder = function (datas) {
    for (let i = 0; i < datas.length; i++) {
        let data = datas[i];
        data.option = {};
        data.option.isMerge = 0;
        for (let j = 0; j < datas.length; j++) {
            if(i == j)
                continue;
            let check_data = datas[j];
            if(data.name == check_data.name &&
                data.address == check_data.address && data.phone == check_data.phone &&
                data.order.toString().split('-')[0] != check_data.order.toString().split('-')[0]) {
                data.option.isMerge = 1;
            }
        }
    }
    return datas;
}


function subString(str, len) {
    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.replace(chineseRegex,"**").length;
    for(var i = 0;i < strLength;i++) {
        singleChar = str.charAt(i).toString();
        if(singleChar.match(chineseRegex) != null) {
            newLength += 2;
        }else {
            newLength++;
        }
        if(newLength > len) {
            break;
        }
        newStr += singleChar;
    }
    if(strLength > len) {
        // newStr += "...";
    }
    return newStr;
}

selectExp = function (rowId,expId) {
    var rowData = jQuery(grid_selector).jqGrid("getRowData",rowId);
    rowData.expresstype = ""+expId;
    jQuery(grid_selector).jqGrid("setRowData",rowId,rowData);

}

checkExpress = function (datas) {
    if(datas == null || !datas){
        return false;
    }

    var miss = [];
    for (let i = 0; i < datas.length; i ++) {
        var  data = datas[i];
        if(!data.expresstype || data.expresstype == "") {
            miss.push(data.order);
        }
    }

    if(miss.length > 0) {
        table.showMissOrder(miss,'部分订单没有选择物流,请点击发货物流',10);
        return false;
    }

    return true;
}

splitExpData = function (datas) {

    if(datas == null || !datas){
        return false;
    }

    var expData = {};
    expData.ftd = [];
    expData.sf = [];

    for (let i = 0; i < datas.length; i ++) {
        var  data = datas[i];
        if(data.expresstype === "1") {
            expData.ftd.push(data);
        }else {
            expData.sf.push(data);
        }
    }

    return expData;
}

change_express = function () {
    var isSF = true;
    if($('#express div span').hasClass("fa-bookmark-o")){
        $('#express div span').addClass('fa-bookmark');
        $('#express div span').removeClass('fa-bookmark-o');
        isSF = false;
    }else {
        $('#express div span').addClass('fa-bookmark-o');
        $('#express div span').removeClass('fa-bookmark');
    }

    var table_data=table.getJQAllData();
    jQuery(table_data).each(function(){
        this.expresstype = isSF ? "1" : "2";
    })
    table.setTableData(table_data);
}

/*
$('.switch-field-1').attr('checked' , 'checked').on('click', function(){
    $('.switch-field-1 .btn').toggleClass('no-border');
});
*/