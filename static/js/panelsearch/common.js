const URL_GET_PUBTATOR3_PAPER_DATA			= '/sparqlist/api/ps_get_pubtator3_paper_data_by_mondo_id_gene_id';
const URL_GET_PUBCHEM_PAPER_DATA			= '/sparqlist/api/ps_get_pubchem_paper_data_by_mondo_id_gene_id';
const URL_GET_GENE_TOOLTIP_DATA_BY_GENE_ID	= '/sparqlist/api/pcf_get_gene_tooltip_data_by_ncbi_gene_id?ncbi_gene_id=';

const	
	RATING_DEFINITIVE   = 'Definitive',
	RATING_STRONG		= 'Strong',
	RATING_MODERATE		= 'Moderate',
	RATING_SUPPORTIVE	= 'Supportive',
	RATING_LIMITED		= 'Limited',
	RATING_DISPUTED		= 'Disputed',
	RATING_REFUTED		= 'Refuted',
	RATING_ANIMAL		= 'Animal',
	RATING_NOKNOWN		= 'No known',
	RATING_NORATING		= 'No rating',
	RATING_ORDER_HASH = {
		[RATING_DEFINITIVE]:	10,
		[RATING_STRONG]:		20,
		[RATING_MODERATE]:		30,
		[RATING_SUPPORTIVE]:	40,
		[RATING_LIMITED]:		50,
		[RATING_DISPUTED]:		60,
		[RATING_REFUTED]:		70,
		[RATING_ANIMAL]:		80,
		[RATING_NOKNOWN]:		90,
		[RATING_NORATING]:		100
	},
	RATING_CLASS_HASH = {
		[RATING_DEFINITIVE]:	'vgp-rating-definitive',
		[RATING_STRONG]:		'vgp-rating-strong',
		[RATING_MODERATE]:		'vgp-rating-moderate',
		[RATING_SUPPORTIVE]:	'vgp-rating-supportive',
		[RATING_LIMITED]:		'vgp-rating-limited',
		[RATING_DISPUTED]:		'vgp-rating-disputed',
		[RATING_REFUTED]:		'vgp-rating-refuted',
		[RATING_ANIMAL]:		'vgp-rating-animal',
		[RATING_NOKNOWN]:		'vgp-rating-noknown',
		[RATING_NORATING]:		'vgp-rating-norating'
	},
	RATING_REVIEW_ARRAY = [
		{rating_key: RATING_DEFINITIVE, isSeparatorExists: false},
		{rating_key: RATING_STRONG,	    isSeparatorExists: false},
		{rating_key: RATING_MODERATE,   isSeparatorExists: false},
		{rating_key: RATING_SUPPORTIVE, isSeparatorExists: true},
		{rating_key: RATING_LIMITED,	isSeparatorExists: false},
		{rating_key: RATING_DISPUTED,   isSeparatorExists: false},
		{rating_key: RATING_REFUTED,	isSeparatorExists: false},
		{rating_key: RATING_ANIMAL,	    isSeparatorExists: false},
		{rating_key: RATING_NOKNOWN,	isSeparatorExists: false},
		{rating_key: RATING_NORATING,   isSeparatorExists: false}
	];

const REVIEW_TBL_HEAD_LIST = [
	{title: 'Rating',              key: 'rating'} ,
	{title: 'Disease',             key: 'mondo_en'} ,
	{title: 'Source',              key: 'source'},
	{title: 'Mode of Inheritance', key: 'moi_en'}
];
const PAPER_TBL_HEAD_LIST = [
	{title: 'Title',  key: 'title'},
	{title: 'Journal',key: 'journal'},
	{title: 'Date',   key: 'date'},
	{title: 'Source', key: 'source'}
];

function _check_rating_def(rating_def){

	if(!rating_def) return RATING_NORATING;

	if( rating_def === 'No Known Disease Relationship'){
		return RATING_NOKNOWN;
	}else if(rating_def === 'Disputed Evidence'){
		return RATING_DISPUTED;
	}else{
		if(!( rating_def in RATING_ORDER_HASH)){
			alert('unknown rating ' + rating_def);
			return RATING_NORATING;
		}
	}
	return rating_def;
}

