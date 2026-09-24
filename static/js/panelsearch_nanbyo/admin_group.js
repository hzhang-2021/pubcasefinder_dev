const URL_LOAD_DATA              = "/panelsearch_nanbyo_admin_group_load_data"
const URL_ADD_GROUP_USER         = "/panelsearch_nanbyo_admin_group_add_group_user";
const URL_DELETE_GROUP_USER      = "/panelsearch_nanbyo_admin_group_delete_group_user";
const URL_CHANGE_GROUP_USER_ROLE = "/panelsearch_nanbyo_admin_group_change_group_user_role";
const URL_GET_PANEL_BY_NAME      = "/panelsearch_nanbyo_get_panel_by_name";
const URL_GET_GROUP_DISEASE      = "/panelsearch_nanbyo_get_group_panel";



// Escape profile values used in HTML text and quoted attributes.
function _escape_group_profile_html(value) {
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
    return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}

// textarea in the new group popup
function autoResizeTextarea(textarea) {
	textarea.style.height = 'auto'; // 先重置高度
	textarea.style.height = textarea.scrollHeight + 'px'; // 设置为内容高度
}


function _init_btn_event(){

	if (typeof attach_admin_event === "function") {
		attach_admin_event();
	}

	$('#btn_add_to_right').on('click', function () {
	    let selected_user_list = _get_selected_group_user_list("not_in_group_user_list_table");
	    if(selected_user_list.length === 0){
	        alert("Please select user first.");
	        return;
	    }
		_move_user(selected_user_list, URL_ADD_GROUP_USER, _add_group_user_to_cache);
	});

	$('#btn_add_to_left').on('click', function () {
        let selected_user_list = _get_selected_group_user_list("in_group_user_list_table");
		_trigger_remove_user_from_group(selected_user_list);
	});

    $('#btn_invite_user').on('click', function () {

		var $btn = $(this);

		if ($btn.prop('disabled')) return;

		$btn.prop('disabled', true);
        setTimeout(function(){
          $btn.prop('disabled', false);
        }, 3000);

		let user_name = $('#invite_user_name').text();
		if(user_name.indexOf('@') >= 0){
			do_invite_user('', user_name);
		}else{
			do_invite_user(user_name, '');
		}
	});
}

function do_invite_user(user_name, mail_address){
	let group_title = $('#group_user_list_title').text();
	let body = INVITE_GROUP_TEMPLATE_BODY
				.replace('{user_name}',user_name)
				.replace('{group_title}', group_title)
				.replace('{GOOGLE_FORM_URL}', GOOGLE_FORM_URL);

	let href = `mailto:${mail_address}`
        + "?subject=" + encodeURIComponent(INVITE_GROUP_TEMPLATE_SUBJECT)
        + "&body=" + encodeURIComponent(body);

	location.assign(href);
}


function _trigger_remove_user_from_group(selected_user_list){

	if(selected_user_list.length === 0){
		alert("Please select user first.");
		return;
	}

	let html = `<table class="vgp-user-input-table panelsearch_nanbyo swal2">
				  <thead>
				    <tr><th>名前</th><th>所属機関・部署</th><tr>
				  </thead>
				  <tbody>`;
	for(let user_id of selected_user_list){
		let user_info = _get_user_info_by_id(user_id);
		html += `<tr>
				   <td class="text-nowrap pr-3">${_escape_group_profile_html(user_info.last_name_nl)} ${_escape_group_profile_html(user_info.first_name_nl)}</td>
				   <td>${_escape_group_profile_html(user_info.affiliation)}</td>
				</tr>`;
	}
	html += '</tbody></table>';

	_show_confirm_dialog('グループから削除しますか?', html,function(){
		_move_user(selected_user_list, URL_DELETE_GROUP_USER, _remove_group_user_from_cache);
	},null);

}

