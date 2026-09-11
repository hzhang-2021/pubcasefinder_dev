
// URL
const	URL_TOKENINPUT_HPO='/tokeninput_hpo',
		URL_TOKENINPUT_HPO_2='/pcf_get_hpo_by_text',
		URL_POPUP_HIERARCHY_HPO='/popup_hierarchy_hpo';


//
// start of TreeView
//

var zTreeObj;
var treeview_setting = {
	view: {selectedMulti: true, dblClickExpand: false, showIcon: false, nameIsHTML: true},
	async: {
		enable: true,
		type: "get",
		url: "/panelsearch_get_mondo_descendant",
		autoParam: ["mondo_id", "lang"],
	},
	callback: {
		onClick: function (event, treeId, treeNode) {
			//console.log("treeview onClick (" + treeNode.displayName + ","+ treeNode.tId+")");
			$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 'vgp-root-mondo-id': treeNode.mondo_id });
			_vgp_set_root(treeNode.mondo_id, treeNode.num_child);
			_vgp_set_treeview_upstream_trace_n();
			_vgp_saveUndoState();
		},
		beforeExpand: function (treeId, treeNode) {
			//console.log("treeview beforeExpand (" + treeNode.displayName + ")");
			if (treeNode.isFirstTimeLoad) {
				//console.log("treeview beforeExpand trigger reload child (" + treeNode.displayName + ")");
				zTreeObj.removeChildNodes(treeNode);
				treeNode.isParent = true;
				zTreeObj.reAsyncChildNodes(treeNode, "refresh");
			}
			return true;
		},
		onExpand: function (event, treeId, treeNode) {
			//console.log("treeview onExpand (" + treeNode.displayName + ")");
			if(treeNode.isFirstTimeLoad){
				treeNode.isFirstTimeLoad = false;
			}else{
				//console.log("treeview onExpand (" + treeNode.displayName + ")");
				_vgp_set_treeview_upstream_trace_n();
				_vgp_saveUndoState();
			}
		},
		onAsyncSuccess:function (event, treeId, treeNode, msg) {
			//console.log("treeview onAsyncSuccess (" + treeNode.displayName + ")");
			setTimeout(function () {
				_vgp_set_treeview_upstream_trace_n();
				_vgp_saveUndoState();
			}, 100);
		},
		onCollapse: function (event, treeId, treeNode) {
			//console.log("treeview onCollapse (" + treeNode.displayName + ")");
			_vgp_set_treeview_upstream_trace_n();
			_vgp_saveUndoState();
		},
		onCheck: function (treeId, treeNode) {
			//console.log("treeview onCheck (" + treeNode.displayName + ")");
			_vgp_set_treeview_upstream_trace_n();
			_vgp_saveUndoState();
		}
	},
	data: {
		key: {name: "displayName", title: "mondo_id"}
		
	}
};


function _vgp_init_root_treeview(mondo_id,mondo_name,num_child,r_lang){
	//console.log("treeview start init");
	let treeview_data =[];
	let root = {
		isFirstTimeLoad:	true,
		mondo_id:			mondo_id,
		num_child:			num_child,
		name:				mondo_name,
		displayName:		mondo_name+" <font class=\"vgp-treeview-decendant-num\">("+num_child+')</font>',
		lang:				r_lang,
		isParent:			true
	}
	treeview_data.push(root);

	zTreeObj = $.fn.zTree.init($("#vgp-treeView"), treeview_setting, treeview_data);
	setTimeout(function () {
		//console.log("treeview start loading root");
		let nodes = zTreeObj.getNodes();
		zTreeObj.selectNode(nodes[0]);
		zTreeObj.expandNode(nodes[0], true, false, true, true);
	}, 100);
}

