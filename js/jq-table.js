
var grid_data = {};
jQuery(grid_selector).jqGrid({
    data: grid_data,
    datatype: "local",
    height: '600',
    colNames:['','订单编号','商品名称','数量', '收件人', '电话','身份证','地址'],
    colModel:[
        {name:'option',width:10,sortable:false, align:"center",editable:false,
            formatter:function (cellvalue, options, rowObject) {

                var detail="<a id='splitorder' data-toggle=\"modal\" href='#' data-target=\"#myModal\" data-original-title=\"拆分订单\" data-whatever="+options.rowId+"><i class=\"ui-icon ace-icon fa fa-plus-circle purple\"></i></a>"
                    ;
                return detail;
            }
        },
        {name:'order',index:'order', width:60, sorttype:"int", editable: false},
        {name:'content',index:'content',width:200, editable:false},
        {name:'num',index:'num', width:20,editable: false},
        {name:'name',index:'name', width:70, editable: false,hidden:true},
        {name:'phone',index:'phone', width:90, editable: false,hidden:true},
        {name:'id_num',index:'id_num', width:90, editable: false,hidden:true},
        {name:'address',index:'address', width:150, sortable:false,editable:false,hidden:true}
    ],

    viewrecords : false,
    autowidth: true,
    rowNum:10,
    pgbuttons:true,
    page: 1,
    rowList:[5,10,20],
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
    },

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
    /**
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
     */
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

function setTableData(data) {
    var page = jQuery(grid_selector).jqGrid('getGridParam','page');
    // var rowNum = o.jqGrid('getGridParam', 'rowNum'); //获取显示配置记录数量

    $(grid_selector).setGridParam({ datastr: data, datatype:'jsonstring' ,page:1}).trigger('reloadGrid');

    $('.ui-jqgrid tr.jqgrow td').css("text-overflow","ellipsis");

    jQuery(grid_selector).jqGrid('setGridParam', { page:page}).trigger('reloadGrid'); //还原原来显示的记录数量

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
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.

    var rowData = jQuery(grid_selector).jqGrid("getRowData",rowId);
    var modal = $(this);
    var title = "拆分订单";
    var order = rowData.order;
    //var footer = "";

    var rowDatas = getRelatedRowData(rowData);
    var orders = splitOrders(rowDatas);
    var body = getContentHtml(orders);

    modal.find('.modal-title').text(title);
    modal.find('.dd-list').html(body);


});

showMissOrder = function (data,title) {

    let text = "<ol>";
    jQuery(data).each(function () {
        text+= "<li>"+this+"</li>";
    });
    text += "</ol>";

    $.gritter.add({
        title: title,
        text: text,
        // image: $path_assets+'/avatars/avatar.png',
        sticky: true,
        time: '',
        class_name: 'gritter-error gritter-light'
    });
}

function getContentHtml(datas) {
    if(!datas)
        return;

    var content_hteml = '';
    content_hteml += ""
    for(var item in datas){
        var data = datas[item];
        content_hteml += "<li class=\"dd-item\" data-id='"+item+"'>";
        content_hteml += "<div class=\"dd-handle\">"+item+"</div>";
        content_hteml += "<ol class=\"dd-list\">";
        for(var i = 0; i < data.length; i++){
            var d = data[i];
            content_hteml += "<li class=\"dd-item\" data-id='"+d.sku+"' data-sku='"+d.sku+"' data-content='"+d.content+"' data-num='"+d.num+"'>";
            content_hteml += "<div class=\"dd-handle\">"+d.content + ' X ' + d.num + "</div>"
            content_hteml += "</li>";
        }
        content_hteml += "</ol></div></li>";
    }
    return content_hteml;
}

function getRelatedRowData(rowData) {
    //
    var rowDatas = [];
    var obj=$(grid_selector).jqGrid("getRowData");
    var order = rowData.order;

    var o = order.split("-")[0];
    jQuery(obj).each(function(){
        if(this.order.indexOf(o) > -1){
            rowDatas.push(this);
        }
    });

    return rowDatas;
}

function splitOrders(rowDatas) {
    var result = {};
    for(var r in rowDatas){
        var rowData = rowDatas[r];
        var order = rowData.order;
        var contents = rowData.content;
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

            for(var n = 0; n < Number(num) ; n++){
                var item = {};
                item.content = content;
                item.sku = sku;
                item.num = 1;
                details.push(item);
            }
        }
        result[order] = details;
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
        }else {
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

function getJQAllData() {
    var o = jQuery(grid_selector);
    //获取当前显示的数据
    var rows = o.jqGrid('getRowData');
    var rowNum = o.jqGrid('getGridParam', 'rowNum'); //获取显示配置记录数量
    var total = o.jqGrid('getGridParam', 'records'); //获取查询得到的总记录数量
    var page = o.jqGrid('getGridParam','page');

    //设置rowNum为总记录数量并且刷新jqGrid，使所有记录现出来调用getRowData方法才能获取到所有数据
    o.jqGrid('setGridParam', { rowNum: total ,page:1}).trigger('reloadGrid');
    var rows = o.jqGrid('getRowData');  //此时获取表格所有匹配的

    o.jqGrid('setGridParam', { rowNum: rowNum ,page:page}).trigger('reloadGrid'); //还原原来显示的记录数量
    return rows;
}

function split_order() {
    var rowDatas = [];
    // var obj=$(grid_selector).jqGrid("getRowData");
    var obj = getJQAllData();
    var datas = $('.dd').nestable('serialize');
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
                    var content = "";
                    var num = 0 ;
                    var merge = {};
                    for(var c = 0; c < children.length; c ++){
                        var child = children[c];
                        num += parseInt(child.num);
                        var childData = merge[child.sku];
                        if(!childData) {
                            childData = child;
                        }else {
                            childData.num += parseInt(child.num);
                        }
                        merge[child.sku] = childData;
                    }

                    for(var item in merge){
                        var mergeData = merge[item];
                        content += mergeData.content +" X " + mergeData.num +";" + mergeData.sku + "<br/>";
                    }

                    d.content = content;
                    d.num = num;
                    d.name = this.name;
                    d.address = this.address;
                    d.phone = this.phone;
                    d.id_num = this.id_num;
                    rowDatas.push(d);
                }
                isAdd = true;
            }
        }else {
            rowDatas.push(this);
        }
    });

    $('.modal').modal('hide');
    setTableData(rowDatas);
}

function download_data() {
    //get all data
    var obj=getJQAllData();
    downloadExl(format_data(obj),"xlsx",month + "." + date + "微商城-Enring" + ".xlsx");
    downloadExl(createDetailData(obj),"xlsx",month + "." + date + "New订单" + ".xlsx");
    $("#accordionThree").trigger("click");

}

