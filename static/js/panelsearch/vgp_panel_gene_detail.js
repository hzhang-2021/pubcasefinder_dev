const URL_GET_GENE_DETAIL_DATA                  = "/sparqlist/api/pcf_get_gene_data_by_ncbi_gene_id?ncbi_gene_id=",
      URL_GET_GENE_TOOLTIP_DATA                 = "/sparqlist/api/pcf_get_gene_tooltip_data_by_ncbi_gene_id?ncbi_gene_id=",
	  URL_GET_PANEL_AUTOREVIEW_GENE_BY_MONDO_ID = '/sparqlist/api/ps_get_autoreview_gene_by_mondo_id?mondo_id=',
	  URL_GET_MONDO_ID_MATCH_GENE_SYMBOL        = '/sparqlist/api/pcf_panel_get_mondo_id_match_gene_symbol_synonym_ncbiid_250630_test?input_text=';
      //URL_GET_MONDO_ID_MATCH_GENE_SYMBOL        = "/sparqlist/api/pcf_panel_get_mondo_id_match_gene_symbol_synonym_ncbiid?input_text=",
      //URL_GET_MONDO_DATA                        = "/sparqlist/api/pcf_get_panel_data_by_mondo_id?mondo_id=";

function _vgp_init_ui_panel_gene_data2(ncbi_gene_id, gene_symbol, data_obj){
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

function _construct_panel_table_row_html_str(gene_symbol, mondo_id, mondo_disease_name){

	let tr = `<tr>
                <td class="vgp-disease-wrapper">
					${gene_symbol}
					<span class="divide">in</span>
					<a href="/panel_detail?panel_id=${mondo_id}" target="_blank">${mondo_disease_name}</a>
					<img src="/static/images/panelsearch/link.svg" />
                </td>
			  </tr>`;
	return tr;
}

function _vgp_init_ui_panel_gene_data3(ncbi_gene_id, gene_symbol, data_obj){

        let mondo_arr = data_obj.sort((a,b) => {
			if(lang == 'ja' && 'name_ja' in a && 'name_ja' in b){
				return a.name_ja.localeCompare(b.name_ja);
			}else{
				return a.name_en.localeCompare(b.name_en);
			}
		});

        $('#vgp-panel-switch').text("Show ("+mondo_arr.length+')').data('num',mondo_arr.length);

		if(mondo_arr.length <= 10){
			let $tbl = $('#vgp-panel-table');
	        for(let i=0; i< mondo_arr.length; i++){
    	        let mondo_id  = mondo_arr[i].mondo_id;
	            let mondo_disease_name = mondo_arr[i].name_en;
				if(lang == 'ja' && 'name_ja' in  mondo_arr[i] &&  mondo_arr[i].name_ja){
					mondo_disease_name = mondo_arr[i].name_ja;
				}
				let tr_html = _construct_panel_table_row_html_str(gene_symbol, mondo_id,mondo_disease_name);
				$(tr_html).appendTo($tbl);
    	    }
		}else{
    		$('#vgp-panel-table').data('gene_symbol', gene_symbol);
			$('#vgp-panel-table-pagination').pagination({
				dataSource: mondo_arr,
				pageSize: 10,
				callback: function (data, pagination) {
					let $tbl = $('#vgp-panel-table');
					let gene_symbol = $tbl.data('gene_symbol');
					
					$tbl.empty();
					data.forEach(item => {
						let mondo_disease_name = item.name_en;
						if(lang == 'ja' && 'name_ja' in  item &&  item.name_ja){
		                    mondo_disease_name = item.name_ja;
            			}
						$tbl.append(_construct_panel_table_row_html_str(gene_symbol, item.mondo_id, mondo_disease_name));
					});
				}
			});
		}

}


const GENE_SOURCE_KEYWORD_HASH = {
    'OMIM:' : 'OMIM',
    'ORPHA:': 'Orphadata'
}

function _vgp_init_ui_panel_gene_data(ncbi_gene_id,gene_symbol, data_obj){
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

function _vgp_init_ui_panel_review_list(ncbi_gene_id,gene_symbol, data_obj){
	let filtered_review_list = Object.values(data_obj)[0].filter(review => {
		return review.ncbi_gene_id === ncbi_gene_id;
	});

	let total_num = 0;
	let rating_hash = _count_rating(filtered_review_list);	
	for(let rating in rating_hash){
		let num = rating_hash[rating];
		total_num += num;
		let rating_class = `.vgp-rating-list-tag.${RATING_CLASS_HASH[rating]}`;
		$(rating_class).text(num).data('rating', rating);
		if(num > 0){
			$(rating_class).click(function(){
				if($(this).hasClass('selected')){
					$(this).removeClass('selected');
					let num = $("#vgp-panel-gene-review-panel").find('.vgp-panel-gene-view-list-wrapper').show().length;
					$('.vgp-panel-gene-view-num').text(num);
					return;
				}
				
				$('.vgp-rating-list-tag').removeClass('selected');
				$(this).addClass('selected');
				let rating = $(this).data("rating");

                $("#vgp-panel-gene-review-panel").find('.vgp-panel-gene-view-list-wrapper').hide();

                let num = $("#vgp-panel-gene-review-panel").find('.vgp-panel-gene-view-list-wrapper').filter(function(){
					return $(this).data('rating') === rating;
				}).show().length;

                $('.vgp-panel-gene-view-num').text(num);
			});
		}
	}

	$('.vgp-panel-gene-view-num').text(total_num);
	$('#nav-vgp-panel-gene-review-panel').text(`Reviews (${total_num})`);

	let $container = $('#vgp-panel-gene-review-panel');
	$container.find('.vgp-panel-gene-view-list-wrapper').remove();

	let $container_history = $('#vgp-history-list-container');
	$container_history.empty();

	filtered_review_list.sort(function(a,b){
		let rating_def_a = _check_rating_def(a.rating);
		let rating_def_b = _check_rating_def(b.rating);
		let a_rating = RATING_ORDER_HASH[rating_def_a];
		let b_rating = RATING_ORDER_HASH[rating_def_b];
		if(a_rating === b_rating){
			return 0;
		}else if(a_rating > b_rating){
			return 1;
		}else{
			return -1;
		}
	}).forEach((review) => {

		// review
		let rating_def = _check_rating_def(review.rating);
		let $tr = $('<div>').addClass('vgp-panel-gene-view-list-wrapper other').data('rating',rating_def).appendTo($container);
		let $upper_wrapper = $('<div>').addClass('vgp-review-upper-wrapper d-flex justify-content-between').appendTo($tr);
		let $upper_left_wrapper = $('<div>').addClass('vgp-review-upper-left-wrapper d-flx flex-column').appendTo($upper_wrapper);
		let $rating_tag_wrapper = $('<div>').appendTo($upper_left_wrapper);
		$('<span>').addClass('vgp-rating-tag').addClass(RATING_CLASS_HASH[rating_def]).text(rating_def).appendTo($rating_tag_wrapper);
		$(`<div class="vgp-review-title2">${review.source}</div>`).appendTo($upper_left_wrapper);
		if('moi_en' in review){
			$(`<div><font class="vgp-review-title-font">Mode of inheritance:</font> ${review.moi_en}</div>`).appendTo($upper_left_wrapper);
		}
		if('mondo_en' in review){
			$(`<div><font class="vgp-review-title-font">Phenotypes:</font> ${review.mondo_en}</div>`).appendTo($upper_left_wrapper);
		}


		// review history
		let $li = $('<li>').appendTo($container_history);
		$('<div>').addClass('time').text('-').appendTo($li);
		$('<label>').text(review.source).appendTo($li);
		$('<p>')
			.text(`Rating: ${rating_def} ${'mondo_en' in review ? "| Diseases: " + review.mondo_en + " ": "" }${ 'moi_en' in review ? "| Mode Of Inheritance: " + review.moi_en : ""}`)
			.appendTo($li);
	});
}

/*
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
*/

function _vgp_summary_control_panel(btn){
    let $button  = $(btn);

    let table_id          = $button.data('table-id');
    let relative_id       = $button.data('relative-id');
    let relative_table_id = $button.data('relative-table-id');

	if($('#'+relative_id).hasClass('vgp-active')){
	    let relative_text = "Show";
	    if( typeof $('#'+relative_id).data('num') !== 'undefined' ) {
	        relative_text = "Show (" + $('#'+relative_id).data('num') + ")";
	    }
	    $('#'+relative_id).removeClass('vgp-active').text(relative_text);
	    $('#'+relative_table_id).hide();
	}

    $button.toggleClass('vgp-active');
    if($button.hasClass('vgp-active')){
        $button.text('Hide');
		if(typeof $button.data('num') !== 'undefined'){
			$button.text(`Hide (${$button.data('num')})`);
		}
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
        _vgp_summary_control_panel(this);
    });
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


function _vgp_init(ncbi_gene_id, gene_symbol, panel_id){
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
		{
			'url':             URL_GET_PANEL_AUTOREVIEW_GENE_BY_MONDO_ID + panel_id.replace('MONDO:',''),
			'output_data_key': 'panel_autoreview_gene_data',
			'init_ui_func':    _vgp_init_ui_panel_review_list
		},
 		{
            
            'url': URL_GET_MONDO_ID_MATCH_GENE_SYMBOL + gene_symbol,
            'output_data_key': 'panel_data',
            'init_ui_func':  _vgp_init_ui_panel_gene_data3
		}
    ]

    let init_data = {};
    let total_cnt     = 4;
    let completed_cnt = 0;
    ajax_obj_arr.forEach((ajax_obj) => {
        _makeAjaxRequest(ajax_obj.url, 
			function(responseData){
	            let json_data = JSON.parse(responseData);
    	        init_data[ajax_obj.output_data_key] = json_data;
        	    if(_isFunction(ajax_obj.init_ui_func)){
	                ajax_obj.init_ui_func(ncbi_gene_id, gene_symbol, init_data[ajax_obj.output_data_key]);
    	        }

	            completed_cnt++;
    	        if(completed_cnt === total_cnt){
	                //do final
    	            _vgp_init_attach_event_handlers(ncbi_gene_id);
        	        _vgp_hide_loading();
	            }
    	    },
			function(){
				alert("ajax error: " + ajax_obj.url);
            	_vgp_hide_loading();
			}
		);
    });
}