function _create_treeview_data(json_data){
	let ret_arr = [];
	for (let key in json_data){
		let obj = {};
		let t = key.split('--');
		obj['lang']             = lang;
		obj['isFirstTimeLoad']	= true;
		obj['mondo_id']			= t[0];
		obj['num_child']		= t[1];
		obj['name']				= t[0];
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

function _highlight_upstream_treeview_startNode(zTree, nodes, mondo_id) {
	for (var i = 0; i < nodes.length; i++) {
	
		if (nodes[i].mondo_id === mondo_id) {
			zTree.selectNode(nodes[i], true, true);
		}

		if (nodes[i].isParent && nodes[i].children) {
			_highlight_upstream_treeview_startNode(zTree, nodes[i].children, mondo_id);
		}
	}
}

function _vgp_show_upstream_treeview(mondo_id){
	let url_str = `/panelsearch_get_mondo_hierarchy?lang=${lang}&mondo_id=${mondo_id}`;
	$.ajax({
	  url: url_str, type: "GET", async: true, dataType: "json"
	}).done(function(data,textStatus,jqXHR) {
		let treeview_data = _create_treeview_data(data);

		let settings = $.extend(true,{}, treeview_setting);

		zTreeObj = $.fn.zTree.init($("#vgp-treeView"), settings, treeview_data);
		//console.log("upstream treeview set!");
		setTimeout(function () {
			let nodes = zTreeObj.getNodes();
			_highlight_upstream_treeview_startNode(zTreeObj, nodes, mondo_id);
			_vgp_set_treeview_upstream_trace_y(mondo_id);
			_vgp_saveUndoState();
		}, 100);

	}).fail(function(jqXHR, textStatus, errorThrown ) {
		alert('Server access error:' + textStatus + ":" + errorThrown + '\nURL: ' + url_str);
	});
}

//
// end of treeview
//




// start of main

function _vgp_set_root(root_id,num){

	$("#vgp-panels-total-num").text("/ " + num.toLocaleString("en-US") + " diseases");
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
	let num_old = $("#btn-vgp-size").data('num_per_page');

	if (num_old === num) return;

	$("#btn-vgp-size").html(num);
	$("#btn-vgp-size").data('num_per_page', num);

	$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 'vgp-size': num });
	//console.log("change pagenum " + num);
	_vgp_saveUndoState();
}

const TARGET_GENE="gene",TARGET_PANEL="panel",TARGET_PHENOTYPE="phenotype",TARGET_LIST=[TARGET_PANEL,TARGET_GENE,TARGET_PHENOTYPE];

function _vgp_get_target(){
	return $("#btn-vgp-target").data('vgp-target');
}

function _vgp_set_target(target){
	let title = target.charAt(0).toUpperCase() + target.slice(1);
	$("#btn-vgp-target").html(title);
	$("#btn-vgp-target").data('vgp-target', target);

	const filter_class_list = TARGET_LIST.join(" ");
	$("#vgp_filter_wrapper").removeClass(filter_class_list).addClass(target);
	$("#vgp-title2").removeClass(filter_class_list).addClass(target);
}

function do_phenotype_filter_search(){
	let filter_phenotype_mode = _vgp_filter_phenotype_get_mode();
	let [filter_phenotype_intersection_max,filter_phenotype_intersection_num] = _vgp_filter_phenotype_get_intersection_num();
	let filter_val = _vgp_get_filter();

	$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 
		'vgp-target':                               TARGET_PHENOTYPE,
		'vgp-filter':                               filter_val,
		'vgp-filter-phenotype-mode':                filter_phenotype_mode,
		'vgp-filter-phenotype-intersection-num':    filter_phenotype_intersection_num
	});
}

function change_target(target) {
	let target_old = $("#btn-vgp-target").data('vgp-target');
	if (target_old === target) return;

	_vgp_set_target(target);
	
	let filter_val = _vgp_get_filter();
	if(target !== TARGET_PHENOTYPE){
		filter_val = format_filter_str(filter_val);
		$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 'vgp-target': target, 'vgp-filter': filter_val });
	}else{
		$("#tokeninput_hpo").tokenInput('trigger_resize_input');
		do_phenotype_filter_search();
	}

	

	_vgp_saveUndoState();

	_vgp_set_filter_input_focus(target);	
}

function format_filter_str(v) {
	return encodeURIComponent(v.trim().replace(/^[\s\u3000]+|[\s\u3000]+$/g, ''))
}

function _vgp_get_filter(){
	let target = _vgp_get_target();
	
	let filter_val = "";
	if(target === TARGET_PHENOTYPE){
		filter_val = $("#tokeninput_hpo").tokenInput('get_hpo_list_str');
	}else{
		let v = $('#vgp-filter').val();
		filter_val = encodeURIComponent(v);
	}
	return filter_val;
}