function _move_user(selected_user_list, url, move_user_func){
	let group_id = _get_selected_group_id();
	if(!group_id){
		alert("Please select group first.");
		return;
	}

	let user_ids = selected_user_list.join(",");

	_vgp_show_loading();
	utils_run_submit(
		url,
		{'group_id':group_id, 'user_ids':user_ids},
		function(data){
			move_user_func(group_id, selected_user_list);

			_update_group_list_table_user_cnt(group_id);

			let group_row = _get_selected_group_row();
			$(group_row).trigger("click");

			_vgp_hide_loading();
		},
		function(){
			_vgp_hide_loading();
		}
	);
}

function _init_table_event(){

	$("#group_list_table tbody").on("click", "tr", function() {
		$("#group_list_table tbody tr").removeClass("selected");

		$tr = $(this);
	    $tr.addClass("selected");

		_clear_group_user_list_area();

		let group_id = $tr.data("group_id");
		_add_data_to_not_in_group_user_list_table(group_id);
		_add_data_to_in_group_user_list_table(group_id);

		let group_title = $tr.find("td:first-child").text().trim();
		$("#group_user_list_title").text(group_title).data("orig",group_title).data("group_id",group_id);

		document.getElementById("not_in_group_user_list_table").updateTableState();
		document.getElementById("in_group_user_list_table").updateTableState();

		$.ajax({
			url: URL_GET_GROUP_DISEASE,
			method: "GET",
			dataType: "json",
			data: { group_id: group_id},
			success: function (res) {
				if(res.error){
					alert(res.error);
					return;
				}

				cache_group_disease_list = res.items
				if(typeof _reset_group_disease_list_input === "function") _reset_group_disease_list_input();
				_create_group_disease_table();
				_reset_group_disease_cnt();
			},
			error: function (xhr, status) {
				_show_ajax_error_msg(xhr, status);
			}
		});

		
	});

	_attach_table_checkbox_event('group-table');

	$("#in_group_user_list_table tbody").on('click', 'select', function(e){
		e.stopPropagation();
	});

    $("#not_in_group_user_list_table tbody").on('click', 'div.ctl-wrapper.delete', function(e){
		$(this).parent().remove();
    });

	$("#not_in_group_user_list_table tbody").on('click', 'div.title', function(e){
		$("#not_in_group_user_list_table tbody").find('div.sub').toggleClass('hide');
	});

	$('.group-table').on('click', 'span.vgp-sorter', function(){
		let $sorter   = $(this);

		let sortClass = 'vgp-asc';
		if($sorter.hasClass('vgp-asc')){
			sortClass = 'vgp-dsc';
		}else if($sorter.hasClass('vgp-dsc')){
			sortClass = 'vgp-asc';
		}
		$sorter.closest('tr').find('.vgp-sorter').removeClass('vgp-dsc').removeClass('vgp-asc');
		$sorter.addClass(sortClass);

		_sort_table($sorter.closest('tr'));
		$sorter.closest('table').parent().scrollTop(0);
    });

	document.getElementById('in_group_user_list_table').addEventListener('change', e => {
		if (e.target.classList.contains('user-role-select')) {
			const select = e.target;
			let user_id   = $(select).data("user_id");
			let group_id  = $(select).data("group_id");
			let user_role = select.value;
			_change_group_user_role(group_id,user_id,user_role);
		}
	});

	$('.filter-by-word').on("input", function(){
        _table_filter(this);
    });


	const group_user_tables = document.querySelectorAll('.group-user-table');
	group_user_tables.forEach(table => {
		const theadCheck = table.querySelector('thead .check-all');
		const tbody = table.querySelector('tbody');
		if (!theadCheck || !tbody) return;

		table.addEventListener('click', function (e) {
			const tr = e.target.closest('tr');
			if (!tr || tr.parentNode.tagName !== 'TBODY') return;

			const checkbox = tr.querySelector('.row-check');
			if (!checkbox) return;

			if (e.target.type !== 'checkbox' && !e.target.closest('.checkbox-span')) {
				checkbox.checked = !checkbox.checked;
			}

			updateHeaderState();
		});

        const updateHeaderState = () => {
            const rowChecks = tbody.querySelectorAll('.row-check');
            const total = rowChecks.length;
            const checked = Array.from(rowChecks).filter(c => c.checked).length;
            if (total === 0) {
                theadCheck.checked = false;
                theadCheck.indeterminate = false;
            } else if (checked === 0) {
                theadCheck.checked = false;
                theadCheck.indeterminate = false;
            } else if (checked === total) {
                theadCheck.checked = true;
                theadCheck.indeterminate = false;
            } else {
                theadCheck.checked = false;
                theadCheck.indeterminate = true;
            }
        };
	});
}

