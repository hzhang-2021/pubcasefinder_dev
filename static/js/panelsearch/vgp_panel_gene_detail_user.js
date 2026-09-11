const URL_GET_GENE_DETAIL_DATA = "/sparqlist/api/pcf_get_gene_data_by_ncbi_gene_id?ncbi_gene_id=",
      URL_GET_GENE_TOOLTIP_DATA = "/sparqlist/api/pcf_get_gene_tooltip_data_by_ncbi_gene_id?ncbi_gene_id=",
      URL_GET_MONDO_ID_MATCH_GENE_SYMBOL = "/sparqlist/api/pcf_panel_get_mondo_id_match_gene_symbol_synonym_ncbiid?input_text=",
      URL_GET_MONDO_DATA = "/sparqlist/api/pcf_get_panel_data_by_mondo_id?mondo_id=";

var _isObject = function (value)  { return $.isPlainObject(value); },
    _isArray = function (value)   { return Array.isArray(value); },
    _isFunction = function(value) { return typeof value === "function"; },
    _isEmpty = function (value, allowEmptyString) {
        return (value === null) || (value === undefined) ||
               (!allowEmptyString ? value === '' : false) ||
               (_isArray(value) && value.length === 0) ||
               (_isObject(value) && Object.keys(value).length === 0);
    },
    _isExistVal = function (key, hash) {
        if (_isEmpty(hash)) return false;
        if (!(key in hash)) return false;
        return !_isEmpty(hash[key]);
    };


function _vgp_init_ui_panel_gene_data2(ncbi_gene_id,data_obj){
    [ 
        {key: 'synonym',           tid: 'vgp-td-synonym'},
        {key: 'other_full_name',   tid: 'vgp-td-otherfullname'},
        {key: 'ncbi_gene_summary', tid: 'vgp-td-summary'},
        {key: 'type_of_gene',      tid: 'vgp-td-genetype'},
        {key: 'location',          tid: 'vgp-td-location'}
    ].forEach((item) => {
        if(item.key in data_obj){
            let v = data_obj[item.key];
            if(_isArray(v)){
                v = v.join(', ');
            }
			$('#' + item.tid).text(v);
        }
    });

    if('ncbi_gene_url' in data_obj){
        $('<a>').addClass("vgp-link").text('NCBI:'+ncbi_gene_id)
                .attr({'href': data_obj.ncbi_gene_url, 'target': '_blank'})
                .prependTo($('#vgp-td-link'));
    }
}

function _vgp_init_ui_panel_gene_data3(gene_symbol, data_obj){

        let mondo_arr = data_obj['panel_data'];

        $('#vgp-panel-switch').text("Show("+mondo_arr.length+')').data('num',mondo_arr.length);

        let $tbl = $('#vgp-panel-table');
        for(let i=0; i< mondo_arr.length; i++){
            let mondo_id  = mondo_arr[i].mondo_id;
            let mondo_url = mondo_arr[i].mondo_url;
            let mondo_disease_name = mondo_arr[i].name_en;

            let $tr = $('<tr>').appendTo($tbl);
            let $td1 = $('<td>').addClass("vgp-rating-tag-wrapper").appendTo($tr);
            $('<span>').addClass("vgp-rating-tag vgp-rating-norating").text('No rating').appendTo($td1);
            let $td2 = $('<td>').addClass("vgp-disease-wrapper").appendTo($tr);
            $td2.html(
                gene_symbol +
                "<span class=\"divide\">in</span>" +
                "<a href=\""+mondo_url+"\" target=\"_blank\">" + mondo_disease_name + "</a>"+
                " <img src=\"/static/images/panelsearch/link.svg\" />"
            );

            tableData.push('<tr>' + $tr.html() + '</tr>');
        }

}


const GENE_SOURCE_KEYWORD_HASH = {
    'OMIM:' : 'OMIM',
    'ORPHA:': 'Orphadata'
}

