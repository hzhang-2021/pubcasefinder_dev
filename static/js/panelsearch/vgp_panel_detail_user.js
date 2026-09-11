const URL_GET_PANEL_DATA_BY_MONDO_ID='/sparqlist/api/pcf_get_disease_tooltip_data_by_mondo_id?mondo_id=',
	  URL_GET_PANEL_GENE_BY_MONDO_ID='/sparqlist/api/pcf_get_gene_by_mondo_id?',
	  URL_GET_MONDO_UPSTREAM_TRACE_BY_MONDO_ID='/panelsearch_get_mondo_hierarchy?mondo_id=',
	  URL_GET_MONDO_DESCENDANT_BY_MONDO_ID='/panelsearch_get_mondo_descendant',
	  URL_GET_GENE_TOOLTIP_DATA_BY_GENE_ID='/sparqlist/api/pcf_get_gene_tooltip_data_by_ncbi_gene_id?ncbi_gene_id=',
	  URL_DOWNLOAD_PANEL_BY_MONDO_ID='/sparqlist/api/pcf_download_panel_by_mondo_id?mondo_id=';

const RATING_ORDER_HASH = {
  'Definitive': 90,
  'Strong':	    80,
  'Moderate':   70,
  'Supportive': 60,
  'Limited':	50,
  'Disputed':   40,
  'Refuted':	30,
  'Animal':	    20,
  'No known':   10,
  'No rating':  5
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
	};

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
	
	if(popup_content_hgnc_gene_symbol) max_text_len  = 60;
	if(max_text_len < popup_content_synonym.length)		 max_text_len = popup_content_synonym.length;
	if(max_text_len < popup_content_full_name.length)	   max_text_len = popup_content_full_name.length;
	if(max_text_len < popup_content_other_full_name.length) max_text_len = popup_content_other_full_name.length;
	if(max_text_len < popup_content_summary.length)		 max_text_len = popup_content_summary.length;
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

	if($button.data('relative-id')){

		if(!($button.data('cnt'))) return;

		let relative_id = $button.data('relative-id');
		if($("#"+relative_id).hasClass('vgp-active')){
			let relative_table_id = $button.data('relative-table-id');
			$("#"+relative_table_id).hide();
			let relative_cnt = $("#"+relative_id).data('cnt');
			$("#"+relative_id).removeClass('vgp-active')
			$("#"+relative_id).text("Show("+relative_cnt+")");
		}
	}

	$button.toggleClass('vgp-active');
	if($button.hasClass('vgp-active')){
		$button.text('Hide');
		$("#"+table_id).show();
	}else{
		let display_text = "Show";
		if($button.data('cnt')){
		display_text = display_text + "(" + $button.data('cnt')  + ")";
		}
		$button.text(display_text);
		$("#"+table_id).hide();
	}  
}

