const URL_GET_PANEL_UPSTREAM_TRACE = "/panelsearch_nanbyo_get_panel_upstream_trace";
const URL_GET_TREEVIEW_DESCENDANT = "/panelsearch_nanbyo_get_treeview_descendant";
const URL_GET_ONTOLOGY = "/panelsearch_nanbyo_get_treeview";


//
// start of TreeView
//

var zTreeObj;
var treeview_setting = {
	view: {
		selectedMulti: true,
		dblClickExpand: false,
		showIcon: false,
		nameIsHTML: true
	},
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
		onClick: function (event, treeId, treeNode) {
			$("#vgp-list-root-panel").visual_gene_panel_list(
				'search_panels',
				{ 'vgp-root-panel-id': treeNode.panel_id }
			);
			_vgp_set_root(treeNode.panel_id, treeNode.descendant_cnt);
			_vgp_set_treeview_upstream_trace_n();
			_vgp_saveUndoState();
		},
		beforeExpand: function (treeId, treeNode) {
			if (treeNode.isFirstTimeLoad) {
				zTreeObj.removeChildNodes(treeNode);
				treeNode.isParent = true;
				zTreeObj.reAsyncChildNodes(treeNode, "refresh");
			}
			return true;
		},
		onExpand: function (event, treeId, treeNode) {
			if(treeNode.isFirstTimeLoad){
				treeNode.isFirstTimeLoad = false;
			}else{
				_vgp_set_treeview_upstream_trace_n();
				_vgp_saveUndoState();
			}
		},
		onAsyncSuccess:function (event, treeId, treeNode, msg) {
			setTimeout(function () {
				_vgp_set_treeview_upstream_trace_n();
				_vgp_saveUndoState();
			}, 100);
		},
		onCollapse: function (event, treeId, treeNode) {
			_vgp_set_treeview_upstream_trace_n();
			_vgp_saveUndoState();
		},
		onCheck: function (treeId, treeNode) {
			_vgp_set_treeview_upstream_trace_n();
			_vgp_saveUndoState();
		}
	},
	data: {
		key: {name: "displayName", title: "nando_id"}
	}
};

function _vgp_init(){

	fetch(URL_GET_ONTOLOGY)
	.then(response => response.json())
	.then(data => {

		if(data.error){
			alert(data.error);
			_vgp_hide_loading();
			return;
		}

		let is_attach_descendant_cnt = true;
		let isFirstTimeLoad = false;
		utils_create_treeview_data_from_ontology(
			data, lang, is_attach_descendant_cnt, isFirstTimeLoad
		);

		// set the level-0 expanded
		data["open"] = true;
		for(let child of data.children){
			// set the level-1 expanded
			child["open"] = true;
		}

		let specified_panel_id = data.children[0].panel_id;
		let specified_panel_descendant_cnt = data.children[0].descendant_cnt;

		zTreeObj = $.fn.zTree.init($("#vgp-treeView"), treeview_setting, [data]);

		setTimeout(function () {

			let node = zTreeObj.getNodeByParam('panel_id',specified_panel_id);
			zTreeObj.selectNode(node);

  			_vgp_set_root(specified_panel_id, specified_panel_descendant_cnt);

			_vgp_init_panel_list(specified_panel_id);

		}, 10);
		
		_vgp_hide_loading();
	});

	utils_attach_update_collapse_text_onresize();
}

function _vgp_show_upstream_treeview(panel_id){

	if(utils_isEmpty(panel_id)){
		alert('panel_id is empty');
		return;
	}

	let url_str = `${URL_GET_PANEL_UPSTREAM_TRACE}?panel_id=${panel_id}`;

	$.ajax({
	  url: url_str, type: "GET", async: true, dataType: "json"
	}).done(function(data,textStatus,jqXHR) {
		let is_attach_descendant_cnt = true;
		let isFirstTimeLoad = true;
		utils_create_treeview_data_from_ontology(
			data, lang, is_attach_descendant_cnt, isFirstTimeLoad
		);

		utils_sort_treeview_data_by_nando_id(data);

		utils_treeview_open_all_level(data);

		let settings = $.extend(true,{}, treeview_setting);

		zTreeObj.destroy();
		zTreeObj = $.fn.zTree.init($("#vgp-treeView"), settings, [data]);

		setTimeout(function () {
			let nodes = zTreeObj.getNodes();
			utils_highlight_upstream_treeview_startNode(zTreeObj, nodes, panel_id);
			_vgp_set_treeview_upstream_trace_y(panel_id);
			_vgp_saveUndoState();
		}, 100);

	}).fail(function(jqXHR, textStatus, errorThrown ) {
		alert(`Server access error: ${textStatus}: ${errorThrown}\nURL: ${url_str}`);
	});

}

//
// end of treeview
//




// start of main