function _vgp_set_filter_input_focus(target){
	if(target === TARGET_PHENOTYPE){
		$("#tokeninput_hpo").tokenInput('set_focus');
	}else{
		$('#vgp-filter').focus();
	}
}

function _vgp_set_filter(v){
	let target = _vgp_get_target();

	if(target === TARGET_PHENOTYPE){
		$("#tokeninput_hpo").tokenInput('reset_hpo_list', v);
	}else{
		$('#vgp-filter').val(decodeURIComponent(v));
	}
}

const PHENOTYPE_MODE_UNION="union", PHENOTYPE_MODE_INTERSECTION="intersection";
function _vgp_filter_phenotype_get_mode(){
	return $("#vgp-filter-phenotype-mode-group").find('.btn.active').data("mode");
}

function _vgp_filter_phenotype_set_mode(mode){
	$("#vgp-filter-phenotype-mode-group").find('.btn').removeClass("active");
	if(mode === PHENOTYPE_MODE_UNION){
		$("#vgp-filter-phenotype-mode-union").addClass("active");
		$("#slider").attr('disabled', true);
		$(".vgp-filter-phenotype-mode-intersection-value-wrapper").addClass("disabled");
		$(".slider-container").addClass("disabled");
	}else{
		$("#vgp-filter-phenotype-mode-intersection").addClass("active");
		$("#slider").attr('disabled', false);
        $(".vgp-filter-phenotype-mode-intersection-value-wrapper").removeClass("disabled");
        $(".slider-container").removeClass("disabled");
	}
}

function _vgp_filter_phenotype_get_intersection_num(){
	return [slider.max, slider.value];
}

function _vgp_filter_phenotype_set_intersection_num(max, val){
	updateScale(max, val);
}

function _vgp_filter_phenotype_onchange(){
    let target = _vgp_get_target();
    if(target === TARGET_PHENOTYPE){
        filter_val = $("#tokeninput_hpo").tokenInput('get_hpo_list_str');
		let max = 1;
		if(filter_val){
			max = filter_val.split(',').length;
		}
		updateScale(max,1);
	}
}


const slider        = document.getElementById('rangeSlider');
const scale         = document.getElementById('scale');
const selectedValue = document.getElementById('selectedValue');
const maxValue      = document.getElementById('maxValue');

// Function to create the scale
const updateScale = (max, val) => {

	let max_val = typeof max === 'string' ? parseInt(max) : max;

	scale.innerHTML = ''; // Clear current scale
	for (let i = 1; i <= max_val; i++) {
		const tick = document.createElement('div');
		if(i===1 || i === max_val){
			tick.classList.add("end");
			tick.textContent = i;
		}
		scale.appendChild(tick);
	}
	slider.max = max;
	slider.value = val;
	selectedValue.textContent = val;
	maxValue.textContent = max;
};


var timeout;
function do_search() {
	var v = $('#vgp-filter').val();
	clearTimeout(timeout);
	timeout = setTimeout(function () {
		$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 'vgp-filter': format_filter_str(v) });
		_vgp_saveUndoState();
	}, 100);
}

var KEY = {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	ESCAPE: 27,
	SPACE: 32,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46,
	NUMPAD_ENTER: 108,
	SEMICOLON: 186,
	COMMA: 188
};

