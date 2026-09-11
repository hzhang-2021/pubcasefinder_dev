const URL_LOAD_USER              = "/common_admin_load_user";
const URL_MODIFY_USER            = "/common_admin_modify_user";
const URL_CHANGE_USER_STATUS     = "/common_admin_change_user_status";

//{user_id:{...}}
var cache_user_hash  = {};

function _empty_user_cache(){
	cache_user_hash = {};
	$("#total_num").text(0);
}

function _save_user_cache(user_list_arr){
	for(let user of user_list_arr){
		cache_user_hash[user.id] = user;
	}
	$("#total_num").text(user_list_arr.length);
}

function _get_user_hash(){
	return cache_user_hash;
}

function _get_user_info_by_id(user_id){
	return cache_user_hash[user_id];
}


function _init_data(){

	_load_user(
		function(user_list_arr){
			_save_user_cache(user_list_arr);
			_create_user_table();
			_init_event();
			_vgp_hide_loading();
		},
		function(){
			_vgp_hide_loading();
		}
	);
}

function _construct_authentication_url(uid,code){
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port     = window.location.port;
    const serverRoot = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    const url = `${serverRoot}/google-signup-authenticate?service=panelsearch&uid=${uid}&code=${encodeURIComponent(code)}&`;
	return url;
}


function _init_event(){

	//dropdown filter event
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
		do_reload();
	});

	$("#dropdown_filter_group").on("input", function() {
		var filterText = trimAllSpaces($(this).val().toLowerCase());
		let regex = new RegExp("(" + filterText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");

		$(".dropdown-menu.group>.dropdown-items>.dropdown-item-checkbox").each(function() {
			var labelEl = $(this).find("label");
			var labelText = labelEl.text();

			if (labelText.toLowerCase().includes(filterText)) {
				$(this).show();
				if (filterText) {
					//var regex = new RegExp("(" + filterText + ")", "gi");
					labelEl.html(labelText.replace(regex, '<mark>$1</mark>'));
				} else {
					labelEl.text(labelText); // 清除高亮
				}
			} else {
				$(this).hide();
			}
		});
	});

	// input text filter
	_attach_filter_text_event("filter_letter", do_search);

	// Per page size
	$("#dropdown-menu-size").on('click', '.dropdown-item', function (e) {
		let $btn = $(this);
		if($btn.hasClass("selected")) return;
		$("#dropdown-menu-size").find(".selected").removeClass("selected");
		$btn.addClass("selected");
		let num_per_page = $btn.data("num_per_page");
		$("#btn-vgp-size").data("num_per_page",num_per_page).text(num_per_page);
		_create_user_table();
	});


	// user list table action event
	$('#user-table').on('click', 'span.action', function(){
		let $btn      = $(this);
		let user_id   = $btn.data("user_id"); 
		let uid       = $btn.data('uid');
		let action    = $btn.data('action');
		let user_info = _get_user_info_by_id(user_id);
		
		_show_confirm_dialog(
			STATUS_CHANGE_HASH[action].label, 
			` 
				<table class="vgp-user-input-table panelsearch_nanbyo swal2">
				  <tbody>
				    <tr><th>ユーザー</th><td>${user_info.last_name_en} ${user_info.first_name_en}</td></tr>
				    <tr><th class="pr-3">所属機関・部署</th><td>${user_info.affiliation_en}</td></tr>
				    <tr><th>職名</th><td>${user_info.job_title_en}</td>
				    <tr><th>メールアドレス</th><td>${user_info.email}</td></tr>
				  </tbody>
			    </table>
				<br><br><br>
				<span class="warning">一度確認したら取り消すことはできません。</span> 
			`,
			function(){
				_vgp_show_loading();
				fetch(URL_CHANGE_USER_STATUS, {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify({uid: uid, action: action})
				})
				.then(response => response.json())
				.then(data => {
					if (data.error) {
						alert(data.error);
					} else {
						do_reload();
					}
					_vgp_hide_loading();
				})
				.catch(error => {
					_vgp_hide_loading();
					console.log('Error:', error);
					alert('An unexpected error occurred.' + error);
				});
			},
			null
		 );
	});


	// user list table sorting event
    $('#user-table').on('click', 'span.vgp-sorter', function(){
        let $sorter   = $(this);
        let sortClass = 'vgp-asc';
        if($sorter.hasClass('vgp-asc')){
            sortClass = 'vgp-dsc';
        }else if($sorter.hasClass('vgp-dsc')){
            sortClass = 'vgp-asc';
        }
        $sorter.closest('tr').find('.vgp-sorter').removeClass('vgp-dsc').removeClass('vgp-asc');
        $sorter.addClass(sortClass);
		_create_user_table();
    });

	// table user to detail
	$('#user-table').on('click', '.name', function(){
		let $btn   = $(this);
		let user_id = $btn.data("user_id");
		_open_user_detail(user_id);
	});

	_attach_table_checkbox_event('user-table');

	$('#btn_back_to_list').on('click',function(){
		_switch_main_content();	
	});


	$('#user_type_toggle').on('change', function(){
		if(this.checked){
			_set_user_type(USER_TYPE_ADMIN, false);
		}else{
			_set_user_type(USER_TYPE_PUBLIC, false);
		}
	});

	$('#vgp-user-btn-edit').click(() => {
		$('#vgp-user-input-table-wrapper').hide();
		$('#vgp-user-input-input-wrapper').show();
		$('#vgp-user-btn-edit').hide();
		$('#vgp-user-btn-delete').hide();
		$('#vgp-user-btn-save').show();
		$('#vgp-user-btn-cancel').show();
	});

	$('#vgp-user-btn-cancel').click(() => {
		$('#vgp-user-input-table-wrapper').show();
		$('#vgp-user-input-input-wrapper').hide();
		$('#vgp-user-btn-edit').show();
		$('#vgp-user-btn-delete').show();
		$('#vgp-user-btn-save').hide();
		$('#vgp-user-btn-cancel').hide();
	});

	$('#vgp-user-btn-save').click((event) => {
		event.preventDefault(); 
		_do_user_edit_submit();
	});

}

