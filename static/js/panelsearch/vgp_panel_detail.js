const	URL_GET_PANEL_DATA_BY_MONDO_ID            = '/sparqlist/api/pcf_get_disease_tooltip_data_by_mondo_id?mondo_id=',
		URL_GET_PANEL_AUTOREVIEW_GENE_BY_MONDO_ID = '/sparqlist/api/ps_get_autoreview_gene_by_mondo_id?mondo_id=',
		URL_GET_MONDO_UPSTREAM_TRACE_BY_MONDO_ID  = '/panelsearch_get_mondo_hierarchy',
		URL_GET_MONDO_DESCENDANT_BY_MONDO_ID      = '/panelsearch_get_mondo_descendant',
		URL_GET_PUBTATOR3_PAPER_COUNT_BY_MONDO_ID = '/sparqlist/api/ps_get_pubtator3_gene_id_paper_count_by_mondo_id?mondo_id=',
		URL_GET_PUBCHEM_PAPER_COUNT_BY_MONDO_ID   = '/sparqlist/api/ps_get_pubchem_gene_id_paper_count_by_mondo_id?mondo_id=',
		URL_DOWNLOAD_PANEL_BY_MONDO_ID            = '/sparqlist/api/pcf_download_panel_by_mondo_id?mondo_id=';


function _create_panel_link_html_str(mondo_id, panel_data_obj){
	let panel_link_html_str = "<a class=\"vgp-link\" href=\"" + panel_data_obj.mondo_url +"\" target=\"_blank\">"+ mondo_id +"</a>";
	[{'key_id':'omim_id',  'key_url':'omim_url'},
	 {'key_id':'orpha_id', 'key_url':'orpha_url'},
	 {'key_id':'icd-10_id','key_url':'icd_10_url'}
	].forEach((e) => {
		if(e.key_id in panel_data_obj){
			for(let i=0; i< panel_data_obj[e.key_id].length; i++){
				panel_link_html_str += "<a class=\"vgp-link\" href=\"" + panel_data_obj[e.key_url][i] +"\" target=\"_blank\">"+ panel_data_obj[e.key_id][i] +"</a>"; 
			}
		}
	});

	return panel_link_html_str;
}

function _vgp_init_description_mark(){
	let mark = document.getElementById('description_mark');
	tippy(mark, {
		arrow:     false,
		allowHTML:     true,
		appendTo:      document.body,
		animation:     'scale',    
		animationFill: true,
		maxWidth:      600,
		strategy:      'fixed',
		interactive:   true,
		theme:         'pcf-popup',
		placement:     'top',
		content:       `<div><span class="description-mark-title">About Ratings</span>Ratings summarize the level or status of evidence for each gene–disease relationship. Definitive, Strong, Moderate, and Limited represent graded levels of suppting evidence. Supportive is a broader category used when a source, including OMIM or Orphadata, reports an association without a directly comparable graded validity assessment. Disputed and Refuted indicate that the relationship has been challenged or refuted. Animal indicates animal-model-only evidence, No known indicates no known disease relationship, and No rating indicates that no classification is available. The number shown for each category is the number of source records assigned to that rating. <a href="https://thegencc.org/faq#validity-termsdelphi-survey" target="_blank">See the GenCC validity-term definitions for details.</a></div>`,
		offset: [0, 0]
	});
}


function _vgp_init_ui_panel_data(mondo_id, panel_data_obj){
   
	let title_panel_name = panel_data_obj.name_en;
	if(lang==="ja" && 'name_ja' in panel_data_obj && panel_data_obj.name_ja){
		title_panel_name = panel_data_obj.name_ja;
	}
	title_panel_name = title_panel_name.charAt(0).toUpperCase() + title_panel_name.slice(1);
	$('#vgp-panel-name').data('panel_id', mondo_id).data('panel_title', panel_data_obj.name_en).text(title_panel_name);
	$('#btn_add_common_panel').data('mondo_id',mondo_id).data('panel_name',title_panel_name);

	let $panel_summary_table = $('#vgp-panel-summary-table');

	[
		{'title': 'Definition:','content': typeof panel_data_obj.definition === 'object'? '': panel_data_obj.definition},
		//{'title': 'Synonym:',   'content': 'synonym' in panel_data_obj? panel_data_obj.synonym.join(', '):''},
		{'title': 'Link:',	  'content': _create_panel_link_html_str(mondo_id, panel_data_obj)}
	].forEach((e) => {
		let $tr = $('<tr>').appendTo($panel_summary_table);
		$('<th>').text(e.title).appendTo($tr);
		$('<td>' + e.content + '</td>').appendTo($tr);
	});
}