function attach_auto_search() {
	$('#vgp-filter')
	  .bind("input", function (event) {
		//console.log('input triggered');
		if (String.fromCharCode(event.which)) {
		  setTimeout(function () { do_search(); }, 50);
		}
	  })
	  .keydown(function (event) {

		switch (event.keyCode) {
		  case KEY.LEFT:
		  case KEY.RIGHT:
		  case KEY.UP:
		  case KEY.DOWN:
		  case KEY.HOME:
		  case KEY.END:
			break;
		  case KEY.DELETE:
			//console.log('delete', this.value, (new Blob([this.value])).size);
			setTimeout(function () { do_search(); }, 50);
			break;
		  case KEY.BACKSPACE:
			//console.log('backspace', this.value, (new Blob([this.value])).size);
			setTimeout(function () { do_search(); }, 50);
			break;
		  case KEY.TAB:
		  case KEY.ENTER:
		  case KEY.NUMPAD_ENTER:
		  //case KEY.COMMAA:
		  //case KEY.SEMICOLON:
			//case KEY.SPACE:
			//console.log('tab enter comma', this.value, (new Blob([this.value])).size);
			setTimeout(function () { do_search(); }, 50);
			event.stopPropagation();
			event.preventDefault();
			return false;
			break;
		  case KEY.ESCAPE:
			return true;
		  default:
			if (String.fromCharCode(event.which)) {
			  //console.log('trigger code', event.which);
			  setTimeout(function () { do_search(); }, 50);
			}
			break;
		}
	  });

}


function attach_manual_search() {
	$('#vgp-filter').change(function () {
	  let v = $(this).val();
	  //console.log( v );
	  $("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 'vgp-filter': format_filter_str(v) });
	});
}

function _vgp_init_panel_list(mondo_id){
	//let lang = localStorage.lang || 'en';
	//lang = lang === 'undefined' ? 'en' : lang;

	let language = 'en';
	if (lang === 'ja') language = 'ja';

	ROOT_MONDO_ID_INIT = mondo_id;

	$("#vgp-list-root-panel").visual_gene_panel_list({
		'language':            language,
		'vgp-root-mondo-id':   mondo_id,
		'after_search_idlist': function (num, mondo_id) {
			let total_num_str = num.toLocaleString("en-US");
			$('#vgp-searched-panels-num').text(total_num_str);
		},
		'check_consistence':   function (filter_str) {
			let v = format_filter_str($('#vgp-filter').val());
			return v === filter_str;
		},
		'after_change_sort':   function(sort_target,sort_dir){
			_vgp_saveUndoState();
		},
		'load_custom_panel_id_list': function(){
			let common_panel_list = getUserCommonPanelList();
			let id_list = common_panel_list.map(item => item.mondo_id);
			return id_list;
		},
		'add_custom_panel': function(panel_item){
			addCommonPanelItemToList(panel_item, false);
		},
		'delete_custom_panel': function(mondo_id){
			deleteCommonPanelItem(mondo_id);
		}
	});

	setTimeout(function () {
		$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 'vgp-target': 'panel', 'vgp-filter': '' });
	}, 100);

	$('#vgp-download-all-btn').click(function () {
	  $(this).tooltip('hide');
	  $("#vgp-list-root-panel").visual_gene_panel_list('download_all_panels');
	}).tooltip();

/*
	$('#btn_custom_panel').click(function () {
		let common_panel_list = getUserCommonPanelList();
		let selected_Arr = $("#vgp-list-root-panel").visual_gene_panel_list('get_selected');
		if(common_panel_list.length === 0 && selected_Arr.length === 0){
			alert("Select panel at first!");
			return;
		}
		addMultiCommonPanelItemToList(selected_Arr);
		openCommonPanelPage();
		_vgp_update_custom_panel_num();
	});
*/

	attach_auto_search();

	setTimeout(function () { $("#vgp-filter").focus(); }, 300);

	attach_description_ctl();
}

function update_common_panel(){
	$("#vgp-list-root-panel").visual_gene_panel_list('update_common_panel');
}

function _vgp_init_custom_panel_num(){
	//clearCommonPanelList();
	//_vgp_update_custom_panel_num();
}

function _vgp_update_custom_panel_num(){
	let common_panel_list = getUserCommonPanelList();
	if(common_panel_list.length === 0){
		$('#custom_panel_num').addClass('empty');
	}else{
		$('#custom_panel_num').text(`(${common_panel_list.length})`).removeClass('empty');
	}
}

function attach_description_ctl(){
	
	$('#vgp-list-root-panel').on('click', 'span.more', function(){
		let $btn = $(this);
		$btn.parent().removeClass('ellipsis').addClass('expanded');
	});

    $('#vgp-list-root-panel').on('click', 'span.less', function(){
        let $btn = $(this);
        $btn.parent().removeClass('expanded').addClass('ellipsis');
    });

	$(window).on('resize', function(e) {	
		update_description_ellipsis();
	});
}

