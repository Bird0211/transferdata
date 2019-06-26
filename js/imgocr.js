import_data = function (myDropzone) {
    importdata(myDropzone);
}

importdata = function (obj) {
    var file = obj.files[0];
    var formData = new FormData();
    formData.append("file", file);

    sendFile($ocr_url,formData,true,function (data) {
        console.info(data);
    })

}

show_ocr = function (data) {
    console.info(data)
     var modal = $('#myModal');


    var title = "Character Recognition";
    var body = '<textarea class="autosize-transition form-control">'+data+'</textarea>';

    var footer = "<button type=\'button\' class=\'btn btn-default btn-sm\' data-dismiss=\'modal\'>关闭</button>";

    modal.find('.modal-title').text(title)
    modal.find('.modal-body').html(body)
    // modal.find('.modal-footer').html(footer)
    modal.modal('show');

    $('textarea[class*=autosize]').autosize({append: "\n"});
}



