const URL_LOAD_ACTIVITY                 = "/panelsearch_nanbyo_admin_load_activity";
const URL_LOAD_ACTIVITY_DETAIL          = "/panelsearch_nanbyo_admin_load_activity_detail";
const URL_LOAD_PANEL_VERSION_AND_ENTITY = "/panelsearch_nanbyo_admin_load_panel_version_and_entity";
const URL_PANEL_DETAIL                  = "/panelsearch_nanbyo_panel_detail";
const URL_PANEL_ENTITY_DETAIL           = "/panelsearch_nanbyo_panel_entity_detail";
const URL_LOAD_MULTI_CLASS              = '/panelsearch_nanbyo_load_multi_class';
const URL_TREEVIEW_DATA                 = '/panelsearch_nanbyo_get_treeview';

var zTreeObj;
function _init(){

	fetch(`${URL_LOAD_MULTI_CLASS}?lang=ja`)
	.then(response => response.json())
	.then(data => {

		utils_init_type_hash(data.mode_of_inheritance_arr, data.entity_type_arr, data.rating_type_arr);

		fetch(URL_TREEVIEW_DATA)
		.then(response1 => response1.json())
		.then(data1 => {
				
			let is_attach_descendant_cnt = false;
			let isFirstTimeLoad = false;
			utils_create_treeview_data_from_ontology(
				data1, 'ja', is_attach_descendant_cnt, isFirstTimeLoad
			);
			utils_treeview_open_all_level(data1)

			let treeview_data = data1.children;

			zTreeObj = $.fn.zTree.init($("#vgp-treeView"), {
				view: {selectedMulti: false, dblClickExpand: false, showIcon: false, nameIsHTML: true},
				callback: {	beforeClick: onClickNode},
				data: {	key: {name: "displayName", title: "nando_id"}	}
			}, treeview_data);

			_doReload();
		});
	});

	$("#btn_clear_panel").on('click', function (e) {
		e.stopPropagation();
		var sel = zTreeObj.getSelectedNodes();
		zTreeObj.cancelSelectedNode(sel[0]);
		$('#btn_filter_panel').addClass('empty').find('span.name').text('Filter');
		$('#menu_filter_panel_version').empty();
		$('#menu_filter_entity').empty();
		_doReload();
		return false;
	});

    document.getElementById("dateFrom").addEventListener("change", function () {
        _doReload();
    });
    document.getElementById("dateTo").addEventListener("change", function () {
        _doReload();
    });

	var $dropdown = $('.dropdown.filter');
	var $menu = $dropdown.find('.dropdown-menu');

	$menu.on('click', function (e) {
		e.stopPropagation();
	});

	$menu.on('click', '.dropdown-item-checkbox', function (e) {
		if ($(e.target).is('input[type=checkbox], label')) {
			return;
		}
		var $cb = $(this).find('input[type=checkbox]');
		$cb.prop('checked', !$cb.prop('checked')).trigger('change');
	});

	$menu.on('change', 'input.form-check-input', function(){
		_doReload();
	});

	$menu.on('input', 'input.dropdown_filter_input_entity', function (e) {
		var filterText = utils_trimAllSpaces($(this).val().toLowerCase());
		let regex = new RegExp("(" + filterText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");

		$("#menu_filter_entity>.dropdown-item-checkbox").each(function() {
			var labelEl = $(this).find("label");
			var labelText = labelEl.text();
			if (labelText.toLowerCase().includes(filterText)) {
				$(this).show();
				if (filterText) {
					labelEl.html(labelText.replace(regex, '<mark>$1</mark>'));
				} else {
					labelEl.text(labelText); // 清除高亮
				}
			} else {
				$(this).hide();
			}
		});

	});

    $('#activity_table').on('click', 'span.vgp-sorter', function(){
        let $sorter   = $(this);
        let sortClass = 'vgp-asc';
        if($sorter.hasClass('vgp-asc')){
            sortClass = 'vgp-dsc';
        }else if($sorter.hasClass('vgp-dsc')){
            sortClass = 'vgp-asc';
        }
        $sorter.closest('tr').find('.vgp-sorter').removeClass('vgp-dsc').removeClass('vgp-asc');
        $sorter.addClass(sortClass);
        _create_activity_table(activity_list_cache, _create_table_row);
    });

    $("#dropdown-menu-size").on('click', '.dropdown-item', function (e) {
        let $btn = $(this);
        if($btn.hasClass("selected")) return;
        $("#dropdown-menu-size").find(".selected").removeClass("selected");
        $btn.addClass("selected");
        let num_per_page = $btn.data("num_per_page");
        $("#btn-vgp-size").data("num_per_page",num_per_page).text(num_per_page);
        _create_activity_table(activity_list_cache, _create_table_row);
    });
}


function _doReload(){
	_vgp_show_loading();
	_load_activity(
		function(data){
			_create_activity_table(data, _create_table_row);
			setTimeout(function () { _vgp_hide_loading(); }, 500);
		},
		function(data){
			_vgp_hide_loading();
		}
	);
}


function onClickNode(treeId, treeNode, clickFlag) {

	_vgp_show_loading();

	var sel = zTreeObj.getSelectedNodes();

	var alreadySelected = false;

	if (sel && sel.length) {
		for (var i = 0; i < sel.length; i++) {
			if (sel[i].tId === treeNode.tId) {
				alreadySelected = true;
				break;
			}
		}
	}

	if (alreadySelected) {
		zTreeObj.cancelSelectedNode(treeNode);
		$('#btn_filter_panel').addClass('empty').find('span.name').text('Filter');
		$('#menu_filter_panel_version').empty();
		$('#menu_filter_empty').empty();
		_doReload();
		return false;
	}else{
		$('#btn_filter_panel').removeClass('empty').find('span.name').text(treeNode.panel_name_ja);
		$('#menu_filter_panel_version').empty();
		$('#menu_filter_empty').empty();
		_onSelectedPanel(treeNode.panel_id,
			function(){
				_doReload();
			},function(){
				_vgp_hide_loading();
			});

		return true;
	}
}


function _onSelectedPanel(panel_id, callback, callback_fail){
	fetch(`${URL_LOAD_PANEL_VERSION_AND_ENTITY}?panel_id=${panel_id}`)
		.then(response => response.json())
		.then(data => {
			if(data.error){
				callback_fail();
				alert(data.error);
				return;
			}
			_create_menu_list('menu_filter_panel_version','filter-panel-version',data.panel_version);
			_create_menu_list('menu_filter_entity','filter-entity',data.entity);
			if(data.entity && data.entity.length > 0){
				_attach_search_input('menu_filter_entity');
			}
			callback();
		});
}

function _attach_search_input(container_id){

	let html_str = `
	<div class="dropdown-search"> 
		<input id="dropdown_filter_input" type="text" autocomplete="off" class="form-control dropdown_filter_input_entity" placeholder="Filter...">
	</div>
	`;
	$(html_str).prependTo($('#'+container_id));

}
function _create_menu_list(menu_id,class_checkbox,arr){
	$list = $("#"+menu_id).empty();
	for(let i=0; i<arr.length; i++){
		let item = arr[i];
		let html_str = `
			<div class="dropdown-item-checkbox">
				<div class="form-check">
					<input class="form-check-input row-checkbox ${class_checkbox}" type="checkbox" value="${item.value}" id="${class_checkbox}_${i}">
					<label class="form-check-label" for="${class_checkbox}_${i}">${item.name}</label>
				</div>
			</div>
		`;
		$(html_str).appendTo($list);
	}
}

function getSelectedPanelIDs(){
    var nodes = zTreeObj.getSelectedNodes();
    var ids = nodes.map(n => n.panel_id).join(",");
    return ids;
}

function getSelectedPanelVersion(){
	let results = document.querySelectorAll('.filter-panel-version:checked');
	let values = Array.from(results).map(cb => cb.value).join(",");
	return values;
}

function getSelectedEntity(){
	let results = document.querySelectorAll('.filter-entity:checked');
	let values = Array.from(results).map(cb => cb.value).join(",");
	return values;
}


function getCheckedNodesData() {
	var checkedNodes = zTreeObj.getCheckedNodes(false);
			
	var nodeData = checkedNodes.map(function(node) {
		return {
			nando_id: node.nando_id,
			panel_id: node.panel_id,
			panel_name: node.name,
			checked: node.checked
		};
	});
			
	return nodeData;
}


var activity_list_cache = [];

function _load_activity(callback, callback_fail){

	let filter_panel   = getSelectedPanelIDs();
	let filter_version = getSelectedPanelVersion();
	let filter_entity  = getSelectedEntity();
    let filter_fromdate = $('#dateFrom').val();
    let filter_todate   = $('#dateTo').val();

	if(filter_todate.length > 0){
		filter_todate += ' 23:59:59';
	}

	utils_run_submit(
		URL_LOAD_ACTIVITY,
		{
			'filter_panel':   filter_panel, 
			'filter_version': filter_version, 
			'filter_entity':  filter_entity, 
			'filter_from':    filter_fromdate,
			'filter_to':      filter_todate
		},
		function(data){
			//format_date
			for(let item of data){
				item.created_at = utils_format_date(item.created_at);
			}
			activity_list_cache = data;
			$("#total_num").text(activity_list_cache.length);
			callback(activity_list_cache);
		},
		function(){
			callback_fail();
		}
	);
}

function _sort_table_rows(activity_log_list){
	let $sorter = $("#activity_table thead").find('span.vgp-asc, span.vgp-dsc').first();
	let sortClass = $sorter.hasClass("vgp-asc") ? "vgp-asc" : "vgp-dsc";
	let target_class = $sorter.data("target-class");

    activity_log_list.sort((a,b) => {
        let sortNum = 1;
        let a_text = a[target_class] ? a[target_class].toLowerCase() : '';
        let b_text = b[target_class] ? b[target_class].toLowerCase() : '';
        sortNum = a_text.localeCompare(b_text, 'ja', {sensitivity: 'base'});
        if(sortClass === "vgp-dsc") {
            sortNum *= (-1) ;
        }
        return sortNum;
    });
}

function _create_activity_table(activity_log_list, create_table_row) {

	let $tableBody = $("#activity_table_tbody");
    $tableBody.empty();

	_sort_table_rows(activity_log_list);

	let numPerPage = parseInt($('#btn-vgp-size').data('num_per_page'), 10);

	$('#table-pagination-desc').empty();

	if($('#table-pagination').data('pagination')) $('#table-pagination').pagination('destroy');

    $('#table-pagination').pagination({
        dataSource: activity_log_list,
        pageSize:   numPerPage,
        callback: function (data, pagination) {
            let $tableBody = $("#activity_table_tbody");
            $tableBody.empty();
			let max_len = 0;
            data.forEach(item => {
                let len = create_table_row(item, $tableBody);
				if(len > max_len) max_len = len;
				
            });

			if(max_len >= 20){
				$('.upper').removeClass('medium').removeClass('short').addClass('long');
				$('th.panel_name').removeClass('medium').removeClass('short').addClass('long');
				$('td.panel_name').removeClass('medium').removeClass('short').addClass('long');
				$('th.panel_version').removeClass('medium').removeClass('short').addClass('long');
			}else if(max_len >= 10){
				$('.upper').removeClass('long').removeClass('short').addClass('medium');
				$('th.panel_name').removeClass('long').removeClass('short').addClass('medium');
				$('td.panel_name').removeClass('long').removeClass('short').addClass('medium');
				$('th.panel_version').removeClass('long').removeClass('short').addClass('medium');
			}else{
				$('.upper').removeClass('long').removeClass('medium').addClass('short');
				$('th.panel_name').removeClass('long').removeClass('medium').addClass('short');
				$('td.panel_name').removeClass('long').removeClass('medium').addClass('short');
				$('th.panel_version').removeClass('long').removeClass('medium').addClass('short');
			}
            let totalPage =  Math.ceil(pagination.totalNumber / pagination.pageSize);
            _update_pagination_desc(pagination.pageNumber, totalPage, pagination.totalNumber);
        }
    });
}

function _update_pagination_desc(page_no,total_page,total_num){
    if(total_page){
        $('#table-pagination-desc').text(`Page ${page_no} of ${total_page}, total ${total_num} items`);
    }else{
        $('#table-pagination-desc').text(`total ${total_num} items`);
    }
}

const data_key_list = ['created_at','user_name','panel_name','panel_versions','entity_name','action','difference'];
const fields_list = ['rating_id','phenotypes','mode_of_inheritances', 'publications', 'source', 'comment'];
const diff_label_hash = {
	'rating_id':    "Rating",
	'phenotypes':   "Phenotype",
	'publications': "Publications",
	'comment':      "Comment",
	'source':       "Source",
	'mode_of_inheritances': "Mode of Inheritance"
};
const delete_label_hash = {
	'review': "Review",
	'review_comment': "Comment"
}

function _create_table_row(activity_log, $tbody){

	let panel_name_len = 0;

	let detail_div_id = `detail_div_${activity_log.activity_id}`;

	let $tr = $('<tr>').appendTo($tbody);

	let $td = $(`<td colspan="7">`).appendTo($tr);

	let $wrapper = $('<div>').addClass('wrapper').appendTo($td);

	let $upper = $('<div>')
		.addClass('upper')
		.data('detail_div_id', detail_div_id)
		.data('activity_log', activity_log)
		.click(function(e){

			if($(e.target).is('a')) return;

			let $upper_row = $(this);

			let $btn = $upper_row.find('.difference-ctl');
			if($btn.text() === 'keyboard_arrow_down'){
				$btn.text('keyboard_arrow_up');
			}else{
				$btn.text('keyboard_arrow_down');
			}

			let $detail_div = $upper_row.next();
			$detail_div.toggleClass('hide');
			if(!$detail_div.hasClass('loaded') && !$detail_div.hasClass('loading')){
				let detail_div_id = $upper_row.data('detail_div_id');
				let activity_log = $upper_row.data('activity_log');
				$detail_div.addClass('loading')
				_loading_detail(activity_log,detail_div_id);
			}
		})
		.appendTo($wrapper);

	let $lower = $('<div>').attr('id', detail_div_id).addClass('lower').addClass('hide').appendTo($wrapper);
	$('<div>').addClass('loading').appendTo($lower);

	for(let data_key of data_key_list){
		let val = activity_log[data_key] || "-";
		if(data_key === 'difference'){

			let $div = $('<div>').addClass('difference').appendTo($upper);

			let text = get_action_difference_text(activity_log);
			let $text = $('<span>').addClass('text').text(text).appendTo($div);

			let $ctl  = $('<span>').addClass('material-symbols-outlined')
								.addClass('difference-ctl')
								.text('keyboard_arrow_down')
								.appendTo($div);

		}else if(data_key === 'panel_name'){
			let $div = $('<div>').addClass('panel_name').appendTo($upper);
			let html_str = _construct_panel_name(activity_log);
			$(html_str).appendTo($div);


			if(activity_log['panel_name'].length > panel_name_len){
				panel_name_len = activity_log['panel_name'].length
			}

		}else if(data_key === 'entity_name'){
			let $div = $('<div>').addClass('entity_name').appendTo($upper);
			let html_str = _construct_entity_name(activity_log);
			$(html_str).appendTo($div);

		}else if(data_key === 'action'){
			let $div = $('<div>').addClass('action').appendTo($upper);
			let title = get_action_title(activity_log);
			$('<span>').addClass('action-tag').addClass(activity_log['target']).text(title).appendTo($div);
		}else if(data_key === 'panel_versions'){
			let $panel_versions_wrapper =$('<div>').addClass('d-flex flex-column panel_version').appendTo($upper);
			if(activity_log.panel_type === TYPE_SPECIFIED){
				for(let pv of val){
					$('<div>').addClass('panel_version_tag').text(pv).appendTo($panel_versions_wrapper);
				}
			}
		}else{
			$("<div>").addClass(data_key).text(val).appendTo($upper);
		}
	}

	return panel_name_len;
}

function get_action_title(activity_log){
	if(activity_log.target === 'review'){
		if(activity_log.action === "add"){
			return 'Reviewed';
		}else if(activity_log.action === "change"){
			return 'Modified';
		}else if(activity_log.action === "delete"){
			return 'Deleted';
		}
	}else if(activity_log.target === 'review_comment'){
		return 'Modified';
	}else if(activity_log.target === 'definition'){
		if(activity_log.action === "classify"){
			return 'Classified';
		}else if(activity_log.action === "delete"){
			return 'Deleted';
		}else{
			return 'Assessed';
		}
	}
}


function get_action_difference_text(activity_log){

	let diff_text_arr = [];

	let arr_diff = JSON.parse(activity_log.difference);

	for(let field of fields_list){
		let arr = arr_diff.filter(diff => field in diff);

		if(arr.length > 0){
			action = arr[0][field];
			diff_text_arr.push(`${diff_label_hash[field]} ${action}`);
		}
	}

	let diff_text = diff_text_arr.join('; ');


    if(activity_log.target === 'review'){
        if(activity_log.action === "add"){
			if(activity_log.is_from_user === ENUM_VAL_YES){
				return 'Created Gene Review';
			}else{
	            return 'Review Added';
			}
        }else if(activity_log.action === "change"){
            return diff_text;
        }else if(activity_log.action === "delete"){
            return 'Review Deleted';
        }
    }else if(activity_log.target === 'review_comment'){
        return diff_text;
    }else if(activity_log.target === 'definition'){
        if(activity_log.action === "classify"){
            return 'Rating Changed';
        }else if(activity_log.action === "delete"){
            return 'Entity Definition Deleted';
        }else{
            return diff_text;
        }
    }
}
const USER_ACTIVITY_TARGET_REVIEW         = 'review';
const USER_ACTIVITY_TARGET_REVIEW_COMMENT = 'review_comment';
const USER_ACTIVITY_TARGET_DEFINITION     = 'definition';

const USER_ACTIVITY_ACTION_ADD      = "add";
const USER_ACTIVITY_ACTION_CHANGE   = "change";
const USER_ACTIVITY_ACTION_DELETE   = "delete";
const USER_ACTIVITY_ACTION_CLASSIFY = "classify";

function _loading_detail(activity_log, detail_div_id){

	let input_data = {
		target:            activity_log.target,
		action:            activity_log.action,
		entity_id:         activity_log.entity_id,
		review_id:         activity_log.review_id,
		review_comment_id: activity_log.review_comment_id,
		former_entity_id:  activity_log.former_entity_id,
		former_review_id:  activity_log.former_review_id,
		former_review_comment_id: activity_log.former_review_comment_id
	};

	let arr_diff = JSON.parse(activity_log.difference);
	for(let diff of arr_diff){
		if('comment_ids' in diff){
			input_data.comment_ids = diff.comment_ids;
		}
		if('comment' in diff){
			input_data.comment = diff.comment;
		}
	}

	fetch(URL_LOAD_ACTIVITY_DETAIL,	{
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(input_data)
	})
    .then(response => response.json())
    .then(data => {	
		let $container = $("#"+detail_div_id).empty();

		let activity    = data.activity;
		let data_now    = data.data || {};
		let data_former = data.former_data || {};

		_construct_difference_panel($container, activity, data_former, data_now)

		$container.removeClass("loading").addClass('loaded');
	});
}

function _construct_difference_panel($container, activity_log, data_former, data_now){

	let $diff_wrapper = $('<div>').addClass('diff-wrapper').appendTo($container);

	let $title = $(`<div class="title">`).addClass('title-left-border').appendTo($diff_wrapper);
	$('<span>').addClass('title1').text('変更点').appendTo($title);
	$('<span>').addClass('title2').text('(OLD > NOW)').appendTo($title);

	for(let field of fields_list){

		let val_now = data_now[field] || "";
		let val_former = data_former[field] || "";

		if(!val_now && !val_former) continue;
		if(val_now === val_former) continue;

		let $sub_wrapper = $('<div>').addClass('sub-wrapper').appendTo($diff_wrapper);

		let text = `${diff_label_hash[field]}:`;
		$('<div>').addClass('title').text(text).appendTo($sub_wrapper);

		let $sub_content = $('<div>').addClass('content').appendTo($sub_wrapper);

		_construct_content($sub_content,'old',field, val_former);

		$('<div>').addClass('sign').text('>').appendTo($sub_content);

		_construct_content($sub_content,'new',field, val_now);
	}
}

function _construct_content($container,old_or_new,field,val){
	if(val){
		let content_text = _construct_content_text(field, val);
		let $result_panel = $('<div>').addClass('result').addClass(old_or_new).addClass(field).appendTo($container);
		if(field=== 'rating_id'){
			$(content_text).appendTo($result_panel);
		}else{
			$result_panel.text(content_text);
		}
	}else{
		$('<div>').addClass('result').addClass(old_or_new).text('-').appendTo($container);
	}
}

function _construct_content_text(field, val){

	if(field === 'rating_id'){
		let rating = RATING_TYPE_HASH[val];
		return `<span class="vgp-rating-tag ${RATING_CLASS_HASH[rating]}">${rating}</span>`;
	}else if(field === 'phenotypes'){
		return _construct_phenotypes(val);
	}else if(field === 'mode_of_inheritances'){
		return _construct_moi(val)
	}else{
		return val;
	}
}

function _construct_panel_name(activity_log){
	let list = [
		`panel_id=${activity_log['panel_id']}`,
		`panel_name=${encodeURIComponent(activity_log['panel_name'])}`,
		`nando_id=${activity_log['nando_id']}`,
		'lang=ja'
	];
	let href = `${URL_PANEL_DETAIL}?${list.join('&')}`;

	let html_str = `<a href="${href}" target="_blank">${activity_log['panel_name']}<svg></svg></a>`;

	return html_str;
}

function _construct_entity_name_href(activity_log, is_edit_definition){
	let list = [
		`panel_id=${activity_log['panel_id']}`,
		`panel_version=${activity_log['panel_version']}`,
		`panel_version_id=${activity_log['panel_version_id']}`,
		`panel_name=${encodeURIComponent(activity_log['panel_name'])}`,
		`nando_id=${activity_log['nando_id']}`,
		`gene_id=${activity_log['gene_id']}`,
		`gene_symbol=${activity_log['gene_symbol']}`,
		`entity_name=${encodeURIComponent(activity_log['entity_name'])}`,
		`entity_type_id=${activity_log['entity_type_id']}`,
		'lang=ja'
	];
	if(is_edit_definition){
		list.push(`is_edit_definition=yes`);
	}
	let href = `${URL_PANEL_ENTITY_DETAIL}?${list.join('&')}`;

	return href;
}

function _construct_entity_name(activity_log){
	let href = _construct_entity_name_href(activity_log, false);
	let html_str = `<a href="${href}" target="_blank">${activity_log['entity_name']}<svg></svg></a>`;
	return html_str;
}

function _construct_phenotypes(val){
	let id_name_list = val.split('|');
	let tmp = [];
	for(let id_name of id_name_list){
		let [id,name] = id_name.split('--');
		tmp.push(name);
	}
	let phenotypes = tmp.join(', ');
	return phenotypes;
}

function _construct_moi(val){
	let id_list = val.split(',');
	let tmp = [];
	for(let id of id_list){
		tmp.push(MODE_OF_INHERITANCE_HASH[id]);
	}

	return tmp.join(', ');
}