function checkEllipsis(pElement) {
	const scrollHeight = pElement.scrollHeight;
	const clientHeight = pElement.clientHeight;
	return scrollHeight > clientHeight;
}

function update_description_ellipsis(){
	const pElements = document.querySelectorAll('.description');
	pElements.forEach(p => {
		p.classList.remove('expanded', 'ellipsis');
		if (checkEllipsis(p)) {
			p.classList.add('ellipsis');
		}
	});
}

function _vgp_init_phenotype_filter(){
	$("#tokeninput_hpo").tokenInput(URL_TOKENINPUT_HPO,{
		theme:			"facebook",
		lang:			"en",
		second_url_str: URL_TOKENINPUT_HPO_2,
		onAdd:			function() {
			_vgp_filter_phenotype_onchange();
			do_phenotype_filter_search();
			_vgp_saveUndoState();
		},
		onDelete:	function() {
			_vgp_filter_phenotype_onchange();
			do_phenotype_filter_search();
			_vgp_saveUndoState();
		}
	});

	$("#tokeninput_hpo").popupRelationHPO(URL_POPUP_HIERARCHY_HPO,{
		'is_hierarchy_fullscreen':	false,
		'modify_modal_on_show':		null,
		'language_in':				"en",
		'prependTo':				"vgp_filter_panel"
	});


	$('#vgp-filter-phenotype-mode-group .btn').click(function(){
		let $btn = $(this);
		if($btn.hasClass("active")) return;
		let mode = $btn.data('mode');
		_vgp_filter_phenotype_set_mode(mode);
		do_phenotype_filter_search();
		_vgp_saveUndoState();
	});

/*
	slider.addEventListener('input', (e) => {
    	selectedValue.textContent = e.target.value;
		do_phenotype_filter_search();
		_vgp_saveUndoState();
	});
*/

	_attach_slider_event();

	updateScale(1,1);
}

function _on_slider_change(val){
	selectedValue.textContent = val;
	do_phenotype_filter_search();
	_vgp_saveUndoState();
}

var isDragging = false;
var trackClick = false;