function _create_user_table(){

	let $tableBody = $("#user_table_tbody");
	$tableBody.empty();

	let user_hash = _get_user_hash();
	let user_rows = Object.values(user_hash);
	_sort_table_rows(user_rows);

	let numPerPage = parseInt($('#btn-vgp-size').data('num_per_page'), 10);

	if($('#table-pagination').data('pagination')) $('#table-pagination').pagination('destroy');
	
	$('#table-pagination-desc').empty();
	
	$('#table-pagination').pagination({
		dataSource: user_rows,
		pageSize:   numPerPage,
		callback: function (data, pagination) {
			let $tableBody = $("#user_table_tbody");
			$tableBody.empty();
			data.forEach(item => {
				_create_user_table_row(item, $tableBody);
			});
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


const ACTION_ACCEPT      = 'accept', 
	ACTION_REJECT        = 'reject', 
	ACTION_DELETE        = 'delete', 
	ACTION_EXPIRED_RESET = 'reset_expired',
	ACTION_BLOCK         = 'block',
	ACTION_RESET_ACCEPT  = 're_accept',
	STATUS_CHANGE_HASH={
		[ACTION_ACCEPT]:       {label: 'ユーザーを承認しますか?'},
		[ACTION_REJECT]:       {label: 'ユーザーを拒否しますか?'},
		[ACTION_DELETE]:       {label: 'ユーザーを削除しますか?'},
		[ACTION_EXPIRED_RESET]:{label: '認証メールを再送しますか?'},
		[ACTION_BLOCK]:        {label: 'アカウントを停止しますか？'},
		[ACTION_RESET_ACCEPT]: {label: 'アカウントを再開しますか？'}
	};

const STATUS_OPRATION_HASH = {
    [STATUS_DELETED]        :{'class':'status-deleted',         'label':'削除'},
    [STATUS_DELETED_TO_GO]  :{'class':'status-deleted-to-go',   'label':'削除'},
	[STATUS_BLOCKED]        :{'class':'status-blocked',         'label':'停止', 'actions':[{'name': ACTION_RESET_ACCEPT, 'label': 'アカウントを再開'}]},
	[STATUS_BLOCKED_TO_GO]  :{'class':'status-blocked-to-go',   'label':'停止', 'actions':[{'name': ACTION_RESET_ACCEPT, 'label': 'アカウントを再開'}]},
    [STATUS_REJECTED]       :{'class':'status-rejected',        'label':'拒否', 'actions':[{'name': ACTION_ACCEPT, 'label': 'アカウントを承認'}]},
    [STATUS_REJECTED_TO_GO] :{'class':'status-rejected-to-go',  'label':'拒否', 'actions':[{'name': ACTION_ACCEPT, 'label': 'アカウントを承認'}]},
    [STATUS_CANCELLED]      :{'class':'status-cancelled',       'label':'退会'},
    [STATUS_CANCELLED_TO_GO]:{'class':'status-cancelled-to-go', 'label':'退会'},
    [STATUS_EXPIRED]        :{'class':'status-expired',         'label':'無効', 'label_detail':'認証期限満了', 'actions':[{'name': ACTION_EXPIRED_RESET,'label':'認証メール再発送'}]},
    [STATUS_REGISTED]       :{'class':'status-registed',        'label':'申請', 'label_detail':'メール認証前'},
    [STATUS_EXPIRED_RESET]  :{'class':'status-expired-reset',   'label':'申請', 'label_detail':'メール認証前'},
    [STATUS_AUTHENTICATED]  :{'class':'status-authenticated',   'label':'申請', 'label_detail':'メール認証済', 'actions':[{'name': ACTION_ACCEPT, 'label':'承認'}, {'name': ACTION_REJECT, 'label':'拒否'}]},
    [STATUS_PASSED]         :{'class':'status-passed',          'label':'承認', 'actions':[{'name': ACTION_BLOCK, 'label': 'アカウントを停止'}]},
    [STATUS_PASSED_TO_GO]   :{'class':'status-passed-to-go',    'label':'承認', 'actions':[{'name': ACTION_BLOCK, 'label': 'アカウントを停止'}]}
}

function _create_user_table_row(user, $tbody){

	let keyword = trimAllSpaces($('#filter_letter').val().toLowerCase());

	//let regex = new RegExp(`(${keyword})`, 'g');
	let regex = new RegExp("(" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");

	let $tr = $('<tr>').appendTo($tbody);
	
	let $td_sel = $('<td>').addClass('sel').appendTo($tr);
	let $td_sel_wrapper = $('<label>').addClass('custom-checkbox').appendTo($td_sel);
	$(`<input type="checkbox" class="row-check" value= ${user.id}><span></span>`).appendTo($td_sel_wrapper);
	let $td_person = $('<td>').appendTo($tr);
	let $td_person_wrapper = $('<div>').addClass('d-flex flex-column').appendTo($td_person);
	let name_text = user.last_name_en + ' ' + user.first_name_en;
	let email_text = user.email;
	if(keyword.length > 0){
		let lowerText_name = name_text.toLowerCase();
		if(lowerText_name.includes(keyword.toLowerCase())){
			name_text = name_text.replace(regex, '<mark>$1</mark>');
		}
		if(email_text.toLowerCase().includes(keyword.toLowerCase())){
			email_text = email_text.replace(regex, '<mark>$1</mark>');
		}
	}

	$(`<div class="name" data-user_id="${user.id}">${name_text}</div>`).appendTo($td_person_wrapper);
	$(`<div class="email">${email_text}</div>`).appendTo($td_person_wrapper);


	let $td_job = $('<td>').appendTo($tr);
	let $td_job_wrapper = $('<div>').addClass('d-flex flex-column').appendTo($td_job);
	$(`<div class="affiliation" title="${user.affiliation_en}">${user.affiliation_en}</div>`).appendTo($td_job_wrapper);
	$(`<div>${user.job_title_en}</div>`).appendTo($td_job_wrapper);

	$('<td>').text(user.user_type_name).addClass('type').appendTo($tr);	

	let $td_status = $('<td>').addClass('status').appendTo($tr);
    let $td_status_wrapper = $('<div>').addClass("wrapper").appendTo($td_status);
	// for sorting...
	$('<span>').addClass("user-status").text(user.status).appendTo($td_status_wrapper);
	// status detail
	let status_item = STATUS_OPRATION_HASH[user.status];
	if('actions' in status_item){
		let $ctl_wrapper;
		if('label_detail' in status_item){
			let $sub_wrapper = $('<div>').addClass("sub-wrapper").appendTo($td_status_wrapper);
			$(`<span class="status-tag ${status_item.class}">${status_item.label}</span>`).appendTo($sub_wrapper);

			let $sub_wrapper2 = $('<div>').addClass("d-flex flex-column").appendTo($td_status_wrapper);
			$(`<div>${status_item.label_detail}</div>`).appendTo($sub_wrapper2);
			$ctl_wrapper = $('<div>').appendTo($sub_wrapper2);
		}else{
			$(`<span class="status-tag ${status_item.class}">${status_item.label}</span>`).appendTo($td_status_wrapper);
			$ctl_wrapper = $td_status_wrapper;
		}

		for(let action of status_item.actions){
			$(`<span class="action ${action.name} mr-3" data-user_id="${user.id}" data-uid="${user.uid}" data-action="${action.name}">${action.label}></span>`).appendTo($ctl_wrapper);
		}
	}else{
		$(`<span class="status-tag ${status_item.class}">${status_item.label}</span>`).appendTo($td_status_wrapper);
		if('label_detail' in status_item){
			$(`<span>${status_item.label_detail}</span>`).appendTo($td_status_wrapper);
		}
	}

	let date = new Date(user.created_at);
	let formatted = date.getFullYear() + '/' +
			        String(date.getMonth()+1).padStart(2,'0') + '/' +
					String(date.getDate()).padStart(2,'0');
	$(`<td data-date="${user.created_at}">`).addClass("date").text(formatted).appendTo($tr);


	let $td_ctl = $('<td>').addClass('ctl').appendTo($tr);
/*
	let $span = $('<span>').addClass('delete').addClass('action').attr('data-user_id', user.id).attr('data-uid',user.uid).attr('data-action',ACTION_DELETE);
	let svgNS = "http://www.w3.org/2000/svg";
	let $svg = $(document.createElementNS(svgNS, "svg"))
    .attr({ width: 40, height: 40, viewBox: "0 0 40 40", fill: "none", xmlns: svgNS });
	let $path = $(document.createElementNS(svgNS, "path"))
    .attr("d", "M15 29C14.45 29 13.9792 28.8042 13.5875 28.4125C13.1958 28.0208 13 27.55 13 27V14H12V12H17V11H23V12H28V14H27V27C27 27.55 26.8042 28.0208 26.4125 28.4125C26.0208 28.8042 25.55 29 25 29H15ZM25 14H15V27H25V14ZM17 25H19V16H17V25ZM21 25H23V16H21V25Z")
    .attr("fill", "#9A9A9A");
	$svg.append($path);
	$span.append($svg);
	$td_ctl.append($span);
*/
}


function _sort_table_rows(user_rows){
	let $sorter = $("#user-table thead").find('span.vgp-asc, span.vgp-dsc').first();
	let sortClass  = $sorter.hasClass('vgp-asc') ? 'vgp-asc' : 'vgp-dsc';
	let sortTargetClass = $sorter.data("target-class");  

	user_rows.sort((a,b) => {
		let sortNum = 1;
		if(sortTargetClass === "name"){
			let a_text = a.last_name_nl + a.first_name_nl;
			let b_text = b.last_name_nl + b.first_name_nl;
			sortNum = a_text.localeCompare(b_text, 'ja', {sensitivity: 'base'});
		}else if(sortTargetClass === "user-type"){
			sortNum = a.user_type_name.localeCompare(b.user_type_name);
		}else if(sortTargetClass === "affiliation_en"){
			let a_text = a.affiliation_en;
			let b_text = b.affiliation_en;
			sortNum = a_text.localeCompare(b_text, 'ja', {sensitivity: 'base'});
		}else if(sortTargetClass === "user-status"){
			sortNum = a.status - b.status;
		}else if(sortTargetClass === "date"){
			let a_date = new Date(a.created_at);
			let b_date = new Date(b.created_at);
			if(a_date < b_date){
				sortNum = -1;
			}else if(a_date > b_date){
				sortNum = 1;
			}else{
				sortNum = 0;
			}
		}

		if(sortClass === "vgp-dsc") {
			sortNum *= (-1) ;
		}

		return sortNum;
	});
}

function do_reload(){
	_vgp_show_loading();
	_load_user(
		function(user_list_arr){
        	_save_user_cache(user_list_arr);
            _create_user_table();
			setTimeout(function () { _vgp_hide_loading(); }, 500);
        },
        function(){
			_vgp_hide_loading();
        }
	);

}

var timeout;
function do_search() {
	var v_keep = trimAllSpaces($('#filter_letter').val());
	clearTimeout(timeout);
	timeout = setTimeout(function () {
		_load_user(
			function(user_list_arr){
				let v_current = trimAllSpaces($('#filter_letter').val());
				if(v_keep === v_current){
	                _save_user_cache(user_list_arr);
    	            _create_user_table();
				}
			},
			function(){

			}
		);
	}, 100);
}

function _load_user(callback, callback_fail){

	//clear user cache
	_empty_user_cache();

	let filter_letter = trimAllSpaces($("#filter_letter").val());
    let filter_status_checkedBoxes = document.querySelectorAll('.filter-status:checked');
    let filter_status_values = Array.from(filter_status_checkedBoxes).map(cb => cb.value);
    let filter_status = filter_status_values.join(',');

	_run_submit(
		URL_LOAD_USER,
		{'filter_name':filter_letter, 'filter_email': filter_letter, 'filter_status':filter_status},
		function(data){
			callback(data);
		},
		function(){
			callback_fail();
		}
	);
}


const USER_DETAIL_TABLE_ITEMS = [
	{key_data: "google_id",     td_id: "detail_google_id",         input_id: "i_google_id"},
	{key_data: "user_type",     td_id: "detail_user_type",         input_id: "i_user_type"},
	{key_data: "last_name_nl",  td_id: "detail_last_name_nl",      input_id: "i_last_name_nl"},
	{key_data: "last_name_en",  td_id: "detail_last_name_en",      input_id: "i_last_name_en"},
	{key_data: "first_name_nl", td_id: "detail_first_name_nl",     input_id: "i_first_name_nl"},
	{key_data: "first_name_en", td_id: "detail_first_name_en",     input_id: "i_first_name_en"},
	{key_data: "affiliation_en",td_id: "detail_affiliation_en",    input_id: "i_affiliation_en"},
	{key_data: "affiliation_nl",td_id: "detail_affiliation_nl",    input_id: "i_affiliation_nl"},
	{key_data: "email",         td_id: "detail_email",             input_id: "i_email"},
	{key_data: "job_title_en",  td_id: "detail_job_title_en",      input_id: "i_job_title_en"},
	{key_data: "job_title_nl",  td_id: "detail_job_title_nl",      input_id: "i_job_title_nl"}
];

function _open_user_detail(user_id){
	let user_info = _get_user_info_by_id(user_id);
	$('#originalEmail').val(user_info.google_id);
	for(let item of USER_DETAIL_TABLE_ITEMS){
		if(item.key_data === "user_type"){
			_set_user_type(user_info[item.key_data], true);
		}else{
			$("#"+item.td_id).text(user_info[item.key_data]);
		}
		$("#"+item.input_id).val(user_info[item.key_data]);
	}

	_switch_main_content();
	
	const div1 = document.getElementById('vgp-user-input-input-wrapper');
	if(div1.style.display !== 'none'){
		$('#vgp-user-btn-cancel').trigger('click');
	}
}


function _set_user_type(user_type, is_init){
	let toggle = document.getElementById('user_type_toggle');
	let hidden = document.getElementById('i_user_type');
	let $with  = $("#with_admin");
	let $without  = $("#without_admin");
	let $user_type_status = $('#user_type_status');

	if(user_type == USER_TYPE_ADMIN){
		toggle.checked = true;
		hidden.value = USER_TYPE_ADMIN;
		$with.removeClass('paler').addClass('thicker');
		$without.removeClass('thicker').addClass('paler');
		if(is_init) $user_type_status.text('管理者（権限あり）');
	}else{
		toggle.checked = false;
		hidden.value = USER_TYPE_PUBLIC;
		$with.removeClass('thicker').addClass('paler');
		$without.removeClass('paler').addClass('thicker');
		if(is_init) $user_type_status.text('一般ユーザー（権限なし）');
	}
}


function _isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function _do_user_edit_submit(){
	let service = $('#i_service').val();
	let google_account  = $('#i_google_id').val();
	let first_name_en   = $('#i_first_name_en').val();
	let first_name_nl   = $('#i_first_name_nl').val();
	let last_name_en    = $('#i_last_name_en').val();
	let last_name_nl    = $('#i_last_name_nl').val();
	let affiliation_en  = $('#i_affiliation_en').val();
	let affiliation_nl  = $('#i_affiliation_nl').val();
	let job_title_en    = $('#i_job_title_en').val();
	let job_title_nl    = $('#i_job_title_nl').val();
	let email           = $('#i_email').val();

	let val_lst_array = [
		{id:"i_last_name_en",      val:last_name_en,      check: 'notempty'},
		{id:"i_first_name_en",     val:first_name_en,     check: 'notempty'},
		{id:"i_affiliation_en",    val:affiliation_en,    check: 'notempty'},
		{id:"i_email",             val:email,             check: 'email'},
		{id:"i_job_title_en",      val:job_title_en,      check: 'notempty'}
	];

	let isPassed = true;
	let i=0;
	for(;i<val_lst_array.length;i++){

		if(val_lst_array[i].check === 'notempty'){
			if(val_lst_array[i].val.length === 0){
				isPassed = false;
				break;
			}
		}else if(val_lst_array[i].check === 'email'){
			if(!_isValidEmail(val_lst_array[i].val)){
				isPassed = false;
				break;
			}
		}else{
			//check if positive
			if(val_lst_array[i].val < 1){
				isPassed = false;
				break;
			}
		}
	}

	if(!isPassed){
		$('#'+val_lst_array[i].id).focus();
		return;
	}

	let form = document.getElementById('vgp-user-form');
	let formData = new FormData(form);
	const data = {};
	formData.forEach((value, key) => {
		data[key] = value;
	});

	_vgp_show_loading();

	fetch(URL_MODIFY_USER, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.then(data => {
		if (data.error) {
			alert(data.error);
		} else {
			do_reload();
			$('#vgp-user-btn-cancel').trigger('click');
			$('#btn_back_to_list').trigger('click');
	    }
		_vgp_hide_loading();
	})
	.catch(error => {
		_vgp_hide_loading();
		console.error('Error:', error);
		alert('An unexpected error occurred.' + error);
	});
	
}