function _vgp_table_sort(btn){

	let $sorter   = $(btn);
	let element   = $sorter.data('sort-id');
	let method	= $sorter.data('sort-method');
	let isMulti   = $sorter.data('sort-target-multi');
	let rowClass  = '.' + $sorter.data('sort-target-row');
	let inner_target_class = '.' + $sorter.data('sort-inner-target');

	let sortClass = 'vgp-asc';

	if($sorter.hasClass('vgp-asc')){
	  sortClass = 'vgp-dsc';
	}else if($sorter.hasClass('vgp-dsc')){
	  sortClass = 'vgp-asc';
	}

	$sorter.closest('tr').find('.vgp-sorter').removeClass('vgp-dsc').removeClass('vgp-asc');
	$sorter.addClass(sortClass);


	if(isMulti){
		let arr = $sorter.closest('table').find(rowClass);
		let arr2 = [];
		for(let i=0;i<arr.length;i++){
		  if(i % 2 === 1){
			let row1 = arr[i-1];
			let row2 = arr[i];
			let item = {"row1": row1, "row2":row2};
			arr2.push(item);
		  }
		}

		let arr3 = arr2.sort(function(a,b){
		  let sortNum = 1;
		  if(method === 'vgp-sort-method-letter'){
			let a_text = $(a.row1).find("td").eq(element).text();
			let b_text = $(b.row1).find("td").eq(element).text();
			if(a_text === b_text){
			  sortNum = 0;
			}else if(a_text > b_text){
			  sortNum = 1;
			}else{
			  sortNum = -1;
			}
		  }else if(method === 'vgp-sort-method-innerletter'){
			let a_text = $(a.row1).find("td").eq(element).find(inner_target_class).eq(0).text();
			let b_text = $(b.row1).find("td").eq(element).find(inner_target_class).eq(0).text();
			if(a_text === b_text){
			  sortNum = 0;
			}else if(a_text > b_text){
			  sortNum = 1;
			}else{
			  sortNum = -1;
			}
		  }else if(method === 'vgp-sort-method-innernum'){
			let a_num = parseInt($(a.row1).find("td").eq(element).find(inner_target_class).eq(0).text());
			let b_num = parseInt($(b.row1).find("td").eq(element).find(inner_target_class).eq(0).text());
			if(a_num === b_num){
			  sortNum = 0;
			}else if(a_num > b_num){
			  sortNum = 1;
			}else{
			  sortNum = -1;
			}
		  }else if(method === 'vgp-sort-method-rating'){
			let a_text = $(a.row1).find("td").eq(element).find(inner_target_class).eq(0).text();
			let b_text = $(b.row1).find("td").eq(element).find(inner_target_class).eq(0).text();
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
   
		let arr4 = [];
		for(let i=0;i<arr3.length;i++){
		  arr4.push(arr3[i].row1);
		  arr4.push(arr3[i].row2);
		}
		$sorter.closest('table').find('tbody').eq(0).html(arr4);
		return;
	}

	let arr = $sorter.closest('table').find(rowClass).sort(function(a,b){

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
		}

		if(sortClass === "vgp-dsc") {
		  // 降順
		  sortNum *= (-1) ;
		}

		return sortNum;
	});

	$sorter.closest('table').find('tbody').eq(0).html(arr);
}


function _vgp_table_filter(filter){
	let $filter		  = $(filter);
	let table_id		 = $filter.data('table-id');
	let target_row_class = '.' + $filter.data('target-row-class');
	let isMulti		  = $filter.data('target-multi');
	let inner_target_class = '.' + $filter.data('sort-inner-target');

	let filterValue = $filter.val().toLowerCase();
	
	if(isMulti){
		let arr1 = $('#' + table_id).find(target_row_class);
		let arr2 = [];
		for(let i=0;i<arr1.length;i++){
			if(i % 2 ===1){
				let obj = {'row1': arr1[i-1],'row2':arr1[i]};
				arr2.push(obj);
			}
		}

		for(let i=0; i<arr2.length;i++){
		   let text = $(arr2[i].row1).find(inner_target_class).eq(0).text().toLowerCase();
		   let hit = text.indexOf(filterValue);
		   $(arr2[i].row1).toggle(hit > -1);
		   $(arr2[i].row2).toggle(hit > -1);
		}

	}else{
		$('#' + table_id).find(target_row_class).filter(function(){
		   let hit = $(this).text().toLowerCase().indexOf(filterValue);
		   $(this).toggle(hit > -1);
		});
	}
}

function _vgp_open_gene_detail(vgp_panel_name_obj){

	let $panel = $('#vgp-panel-name');
	let panel_id = $panel.data('panel_id');
	let panel_title = $panel.data('panel_title');

	let gene_id = $(vgp_panel_name_obj).data('ncbi_gene_id');
	let gene_title = $(vgp_panel_name_obj).data('gene_title');

	let urlstr = "panel_id="	+ encodeURIComponent(panel_id) + "&" +
				 "panel_title=" + encodeURIComponent(panel_title) + "&" +
				 "gene_id="	    + encodeURIComponent(gene_id)+ "&"+
				 "gene_title="  + encodeURIComponent(gene_title)+ "&";
	urlstr = "/panelsearch_panel_gene_detail?" + urlstr;
	window.open(urlstr, "_blank");
}

function _create_panel_link_html_str(mondo_id, panel_data_obj){
	let panel_link_html_str = "<a class=\"vgp-link\" href=\"" + panel_data_obj.mondo_url +"\" target=\"_blank\">"+ mondo_id +"</a>";
	[{'key_id':'omim_id',  'key_url':'omim_url'},
	 {'key_id':'orpha_id', 'key_url':'orpha_url'},
	 {'key_id':'icd-10_id','key_url':'icd_10_url'}
	].forEach((e) => {
		if(e.key_id in panel_data_obj){
			for(let i=0; i< panel_data_obj[e.key_id].length; i++){
				panel_link_html_str += "<a class=\"vgp-link\" href=\"" + panel_data_obj[e.key_url][i] +"\" target=\"_blank\">" + 
                                         panel_data_obj[e.key_id][i] +
                                       "</a>"; 
			}
		}
	});

	return panel_link_html_str;
}

function _vgp_init_ui_panel_data(mondo_id, panel_data_obj){
   
	let title_panel_name = panel_data_obj.name_en;
	title_panel_name = title_panel_name.charAt(0).toUpperCase() + title_panel_name.slice(1);
	$('#vgp-panel-name').data('panel_id', mondo_id).data('panel_title', title_panel_name).text(title_panel_name);

	let $panel_summary_table = $('#vgp-panel-summary-table');

	[
		{'title': 'Definition:','content': typeof panel_data_obj.definition === 'object'? '': panel_data_obj.definition},
		{'title': 'Link:',	    'content': _create_panel_link_html_str(mondo_id, panel_data_obj)}
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

var zTreeObj;
function _vgp_init_ui_upstream_trace(mondo_id, panel_upstream_trace_data){
	let treeview_data = _create_treeview_data(panel_upstream_trace_data);
	let setting = {
		view: {dblClickExpand: false, showIcon: false, nameIsHTML: true},
		async: {
		  enable: true,
		  type:   "get",
		  url:	URL_GET_MONDO_DESCENDANT_BY_MONDO_ID,
		  autoParam: ["mondo_id"],
		},
		callback: {
		  onClick: function (event, treeId, treeNode) {
			if (treeNode.isParent){
			  if(!treeNode.open && treeNode.isFirstTimeLoad){
				//zTreeObj.removeChildNodes(treeNode);
				zTreeObj.reAsyncChildNodes(treeNode, "refresh");
				treeNode.isFirstTimeLoad = false;
			  }
			  zTreeObj.expandNode(treeNode);
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


function _vgp_init_ui_panel_gene(mondo_id, panel_gene_data){
	console.log("start init gene table");
	if(panel_gene_data.length===0)return;

	$('.vgp-panel-genes-num').text(panel_gene_data.length);
	$('#vgp-panel-genes-filter').attr({'placeholder':"Filter "+panel_gene_data.length+" Entities"});

	let $tbody = $('#vgp-panel-gene-table-tbody');
	for(let i=0; i < panel_gene_data.length; i++){

		let panel_gene = panel_gene_data[i];

		let $tr1 = $('<tr>').addClass("vgp-table-datarow").appendTo($tbody);

		let $td_rating = $('<td>').attr({'rowspan':"2"}).appendTo($tr1);
		$('<span>').addClass('vgp-rating-tag vgp-rating-norating').text('No rating').appendTo($td_rating);

		let $td_entity = $('<td>').appendTo($tr1);
		let $div_entity_wrapper1 = $('<div>').addClass("vgp-panel-gene-entity-wrapper").appendTo($td_entity);
		$("<span data-ncbi_gene_id=\""+panel_gene.gene_id+"\" data-gene_title=\""+ panel_gene.hgnc_gene_symbol +"\">")
				   .addClass("vgp-panel-gene-name")
				   .text(panel_gene.hgnc_gene_symbol)
				   .appendTo($div_entity_wrapper1);
		$("<button data-gene-id=\"GENEID:"+ panel_gene.gene_id +"\">").addClass("vgp-panel-gene-detail").text('More Info').appendTo($div_entity_wrapper1);


		let $td_review = $('<td>').appendTo($tr1);
		let $div_review_tag_wrapper1 = $('<div>').addClass("vgp-review-tag-list-wrapper").appendTo($td_review);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("vgp-review-tag-sep").appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("vgp-review-tag-sep").appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		$('<span>').addClass("badge badge-pill vgp-review-tag").text(0).appendTo($div_review_tag_wrapper1);
		let $div_review_tag_wrapper2 = $('<div>').addClass("d-flex justify-content-between vgp-review-tag-list-wrapper").appendTo($td_review);
		let $div_review_ctl = $('<div>').appendTo($div_review_tag_wrapper2);
		$('<span>').text('Reviews').appendTo($div_review_ctl);
		$("<span data-cnt=0 data-table-id=\"vgp-review-table-"+i+"\" data-relative-id=\"vgp-source-controller-"+i+"\" data-relative-table-id=\"vgp-source-table-wrapper-"+i+"\">")
				   .addClass('vgp-summary-controll')
				   .text("Show(0)")
				   .attr({'id': "vgp-review-controller-"+i})
				   .appendTo($div_review_ctl);
		$('<span>').addClass("vgp-panel-review-num").css({'display':'none'}).text(0).appendTo($div_review_ctl);

		let $div_review_cmd = $('<div>').appendTo($div_review_tag_wrapper2);
		let $span_cmd = $('<span>').addClass("vgp-review-btn").text(" ADD REVIEW")
									.data("gene_title", panel_gene.hgnc_gene_symbol)
									.click(function(){
										let gene_title = ""+ $(this).data("gene_title");
										_open_input_review_modal(gene_title);
									})
									.appendTo($div_review_cmd);
		$('<img>').attr({'src':'/static/images/panelsearch/add_review.svg'}).prependTo($span_cmd);
/*
		let inheritance_txt = panel_gene.inheritance_en;
		if(_isArray(inheritance_txt)){
			inheritance_txt = inheritance_txt.join(", ")
		}
		$('<td>').text(inheritance_txt).appendTo($tr1);
*/
		// this value should be set based on curator's review.
		let inheritance_txt = "";
		$('<td>').text(inheritance_txt).appendTo($tr1);

		let $tr2 = $('<tr>').addClass("detail vgp-table-datarow").appendTo($tbody);
		let $td_detail_wrapper = $('<td>').attr({'colspan':'3'}).appendTo($tr2);
		let $tbl_review = $('<table>').addClass("vgp-review-table").attr({'id':"vgp-review-table-"+i}).appendTo($td_detail_wrapper);
		let $tbody_review = $('<tbody>').appendTo($tbl_review);
		// add review here
	}
}


const MAX_PER_POST = 400;
function _chunkArray(array, chunkSize) {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}


function _makeAjaxRequest_post(url_obj, callback) {
	$.ajax({
		url:	  url_obj.url_str,
		type:	 'POST',
		async:	true,
		data:	 url_obj.data_obj,
		dataType: 'text'
	}).done(function (data, textStatus, jqXHR) {
		if(_isFunction(callback)){
			callback(data);		}
	}).fail(function (jqXHR, textStatus, errorThrown) {
		_vgp_hide_loading(); 
		alert('ajax post failed \n\nURL:'+ url_obj.url_str + '\n\nError:' + errorThrown + '\n\nResponse:' + jqXHR.responseText );
	}).always(function () {
		//
	});
}

function _makeAjaxRequest(url_str, callback) {
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
		_vgp_hide_loading();
		alert('ajax failed \nURL:'+ url_str);
	}).always(function () {
		//
	});
}

function _vgp_init(mondo_id){

	_vgp_show_loading();

	let ajax_obj_arr = [
		{
			'url':			 URL_GET_PANEL_DATA_BY_MONDO_ID + mondo_id,
			'output_data_key': 'panel_data',
			'init_ui_func':	_vgp_init_ui_panel_data
		},
		{
			'url':			 URL_GET_PANEL_GENE_BY_MONDO_ID + 'mondo_id='+mondo_id+'&'+(lang==='ja'?'ja':'en'),
			'output_data_key': 'panel_gene_data',
			'init_ui_func':	   _vgp_init_ui_panel_gene
		},
		{
			'url':			 URL_GET_MONDO_UPSTREAM_TRACE_BY_MONDO_ID + mondo_id,
			'output_data_key': 'panel_upstream_trace_data',
			'init_ui_func':	_vgp_init_ui_upstream_trace
		}
	];

	let init_data = {};
		init_data['current_mondo_id'] = mondo_id;
	let total_cnt	 = 3;
	let completed_cnt = 0;

	ajax_obj_arr.forEach((ajax_obj) => {
	   if(_isArray(ajax_obj)){
		   let ajax_obj_0 = ajax_obj[0];
		   let ajax_obj_1 = ajax_obj[1];
		   _makeAjaxRequest(ajax_obj_0.url, function(responseData){
			   let json_data = JSON.parse(responseData);
			   init_data[ajax_obj_0.output_data_key] = json_data;
			   completed_cnt++;			   

			   url_arr = ajax_obj_1.url(init_data);

			   // change the total num due to additional ajax requests occurred.
			   total_cnt = total_cnt + url_arr.length -1;
			   if(completed_cnt === total_cnt){
				   //do final
				   _vgp_init_attach_event_handlers(mondo_id);
				   _vgp_hide_loading();
				   return;
			   }

			   if(url_arr.length === 0) return;

			   url_arr.forEach((obj) => {

				   _makeAjaxRequest_post(obj, function(responseData1){
					   let json_data1 = JSON.parse(responseData1); 
					   if(!(ajax_obj_1.output_data_key in init_data)){
						   init_data[ajax_obj_1.output_data_key] = {};
					   }

					   init_data[ajax_obj_1.output_data_key] =  $.extend(true,{},init_data[ajax_obj_1.output_data_key], json_data1); 

					   completed_cnt++;
					   if(json_data1.length===0){
						   completed_cnt++;
						   if(completed_cnt === total_cnt){
						   if(_isFunction(ajax_obj_1.init_ui_func)){
							   ajax_obj_1.init_ui_func(mondo_id, init_data);
						   }

							   //do final
							   _vgp_init_attach_event_handlers(mondo_id);
							   _vgp_hide_loading();
						   }
						   return;
					   }
				   
					   if(completed_cnt === total_cnt){
						   if(_isFunction(ajax_obj_1.init_ui_func)){
							   ajax_obj_1.init_ui_func(mondo_id, init_data);
						   }
						   //do final
						   _vgp_init_attach_event_handlers(mondo_id);
						   _vgp_hide_loading();
					   }
				   });
			   });
		   });

	   }else{
		   _makeAjaxRequest(ajax_obj.url, function(responseData){
			   let json_data = JSON.parse(responseData);
			   init_data[ajax_obj.output_data_key] = json_data;
			   if(_isFunction(ajax_obj.init_ui_func)){
				   ajax_obj.init_ui_func(mondo_id, init_data[ajax_obj.output_data_key]);
			   }

			   completed_cnt++;
			   if(completed_cnt === total_cnt){
				   //do final 
				   _vgp_init_attach_event_handlers(mondo_id);
				   _vgp_hide_loading();
			   }
		   });
	   } 
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

function _get_all_panel_genes(){
    let panel_genes = [];
    $('.vgp-panel-gene-name').each(function(){
        $panel_gene = $(this);
        let gene_name = $panel_gene.data("gene_title");
        panel_genes.push(gene_name);
    });
    return panel_genes;
}

function _get_panel_id(){
    return $('#btn_download_panel').data('panel_id');
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
	  });
  });

  $('#vgp-panel-genes-filter').on("input", function(){
	  _vgp_table_filter(this);
  });

  $('.vgp-panel-genes-table').on('input', 'input.vgp-filter', function(){
	  _vgp_table_filter(this);
  });

  $('#btn_show_reviewers').click(function(){
	  $('#nav-vgp-reviewers-panel').trigger('click');
  });

  $('.vgp-panel-genes-table').on('click', 'span.vgp-summary-controll', function(){
	  _vgp_summary_control(this);
  });

  $('.vgp-panel-genes-table').on('click', 'span.vgp-panel-gene-name', function(){
	  _vgp_open_gene_detail(this);
  });

  $('#vgp-summary-switch').click(function(){
	_vgp_summary_control(this);
  });

  $(".vgp-panel-gene-detail").each(function(i,e){
	let gene_id = $(e).data('gene-id');
	tippy(e, {
		arrow: false,
		allowHTML: true,
		appendTo: document.body,
		animation: 'scale',
		animationFill: true,
		trigger: 'click',
		maxWidth: 400,
		strategy: 'fixed',
		interactive: true,
		theme: 'pcf-popup',
		placement: 'bottom-start',
		content: 'Loading...',
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

  $('.vgp-panel-genes-table').on('click', 'span.vgp-sorter', function(){
	_vgp_table_sort(this);
  });
}