function _reset_in_group_user_cnt(cnt){
	$('#in_group_user_cnt').text(cnt);
	if(cnt > 0){
		$('#nav-group-user').text(`メンバー(${cnt})`);
	}else{
		$('#nav-group-user').text('メンバー');
	}
}

function _show_ajax_error_msg(xhr, status){
	let msg = "request error";
	if (xhr.responseJSON) {
		msg = xhr.responseJSON.error || xhr.responseJSON.message || JSON.stringify(xhr.responseJSON);
	}else if (xhr.responseText) {
		msg = xhr.responseText;
	}else if (xhr.status) {
		msg = "HTTP " + xhr.status;
	}
	alert(msg);
}



function _table_filter(filter){

	let $filter            = $(filter);
	let keyword            = utils_trimAllSpaces($filter.val().toLowerCase());
	let regex = new RegExp("(" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");

	let isEmpty            = keyword.length === 0;
	let target_table_id    = $filter.data("table-id");
	let element            = $filter.data("target-element");
	let element_class_list = $filter.data("target-class").split(",");

	let table = document.getElementById(target_table_id);
	let rows = table.querySelectorAll('tbody tr');

	let num = 0;

	rows.forEach((row, index) => {
		if(isEmpty){
			for(let element_class of element_class_list){
				let $target = $(row).find("."+element_class).first();
				let text = $target.text();
				$target.text(text);
			}
			$(row).show();
            num++;
		}else{
			let found = false;
			for(let element_class of element_class_list){
				let text = $(row).find("."+element_class).text();
				if(text.toLowerCase().includes(keyword)){
					//let highlight_text = text.replace(regex, '<mark>$1</mark>');
					//$(row).find("."+element_class).html(highlight_text);
					let $target = $(row).find("."+element_class).empty();
					text.split(regex).forEach((part, index) => {
						$target.append(index % 2 ? $('<mark>').text(part) : document.createTextNode(part));
					});
					found = true;
				}else{
					$(row).find("."+element_class).text(text);
				}
			}

			if(found){
				$(row).show();
                num++;
			}else{
				$(row).hide();
			}
		}
	});

	$('#'+target_table_id).parent().scrollTop(0);

	if(target_table_id === 'not_in_group_user_list_table'){
		let group_title = $('#group_user_list_title').text();
		if(group_title.length > 0 && keyword.length > 0){
			if(num > 0){
				$('#'+target_table_id).parent().removeClass('invite').addClass('table1');
			}else{
				$('#invite_user_name').text(keyword);
				$('#'+target_table_id).parent().removeClass('table1').addClass('invite');
			}
		}else{
			$('#'+target_table_id).parent().removeClass('invite').addClass('table1');
		}
	}
}



//{group_id:{...}}
var cache_group_hash = {};

//{user_id:{...}}
var cache_user_hash  = {};

//{group_id:[{user_id,user_type}]}
var cache_group_user_hash = {};

//{user_id:{group_id:user_type}}
var cache_user_group_hash = {};

var cache_group_disease_list = [];

var GOOGLE_FORM_URL;

function _init_data(google_form_url){

	GOOGLE_FORM_URL = google_form_url;

	fetch(URL_LOAD_DATA)
	.then(res => res.json())
	.then(data => {
		if('error' in data){
			_vgp_hide_loading();
			alert('Error:' + data.error);
			return;
		}

		let group_list_arr  = data.group_list_arr;
		let user_list_arr   = data.user_list_arr;
		let group_user_hash = data.group_user_hash;
		let user_group_hash = data.user_group_hash;

		for(let group of group_list_arr){
			cache_group_hash[group.group_id] = group;
		}

		for(let user of user_list_arr){
			cache_user_hash[user.id] = user;
		}	

		cache_group_user_hash = group_user_hash;

		cache_user_group_hash = user_group_hash;
	
		_vgp_hide_loading();
	});
}

function _add_new_group_to_cache(group_title, group_id){
	cache_group_hash[group_id] = {"group_title": group_title, "group_id": group_id, "num_of_users": 0};
	cache_group_user_hash[group_id] = {}
}
function _remove_group_from_cache(group_id){
    delete cache_group_hash[group_id];
    delete cache_group_user_hash[group_id];
    for(let user_id in cache_user_group_hash){
        delete cache_user_group_hash[user_id][group_id];
    }
}
function _update_group_title_to_cache(changed_text,group_id){
	cache_group_hash[group_id].group_title = changed_text;
}

function _check_if_duplicated_group_title(group_title_in){
	let lowertext = utils_trimAllSpaces(group_title_in.toLowerCase());
	for(let group_id in cache_group_hash){
    	if(cache_group_hash[group_id].group_title.toLowerCase() === lowertext){
			return true;
		}
	}
	return false;
}

function _get_group_users_from_cache(group_id){
	if(group_id in cache_group_user_hash){
		return cache_group_user_hash[group_id];
	}
	return {};
}
function _get_user_info_by_id(user_id){
    return cache_user_hash[user_id];
}
function _get_all_user_from_cache(){
	return cache_user_hash;
}
function _get_all_user_groups_from_cache(){
	return cache_user_group_hash;
}
function _get_all_group_from_cache(){
	return cache_group_hash;
}
function _get_group_user_cnt(group_id){
	return cache_group_hash[group_id].num_of_users;
}
function _remove_group_user_from_cache(group_id, selected_user_list){
	for(let user_id of selected_user_list){
		if(!(group_id in cache_group_user_hash)){
			cache_group_user_hash[group_id] = {}
		}
		delete cache_group_user_hash[group_id][user_id];

		delete cache_user_group_hash[user_id][group_id];
	}

	cache_group_hash[group_id].num_of_users = Object.keys(cache_group_user_hash[group_id]).length;
}
function _add_group_user_to_cache(group_id, selected_user_list){
	for(let user_id of selected_user_list){
		if(!(group_id in cache_group_user_hash)){
			cache_group_user_hash[group_id] = {}
		}
		cache_group_user_hash[group_id][user_id] = 1;

		if(!(user_id in cache_user_group_hash)){
			cache_user_group_hash[user_id] = {}
		}
		cache_user_group_hash[user_id][group_id] = 1;
	}
	cache_group_hash[group_id].num_of_users = Object.keys(cache_group_user_hash[group_id]).length;
}
function _change_group_user_role_to_cache(group_id,user_id,user_role){
	cache_group_user_hash[group_id][user_id] = user_role;
	cache_user_group_hash[user_id][group_id] = user_role;
}
function _add_to_group_disease_cache(item_list){
	cache_group_disease_list.push(...item_list);
}
function _remove_group_disease_from_cache(panel_id){
	cache_group_disease_list = cache_group_disease_list.filter(p => p.panel_id != panel_id);
}
function _if_in_group_disease_cache(panel_id){
	return cache_group_disease_list.some(item => item.panel_id == panel_id);
}


function _clear_group_user_list_area(){

	$("#group_user_list_title").text("");

	$("#not_in_group_user_cnt").text(0);

	_reset_in_group_user_cnt(0);

	$("#in_group_user_filter").val('');
	$("#not_in_group_user_filter").val('');	

	$('#not_in_group_user_list_table_wrapper').removeClass('invite').addClass('table1');
	$('#not_in_group_user_list_table_tbody').empty();

	$('#in_group_user_list_table_tbody').empty();

	$('#group_disease_table_tbody').empty();
	if(typeof _clear_group_disease_list_input === "function") _clear_group_disease_list_input();
	_reset_group_disease_cnt();
}


function _get_selected_group_user_list(table_id){

    let selectedUserIds = [];

    $(`#${table_id} tbody tr:visible`).each(function() {
        let $checkbox = $(this).find('td:first-child input[type="checkbox"]');
        if ($checkbox.is(':checked')) {
            selectedUserIds.push($checkbox.val());
        }
    });

	return selectedUserIds;
}


function _get_not_in_group_user_list(group_id){

	let group_users   = _get_group_users_from_cache(group_id);
	let all_user_hash = _get_all_user_from_cache();

	let not_in_group_user_list = Object.keys(all_user_hash).filter(user_id => !(user_id in group_users));
	
	return not_in_group_user_list;
}

function _create_invite_user_row($tbody){

	let $tr = $(`<tr class="invite-user">`).appendTo($tbody);
	let $td = $(`<td colspan="3" class="invite-user">`).appendTo($tr);
	let $invite_user_wrapper = $('<div>').addClass("wrapper").appendTo($td);
	let $title_line = $('<div>').addClass('title').appendTo($invite_user_wrapper);
	let span_icon_str = `
		<div class="icon">
			<svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M8.80176 0.75C9.7335 0.75 10.6273 1.12045 11.2861 1.7793C11.9449 2.43803 12.3153 3.33113 12.3154 4.2627C12.3154 5.19444 11.945 6.08823 11.2861 6.74707C10.6273 7.40592 9.7335 7.77637 8.80176 7.77637C7.87019 7.77624 6.97709 7.40579 6.31836 6.74707C5.65951 6.08823 5.28906 5.19444 5.28906 4.2627C5.28918 3.33111 5.65962 2.43803 6.31836 1.7793C6.9771 1.12056 7.87018 0.750122 8.80176 0.75Z" stroke="#276749" stroke-width="1.5"/>
				<path d="M8.32895 11.3684H5.48684C4.23055 11.3684 3.02572 11.8675 2.13739 12.7558C1.24906 13.6441 0.75 14.849 0.75 16.1053V17.0526H8.37632M14.9605 10.4211V14.2105M14.9605 14.2105V18M14.9605 14.2105H11.1711M14.9605 14.2105H18.75" stroke="#276749" stroke-width="1.5" stroke-linecap="square"/>
			</svg>
		</div>
	`;
	$(span_icon_str).appendTo($title_line);
	$('<div>').addClass('letter').text("ユーザー招待").appendTo($title_line);

	let $action_wrapper = $('<div>').attr('id','invite_user_action_wrapper')
									.addClass('action-wrapper').addClass('sub').addClass('hide')
									.appendTo($invite_user_wrapper);
	$('<div>').addClass('action').text('+行を追加')
			  .click(function(){
				add_mail_input_line(false);
			  })
			  .appendTo($action_wrapper);
	$('<div>').addClass('divide').text('/').appendTo($action_wrapper);
	let $action_link_copy = $('<button>').attr('id', 'action_link_copy').addClass('action').text('招待リンクのコピー').appendTo($action_wrapper);
	let link_icon_str = `
		<svg width="13" height="13" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M7.00088 3.39026L8.7911 1.60081C9.33586 1.05605 10.0747 0.75 10.8451 0.75C11.2266 0.75 11.6043 0.825136 11.9568 0.971119C12.3092 1.1171 12.6294 1.33107 12.8992 1.60081C13.1689 1.87055 13.3829 2.19078 13.5289 2.54322C13.6749 2.89565 13.75 3.27339 13.75 3.65486C13.75 4.03633 13.6749 4.41407 13.5289 4.7665C13.3829 5.11893 13.1689 5.43916 12.8992 5.7089L11.1097 7.49912M3.39119 7.00072L1.60097 8.79017C1.0561 9.33503 0.75 10.074 0.75 10.8446C0.75 11.6152 1.0561 12.3542 1.60097 12.899C2.14584 13.4439 2.88484 13.75 3.6554 13.75C4.42596 13.75 5.16497 13.4439 5.70983 12.899L7.49928 11.1088M8.78955 5.7089L5.70829 8.79017" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"/>
		</svg>
	`;
	$(link_icon_str).prependTo($action_link_copy);
	$action_link_copy
		.click(function(){
			$(this).tooltip('show');
			if (window.clipboardData && window.clipboardData.setData) {
				window.clipboardData.setData("Text", GOOGLE_FORM_URL);
			} else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
				let textarea = document.createElement("textarea");
				textarea.style = "position: absolute; left: -1000px; top: -1000px";
				textarea.textContent = GOOGLE_FORM_URL;
				document.body.appendChild(textarea);
				try {
					let selection = document.getSelection();
					selection.removeAllRanges();
					let range = document.createRange();
					range.selectNodeContents(textarea);
					selection.addRange(range);
					document.execCommand('copy');
					selection.removeAllRanges();
				}catch (ex) {
					console.warn("Copy to clipboard failed.", ex);
				}finally {
					document.body.removeChild(textarea);
				}
			}
			return false
		})
		.tooltip({'title':'successfully copied', 'trigger':'manual', 'placement':'bottom'})
		.on('mouseleave', function(){$(this).tooltip('hide');});

	let $mail_line_wrapper = add_mail_input_line(true);
	$mail_line_wrapper.addClass('hide');

	let $btn_wrapper = $('<div>').addClass('btn-wrapper').addClass('sub').addClass('hide').appendTo($invite_user_wrapper);
	$('<button>').addClass('invite-user-btn').text('招待する')
		.on('click', function() {
			
			const emails = Array.from(document.querySelectorAll('input.mail'))
				.map(input => utils_trimAllSpaces(input.value))
				.filter(val => val !== '')
				.join(',');

			if(emails.length === 0){
				alert("Please input email to be invited!");
				$('input.mail').get(0).focus();
				return;
			}
			_vgp_show_loading();
			var $btn = $(this);
			if ($btn.prop('disabled')) return;
			$btn.prop('disabled', true);
			setTimeout(function(){
				$btn.prop('disabled', false);
				_vgp_hide_loading();
			}, 3000);
			do_invite_user('',emails);
		}).appendTo($btn_wrapper);
}

