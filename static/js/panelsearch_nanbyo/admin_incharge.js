const URL_LOAD_INCHARGE_ACTIVITY      = '/panelsearch_nanbyo_admin_load_incharge_activity';
const URL_LOAD_CHECK_HISTORY_ACTIVITY = '/panelsearch_nanbyo_admin_load_incharge_check_history';
const URL_CHECK_USER_ACTIVITY         = '/panelsearch_nanbyo_admin_check_user_activity';
const URL_UNCHECK_USER_ACTIVITY       = '/panelsearch_nanbyo_admin_uncheck_user_activity';
const URL_LOAD_ACTIVITY_HISTORY       = "/panelsearch_nanbyo_admin_load_activity_history";


var activity_check_cache = [];
function _init_activity_check_cache(data){ activity_check_cache = data.data;}

var incharge_activity_list_cache = [];
function _init_incharge_activity_list_cache(data){
	// format date
	//for(let item of data){
	//	item.created_at = utils_format_date(item.created_at);
	//}
	incharge_activity_list_cache = data;
}

function _init_multi_class(data){
	utils_init_type_hash(data.mode_of_inheritance_arr, data.entity_type_arr, data.rating_type_arr);
}

function _init_incharge(mode_of_inheritance_arr,entity_type_arr,rating_type_arr){

	let ajax_obj_arr = [
		{'url': `${URL_LOAD_MULTI_CLASS}?lang=ja`, 'func': _init_multi_class},
		{'url': URL_LOAD_CHECK_HISTORY_ACTIVITY,   'func': _init_activity_check_cache},
		{'url': URL_LOAD_INCHARGE_ACTIVITY,        'func': _init_incharge_activity_list_cache}
	];

	let total_cnt = utils_countUrls(ajax_obj_arr);
	let completed_cnt = 0;
	ajax_obj_arr.forEach((ajax_obj) => {
		fetch(ajax_obj.url)
		.then(response => response.json())
		.then(json_data => {
			if(utils_isFunction(ajax_obj.func)){
				ajax_obj.func(json_data);
			}
			completed_cnt++;
			if(completed_cnt === total_cnt){
				$("#total_num").text(incharge_activity_list_cache.length);
				_create_activity_table(incharge_activity_list_cache, _create_incharge_table_row);
				_vgp_hide_loading();
			}
		}).catch(error => {
			_vgp_hide_loading();
			alert(error.message);
		});
	});

	$("#dropdown-menu-size").on('click', '.dropdown-item', function (e) {
		let $btn = $(this);
		if($btn.hasClass("selected")) return;
		$("#dropdown-menu-size").find(".selected").removeClass("selected");
		$btn.addClass("selected");
		let num_per_page = $btn.data("num_per_page");
		$("#btn-vgp-size").data("num_per_page",num_per_page).text(num_per_page);
		_create_activity_table(incharge_activity_list_cache, _create_incharge_table_row);
    });

	$('#activity_table').on('click', 'a', function(e){
		e.stopPropagation();
	});

	$('#activity_table').on('click', 'tbody>tr', function(e){
		e.stopPropagation();
		selectRow(this);
		let $tr = $(this);
		openSidebar($tr.data('activity_id'));
	});

	$('#activity_table').on('click', 'span.vgp-sorter', function(e){
        let $sorter   = $(this);
        let sortClass = 'vgp-asc';
        if($sorter.hasClass('vgp-asc')){
            sortClass = 'vgp-dsc';
        }else if($sorter.hasClass('vgp-dsc')){
            sortClass = 'vgp-asc';
        }
        $sorter.closest('tr').find('.vgp-sorter').removeClass('vgp-dsc').removeClass('vgp-asc');
        $sorter.addClass(sortClass);
        _create_activity_table(incharge_activity_list_cache, _create_incharge_table_row);

	});

	const sidebar = document.getElementById('sidebar');
	$(sidebar).click(function(e){
		e.stopPropagation();
	});
	const overlay = document.getElementById('overlay');
	function openSidebar(activity_id) {
		let activity_log = _get_activity_log_by_id(activity_id);

		let panel_name_inner_html = _construct_panel_name(activity_log);
		$('#sidebar_panel_name').empty().append(panel_name_inner_html);

		let entity_type = ENTITY_TYPE_HASH[activity_log.entity_type_id];
		let entity_name_inner_html = _construct_entity_name(activity_log);
		let $entity_name = $('#sidebar_entity_name').empty()
								.text(`${entity_type}:`)
								.append(entity_name_inner_html);

		let curator_edit_href = _construct_entity_name_href(activity_log, true);
		$(`<a href="${curator_edit_href}" target="_blank" class="curate">Curate</a>`).appendTo($entity_name);

		let user_type_html = "";
		if(activity_log.user_type == USER_TYPE_ADMIN){
			user_type_html = `<span class="identity-tag curator">Administrator</span>`
		}else if(activity_log.user_type == USER_TYPE_CURATOR){
			user_type_html = `<span class="identity-tag curator">Curator</span>`
		}else{
			user_type_html = `<span class="identity-tag reviewer">Reviewer</span>`
		}

		$('#sidebar_user').empty()
			.append(user_type_html)
			.append(`<span class="user_name">${activity_log.user_name}(${activity_log.affiliation})</span>`);	

		_loading_activity_history(activity_log);

		$('#sidebar-ctl').find('button').data('activity_id', activity_id);
		if(activity_check_cache.includes(activity_id)){
			$('#sidebar-ctl').removeClass('docheck').addClass('douncheck');
		}else{
			$('#sidebar-ctl').removeClass('douncheck').addClass('docheck');
		}

		if(!$(sidebar).hasClass('shown')){
        	sidebar.style.right = '0';
			$(sidebar).addClass('shown');
		}
        //overlay.style.display = 'block';
	}

	$("#sidebar-ctl").on('click', 'button', function(){
		let $btn = $(this);
		$btn.prop('disabled', true);

		let activity_id = $btn.data("activity_id");
		let url = $btn.hasClass('docheck') ? URL_CHECK_USER_ACTIVITY : URL_UNCHECK_USER_ACTIVITY;

		fetch(`${url}?activity_id=${activity_id}`)
		.then(response => response.json())
		.then(data => {
			$btn.prop('disabled', false);
			if(data.error){
				alert(data.error);
				return;
			}

			if($btn.hasClass('docheck')){
				activity_check_cache.push(activity_id);
				$('#sidebar-ctl').removeClass('docheck').addClass('douncheck');
				$('tr.highlight').addClass('checked');
				$('#sidebar_body').find('div.header').eq(0).addClass('checked');
				activity_check_cache.append(activity_id);
			}else{
				$('#sidebar_body').find('div.header').eq(0).removeClass('checked');
				$('tr.highlight').removeClass('checked');
				let index = activity_check_cache.indexOf(activity_id);
				if (index > -1) {
					activity_check_cache.splice(index, 1);
				}
				$('#sidebar-ctl').removeClass('douncheck').addClass('docheck');
			}
		});
	});


    function closeSidebar() {
        sidebar.style.right = '-800px';
		$(sidebar).removeClass('shown');
    }

    document.getElementById('closeSidebar').addEventListener('click', closeSidebar);

	$('body').on('click', function (e) {
		closeSidebar();
		$('tr.highlight').removeClass('highlight');
	});
}

