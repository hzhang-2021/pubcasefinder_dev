const	URL_TOP                                     = "/panelsearch_nanbyo",
		URL_GET_GENE_DETAIL_DATA					= "/sparqlist/api/pcf_get_gene_data_by_ncbi_gene_id?ncbi_gene_id=",
		URL_GET_GENE_TOOLTIP_DATA					= "/sparqlist/api/pcf_get_gene_tooltip_data_by_ncbi_gene_id?ncbi_gene_id=",
		URL_GET_NANDO_ID_BY_NCBI_GENE_ID            = "/sparqlist/api/pcf_panel_get_nando_id_by_ncbi_gene_id?ncbi_gene_id=",
		URL_GET_PANEL_GENE_BY_NANDO_ID              = '/sparqlist/api/ps_get_gene_by_nando_id_250516_test?nando_id=',
		URL_GET_PANEL_DEFINITIVE_GENE_BY_NANDO_ID	= '/sparqlist/api/ps_get_definitive_gene_by_nando_id_250516_test?nando_id=',
		URL_GET_PANEL_AUTOREVIEW_GENE_BY_NANDO_ID	= '/sparqlist/api/ps_get_autoreview_gene_by_nando_id_250516_test?nando_id=',
		URL_PANEL_DETAIL                            = '/panelsearch_nanbyo_panel_detail',
		URL_GET_PANEL_ENTITY_REVIEW					= '/panelsearch_nanbyo_get_panel_entity_review',
		URL_GET_PANEL_ENTITY_REVIEW_COMMENT         = '/panelsearch_nanbyo_get_panel_entity_review_comment',
		URL_GET_PANEL_ENTITY_DEFINITION             = '/panelsearch_nanbyo_get_panel_entity_definition',
		URL_GET_PANEL_UPSTREAM_HIERARCHY			= "/panelsearch_nanbyo_get_panel_upstream_trace",
		URL_LOAD_MULTI_CLASS                        = '/panelsearch_nanbyo_load_multi_class',
		URL_MOI_TREEVIEW_DATA_EN                    = '/static/data/panelsearch_nanbyo/moi-en.20251216.json',
		URL_MOI_TREEVIEW_DATA_JA                    = '/static/data/panelsearch_nanbyo/moi-ja.20251216.json';


function _vgp_init_ui_gene_rating(gene_rating){
	let $wrapper = $('#vgp-panel-gene-rating-wrapper');
	$wrapper.empty();
	$('<span>')
		.addClass('vgp-rating-tag')
		.addClass(RATING_CLASS_HASH[gene_rating])
		.text(gene_rating)
		.appendTo($wrapper);
}


function _vgp_init_ui_more_info(gene_id){

	tippy('#btn_show_more_info',{
            arrow:         true,
            allowHTML:     true,
            appendTo:      document.body,
            animation:     'scale-extreme',
            maxWidth:      600,
            strategy:     'fixed',
            interactive:   true,
            trigger:      'click',
            theme:        'pcf-popup',
            placement:    'bottom',
            content:      'Loading...',
			popup_url:    URL_GET_GENE_TOOLTIP_DATA + gene_id,
			popup_id:     gene_id,
			onCreate(instance) {
				instance._isFetching = false;
				instance._src = null;
				instance._error = null;
			},
			onShow(instance) {
				if (instance._isFetching || instance._src || instance._error) {return;}
				instance._isFetching = true;
				let url = instance.props.popup_url;
				let gene_id = instance.props.popup_id;
				$.ajax({url: url,type: 'GET',async: true,dataType: 'text'})
				.done(function (data, textStatus, jqXHR) {
					let json_data = JSON.parse(data);
					let [content, max_text_len]  = utils_construct_popup_content(gene_id,json_data);
					instance.setProps({ maxWidth: max_text_len });
					instance.setContent(content);
					instance._src = 'done';
				}).fail(function (jqXHR, textStatus, errorThrown) {
					instance.setContent(`Request failed from server.`);
					instance._src = null;
				}).always(function () {
					instance._isFetching = false;
				});
			}		
	});
}