function add_mail_input_line(isFirst){
	let $mail_line_wrapper = $('<div>').addClass('mail-wrapper').addClass('sub').insertBefore($('#invite_user_action_wrapper'));
	let $input_wrapper = $('<div>').addClass('input-wrapper').appendTo($mail_line_wrapper);
	$(`<input type="text" class="mail">`).appendTo($input_wrapper);
	let $ctl_wrapper = $('<div>').text(' ').addClass('ctl-wrapper').appendTo($mail_line_wrapper);
	if(!isFirst){
		let icon_str = `
			<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
				<path d="m291-240-51-51 189-189-189-189 51-51 189 189 189-189 51 51-189 189 189 189-51 51-189-189-189 189Z"/>
			</svg>
		`;
		$(icon_str).appendTo($ctl_wrapper);
		$ctl_wrapper.addClass('delete');
	}

	return $mail_line_wrapper;
}


function _add_data_to_not_in_group_user_list_table(group_id){

	let $tbody = $("#not_in_group_user_list_table_tbody");
	_create_invite_user_row($tbody);

	let group_users = _get_group_users_from_cache(group_id);

	let all_user_hash       = _get_all_user_from_cache();
	let all_user_group_hash = _get_all_user_groups_from_cache();
	let all_group_hash      = _get_all_group_from_cache();

	let not_in_group_user_list = _get_not_in_group_user_list(group_id);
	if(not_in_group_user_list.length === 0) return;

	$("#not_in_group_user_cnt").text(not_in_group_user_list.length);

	for(let user_id of not_in_group_user_list){

		let user_info = all_user_hash[user_id];
		let user_groups_str = "";

		if(user_id in all_user_group_hash){
			let tmp = [];
			for(let group_id in all_user_group_hash[user_id]){
				tmp.push(all_group_hash[group_id].group_title);
			}
			user_groups_str = tmp.join(",\n");
		}

		let tr = `
			<tr>
			  <td class="sel">
			    <label class="custom-checkbox">
			      <input type="checkbox" class="row-check not-in-group-users" value="${user_id}" /><span class="checkbox-span"></span>
			    </label>
			  </td>
			  <td >
			    <div class="d-flex flex-column">
			      <span class="name">${_escape_group_profile_html(user_info.last_name_nl)}${_escape_group_profile_html(user_info.first_name_nl)}</span>
				  <span title="${_escape_group_profile_html(user_info.email)}" class="email ellipsis-cell">${_escape_group_profile_html(user_info.email)}</span>
				</div>
			  </td>
			  <td>
                <div class="d-flex flex-column pr-1">
                  <span class="affiliation ellipsis-cell" title="${_escape_group_profile_html(user_info.affiliation)}">${_escape_group_profile_html(user_info.affiliation)}</span>
                  <span>${_escape_group_profile_html(user_info.job_title)}</span>
                </div>
              </td>
			</tr>
		`;
		$(tr).appendTo($tbody);
	}

	_sort_table($("#not_in_group_user_list_table_thead"));
	$('#not_in_group_user_list_table').parent().scrollTop(0);
}

