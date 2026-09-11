const	URL_TOP                                     = '/panelsearch_nanbyo',
		URL_GET_PANEL_DATA_BY_NANDO_ID				= '/sparqlist/api/ps_get_panel_data_by_nando_id?nando_id=',
		URL_GET_PANEL_GENE_BY_NANDO_ID				= '/sparqlist/api/ps_get_gene_by_nando_id_250516_test?nando_id=',
		URL_GET_PANEL_DEFINITIVE_GENE_BY_NANDO_ID	= '/sparqlist/api/ps_get_definitive_gene_by_nando_id_250516_test?nando_id=',
		URL_GET_PANEL_AUTOREVIEW_GENE_BY_NANDO_ID	= '/sparqlist/api/ps_get_autoreview_gene_by_nando_id_250516_test?nando_id=',
		URL_GET_GENE_TOOLTIP_DATA_BY_GENE_ID		= '/sparqlist/api/pcf_get_gene_tooltip_data_by_ncbi_gene_id?ncbi_gene_id=',
		URL_GET_PANEL_UPSTREAM_HIERARCHY			= '/panelsearch_nanbyo_get_panel_upstream_trace',
		URL_GET_TREEVIEW_DESCENDANT					= '/panelsearch_nanbyo_get_treeview_descendant',
		URL_PANEL_ENTITY_DETAIL						= '/panelsearch_nanbyo_panel_entity_detail',
		URL_PANEL_DETAIL							= '/panelsearch_nanbyo_panel_detail',
		URL_GET_PANEL_REVIEW						= '/panelsearch_nanbyo_get_panel_review',
		URL_GET_PANEL_ENTITY_DEFINITION			    = '/panelsearch_nanbyo_get_panel_entity_definition',
		URL_LOAD_MULTI_CLASS                        = '/panelsearch_nanbyo_load_multi_class',
		URL_GET_PUBTATOR3_PAPER_COUNT_BY_NANDO_ID   = '/sparqlist/api/ps_get_pubtator3_gene_id_paper_count_by_nando_id?nando_id=',
		URL_GET_PUBCHEM_PAPER_COUNT_BY_NANDO_ID	    = '/sparqlist/api/ps_get_pubchem_gene_id_paper_count_by_nando_id?nando_id=',
		URL_GET_PUBTATOR3_PAPER_DATA				= '/sparqlist/api/ps_get_pubtator3_paper_data_by_nando_id_gene_id',
		URL_GET_PUBCHEM_PAPER_DATA				    = '/sparqlist/api/ps_get_pubchem_paper_data_by_nando_id_gene_id',
		URL_MOI_TREEVIEW_DATA_EN                    = '/static/data/panelsearch_nanbyo/moi-en.20251216.json',
		URL_MOI_TREEVIEW_DATA_JA                    = '/static/data/panelsearch_nanbyo/moi-ja.20251216.json',
		URL_LOAD_CHANGE_HISTORY                     = '/panelsearch_nanbyo_get_panel_all_change_history';

const DATAKEY_DEFINITIVE = 'panel_definitive_gene_data';
const DATAKEY_AUTOREVIEW = 'panel_autoreview_gene_data';
const DATAKEY_REVIEW     = 'panel_review';

const LABEL_SOURCE_HEALTH_MINISTRY = "診断基準(厚生労働省)";
const TOOLTIP_TEXT_SOURCE_HEALTH_MINISTRY = "厚生労働省が公表する「概要、診断基準等」において、遺伝学的検査による診断基準として定められている遺伝子";

const RATING_REVIEW_ARRAY = [
		{rating_key: RATING_DEFINITIVE,	isSeparatorExists: false},
		{rating_key: RATING_STRONG,		isSeparatorExists: false},
		{rating_key: RATING_MODERATE,	isSeparatorExists: false},
		{rating_key: RATING_SUPPORTIVE,	isSeparatorExists: true},
		{rating_key: RATING_LIMITED,	isSeparatorExists: false},
		{rating_key: RATING_DISPUTED,	isSeparatorExists: false},
		{rating_key: RATING_REFUTED,	isSeparatorExists: false},
		{rating_key: RATING_ANIMAL,		isSeparatorExists: false},
		{rating_key: RATING_NOKNOWN,	isSeparatorExists: false},
		{rating_key: RATING_NORATING,	isSeparatorExists: false}
	];

const REVIEW_TBL_HEAD = {
	'en' : ['Rating', 'Disease', 'Mode of inheritance', 'Reviewer'],
	'ja' : ['Rating', 'Disease', 'Mode of inheritance', 'Reviewer']
};

const REFERENCE_TBL_HEAD = {
    'en' : ['Rating', 'Disease', 'Mode of inheritance', 'Reference'],
    'ja' : ['Rating', 'Disease', 'Mode of inheritance', 'Reference']
};

const PAPER_TBL_HEAD_LIST = [
	{title: 'Title',  key: 'title'},
	{title: 'Journal',key: 'journal'},
	{title: 'Date',   key: 'date'},
	{title: 'Source', key: 'source'}
];


const NO_PANEL_ID_LIST = [
	'ALL',
	'NANDO:0000003',
	'UNSPECIFIED',
	'NANDO:1100001',
	'NANDO:1100002',
	'NANDO:1100003',
	'NANDO:1100004',
	'NANDO:1100005',
	'NANDO:1100006',
	'NANDO:1100007',
	'NANDO:1100008',
	'NANDO:1100009',
	'NANDO:1100010',
	'NANDO:1100011',
	'NANDO:1100012',
	'NANDO:1100013',
	'NANDO:1100014',
	'NANDO:1100015'
];


const LANGUAGE_EN="en",LANGUAGE_JA="ja",
	SOURCE_LIST  = [
		{
			key: 'notification_number',
			label:  {[LANGUAGE_EN]:'Notification number : ', [LANGUAGE_JA]:'告示番号 : '},
			isLink: false
		},
		{
			key: 'mhlw_url',
			label:  {[LANGUAGE_EN]:'Overview/Diagnostic criteria', [LANGUAGE_JA]:'概要、診断基準等'},
			isLink: true
		},
		{
			key: 'source',
			label:  {[LANGUAGE_EN]:'Clinical record form',[LANGUAGE_JA]:'臨床調査個人票・医療意見書'},
			isLink: true
		},
		{
			key: 'nanbyou_url',
			label:  {[LANGUAGE_EN]:'Information center for intractable disease',[LANGUAGE_JA]:'難病情報センター'},
			isLink: true
		},
		{
			key: 'nando_url',
			label:  {[LANGUAGE_EN]:'NanbyoData',[LANGUAGE_JA]:'NanbyoData'},
			isLink: true
		}
	];


function _vgp_summary_control(btn){
	let $button  = $(btn);
	let table_id = $button.data('table-id');

	if($button.data('relative-id')){

		if(!($button.data('cnt'))) return;

		let relative_ids_str = $button.data('relative-id');
		let relative_ids_list = relative_ids_str.split(',');

		let relative_table_ids_str = $button.data('relative-table-id');
		let relative_table_ids_list = relative_table_ids_str.split(',');

		for(let i=0; i< relative_ids_list.length; i++){
			let relative_id = relative_ids_list[i];
			let $relative_btn = $("#"+relative_id);
			if($relative_btn.hasClass('vgp-active')){

				let relative_table_id = relative_table_ids_list[i];

				$("#"+relative_table_id).hide();
				let relative_cnt = $("#"+relative_id).data('cnt');
				$relative_btn.removeClass('vgp-active');

				if(!$relative_btn.hasClass('paper')) $relative_btn.text("Show ("+relative_cnt+")");
			}
		}
	}

	$button.toggleClass('vgp-active');

	if($button.hasClass('vgp-active')){
		if(!$button.hasClass('paper')){
			let display_text = 'Hide';
			if($button.data('cnt')){
				display_text = display_text + " (" + $button.data('cnt')  + ")";
			}
			$button.text(display_text);
		}
		$("#"+table_id).show();

		if($("#"+table_id).hasClass('loaded') === false){
			_vgp_load_paper_table_data(table_id);
		}

	}else{
		if(!$button.hasClass('paper')){
			let display_text = "Show";
			if($button.data('cnt')){
				display_text = display_text + " (" + $button.data('cnt')  + ")";
			}
			$button.text(display_text);
		}
		$("#"+table_id).hide();
	}  
}