function _vgp_set_root(root_id,num){
	$("#vgp-panels-total-num").text("/ " + num + " Panels");
	$("#vgp-panels-total-num").data("total-num",num);
	$("#vgp-panels-total-num").data("root_id",root_id);
}

function _vgp_get_root(){
	let obj = {
	  "total-num": $("#vgp-panels-total-num").data("total-num"),
	  "root_id":   $("#vgp-panels-total-num").data("root_id")
	};
	return obj;
}

function _vgp_get_pagenum(){
	return $("#btn-vgp-size").data('num_per_page');
}

function _vgp_set_pagenum(num){
	$("#btn-vgp-size").data('num_per_page', num);
	$("#btn-vgp-size").html(num);
}

function change_pagenum(num) {

	if (_vgp_get_pagenum() === num) return;

	_vgp_set_pagenum(num);

	$("#vgp-list-root-panel").visual_gene_panel_list(
		'search_panels', { 'vgp-size': num }
	);

	_vgp_saveUndoState();
}

function _vgp_get_target(){
	return $("#btn-vgp-target").data('vgp-target');
}

function _vgp_set_target(target){
	let title = utils_capitalizeFirstLetter(target);
	$("#btn-vgp-target").html(title);
	$("#btn-vgp-target").data('vgp-target', target);
}

function change_target(target) {

	if (_vgp_get_target() === target) return;

	_vgp_set_target(target);

	$("#vgp-list-root-panel").visual_gene_panel_list(
		'search_panels', { 'vgp-target': target }
	);

	_vgp_saveUndoState();
}

function format_filter_str(v) {
	return encodeURIComponent(
		utils_nomarlize_input_text(v)
	);
}

function _vgp_get_filter(){
	let v = $('#vgp-filter').val();
	return format_filter_str(v);
}

function _vgp_set_filter(v){
	$('#vgp-filter').val(decodeURIComponent(v));
}

var timeout;
function run_search() {
	var v = $('#vgp-filter').val();
	clearTimeout(timeout);
	timeout = setTimeout(function () {
		$("#vgp-list-root-panel").visual_gene_panel_list(
			'search_panels', { 'vgp-filter': format_filter_str(v) }
		);
		_vgp_saveUndoState();
	}, 100);
	//console.log('regist search event ' + timeout);
}

function attach_auto_search() {
	utils_attach_auto_search('vgp-filter', run_search);
}


function attach_manual_search() {
	$('#vgp-filter').change(function () {
		let v = $(this).val();
		//console.log( v );
		$("#vgp-list-root-panel").visual_gene_panel_list(
			'search_panels', { 'vgp-filter': format_filter_str(v) }
		);
	});
}

function _vgp_init_panel_list(panel_id){

	let language = 'en';
	if (lang === 'ja') language = 'ja';

	$("#vgp-list-root-panel").visual_gene_panel_list({

		'language': language,

		'vgp-root-panel-id': panel_id,

		'after_search_idlist': function (num) {
			let total_num_str = num.toLocaleString("en-US");
			$('#vgp-searched-panels-num').text(total_num_str);
		},

		'check_consistence': function (filter_str) {
			let v = format_filter_str($('#vgp-filter').val());
			return v === filter_str;
		},

		'after_change_sort': function(sort_target,sort_dir){
			_vgp_saveUndoState();
	  	}
	});

	setTimeout(function () {
		$("#vgp-list-root-panel").visual_gene_panel_list(
			'search_panels', { 'vgp-target': 'panel', 'vgp-filter': '' }
		);
	}, 100);

	$('#vgp-download-all-btn').click(function () {
		$(this).tooltip('hide');
		$("#vgp-list-root-panel").visual_gene_panel_list('download_all_panels');
	}).tooltip();

	attach_auto_search();

	setTimeout(function () {
		$("#vgp-filter").focus(); 
	}, 300);
}



//
// undo and redo
//

var undoStack = [];
var redoStack = [];

function _vgp_change_undoredo_btn_state(){
	$('#vgp-undo-btn').removeClass('vgp-active');
	if(undoStack.length > 1) $('#vgp-undo-btn').addClass('vgp-active');

	$('#vgp-redo-btn').removeClass('vgp-active');
	if(redoStack.length > 0) $('#vgp-redo-btn').addClass('vgp-active');
}


function _vgp_clear_treeview_select(nodes) {
	for (var i = 0; i < nodes.length; i++) {
		nodes[i].vgp_selected_flg = false;

		// 递归处理子节点
		if (nodes[i].isParent && nodes[i].children) {
			_vgp_clear_treeview_select(nodes[i].children);
		}
	}
}