function _reset_group_disease_cnt(){
	let num = $("#group_disease_table_tbody tr").length;
	$("#group_disease_cnt").text(cache_group_disease_list.length);
	if(num === 0){
		$('#nav-group-disease').text('グループの疾患登録');
	}else{
		$('#nav-group-disease').text(`グループの疾患登録(${num})`);
	}
}

function _create_group_disease_table(){

	if(cache_group_disease_list.length === 0) return;
	let $tbody = $("#group_disease_table_tbody").empty();

	for(let disease of cache_group_disease_list){
		let $tr = $('<tr>').appendTo($tbody);
		$('<td>').text(disease.notification_number).appendTo($tr);
		$('<td>').text(disease.panel_name).appendTo($tr);
		if(typeof attach_admin_event === "function") {
			let td_delete_tr = `
			<td class="delete">
				<span class="delete" data-panel_id="${disease.panel_id}">
					<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 29C14.45 29 13.9792 28.8042 13.5875 28.4125C13.1958 28.0208 13 27.55 13 27V14H12V12H17V11H23V12H28V14H27V27C27 27.55 26.8042 28.0208 26.4125 28.4125C26.0208 28.8042 25.55 29 25 29H15ZM25 14H15V27H25V14ZM17 25H19V16H17V25ZM21 25H23V16H21V25Z" fill="#9A9A9A"/></svg>
				</span>
			</td>
			`;
			$(td_delete_tr).appendTo($tr);
		}else{
			$('<td>').appendTo($tr);
		}
	}

    _sort_table($("#group_disease_table_thead"));

    $('#group_disease_table').parent().scrollTop(0);
}

