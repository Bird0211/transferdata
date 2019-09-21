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
    colNames:['商品图片','商品ID','商品名称','SKU','重量','成本价','销售价','易云成本价','易云销售价','新成本价','新销售价'],
    colModel:[
        {name:'img',index:'img', width:30, sorttype:"int", editable: false,
            formatter:function (cellvalue, options, rowObject) {

                var content = '<a href="'+cellvalue+'" data-rel="colorbox" class="cboxElement">';
                    content += '<img width="100%" alt="150x150" src="'+cellvalue+'" />';
                    content += '</a>';

                return content;
            }},
        {name:'goodsId',index:'goodsId',width:35, editable:false},
        {name:'title',index:'title', width:150,editable: false},
        {name:'sku',index:'sku', width:40,editable: false},
        {name:'weight',index:'weight', width:40,editable: false},
        {name:'costPrice',index:'costPrice', width:20,editable: false},
        {name:'salesPrice',index:'salesPrice', width:20,editable: false},
        {name:'yiyunCostPrice',index:'costPrice', width:28,editable: false},
        {name:'yiyunSalesPrice',index:'salesPrice', width:28,editable: false},
        {name:'newCostPrice',index:'costPrice', width:28,editable: false},
        {name:'newSalePrice',index:'salesPrice', width:28,editable: false}

    ],
    cellEdit:true,
    cellsubmit:"clientArray",
    viewrecords : true,
    autowidth: true,
    rowNum:20,
    pgbuttons:true,
    page: 1,
    rowList:[10,20,50],
    pager : pager_selector,
    altRows: true,
    //toppager: true,

    multiselect: true,
    //multikey: "ctrlKey",
    multiboxonly: true,
    multiselectWidth:30,

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
function styleCheckbox(table) {

     $(table).find('input:checkbox').addClass('ace')
     .wrap('<label />')
     .after('<span class="lbl align-top" />')


     $('.ui-jqgrid-labels th[id*="_cb"]:first-child')
     .find('input.cbox[type=checkbox]').addClass('ace')
     .wrap('<label />').after('<span class="lbl align-top" />');
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

function enableTooltips(table) {
    $('.navtable .ui-pg-button').tooltip({container:'body'});
    $(table).find('.ui-pg-div').tooltip({container:'body'});
}

var $overflow = '';
var colorbox_params = {
    rel: 'colorbox',
    reposition:true,
    scalePhotos:true,
    scrolling:false,
    previous:'<i class="ace-icon fa fa-arrow-left"></i>',
    next:'<i class="ace-icon fa fa-arrow-right"></i>',
    close:'&times;',
    current:'{current} of {total}',
    maxWidth:'100%',
    maxHeight:'100%',
    onOpen:function(){
        $overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    },
    onClosed:function(){
        document.body.style.overflow = $overflow;
    },
    onComplete:function(){
        $.colorbox.resize();
    }
};

var table = {};

table.setTableData = function (data) {
    var page = jQuery(grid_selector).jqGrid('getGridParam','page');
    // var rowNum = o.jqGrid('getGridParam', 'rowNum'); //获取显示配置记录数量

    $(grid_selector).setGridParam({ datastr: data, datatype:'jsonstring' ,page:1}).trigger('reloadGrid');

    $('.ui-jqgrid tr.jqgrow td').css("text-overflow","ellipsis");

    jQuery(grid_selector).jqGrid('setGridParam', { page:page}).trigger('reloadGrid'); //还原原来显示的记录数量

    $('[data-rel="colorbox"]').colorbox(colorbox_params);

}

table.getSelData = function () {
    const ids = jQuery(grid_selector).jqGrid('getGridParam','selarrrow');
    var rowData = [];
    if(ids && ids.length > 0) {
        for(let i=0 ; i < ids.length; i++){
            var data  = $(grid_selector).jqGrid('getRowData',ids[i]);
            rowData.push(data);
        }
    }
    return rowData;
}