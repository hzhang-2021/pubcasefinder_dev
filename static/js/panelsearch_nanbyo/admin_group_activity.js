const URL_LOAD_DATA = "/panelsearch_nanbyo_admin_load_group_activity";


var cache_activity_log_list = [];
function _init(){

	_load_data_and_create_table();

	utils_attach_auto_search("filter_letter", do_search);

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
			
		_create_activity_table(cache_activity_log_list);
	});

    $("#dropdown-menu-size").on('click', '.dropdown-item', function (e) {
        let $btn = $(this);
        if($btn.hasClass("selected")) return;
        $("#dropdown-menu-size").find(".selected").removeClass("selected");
        $btn.addClass("selected");
        let num_per_page = $btn.data("num_per_page");
        $("#btn-vgp-size").data("num_per_page",num_per_page).text(num_per_page);
        _create_activity_table(cache_activity_log_list);
    });
}

var timeout;
function do_search() {
	var v_keep = utils_trimAllSpaces($('#filter_letter').val());
	clearTimeout(timeout);
	timeout = setTimeout(function () {
		let v_current = utils_trimAllSpaces($('#filter_letter').val());
		if(v_keep === v_current){
			_load_data_and_create_table();
		}
	}, 100);
}

function _load_data_and_create_table(){

	//_vgp_show_loading();

	let filter_text = utils_trimAllSpaces($('#filter_letter').val());

	let url = `${URL_LOAD_DATA}?filter_text=${filter_text}`;
	
    fetch(url).then(res => res.json())
    .then(data => {
        if('error' in data){
            _vgp_hide_loading();
            alert('Error:' + data.error);
            return;
        }

		for(let item of data){
			item.created_at = utils_format_date(item.created_at);
		}
        cache_activity_log_list = data;

        _create_activity_table(data);

        _vgp_hide_loading();
    });
}

function _create_activity_table(activity_log_list){

	$('#total_num').text(activity_log_list.length);

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
			data.forEach(item => {
				_create_table_row(item, $tableBody);
			});
			let totalPage =  Math.ceil(pagination.totalNumber / pagination.pageSize);
			_update_pagination_desc(pagination.pageNumber, totalPage, pagination.totalNumber);
		}
	});
}

const GROUP_ACTIVITY_TBL_COLUMNS = [
	'target_user_name',
	'group_title',
	'user_role_to',
	'activity',
	'admin_user_name'
]

function _create_table_row(activity_log, $tbody){

	let keyword = utils_trimAllSpaces($('#filter_letter').val().toLowerCase());
	let regex = new RegExp("(" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");

	let $tr = $('<tr>').appendTo($tbody);
	for(let col of GROUP_ACTIVITY_TBL_COLUMNS){

		let $td = $('<td>').appendTo($tr);
		if(col === "target_user_name"){
			let $wrapper = $('<div>').addClass('target_user_name_wrapper').appendTo($td);
			if(keyword.length > 0){
				let name_text = activity_log.target_user_name;
				if(name_text.toLowerCase().includes(keyword.toLowerCase())){
					name_text = name_text.replace(regex, '<mark>$1</mark>');
				}
				$(`<div class="target_user_name">${name_text}</div>`).appendTo($wrapper);

				let email_text = activity_log.target_user_email;
				if(email_text.toLowerCase().includes(keyword.toLowerCase())){
					email_text = email_text.replace(regex, '<mark>$1</mark>');
				}
				$(`<div class="target_user_email">${email_text}</div>`).appendTo($wrapper);
			}else{
				$('<div>').addClass("target_user_name").text(activity_log.target_user_name).appendTo($wrapper);
				$('<div>').addClass("target_user_email").text(activity_log.target_user_email).appendTo($wrapper);
			}
		}else if(col === "user_role_to"){
			if(activity_log['user_role_to']){
				$('<span>')
						.addClass('user_role_to')
						.addClass('role-tag')
						.addClass(activity_log.user_role_to)
						.text(utils_capitalizeFirstLetter(activity_log.user_role_to))
						.appendTo($td);
			}else{
				$('<span>').addClass('user_role_to').addClass('empty').text("-").appendTo($td);
			}
		}else if(col === "activity"){
			//let timestamp = utils_format_date(activity_log.created_at);
			$('<span>').addClass('activity').addClass('created_at').addClass('mr-2').text(activity_log.created_at).appendTo($td);

			let activity_str = '';
			if(activity_log.action === 'add'){
				activity_str = `${utils_capitalizeFirstLetter(activity_log.user_role_to)}の役割が付与されました。`;
			}else if(activity_log.action === 'change'){
				activity_str = `${utils_capitalizeFirstLetter(activity_log.user_role_from)} -> ${utils_capitalizeFirstLetter(activity_log.user_role_to)}の役割が変更されました。`;
			}else{
				activity_str = "グループから除外されました。";
			}
			
			$('<span>').addClass('activity').text(activity_str).appendTo($td);
			
		}else{
			$('<div>').addClass(col).text(activity_log[col]).appendTo($td);
		}
	}
}

function _update_pagination_desc(page_no,total_page,total_num){
    if(total_page){
        $('#table-pagination-desc').text(`Page ${page_no} of ${total_page}, total ${total_num} items`);
    }else{
        $('#table-pagination-desc').text(`total ${total_num} items`);
    }
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