function _vgp_reset_treeview_select(zTree, nodes) {
	for (var i = 0; i < nodes.length; i++) {
		if(nodes[i].vgp_selected_flg) zTree.selectNode(nodes[i], true, true);;

		// 递归处理子节点
		if (nodes[i].isParent && nodes[i].children) {
			_vgp_reset_treeview_select(zTree, nodes[i].children);
		}
	}
}

var vgp_treeview_upstream_status=false;
var vgp_treeview_upstream_trace_endnote_panel_id = '';
function _vgp_set_treeview_upstream_trace_n(){
	vgp_treeview_upstream_status=false;
	vgp_treeview_upstream_trace_endnote_panel_id = '';
}

function _vgp_set_treeview_upstream_trace_y(panel_id){
	vgp_treeview_upstream_status=true;
	vgp_treeview_upstream_trace_endnote_panel_id = panel_id;
}

function _vgp_get_treeview_upstream_trace_status(){
	return {
		'vgp_is_upstream_trace': vgp_treeview_upstream_status,
		'nando_id_upstream_trace_endnode': vgp_treeview_upstream_trace_endnote_panel_id
	};
}

function _vgp_saveUndoState() {
	//console.log("saveUndoState triggered!");
	let root_obj   = _vgp_get_root();
	let vgp_size   = _vgp_get_pagenum();
	let vgp_target = _vgp_get_target();
	let vgp_filter = _vgp_get_filter();
	let treeview_trace_status_obj = _vgp_get_treeview_upstream_trace_status();
	let sort_obj   = $("#vgp-list-root-panel").visual_gene_panel_list('get_sort_status');

	_vgp_clear_treeview_select(zTreeObj.getNodes());
	let treeview_all_selected_nodes = zTreeObj.getSelectedNodes();
	for(let i=0;i<treeview_all_selected_nodes.length; i++){
		treeview_all_selected_nodes[i].vgp_selected_flg = true;
	}

	let treeview_all_nodes = JSON.parse(JSON.stringify(zTreeObj.getNodes()));
	let obj_tobesaved ={
		'vgp-root-panel-id':                   root_obj["root_id"],
		'vgp-root-panel-total-descendant-num': root_obj["total-num"],
		'vgp-size':	                           vgp_size,
		'vgp-target':                          vgp_target,
		'vgp-filter':                          vgp_filter,
		'sort-target':                         sort_obj['sort-target'],
		'sort-direction':                      sort_obj['sort-direction'],
		'treeview-all-nodes':                  treeview_all_nodes,
		'vgp_is_upstream_trace':               treeview_trace_status_obj['vgp_is_upstream_trace'],
		'nando_id_upstream_trace_endnode':     treeview_trace_status_obj['nando_id_upstream_trace_endnode']
	};
	undoStack.push(obj_tobesaved);
	redoStack = []; // 清空 redo 栈
	_vgp_change_undoredo_btn_state();
}

function _vgp_set_state(obj_saved){

	_vgp_set_root(obj_saved["vgp-root-panel-id"], obj_saved["vgp-root-panel-total-descendant-num"]);
	_vgp_set_pagenum(obj_saved['vgp-size']);
	_vgp_set_target(obj_saved['vgp-target']);
	_vgp_set_filter(obj_saved['vgp-filter']);

	if(obj_saved['vgp_is_upstream_trace']){
		_vgp_set_treeview_upstream_trace_y(obj_saved['nando_id_upstream_trace_endnode']);
	}else{
		_vgp_set_treeview_upstream_trace_n();
	}


	zTreeObj.destroy();
	zTreeObj = $.fn.zTree.init($("#vgp-treeView"), treeview_setting, obj_saved['treeview-all-nodes']);
	setTimeout(function () { 
		if(obj_saved['vgp_is_upstream_trace']){
			 _highlight_upstream_treeview_startNode(zTreeObj, zTreeObj.getNodes(), obj_saved['nando_id_upstream_trace_endnode']);
		}else{
			_vgp_reset_treeview_select(zTreeObj, zTreeObj.getNodes());
		}
	}, 100);


	$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 
		'vgp-root-panel-id': obj_saved['vgp-root-panel-id'],
		'vgp-size':          obj_saved['vgp-size'],
		'vgp-target':        obj_saved['vgp-target'],
		'vgp-filter':        obj_saved['vgp-filter'],
		'sort-target':       obj_saved['sort-target'],
		'sort-direction':    obj_saved['sort-direction']
	});
}

function _vgp_undo() {
	if (undoStack.length > 1) {
		redoStack.push(undoStack.pop());
		var prevState = undoStack[undoStack.length - 1];
		_vgp_set_state(prevState);
	}
	_vgp_change_undoredo_btn_state();
}

// 重做
function _vgp_redo() {
	if (redoStack.length > 0) {
		var nextState = redoStack.pop();
		undoStack.push(nextState);
		_vgp_set_state(nextState);
	}

	_vgp_change_undoredo_btn_state();
}