function _attach_slider_event(){
	slider.addEventListener("mousedown", (e) => {

		if(slider.max === slider.min) return;

	    const rect = slider.getBoundingClientRect();

	    // range width
	    const rangeWidth = rect.width;

	    // current thumb position (in px)
	    const percent = (slider.value - slider.min) / (slider.max - slider.min);
	    const thumbX = slider.left + percent * rangeWidth;

	    // mouse click position
	    const clickX = e.clientX;

	    // if click is far from thumb, it's a track click
	    if (Math.abs(clickX - thumbX) > 10) {
	      trackClick = true;
	    } else {
	      isDragging = true;
	    }
	});

	document.addEventListener("mouseup", () => {
	    if (isDragging) {
			_on_slider_change(slider.value);
	    }
	    isDragging = false;
	    trackClick = false;
	});

	slider.addEventListener("input", (e) => {
	    if (trackClick) {
	      // respond immediately for track click
			_on_slider_change(e.target.value);
	    }
	    // do not respond during dragging
	});

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
var vgp_treeview_upstream_trace_endnote_mondo_id = '';
function _vgp_set_treeview_upstream_trace_n(){
	vgp_treeview_upstream_status = false;
	vgp_treeview_upstream_trace_endnote_mondo_id = '';
}

function _vgp_set_treeview_upstream_trace_y(mondo_id){
	vgp_treeview_upstream_status = true;
	vgp_treeview_upstream_trace_endnote_mondo_id = mondo_id;
}

function _vgp_get_treeview_upstream_trace_status(){
	return {
		'vgp_is_upstream_trace': vgp_treeview_upstream_status,
		'mondo_id_upstream_trace_endnode': vgp_treeview_upstream_trace_endnote_mondo_id
	};
}

function _vgp_saveUndoState() {
	//console.log("saveUndoState triggered!");
	let root_obj   = _vgp_get_root();
	let vgp_size   = _vgp_get_pagenum();

	let vgp_target = _vgp_get_target();
	let vgp_filter = _vgp_get_filter();
	let vgp_filter_phenotype_mode = _vgp_filter_phenotype_get_mode();
	let [vgp_filter_phenotype_intersection_max, vgp_filter_phenotype_intersection_num] = _vgp_filter_phenotype_get_intersection_num();

	let treeview_trace_status_obj = _vgp_get_treeview_upstream_trace_status();
	let sort_obj   = $("#vgp-list-root-panel").visual_gene_panel_list('get_sort_status');

	_vgp_clear_treeview_select(zTreeObj.getNodes());
	let treeview_all_selected_nodes = zTreeObj.getSelectedNodes();
	for(let i=0;i<treeview_all_selected_nodes.length; i++){
		treeview_all_selected_nodes[i].vgp_selected_flg = true;
	}

	let treeview_all_nodes = JSON.parse(JSON.stringify(zTreeObj.getNodes()));
	let obj_tobesaved ={
		'vgp-root-mondo-id':					root_obj["root_id"],
		'vgp-root-mondo-total-descendant-num':	root_obj["total-num"],
		'vgp-size':								vgp_size,
		'vgp-target':							vgp_target,
		'vgp-filter':							vgp_filter,
		'vgp-filter-phenotype-mode':			vgp_filter_phenotype_mode,
		'vgp-filter-phenotype-intersection-max':vgp_filter_phenotype_intersection_max,
		'vgp-filter-phenotype-intersection-num':vgp_filter_phenotype_intersection_num,
		'sort-target':							sort_obj['sort-target'],
		'sort-direction':						sort_obj['sort-direction'],
		'treeview-all-nodes':					treeview_all_nodes,
		'vgp_is_upstream_trace':				treeview_trace_status_obj['vgp_is_upstream_trace'],
		'mondo_id_upstream_trace_endnode':		treeview_trace_status_obj['mondo_id_upstream_trace_endnode']
	};
	undoStack.push(obj_tobesaved);
	redoStack = []; // 清空 redo 栈
	_vgp_change_undoredo_btn_state();
}

function _vgp_set_state(obj_saved){
	_vgp_set_root(obj_saved["vgp-root-mondo-id"], obj_saved["vgp-root-mondo-total-descendant-num"]);
	_vgp_set_pagenum(obj_saved['vgp-size']);
	_vgp_set_target(obj_saved['vgp-target']);
	_vgp_set_filter(obj_saved['vgp-filter']);

	_vgp_filter_phenotype_set_mode(obj_saved['vgp-filter-phenotype-mode']);
	let max = obj_saved['vgp-filter-phenotype-intersection-max'];
	let val = obj_saved['vgp-filter-phenotype-intersection-num'];
	_vgp_filter_phenotype_set_intersection_num(max,val);

	if(obj_saved['vgp_is_upstream_trace']){
		_vgp_set_treeview_upstream_trace_y(obj_saved['mondo_id_upstream_trace_endnode']);
	}else{
		_vgp_set_treeview_upstream_trace_n();
	}

	zTreeObj.destroy();
	zTreeObj = $.fn.zTree.init($("#vgp-treeView"), treeview_setting, obj_saved['treeview-all-nodes']);
	setTimeout(function () { 
		if(obj_saved['vgp_is_upstream_trace']){
			 _highlight_upstream_treeview_startNode(zTreeObj, zTreeObj.getNodes(), obj_saved['mondo_id_upstream_trace_endnode']);
		}else{
			_vgp_reset_treeview_select(zTreeObj, zTreeObj.getNodes());
		}
	}, 100);


	$("#vgp-list-root-panel").visual_gene_panel_list('search_panels', { 
		'vgp-root-mondo-id':						obj_saved['vgp-root-mondo-id'],
		'vgp-size':									obj_saved['vgp-size'],
		'vgp-target':								obj_saved['vgp-target'],
		'vgp-filter':								obj_saved['vgp-filter'],
        'vgp-filter-phenotype-mode':            	obj_saved['vgp-filter-phenotype-mode'],
        'vgp-filter-phenotype-intersection-num':	obj_saved['vgp-filter-phenotype-intersection-num'],
		'sort-target':								obj_saved['sort-target'],
		'sort-direction':							obj_saved['sort-direction']
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