var lastSelected = null;
function selectRow(tr) {
  if (lastSelected) {
    lastSelected.classList.remove('highlight');
    lastSelected.removeAttribute('aria-selected');
  }
  tr.classList.add('highlight');
  tr.setAttribute('aria-selected', 'true');
  lastSelected = tr;
}


function _get_activity_log_by_id(activity_id){
	const results = incharge_activity_list_cache.filter(u => u.activity_id == activity_id);
	return results[0];
}


const incharge_data_key_list = ['user_name','panel_name','entity_name','action','created_at'];

function _create_incharge_table_row(activity_log, $tbody){

	let panel_name_len = 0;

	let $tr = $('<tr>').data("activity_id", activity_log.activity_id).appendTo($tbody);

	if(activity_check_cache.includes(activity_log.activity_id)){
		$tr.addClass("checked");
	}

	for(let data_key of incharge_data_key_list){

		let val = activity_log[data_key] || "-";

		let $td = $('<td>').addClass(data_key).appendTo($tr);

		if(data_key === 'panel_name'){
			let html_str = _construct_panel_name(activity_log);
			$(html_str).appendTo($td);

			if(activity_log['panel_name'].length > panel_name_len){
				panel_name_len = activity_log['panel_name'].length
			}
		}else if(data_key === 'entity_name'){
            let html_str = _construct_entity_name(activity_log);
            $(html_str).appendTo($td);

        }else if(data_key === 'action'){
             let title = get_action_title(activity_log);
            $('<span>').addClass('action-tag').addClass(activity_log['target']).text(title).appendTo($td);
		}else if(data_key === 'created_at'){
			$('<span>').text(val).appendTo($td);
			$(`<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#757575"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z"/></svg>`).appendTo($td);
		}else{
			$td.text(val);
		}
	}

	return panel_name_len;;
}

const fields_list_sidebar = ['action', 'rating_id', 'source', 'phenotypes','mode_of_inheritances', 'publications', 'comment'];
const label_hash_sidebar = {
	'action':       "Action:",
    'rating_id':    "Rating:",
	'source':       "Source:",
    'phenotypes':   "Phenotype:",
    'publications': "Publications:",
    'comment':      "Comment:",
    'mode_of_inheritances': "Mode of Inheritance:"
};