function _vgp_load_paper_table_data(table_wrapper_id){
	let $table_wrapper = $('#'+table_wrapper_id);
	let nando_id = $table_wrapper.data('nando_id');
		nando_id = nando_id.replace('NANDO:','');
	let ncbi_gene_id = $table_wrapper.data('ncbi_gene_id');
	let paper_data_list = [];
	let completed_cnt=0;
	[
		`${URL_GET_PUBTATOR3_PAPER_DATA}?nando_id=${nando_id}&ncbi_gene_id=${ncbi_gene_id}`,
		`${URL_GET_PUBCHEM_PAPER_DATA}?nando_id=${nando_id}&ncbi_gene_id=${ncbi_gene_id}`
	].forEach((url) =>{
		utils_makeAjaxRequest(url,
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
				//alert("ajax error:" + url);
				console.log("ajax error:" + url);
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
		if(idx===0) $th.addClass('pl-2');
		let span_html_str = `<span data-sort-id="${idx}"
									data-sort-method="vgp-sort-method-letter"
									data-sort-target-row="vgp-subtable-datarow"
									data-sort-key="${col_key}"
									class="vgp-sorter">${col_title}</span>`;
		$(span_html_str).appendTo($th);
	}
	let $tbody = $('<tbody>').appendTo($tbl);

	paper_data_list.sort(function(a,b){
		return new Date(utils_formatDateStr(b.date)) - new Date(utils_formatDateStr(a.date));
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

function _construct_paper_table_row_html_str(obj){
	let tr = `<tr class="vgp-subtable-datarow">`

	let title_text = obj.title;
	if(obj.paper_url){
		title_text = `<a href="${obj.paper_url}" target="_blank">${obj.title}<svg></svg></a>`;
	}
	tr += `<td>${title_text}</td>`;
	tr += `<td>${obj.journal}</td><td>${utils_formatDateStr(obj.date)}</td><td>${obj.source}</td>`;
	tr += '</tr>';

	return tr;
}


function _vgp_table_sort(btn,is_manually_triggered){

	_vgp_show_loading();

	let $sorter   = $(btn);
	let element   = $sorter.data('sort-id');
	let method	  = $sorter.data('sort-method');
	let inner_target_class = '.' + $sorter.data('sort-inner-target');

	let sortClass = 'vgp-asc';
	if($sorter.hasClass('vgp-asc')){
		if(!is_manually_triggered) sortClass = 'vgp-dsc';
	}else if($sorter.hasClass('vgp-dsc')){
		if(is_manually_triggered) {
			sortClass = 'vgp-dsc';
		}else{
			sortClass = 'vgp-asc';
		}
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
				let a_rating = RATING_ORDER_HASH[utils_check_rating_def(a.rating)];
				let b_rating = RATING_ORDER_HASH[utils_check_rating_def(b.rating)];
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
				let a_text = $(a).find("td").eq(element).find(inner_target_class).eq(0).text();
				let b_text = $(b).find("td").eq(element).find(inner_target_class).eq(0).text()
				let a_num = a_text ? parseInt(a_text) : -1;
				let b_num = b_text ? parseInt(b_text) : -1;
				if(a_num === b_num){
					sortNum = 0;
				}else if(a_num > b_num){
					sortNum = 1;
				}else{
					sortNum = -1;
				}
			}else if(method === 'vgp-sort-method-rating'){
				let a_text = $(a).find(inner_target_class).eq(0).text();
				let b_text = $(b).find(inner_target_class).eq(0).text();
				let a_rating = RATING_ORDER_HASH[a_text];
				let b_rating = RATING_ORDER_HASH[b_text];
				if(a_rating === b_rating){
					sortNum = 0;
				}else if(!a_text){
					sortNum = -1;
				}else if(!b_text){
					sortNum = 1;
				}else if(a_rating > b_rating){
					sortNum = -1;
				}else{
					sortNum = 1;
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


function _vgp_table_filter(filter){
	let $filter		 = $(filter);
	let filterValue  = $filter.val().toLowerCase();
	let table_id     = $filter.data('table-id');
	let target_class = '.' + $filter.data('sort-inner-target');

	//let is_native_switch_on = $('#vgp-panel-gene-table').hasClass('native');

    let filtered_gene_name_hash = {};
    $(`#${table_id}>tbody>tr`).filter(function(){
        let $tr = $(this);

        $tr.removeClass('hidden');
        //if(is_native_switch_on && $tr.hasClass('not_native')) return false;

        let target_text = $tr.find(target_class).eq(0).text().toLowerCase();
        let hit = target_text.indexOf(filterValue);
        if(hit > -1){
            filtered_gene_name_hash[target_text] = 1;
            return true;
        }else{
            $tr.addClass('hidden');
            return false;
        }
    });

    $('.vgp-panel-genes-num').text(Object.keys(filtered_gene_name_hash).length);
}




function _vgp_open_entity_detail(vgp_panel_name_obj){
	
	let $panel = $(vgp_panel_name_obj);
	let panel_id		 = $panel.data('panel_id');
	let nando_id		 = $panel.data('nando_id');
	let gene_id			 = $panel.data('gene_id');
	let gene_symbol	  = $panel.data('gene_symbol');
	let entity_name	  = $panel.data('entity_name');
	let entity_type_id   = $panel.data('entity_type_id');
	let rating		   = $panel.data('rating');
	let panel_name	   = $panel.data('panel_name')? $panel.data('panel_name') : $('#vgp-panel-name').text();

	let urlstr ="panel_id="			+ encodeURIComponent(panel_id)		 + "&" +
				"panel_name="	   + encodeURIComponent(panel_name)	   + "&" +
				"nando_id="			+ encodeURIComponent(nando_id)		 + "&" +
				"gene_id="			+ encodeURIComponent(gene_id)		   + "&" +
				"gene_symbol="	  + encodeURIComponent(gene_symbol)	  + "&" +
				"entity_name="	  + encodeURIComponent(entity_name)	  + "&" +
				"entity_type_id="   + encodeURIComponent(entity_type_id)   + "&" +
				"rating="		   + encodeURIComponent(rating)		   + "&" +
				"lang="+lang;
	urlstr = URL_PANEL_ENTITY_DETAIL + "?" + urlstr;
	window.open(urlstr, "_blank");
}

function _create_panel_link_html_str(nando_id, panel_data_obj){
	let panel_link_html_str = "";
	[
		{key_id: 'nando_id',	key_url: 'nando_url'   },
		{key_id: 'omim_id',		key_url: 'omim_url'	   },
		{key_id: 'orphanet_id',	key_url: 'orphanet_url'},
		{key_id: 'kegg_id',		key_url: 'kegg_url'	   },
		{key_id: 'icd10_id',	key_url: 'icd10_url'   }
	].forEach((e) => {
		if(e.key_id === "nando_id"){
			panel_link_html_str += "<a class=\"vgp-link\" href=\"" + panel_data_obj.nando_url +"\" target=\"_blank\">"+ nando_id +"</a>";
		}else if(e.key_id in panel_data_obj && !utils_isEmpty(panel_data_obj[e.key_id])){
			panel_link_html_str += "<a class=\"vgp-link\" href=\"" + panel_data_obj[e.key_url] +"\" target=\"_blank\">"+ panel_data_obj[e.key_id] +"</a>"; 
		}
	});

	return panel_link_html_str;
}

function _vgp_init_multi_class(nando_id, panel_data_obj, panel_id){
	utils_init_type_hash(panel_data_obj.mode_of_inheritance_arr, panel_data_obj.entity_type_arr, panel_data_obj.rating_type_arr);
}

function _vgp_init_ui_panel_data(nando_id, panel_data_obj, panel_id){
   
	if(!panel_data_obj || panel_data_obj.length === 0)return;
	let panel_data = panel_data_obj[0];
	
	let title_panel_name = panel_data.label_en;
	if(lang === "ja" && 'label_ja' in panel_data && panel_data.label_ja){
		title_panel_name = panel_data.label_ja;
	}

	$('#vgp-panel-name')
		.data('panel_id', panel_id)
		.data('nando_id', nando_id)
		.data('panel_title', title_panel_name)
		.text(title_panel_name);

	if(lang === "ja" && 'label_hira' in panel_data && panel_data.label_hira){
		$('<rt>').text(panel_data.label_hira).appendTo($('#vgp-panel-name'));
	}

	let $panel_summary_table = $('#vgp-panel-summary-table');

	let $tr_source = $('<tr>').appendTo($panel_summary_table);
	let $td_source = $('<td>').attr({'colspan':'2'}).addClass("vgp-source-wrapper").appendTo($tr_source);
	SOURCE_LIST.forEach((item) => {
		if(item.key in panel_data && !utils_isEmpty(panel_data[item.key])){
			if(item.key === 'nando_url' && nando_id.startsWith("NANDO:300000")){
			}else{
				if(item.isLink){
					let text = item.label[lang];
					let href = panel_data[item.key];
					$('<a>').attr('target','_blank').attr('href', href).text(text).appendTo($td_source);
				}else{
					let text  = item.label[lang] + panel_data[item.key];
					let $span = $('<span>').addClass('id').text(text).appendTo($td_source);
				}
			}
		}
	});

	let definition_text = "";
	if('description' in panel_data && !utils_isEmpty(panel_data.description)){
		definition_text = panel_data.description;
	}else if('mondo_description' in panel_data && !utils_isEmpty(panel_data.mondo_description)){
		definition_text = panel_data.mondo_description;
	}else if('medgen_definition' in panel_data && !utils_isEmpty(panel_data.medgen_definition)){
		definition_text = panel_data.medgen_definition;
	}

	[
		{'title': 'Definition:','content': definition_text},
		{'title': 'Link:', 'content': _create_panel_link_html_str(nando_id, panel_data)}
	].forEach((e) => {
		let $tr = $('<tr>').appendTo($panel_summary_table);
		$('<th>').text(e.title).appendTo($tr);
		$('<td>' + e.content + '</td>').appendTo($tr);
	});
}


function _vgp_init_ui_panel_version(panel_id, panel_version_info_arr){

	let $panel_version_wrapper = $('#vgp-panel-version-wrapper');

	if(panel_version_info_arr.length > 0){

		let $panel_version_wrapper = $('#vgp-panel-version-wrapper');

		for(i=0;i<=1;i++){
			if(i==1 && panel_version_info_arr.length<2){
				break;
			}
			let $sub_wrapper = $('<div>').addClass('d-flex flex-row').appendTo($panel_version_wrapper);

			let $version_sub_left = $('<div>').addClass('vgp-version-sub').appendTo($sub_wrapper);
			$('<span>')
				.addClass('vgp-version-label')
				.text(i===0 ? 'Latest version: ' : 'Previously version: ')
				.appendTo($version_sub_left);

			let $version_sub_right = $('<div>').addClass('vgp-version-sub').appendTo($sub_wrapper);
			$('<span>')
				.addClass('vgp-version-date mr-2')
				.text(utils_format_date_to_day(panel_version_info_arr[i].created_at))
				.appendTo($version_sub_right);

			if(panel_version_info_arr[i].panel_type === TYPE_SPECIFIED){
				let version_item_arr = panel_version_info_arr[i].panel_versions;
				for(let version_item of version_item_arr){
					$('<span>')
						.addClass('vgp-version-date mr-2')
						.text(`${version_item}`)
						.appendTo($version_sub_right);
				}
			}
		}
	}

	let $wrapper = $('#ul-version-comments');
	for(let change of panel_version_info_arr){

		let version_item_arr = change.panel_versions;

		let html_str = `
			<li>
				<div class="time">${utils_format_date_to_day(change.created_at)}</div>
			`;

		if(change.panel_type === TYPE_SPECIFIED){
			for(let version_item of version_item_arr){
				html_str += `<label>Ver ${version_item}</label>`;
			}
		}
		
		html_str += `
				<p>${change.comment}</p>
			</li>`;
		$(html_str).appendTo($wrapper);
	}
}

var POPUP_TREEVIEW_ROOT_PANEL_ID = "";
function _vgp_init_ui_breadcrumblist(json_data, nando_id){

	let title_name_arr = [];
	let title_nando_id_arr = [];
	let title_panel_id_arr = []
	function travese(json, path_panel_id_arr, path_nando_id_arr, path_name_arr){
		for (let node of json){
			let path_nando_id = node.nando_id;
			let path_name	  = (lang === 'ja') ? node.panel_name_ja: node.panel_name_en;
			let path_panel_id = node.panel_id;

			if(path_nando_id === nando_id){
				title_name_arr.push([...path_name_arr, path_name]);
				title_nando_id_arr.push([...path_nando_id_arr, path_nando_id]);
				title_panel_id_arr.push([...path_panel_id_arr, path_panel_id]);
			}else{
				if('children' in node && node.children.length > 0){
					travese(node.children,[...path_panel_id_arr, path_panel_id], [...path_nando_id_arr, path_nando_id], [...path_name_arr, path_name]);
				}
			}
		}
	}

	travese(json_data,[],[],[]);

	let $wrapper = $('#vgp-breadcrumblist-wrapper').addClass("d-flex flex-column w-100");

	let separator = `<span class="color-white"> &gt; </span>`;

	for (let i = 0; i < title_name_arr.length; i++){
		let $subwrapper = $('<div>').appendTo($wrapper);

		let out_arr = [];
		for(let j = 1; j< title_name_arr[i].length; j++){

			let name	 = title_name_arr[i][j];
			let nando_id = title_nando_id_arr[i][j];
			let panel_id = title_panel_id_arr[i][j];

			let link_href = `${URL_PANEL_DETAIL}?panel_id=${panel_id}&nando_id=${nando_id}&lang=${lang}`;
			if(j === 1 || nando_id.indexOf('NANDO:11') >= 0){
				link_href = URL_TOP;
			}
			let link_str = `<a class="vgp-home" href="${link_href}">${name}</a>`;
			if( j === title_name_arr[i].length -1 ){
				link_str = `<span class="vgp-target">${name}</a>`;
			}
			out_arr.push(link_str);
		} 		
		let html_str = out_arr.join(separator);		
		$subwrapper.html(html_str);
	}
}


var MOI_ARR = null;
function _vgp_init_ui_reviewer(nando_id, panel_review_data, mode_of_inheritance_arr){

	MOI_ARR = mode_of_inheritance_arr;

	// init reviewers tab panel
	let hash = {};
	for(let panel_review of panel_review_data){
		//let key = panel_review.first_name_en + " " + panel_review.last_name_en;
		//hash[key] = panel_review.affiliation;
		let key = panel_review.user_id;
		if(!(key in hash)){
			hash[key] = [];
		}
		hash[key].push(panel_review);
	}

	let $wrapper = $('#vgp-reviewer-table-tbody');

	let sorted = Object.keys(hash).sort(function(a,b){
		let panel_review_a = hash[a][0];
		let name_a = panel_review_a.first_name_en + " " + panel_review_a.last_name_en;

		let panel_review_b = hash[b][0];
		let name_b = panel_review_b.first_name_en + " " + panel_review_b.last_name_en;

		return name_a.localeCompare(name_b);
	});

	for(let key of sorted){

		let panel_review = hash[key][0];
		let name = panel_review.first_name_en + " " + panel_review.last_name_en;

		let html_str = `
			<tr class="vgp-table-datarow">
				<td class="font-weight-bold">${name}</td>
				<td>${panel_review.affiliation}</td>
				<td><button id="btn-reviewer-reviews-${key}" class="btn-reviewer-reviews">${hash[key].length} reviews</button></td>
			</tr>
			`;
		$(html_str).appendTo($wrapper);

		hash[key].sort(function(a,b){
			g1 = a.gene_symbol;
			g2 = b.gene_symbol;
			return g1.localeCompare(g2);
		});

		let popup_html_str = `
			<div id="popup-reviewer-reviews-${key}" class="popup-reviewer-reviews">
				<div class="font-weight-bold">
					Reviews written by ${name} (Total ${hash[key].length})
				</div>
				<div class="reviewer-reviews-table-intro">
					List of reviews that ${name} has submitted for genes in this panel
				</div>
				<table id="reviewer-reviews-table">
					<thead>
						<tr>
							<th>Gene</th>
							<th>Rating</th>
							<th>Disease</th>
							<th>Mode of inheritance</th>
							<th>Review date</th>
							<th>view review</th>
						</tr>
					</thead>
					<tbody id="reviewer-reviews-table-tbody"></tbody>
				</table>
				<div class="d-flex justify-content-between mt-3">
					<div> </div>
					<div id="paginationText"></div>
					<div id="paginationContainer"></div>
				</div>
			</div>
		`;

		let btn = document.getElementById(`btn-reviewer-reviews-${key}`);
		tippy(btn, {
			arrow:         true,
			allowHTML:     true,
			appendTo:      document.body,
			animation:     'scale',
			animationFill: true,
			trigger:       'click',
			maxWidth:      'none',
			strategy:      'fixed',
			interactive:   true,
			theme:         'pcf-popup',
			placement:     'top',
			content:       popup_html_str,
			container_id:  `popup-reviewer-reviews-${key}`,
			reviews:       hash[key],
			offset:        [0, 0],
			onCreate(instance) {
				instance._isInit = false;
			},
			onShown() {
				if (this._isInit) {return;}

				const root_container = document.getElementById(this.container_id);
				const container = root_container.querySelector('#paginationContainer');
				const textarea = root_container.querySelector('#paginationText');
				const tbody = root_container.querySelector('#reviewer-reviews-table-tbody');
				try {
					$(container).pagination({
						dataSource: this.reviews,
						pageSize: 5,
                        callback: function(data, pagination) {

							const start = (pagination.pageNumber - 1) * pagination.pageSize + 1;
							const end = Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalNumber);
							const total = pagination.totalNumber;
        
							// 显示统计信息
							textarea.innerHTML = `Showing ${start} to ${end} of ${total} reviews`;

							let $tableBody = $(tbody);
							$tableBody.empty();
							data.forEach(pr => {
								let urlstr ="panel_id="           + encodeURIComponent(pr.panel_id)       + "&" +
											"panel_name="         + encodeURIComponent(pr.panel_name)     + "&" +
											"nando_id="           + encodeURIComponent(pr.nando_id)       + "&" +
											"gene_id="            + encodeURIComponent(pr.gene_id)        + "&" +
											"gene_symbol="        + encodeURIComponent(pr.gene_symbol)    + "&" +
											"entity_name="        + encodeURIComponent(pr.entity_name)    + "&" +
											"entity_type_id="     + encodeURIComponent(pr.entity_type_id) + "&" +
											"rating="             + encodeURIComponent(pr.rating)         + "&" +
											"original_review_id=" + pr.original_review_id                 + "&" +
											"lang="+lang;
								urlstr = URL_PANEL_ENTITY_DETAIL + "?" + urlstr;

								let moi_arr = utils_mode_of_inheritances_ids_to_names_list(pr.mode_of_inheritances,MOI_ARR);

								let moi_html_str = `<div class="d-flex flex-column">`;
								for(let moi_name of moi_arr){
									moi_html_str += `<div>${moi_name}</div>`;
								}
								moi_html_str += '</div>';

								let row_html_str = `
									<tr>
										<td>${pr.gene_symbol}</td>
										<td><span class="vgp-rating-tag ${RATING_CLASS_HASH[pr.rating]}">${pr.rating}</span></td>
										<td>${(lang === 'ja')?pr.panel_name_ja : pr.panel_name_en}</td>
										<td>${moi_html_str}</td>
										<td>${utils_format_date_to_day(pr.modified_at)}</td>
										<td>
											<a href="${urlstr}" target="_blank" class="d-flex">
												<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#276749">
													<path d="M200-200h560v-367L567-760H200v560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h400l240 240v400q0 33-23.5 56.5T760-120H200Zm80-160h400v-80H280v80Zm0-160h400v-80H280v80Zm0-160h280v-80H280v80Zm-80 400v-560 560Z"/>
												</svg>
												View review
											</a>
										</td>
									</tr>
								`;
								$tableBody.append(row_html_str);
							});
                        }
					});
				} catch(e) {
					console.error('❌ Pagination 初始化失败:', e);
				}

				this._isInit = true;
			}
		});
	}

	$('#nav-vgp-reviewers-panel').text(`Reviewers(${sorted.length})`);
	$('#reviewer_num').text(sorted.length);

	//init show reviewer button
	$('#btn_show_reviewers_num').text(sorted.length);
	let $tbody = $('#vgp-panel-reviewers-gene-table').find('tbody');
	for(let panel_review of panel_review_data){
		let rating_def = utils_check_rating_def(panel_review.rating);
		let html_str = `
			<tr class="vgp-table-datarow">
				<td><span class="vgp-rating-tag ${RATING_CLASS_HASH[rating_def]}">${rating_def}</span></td>
				<td>${panel_review.entity_name}</td>
				<td class="color-name">${panel_review.first_name_en + " " + panel_review.last_name_en}</td>
				<td>${panel_review.affiliation}</td>
			</tr>
			`;
		$(html_str).appendTo($tbody);
	}
}


var zTreeObj;
function _vgp_init_ui_upstream_trace(nando_id, panel_upstream_trace_data, panel_id){

	//let treeview_data = _create_treeview_data(panel_upstream_trace_data);
	let is_attach_descendant_cnt = true;
	let isFirstTimeLoad = true;
	utils_create_treeview_data_from_ontology(
		panel_upstream_trace_data, lang, is_attach_descendant_cnt, isFirstTimeLoad
	);
	utils_treeview_open_all_level(panel_upstream_trace_data);
	let treeview_data = [panel_upstream_trace_data];

	let setting = {
		view: {dblClickExpand: false, showIcon: false, nameIsHTML: true},
		async: {
			enable: true,
			type:   "get",
			url:	URL_GET_TREEVIEW_DESCENDANT,
			autoParam: ["panel_id", "lang"],
	        dataFilter: function(treeId, parentNode, childNodes) {
				if (!childNodes) return null;
				return utils_create_treeview_descendant_data(childNodes, lang);
			}
		},
		callback: {
			beforeClick: function (treeId, treeNode, clickFlag) {
				if (treeNode && event.target.className.indexOf("switch") > -1) {
					if (treeNode.isParent){
						if(!treeNode.open && treeNode.isFirstTimeLoad){
							zTreeObj.reAsyncChildNodes(treeNode, "refresh");
							treeNode.isFirstTimeLoad = false;
						}
						zTreeObj.expandNode(treeNode);
					}
					return false;
				}
				return true;
			},
			onClick: function (event, treeId, treeNode) {
				if(!NO_PANEL_ID_LIST.includes(treeNode.nando_id) && treeNode.nando_id.indexOf('NANDO:11') < 0){
					setTimeout(function () { 
						_open_new_panel_detail_page(treeNode.panel_id, treeNode.nando_id, treeNode.name);
					}, 10);
				}
		  	},
			beforeExpand: function (treeId, treeNode) {
				if (treeNode.isFirstTimeLoad) {
					zTreeObj.removeChildNodes(treeNode);
					treeNode.isParent = true;
					zTreeObj.reAsyncChildNodes(treeNode, "refresh");
				}
				return true;
			},
		  	onExpand: function (treeId, treeNode) {
				treeNode.isFirstTimeLoad = false;
		  	}
		},
		data: {
			key: {name: "displayName", title:"nando_id"}
		}
	};


	zTreeObj = $.fn.zTree.init($("#vgp-treeview"), setting, treeview_data);

	let nodes = zTreeObj.getNodes();
	utils_highlight_upstream_treeview_startNode(zTreeObj, nodes, nando_id);

	// init breadcrumblist with trace data
	//_vgp_init_ui_breadcrumblist(panel_upstream_trace_data, nando_id);
	_vgp_init_ui_breadcrumblist(treeview_data, nando_id);
}

function _highlight_in_treeview(nando_id){
	let selectedNodes = zTreeObj.getSelectedNodes();
	selectedNodes.forEach(node => zTreeObj.cancelSelectedNode(node));
	let nodes = zTreeObj.getNodes();
	utils_highlight_upstream_treeview_startNode(zTreeObj, nodes, nando_id);
}

function _get_breadcrumb_by_nando_id(nando_id){
    const node = zTreeObj.getNodeByParam("nando_id", nando_id, null);
    if(node){
        const pathNodes = node.getPath();
        const arr = pathNodes.map(n => ({'nando_id': n.nando_id, 'name': (lang==='ja') ? n.panel_name_ja : n.panel_name_en}));
        arr.shift();
        arr.pop();
        return arr;
    }
    return [];
}

function _open_new_panel_detail_page(panel_id,nando_id,panel_name){

	panel_name = encodeURIComponent(panel_name);
	let url = `${URL_PANEL_DETAIL}?panel_id=${panel_id}&panel_name=${panel_name}&nando_id=${nando_id}&lang=${lang}`;
	const link = document.createElement("a");
	link.href = url;
	link.target = "_blank";
	link.click();
}

function _create_gene_paper_hash_data(hash){
	let obj = {};
	for(let nando_id in hash){
		let arr = hash[nando_id];
		for(let item of arr){
			let gene_id = item.gene_id
			let count = parseInt(item.count);
			if(!(gene_id in obj)){
				obj[gene_id] = {};
			}
			if(!(nando_id in obj[gene_id])){
				obj[gene_id][nando_id] = count;
			}else{
				obj[gene_id][nando_id] += count;
			}
		}
	}
	return obj;
}

function _create_gene_hash_data(hash,key){
	let obj = {};
	for(let panel_id in hash){
		let arr = hash[panel_id];
		for(let i=0; i < arr.length; i++){
			let out_key = arr[i][key];
			if(!(out_key in obj)){
				obj[out_key] = {};
			}
			if(!(panel_id in obj[out_key])){
				obj[out_key][panel_id] = [];
			}
			obj[out_key][panel_id].push(arr[i]);
		}
	}
	return obj;
}

function _create_entity_hash_data(panel_review_data, entity_type_arr){
	let entity_hash = {};
	for(let et_i=0;et_i<entity_type_arr.length;et_i++){
		entity_hash[entity_type_arr[et_i].id] = {};
	}

	for(let i=0; i < panel_review_data.length; i++){
		let entity_type_id = panel_review_data[i].entity_type_id;
		let nando_id = panel_review_data[i].nando_id;
		let entity_name = panel_review_data[i].entity_name;
		if(!(entity_name in entity_hash[entity_type_id])){
			entity_hash[entity_type_id][entity_name] = {};
		}
		if(!(nando_id in entity_hash[entity_type_id][entity_name])){
			entity_hash[entity_type_id][entity_name][nando_id] = [];
		}
		entity_hash[entity_type_id][entity_name][nando_id].push(panel_review_data[i]);
	}
	return entity_hash;
}

function _get_paper_num(gene_id, nando_id, hash){
	let num = 0;
	if(gene_id in hash && nando_id in hash[gene_id]){
		num = hash[gene_id][nando_id];
	}
	return num;
}

const TYPE_DEFINITIVE = "definitive",TYPE_CURATOR = "curator";
function _get_rating(arr, type){
	let rating_out = '';
	if(arr){
		arr.forEach((obj) => {

			if(rating_out) return;
	
			if(type === TYPE_DEFINITIVE &&'rating' in obj && obj.rating in RATING_ORDER_HASH){
				rating_out = obj.rating;
			}else if(type === TYPE_CURATOR && 'rating' in obj && obj.rating in RATING_ORDER_HASH){
				rating_out = obj.rating;
			}
		});
	}
	return rating_out;
}

function _read_input_review_or_definition_data(
	panel_gene_data, panel_definitive_gene_data, panel_autoreview_gene_data, panel_entity_definition_data, panel_entity_review_data
){

	

	let total_gene_hash = {};

	for(let hash of [panel_gene_data, panel_definitive_gene_data, panel_autoreview_gene_data]){
		for(let panel_id in hash){
			let arr = hash[panel_id];
			for(let item of arr){
				let gene_symbo = item.hgnc_gene_symbol;
				let gene_id = ('gene_id' in item) ? item.gene_id : item.ncbi_gene_id;
				total_gene_hash[gene_symbo] = gene_id;
			}
		}
	}

	for(let arr of [panel_entity_definition_data, panel_entity_review_data]){
		for(let item of arr){
			if(item.entity_type_id == ENTITY_TYPE_ID_GENE){
				total_gene_hash[item.gene_symbol] = item.gene_id;
			}
		}	
	}

	return total_gene_hash;
}

function _get_curator_review_inheritance(curator_definition_arr,mode_of_inheritance_arr){
	if(!curator_definition_arr || curator_definition_arr.length === 0){
		return '';
	}

	let moi	= '';
	if(curator_definition_arr[0].mode_of_inheritances){
		moi = utils_mode_of_inheritances_ids_to_names(curator_definition_arr[0].mode_of_inheritances,mode_of_inheritance_arr);
	}
	return moi;
}

function _vgp_init_ui_panel_gene(
	nando_id, 
	panel_gene_data, 
	panel_definitive_gene_data, 
	panel_autoreview_gene_data, 
	panel_entity_definition_data,
	panel_pubtator3_paper_count_data,
	panel_pubchem_paper_count_data,
	panel_id, 
	panel_review_data, 
	mode_of_inheritance_arr, 
	entity_type_arr, 
	rating_type_arr,
	panel_name, 
	nando_to_panel_id_hash,
	moi_treeview_data
){

	console.log("start init gene table");

	let all_panel_nando_list = Object.keys(nando_to_panel_id_hash).sort((a,b) => {
		if (a === nando_id) return -1;
		if (b === nando_id) return 1;
		return a.localeCompare(b);
	});

	// init input modal
	if(typeof _vgp_init_inputmodal !== "undefined" && utils_isFunction(_vgp_init_inputmodal)){
		_vgp_init_inputmodal(mode_of_inheritance_arr, entity_type_arr, rating_type_arr, moi_treeview_data);
	}


	// check if no data 
	if(Object.keys(panel_gene_data).length===0 && panel_review_data.length===0 && Object.keys(panel_autoreview_gene_data).length===0){

		// init add entity button with empty skip list
		if(typeof _vgp_inputmodal_create_add_entity_btn !== 'undefined' && utils_isFunction(_vgp_inputmodal_create_add_entity_btn)){
			_vgp_inputmodal_create_add_entity_btn('#wrapper_panel_add_entity_btn', panel_id, nando_id, panel_name, []);
		}
		return;
	}

	// create gene_symbol key hash
	// format: {gene_symbol: {panel nando id:[	{ review/definition/genedefinition detail hash },...]}}
	let panel_gene_data_hash			= _create_gene_hash_data(panel_gene_data, 'hgnc_gene_symbol');
	let panel_definitive_gene_data_hash	= _create_gene_hash_data(panel_definitive_gene_data, 'hgnc_gene_symbol');
	let panel_autoreview_gene_data_hash	= _create_gene_hash_data(panel_autoreview_gene_data, 'hgnc_gene_symbol');
	let curator_definition_data_hash	= _create_entity_hash_data(panel_entity_definition_data,entity_type_arr); 
	let panel_review_data_hash		    = _create_entity_hash_data(panel_review_data,entity_type_arr);

	// create gene paper hash
	// format: {gene_id: {nando_id: paper cnt}} 
	let panel_pubtator3_paper_count_data_hash = _create_gene_paper_hash_data(panel_pubtator3_paper_count_data);
	let panel_pubchem_paper_count_data_hash   = _create_gene_paper_hash_data(panel_pubchem_paper_count_data);

	// {gene_symbol: gene_id}	
	let total_panel_gene_hash = _read_input_review_or_definition_data(panel_gene_data, panel_definitive_gene_data, 
		panel_autoreview_gene_data, panel_entity_definition_data, panel_review_data);

	let total_panel_genes = Object.keys(total_panel_gene_hash).sort();

	if(typeof _vgp_inputmodal_create_add_entity_btn !== 'undefined' && utils_isFunction(_vgp_inputmodal_create_add_entity_btn)){
		_vgp_inputmodal_create_add_entity_btn('#wrapper_panel_add_entity_btn', 
			panel_id, nando_id, panel_name, total_panel_genes);
	}
	
	$('.vgp-panel-genes-num').text(total_panel_genes.length);
	$('#vgp-panel-genes-filter').attr({'placeholder':"Filter "+total_panel_genes.length+" Entities"});
	
	let $tbody = $('#vgp-panel-gene-table-tbody');
	let i = 0;

	let gene_id_symbol_list = [];

	// default sorting : entity vgp-asc 
	for(let hgnc_gene_symbol of total_panel_genes){

		let $tr = $('<tr>').addClass("not_native").addClass("vgp-table-datarow").appendTo($tbody);

		let $td_entity = $(`<td>`).addClass('width-entity').appendTo($tr);
		let $entity_name_wrapper = $('<div>').addClass("entity-name-wrapper").appendTo($td_entity);
		let gene_id = total_panel_gene_hash[hgnc_gene_symbol];

		gene_id_symbol_list.push(
			{[$.fn.token_type_dropdown.KEY_ID]: gene_id, [$.fn.token_type_dropdown.KEY_NAME]: hgnc_gene_symbol}
		);

		let urlstr = URL_PANEL_ENTITY_DETAIL + "?";
		urlstr += `panel_id=${encodeURIComponent(panel_id)}&`;
		urlstr += `panel_name=${encodeURIComponent(panel_name)}&`;
		urlstr += `nando_id=${encodeURIComponent(nando_id)}&`;
		urlstr += `gene_id=${encodeURIComponent(gene_id)}&`;
		urlstr += `gene_symbol=${encodeURIComponent(hgnc_gene_symbol)}&`;
		urlstr += `entity_name=${encodeURIComponent(hgnc_gene_symbol)}&`;
		urlstr += `entity_type_id=${ENTITY_TYPE_ID_GENE}&`;
		urlstr += `lang=${lang}`;
		let entity_name_html_str = `<button class="vgp-panel-gene-name" data-gene-id="GENEID:${gene_id}"></button>`;
		let $btn_entity_name = $(entity_name_html_str).appendTo($entity_name_wrapper);
		$(`<span href="${urlstr}" target="_blank">${hgnc_gene_symbol}<svg></svg></span>`).appendTo($btn_entity_name);



		let $td_right = $(`<td colspan="4">`).addClass('right').appendTo($tr);
		let $rows_wrapper = $('<div>').addClass("wrapper").appendTo($td_right);

		let panel_gene_hash            = panel_gene_data_hash.hasOwnProperty(hgnc_gene_symbol) ? panel_gene_data_hash[hgnc_gene_symbol] : {};
		let panel_definitive_gene_hash = panel_definitive_gene_data_hash.hasOwnProperty(hgnc_gene_symbol) ? panel_definitive_gene_data_hash[hgnc_gene_symbol] : {};
		let panel_autoreview_gene_hash = panel_autoreview_gene_data_hash.hasOwnProperty(hgnc_gene_symbol) ? panel_autoreview_gene_data_hash[hgnc_gene_symbol] : {}; 
		let panel_review_gene_hash     = panel_review_data_hash[ENTITY_TYPE_ID_GENE].hasOwnProperty(hgnc_gene_symbol) ? panel_review_data_hash[ENTITY_TYPE_ID_GENE][hgnc_gene_symbol] : {};
		let curator_definition_hash    = curator_definition_data_hash[ENTITY_TYPE_ID_GENE].hasOwnProperty(hgnc_gene_symbol) ? curator_definition_data_hash[ENTITY_TYPE_ID_GENE][hgnc_gene_symbol] : {};

		let num_panels_of_this_gene = 0;

		for(let current_panel_nando_id of all_panel_nando_list){
			let current_panel_id		 = nando_to_panel_id_hash[current_panel_nando_id]['panel_id'];
			let current_panel_name	     = nando_to_panel_id_hash[current_panel_nando_id]['panel_name'];

			let panel_gene_arr				= current_panel_nando_id in panel_gene_hash ? panel_gene_hash[current_panel_nando_id] : [];
			let panel_definitive_gene_arr	= current_panel_nando_id in panel_definitive_gene_hash ? panel_definitive_gene_hash[current_panel_nando_id] : [];
			let panel_autoreview_gene_arr	= current_panel_nando_id in panel_autoreview_gene_hash ? panel_autoreview_gene_hash[current_panel_nando_id] : [];
			let panel_review_gene_arr		= current_panel_nando_id in panel_review_gene_hash ? panel_review_gene_hash[current_panel_nando_id] : [];
			let curator_definition_arr		= current_panel_nando_id in curator_definition_hash ? curator_definition_hash[current_panel_nando_id] : [];

			if( panel_gene_arr.length === 0 && panel_definitive_gene_arr.length === 0 && 
				panel_autoreview_gene_arr.length === 0 && panel_review_gene_arr.length === 0 && curator_definition_arr.length === 0){
				//always show the root panel row,even no review or entity def not existed.
				if(current_panel_nando_id !== nando_id){
					continue;
				}
			}

			num_panels_of_this_gene++;

			let rating_hash = utils_count_rating(panel_definitive_gene_arr, panel_autoreview_gene_arr, panel_review_gene_arr);

			let id_subfix = current_panel_nando_id.replace('NANDO:','') + "-" + i;

			// entity row
			let $row_wrapper = $('<div>').addClass('row-wrapper').appendTo($rows_wrapper);
			if(current_panel_nando_id === nando_id){
				$tr.removeClass('not_native');
			}else{
				$row_wrapper.addClass('not_native').addClass('active');
			}

			// entity row - upper row
			let $upper_row = $('<div>').addClass('upper-row').appendTo($row_wrapper);

			// entity row > upper row > source panel
			let all_path_list = _get_breadcrumb_by_nando_id(current_panel_nando_id);
			let $panel_name_wrapper = $('<div>').addClass('width-source-panel').appendTo($upper_row);
			for(let pathnode of all_path_list){
				$(`<div class="parent">${pathnode.name}</div>`).appendTo($panel_name_wrapper);
			}

			let url_panel_entity_str = `${URL_PANEL_ENTITY_DETAIL}?`;
			url_panel_entity_str += `panel_id=${encodeURIComponent(current_panel_id)}&`;
			url_panel_entity_str += `panel_name=${encodeURIComponent(current_panel_name)}&`;
			url_panel_entity_str += `nando_id=${encodeURIComponent(current_panel_nando_id)}&`;
			url_panel_entity_str += `gene_id=${encodeURIComponent(gene_id)}&`;
			url_panel_entity_str += `gene_symbol=${encodeURIComponent(hgnc_gene_symbol)}&`;
			url_panel_entity_str += `entity_name=${encodeURIComponent(hgnc_gene_symbol)}&`;
			url_panel_entity_str += `entity_type_id=${ENTITY_TYPE_ID_GENE}&`;
			url_panel_entity_str += `lang=${lang}`;
			$(`<a>${utils_capitalizeFirstLetter(current_panel_name)}<svg></svg></a>`)
				.attr('href', url_panel_entity_str)
				.addClass(current_panel_nando_id === nando_id ? 'vgp-panel-name vgp-panel-name-native' : 'vgp-panel-name')
				.attr('target', '_blank')
				.appendTo($panel_name_wrapper);

			let rating_def        = _get_rating(panel_definitive_gene_arr, TYPE_DEFINITIVE);
			let rating_curator    = _get_rating(curator_definition_arr, TYPE_CURATOR);
			let rating_display    = (rating_curator)? rating_curator : rating_def;
			rating_display        = rating_display ? rating_display : RATING_NORATING;
			let rating_display_id = RATING_ORDER_HASH[rating_display];

			if(current_panel_nando_id === nando_id){
				//show subtype button
				$(`<div class="hide">Subtype<i class="material-icons">keyboard_arrow_down</i></div>`)
					.addClass('subtype-switch').addClass('active')
					.click(function(){
						let $btn = $(this);
						$btn.toggleClass('active');
						$btn.parent().parent().parent().parent().find('.row-wrapper.not_native').toggleClass('active');
					})
					.appendTo($panel_name_wrapper);
			}
			if(num_panels_of_this_gene > 1){
				$row_wrapper.parent().find('.subtype-switch').removeClass('hide');
			}
/*
			if(current_panel_nando_id === nando_id && 
				typeof _vgp_init_inputmodal_create_add_or_edit_review_btn !== "undefined" &&
				utils_isFunction(_vgp_init_inputmodal_create_add_or_edit_review_btn)){

				//let $div_review_tag_wrapper_btn = $('<div>').addClass('ctl-wrapper').appendTo($panel_name_wrapper);
				let $div_review_tag_wrapper_btn = $('<div>').addClass('ctl-wrapper').appendTo($td_entity);
				let is_current_user = false;
				let user_review_id = '';
				if(panel_review_gene_arr && panel_review_gene_arr.length > 0 &&
					 typeof _get_current_user_id !== "undefined" && utils_isFunction(_get_current_user_id)){
					let current_user_id = _get_current_user_id();
					let tmp_arr = panel_review_gene_arr.filter(function(review){
						return 'user_id' in review && review.user_id == current_user_id;
					});
					if(tmp_arr.length > 0){
						is_current_user = true;
						user_review_id = tmp_arr[0].review_id;
					}
				}

				let is_from_user = ENUM_VAL_YES;
				if(panel_gene_arr.length > 0 || 
					panel_definitive_gene_arr.length > 0 || 
					panel_autoreview_gene_arr.length > 0){
					is_from_user = ENUM_VAL_NO;
				}
				
				_vgp_init_inputmodal_create_add_or_edit_review_btn(
					$div_review_tag_wrapper_btn, is_current_user, true, 
					current_panel_id, current_panel_nando_id, current_panel_name, user_review_id, 
					gene_id, hgnc_gene_symbol, hgnc_gene_symbol, ENTITY_TYPE_ID_GENE, 
					RATING_NORATING, RATING_ORDER_HASH[RATING_NORATING], is_from_user
				);
			}
*/

            // entity row > upper row >  rating
            let $wrapper_rating   = $('<div>').addClass('width-rating').appendTo($upper_row);

			$('<span>')
				.addClass(current_panel_nando_id === nando_id ? 'vgp-rating-tag vgp-rating-tag-native' : 'vgp-rating-tag')
				.addClass(rating_display ? RATING_CLASS_HASH[rating_display] : RATING_CLASS_HASH[RATING_NORATING])
				.text(rating_display ? rating_display : RATING_NORATING)
				.appendTo($wrapper_rating);
		
			if(rating_def){
				let href = panel_definitive_gene_arr[0].source_url
				$(` <a class="guide-wrapper" 
						data-toggle="tooltip" data-placement="top" data-html="true" title=""
						data-original-title="${TOOLTIP_TEXT_SOURCE_HEALTH_MINISTRY}"
						href="${panel_definitive_gene_arr[0].source_url}"
						target="_blank"
					>
						${LABEL_SOURCE_HEALTH_MINISTRY}
						<svg></svg>
				  	</a>
				`).appendTo($wrapper_rating);
			}	

			// entity row > upper row > reviews
			let $td_review = $('<div>').addClass('width-sources').appendTo($upper_row);
			let $div_review_tag_wrapper = $('<div>').addClass('d-flex flex-column w-100').appendTo($td_review);
			let $div_review_tag_wrapper1 = $('<div>').addClass("vgp-rating-tag-list-container").appendTo($div_review_tag_wrapper);
			let total_review_num = 0;
			RATING_REVIEW_ARRAY.forEach((item) => {
				let rating_html_str = `
					<div class="${item.isSeparatorExists ? "vgp-rating-tag-subcontainer vgp-rating-divide" : "vgp-rating-tag-subcontainer"}">
						<div class="vgp-rating-tag-wrapper">
							<span class="vgp-rating-list-tag ${rating_hash[item.rating_key] ? RATING_CLASS_HASH[item.rating_key] : "empty"}">
								${rating_hash[item.rating_key] ? rating_hash[item.rating_key] : 0}
							</span>
						</div>
					</div>
				`;
				$(rating_html_str).appendTo($div_review_tag_wrapper1);
				if(rating_hash[item.rating_key]){
					total_review_num = total_review_num + rating_hash[item.rating_key];
				}
			});

			let $div_review_tag_wrapper2 = $('<div>').addClass("div_review_tag_wrapper2").appendTo($div_review_tag_wrapper);

			//panel_definitive_gene_arr, panel_autoreview_gene_arr, 
			let reference_review_arr = [...panel_definitive_gene_arr,...panel_autoreview_gene_arr];

			let $div_review_tag_wrapper2_sub1 = $('<div>').appendTo($div_review_tag_wrapper2);
            if(current_panel_nando_id === nando_id){
                $('<span>').addClass("vgp-panel-review-num").css({'display':'none'}).text(total_review_num).appendTo($div_review_tag_wrapper2_sub1);
            }


			$('<span>').addClass("show_review_title").text('Reviewers').appendTo($div_review_tag_wrapper2_sub1);
			let review_cnt_ctl_html_str1 = `<span id="vgp-review-controller-${id_subfix}-reviewer" class="vgp-summary-controll"
												data-cnt=${panel_review_gene_arr.length}
												data-table-id="vgp-review-table-wrapper-${id_subfix}-reviewer"
												data-relative-id="vgp-paper-controller-${id_subfix}"
												data-relative-table-id="vgp-paper-table-wrapper-${id_subfix}">Show(${panel_review_gene_arr.length})</span>`;
			$(review_cnt_ctl_html_str1).appendTo($div_review_tag_wrapper2_sub1);

			let $div_review_tag_wrapper2_sub2 = $('<div>').appendTo($div_review_tag_wrapper2);
			$('<span>').addClass("show_review_title").addClass('ml-2').text('References').appendTo($div_review_tag_wrapper2_sub2);
			let review_cnt_ctl_html_str2 = `<span id="vgp-review-controller-${id_subfix}-reference" class="vgp-summary-controll"
												data-cnt=${reference_review_arr.length}
												data-table-id="vgp-review-table-wrapper-${id_subfix}-reference"
												data-relative-id="vgp-paper-controller-${id_subfix}"
												data-relative-table-id="vgp-paper-table-wrapper-${id_subfix}">Show(${reference_review_arr.length})</span>`;
			$(review_cnt_ctl_html_str2).appendTo($div_review_tag_wrapper2_sub2);

			if(	typeof _vgp_init_inputmodal_create_add_or_edit_review_btn !== "undefined" && 
				utils_isFunction(_vgp_init_inputmodal_create_add_or_edit_review_btn)
			){
				let $div_review_tag_wrapper_btn = $('<div>').addClass('ctl-wrapper').appendTo($td_review);
				
				let is_current_user = false;
				let user_review_id = '';
				if(	panel_review_gene_arr && 
					panel_review_gene_arr.length > 0 &&
					utils_isFunction(_get_current_user_id)
				){
                    
					let current_user_id = _get_current_user_id();
					let tmp_arr = panel_review_gene_arr.filter(function(review){
						return 'user_id' in review && review.user_id == current_user_id;
					});
					if(tmp_arr.length > 0){
						is_current_user = true;
						//user_review_id = tmp_arr[0].review_id;
						user_review_id = tmp_arr[0].original_review_id;
					}
                }

				let is_from_user = ENUM_VAL_YES;
				if(	panel_gene_arr.length > 0 ||
					panel_definitive_gene_arr.length > 0 ||
					panel_autoreview_gene_arr.length > 0){
					is_from_user = ENUM_VAL_NO;
				}

				_vgp_init_inputmodal_create_add_or_edit_review_btn(
					$div_review_tag_wrapper_btn, is_current_user, true,
					current_panel_id, current_panel_nando_id, current_panel_name, user_review_id,
					gene_id, hgnc_gene_symbol, hgnc_gene_symbol, ENTITY_TYPE_ID_GENE,
					RATING_NORATING, RATING_ORDER_HASH[RATING_NORATING], is_from_user
				);
			}



			// entity row > upper row > papers
			let $td_paper = $('<div>').addClass('width-paper').appendTo($upper_row);
			let pubtator3_paper_cnt = _get_paper_num(gene_id, current_panel_nando_id, panel_pubtator3_paper_count_data_hash);
			let pubchem_paper_cnt   = _get_paper_num(gene_id, current_panel_nando_id, panel_pubchem_paper_count_data_hash);
			let paper_num = pubtator3_paper_cnt + pubchem_paper_cnt;
			
			let paper_cnt_ctl_html_str = `
				<span class="${current_panel_nando_id === nando_id ? 'vgp-panel-paper-num' : ''}">
					<svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M8.59317 21.2584L8.58217 21.2604L8.51117 21.2954L8.49117 21.2994L8.47717 21.2954L8.40617 21.2604C8.39551 21.2571 8.3875 21.2588 8.38217 21.2654L8.37817 21.2754L8.36117 21.7034L8.36617 21.7234L8.37617 21.7364L8.48017 21.8104L8.49517 21.8144L8.50717 21.8104L8.61117 21.7364L8.62317 21.7204L8.62717 21.7034L8.61017 21.2764C8.6075 21.2658 8.60184 21.2598 8.59317 21.2584ZM8.85817 21.1454L8.84517 21.1474L8.66017 21.2404L8.65017 21.2504L8.64717 21.2614L8.66517 21.6914L8.67017 21.7034L8.67817 21.7104L8.87917 21.8034C8.89184 21.8068 8.9015 21.8041 8.90817 21.7954L8.91217 21.7814L8.87817 21.1674C8.87484 21.1554 8.86817 21.1481 8.85817 21.1454ZM8.14317 21.1474C8.13876 21.1448 8.1335 21.1439 8.12847 21.145C8.12344 21.1461 8.11903 21.1491 8.11617 21.1534L8.11017 21.1674L8.07617 21.7814C8.07684 21.7934 8.08251 21.8014 8.09317 21.8054L8.10817 21.8034L8.30917 21.7104L8.31917 21.7024L8.32317 21.6914L8.34017 21.2614L8.33717 21.2494L8.32717 21.2394L8.14317 21.1474Z" fill="currentColor"/>
						<path d="M14 0C14.5304 0 15.0391 0.210714 15.4142 0.585786C15.7893 0.960859 16 1.46957 16 2V13.586C15.9999 14.1164 15.7891 14.625 15.414 15L11 19.414C10.625 19.7891 10.1164 19.9999 9.586 20H2C1.46957 20 0.960859 19.7893 0.585786 19.4142C0.210714 19.0391 0 18.5304 0 18V2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0H14ZM14 2H2V18H8V13.5C8 13.1022 8.15804 12.7206 8.43934 12.4393C8.72064 12.158 9.10218 12 9.5 12H14V2ZM13.586 14H10V17.586L13.586 14ZM6 9C6.26522 9 6.51957 9.10536 6.70711 9.29289C6.89464 9.48043 7 9.73478 7 10C7 10.2652 6.89464 10.5196 6.70711 10.7071C6.51957 10.8946 6.26522 11 6 11H5C4.73478 11 4.48043 10.8946 4.29289 10.7071C4.10536 10.5196 4 10.2652 4 10C4 9.73478 4.10536 9.48043 4.29289 9.29289C4.48043 9.10536 4.73478 9 5 9H6ZM11 5C11.2652 5 11.5196 5.10536 11.7071 5.29289C11.8946 5.48043 12 5.73478 12 6C12 6.26522 11.8946 6.51957 11.7071 6.70711C11.5196 6.89464 11.2652 7 11 7H5C4.73478 7 4.48043 6.89464 4.29289 6.70711C4.10536 6.51957 4 6.26522 4 6C4 5.73478 4.10536 5.48043 4.29289 5.29289C4.48043 5.10536 4.73478 5 5 5H11Z" fill="currentColor"/>
					</svg>
					${paper_num}
				</span>`;
			let $span_paper = $(paper_cnt_ctl_html_str).appendTo($td_paper);
			if(paper_num > 0){
				$span_paper
					.attr('id',`vgp-paper-controller-${id_subfix}`)
					.addClass("vgp-summary-controll paper")
					.data("cnt",paper_num)
					.data('table-id',`vgp-paper-table-wrapper-${id_subfix}`)
					.data('relative-id',`vgp-review-controller-${id_subfix}-reviewer,vgp-review-controller-${id_subfix}-reference`)
					.data('relative-table-id',`vgp-review-table-wrapper-${id_subfix}-reviewer,vgp-review-table-wrapper-${id_subfix}-reference`)
					.append(`<i class="material-icons">keyboard_arrow_down</i>`)
					;
            }else{
				$span_paper.addClass('related-paper-num empty');
            }

			// detail row
			let $td_detail_wrapper = $('<div>').addClass('lower-row').appendTo($row_wrapper);

			// detail row: review table
			let $tbl_review_wrapper = $('<div>').addClass("vgp-review-table-wrapper loaded")
												.attr({'id': `vgp-review-table-wrapper-${id_subfix}`}).appendTo($td_detail_wrapper);

            let review_arr = [
                {label: "Reviewer ratings", type: 'from_reviewer', data_arr: panel_review_gene_arr, tbl_wrapper_id: `vgp-review-table-wrapper-${id_subfix}-reviewer`},
                {label: "Reference ratings", type: 'auto_review', data_arr: reference_review_arr, tbl_wrapper_id: `vgp-review-table-wrapper-${id_subfix}-reference`}
            ];

			for(let target_item of review_arr) {
				if(target_item.data_arr.length === 0) continue;

				let $tbl_review_wrapper = $('<div>')
											.addClass("vgp-review-table-wrapper loaded")
											.attr('id', target_item.tbl_wrapper_id)
											.appendTo($td_detail_wrapper);	

				$('<div>').text(target_item.label).addClass(target_item.type).addClass('title').appendTo($tbl_review_wrapper);

				let tbl_review_id = `vgp-review-table-${target_item.type}-${id_subfix}`;
				let $tbl_review = $('<table>')
						.addClass("vgp-review-table")
						.addClass(target_item.type)
						.attr({'id':tbl_review_id})
						.appendTo($tbl_review_wrapper);
				let $colgroup_review   = $('<colgroup>').appendTo($tbl_review);
				for (let cnt = 0; cnt < REVIEW_TBL_HEAD[lang].length; cnt++) {
					$('<col>').appendTo($colgroup_review);
				}
				let $thead_review = $('<thead>').appendTo($tbl_review);
				let $thead_row_review = $('<tr>').appendTo($thead_review);
				let header_tbl_head = (target_item.type === 'from_reviewer') ? REVIEW_TBL_HEAD : REFERENCE_TBL_HEAD;
				for(let idx=0; idx<header_tbl_head[lang].length;idx++){
					let col_title = header_tbl_head[lang][idx];
					let $th = $('<th>').appendTo($thead_row_review);
					if(idx==0){
						$th.addClass('pl-2');
						let span_html_str = `
							<span data-sort-id="${idx}" 
								data-sort-method="vgp-sort-method-rating" 
								data-sort-inner-target="vgp-rating-tag" 
								class="vgp-sorter"
							>
								${col_title}
							</span>
						`;
						$(span_html_str).appendTo($th);
					}else{
						let span_html_str = `
							<span data-sort-id="${idx}" 
								data-sort-method="vgp-sort-method-letter" 
								class="vgp-sorter"
							>
								${col_title}
							</span>
						`;
						$(span_html_str).appendTo($th);
					}
				}

				let $tbody_review = $('<tbody>').appendTo($tbl_review);
				// add review here
				target_item.data_arr.sort(function(a,b){
					let rating_def_a = utils_check_rating_def(a.rating);
					let rating_def_b = utils_check_rating_def(b.rating);
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
				target_item.data_arr.forEach((obj) => {

					let rating_def = 'rating' in obj ? utils_check_rating_def(obj.rating) : RATING_NORATING;
	
					let $tr = $('<tr>').addClass('vgp-subtable-datarow').appendTo($tbody_review);

					// rating
					let $td1 = $('<td>').appendTo($tr);
					$('<span>').addClass('vgp-rating-tag').addClass(RATING_CLASS_HASH[rating_def]).text(rating_def).appendTo($td1);

					// disease
					let $td2 = $('<td>').appendTo($tr);
					if("mondo_url" in obj && obj.mondo_url){
						let $a = $('<a>').appendTo($td2);
						let disease_text= obj.mondo_en;
						if(lang === 'ja' && "mondo_ja" in obj && obj.mondo_ja) disease_text= obj.mondo_ja;
						$a.text(disease_text).attr('href',obj.mondo_url).attr('target','_blank');
						$('<svg>').appendTo($a);
					}else if('nando_id' in obj && (obj.nando_en || obj.nando_ja)){
	
						let nando_name = obj.nando_en;
						if(lang === 'ja' && obj.nando_ja) {
							nando_name = obj.nando_ja;
						}else if(lang !== 'ja' && obj.nando_en){
							nando_name = obj.nando_en;
						}else{
							nando_name = obj.nando_en ? obj.nando_en : obj.nando_ja;
						}

						if(nando_name){
							let $a = $('<a>').appendTo($td2);
							let url_str = `https://nanbyodata.jp/disease/${obj.nando_id}`;
							$a.text(lang === 'en'? obj.nando_en: obj.nando_ja).attr('href',url_str).attr('target','_blank');
							$('<svg>').appendTo($a);
						}
	
					}else if('phenotypes' in obj){
						let cnt = 0;
						if(obj.phenotypes){
							let phenotypes = obj.phenotypes.split('|');
							for(let phenotype of phenotypes){
								let tmp = phenotype.split("--");
								if(cnt > 0) $('<br>').appendTo($td2);
							
								let $a = $('<a>').appendTo($td2);
								let url_str = `https://nanbyodata.jp/disease/${tmp[0]}`;
								$a.text(tmp[1]).attr('href',url_str).attr('target','_blank');
								$('<svg>').appendTo($a);
								cnt++;
							}
						}
					}

                    // mode of inheritance
                    if('moi_ja' in obj || 'moi_en' in obj){
                        let moi = obj.moi_ja;
                        if(lang !== 'ja') moi = obj.moi_en;
                        $('<td>').text(moi).appendTo($tr);
                    }else if('mode_of_inheritances' in obj){
						let $td_moi = $('<td>').addClass('d-flex flex-column').appendTo($tr);
						let moi_name_arr = utils_mode_of_inheritances_ids_to_names_list(obj.mode_of_inheritances, mode_of_inheritance_arr);
						for(let moi_i=0; moi_i<moi_name_arr.length; moi_i++){
							$('<span>').text(moi_name_arr[moi_i]).appendTo($td_moi);
						}
                    }else{
                        $('<td>').appendTo($tr);
                    }

					// source
					let source_url = 'source_url' in obj ? obj.source_url : "";

					if(source_url){
						let $td3 = $('<td>').appendTo($tr);
						if(obj.source.indexOf('厚生労働省') > 0){
							$(` <a	class="guide-wrapper"
									data-toggle="tooltip" data-placement="top" data-html="true" title=""
									data-original-title="${TOOLTIP_TEXT_SOURCE_HEALTH_MINISTRY}"
									href="${source_url}"
									target="_blank"
								>
									${LABEL_SOURCE_HEALTH_MINISTRY}<svg></svg>
								</a>
							`).appendTo($td3);
						}else{
							let $a = $('<a>').text(obj.source).attr('href',source_url).attr('target','_blank').appendTo($td3);
							$('<svg>').appendTo($a);
						}
					}else if('source' in obj){
						$('<td>').text(obj.source).appendTo($tr);
					}else if('first_name_en' in obj){
						let urlstr_user = URL_PANEL_ENTITY_DETAIL + "?";
						urlstr_user += `panel_id=${encodeURIComponent(current_panel_id)}&`;
						urlstr_user += `panel_name=${encodeURIComponent(current_panel_name)}&`;
						urlstr_user += `nando_id=${encodeURIComponent(current_panel_nando_id)}&`;
						urlstr_user += `gene_id=${encodeURIComponent(gene_id)}&`;
						urlstr_user += `gene_symbol=${encodeURIComponent(hgnc_gene_symbol)}&`;
						urlstr_user += `entity_name=${encodeURIComponent(hgnc_gene_symbol)}&`;
						urlstr_user += `entity_type_id=${ENTITY_TYPE_ID_GENE}&`;
						urlstr_user += `lang=${lang}`;
						urlstr_user +=  "&original_review_id=" + obj.original_review_id;

						let $td = $('<td>').appendTo($tr);
						$('<span>').text(obj.first_name_en + " " + obj.last_name_en).appendTo($td);
						let $a = $('<a>').addClass('user')
									.text('Show')
									.attr('href',urlstr_user)
									.attr('target','_blank').appendTo($td);
						$('<svg>').prependTo($a);
					}else{
						$('<td>').appendTo($tr);
					}

				});

			}
			// detail row: paper table wrapper
			let $tbl_paper_wrapper = $(`<div id="vgp-paper-table-wrapper-${id_subfix}" class="vgp-paper-table-wrapper" 
											data-nando_id="${current_panel_nando_id}" 
											data-ncbi_gene_id="${gene_id}" 
											data-idx="${i}">`).appendTo($td_detail_wrapper);
			$('<div>').addClass('loading').appendTo($tbl_paper_wrapper);



			i++;
		}
	}

	const uniqueArray = Array.from(
		new Set(gene_id_symbol_list.map(row => JSON.stringify(row))) // Convert rows to strings for uniqueness
	).map(row => JSON.parse(row));

	const maxLength = Math.max(...uniqueArray.map(item => item[$.fn.token_typeahaed.KEY_NAME].length));
	if(maxLength < 7){
		$('.width-entity').addClass('short');
	}else if (maxLength < 13){
		$('.width-entity').addClass('middium');
	}else{
		$('.width-entity').addClass('long');
	}

	if(typeof _vgp_init_inputmodal_gene_symbol_suggestion_review !== "undefined" && utils_isFunction(_vgp_init_inputmodal_gene_symbol_suggestion_review)){
		_vgp_init_inputmodal_gene_symbol_suggestion_review(uniqueArray);
	}

	if(typeof _vgp_inputmodal_attach_add_or_edit_review_btn_in_sortable_table_click_event !== 'undefined' && utils_isFunction(_vgp_inputmodal_attach_add_or_edit_review_btn_in_sortable_table_click_event)){
		_vgp_inputmodal_attach_add_or_edit_review_btn_in_sortable_table_click_event('.vgp-panel-genes-table');
	}
	

	console.log("end init gene table");
}

// order: from old to new
const cache_panel_version_list_arr = [];

var cache_panel_changes = null;

function set_compare_summary_area(added,removed,changed,gene_cnt_1,gene_cnt_2){
	const $compare_summary_wrapper = $('#compare-summary');
	$compare_summary_wrapper.find(".rating-change-added").text(`Added(${added})`);
	$compare_summary_wrapper.find(".rating-change-removed").text(`Removed(${removed})`);
	$compare_summary_wrapper.find(".rating-change-changed").text(`Rating changed(${changed})`);
	$compare_summary_wrapper.find(".count").text(`Total genes ${gene_cnt_1} -> ${gene_cnt_2}`);
}

function clear_compare_are(){
	set_compare_summary_area(0,0,0,0,0);
	$('#compare-table-tbody').empty();
    $('.vgp-panel-genes-num-compare').text('0');
    $('#vgp-panel-genes-filter-compare').attr({'placeholder':"Filter 0 Entities"});
}


function get_version_entity_hash(panel_change_id){
	let version_entity_hash = JSON.parse(JSON.stringify(cache_panel_changes.snapshot_json));

	if(panel_change_id == cache_panel_version_list_arr[0]) return version_entity_hash;

	for(let i=1; i<cache_panel_version_list_arr.length; i++){

		let cid = cache_panel_version_list_arr[i];

		if(cid in cache_panel_changes.changes){
			let change = cache_panel_changes.changes[cid];
			if(change.rating_change === 'ADD'){
				version_entity_hash[change.entity_name] = {
					'entity_id': change.new_entity_id,
					'gene_id':   change.gene_id,
					'rating_id': change.new_rating_id
				}
			}else if(change.rating_change === 'DELETE'){
				delete version_entity_hash[change.entity_name];
			}else{
				version_entity_hash[change.entity_name].rating_id = change.new_rating_id
			}
		}
		if( cid == panel_change_id) return version_entity_hash;
	}
}

function create_version_compare_table(){

	if(utils_isEmpty(cache_panel_changes) || utils_isEmpty(cache_panel_version_list_arr)) return;

	clear_compare_are();

	let panel_id = $('#compare-wrapper').data('panel_id');
	let panel_name =  $('#compare-wrapper').data('panel_name');

	let selected_panel_change_id_1 = $('#btn-version-selector-1').data('selected_panel_change_id');
	let selected_panel_change_id_2 = $('#btn-version-selector-2').data('selected_panel_change_id');

	let version_entity_hash_1 = get_version_entity_hash(selected_panel_change_id_1);
	let version_entity_hash_2 = get_version_entity_hash(selected_panel_change_id_2);

	let gene_cnt_1 = Object.keys(version_entity_hash_1).length;
	let gene_cnt_2 = Object.keys(version_entity_hash_2).length;

	const uniqueIds = [...new Set([...Object.keys(version_entity_hash_1), ...Object.keys(version_entity_hash_2)])];

	let $tbody = $('#compare-table-tbody');

	let added=0, removed=0, changed=0;
	uniqueIds.sort();

	for(let entity_name of uniqueIds){
		let rating_id_1 = (entity_name in version_entity_hash_1) ? version_entity_hash_1[entity_name].rating_id : "";
		let rating_id_2 = (entity_name in version_entity_hash_2) ? version_entity_hash_2[entity_name].rating_id : "";

		let gene_id = (entity_name in version_entity_hash_1) ? 
			version_entity_hash_1[entity_name].gene_id : 
			version_entity_hash_2[entity_name].gene_id;

		let diff = "-";
		let cls = "";
		if(!rating_id_1){
			diff = "Added";
			cls = "rating-change-added";
			added++;
		}else if(!rating_id_2){
			diff = "Removed";
			cls = "rating-change-removed";
			removed++;
		}else if(rating_id_1 != rating_id_2){
			diff = "Changed";
			cls = "rating-change-changed";
			changed++;
		}

		let $tr = $('<tr>').addClass(cls).appendTo($tbody);

		// entity name
		let $td_entity = $('<td>').appendTo($tr);

        let $entity_name_wrapper = $('<div>').addClass("entity-name-wrapper").appendTo($td_entity);

        let urlstr = URL_PANEL_ENTITY_DETAIL + "?";
        urlstr += `panel_id=${encodeURIComponent(panel_id)}&`;
        urlstr += `panel_name=${encodeURIComponent(panel_name)}&`;
        urlstr += `nando_id=${encodeURIComponent(panel_id)}&`;
        urlstr += `gene_id=${encodeURIComponent(gene_id)}&`;
        urlstr += `gene_symbol=${encodeURIComponent(entity_name)}&`;
        urlstr += `entity_name=${encodeURIComponent(entity_name)}&`;
        urlstr += `entity_type_id=${ENTITY_TYPE_ID_GENE}&`;
        urlstr += `lang=${lang}`;
        let entity_name_html_str = `<button class="vgp-panel-gene-name" data-gene-id="GENEID:${gene_id}"></button>`;
        let $btn_entity_name = $(entity_name_html_str).appendTo($entity_name_wrapper);
        $(`<span href="${urlstr}" target="_blank">${entity_name}<svg></svg></span>`).appendTo($btn_entity_name);


		for(let hash of [version_entity_hash_1, version_entity_hash_2]){
			let $td_rating = $('<td>').appendTo($tr);

			if(!(entity_name in hash)){
				$td_rating.text("-");
				continue;
			}

			let rating = RATING_ID_HASH[hash[entity_name].rating_id];

			let $tag_wrapper = $(`<div class="width-rating">`).appendTo($td_rating);

			$(`<span class="vgp-rating-tag vgp-rating-tag-native ${RATING_CLASS_HASH[rating]}">${rating}</span>`).appendTo($tag_wrapper);
			
			if('source_url' in hash[entity_name] && hash[entity_name].source_url){
				let $a = $(`<a class="guide-wrapper" 
								data-toggle="tooltip" 
								data-placement="top" 
								data-html="true" 
								title="" 
								data-original-title="${TOOLTIP_TEXT_SOURCE_HEALTH_MINISTRY}" 
								href="${hash[entity_name].source_url}"
								target="_blank">${LABEL_SOURCE_HEALTH_MINISTRY}<svg></svg>
				  			</a>
							`).appendTo($tag_wrapper);

				$a.tooltip({'trigger':'hover'});
			}
		}

		$(`<td>${diff}</td>`).appendTo($tr);
	}

	set_compare_summary_area(added,removed,changed,gene_cnt_1,gene_cnt_2)

	_vgp_table_filter_compare();

	_attach_panel_gene_name_event('compare-table');


	const thead = document.querySelector('.compare-table-thead');

	const sorters = thead.querySelectorAll('.vgp-sorter');

	let found = false;
	sorters.forEach(function(sorter) {
		if(found) return;
        if (sorter.classList.contains('vgp-asc') || sorter.classList.contains('vgp-dsc')) {
			_vgp_table_sort(sorter, true);
        }
	});
}

function change_version_compare(dropdownId,panelChangeId){

	const $dropdown = $('#' + dropdownId);
	const $dropdownMenu = $dropdown.find('.dropdown-menu');
	const $button = $dropdown.find('.dropdown-toggle');

	let former_selected_panel_change_id = $button.data('selected_panel_change_id');

	if(former_selected_panel_change_id == panelChangeId) return;

	const $selectedItem = $dropdownMenu.find(`.dropdown-item[onclick*="${panelChangeId}"]`);

	if (!$selectedItem.length) {
		console.log('cannot find dropdownitem with id:' + panelChangeId);
		return;
	}

	const selectedText = $selectedItem.text().trim();

	$button.text(selectedText);

	$dropdownMenu.find('.dropdown-item').removeClass('selected');

	$selectedItem.addClass('selected');

	$button.data('selected_panel_change_id',panelChangeId);

	create_version_compare_table();
}

function _vgp_table_filter_compare(){
    let $filter      = $('#vgp-panel-genes-filter-compare');
    let filterValue  = $filter.val().toLowerCase();
    let table_id     = $filter.data('table-id');
    let target_class = '.vgp-panel-gene-name';

    let filtered_gene_name_hash = {};
	let num = 0;
    $(`#${table_id}>tbody>tr`).filter(function(){

        let $tr = $(this);

        $tr.removeClass('hidden');
		if(filterValue.length === 0){
			num++;
		}else{
	        let target_text = $tr.find(target_class).eq(0).text().toLowerCase();
    	    let hit = target_text.indexOf(filterValue);
	        if(hit > -1){
    	        filtered_gene_name_hash[target_text] = 1;
				num++;
        	    return true;
	        }else{
    	        $tr.addClass('hidden');
        	    return false;
	        }
		}
    });

    $('.vgp-panel-genes-num-compare').text(num);
	$('#vgp-panel-genes-filter-compare').attr({'placeholder':"Filter "+num+" Entities"});
}

function _vgp_init_ui_compare_tab(panel_id, panel_name, panel_version_info_arr){

	cache_panel_version_info_arr = panel_version_info_arr;

	$('#compare-wrapper').data('panel_id', panel_id);
	$('#compare-wrapper').data('panel_name', panel_name);

	$('#nav-vgp-compare-panel').on('shown.bs.tab', function (e) {

		const $wrapper = $('#compare-wrapper');

		let panel_id = $wrapper.data('panel_id');

		if($wrapper.hasClass('loading') || $wrapper.hasClass('loaded')){
			return;
		}else{
			$('#compare-loader').show();
			$('#compare-content').hide();
			$wrapper.addClass('loading');

			$.ajax({
				url: URL_LOAD_CHANGE_HISTORY,
				type: "GET",
				data: { panel_id:panel_id },
				dataType: 'json',
				success: function(response) {
					if('error' in response){
						alert(response.error)
						$wrapper.removeClass('loading');
						return;
					}
					$wrapper.removeClass('loading').addClass('loaded');
					cache_panel_changes = response;
					create_version_compare_table();
					$('#compare-loader').hide();
					$('#compare-content').show();
				},
				error: function(xhr, status, error) {

					console.load('ajax failed:', error);
					if (xhr.responseJSON && xhr.responseJSON.error) {
						alert('error: ' + xhr.responseJSON.error);
					} else {
						alert('failed, please try later');
					}

					$wrapper.removeClass('loading');
        		}
			})
        }
	});

	const $dropdown_menu_1 = $('#dropdown-menu-version-selector-1');
	const $dropdown_menu_2 = $('#dropdown-menu-version-selector-2');
	for(let i=0; i<panel_version_info_arr.length; i++){

		let panel_version_info = panel_version_info_arr[i];

		cache_panel_version_list_arr.unshift(panel_version_info.panel_change_id);

		let date_str = utils_format_date_to_day(panel_version_info.created_at)
		let name_str = ( panel_version_info.panel_type === TYPE_SPECIFIED) ? 
			`${panel_version_info.panel_versions.join(' ')} ${date_str}` : date_str;

		if(i===0){
			$('#btn-version-selector-2').text(name_str).data('selected_panel_change_id', panel_version_info.panel_change_id);
		}

		if((panel_version_info_arr.length ===1 && i===0) || (panel_version_info_arr.length > 1 && i === 1)){
			$('#btn-version-selector-1').text(name_str).data('selected_panel_change_id', panel_version_info.panel_change_id);
		}

		let selected = (i===0) ? "selected" : "";
		$(`<button class="dropdown-item ${selected}" type="button"
			onclick="change_version_compare('dropdown-version-selector-2',${panel_version_info.panel_change_id});"       
		   >
			${name_str} </button>`).appendTo($dropdown_menu_2);

		let selected_1 = "";
		if((panel_version_info_arr.length ===1 && i===0) || (panel_version_info_arr.length > 1 && i === 1)){
			selected_1 = "selected";
		}
		$(`<button class="dropdown-item ${selected_1}" type="button"
			onclick="change_version_compare('dropdown-version-selector-1',${panel_version_info.panel_change_id});"
		   >
			${name_str} </button>`).appendTo($dropdown_menu_1);
		
	}

    $('#compare-table').on('click', 'span.vgp-sorter', function(){
		_vgp_table_sort(this, false);
	});

	$('.compare-table').on('click', 'span.vgp-panel-gene-name', function(){
		_vgp_open_entity_detail(this);
	});

    $('#vgp-panel-genes-filter-compare').on("input", function(){
        _vgp_table_filter_compare();
    });


}

function _vgp_init(	panel_id, nando_id, panel_version_info_arr, panel_name, all_panel_list ){

	_vgp_show_loading();

	_vgp_init_ui_panel_version(panel_id,panel_version_info_arr);

	_vgp_init_ui_compare_tab(panel_id, panel_name, panel_version_info_arr);

	let ajax_obj_arr = [
		{
			'url':             `${URL_LOAD_MULTI_CLASS}?lang=${lang}`,
			'output_data_key': 'multi_class',
			'init_ui_func':    _vgp_init_multi_class
		},
		{
			'url':			   URL_GET_PANEL_DATA_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key': 'panel_data',
			'init_ui_func':	   _vgp_init_ui_panel_data
		},
		{
			'url':			   URL_GET_PANEL_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key': 'panel_gene_data',
			'init_ui_func':	   null
		},
		{
			'url':			 URL_GET_PANEL_AUTOREVIEW_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key': 'panel_autoreview_gene_data',
			'init_ui_func':	null
		},
		{
			'url':			 URL_GET_PANEL_REVIEW + '?panel_id='+ panel_id,
			'output_data_key': 'panel_review',
			//'init_ui_func':	_vgp_init_ui_reviewer
			'init_ui_func': null
		},
		{
			'url':		   URL_GET_PANEL_ENTITY_DEFINITION + '?panel_id='+ panel_id,
			'output_data_key': 'panel_entity_definition',
			'init_ui_func': null
		},
		{
			'url':			   URL_GET_PANEL_UPSTREAM_HIERARCHY + '?panel_id='+ panel_id + '&lang=' + lang,
			'output_data_key': 'panel_upstream_trace_data',
			'init_ui_func':	   _vgp_init_ui_upstream_trace
		},
		{
			'url':				(lang==='ja') ? URL_MOI_TREEVIEW_DATA_JA : URL_MOI_TREEVIEW_DATA_EN,
			'output_data_key':  'moi_treeview_data',
			'init_ui_func':		null
		}
	];

	for(let row of all_panel_list){
		let nando_id = row[0];
		ajax_obj_arr.push({
			'url':  URL_GET_PANEL_DEFINITIVE_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key': 'panel_definitive_gene_data',
			'init_ui_func': null,
			'nando_id': nando_id
		});
		ajax_obj_arr.push({
			'url':  URL_GET_PUBTATOR3_PAPER_COUNT_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key': 'panel_pubtator3_paper_count_data',
			'init_ui_func': null,
			'nando_id': nando_id
		});
		ajax_obj_arr.push({
			'url':  URL_GET_PUBCHEM_PAPER_COUNT_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key':  'panel_pubchem_paper_count_data',
			'init_ui_func': null,
			'nando_id': nando_id
		});
	}


	let init_data = {};
	let total_cnt = utils_countUrls(ajax_obj_arr);
	let completed_cnt = 0;

	function handle_response(ajax_obj,json_data){
		if(ajax_obj.output_data_key === 'panel_definitive_gene_data'){

			if(!(ajax_obj.output_data_key in init_data)){
				init_data[ajax_obj.output_data_key] = {};
			}
			if(ajax_obj.nando_id in json_data){
				init_data[ajax_obj.output_data_key][ajax_obj.nando_id] = json_data[ajax_obj.nando_id];
			}
		}else if(ajax_obj.output_data_key === 'panel_pubtator3_paper_count_data' || ajax_obj.output_data_key === 'panel_pubchem_paper_count_data'){

			if(!(ajax_obj.output_data_key in init_data)){
				init_data[ajax_obj.output_data_key] = {};
			}
			init_data[ajax_obj.output_data_key][ajax_obj.nando_id] = json_data;

		}else{
			init_data[ajax_obj.output_data_key] = json_data;
		}
		if(utils_isFunction(ajax_obj.init_ui_func)){
			ajax_obj.init_ui_func(nando_id, init_data[ajax_obj.output_data_key], panel_id);
		}
		completed_cnt++;
		if(completed_cnt === total_cnt){

			//do final
			let nando_to_panel_id_hash = all_panel_arr.reduce((acc, row) => {
				const [nando_id, panel_id, name_en, name_ja] = row;
				acc[nando_id]={};
				acc[nando_id]['panel_id'] = panel_id;
				acc[nando_id]['panel_name'] = lang === 'ja' ? name_ja : name_en;
				return acc;
			}, {});

			_vgp_init_ui_reviewer(nando_id,init_data.panel_review,init_data.multi_class.mode_of_inheritance_arr);

			_vgp_init_ui_panel_gene(
				nando_id,
				init_data.panel_gene_data,
				init_data.panel_definitive_gene_data,
				init_data.panel_autoreview_gene_data,
				init_data.panel_entity_definition,
				init_data.panel_pubtator3_paper_count_data,
				init_data.panel_pubchem_paper_count_data,
				panel_id,
				init_data.panel_review,
				init_data.multi_class.mode_of_inheritance_arr,
				init_data.multi_class.entity_type_arr,
				init_data.multi_class.rating_type_arr,
				panel_name, 
				nando_to_panel_id_hash,
				init_data.moi_treeview_data
			);
			_vgp_init_attach_event_handlers(
				nando_id,
				panel_name,
				init_data.panel_definitive_gene_data,
				init_data.panel_autoreview_gene_data,
				init_data.panel_review,
				nando_to_panel_id_hash,
				init_data.multi_class.mode_of_inheritance_hash
			);

			_vgp_hide_loading();
		}
	}


	console.log("start download data");
	ajax_obj_arr.forEach((ajax_obj) => {
		utils_makeAjaxRequest(ajax_obj.url, 
			function(responseData){
				let json_data = JSON.parse(responseData);
				handle_response(ajax_obj,json_data);
			},
			function(){
				if(ajax_obj.output_data_key === 'panel_pubtator3_paper_count_data' || 
					ajax_obj.output_data_key === 'panel_pubchem_paper_count_data'){
					handle_response(ajax_obj,[]);
				}else{
					_vgp_hide_loading();
					alert("ajax error" + ajax_obj.url);
				}
			}
		);
	});
}

function _create_download_file(data,fileName){
	var blob = new Blob([data], { type: "application/octetstream" });
	//Check the Browser type and download the File.
	var isIE = false || !!document.documentMode;
	if (isIE) {
		window.navigator.msSaveBlob(blob, fileName);
	} else {
		var url = window.URL || window.webkitURL;
		link = url.createObjectURL(blob);
		var $a = $("<a />");
		$a.attr("download", fileName);
		$a.attr("href", link);
		$("body").append($a);
		$a[0].click();
		$a.remove();
	}
}

function _vgp_init_attach_event_handlers(
	nando_id,
	panel_name,
	panel_definitive_gene_data,
	panel_autoreview_gene_data,
	panel_review,
	nando_to_panel_id_hash,
	moi_hash
){

	$('[data-toggle="tooltip"]').tooltip({'trigger':'hover'});

	$('#btn_download_panel')
	.data('panel_name',panel_name)
	.data('nando_to_panel_id_hash', nando_to_panel_id_hash)
	.data(DATAKEY_DEFINITIVE, panel_definitive_gene_data)
	.data(DATAKEY_AUTOREVIEW, panel_autoreview_gene_data)
	.data(DATAKEY_REVIEW,     panel_review)
	.click(function(){

		_vgp_show_loading();

		let $btn = $(this);
		$btn.prop("disabled", true);

		let panel_name = $btn.data('panel_name');

		let nando_to_panel_id_hash =$btn.data('nando_to_panel_id_hash');

		let rows = [];
		rows.push([
			'panel_disease_id',
			'panel_disease_name',
			'reference_nando_id',
			'disease_name_en',
			'disease_name_ja',
			'ncbi_gene_id',
			'gene_symbol',
			'classification',
			'source',
			'source_url',
			'moi_en',
			'moi_ja'
		]);

		[DATAKEY_DEFINITIVE,DATAKEY_AUTOREVIEW,DATAKEY_REVIEW].forEach((datakey) => {
			let data = $btn.data(datakey);
			if(datakey === DATAKEY_DEFINITIVE || datakey === DATAKEY_AUTOREVIEW){
				Object.keys(data).forEach((itemkey) => {
					let dataArr = data[itemkey];
					for(let item of dataArr){
						rows.push([
							nando_to_panel_id_hash[item.reference_nando_id]['panel_id'],
							nando_to_panel_id_hash[item.reference_nando_id]['panel_name'],
							item.reference_nando_id,
							item.nando_en,
							item.nando_ja,
							item.ncbi_gene_id,
							item.hgnc_gene_symbol,
							item.rating,
							item.source,
							item.source_url,
							(datakey === DATAKEY_AUTOREVIEW) ? item.moi_en : '',
							(datakey === DATAKEY_AUTOREVIEW) ? item.moi_ja : ''
						])
					}
				})
			}else{

				const protocol = window.location.protocol;
				const hostname = window.location.hostname;
				const port     = window.location.port;
				const serverRoot = `${protocol}//${hostname}${port ? `:${port}` : ''}`;

				for(let item of data){

					let moi_ids         = item.mode_of_inheritances;
					let moi_idarr       = moi_ids.split(',');
					let moi_name_arr_en = moi_ids.length>0 ? moi_idarr.map(i => moi_hash[i]['name_en']) : [];
					let moi_name_arr_ja = moi_ids.length>0 ? moi_idarr.map(i => moi_hash[i]['name_ja']) : [];
					let moi_en          = moi_name_arr_en.join(',');
					let moi_ja          = moi_name_arr_ja.join(',');

					let urlstr =
						"panel_id="         + encodeURIComponent(item.panel_id)         + "&" +
						"panel_name="       + encodeURIComponent(item.panel_name)       + "&" +
						"nando_id="         + encodeURIComponent(item.nando_id)         + "&" +
						"gene_id="          + encodeURIComponent(item.gene_id)          + "&" +
						"gene_symbol="      + encodeURIComponent(item.gene_symbol)      + "&" +
						"entity_name="      + encodeURIComponent(item.entity_name)      + "&" +
						"entity_type_id="   + encodeURIComponent(item.entity_type_id)   + "&" +
						"rating="           + encodeURIComponent(item.rating)           + "&" +
						"lang="+lang;

					urlstr = `${protocol}//${hostname}${port ? `:${port}` : ''}${URL_PANEL_ENTITY_DETAIL}?${urlstr}`;

					rows.push([
						item.panel_id,
						item.panel_name,
						item.nando_id,
						item.panel_name_en,
						item.panel_name_ja,
						item.gene_id,
						item.gene_symbol,
						item.rating,
						'User review',
						urlstr,
						moi_en,
						moi_ja
					]);
				}
			}
		});

		let tsvContent = rows.map(row => row.join("\t")).join("\n");

		let blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
		let url = URL.createObjectURL(blob);
		let a = document.createElement("a");
		a.href = url;
		//let timestamp = _getTimeStamp();
		//a.download = `${panel_name}-${timestamp}.tsv`;
		a.download = `${panel_name}.tsv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		$btn.prop("disabled", false);

		setTimeout(function() {
			_vgp_hide_loading();
		}, 1000);

	});

	$('#vgp-panel-genes-filter').on("input", function(){
		_vgp_table_filter(this);
	});

	$('.vgp-panel-genes-table').on('click', 'span.vgp-summary-controll', function(){
		_vgp_summary_control(this);
	});

	$('.vgp-panel-genes-table').on('click', 'span.vgp-panel-gene-name', function(){
		_vgp_open_entity_detail(this);
	});

	$('#vgp-summary-switch').click(function(){
		_vgp_summary_control(this);
	});

	$('#btn_show_reviewers').click(function(){
		$('#nav-vgp-reviewers-panel').trigger('click');
	});

    $('.vgp-panel-genes-table').on('click', 'span.vgp-sorter', function(){
        _vgp_table_sort(this, false);
    });

	_attach_panel_gene_name_event('vgp-panel-gene-table');

}

function _attach_panel_gene_name_event(container_id){

	$(`#${container_id} .vgp-panel-gene-name`).each(function(i,e){
		$(e).on('click',function(event){
			event.preventDefault();
			let href = $(this).find('span').attr('href');
			window.open(href, "_blank");
		});

		let gene_id = $(e).data('gene-id');
		tippy(e, {
			arrow:		 false,
			allowHTML:	 true,
			appendTo:	  document.body,
			animation:	 'scale',
			animationFill: true,
			//trigger:	   'click',
			maxWidth:	  400,
			strategy:	  'fixed',
			interactive:   true,
			theme:		 'pcf-popup',
			placement:	 'bottom-start',
			content:	   'Loading...',
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
					let [content, max_text_len] = utils_construct_popup_content(gene_id, json_data);
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