function _add_data_to_in_group_user_list_table(group_id){

    let group_users = _get_group_users_from_cache(group_id);
	if(Object.keys(group_users).length === 0) return;

    let all_user_hash       = _get_all_user_from_cache();
    let all_user_group_hash = _get_all_user_groups_from_cache();
    let all_group_hash      = _get_all_group_from_cache();

	_reset_in_group_user_cnt(Object.keys(group_users).length);

    let $tbody = $("#in_group_user_list_table_tbody");
    for(let user_id in group_users){

        let user_info = all_user_hash[user_id];
		let selected_reviewer = group_users[user_id] == GROUP_USER_ROLE_REVIEWER ? "selected" : "";
		let selected_curator  = group_users[user_id] == GROUP_USER_ROLE_CURATOR ? "selected" : "";
		let tr = `
            <tr>
              <td class="sel">
                <label class="custom-checkbox">
                  <input type="checkbox" class="row-check in-group-users" value=${user_id} /><span class="checkbox-span"></span>
                </label>
              </td>
              <td >
                <div class="d-flex flex-column">
                  <span class="name">${_escape_group_profile_html(user_info.last_name_nl)}${_escape_group_profile_html(user_info.first_name_nl)}</span>
                  <span title="${_escape_group_profile_html(user_info.email)}" class="email ellipsis-cell">${_escape_group_profile_html(user_info.email)}</span>
                </div>
              </td>
              <td class="pr-2">
			    <select data-group_id="${group_id}" data-user_id="${user_id}" class="user-role-select">
			      <option value="${GROUP_USER_ROLE_REVIEWER}" ${selected_reviewer}>Reviewer</option>
				  <option value="${GROUP_USER_ROLE_CURATOR}" ${selected_curator}>Curator</option>
			    </select>
			  </td>
              <td>
                <div class="d-flex flex-column pr-1">
                  <span class="affiliation ellipsis-cell" title="${_escape_group_profile_html(user_info.affiliation)}">${_escape_group_profile_html(user_info.affiliation)}</span>
                  <span>${_escape_group_profile_html(user_info.job_title)}</span>
                </div>
              </td>
            </tr>
        `;
        $(tr).appendTo($tbody);
    }

    _sort_table($("#in_group_user_list_table_thead"));
	$('#in_group_user_list_table').parent().scrollTop(0);
}