function _loading_activity_history(activity_log){

	_text_input_show_loader();

	let data = {
		panel_id:       activity_log.panel_id,
		gene_id:        activity_log.gene_id,
		entity_type_id: activity_log.entity_type_id,
		entity_name:    activity_log.entity_name,
		user_id:        activity_log.user_id,
		target:         activity_log.target,
		action:         activity_log.action,
		user_id:        activity_log.user_id,
		panel_id:       activity_log.panel_id,
		gene_id:        activity_log.gene_id,
		entity_type_id: activity_log.entity_type_id,
		entity_name:    activity_log.entity_name,
		original_review_id: activity_log.original_review_id
	};

	fetch(URL_LOAD_ACTIVITY_HISTORY,{
		method: 'POST', 
		headers: {'Content-Type': 'application/json'}, 
		body: JSON.stringify(data)}
	)
	.then(response => response.json())
	.then(json_data => {
        if(json_data.error){
			alert('Error:'+json_data.error);
			return;
		}
		_create_activity_history(activity_log, json_data);

		$('#sidebar_body').find('.header').first().trigger('click');

		_text_input_hide_loader();
	})
	.catch(error => {
		console.error('Error:', error);
		_text_input_hide_loader();
		alert('An unexpected error occurred.' + error);
	});
}

function _create_activity_history(activity_log, activity_history_hash){

	// breadcrumblist
	let panel_upstream_trace_data = JSON.parse(activity_history_hash.panel_upstream_trace);
	_init_history_ui_breadcrumblist(activity_log.gene_id, panel_upstream_trace_data, activity_log.panel_id, activity_log.nando_id, activity_log.gene_symbol);

	let $latest_created_at = $('#latest_created_at').text('');
	let $latest_content_panel = $('#latest_content_panel').empty();
	if(activity_history_hash.lastest){

		//snapshort timestamp
		let timestamp = activity_history_hash.lastest['created_at'];
		let formated = utils_format_date(timestamp);
		$latest_created_at.text(formated);
	}

	//snapshort content
	_create_sidebar_tbl($latest_content_panel, activity_log, activity_history_hash.lastest);

	// change history
	$('#sidebar_body').find('div.history').remove();
	let sorted_activity_id_list = Object.keys(activity_history_hash.activity_history).map(Number).sort((a, b) => b - a);
	for(let activity_id of sorted_activity_id_list){
		let history_activity_log = activity_history_hash.activity_history[activity_id];
		_create_history_activity_content(history_activity_log);
	}
}

function _create_history_activity_content(history_activity_log){

	let content_wrapper_id = `history_content_wrapper_${history_activity_log.activity_id}`;

	let $wrapper = $('<div>').addClass("content").addClass("history").appendTo($('#sidebar_body'));

	let $header = $('<div>')
		.addClass('header')
		.data('detail_div_id', content_wrapper_id)
		.data('activity_log', history_activity_log)
		.click(function(e){
			let $ctl = $(this);
			let $btn = $ctl.find('.difference-ctl');
			if($btn.text() === 'keyboard_arrow_down'){
				$btn.text('keyboard_arrow_up');
			}else{
				$btn.text('keyboard_arrow_down');
			}
			let detail_div_id = $ctl.data('detail_div_id');
			let $detail_div = $('#'+detail_div_id);
			$detail_div.toggleClass('hide');
			if(!$detail_div.hasClass('loaded') && !$detail_div.hasClass('loading')){
				let activity_log = $ctl.data('activity_log');
				$detail_div.addClass('loading')
				_loading_detail(activity_log,detail_div_id);
			}
		})
		.appendTo($wrapper);

	if(activity_check_cache.includes(history_activity_log.activity_id)){
        $header.addClass("checked");
    }

	let action_title = get_action_title(history_activity_log);
	$(`<div><span class="action-tag ${history_activity_log.target}">${action_title}</span></div>`).appendTo($header);

	let diff_text = get_action_difference_text(history_activity_log);
	$(`<div class="difference-text">${diff_text}</div>`).appendTo($header);

	let timestamp_text = utils_format_date(history_activity_log.created_at);
	$(`<div class="timestamp">${timestamp_text}</div>`).appendTo($header);

	$('<span>').addClass('material-symbols-outlined').addClass('difference-ctl').text('keyboard_arrow_down').appendTo($header);

	let $content_wrapper = $('<div>').attr('id',content_wrapper_id).addClass('content-wrapper').addClass('hide').appendTo($wrapper);
	let html_str = `
		<div class="loader">
			<div class="loader-content">
				<span class="loader-gif"></span>
				<span class="loader-text"></span>
			</div>
		</div>
	`;
	$(html_str).appendTo($content_wrapper);
}