function _vgp_init_ui_panel_gene_data2(ncbi_gene_id,data_obj){
	[ 
		{key: 'synonym',		   tid: 'vgp-td-synonym'},
		{key: 'other_full_name',   tid: 'vgp-td-otherfullname'},
		{key: 'ncbi_gene_summary', tid: 'vgp-td-summary'},
		{key: 'type_of_gene',	  tid: 'vgp-td-genetype'},
		{key: 'location',		  tid: 'vgp-td-location'}
	].forEach((item) => {
		if(item.key in data_obj){
			let v = data_obj[item.key];
			if(utils_isArray(v)){
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

function _vgp_init_ui_panels_with_this_gene(gene_symbol, data, callback){

	if(!data || data.length === 0){
		$('#table-container').text('None');
		callback();
		return;
	}

	let nando_id_arr = [];
	let ajax_obj_arr = [];
	for(let item of data){

		let real_nando_id = item.nando_id.match(/NANDO_(\d+)/)[1];
		item['real_nando_id'] = `NANDO:${real_nando_id}`;

		nando_id_arr.push(item['real_nando_id']);

		ajax_obj_arr.push({
			'url':  URL_GET_PANEL_DEFINITIVE_GENE_BY_NANDO_ID + real_nando_id,
			'nando_id': item['real_nando_id'],
			'type': 'definitive'
		});
	}

	ajax_obj_arr.push({
		'url': `${URL_GET_PANEL_ENTITY_DEFINITION}?entity_type_id=1&entity_name=${gene_symbol}&nando_id_list=${nando_id_arr.join(',')}`,
		'type': 'definition'
	});

	let total_cnt = utils_countUrls(ajax_obj_arr);
	let completed_cnt = 0;
	ajax_obj_arr.forEach((ajax_obj) => {

		_makeAjaxRequest(ajax_obj.url, function(responseData){

			let json_data = JSON.parse(responseData);

            if(json_data && json_data.error){
                alert(json_data.error);
            }

			if(ajax_obj.type === 'definitive'){
				let definitive_arr = _get_gene_arr(json_data, ajax_obj.nando_id, gene_symbol);
				if(definitive_arr.length > 0){
					let rating_definitive = definitive_arr[0].rating;
					for(let item of data){
						if(item['real_nando_id'] ===  ajax_obj.nando_id){
							item['rating_definitive'] = rating_definitive;
						}
					}
				}
			}else{
				for(let definition  of json_data){
					for(let item of data){
						if(item['real_nando_id'] === definition.panel_id){
							item['rating_definition'] = definition.rating_name;
						}
					}
				}
			}

            completed_cnt++;

            if(completed_cnt === total_cnt){

				$('#pagination-container').pagination({
					dataSource: data,
					pageSize: 10,
					callback: function (data, pagination) {
						// Render table dynamically
						const tableHtml = `
							<table id="vgp-panel-table">
							  <tbody>
							  ${data
								.map(
								  (row) => { 
									let rating = RATING_NORATING;
			
									if('rating_definition' in row){
										rating = row.rating_definition;
									}else if('rating_definitive' in row){
										rating = row.rating_definitive;
									}
									let rating_class = RATING_CLASS_HASH[rating];
									let link_href = `${URL_PANEL_DETAIL}?panel_id=${row.real_nando_id}&nando_id=${row.real_nando_id}&lang=${lang}`;
									return `<tr>
									  <td class="vgp-rating-tag-wrapper">
										<span class="vgp-rating-tag ${rating_class}">${rating}</span>
									  </td>
									  <td class="vgp-disease-wrapper">
									  ${gene_symbol}<span class="divide">in</span>
										  <a href="${link_href}" target="_blank">${(lang==='ja' && row.name_ja)?row.name_ja:row.name_en}
											<svg></svg>
										  </a>
									  </td>
									</tr>`;
								})
							   .join('')}
							  </tbody>
							</table>`;
					   $('#table-container').html(tableHtml);
					}
				});

				callback();
			}
		});

	});
}

function _vgp_init_multi_class(ncbi_gene_id, data_obj, panel_id, nando_id, gene_symbol){
	utils_init_type_hash(data_obj.mode_of_inheritance_arr, data_obj.entity_type_arr, data_obj.rating_type_arr);
}

function _vgp_init_ui_panel_gene_data(ncbi_gene_id, data_obj, panel_id, nando_id, gene_symbol){

	let key_gid = "GENEID:" + ncbi_gene_id;

	if(key_gid in data_obj && 'hgnc_gene_symbol' in data_obj[key_gid]){
		$('#vgp-panel-gene-name').text(data_obj[key_gid].hgnc_gene_symbol);
	}else{
		$('#vgp-panel-gene-name').text(gene_symbol);
	}

	if(key_gid in data_obj && 'full_name' in data_obj[key_gid]){
		$('#vgp-panel-gene-fullname').text(data_obj[key_gid].full_name);
	}
}


function _vgp_init_ui_breadcrumblist(gene_id, panel_upstream_trace_data, panel_id, nando_id, gene_symbol){


	let title_name_arr = [];
	let title_nando_id_arr = [];
	let title_panel_id_arr = [];

	function travese(json_arr, path_panel_id_arr, path_nando_id_arr, path_name_arr){
		for (let node of json_arr){
			let path_nando_id = node.nando_id;
			let path_name     = lang==='ja' ? node.panel_name_ja: node.panel_name_en;
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

    travese([panel_upstream_trace_data],[],[],[]);

	let $wrapper = $('#vgp-breadcrumblist-wrapper').addClass("d-flex flex-column w-100");
	let separator = `<span class="color-white"> &gt; </span>`;
    for (let i = 0; i < title_name_arr.length; i++){
        let $subwrapper = $('<div>').appendTo($wrapper);
        let out_arr = [];
        for(let j = 1; j< title_name_arr[i].length; j++){

            let name     = title_name_arr[i][j];
            let nando_id = title_nando_id_arr[i][j];
            let panel_id = title_panel_id_arr[i][j];

            let link_href = `${URL_PANEL_DETAIL}?panel_id=${panel_id}&nando_id=${nando_id}&lang=${lang}`;
            if(j === 1 || panel_id.indexOf('NANDO:11') >= 0){
                link_href = URL_TOP;
            }
            let link_str = `<a class="vgp-home" href="${link_href}">${name}</a>`;
            out_arr.push(link_str);
        }
		out_arr.push(`<span class="vgp-target">${gene_symbol}</span>`);
        let html_str = out_arr.join(separator);
		$subwrapper.html(html_str);
    }
}


function _makeAjaxRequest(url_str, callback) {
	$.ajax({
		url:	  url_str,
		type:	 'GET',
		async:	true,
		dataType: 'text'
	}).done(function (data, textStatus, jqXHR) {
		if(utils_isFunction(callback)){
			callback(data);
		}
	}).fail(function (jqXHR, textStatus, errorThrown) {
		_vgp_hide_loading();
		alert('ajax failed \nURL:'+ url_str);
	}).always(function () {
		//
	});
}

function _vgp_init_panel_data_modal_trigger(ncbi_gene_id, entity_name){

	let url_str = URL_GET_NANDO_ID_BY_NCBI_GENE_ID + ncbi_gene_id;

	$('#btn_show_panels_with_this_gene').data('url', url_str).data('entity_name',entity_name);

	document.getElementById('btn_show_panels_with_this_gene').addEventListener('click', function() {
		let $btn = $(this);
		let modal_id = $btn.data("target");
		if($btn.hasClass('loaded')){
			$('#'+modal_id).modal('show');
		}else{
			_vgp_show_loading();
			let url = $btn.data('url');
			let entity_name = $btn.data('entity_name');
			fetch(url)
				.then(response => response.json())
				.then(data => {
					_vgp_init_ui_panels_with_this_gene(entity_name,data,function(){
						_vgp_hide_loading();
						$btn.addClass('loaded');
						$('#'+modal_id).modal('show');
					});
				}).catch(error => {
					_vgp_hide_loading();
					alert(error.message);
				});
		}
	});
}

//function _vgp_construct_get_panel_data_url(ncbi_gene_id, panel_id_data, panel_id, nando_id, entity_name){
//	let key = Object.keys(panel_id_data)[0];
//	let arr = panel_id_data[key];
//	let url_str = arr.join(',');
//		url_str = url_str.replaceAll('MONDO:','');
//		url_str = URL_GET_MONDO_DATA + url_str;
//	$('#btn_show_panels_with_this_gene').data('url', url_str).data('entity_name',entity_name);
//}

function _vgp_init_panel_entity_summary_tbl(
	panel_gene_definitive_arr, panel_gene_autoreview_arr, panel_entity_gene_arr, panel_entity_definition_arr, 
	panel_id, nando_id, panel_name, 
	ncbi_gene_id, gene_symbol, entity_type_id, entity_name, panel_upstream_trace_data, is_from_user){
	
	let t_hash_disease = {};
	let t_hash_publication = {};
	let t_hash_source = {};
	let t_hash_moi = {};
	let text_comment = '';
	let rating= '';
	let created_at = '';

	if(panel_entity_definition_arr.length > 0){
		let review = panel_entity_definition_arr[0];

		rating = review.rating;

		if ("created_at" in review){
			created_at = review.created_at;
		}

		if('mode_of_inheritances' in review && review.mode_of_inheritances){
			let t = review.mode_of_inheritances.split(',');
			for(let mode_of_inheritance_id of t){
				let mode_of_inheritance_name = MODE_OF_INHERITANCE_HASH[mode_of_inheritance_id];
				t_hash_moi[mode_of_inheritance_name] = 1;
			}
		}

		if('source' in review && review.source){
			t_hash_source[review.source] = 1;
		}

		if('publications' in review && review.publications){
			t_hash_publication[review.publications] = 1;
		}

		if('phenotypes' in review && review['phenotypes']){
			let phenotypes = review['phenotypes'].split('|');
			for(let phenotype of phenotypes){
				let tmp = phenotype.split("--");
				t_hash_disease[tmp[1]] = 1;
			}			
		}

		if('comment' in review){
			text_comment = review.comment;
		}
	}else if(panel_gene_definitive_arr.length > 0){
		let review = panel_gene_definitive_arr[0];
		rating = review.rating;

		if('source' in review && review.source){
			t_hash_source[review.source] = 1;
		}

		if('nando_en' in review || 'nando_ja' in review){
			t_hash_disease[lang === 'ja' ? review.nando_ja : review.nando_en] = 1;
		}

	}else if(panel_gene_autoreview_arr.length > 0){
		for(let review of panel_gene_autoreview_arr){
			if('source' in review && review.source){
				t_hash_source[review.source] = 1;
			}

			if('nando_en' in review || 'nando_ja' in review){
				t_hash_disease[lang === 'ja' ? review.nando_ja : review.nando_en] = 1;
			}
		}
	}else if(panel_entity_gene_arr.length > 0){
		let review = panel_entity_gene_arr[0];
		//rating = RATING_NORATING;
		if('disease_info' in review || 'disease_info' in review){
			t_hash_disease[lang === 'ja' ? review.disease_info_ja : review.disease_info_en] = 1;
		}
		if('source_name' in review && review.source_name){
			let domains = review.source_name
  				.split('|')
  				.map(s => s.trim())
  				.map(url => new URL(url).hostname);
			let soruces = domains.join(',');
			t_hash_source[review.source] = 1;
		}
	}else{
		t_hash_source['Created by user'] = 1;
	}

	_vgp_init_ui_gene_rating(rating ? rating : RATING_NORATING);
	if (created_at) $("#vgp-panel-gene-rating-time-wrapper").text(created_at);

	let text_disease = Object.keys(t_hash_disease).join(', ');
    $('#vgp-td-phenotypes').text(text_disease);

	let text_publication = Object.keys(t_hash_publication).join(', ');
	if(text_publication){
		let html_obj = utils_extract_publication(text_publication);
		$('#vgp-td-publications').html(html_obj);
	}
	let text_source = Object.keys(t_hash_source).join(', ');
	if(text_source){
		$('#vgp-td-sources').text(text_source);
	}

	let text_moi = Object.keys(t_hash_moi).join(', ');
	$('#vgp-td-inheritance').text(text_moi);

	$('#vgp-td-comments').html(text_comment.replaceAll('\n','<br>'));

	if((typeof _is_current_user_curator) !== "undefined" && 
		utils_isFunction(_is_current_user_curator) && 
		_is_current_user_curator() && 
		utils_isFunction(_vgp_init_entity_definition_edit_table)){

		//let treeview_data = _create_treeview_data(panel_upstream_trace_data);
		let treeview_data = [panel_upstream_trace_data];
		utils_sort_treeview_data_by_nando_id(treeview_data);
		_vgp_init_entity_definition_edit_table(panel_gene_definitive_arr, panel_entity_definition_arr, panel_id, nando_id, panel_name, 
			ncbi_gene_id, gene_symbol,entity_type_id, entity_name, treeview_data, is_from_user, text_source);
	}
}

function _vgp_init_panel_entity_history(panel_gene_definitive_arr,panel_gene_autoreview_arr,panel_entity_review_arr,mode_of_inheritance_arr){

	let $wrapper = $('#ul_history');
	panel_gene_definitive_arr.concat(panel_gene_autoreview_arr).map( review =>{

		let $li = $('<li>').prependTo($wrapper);
		$(`<div class="time">-</div>`).appendTo($li);
		if('source' in review && review.source){
			$(`<label>${review.source}</label>`).appendTo($li);
		}else{
			$(`<label>${review.title}</label>`).appendTo($li);
		}

		let text = `Rating: ${'rating' in review ? review.rating : RATING_NORATING}`

		if("mondo_en" in review || "mondo_ja" in review){
			disease = lang === 'en'? review.mondo_en : review.mondo_ja;
			text = text + "  |  Disease: " + (lang === 'en'? review.mondo_en : review.mondo_ja);
		}else if('nando_en' in review || 'nando_ja' in review){
			text = text + "  |  Disease: " + (lang === 'en'? review.nando_en : review.nando_ja);
		}

		$('<p>').text(text).appendTo($li);
	});

	let former_hash = {};
	panel_entity_review_arr.sort((a,b) => {
        return a.modified_at_int - b.modified_at_int;
    });
	for(let i = 0; i < panel_entity_review_arr.length; i++){
		former_hash[panel_entity_review_arr[i].user_id] = panel_entity_review_arr[i];
		let $li = $('<li>').prependTo($wrapper);
		$(`<div class="time">${panel_entity_review_arr[i].modified_at}</div>`).appendTo($li);
		if(panel_entity_review_arr[i].review_id == panel_entity_review_arr[i].original_review_id){
			$(`<label>Added Review (${panel_entity_review_arr[i].title})</label>`).appendTo($li);
		}else{
			$(`<label>Modified Review (${panel_entity_review_arr[i].title})</label>`).appendTo($li);
		}
		let text = `Rating: ${panel_entity_review_arr[i].rating}`
		if('phenotypes' in panel_entity_review_arr[i] && panel_entity_review_arr[i].phenotypes){
			let phenotype_names = [];
			let phenotypes = panel_entity_review_arr[i].phenotypes.split('|');
			for(let phenotype of phenotypes){
				let tmp = phenotype.split("--");
				phenotype_names.push(tmp[1]);
			}

			text = text + '  |  Diseases: ' + phenotype_names.join(', ');
		}

		if('mode_of_inheritances' in panel_entity_review_arr[i] && panel_entity_review_arr[i].mode_of_inheritances){
			text = text + '  |  Mode Of Inheritance: ' + utils_mode_of_inheritances_ids_to_names(panel_entity_review_arr[i].mode_of_inheritances, mode_of_inheritance_arr) ;
		}
		$('<p>').text(text).appendTo($li);
	}
}

function _attach_title(arr, entity_name, entity_type_id){
	if(arr && arr.length > 0 && entity_type_id == ENTITY_TYPE_ID_GENE){
		filtered_arr = arr.filter(item => item.hgnc_gene_symbol === entity_name || item.gene_symbol === entity_name);
		return filtered_arr.map(item => ({
            ...item,
            title: 'source' in item ? item.source : `${item.first_name_en} ${item.last_name_en} (${item.affiliation})`
        }));
	}else{
		return [];
	}
}

function _retrieve_newest_review(panel_entity_review_arr){

	if(!panel_entity_review_arr || panel_entity_review_arr.length === 0) return [];

	const validItems = panel_entity_review_arr.filter(item => item.is_latest === ENUM_VAL_YES);

	return validItems.sort((a,b) => {
		return b.modified_at_int - a.modified_at_int;
	});
}

function _get_comment_hash_by_user_id(panel_entity_review_comment_arr){

	return panel_entity_review_comment_arr.reduce((acc, item) => {
        const { user_id } = item;
        if(!acc[user_id]) {
            acc[user_id] = {};
        }
		if(!acc[user_id][item.original_review_id]){
			acc[user_id][item.original_review_id] = []
		} 
        acc[user_id][item.original_review_id].push(item);
        return acc;
    }, {});

}

function _vgp_init_rating_tag_list(rating_hash){
	for (let rating in RATING_LIST_TAG_ID_HASH){
		let id = RATING_LIST_TAG_ID_HASH[rating];
		$("#"+id).text(rating_hash[rating]).data('rating', rating)
			.click(function(){
				if($(this).hasClass('selected')){
					let num = $("#vgp-panel-gene-review-panel").find('.vgp-panel-entity-review-list-wrapper').show().length;
					_update_current_user_review_display();
					$('#panel_entity_review_num').text(num);
					$(this).removeClass('selected');
					return;
				}
				$("#vgp-panel-gene-review-panel").find('.vgp-rating-list-tag').removeClass('selected');
				$(this).addClass('selected');
				let rating = $(this).data("rating");
				$("#vgp-panel-gene-review-panel").find('.vgp-panel-entity-review-list-wrapper').hide();
				let num = $("#vgp-panel-gene-review-panel").find('.vgp-panel-entity-review-list-wrapper').filter(function(){
						return $(this).data('rating') === rating;
					}).show().length;
				$('#panel_entity_review_num').text(num);
				_update_current_user_review_display();
			})
			.addClass(rating_hash[rating] > 0 ? RATING_CLASS_HASH[rating] : '');
	}
}

function _update_current_user_review_display(){

	let isFirstUserReview = true;

	$('#vgp-panel-gene-review-panel')
		.find('div.vgp-panel-entity-review-list-wrapper:visible')
		.each(function () {
			let $review = $(this);
			if(!$review.hasClass('other')){
				if(isFirstUserReview){
					$review.removeClass('not-first-user-review');
					isFirstUserReview = false;
				}else{
					$review.addClass('not-first-user-review');
				}

			}
		});
}

function _get_gene_arr(hash, nando_id, entity_name){

	let ret = [];

	if(hash && nando_id in hash){
		let arr = hash[nando_id];
		if(arr && arr.length > 0){
			ret = arr.filter(item => item.hgnc_gene_symbol === entity_name);
		}
	}

	return ret;
}

function _vgp_init_reviews(	
	panel_gene_definitive_arr,
	panel_gene_autoreview_arr,
	panel_entity_gene_arr,
	panel_entity_review_arr, 
	panel_entity_review_comment_arr, 
	panel_entity_definition_arr,
	entity_type_id,	entity_name, mode_of_inheritance_arr, selected_review_id,
    panel_id, nando_id, panel_name, ncbi_gene_id, gene_symbol,
	moi_treeview_data,entity_type_arr,rating_type_arr,panel_upstream_trace_data,is_edit_definition,
	selected_user_id,selected_original_review_id, selected_review_id)
{

	let is_from_user = ENUM_VAL_YES;
	if(panel_gene_definitive_arr.length > 0 || panel_gene_autoreview_arr.length > 0 || panel_entity_gene_arr.length > 0){
		is_from_user = ENUM_VAL_NO;
	}

	if((typeof _vgp_init_inputmodal) !== "undefined" && utils_isFunction(_vgp_init_inputmodal)){
        _vgp_init_inputmodal(mode_of_inheritance_arr, entity_type_arr, rating_type_arr, moi_treeview_data);

		if(utils_isFunction(_vgp_init_inputmodal_create_add_or_edit_review_btn)){
			let $wrapper = $('#btn_add_review_wrapper');

			_vgp_init_inputmodal_create_add_or_edit_review_btn($wrapper,false,false,panel_id,nando_id,panel_name,'',
				ncbi_gene_id,gene_symbol,entity_name,entity_type_id,RATING_NORATING,RATING_ORDER_HASH[RATING_NORATING], is_from_user);
        }
    }

	panel_gene_definitive_arr = _attach_title(panel_gene_definitive_arr, entity_name, entity_type_id);
	panel_gene_autoreview_arr = _attach_title(panel_gene_autoreview_arr, entity_name, entity_type_id);
 	panel_entity_review_arr   = _attach_title(panel_entity_review_arr,   entity_name, entity_type_id);

	let panel_entity_newest_review_arr   = _retrieve_newest_review(panel_entity_review_arr);
	let panel_entity_review_comment_hash = _get_comment_hash_by_user_id(panel_entity_review_comment_arr);
	let current_definition_arr = panel_entity_definition_arr.filter(item =>
		item.is_latest === ENUM_VAL_YES && item.is_deleted !== ENUM_VAL_YES
	);

	_vgp_init_panel_entity_history(panel_gene_definitive_arr,panel_gene_autoreview_arr,panel_entity_review_arr,mode_of_inheritance_arr);

	let total_data_arr = panel_entity_newest_review_arr.concat( panel_gene_definitive_arr, panel_gene_autoreview_arr);

	_vgp_init_panel_entity_summary_tbl(
		panel_gene_definitive_arr, panel_gene_autoreview_arr, panel_entity_gene_arr, current_definition_arr,
		panel_id, nando_id, panel_name, ncbi_gene_id, gene_symbol,entity_type_id, entity_name, 
		panel_upstream_trace_data, is_from_user);

	let total_review_num = total_data_arr.length;
	$("#panel_entity_review_num").text(total_review_num);
	$('#nav-vgp-panel-gene-review-panel').text(`Reviews (${total_review_num})`);

	let rating_hash = utils_count_rating(panel_gene_definitive_arr,panel_gene_autoreview_arr,panel_entity_newest_review_arr);
	_vgp_init_rating_tag_list(rating_hash);
	
	
	let $tabContent = $('#vgp-panel-gene-review-panel');

	let current_user_review_arr = [];
	let other_user_review_arr = total_data_arr;
	let current_user_id = ""
	if(typeof _get_current_user_id === "function"){
		current_user_id = _get_current_user_id();
		const [yes, no] = total_data_arr.reduce(
			(acc, item) => {
				(item.user_id == current_user_id ? acc[0] : acc[1]).push(item);
				return acc;
			},
			[[], []]
		);
		current_user_review_arr = yes;
		other_user_review_arr = no;
	}
	
	let cnt = 0;
	let isFirstUserReview = true;

	let is_current_user_curator = false;
	if(typeof _is_current_user_curator !== "undefined" && utils_isFunction(_is_current_user_curator)){	
		is_current_user_curator = _is_current_user_curator();
	}

	for(let data_arr of [current_user_review_arr,other_user_review_arr]){
		for(let review of data_arr){
			let $wrapper             = $('<div>').addClass("vgp-panel-entity-review-list-wrapper other").appendTo($tabContent);
			let $upper_wrapper       = $('<div>').addClass("vgp-review-upper-wrapper d-flex justify-content-between").appendTo($wrapper);
			let $upper_left_wrapper  = $('<div>').addClass("vgp-review-upper-left-wrapper d-flx flex-column").appendTo($upper_wrapper);
			let $upper_right_wrapper = $('<div>').addClass("vgp-review-control-wrapper d-flex flex-column").appendTo($upper_wrapper);

			let rating = 'rating' in review ? utils_check_rating_def(review.rating) : RATING_NORATING;
			$wrapper.data('rating',rating);
			$(`<div><span class="vgp-rating-tag ${RATING_CLASS_HASH[rating]}">${rating}</span></div>`).appendTo($upper_left_wrapper);
			$(`<div class="vgp-review-user-title">${review.title}</div>`).appendTo($upper_left_wrapper);

			if('group_en' in review){
				$(`<div class="vgp-review-group">${review.group_en}</div>`).appendTo($upper_left_wrapper);
			}

			if('mode_of_inheritances' in review && review.mode_of_inheritances){
				let text_str =  utils_mode_of_inheritances_ids_to_names(review.mode_of_inheritances, mode_of_inheritance_arr);
				$(`<div><font class="vgp-review-title-font">Mode of inheritance:</font> ${text_str}</div>`).appendTo($upper_left_wrapper);
			}else if('moi_ja' in review || 'moi_en' in review){
				let moi = review.moi_ja;
				if(lang !== 'ja') moi = review.moi_en;
				$(`<div><font class="vgp-review-title-font">Mode of inheritance:</font> ${moi}</div>`).appendTo($upper_left_wrapper);
			}

			if("mondo_url" in review && review.mondo_url){
				$(`<div><font class="vgp-review-title-font">Phenotype:</font> ${(lang === 'en' || !(review.mondo_ja)) ? 
					review.mondo_en: review.mondo_ja}</div>`).appendTo($upper_left_wrapper);
			}else if('nando_en' in review || 'nando_ja' in review){
				$(`<div><font class="vgp-review-title-font">Phenotype:</font> ${(lang === 'en' || !(review.nando_ja))? 
					review.nando_en: review.nando_ja}</div>`).appendTo($upper_left_wrapper);
			}else if('phenotypes' in review && review.phenotypes){
				let phenotypes_str = '';
				if(review.phenotypes){
					let phenotypes = review.phenotypes.split('|');
					for(let phenotype of phenotypes){
						let tmp = phenotype.split("--");
						if(phenotypes_str){
							phenotypes_str = phenotypes_str + ", ";
						}
						phenotypes_str = phenotypes_str + tmp[1];
					}
				}
				$(`	<div>
						<font class="vgp-review-title-font">Phenotype:</font> ${phenotypes_str}
					</div>
				`).appendTo($upper_left_wrapper);
			}

			if('publications' in review && review.publications){
				let html_obj = utils_extract_publication(review.publications);
				$(`
					<div>
						<font class="vgp-review-title-font">Publications:</font>
						${html_obj}
					</div>
				`).appendTo($upper_left_wrapper);
			}

			if('user_id' in review){
				$wrapper.attr('data-user_id',review.user_id);
			}	
			if('original_review_id' in review){
				$wrapper.attr('data-original_review_id',review.original_review_id);
			}
			if('review_id' in review){
				$wrapper.attr('data-review_id',review.review_id);
			}

			let is_current_user = false;
			if('user_id' in review && current_user_id){

				let $current_user_title_wrapper = $('<div>').prependTo($wrapper);
				if(review.user_id == current_user_id){

					// remove Add Review button.
					$('#btn_add_review_wrapper').empty();

					is_current_user = true;

					$wrapper.removeClass('other');
					if(isFirstUserReview){
						isFirstUserReview = false;
					}else{
						$wrapper.addClass('not-first-user-review');
					}

					let current_user_title_html_str = `
						<div class="current-user-title-wrapper">
							<div class="left">
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M17.1683 5.80469L14.2033 2.83769C12.1763 0.807687 11.1633 -0.205313 10.0743 0.0346874C8.98525 0.274687 8.49325 1.62169 7.50625 4.31469L6.83825 6.13769C6.57525 6.85569 6.44325 7.21469 6.20625 7.49269C6.10031 7.61768 5.9794 7.72919 5.84625 7.82469C5.55025 8.03769 5.18225 8.13869 4.44625 8.34169C2.78625 8.79969 1.95525 9.02869 1.64225 9.57169C1.50695 9.80672 1.43654 10.0735 1.43825 10.3447C1.44225 10.9717 2.05125 11.5807 3.26825 12.7997L4.68425 14.2157L0.208252 18.6957C0.0718582 18.8403 -0.00281615 19.0323 8.1271e-05 19.2311C0.0029787 19.4298 0.0832197 19.6196 0.223771 19.7602C0.364321 19.9007 0.554116 19.981 0.752863 19.9839C0.951611 19.9868 1.14366 19.9121 1.28825 19.7757L5.76325 15.2957L7.22925 16.7637C8.45525 17.9897 9.06825 18.6037 9.69925 18.6037C9.96425 18.6037 10.2253 18.5357 10.4563 18.4037C11.0043 18.0907 11.2343 17.2547 11.6953 15.5817C11.8973 14.8467 11.9983 14.4797 12.2103 14.1827C12.3036 14.0534 12.4109 13.936 12.5323 13.8307C12.8073 13.5927 13.1643 13.4587 13.8773 13.1907L15.7213 12.4977C18.3853 11.4977 19.7173 10.9967 19.9513 9.91169C20.1863 8.82569 19.1813 7.81869 17.1683 5.80469Z" fill="#005D16"/>
								</svg>
								<span>Your Reviews:</span>
							</div>
						</div>
					`;
					$current_user_title_wrapper.html(current_user_title_html_str);
			}

			if(is_current_user || is_current_user_curator){
					let $current_user_title_ctl_wrapper = $('<div>').addClass('vgp-review-control-subwrapper').appendTo($wrapper);

					let review_comment_arr = [];
					if(panel_entity_review_comment_hash[review.user_id] && panel_entity_review_comment_hash[review.user_id][review.original_review_id]){
						panel_entity_review_comment_hash[review.user_id][review.original_review_id].map(review_comment => {
							review_comment_arr.push(review_comment.comment);
						})
					}
					
					_vgp_inputmodal_create_delete_review_btn($current_user_title_ctl_wrapper, review, entity_type_id, review_comment_arr);
					_vgp_inputmodal_create_edit_review_btn($current_user_title_ctl_wrapper, review);
				}
			}

			// add comments
			if(panel_entity_review_comment_hash[review.user_id] && panel_entity_review_comment_hash[review.user_id][review.original_review_id]){

				let $comment_wrapper = $('<div>').addClass('vgp-review-comment-list-wrapper').appendTo($wrapper);

				for(let panel_entity_review_comment of panel_entity_review_comment_hash[review.user_id][review.original_review_id]){
					cnt++;

					let review_comment_container_id = 'review_comment_container_'+cnt;
					let $review_comment_container   = $('<div>')
						.attr('id',review_comment_container_id)
						.addClass('vgp-review-comment-container')
						.appendTo($comment_wrapper);

					let triangle_html_str=`
						<svg class="vgp-triangle" width="36" height="18" viewBox="0 0 36 18" aria-hidden="true">
							<defs>
								<mask id="corner-mask" maskUnits="userSpaceOnUse">
									<rect width="36" height="18" fill="black"/>
									<path d="M 36 -2 L -2 -2 L 36 18 Z" fill="white" />
								</mask>
							</defs>
							<rect width="36" height="18" fill="#FFF" mask="url(#corner-mask)" />
							<path d="M 35 1 L 1 1 L 35 17" fill="none" stroke="#BFD3C1" stroke-width="2" stroke-linejoin="miter" stroke-linecap="square" vector-effect="non-scaling-stroke" />
						</svg>
					`;
					$(triangle_html_str).appendTo($review_comment_container);

					let $content_container = $('<div>').addClass('content-container').appendTo($review_comment_container);

					let $review_comment_editor_wrapper = $('<div>').addClass('vgp-review-comment-editor-container').appendTo($content_container);

					$('<p>').addClass("vgp-review-comment-text-content")
						.html(panel_entity_review_comment.comment.replaceAll('\n','<br>'))
						.appendTo($review_comment_editor_wrapper);
				
					let pv = (panel_entity_review_comment.panel_type === TYPE_SPECIFIED)? 
						"Panel Version: " + panel_entity_review_comment.panel_versions.join(' ') : '';
					$(`<div class="vgp-review-comment-timestamp">
						Created: ${panel_entity_review_comment.last_name_en} ${panel_entity_review_comment.first_name_en}(${panel_entity_review_comment.comment_created_at})&nbsp;&nbsp;&nbsp; 
						Last Modified: ${panel_entity_review_comment.last_name_en_c} ${panel_entity_review_comment.first_name_en_c}(${panel_entity_review_comment.comment_modified_at})&nbsp;&nbsp;&nbsp;
						${pv}
					   </div>
						`
					).appendTo($review_comment_container)
					
					if(	is_current_user_curator ||
						(current_user_id && panel_entity_review_comment.comment_user_id == current_user_id)
					){
						let $review_comment_control_btn_panel = $('<div>').addClass("vgp-review-comment-control-btn-panel").appendTo($content_container);
						_vgp_inputmodal_create_delete_review_comment_btn($review_comment_control_btn_panel,review_comment_container_id, panel_entity_review_comment);
						_vgp_inputmodal_create_edit_review_comment_btn($review_comment_control_btn_panel, review_comment_container_id, panel_entity_review_comment);
					}
				}
			}

			//if(is_current_user && typeof _vgp_inputmodal_create_add_review_comment_panel === 'function'){
			if('review_id' in review && typeof _vgp_inputmodal_create_add_review_comment_panel === 'function'){
				// create add comment panel
				let $add_comment_wrapper = $('<div>').appendTo($wrapper);
				_vgp_inputmodal_create_add_review_comment_panel($add_comment_wrapper,review.review_id,review.original_review_id);
			}

			if('created_at' in review){
				let pv = (review.panel_type === TYPE_SPECIFIED)?
					"Panel Version: " + review.panel_versions.join(' ') : '';
				$(`<div class="vgp-review-group vgp-review-comment-timestamp">
					Created: ${review.last_name_en_c} ${review.first_name_en_c}(${review.created_at})&nbsp;&nbsp;&nbsp;
					Last Modified: ${review.modified_at}&nbsp;&nbsp;&nbsp;
					${pv}
				</div>`
				).appendTo($wrapper)
			}
		}
	}
	if(selected_user_id){
		const el = document.querySelector(`.vgp-panel-entity-review-list-wrapper[data-user_id="${selected_user_id}"]`);
		if (el) {
			el.scrollIntoView({
				behavior: 'smooth',	block: 'center',inline: 'center'
			});
		}
	}else if(selected_original_review_id){
		const el = document.querySelector(`.vgp-panel-entity-review-list-wrapper[data-original_review_id="${selected_original_review_id}"]`);
		if (el) {
			el.scrollIntoView({
				behavior: 'smooth', block: 'center',inline: 'center'
			});
		}
	}else if(selected_review_id){
		const el = document.querySelector(`.vgp-panel-entity-review-list-wrapper[data-review_id="${selected_review_id}"]`);
		if (el) {
			el.scrollIntoView({
				behavior: 'smooth', block: 'center',inline: 'center'
			});
		}
	}else if(is_edit_definition){
		$('#btn-definition-edit').click();
	}else if(selected_review_id){
		//$('#btn_panel_entity_review_edit').click();
	}
}





function _vgp_init(	
	ncbi_gene_id, 
	gene_symbol, 
	entity_name, 
	entity_type_id, 
	gene_rating, 
	panel_id, 
	nando_id, 
	panel_name, 
	selected_review_id,
	is_edit_definition,
	selected_user_id,
	selected_original_review_id,
	selected_review_id
){

	_vgp_show_loading();

	if(gene_rating) _vgp_init_ui_gene_rating(gene_rating);

	_vgp_init_ui_more_info(ncbi_gene_id)

	_vgp_init_panel_data_modal_trigger(ncbi_gene_id, entity_name);

	let ajax_obj_arr = [
        {
            'url':             `${URL_LOAD_MULTI_CLASS}?lang=${lang}`,
            'output_data_key': 'multi_class',
            'init_ui_func':    _vgp_init_multi_class
        },
		{
			'url':             URL_GET_GENE_DETAIL_DATA + ncbi_gene_id,
			'output_data_key': 'panel_gene_detail_data',
			'init_ui_func':	   _vgp_init_ui_panel_gene_data
		},
        {
            'url':				`${URL_GET_PANEL_UPSTREAM_HIERARCHY}?panel_id=${panel_id}&lang=${lang}`,
            'output_data_key':	'panel_upstream_trace_data',
            'init_ui_func':		_vgp_init_ui_breadcrumblist
        },
		{
			'url':				`${URL_GET_PANEL_ENTITY_REVIEW}?panel_id=${panel_id}&entity_type_id=${entity_type_id}&entity_name=${entity_name}`,
			'output_data_key':	'panel_entity_review',
			'init_ui_func':		null
		},
		{
			'url':				`${URL_GET_PANEL_ENTITY_REVIEW_COMMENT}?panel_id=${panel_id}&entity_type_id=${entity_type_id}&entity_name=${entity_name}`,
			'output_data_key':  'panel_entity_review_comment',
			'init_ui_func':		null
		},
		{
			'url':              `${URL_GET_PANEL_ENTITY_DEFINITION}?panel_id=${panel_id}&entity_type_id=${entity_type_id}&entity_name=${entity_name}`,
			'output_data_key':  'panel_entity_definition',
			'init_ui_func':     null
		},
        {
            'url':              (lang==='ja') ? URL_MOI_TREEVIEW_DATA_JA : URL_MOI_TREEVIEW_DATA_EN,
            'output_data_key':  'moi_treeview_data',
            'init_ui_func':     null
        }
	]

	if(entity_type_id == ENTITY_TYPE_ID_GENE){
		ajax_obj_arr.push({
			'url':              URL_GET_PANEL_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key':  'panel_entity_gene_data',
			'init_ui_func':     null
		});
		ajax_obj_arr.push({
			'url':              URL_GET_PANEL_DEFINITIVE_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key':  'panel_definitive_gene_data',
			'init_ui_func':     null
		});
		ajax_obj_arr.push({
			'url':           URL_GET_PANEL_AUTOREVIEW_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
			'output_data_key': 'panel_autoreview_gene_data',
			'init_ui_func': null
		});

	}else{
		init_data.panel_definitive_gene_data = [];
		init_data.panel_autoreview_gene_data = [];
		init_data.panel_entity_gene_data     = [];
	}


	let init_data = {};
	let total_cnt = utils_countUrls(ajax_obj_arr);
	let completed_cnt = 0;
	ajax_obj_arr.forEach((ajax_obj) => {

		_makeAjaxRequest(ajax_obj.url, function(responseData){

			let json_data = JSON.parse(responseData);

			if(json_data && json_data.error){
				alert(json_data.error);
			}

			if(['panel_definitive_gene_data','panel_autoreview_gene_data','panel_entity_gene_data'].includes(ajax_obj.output_data_key)){
				init_data[ajax_obj.output_data_key] = _get_gene_arr(json_data, nando_id, entity_name);
			}else{
				init_data[ajax_obj.output_data_key] = json_data;
			}

			if(utils_isFunction(ajax_obj.init_ui_func)){
				ajax_obj.init_ui_func(ncbi_gene_id,init_data[ajax_obj.output_data_key],panel_id, nando_id, entity_name);
			}

			completed_cnt++;
			if(completed_cnt === total_cnt){
				//do final
				_vgp_init_reviews(
					init_data.panel_definitive_gene_data,
					init_data.panel_autoreview_gene_data,
					init_data.panel_entity_gene_data,
					init_data.panel_entity_review,
					init_data.panel_entity_review_comment,
					init_data.panel_entity_definition,
					entity_type_id,
					entity_name,
					init_data.multi_class.mode_of_inheritance_arr,
					selected_review_id,
					panel_id, nando_id, panel_name, ncbi_gene_id, gene_symbol,
					init_data.moi_treeview_data,
					init_data.multi_class.entity_type_arr,
					init_data.multi_class.rating_type_arr, 
					init_data.panel_upstream_trace_data,
					is_edit_definition,
					selected_user_id,
					selected_original_review_id,
					selected_review_id
				);
				_vgp_hide_loading();
			}
		});
	});
}