function _change_group_user_role(group_id,user_id,user_role){
    _vgp_show_loading();
    utils_run_submit(
        URL_CHANGE_GROUP_USER_ROLE,
        {'group_id':group_id, 'user_id':user_id, 'user_role': user_role},
        function(data){
			_change_group_user_role_to_cache(group_id,user_id,user_role);
            _vgp_hide_loading();
        },
        function(){
            _vgp_hide_loading();
        }
    );
}



function _get_selected_group_row(){
	let selectedRow = document.querySelector('#group_list_table tr.selected');
	return selectedRow;
}

function _get_selected_group_id(){
	let selectedRow = _get_selected_group_row();
	if(selectedRow){
		let group_id = $(selectedRow).data("group_id");
		return group_id;
	}else{
		return selectedRow;
	}
}

function _update_group_list_table_user_cnt(group_id){
	let num = _get_group_user_cnt(group_id) ;

	let table = document.getElementById("group_list_table");
    let rows = table.querySelectorAll('tbody tr');

    rows.forEach((row, index) => {
		if($(row).data("group_id") == group_id){
			$(row).find("td").eq(1).text(num);
		}
	});
}

function _chang_group_list_num(){
	let num = $("#group_list_table tbody tr").length;
	$("#total_group_cnt").text(num);
}