function _vgp_init_ui_panel_gene_data(ncbi_gene_id, data_obj){
    let key_gid = "GENEID:" + ncbi_gene_id;
    $('.vgp-target').text(data_obj[key_gid].hgnc_gene_symbol);
    $('#vgp-panel-gene-name').text(data_obj[key_gid].hgnc_gene_symbol);
    $('#vgp-panel-gene-fullname').text(data_obj[key_gid].full_name);

    if('inheritance_en' in data_obj[key_gid]){
        $('#vgp-td-inheritance').text(data_obj[key_gid].inheritance_en.join(","));
    }


    if('mondo_disease_name_en' in data_obj[key_gid]){
        let disease_text_arr = [];
        Object.keys(data_obj[key_gid].mondo_disease_name_en).forEach(function (mondo_id) {
            
            
            if(("mondo_id_to_omim_id" in data_obj[key_gid]) && 
               (mondo_id in data_obj[key_gid].mondo_id_to_omim_id)){
                let source_id = data_obj[key_gid].mondo_id_to_omim_id[mondo_id];
                let str = data_obj[key_gid].mondo_disease_name_en[mondo_id] + ", " + source_id;
                disease_text_arr.push(str);
            }
            
            if(("mondo_id_to_orpha_id" in data_obj[key_gid]) &&            
                     (mondo_id in data_obj[key_gid].mondo_id_to_orpha_id)){
                let source_id = data_obj[key_gid].mondo_id_to_orpha_id[mondo_id];
                let str = data_obj[key_gid].mondo_disease_name_en[mondo_id] + ", " + source_id;
                disease_text_arr.push(str);
            }
        });
        $('#vgp-td-disease').text(disease_text_arr.join(" | "));
    }


    if('hgnc_gene_url' in data_obj[key_gid]){
        $('<a>').addClass("vgp-link").text(data_obj[key_gid].hgnc_gene_id)
                .attr({'href': data_obj[key_gid].hgnc_gene_url, 'target': '_blank'})
                .appendTo($('#vgp-td-link'));
    }

    [ 
        {title: 'HGMD',    url: 'http://www.hgmd.cf.ac.uk/ac/gene.php?gene=__hgnc_gene_symbol__'},
        {title: 'ClinVar', url: 'https://www.ncbi.nlm.nih.gov/clinvar/?term=__hgnc_gene_symbol__'},
        {title: 'TogoVar', url: 'https://grch38.togovar.org/?mode=simple&term=__hgnc_gene_symbol__'}, 
        {title: 'LitVar',  url: 'https://www.ncbi.nlm.nih.gov/research/litvar2/docsum?text=__hgnc_gene_symbol__'},
        {title: 'PubTator',url: 'https://www.ncbi.nlm.nih.gov/research/pubtator3/docsum?text=__hgnc_gene_symbol__'},
        {title: 'DGIdb',   url: 'https://www.dgidb.org/results?searchType=gene&searchTerms=__hgnc_gene_symbol__'}, 
    ].forEach((item) => {
        $('<a>').addClass("vgp-link").text(item.title)
                .attr({'href': item.url.replace('__hgnc_gene_symbol__', data_obj[key_gid].hgnc_gene_symbol),'target': '_blank'})
                .appendTo($('#vgp-td-link'));
    });
}