function _create_treeview_data(json_data){
	let ret_arr = [];
	for (let key in json_data){
	  let obj = {};
	  let t = key.split('--');
      obj['lang'] = lang;
	  obj['isFirstTimeLoad'] = true;
	  obj['mondo_id'] = t[0];
	  obj['num_child'] = t[1];
	  obj['name'] = t[0];
	  if(t.length > 2 && t[2].length > 0 ){
		obj['name'] = t[2];
	  }
	  obj['displayName'] = obj['name'] + " <font class=\"vgp-treeview-decendant-num\">("+obj['num_child']+")</font>";
	  if(t[1] == 0){
		obj['displayName'] = obj['name'];
		obj['isParent'] = false;
	  }else{
		obj['isParent'] = true;
	  }

	  if( typeof json_data[key] === 'object' ){
		obj['open'] = true;
		obj['children'] = _create_treeview_data(json_data[key]);
	  }
	  ret_arr.push(obj);
	}
	return ret_arr;
}

function _open_new_panel_detail_page(mondo_id){
	let url = `/panel_detail?lang=${lang}&panel_id=${mondo_id}`

	window.open(url, "_blank");
}

var zTreeObj;
function _vgp_init_ui_upstream_trace(mondo_id, panel_upstream_trace_data){
	let treeview_data = _create_treeview_data(panel_upstream_trace_data);
	let setting = {
		view: {dblClickExpand: false, showIcon: false, nameIsHTML: true},
		async: {
		  enable: true,
		  type:   "get",
		  url:	URL_GET_MONDO_DESCENDANT_BY_MONDO_ID,
		  autoParam: ["mondo_id", "lang"],
		},
		callback: {
		  onClick: function (event, treeId, treeNode) {
/*
			if (treeNode.isParent){
			  if(!treeNode.open && treeNode.isFirstTimeLoad){
				//zTreeObj.removeChildNodes(treeNode);
				zTreeObj.reAsyncChildNodes(treeNode, "refresh");
				treeNode.isFirstTimeLoad = false;
			  }
			  zTreeObj.expandNode(treeNode);
			}
*/
			if(treeNode.mondo_id !== 'MONDO:0700096'){
				setTimeout(function () { _open_new_panel_detail_page(treeNode.mondo_id);}, 10);
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
		  key: {name: "displayName", title:"mondo_id"}
		}
	};
	zTreeObj = $.fn.zTree.init($("#vgp-treeview"), setting, treeview_data);

	let nodes = zTreeObj.getNodes();
	_highlight_upstream_treeview_startNode(zTreeObj, nodes, mondo_id);
}

function _highlight_upstream_treeview_startNode(zTree, nodes, mondo_id) {
	for (var i = 0; i < nodes.length; i++) {

		if (nodes[i].mondo_id === mondo_id) { 
		   zTree.selectNode(nodes[i], true, true);
		}
		// 递归处理子节点
		if (nodes[i].isParent && nodes[i].children) {
			_highlight_upstream_treeview_startNode(zTree, nodes[i].children, mondo_id);
		}
	}
}



function _vgp_init(mondo_id, r_lang){


    $('#btn_copy_link')
        .tooltip({'title':'URL Copied to clipboard!', 'trigger':'manual', 'placement':'bottom'})
        .on('click', function (e) {
            $(this).tooltip('show');
            let text = window.location.href;
            let textarea = document.createElement("textarea");
            textarea.style = "position: absolute; left: -1000px; top: -1000px";
            textarea.textContent = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
        })
        .on('mouseleave', function () {
            $(this).tooltip('hide');
        })



	_vgp_show_loading();

	let ajax_obj_arr = [
		{
			'url':			   URL_GET_PANEL_DATA_BY_MONDO_ID + mondo_id,
			'output_data_key': 'panel_data',
			'init_ui_func':	   _vgp_init_ui_panel_data
		},
		{
			'url':			   URL_GET_PANEL_AUTOREVIEW_GENE_BY_MONDO_ID + mondo_id.replace('MONDO:',''),
			'output_data_key': 'panel_autoreview_gene_data',
			'init_ui_func':	   null
		},
		{
			'url':			   `${URL_GET_MONDO_UPSTREAM_TRACE_BY_MONDO_ID}?lang=${r_lang}&mondo_id=${mondo_id}`,
			'output_data_key': 'panel_upstream_trace_data',
			'init_ui_func':	   _vgp_init_ui_upstream_trace
		},
		{
			'url':				URL_GET_PUBTATOR3_PAPER_COUNT_BY_MONDO_ID + mondo_id.replace('MONDO:',''),
			'output_data_key':	'pubtator3_paper_cnt_list',
			'init_ui_func':		null
		},
		{
			'url':				URL_GET_PUBCHEM_PAPER_COUNT_BY_MONDO_ID + mondo_id.replace('MONDO:',''),
			'output_data_key':	'pubchem_paper_cnt_list',
			'init_ui_func':		null
		}
	];

	let init_data = {};
	init_data['current_mondo_id'] = mondo_id;
	let total_cnt = ajax_obj_arr.length;
	let completed_cnt = 0;

	console.log("start download data");

	function handle_response(ajax_obj, json_data){
		init_data[ajax_obj.output_data_key] = json_data;
		if(_isFunction(ajax_obj.init_ui_func)){
			ajax_obj.init_ui_func(mondo_id, init_data[ajax_obj.output_data_key]);
		}

		completed_cnt++;
		if(completed_cnt === total_cnt){
			let gene_list = _get_gene_list_from_autoreview_data(init_data['panel_autoreview_gene_data']);
			$('.vgp-panel-genes-num').text(gene_list.length);
			$('#vgp-panel-genes-filter').attr({'placeholder':"Filter "+gene_list.length+" Genes"});
			$('#btn_add_common_panel').data('gene_cnt',gene_list.length);
			let $tbody = $('#vgp-panel-gene-table-tbody');
			let len = _vgp_init_ui_panel_entity($tbody, mondo_id,   init_data['panel_autoreview_gene_data'], init_data['pubtator3_paper_cnt_list'], init_data['pubchem_paper_cnt_list']);
			_update_panel_entity_name_width(len);
			_vgp_init_attach_event_handlers(mondo_id);
			_vgp_hide_loading();
		}
	}

	ajax_obj_arr.forEach((ajax_obj) => {
		_makeAjaxRequest(ajax_obj.url, 
			function(responseData){
				let json_data = JSON.parse(responseData);
				handle_response(ajax_obj, json_data);
			},
			function(){
				if(ajax_obj.output_data_key === 'pubtator3_paper_cnt_list' || ajax_obj.output_data_key === 'pubchem_paper_cnt_list'){
					handle_response(ajax_obj, []);
				}else{
					_vgp_hide_loading();
					alert("ajax error:"+ajax_obj.url);
				}
			}
		);
	});
}

function _vgp_table_filter(filter){
	let $filter     = $(filter);
	let filterValue = $filter.val().toLowerCase();
	let table_id    = $filter.data('table-id');
	let target_class= '.' + $filter.data('sort-inner-target');

	let is_native_switch_on = $('#vgp-panel-gene-table').hasClass('native');

	let filtered_gene_name_hash = {};
	$(`#${table_id}>tbody>tr`).filter(function(){
		let $tr = $(this);

		$tr.removeClass('hidden');
		if(is_native_switch_on && $tr.hasClass('not_native')) return false;

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

function _vgp_init_attach_event_handlers(mondo_id){
	$('[data-toggle="tooltip"]').tooltip({'trigger':'hover'});

	$('#btn_download_panel').data('panel_id',mondo_id).click(function(){
		let $btn = $(this);
		let panel_id = $btn.data('panel_id');
		_vgp_show_loading();
		let url_str = URL_DOWNLOAD_PANEL_BY_MONDO_ID + panel_id;
		_makeAjaxRequest(url_str, function(responseData){
			_vgp_hide_loading();
			_create_download_file(responseData, 'panel-'+panel_id.replace(/MONDO:/,'')+'.txt');
		},function(){_vgp_hide_loading();});
	});

	$('#vgp-panel-genes-filter').on("input", function(){
		_vgp_table_filter(this);
	});

	$('#btn_show_reviewers').click(function(){
		$('#nav-vgp-reviewers-panel').trigger('click');
	});

	$('.vgp-panel-genes-table').on('click', 'span.vgp-summary-controll', function(){
		_vgp_summary_control(this);
	});

	$('#vgp-summary-switch').click(function(){
		_vgp_summary_control(this);
	});

	setTimeout(function () { _attach_panel_gene_name_event(); }, 50);

	$('.vgp-panel-genes-table').on('click', 'span.vgp-sorter', function(){
		_vgp_table_sort(this);
	});

	const switchInput = document.getElementById('native_switch');
	switchInput.addEventListener('change', (event) => {
		if (event.target.checked) {
			$('#vgp-panel-gene-table').addClass('native');
		} else {
			$('#vgp-panel-gene-table').removeClass('native');
		}

		let filter = document.getElementById('vgp-panel-genes-filter');
		_vgp_table_filter(filter);
	});


	$('#btn_add_common_panel').click(function(){
		let $btn = $(this);
		addCommonPanelItemToList({'mondo_id': $btn.data('mondo_id'), 'name': $btn.data('panel_name'), 'gene_cnt': $btn.data('gene_cnt')}, true);
	});
}