function _count_rating(autoreview_list){
	let rating_out = {};
	for (let rating_keyword in RATING_ORDER_HASH){
		rating_out[rating_keyword] = 0;
	}

	autoreview_list.forEach((autoreview) => {
		if('rating' in autoreview){
			let rating_def = autoreview.rating;
			if(rating_def in rating_out){
				rating_out[rating_def] += 1;
			}else if(rating_def === 'No Known Disease Relationship'){
				rating_out[RATING_NOKNOWN] += 1;
			}else if(rating_def === 'Disputed Evidence'){
				rating_out[RATING_DISPUTED] += 1;
			}else{
				alert('Error: unknown rating found[' + rating_def + ']');
				rating_out[RATING_NORATING] += 1;
			}
		}else{
			rating_out[RATING_NORATING] += 1;
		}
	});

	return rating_out;
}

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
	},
	_capitalizeFirstLetter = function(string) {
		if (!string) return string; // Handle empty or null strings
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	_formatDateStr = function(str) {
		if (/^\d{6}$/.test(str)) {
			// YYYYMM → YYYY-MM
			return str.replace(/(\d{4})(\d{2})/, '$1-$2');
		} else if (/^\d{8}$/.test(str)) {
			// YYYYMMDD → YYYY-MM-DD
			return str.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
		}
		return str;
	};





function _makeAjaxRequest(url_str, callback, callback_onfail) {
	$.ajax({
		url:	  url_str,
		type:	 'GET',
		async:	true,
		dataType: 'text'
	}).done(function (data, textStatus, jqXHR) {
		if(_isFunction(callback)){
			callback(data);
		}
	}).fail(function (jqXHR, textStatus, errorThrown) {
		if(_isFunction(callback_onfail)){
			callback_onfail();
		}
		console.log('ajax failed URL:'+ url_str);
		//alert('ajax failed \nURL:'+ url_str);
	}).always(function () {
		//
	});
}




function _vgp_load_entity_paper_data(mondo_id_list, callback, callback_fail){

	let panel_entity_paper_hash = {};
	let url_list = [];

	for(let mondo_id of mondo_id_list){
		panel_entity_paper_hash[mondo_id] = {};
		panel_entity_paper_hash[mondo_id]['pubtator3_paper_cnt_list'] = [];
		panel_entity_paper_hash[mondo_id]['pubchem_paper_cnt_list'] = [];

		url_list.push({'mondo_id': mondo_id, 'target': 'pubtator3_paper_cnt_list', 'url': URL_GET_PUBTATOR3_PAPER_COUNT_BY_MONDO_ID + mondo_id.replace('MONDO:','')});
		url_list.push({'mondo_id': mondo_id, 'target': 'pubchem_paper_cnt_list',   'url': URL_GET_PUBCHEM_PAPER_COUNT_BY_MONDO_ID  + mondo_id.replace('MONDO:','')});
	}

	let total_cnt = url_list.length;
	let completed_cnt = 0;
   
	url_list.forEach((ajax_obj) => {
		_makeAjaxRequest(ajax_obj.url,
			function(responseData){
				let json_data = JSON.parse(responseData);
				panel_entity_paper_hash[ajax_obj.mondo_id][ajax_obj.target]= json_data;
				completed_cnt++;

				if(completed_cnt === total_cnt){
					console.log("finished download data");
					//do final
					callback(panel_entity_paper_hash);
				}
			},
			function(){ callback_fail(); }
		);
	});
}


function _get_paper_num(gene_id, panel_entity_paper_cnt_list){
    //let found = panel_entity_paper_cnt_list.find(item => item.gene_id === gene_id);
    //return found ? parseInt(found.count) : 0;
	let total = panel_entity_paper_cnt_list.filter(item => item.gene_id === gene_id).reduce((sum, item) => sum + parseInt(item.count), 0);
	return total;
}

function _get_gene_list_from_autoreview_data(panel_autoreview_gene_data){
	let hash = {};
	for(let mondo_id of Object.keys(panel_autoreview_gene_data)){
		let review_list = panel_autoreview_gene_data[mondo_id];
		for (let review_item of review_list){
			hash[review_item.hgnc_gene_symbol] = 1;
		}
	}
	return Object.keys(hash);
}

function _get_entity_hash(panel_autoreview_gene_data, pubtator3_paper_cnt_list, pubchem_paper_cnt_list){
	let hash = {};
	for(let mondo_id of Object.keys(panel_autoreview_gene_data)){
		let review_list = panel_autoreview_gene_data[mondo_id];
		for (let review_item of review_list){
			if(!(review_item.hgnc_gene_symbol in hash)){
				hash[review_item.hgnc_gene_symbol] = {};
			}
			
			if(!(mondo_id in hash[review_item.hgnc_gene_symbol])){
				hash[review_item.hgnc_gene_symbol][mondo_id] = {};
			}

			let mondo_name = review_item.mondo_en;
			if(lang === 'ja' && 'mondo_ja' in review_item && review_item.mondo_ja){
				mondo_name = review_item.mondo_ja;
			}
			if(!(mondo_name in hash[review_item.hgnc_gene_symbol][mondo_id])){
				hash[review_item.hgnc_gene_symbol][mondo_id][mondo_name] = {};
				hash[review_item.hgnc_gene_symbol][mondo_id][mondo_name]['autoreview_list'] = [];
				hash[review_item.hgnc_gene_symbol][mondo_id][mondo_name]['ncbi_gene_id'] = review_item.ncbi_gene_id;
				hash[review_item.hgnc_gene_symbol][mondo_id][mondo_name]['mondo_url'] = review_item.mondo_url;
				let pubtator3_paper_cnt = _get_paper_num(review_item.ncbi_gene_id,pubtator3_paper_cnt_list);
				let pubchem_paper_cnt   = _get_paper_num(review_item.ncbi_gene_id,pubchem_paper_cnt_list);
				hash[review_item.hgnc_gene_symbol][mondo_id][mondo_name]['paper_num'] = pubtator3_paper_cnt + pubchem_paper_cnt;
			}
			hash[review_item.hgnc_gene_symbol][mondo_id][mondo_name]['autoreview_list'].push(review_item);
		}
	}

	return hash;
}

function _vgp_init_ui_panel_entity($tbody, indicated_panel_mondo_id, panel_autoreview_gene_data,  pubtator3_paper_cnt_list, pubchem_paper_cnt_list){

	if(Object.keys(panel_autoreview_gene_data).length === 0) return;

	let panel_entity_hash = _get_entity_hash(panel_autoreview_gene_data, pubtator3_paper_cnt_list, pubchem_paper_cnt_list);

	let sorted_panel_entities = Array.from(Object.keys(panel_entity_hash)).sort();

	let all_mondo_id_list = Object.keys(panel_autoreview_gene_data).sort((a,b) => {
		if (a === indicated_panel_mondo_id) return -1;
		if (b === indicated_panel_mondo_id) return 1;
		return a.localeCompare(b);
	});

	let i = 0;
	let entity_max_length = 0;
	for(let hgnc_gene_symbol of sorted_panel_entities){
		for(let panel_mondo_id of all_mondo_id_list){
			if(!(panel_mondo_id in panel_entity_hash[hgnc_gene_symbol])) continue;

			if(hgnc_gene_symbol.length > entity_max_length) entity_max_length = hgnc_gene_symbol.length ;

			for(let panel_name of Object.keys(panel_entity_hash[hgnc_gene_symbol][panel_mondo_id])){

				let autoreview_list = panel_entity_hash[hgnc_gene_symbol][panel_mondo_id][panel_name]['autoreview_list'];
				let rating_hash	    = _count_rating(autoreview_list);
				let paper_num	    = panel_entity_hash[hgnc_gene_symbol][panel_mondo_id][panel_name]['paper_num'];
				let ncbi_gene_id	= panel_entity_hash[hgnc_gene_symbol][panel_mondo_id][panel_name]['ncbi_gene_id'];
				let mondo_url		= panel_entity_hash[hgnc_gene_symbol][panel_mondo_id][panel_name]['mondo_url'];
				
				let id_subfix = indicated_panel_mondo_id.replace('MONDO:','') + "-" + i;
 
				// entity row
				let $tr = $('<tr>').addClass("vgp-table-datarow").appendTo($tbody);
				if(indicated_panel_mondo_id !== panel_mondo_id) $tr.addClass('not_native');
				let $td = $(`<td colspan="3"></span>`).appendTo($tr);
				let $row_wrapper = $('<div>').addClass('row-wrapper').appendTo($td);
				let $upper_row = $('<div>').addClass('upper-row').appendTo($row_wrapper);
				

				// entity row: entity name
				let $entity_wrapper = $('<div>').addClass('width-entity').appendTo($upper_row);
				let $entity_name_wrapper = $('<div>').addClass("entity-name-wrapper").appendTo($entity_wrapper);
			    let urlstr = `/panel_gene_detail?lang=${lang}&panel_id=${encodeURIComponent(panel_mondo_id)}&panel_title=${encodeURIComponent(panel_name)}&gene_id=${encodeURIComponent(ncbi_gene_id)}&gene_title=${encodeURIComponent(hgnc_gene_symbol)}&`;
				let entity_name_html_str = `<button class="vgp-panel-gene-name ${indicated_panel_mondo_id !== panel_mondo_id ? 'not_native' : ''}" data-gene-id="GENEID:${ncbi_gene_id}"></button>`;
				let $btn_entity_name = $(entity_name_html_str).appendTo($entity_name_wrapper);
				$(`<span href="${urlstr}" target="_blank">${hgnc_gene_symbol}<svg></svg></span>`).appendTo($btn_entity_name);
				let $paper_ctl_wrapper = $('<div>').addClass("paper-ctl-wrapper").appendTo($entity_wrapper);
				$('<span>').addClass('related-paper-title').text("Related paper:").appendTo($paper_ctl_wrapper);
				if(paper_num > 0){
					let paper_cnt_ctl_html_str = `<span id="vgp-paper-controller-${id_subfix}"
														class="vgp-summary-controll"
														data-cnt=${paper_num}
														data-table-id="vgp-paper-table-wrapper-${id_subfix}" 
														data-relative-id="vgp-review-controller-${id_subfix}"
														data-relative-table-id="vgp-review-table-wrapper-${id_subfix}">Show(${paper_num})</span>`
					$(paper_cnt_ctl_html_str).appendTo($paper_ctl_wrapper);
				}else{
					$('<span>').addClass('related-paper-num empty').text('0').appendTo($paper_ctl_wrapper);
				}

                // entity row: source panel name
                let $panel_name_wrapper = $('<div>').addClass('width-source-panel').appendTo($upper_row);
				let url_panel_str = `/panel_detail?panel_id=${panel_mondo_id}`;
                $(`<a>${_capitalizeFirstLetter(panel_name)}<svg></svg></a>`).attr('href', url_panel_str).addClass('vgp-panel-name').attr('target', '_blank').appendTo($panel_name_wrapper);

	
				// entity row: reviews
				let $td_review = $('<div>').addClass('width-sources').appendTo($upper_row);
				let $div_review_tag_wrapper = $('<div>').addClass('d-flex flex-column w-100').appendTo($td_review);
				let $div_review_tag_wrapper1 = $('<div>').addClass("vgp-rating-tag-list-container vgp-rating-tag-list-container-width").appendTo($div_review_tag_wrapper);
				let total_review_num = 0;
				RATING_REVIEW_ARRAY.forEach((item) => {
					let rating_html_str = `
						<div class="${item.isSeparatorExists ? "vgp-rating-tag-subcontainer vgp-rating-divide" : "vgp-rating-tag-subcontainer"}">
							<div class="vgp-rating-tag-wrapper">
								<span class="vgp-rating-list-tag ${rating_hash[item.rating_key] ? RATING_CLASS_HASH[item.rating_key] : "empty"}">${rating_hash[item.rating_key] ? rating_hash[item.rating_key] : 0}</span>
							</div>
						</div>
					`;
					$(rating_html_str).appendTo($div_review_tag_wrapper1);
					if(rating_hash[item.rating_key]){
						total_review_num = total_review_num + rating_hash[item.rating_key];
					}
				});
				let $div_review_tag_wrapper2 = $('<div>').addClass("vgp-review-tag-list-wrapper").appendTo($div_review_tag_wrapper);
				$('<span>').addClass("vgp-panel-review-num").css({'display':'none'}).text(total_review_num).appendTo($div_review_tag_wrapper2);
				let review_cnt_ctl_html_str = `<span id="vgp-review-controller-${id_subfix}"
												class="vgp-summary-controll"
												data-cnt=${total_review_num} 
												data-table-id="vgp-review-table-wrapper-${id_subfix}" 
												data-relative-id="vgp-paper-controller-${id_subfix}"
												data-relative-table-id="vgp-paper-table-wrapper-${id_subfix}">Show(${total_review_num})</span>`;
				$(review_cnt_ctl_html_str).appendTo($div_review_tag_wrapper2);

				// detail row
				let $td_detail_wrapper = $('<div>').addClass('lower-row').appendTo($row_wrapper);

				// detail row: review table
				let $tbl_review_wrapper = $('<div>').addClass("vgp-review-table-wrapper loaded").attr({'id': `vgp-review-table-wrapper-${id_subfix}`}).appendTo($td_detail_wrapper);

                let autoreview_list_sorted = autoreview_list.sort(function(a,b){
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
                });

				let tbl_review_id = `vgp-review-table-${id_subfix}`;
				let $tbl_review = $('<table>').addClass("vgp-review-table").attr({'id':tbl_review_id}).appendTo($tbl_review_wrapper);

				let $colgroup_review   = $('<colgroup>').appendTo($tbl_review);
				for (let cnt = 0; cnt < REVIEW_TBL_HEAD_LIST.length; cnt++) {
					$('<col>').appendTo($colgroup_review);
				}
				let $thead_review = $('<thead>').appendTo($tbl_review);
				let $thead_row_review = $('<tr>').appendTo($thead_review);
				for(let idx=0; idx < REVIEW_TBL_HEAD_LIST.length; idx++){
					let col_title = REVIEW_TBL_HEAD_LIST[idx].title;
					let data_key  = REVIEW_TBL_HEAD_LIST[idx].key;
					let $th = $('<th>').appendTo($thead_row_review);
					if(idx==0){
						let span_html_str = `<span data-sort-id="${idx}" 
													data-sort-method="vgp-sort-method-rating" 
													data-sort-inner-target="vgp-rating-tag" 
													data-sort-key="${data_key}"
													class="vgp-sorter ml-3">${col_title}</span>`;
						$(span_html_str).appendTo($th);	
					}else{
						let span_html_str = `<span data-sort-id="${idx}" data-sort-method="vgp-sort-method-letter" data-sort-key="${data_key}" class="vgp-sorter">${col_title}</span>`;
						$(span_html_str).appendTo($th);
					}
				}
				let $tbody_review = $('<tbody>').appendTo($tbl_review);

				// detail row: review table: data row
				if(autoreview_list_sorted.length >10){
					$tbl_review.addClass('pagination-table').data('pagination-data',autoreview_list_sorted);;
					let tbl_review_pagination_id = `vgp-review-table-pagination-${id_subfix}`;
					$tbl_review.data('tbl_review_pagination_id',tbl_review_pagination_id);
					$tbl_review.data('pagination_refresh_func', _create_pagination_review_table);
					$('<div>').addClass('vgp-pagination-wrapper').attr('id', tbl_review_pagination_id).appendTo($tbl_review_wrapper);
					_create_pagination_review_table(tbl_review_id,tbl_review_pagination_id,autoreview_list_sorted);
				}else{
					autoreview_list_sorted.forEach((obj) => {
						let html_tr = _construct_review_table_row_html_str(obj);
						let $tr = $(html_tr).appendTo($tbody_review);
					});
				}

				// detail row: paper table wrapper 
				let $tbl_paper_wrapper = $(`<div id="vgp-paper-table-wrapper-${id_subfix}" class="vgp-paper-table-wrapper" data-mondo_id="${indicated_panel_mondo_id}" data-ncbi_gene_id="${ncbi_gene_id}" data-idx="${i}">`).appendTo($td_detail_wrapper);
				$('<div>').addClass('loading').appendTo($tbl_paper_wrapper);
			
				i++;
			}
		}
	}

	if(entity_max_length <= 15){
		return 250;
	}else{
		return 320;
	}

}

function _create_pagination_review_table(tbl_review_id_in,tbl_review_pagination_id,autoreview_list_sorted){
	const tbl_review_id = tbl_review_id_in;
	$('#'+tbl_review_pagination_id).pagination({
		dataSource: autoreview_list_sorted,
		pageSize: 10,
		callback: function (data, pagination) {
			let $tableBody = $(`#${tbl_review_id} tbody`);
			$tableBody.empty();
			data.forEach(item => {
				$tableBody.append(_construct_review_table_row_html_str(item));
			});
		}
	});		
}

function _construct_review_table_row_html_str(obj){
	let tr = `<tr Class="vgp-subtable-datarow">`;
					
	let rating_def = 'rating' in obj ? _check_rating_def(obj.rating) : RATING_NORATING;
	tr += `<td><span class="vgp-rating-tag ${RATING_CLASS_HASH[rating_def]}">${rating_def}</span></td>`;

	let disease_text = obj.mondo_en;
	if(lang === 'ja' && "mondo_ja" in obj && obj.mondo_ja) disease_text= obj.mondo_ja;
	let disease_url = `/panel_detail?panel_id=${obj.reference_mondo_id}`;
	disease_text = `<a href="${disease_url}" target="_blank">${disease_text}<svg></svg></a>`;
	tr += `<td>${disease_text}</td>`;

	let source_text = "";
	if('source' in obj){
		let source_url = 'source_url' in obj ? obj.source_url : "";
        if(source_url){
			source_text = `<a href="${source_url}" target="_blank">${obj.source}<svg></svg></a>`
		}else{
			source_text = obj.source;
		}
	}
	tr += `<td>${source_text}</td>`;

	let moi_text = "";
	if('moi_ja' in obj || 'moi_en' in obj){
		moi_text = obj.moi_ja;
	    if(lang !== 'ja') moi_text = obj.moi_en;
    }
	tr += `<td>${moi_text}</td>`;

	tr += '</tr>';
	return tr;				
}




function _update_panel_entity_name_width(len){
	if(len > 250 ) $('.vgp-panel-entity-name').addClass('long');
}

function _contruct_popup_content_val(key, hash, delimer) {
	if (!_isExistVal(key, hash)) return '';
	if (_isEmpty(hash[key])) return '';
	if (_isArray(hash[key])) {
		if (_isEmpty(delimer)) return hash[key].join(',');
		return hash[key].join(delimer);
	}
	return hash[key];
}


function _contruct_popup_content(gene_id, popup_data) {
	let max_text_len = gene_id.length;
	let popup_content_type_of_gene = _contruct_popup_content_val('type_of_gene',popup_data);
	if(_isEmpty(popup_content_type_of_gene)){
		return ['no data found for '+ gene_id, max_text_len];
	}

	let popup_content_ncbi_gene_url	   = _contruct_popup_content_val('ncbi_gene_url',popup_data);
	let popup_content_hgnc_gene_url	   = _contruct_popup_content_val('hgnc_gene_url',popup_data);
	let popup_content_hgnc_gene_symbol = _contruct_popup_content_val('hgnc_gene_symbol',popup_data);
	let popup_content_synonym		   = _contruct_popup_content_val('synonym',popup_data,', ');
	let popup_content_full_name		   = _contruct_popup_content_val('full_name',popup_data);
	let popup_content_other_full_name  = _contruct_popup_content_val('other_full_name',popup_data,', ');
	let popup_content_summary		   = _contruct_popup_content_val('ncbi_gene_summary',popup_data,', ');
	let popup_content_location		   = _contruct_popup_content_val('location',popup_data);
	
	if(popup_content_hgnc_gene_symbol)					  max_text_len  = 60;
	if(max_text_len < popup_content_synonym.length)			max_text_len = popup_content_synonym.length;
	if(max_text_len < popup_content_full_name.length)		max_text_len = popup_content_full_name.length;
	if(max_text_len < popup_content_other_full_name.length) max_text_len = popup_content_other_full_name.length;
	if(max_text_len < popup_content_summary.length)			max_text_len = popup_content_summary.length;
	if(max_text_len < popup_content_type_of_gene.length)	max_text_len = popup_content_type_of_gene.length;
	if(max_text_len < popup_content_location.length)		max_text_len = popup_content_location.length;

	let content =
	'<table>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">NCBI Gene ID</th>'+
		'<td><a href=\"'+popup_content_ncbi_gene_url+'\" target=\"_blank\">'+gene_id+'</a></td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">HGNC symbol</th>'+
		'<td><a href=\"'+popup_content_hgnc_gene_url+'\" target=\"_blank\">'+popup_content_hgnc_gene_symbol+'</a></td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Synonym</th>'+
		'<td>'+popup_content_synonym+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Full name</th>'+
		'<td>'+popup_content_full_name+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Other full name</th>'+
		'<td>'+popup_content_other_full_name+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Summary</th>'+
		'<td>'+popup_content_summary+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Type of gene</th>'+
		'<td>'+popup_content_type_of_gene+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Location</th>'+
		'<td>'+popup_content_location+'</td>'+
	  '</tr>'+
	  '<tr>'+
		'<th class=\"pcf-popup-gene\">Link</th>'+
		'<td>'+
		  '<a href=\"http://www.hgmd.cf.ac.uk/ac/gene.php?gene='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">HGMD</a>'+
		  '<a href=\"https://www.ncbi.nlm.nih.gov/clinvar/?term='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">ClinVar</a>'+
		  '<a href=\"https://grch38.togovar.org/?mode=simple&term='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">TogoVar</a>'+
		  '<a href=\"https://www.ncbi.nlm.nih.gov/research/litvar2/docsum?text='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">LitVar</a>'+
		  '<a href=\"https://www.ncbi.nlm.nih.gov/research/pubtator3/docsum?text='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">PubTator</a>'+
		  '<a href=\"https://www.dgidb.org/results?searchType=gene&searchTerms='+popup_content_hgnc_gene_symbol+'\" target=\"_blank\">DGIdb</a>'+
		'</td>'+
	  '</tr>'+
	'</table>';

	return [content, max_text_len];
}


function _vgp_summary_control(btn){
	let $button  = $(btn);
	let table_id = $button.data('table-id');

	let cnt = $button.data('cnt');

	if($button.data('relative-id')){

		if(!cnt) return;

		let relative_id = $button.data('relative-id');
		let $relative_btn = $("#"+relative_id);
		if($relative_btn.hasClass('vgp-active')){
			let relative_table_id = $button.data('relative-table-id');
			$("#"+relative_table_id).hide();
			let relative_cnt = $("#"+relative_id).data('cnt');
			$relative_btn.removeClass('vgp-active')
			$relative_btn.text("Show("+relative_cnt+")");
		}
	}

	$button.toggleClass('vgp-active');

	if($button.hasClass('vgp-active')){

		if(cnt){
			$button.text(`Hide(${cnt})`);
		}else{
			$button.text('Hide');
		}
		$("#"+table_id).show();

		if($("#"+table_id).hasClass('loaded') === false){
			_vgp_load_paper_table_data(table_id);
		}
	}else{
		if(cnt){
			$button.text(`Show(${cnt})`);
		}else{
			$button.text('Show');
		}
		$("#"+table_id).hide();
	}  
}

function _vgp_load_paper_table_data(table_wrapper_id){

	let $table_wrapper = $('#'+table_wrapper_id);

	let mondo_id = $table_wrapper.data('mondo_id').replace('MONDO:','');
	let ncbi_gene_id = $table_wrapper.data('ncbi_gene_id');

	let paper_data_list = [];
	let completed_cnt=0;

	[
		`${URL_GET_PUBTATOR3_PAPER_DATA}?mondo_id=${mondo_id}&ncbi_gene_id=${ncbi_gene_id}`,
		`${URL_GET_PUBCHEM_PAPER_DATA}?mondo_id=${mondo_id}&ncbi_gene_id=${ncbi_gene_id}`
	].forEach((url) =>{
		_makeAjaxRequest(url,
			function(responseData){
				let json_data = JSON.parse(responseData);
				paper_data_list.push(...json_data);

				completed_cnt++;

				if(completed_cnt === 2){
					_create_paper_table(table_wrapper_id,paper_data_list);
				}
			},
			function(){
				completed_cnt++;
				if(completed_cnt === 2){
					_create_paper_table(table_wrapper_id,paper_data_list);
				}
				console.log("ajax error:" + url);
				//alert("ajax error:"+url);
			}
		);
	});
}

function _create_paper_table(table_wrapper_id,paper_data_list){

	let $table_wrapper = $('#'+table_wrapper_id);

	$table_wrapper.empty().addClass('loaded');

	let tbl_id = `${table_wrapper_id}-tbl`;

	let $tbl = $('<table>').attr('id',`${table_wrapper_id}-tbl`).addClass("vgp-paper-table").appendTo($table_wrapper);

	let $colgroup = $('<colgroup>').appendTo($tbl);
	for (let cnt = 0; cnt < PAPER_TBL_HEAD_LIST.length; cnt++) {
		$('<col>').appendTo($colgroup);
	}

	let $thead = $('<thead>').appendTo($tbl);
	let $thead_row = $('<tr>').appendTo($thead);
	for(let idx=0; idx < PAPER_TBL_HEAD_LIST.length; idx++){
		let col_title = PAPER_TBL_HEAD_LIST[idx].title;
		let col_key   = PAPER_TBL_HEAD_LIST[idx].key;
		let $th = $('<th>').appendTo($thead_row);
		let span_html_str = `<span data-sort-id="${idx}" 
									data-sort-method="vgp-sort-method-letter" 
									data-sort-target-row="vgp-subtable-datarow" 
									data-sort-key="${col_key}"
									class="vgp-sorter">${col_title}</span>`;
		$(span_html_str).appendTo($th);
	}
	let $tbody = $('<tbody>').appendTo($tbl);

	paper_data_list.sort(function(a,b){
		let b_date = _formatDateStr(b.date);
		let a_date = _formatDateStr(a.date);
		return new Date(b_date) - new Date(a_date);
	});

	if(paper_data_list.length > 10){
		$tbl.addClass('pagination-table').data('pagination-data', paper_data_list);
		let tbl_pagination_id = `${table_wrapper_id}-pagination`;
		$tbl.data('tbl_review_pagination_id',tbl_pagination_id);
		$tbl.data('pagination_refresh_func', _create_pagination_paper_table);
		$('<div>').addClass('vgp-pagination-wrapper').attr('id', tbl_pagination_id).appendTo($table_wrapper);
		_create_pagination_paper_table(tbl_id,tbl_pagination_id,paper_data_list);
	}else{
		paper_data_list.forEach((obj) => {
			let tr_html = _construct_paper_table_row_html_str(obj);
			$(tr_html).appendTo($tbody);
		});
	}
}


function _create_pagination_paper_table(tbl_id_in,tbl_pagination_id,list_sorted){
	const tbl_id = tbl_id_in;
	$('#'+tbl_pagination_id).pagination({
        dataSource: list_sorted,
        pageSize: 10,
		callback: function (data, pagination) {
			let $tableBody = $(`#${tbl_id} tbody`);
			$tableBody.empty();
			data.forEach(item => {
				$tableBody.append(_construct_paper_table_row_html_str(item));
            });
        }
    });    
}

function _isPaperItemNew(obj){
	if("new_association" in obj && obj["new_association"] == "true"){
		return true;
	}
	return false;
}

function _getNewPaperBadge(){
	return `
		<svg width="36" height="17" viewBox="0 0 36 17" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M35.853 15.3956L31.7327 8.36188L35.811 1.615C35.9078 1.45422 35.9607 1.27033 35.9641 1.08213C35.9675 0.893936 35.9215 0.708193 35.8306 0.543907C35.7397 0.379621 35.6073 0.24269 35.4468 0.147123C35.2864 0.0515558 35.1038 0.000783217 34.9176 0H2.1022C1.54466 0 1.00996 0.223884 0.61572 0.622398C0.221481 1.02091 0 1.56141 0 2.125L0 14.875C0 15.4386 0.221481 15.9791 0.61572 16.3776C1.00996 16.7761 1.54466 17 2.1022 17H34.9491C35.1346 17 35.3168 16.9503 35.4772 16.856C35.6376 16.7618 35.7704 16.6263 35.8623 16.4633C35.9541 16.3004 36.0016 16.1157 36 15.9282C35.9983 15.7407 35.9476 15.5569 35.853 15.3956ZM11.0471 11.8787H9.86983L6.44324 7.2675V11.8894H5.2555V5.3125H6.44324L9.88034 9.93438V5.3125H11.0576L11.0471 11.8787ZM17.7005 6.375H13.9901V7.95812H17.3537V9.02063H13.9901V10.7313H17.7005V11.7938H12.8024V5.3125H17.69L17.7005 6.375ZM26.4141 11.8575H25.2264L23.5972 6.98062L21.968 11.8787H20.7908L18.6886 5.3125H19.9709L21.3584 10.0194L22.956 5.3125H24.2384L25.773 10.0194L27.1709 5.3125H28.4638L26.4141 11.8575Z" fill="#258800"/>
		</svg>
	`;
}

function _construct_paper_table_row_html_str(obj){

	let isNew = _isPaperItemNew(obj);
	
	let tr = `<tr class="vgp-subtable-datarow">`
	let title_text = obj.title;
	if(obj.paper_url){
		title_text = `<div class="title">
						<div class="left">${isNew ? _getNewPaperBadge() : "" }</div>
  						<div class="right">
					      <a href="${obj.paper_url}" target="_blank">${obj.title}<svg></svg></a>
					    </div>
					  </div>`;
	}
	tr += `<td>${title_text}</td>`;
	tr += `<td class="journal">${obj.journal}</td><td>${_formatDateStr(obj.date)}</td><td>${obj.source}</td>`;
	tr += '</tr>';

	return tr;
}



function _vgp_table_sort(btn){

	_vgp_show_loading();

	let $sorter  = $(btn);
	let element  = $sorter.data('sort-id');
	let method	 = $sorter.data('sort-method');
	let inner_target_class = '.' + $sorter.data('sort-inner-target');

	let sortClass = 'vgp-asc';

	if($sorter.hasClass('vgp-asc')){
	  sortClass = 'vgp-dsc';
	}else if($sorter.hasClass('vgp-dsc')){
	  sortClass = 'vgp-asc';
	}

	$sorter.closest('tr').find('.vgp-sorter').removeClass('vgp-dsc').removeClass('vgp-asc');
	$sorter.addClass(sortClass);


	let tbl_id = $sorter.closest('table').attr('id');
	
	if($('#'+tbl_id).hasClass('pagination-table')){

		let key = $sorter.data('sort-key');

		$tbl = $('#'+tbl_id);
		let tbl_review_pagination_id = $tbl.data('tbl_review_pagination_id');
		let data_arr = $tbl.data('pagination-data');
		data_arr.sort((a,b) => {
			let sortNum = 1;
			if(method === 'vgp-sort-method-letter'){
				let a_text = key in a ? a[key] : '';
				let b_text = key in b ? b[key] : '';

				if(a_text === b_text){                
					sortNum = 0;              
				}else if(a_text > b_text){
                
					sortNum = 1;              
				}else{
					sortNum = -1;
				}
			}else if(method === 'vgp-sort-method-rating'){
                let a_rating = RATING_ORDER_HASH[_check_rating_def(a.rating)];
                let b_rating = RATING_ORDER_HASH[_check_rating_def(b.rating)];
                if(a_rating === b_rating){
                  sortNum = 0;
                }else if(a_rating > b_rating){
                  sortNum = 1;
                }else{
                  sortNum = -1;
                }
			}

            if(sortClass === "vgp-dsc") {
              sortNum *= (-1) ;
            }
            return sortNum;
		});
		$tbl.data('pagination-data', data_arr);	
		let func = $tbl.data('pagination_refresh_func');
		func(tbl_id,tbl_review_pagination_id,data_arr);
	}else{
		let arr = $(`#${tbl_id}>tbody>tr`).get();
		arr.sort((a,b) => {
			let sortNum = 1;
			if(method === 'vgp-sort-method-letter'){
			  let a_text = $(a).find("td").eq(element).text();
			  let b_text = $(b).find("td").eq(element).text();
			  if(a_text === b_text){
				sortNum = 0;
			  }else if(a_text > b_text){
				sortNum = 1;
			  }else{
				sortNum = -1;
			  }
			}else if(method === 'vgp-sort-method-innerletter'){
				let a_text = $(a).find("td").eq(element).find(inner_target_class).eq(0).text();
	            let b_text = $(b).find("td").eq(element).find(inner_target_class).eq(0).text();
	            if(a_text === b_text){
	              sortNum = 0;
	            }else if(a_text > b_text){
	              sortNum = 1;
	            }else{
	              sortNum = -1;
	            }
	          }else if(method === 'vgp-sort-method-innernum'){
	            let a_num = parseInt($(a).find("td").eq(element).find(inner_target_class).eq(0).text());
	            let b_num = parseInt($(b).find("td").eq(element).find(inner_target_class).eq(0).text());
	            if(a_num === b_num){
	              sortNum = 0;
	            }else if(a_num > b_num){
	              sortNum = 1;
	            }else{
	              sortNum = -1;
	            }
	          }else if(method === 'vgp-sort-method-rating'){
	            let a_text = $(a).find("td").eq(element).find(inner_target_class).eq(0).text();
	            let b_text = $(b).find("td").eq(element).find(inner_target_class).eq(0).text();
	            let a_rating = RATING_ORDER_HASH[a_text];
	            let b_rating = RATING_ORDER_HASH[b_text];
	            if(a_rating === b_rating){
	              sortNum = 0;
	            }else if(a_rating > b_rating){
	              sortNum = 1;
	            }else{
	              sortNum = -1;
	            }
	          }
			if(sortClass === "vgp-dsc") {
			  // 降順
			  sortNum *= (-1) ;
			}
	
			return sortNum;
		});
		$(`#${tbl_id}>tbody`).append(arr);
	}

	_vgp_hide_loading();
}


function _vgp_open_gene_detail(vgp_panel_name_obj){

	let $btn = $(vgp_panel_name_obj);
	let panel_id     = $btn.data('panel_id')
	let panel_name   = $btn.data('panel_name');
	let ncbi_gene_id = $btn.data('ncbi_gene_id');
	let gene_title   = $btn.data('hgnc_gene_symbol');

	let urlstr = "panel_id="	+ encodeURIComponent(panel_id) + "&" +
				 "panel_title=" + encodeURIComponent(panel_name) + "&" +
				 "gene_id="	 + encodeURIComponent(ncbi_gene_id)+ "&"+
				 "gene_title="  + encodeURIComponent(gene_title)+ "&";
	urlstr = "/panel_gene_detail?" + urlstr;
	window.open(urlstr, "_blank");
}

function _attach_panel_gene_name_event(){
	$(".vgp-panel-gene-name").each(function(i,e){
		$(e).on('click',function(event){
			event.preventDefault();
			let href = $(this).find('span').attr('href');
			window.open(href, "_blank");
		});

		let gene_id = $(e).data('gene-id');
		tippy(e, {
			arrow:         false,
			allowHTML:     true,
			appendTo:      document.body,
			animation:     'scale',
			animationFill: true,
			//trigger:       'click',
			maxWidth:      400,
			strategy:      'fixed',
			interactive:   true,
			theme:         'pcf-popup',
			placement:     'bottom-start',
			content:       'Loading...',
			offset: [0, 0],
			popup_url: URL_GET_GENE_TOOLTIP_DATA_BY_GENE_ID + gene_id,
			popup_id: gene_id,
			onCreate(instance) {
				// Setup our own custom state properties
				instance._isFetching = false;
				instance._src = null;
				instance._error = null;
			},
			onShow(instance) {
				if (instance._isFetching || instance._src || instance._error) {return;}

				instance._isFetching = true;

				let url = instance.props.popup_url;
				let gene_id = instance.props.popup_id;

				$.ajax({
					url: url,
					type: 'GET',
					async: true,
					dataType: 'text'
				}).done(function (data, textStatus, jqXHR) {
					let json_data = JSON.parse(data);
					let [content, max_text_len] = _contruct_popup_content(gene_id, json_data);
					if (max_text_len < 40) {
						instance.setProps({ maxWidth: 500 });
					} else if (max_text_len < 60) {
						instance.setProps({ maxWidth: 600 });
					} else if (max_text_len < 80) {
						instance.setProps({ maxWidth: 700 });
					} else if (max_text_len < 120) {
						instance.setProps({ maxWidth: 800 });
					} else {
						instance.setProps({ maxWidth: 850 });
					}
					instance.setContent(content);
					instance._src = 'done';
				}).fail(function (jqXHR, textStatus, errorThrown) {
					// Fallback if the network request failed
					instance.setContent(`Request failed from server.`);
					instance._src = null;
				}).always(function () {
					instance._isFetching = false;
				});
			}
		});
	});

}