function _makeAjaxRequest(url_str, callback) {
    $.ajax({
        url:      url_str,
        type:     'GET',
        async:    true,
        dataType: 'text'
    }).done(function (data, textStatus, jqXHR) {
        if(_isFunction(callback)){
            callback(data);
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        _vgp_hide_loading();
        alert('ajax failed \nURL:'+ url_str);
    }).always(function () {
        //
    });
}

function _vgp_summary_control(btn){
    let $button  = $(btn);

    if((typeof $button.data('num') !== 'undefined') && 
       ($button.data('num') == 0)){
        return;
    }

    let table_id          = $button.data('table-id');
    let relative_id       = $button.data('relative-id');
    let relative_table_id = $button.data('relative-table-id');

    let relative_text = "Show";
    if( typeof $('#'+relative_id).data('num') !== 'undefined' ) {
        relative_text = "Show(" + $('#'+relative_id).data('num') + ")";
    }
    $('#'+relative_id).removeClass('vgp-active').text(relative_text);
    $('#'+relative_table_id).hide();

    $button.toggleClass('vgp-active');
    if($button.hasClass('vgp-active')){
        $button.text('Hide');
        $("#"+table_id).show();
    }else{
        let text = "Show";
        if( typeof $button.data('num') !== 'undefined' ) {
             text = "Show(" + $button.data('num') + ")";
        }
        $button.text(text);
        $("#"+table_id).hide();
    }
}

var currentPage = 1;
var rowsPerPage = 10;
var tableData   = [];   

function displayData(page) {
    var startIndex = (page - 1) * rowsPerPage;
    var endIndex = startIndex + rowsPerPage;
    var pageData = tableData.slice(startIndex, endIndex);

    $("#vgp-panel-table").empty();

    $.each(pageData, function(index, row) {
      $("#vgp-panel-table").append(row);
    });
}

function updateButtons() {
    if (currentPage === 1) {
      $("#prevPage").prop("disabled", true);
    } else {
      $("#prevPage").prop("disabled", false);
    }

    var totalPages = Math.ceil(tableData.length / rowsPerPage);
    if (currentPage === totalPages) {
      $("#nextPage").prop("disabled", true);
    } else {
      $("#nextPage").prop("disabled", false);
    }
}

$("#prevPage").click(function() {
    if (currentPage > 1) {
      currentPage--;
      displayData(currentPage);
      updateButtons();
    }
});

$("#nextPage").click(function() {
    var totalPages = Math.ceil(tableData.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayData(currentPage);
      updateButtons();
    }
});


function _vgp_init_attach_event_handlers(ncbi_gene_id){
    $('.vgp-summary-controll').click(function(){
        _vgp_summary_control(this);
    });

    if(tableData.length > rowsPerPage){
        let $tbl = $('#vgp-panel-table');
        $('#paginationButtons').css({'display':'block'});
        displayData(currentPage);
        updateButtons();
    }else{
        $('#paginationButtons').css({'display': 'none'});
    }
}

function _vgp_construct_get_panel_data_url(init_data){
    let key = Object.keys(init_data.panel_id_list)[0];
    let arr = init_data['panel_id_list'][key];
	if(arr.length > 0){
	    let url_str = arr.join(',');
    	    url_str = url_str.replaceAll('MONDO:','');
        	url_str = URL_GET_MONDO_DATA + url_str;
	    return url_str;
	}else{
		return '';
	}
}


function _vgp_init(ncbi_gene_id, gene_symbol){
    _vgp_show_loading();

    let ajax_obj_arr = [
        {
            'url':             URL_GET_GENE_DETAIL_DATA + ncbi_gene_id,
            'output_data_key': 'panel_gene_data',
            'init_ui_func':    _vgp_init_ui_panel_gene_data
        },
        {
            'url':             URL_GET_GENE_TOOLTIP_DATA + ncbi_gene_id,
            'output_data_key': 'panel_gene_tooltip_data',
            'init_ui_func':    _vgp_init_ui_panel_gene_data2
        },
        [
            {
                'url': URL_GET_MONDO_ID_MATCH_GENE_SYMBOL + gene_symbol,
                'output_data_key': 'panel_id_list',
                'init_ui_func':  null
            },
            {
                'url': _vgp_construct_get_panel_data_url,
                'output_data_key': 'panel_data',
                'init_ui_func': _vgp_init_ui_panel_gene_data3
            }
        ]
    ]

    let init_data = {};
    let total_cnt     = 4;
    let completed_cnt = 0;
    ajax_obj_arr.forEach((ajax_obj) => {

        if(_isArray(ajax_obj)){
           let ajax_obj_0 = ajax_obj[0];
           let ajax_obj_1 = ajax_obj[1];
           _makeAjaxRequest(ajax_obj_0.url, function(responseData){
               let json_data = JSON.parse(responseData);
               init_data[ajax_obj_0.output_data_key] = json_data;
               if(_isFunction(ajax_obj_0.init_ui_func)){
                   ajax_obj_0.init_ui_func(init_data);
               }
               completed_cnt++;

               let url_str_1 = ajax_obj_1.url;
               if(_isFunction(ajax_obj_1.url)){
                   url_str_1 = ajax_obj_1.url(init_data);
               }

               if(!url_str_1){
                   completed_cnt++;
                   if(completed_cnt === total_cnt){
                       //do final
                       vgp_init_attach_event_handlers(ncbi_gene_id);
                       _vgp_hide_loading();
                   }
                   return;
               }

               _makeAjaxRequest(url_str_1, function(responseData1){
                   let json_data1 = JSON.parse(responseData1);
                   init_data[ajax_obj_1.output_data_key] = json_data1;
                   completed_cnt++;
                   if(json_data1.length===0){
                       completed_cnt++;
                       if(completed_cnt === total_cnt){
                           //do final
                           vgp_init_attach_event_handlers(ncbi_gene_id);
                           _vgp_hide_loading();
                       }
                       return;
                   }
                   if(_isFunction(ajax_obj_1.init_ui_func)){
                       ajax_obj_1.init_ui_func(gene_symbol, init_data);
                   }
                   if(completed_cnt === total_cnt){
                       //do final
                       vgp_init_attach_event_handlers(ncbi_gene_id);
                       _vgp_hide_loading(); 
                   }
               });
           });



            return;
        }

        _makeAjaxRequest(ajax_obj.url, function(responseData){
            let json_data = JSON.parse(responseData);
            init_data[ajax_obj.output_data_key] = json_data;
            if(_isFunction(ajax_obj.init_ui_func)){
                ajax_obj.init_ui_func(ncbi_gene_id,init_data[ajax_obj.output_data_key]);
            }

            completed_cnt++;
            if(completed_cnt === total_cnt){
                //do final
                _vgp_init_attach_event_handlers(ncbi_gene_id);
                _vgp_hide_loading();
            }
        });
    });
}


function _get_panel_id(){
    return $('#href_panel').data('panel_id');
}

function _get_all_panel_genes(){
	return [];
}

