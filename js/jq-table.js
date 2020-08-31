
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

var grid_data = {};
jQuery(grid_selector).jqGrid({
    data: grid_data,
    datatype: "local",
    height: '600',
    width: '100%',
    colNames:['','订单编号','商品名称','数量','发件人','sender','is3pl','收件人' ,'电话','身份证','地址','备注','物流','expresstype'],
    colModel:[
        {name:'option',width:20,sortable:false, align:"center",editable:false,
            formatter:function (cellvalue, options, rowObject) {

                var detail = '<div style="text-align: center;font-size: 20px">';
                if(rowObject.num > 11) {
                    detail +='<a id="autosplitorder" style="margin: 2px;" data-toggle="modal" href="#" data-target="#myModal" data-original-title="自动拆分订单" data-type="autosplit" data-whatever='+options.rowId+'>';
                    detail += '<i class="ui-icon ace-icon fa fa-plus-circle red"></i>';
                }
                else if (11 >= rowObject.num && rowObject.num > 7) {
                    detail +='<a id="splitorder" style="margin: 2px;" data-toggle="modal" href="#" data-target="#myModal" data-original-title="拆分订单" data-type="split" data-whatever='+options.rowId+'>';
                    detail += '<i class="ui-icon ace-icon fa fa-plus-circle orange"></i>';
                } else {
                    detail +='<a id="splitorder" style="margin: 2px;" data-toggle="modal" href="#" data-target="#myModal" data-original-title="拆分订单" data-type="split" data-whatever='+options.rowId+'>';
                    detail += '<i class="ui-icon ace-icon fa fa-plus-circle green"></i>';

                }
                detail += "</a>";

                if(cellvalue.isMerge === 1) {
                    detail += '<a id="mergeOrder" style="text-decoration: none;margin: 2px;" data-toggle="modal" href="#" data-target="#myModal" data-original-title="合并订单" data-type="merge" data-whatever='+options.rowId+'>';
                    detail += '<span class="ui-icon iconfont ace-icon icon-hebing"></span>';
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
            /**
            if(!rowObject.sender || rowObject.sender == ''){
                rowObject.sender == "3PL"
                return "3PL";
            }
            */
           if(rowObject.sender === undefined)
                rowObject.sender = "";
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
        {name:'address',index:'address', width:50, sortable:false,editable:false,hidden:true},
        {name:'remark',index:'remark', width:50, sortable:false,editable:false,hidden:false},
        {name:'express',width:35, editable:false,
            formatter:function (cellvalue, options, rowObject) {
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

                value+='<label class="btn btn-sm btn-white btn-info '+(rowObject.expresstype === "3"?'active':'')+'" onclick="selectExp('+options.rowId+',3)">';
                value+='<input type="radio" value="3" />';
                value+='<span class="iconfont icon-cheng"></span>';
                value+='</label>';

                value+='<label class="btn btn-sm btn-white btn-info '+(rowObject.expresstype === "4"?'active':'')+'" onclick="selectExp('+options.rowId+',4)">';
                value+='<input type="radio" value="4" />';
                value+='<span class="iconfont icon-naifen"></span>';
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
    id:'ftd',
    caption: "",
    title:"富腾达快递",
    buttonicon: "iconfont icon-wuliu table-buttom blue",
    onClickButton: function () {
        //
        change_express("1");
    },
    position: "last"

}).navButtonAdd(pager_selector,{
    id:'sf',
    caption: "",
    title:"顺丰物流",
    // buttonicon: "ace-icon fa-bookmark-o",
    buttonicon: "iconfont icon-tianmaoshunfengbaoyou table-buttom blue",
    onClickButton: function () {
        //
        change_express("2");
    },
    position: "last"

}).navButtonAdd(pager_selector,{
    id:'cg',
    caption: "",
    title:"程光物流",
    // buttonicon: "ace-icon fa-bookmark-o",
    buttonicon: "iconfont icon-cheng blue",
    onClickButton: function () {
        change_express("3");
    },
    position: "last"

}).navButtonAdd(pager_selector,{
    id:'milk',
    caption: "",
    title:"奶粉订单",
    // buttonicon: "ace-icon fa-bookmark-o",
    buttonicon: "iconfont icon-naifen blue",
    onClickButton: function () {
        //
        change_express("4");
    },
    position: "last"

}).navSeparatorAdd(pager_selector,{sepclass : "ui-separator",sepcontent: ''
}).navButtonAdd(pager_selector,{
    caption: "",
    title:"Download",
    buttonicon: "ace-icon fa fa-download table-buttom purple",
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

initGift = function () {
    var gift_role = sessionStorage.getItem("_giftrole")
    if(!gift_role || gift_role == '') {
        xlsx.init_gifr_role();
    }
}

getGift = function () {
    var giftString = sessionStorage.getItem("_giftrole");
    var gift = null;
    if(giftString){
        gift = JSON.parse(giftString);
    }
    console.log('Gift',gift);
    return gift[mee.getBizId()];
}

gift_data = function () {

    var gifts = getGift();
    if(!gifts){
        toastr.error("缺少配置文件，请联系管理员");
        return;
    }
    //1、获取所以订单
    var all_data = table.getJQAllData();

    var isAddGift = false;
    //2、匹配
    jQuery(all_data).each(function () {
        var add_gifts = match_gift(this,gifts);
        if(add_gifts && add_gifts.length > 0){
            //merge gift
            var gift_content = "";
            var gift_num = 0;
            for(let i in add_gifts) {
                var add_gift = add_gifts[i];
                var add_content = add_gift.name+" X "+parseInt(add_gift.num)+";"+add_gift.sku+"<br>";
                gift_content += add_content;
                gift_num = parseInt(gift_num) + parseInt(add_gift.num);
            }
            this.content += "<br><br>"+gift_content;
            this.num = parseInt(this.num) + parseInt(gift_num);

            isAddGift = true;
        }
    });

    //3、刷新
    if(isAddGift)
        table.setTableData(all_data);

};


match_gift = function (row_data,gifts) {
    var add_gift = null;
    var datas = table.splitOrder_detail(row_data);
    /*
    var prudict_skus = [];
    jQuery(datas).each(function () {
        prudict_skus.push(this.sku);
    });
    */
    var match_gift;
    for(let i in gifts){
        var gift = gifts[i];
        var num = intersectNum(datas,gift.skus);
        if(num >= gift.num) {
            match_gift = gift;
            break;
        }
    }

    if(match_gift) {
        add_gift = [];
        var gift_pruducts = match_gift.gift;
        if(gift_pruducts && gift_pruducts.length > 0) {
            jQuery(gift_pruducts).each(function () {
                let gift_detail = this.split(";");
                if(gift_detail && gift_detail.length > 0){
                    var g = {};
                    g.sku = gift_detail[0];
                    g.name = gift_detail[1].split('X')[0];
                    g.num = gift_detail[1].split('X')[1];
                    add_gift.push(g);
                }
            });
        }
    }

    return add_gift;
}

intersectNum = function (order,giftSKU) {
    if(!order || !giftSKU)
        return 0;

    var num = 0;
    for(let i in order){
        var sku = order[i].sku.replace(/[\r\n]/g,"");
        for(let v in giftSKU){
            let g_sku = giftSKU[v].replace(/[\r\n]/g,"");
            if(g_sku.toString() === sku.toString()) {
                num += order[i].num;
                break;
            }
        }
    }

    return num;
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
    $('.ui-pg-button div .iconfont').removeClass('ui-icon');
    $('.icon-cheng').css("margin-top","-1px");

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


$('#myModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var rowId = button.data('whatever') // Extract info from data-* attributes
    var type = button.data('type')
    var modal = $(this);

    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    setModal(modal,rowId,type);
});

setModal = function (modal,rowId,type) {
    var rowData = jQuery(grid_selector).jqGrid("getRowData",rowId);
    var title = "";
    var body = null;
    var footer = '<button type="button" class="btn btn-default btn-sm" data-dismiss="modal">关闭</button>';
    if(type == 'split') {
        title = "拆分订单";
        let orders = splitOrders(table.getRelatedRowData(rowData));
        body = getContentHtml(orders);
        footer += '<button id="splitOrder" onclick="table.split_order()" type="button" class="btn btn-success btn-sm">确认拆分</button>';

        modal.find('.dd-list').html(body);
        modal.find('.dd-list').show();
        modal.find('.row').hide();
        $(".dd").css("pointer-events","");

    }else if (type == 'autosplit') {
        title = "自动拆分订单";

        // body = '<div class="row">';
        body = '<div class="form-group">';
        body +='    <label class="col-sm-3 control-label no-padding-right" for="form-field-1"> 包裹内商品最大数量 </label>';
        body +='    <div class="col-sm-9">';
        body +='        <input type="text" id="autosplitbtn" placeholder="number" class="col-xs-10 col-sm-5" />';
        body +='    </div>';
        body +='</div>';
        // body +='</div>';

        modal.find('.row').html(body);
        modal.find('.dd-list').hide();
        modal.find('.row').show();

        footer += '<button id="splitOrder" onclick="get_split_order('+rowId+',\'split\')" type="button" class="btn btn-info btn-sm">手动拆分</button>';
        footer += '<button id="splitOrder" onclick="table.auto_split_order('+rowId+')" type="button" class="btn btn-success btn-sm">确认拆分</button>';

    }
    else {
        title = "合并订单";
        let orders = mergeOrders(table.getSameRowData(rowData));
        body = getContentHtml(orders);
        footer += '<button id="mergeOrder" onclick="table.merge_order()" type="button" class="btn btn-success btn-sm">确认合并</button>';

        modal.find('.dd-list').html(body);
        modal.find('.dd-list').show();
        modal.find('.row').hide();
        $(".dd").css("pointer-events","none");
    }
    // var order = rowData.order;

    // modal.find('.modal-body').html(body);
    modal.find('.modal-title').text(title);
    modal.find('.modal-footer').html(footer);
}

get_split_order = function (rowId,type) {
    $('#myModal').hide();
    setModal($('#myModal'),rowId,type);
    $('#myModal').show();
}

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
            let content = d.content.replace('\'',"");
            content_hteml += "<li class=\"dd-item\" data-id='"+d.sku+"' data-sku='"+d.sku+"' data-content='"+d.content+"' data-num='"+d.num+"' data-sender='"+d.sender+"' data-expresstype='"+d.expresstype+"'>";
            content_hteml += '<div class="dd-handle">'+ content + ' X ' + d.num + '</div>';
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
        if(childrens.length > 1) {
            key += '-' + i;
        }
        newDatas[key] = d;
    }
    $('#myModal').find('.dd-list').html(getContentHtml(newDatas));
}

download_data = function () {
    //get all data
    var table_data = table.getJQAllData();
    var type = "";
    if(xlsx.option.type == 1)
        type = "Taobao";
    else if(xlsx.option.type == 2)
        type = "Enring";
    else if(xlsx.option.type == 3) {
        const orderIds = table_data.map(item => item.order.split('-')[0]);
        flagWeimobOrder(orderIds);
        type = "Weimob";
    }
    else if(xlsx.option.type == 4)
        type = "19Mini";

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

    if(expData && expData.cg.length > 0) {

        downloadCgData(expData.cg);
    }

    if(expData && expData.milk.length > 0) {
        xlsx.downloadExl(xlsx.new_milk_data(expData.milk),"xlsx",month + "." + date + "奶粉_"+type + ".xlsx",false);
    }

}

downloadCgData = function(cgExpData) {
    let data = xlsx.new_OnlineChengguang_data(cgExpData);
    console.log("NewChengguang: ", cgExpData);

    let url = $chengguang_order_url + '/' + mee.getBizId();

    sendJData(url,JSON.stringify(data),true,function (data) {
        if(data.statusCode === 0) {
            let flywayOrder = data.data;
            let express_data = getCgExpData(flywayOrder);
            let detail_data = xlsx.new_detail_data(cgExpData);
            console.log('express_data',express_data);
            console.log('detail_data',detail_data);
           
            var download_data = pre_down_data(getDetailData(detail_data), express_data);
            console.log('download_data',download_data);

            xlsx.downloadExl(download_data,"csv",month + "." + date + "MEE-Import-CG" + ".csv",true);
           
        } else if(data.statusCode === 11813 || data.statusCode === 11814) {
            toastr.error("添加失败！", data.description);
            $('#cgModal').modal('show');
        } else {
            toastr.error("添加失败！");
        }
    })
}

getCgExpData = function (datas) {
    var express_data = {};
    for(var i = 0; i<datas.length; i++){
        var d = datas[i];
        if(!d["remark"])
            continue;
        
        let order = d["remark"].toString().replace(reg, "").trim();
        let item = {};
        item.express = d["orderNumber"];
        item.content = d["productName"];
        item.sender = d["senderName"];
        express_data[order.toUpperCase()] = item;
    }
    return express_data;

}

change_3pl = function () {

    var is3pl = "false";
    if($('#3pl div span').hasClass("btn-yellow")){
        $('#3pl div span').addClass('info');
        $('#3pl div span').removeClass('btn-yellow');
        is3pl = "true";
    }else {
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
    for(var i = 0; i < goods.length ; i++) {
        var good = goods[i];
        if(!good || good == '')
            continue;

        var c = good.split(';');
        var sku = c[1];
        var content = c[0].split(' X ')[0].trim();
        let number = c[0].split(' X ')[1].trim();

        if(isSplit) {
            for (var n = 0; n < Number(number); n++) {
                const item = {};
                item.content = content;
                item.name = name;
                item.phone = phone;
                item.id_num = id_num;
                item.sku = sku;
                item.num = "1";
                item.sender = sender;
                item.is3pl = is3pl;
                item.expresstype = expresstype;
                details.push(item);
            }
        }else {
            const item = {};
            item.content = content;
            item.sku = sku;
            item.num = number;
            item.sender = sender;
            item.is3pl = is3pl;
            item.name = name;
            item.phone = phone;
            item.id_num = id_num;
            item.expresstype = expresstype;
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

table.auto_split_order = function (rowId) {
    var rowData = jQuery(grid_selector).jqGrid("getRowData",rowId);

    var num = $('#autosplitbtn').val();

    if( Number(rowData.num) <= Number(num) ) {
        $('.modal').modal('hide');
    } else {
        var datas = table.splitOrder_detail(rowData,false);
        let n = Math.ceil(rowData.num / num);
        let newData = [];
        for (let i = 0; i < n; i++) {
            let order = auto_split_order(datas,num);
            datas = removeOrder(order,datas);

            var mergeOrder = {};
            mergeOrder.sender = rowData.sender;
            mergeOrder.order = rowData.order + ('-'+i);
            mergeOrder.is3pl = rowData.is3pl;
            mergeOrder.name = rowData.name;
            mergeOrder.phone = rowData.phone;
            mergeOrder.id_num = rowData.id_num;
            mergeOrder.address = rowData.address;
            mergeOrder.remark = rowData.remark;
            mergeOrder.expresstype = rowData.expresstype;


            let newNum = 0;
            let content = "";
            for(let k = 0; k < order.length; k++) {
                let newOrder = order[k];
                newNum += (Number(newOrder.num));
                content += (newOrder.content + ' X ' + newOrder.num + ";" + newOrder.sku);
                if(k != order.length -1)
                    content += "<br>";
            }
            mergeOrder.num = newNum;
            mergeOrder.content = content;
            newData.push(mergeOrder);
        }

        var rowDatas = [];
        var obj = table.getJQAllData();

        jQuery(obj).each(function() {
            if(this.order === rowData.order) {
                for (let i = 0; i < newData.length; i++) {
                    rowDatas.push(newData[i]);
                }
            }else {
                rowDatas.push(this);
            }
        });


        $('.modal').modal('hide');
        table.setTableData(rowDatas);
    }

};


table.submitCg = function() {
    let username = $('#username').val();
    let pwd = $('#pwd').val();

    if (!username || !pwd) {
        toastr.error("请输入程光用户名或密码！");
        return;
    } 

    var url =  $chengguang_token_url + '/' + mee.getBizId();
    var data = "username="+ username +'&password='+pwd
    sendData(url,data,true,function(data) {
        if(data.statusCode == 0) {
            $('#cgModal').modal('hide');
            var table_data = table.getJQAllData();
            var expData = splitExpData(table_data);
            if(expData && expData.cg)
                downloadCgData(expData.cg);
        } else {
            toastr.error("授权失败, 请确认用户密码！");
        }
    });
}

removeOrder = function (orders,datas) {
    var filterDatas = [];
    for(let i = 0 ; i < datas.length ; i ++) {
        let data = Object.assign({}, datas[i]);;
        let removeOrder = null;
        for (let o = 0 ; o < orders.length; o ++) {
            let order = orders[o];

            if(order.sku === data.sku) {
                removeOrder = order;
                break;
            }
        }

        if(removeOrder == null) {
            filterDatas.push(data);
        } else {
            if(removeOrder.num == data.num) {
                continue;
            } else {
                data.num = data.num - removeOrder.num;
                filterDatas.push(data);
            }
        }
    }

    return filterDatas;
}


auto_split_order = function(datas,num) {
    datas = datas.sort(function (a,b) {
        if(Number(a.num) > Number(b.num))
            return -1;
        else  if (Number(a.num) == Number(b.num))
            return 0;
        else
            return 1;
    });

    var newDatas = [];
    var moreDatas = [];
    for(var i = 0; i < datas.length ; i++) {
        let data = datas[i];
        if(Number(data.num) > num) {
            moreDatas.push(data);
        } else if (Number(data.num) <= num) {
            newDatas.push(data);
            num = Number(num) - Number(data.num);
        }
        if(num == 0)
            break;
    }

    if(num > 0 && moreDatas.length > 0) {
        //需要拆单
        let moreData = Object.assign({},moreDatas[0]);
        if(Number(moreData.num) > num) {
            moreData.num = num;
        }
        newDatas.push(moreData);
    }
    return newDatas;
}


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
                    d.remark = this.remark;
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
        content += mergeData.content +" X " + mergeData.num +";" + mergeData.sku + "<br>";
    }

    var merge_data = {};
    merge_data.num = num;
    merge_data.content = content;
    return merge_data;
}

table.setTableData = function (data) {
    for (let i = 0; i < data.length; i++) {
        let d = data[i];
        d.content = d.content.replace('\''," ").replace("'"," ");
        d.content = mergeOrder(d.content);
        d.address = d.address.replace(/[\r\n,，]/g,"");
    }
    data = table.isMergeOrder(data);
    // table.checkSku(data);

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
    initGift();

    if(jQuery('#accordionTable').attr("class")) {
        if (jQuery('#accordionTable').attr("class").indexOf("collapsed") > 0) {
            $('#accordionTable').trigger("click");
        }
    }
}

table.checkSku = function (datas) {
    var errorOrders = [];
    for (let i = 0; i < datas.length; i++) {
        let data = datas[i];
        let content = data.content;
        let products = content.split('<br>');
        let nullSku = false;
        for(let i = 0; i < products.length; i++) {
            let product = products[i];
            let d = product.split(';');
            if(d.length < 2 || d[1] == null || d[1] == "") {
                nullSku = true;
                break;
            }
        }

        if(nullSku == true) {
            errorOrders.push(data.order);
        }
    }

    if(errorOrders.length > 0) {
        table.showMissOrder(errorOrders,"以下订单缺少商品SKU,请添加商品SKU信息",'')
    }
}

mergeOrder = function(content) {
    let products = content.split('<br>');
    console.log(products);
    const skus = [];
    var result = "";
    for(let i = 0; i < products.length; i++) {
        let product = products[i];
        let d = product.split(';');
        if(d.length < 2 || d[1] == null || d[1] == "") {
           continue;
        }

        // 【C-5-1】Swisse Swisse 钙+VD 150粒 NZ不含GST X 5;9311770598170
        var c = d[0].split(' X ')[0];
        var n = Number(d[0].split(' X ')[1]);
        var s = d[1];
        let isMerge = false;

        if(skus.indexOf(s) >= 0) {
            continue;
        }
        for(let j = 0; j < products.length; j++) {
            if(i == j)
                continue;

            let np = products[j];
            let nd = np.split(';');
            if(nd.length < 2 || nd[1] == null || nd[1] == "") {
                continue;
            }
            let nc = nd[0].split(' X ')[0];
            let nn = nd[0].split(' X ')[1];
            let ns = nd[1];
            
            if(s === ns) {
                n += Number(nn);
                isMerge = true;
            }
        }

        if(isMerge) {
            skus.push(s);
        }
        result += c + " X " + n + ';' + s + '<br>'
    }
    console.log("result:" , result);
    return result;
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
    if(str == null || str == "")
        return str;

    var newLength = 0;
    var newStr = "";
    var chineseRegex = /[^\x00-\xff]/g;
    var singleChar = "";
    var strLength = str.toString().replace(chineseRegex,"**").length;
    for(var i = 0;i < strLength;i++) {
        singleChar = str.toString().charAt(i).toString();
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
    expData.cg = [];
    expData.milk = [];

    for (let i = 0; i < datas.length; i ++) {
        var  data = datas[i];
        if(data.expresstype === "1") {
            expData.ftd.push(data);
        } else if(data.expresstype === "2") {
            expData.sf.push(data);
        } else if(data.expresstype === "3") {
            expData.cg.push(data);
        } else if(data.expresstype === "4") {
            expData.milk.push(data);
        }
    }

    return expData;
}

change_express = function (expresstype) {
    var table_data=table.getJQAllData();
    jQuery(table_data).each(function(){
        this.expresstype = expresstype
    })
    table.setTableData(table_data);
}


flagWeimobOrder = function(orders) {
    const bizId = mee.getBizId();
    if(!bizId) {
        toastr.error("系统异常,请重新登录！");
        return;
    }

    var url = $weimob_orderFlag_url+'/'+bizId;

    sendJData(url, JSON.stringify(orders),true,function (calldata) {
        var code = calldata.statusCode;
        if(code == 0) {
            toastr.success("微盟订单已标记！");
        } else if (code == 118004) {
            toastr.error("授权失败,重新需要重新授权！");
        } else {
            toastr.error("系统错误,请稍后再试！");
        }
    })
}


/*
$('.switch-field-1').attr('checked' , 'checked').on('click', function(){
    $('.switch-field-1 .btn').toggleClass('no-border');
});
*/