function _sort_table($thead){
	let $sorter = $thead.find('span.vgp-asc, span.vgp-dsc').first();
	let element = $sorter.data('sort-id');
	let method  = $sorter.data('sort-method');
	let tbl_id  = $sorter.closest('table').attr('id');
	let element_class = $sorter.data('target-class');

	let sortClass = $sorter.hasClass("vgp-asc") ? "vgp-asc" : "vgp-dsc";

	let arr = $(`#${tbl_id} tbody tr`).get();
	arr.sort((a,b) => {

		if ($(a).hasClass("invite-user")) return -1; // a 放最上
		if ($(b).hasClass("invite-user")) return 1;  // b 放最上

		let sortNum = 1;
		if(method === 'letter'){
			let a_text = element_class ? $(a).find("."+element_class).text().toLowerCase() : $(a).find("td").eq(element).text().toLowerCase();
			let b_text = element_class ? $(b).find("."+element_class).text().toLowerCase() : $(b).find("td").eq(element).text().toLowerCase();
			sortNum = a_text.localeCompare(b_text, 'ja', {sensitivity: 'base'});
		}else if(method === 'select'){
			let a_num = $(a).find("select").val();
			let b_num = $(b).find("select").val();
            if(a_num === b_num){
                sortNum = 0;
            }else if(a_num > b_num){
                sortNum = 1;
            }else{
                sortNum = -1;
            }
		}else if(method === 'number'){
			let a_num = parseInt($(a).find("td").eq(element).text());
			let b_num = parseInt($(b).find("td").eq(element).text());
			if(a_num === b_num){
				sortNum = 0;
			}else if(a_num > b_num){
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
	$(`#${tbl_id}>tbody`).append(arr);
}