function _init_history_ui_breadcrumblist(gene_id, panel_upstream_trace_data, panel_id, nando_id, gene_symbol){
    let title_name_arr = [];
    let title_nando_id_arr = [];
    let title_panel_id_arr = [];

    function travese(json_arr, path_panel_id_arr, path_nando_id_arr, path_name_arr){
        for (let node of json_arr){
            let path_nando_id = node.nando_id;
            let path_name     = node.panel_name_ja;
            let path_panel_id = node.panel_id;
            if(path_nando_id === nando_id){
                title_name_arr.push([...path_name_arr, path_name]);
                title_nando_id_arr.push([...path_nando_id_arr, path_nando_id]);
                title_panel_id_arr.push([...path_panel_id_arr, path_panel_id]);
            }else{
                if('children' in node && node.children.length > 0){
                    travese(
						node.children,
						[...path_panel_id_arr, path_panel_id], 
						[...path_nando_id_arr, path_nando_id], 
						[...path_name_arr, path_name]
					);
                }
            }
        }
    }

	travese([panel_upstream_trace_data],[],[],[]);

	let $wrapper = $('#sidebar_breadcrumblist_wrapper').empty(); 
	let separator = `<span> &gt; </span>`;
    for (let i = 0; i < title_name_arr.length; i++){
        let $subwrapper = $('<div>').appendTo($wrapper);
        let out_arr = [];
        for(let j = 1; j< title_name_arr[i].length; j++){

            let name     = title_name_arr[i][j];
            let nando_id = title_nando_id_arr[i][j];
            let panel_id = title_panel_id_arr[i][j];
            let link_href = `${URL_PANEL_DETAIL}?panel_id=${panel_id}&nando_id=${nando_id}&lang=${lang}`;
            if(j === 1){
                link_href = "/panelsearch_nanbyo";
            }
            let link_str = `<a href="${link_href}">${name}</a>`;
            out_arr.push(link_str);
        }
        let html_str = out_arr.join(separator) + separator;
        $subwrapper.html(html_str);
    }
	
}


function _create_sidebar_tbl($container, activity_log, activity){
	
	$tbl = $('<table>').addClass('snapshort-table').appendTo($container);

	for(let field of fields_list_sidebar){

		if(field !=='action'){
			if(!activity) continue;
			if(!(field in activity)) continue;
			if(!activity[field]) continue;
		}

		let $tr = $('<tr>').appendTo($tbl);
		$(`<th>${label_hash_sidebar[field]}</th>`).appendTo($tr);
		let $td = $('<td>').appendTo($tr);

		if(field === 'action'){
			let title = get_action_title(activity_log);
			$td.text(title);
		}else if(field === 'rating_id'){
			let rating = RATING_TYPE_HASH[activity.rating_id];
			html_str = `<span class="vgp-rating-tag ${RATING_CLASS_HASH[rating]}">${rating}</span>`;
			$td.append(html_str);
		}else if(field === 'phenotypes'){
			let text = _construct_phenotypes(activity.phenotypes);
			$td.text(text);
		}else if(field === 'mode_of_inheritances'){
			let moi = (activity.mode_of_inheritances) ? _construct_moi(activity.mode_of_inheritances) : "-";
			$td.text(moi);
		}else if(field === 'comment'){

			let $list_wrapper = $('<div>').addClass('comment-list-wrapper').appendTo($td);

			if(Array.isArray(activity[field])){
				for(let comment of activity[field]){

					let $comment_wrapper = $('<div>').addClass('comment-wrapper').appendTo($list_wrapper)

					$('<div>').addClass('comment').text(comment.comment).appendTo($comment_wrapper);

					let timestamp_wrapper1 = $('<div>').addClass('comment-timestamp-wrapper').appendTo($comment_wrapper);
					$('<span>').addClass('title').text("Created").appendTo(timestamp_wrapper1);
					$('<span>').addClass('timestamp').text(utils_format_date(comment.created_at)).appendTo(timestamp_wrapper1);

					let timestamp_wrapper2 = $('<div>').addClass('comment-timestamp-wrapper').appendTo($comment_wrapper);
					$('<span>').addClass('title').text("Last Modified").appendTo(timestamp_wrapper2);
					$('<span>').addClass('timestamp').text(utils_format_date(comment.modified_at)).appendTo(timestamp_wrapper2);
				}
			}else{
				let $comment_wrapper = $('<div>').addClass('comment-wrapper').appendTo($list_wrapper)
				$('<div>').addClass('comment').text(activity[field]).appendTo($comment_wrapper);
			}
		}else{
			if(activity[field]){
				$td.text(activity[field]);
			}else{
				$td.text('-');
			}
		}
	}
}

function _text_input_show_loader(){
	$('#text-input-loader').removeClass('hide');
}

function _text_input_hide_loader(){
	setTimeout(function () {
		$('#text-input-loader').addClass('hide');
	}, 500);
}
