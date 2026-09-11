const URL_ADD_GROUP              = "/panelsearch_nanbyo_admin_group_add_group";
const URL_DELETE_GROUP           = "/panelsearch_nanbyo_admin_group_delete_group";
const URL_UPDATE_GROUP           = "/panelsearch_nanbyo_admin_group_update_group";
const URL_ADD_GROUP_DISEASE      = "/panelsearch_nanbyo_add_group_panel";
const URL_DELETE_GROUP_DISEASE   = "/panelsearch_nanbyo_delete_group_panel";

function attach_admin_event(){

    var textarea = document.getElementById('newGroupName');
	textarea.addEventListener('input', function() {
        this.value = this.value.replace(/\r?\n|\r/g, "");
        autoResizeTextarea(this);
    });

    $('#addGroupToggle').on('click', function() {
        var textarea = document.getElementById('newGroupName');
        textarea.value = '';
        setTimeout(function() {
            autoResizeTextarea(textarea);
        }, 50);

        setTimeout(() => { textarea.focus(); }, 150);
    });

    $('#saveGroupBtn').on('click', function () {
        var value = utils_trimAllSpaces($('#newGroupName').val());
        if(!value) {
            alert('Please enter group name/description.');
            setTimeout(() => {
                $('#newGroupName').focus();
            }, 50);
            return;
        }
        if(_check_if_duplicated_group_title(value)){
            alert('Duplicated Group!.');
            setTimeout(() => {
                $('#newGroupName').focus();
            }, 50);
            return;
        }

        // do ajax
        _create_new_group(value);

        var textarea = document.getElementById('newGroupName');
        textarea.value = '';
        autoResizeTextarea(textarea);

        $('#addGroupToggle').dropdown('toggle');
    });

    $('#closeDropdown').on('click', function () {
        $('#addGroupToggle').dropdown('toggle');
    });


	const editableDiv = document.getElementById('group_user_list_title');
	$('#group_user_list_title_ctl').click(function(){
		if($('#group_user_list_title').text().length > 0){
			$('#group_user_list_title').data("orig", $('#group_user_list_title').text());
			editableDiv.setAttribute('contenteditable', 'true');
			editableDiv.focus();
		}else{
			alert("Please select group first.")
		}
	});

	editableDiv.addEventListener('blur', () => {
		let orig_text = $('#group_user_list_title').data("orig");
		let changed_text = utils_trimAllSpaces($('#group_user_list_title').text());
		if(changed_text === orig_text){
			editableDiv.setAttribute('contenteditable', 'false');
			return;
		}
		if(changed_text.length === 0){
			alert("Group name cannot be empty!");
			$('#group_user_list_title').text(orig_text);
			setTimeout(function () {editableDiv.focus();}, 50);
			return;
		}
		if(_check_if_duplicated_group_title(changed_text)){
			alert("Duplicated Group Name!");
			$('#group_user_list_title').text(orig_text);
			setTimeout(function () {editableDiv.focus();}, 50);
			return;return;
		}
		editableDiv.setAttribute('contenteditable', 'false');
		let group_id = $('#group_user_list_title').data("group_id");
		_vgp_show_loading();
		utils_run_submit(
			URL_UPDATE_GROUP,
			{'group_title':changed_text, 'group_id': group_id},
			function(data){
				_update_group_title_to_cache(changed_text,group_id);
				let group_row = _get_selected_group_row();
				$(group_row).find("td").eq(0).text(changed_text);
				$(group_row).trigger("click");
				_vgp_hide_loading();
			},
			function(){
				$('#group_user_list_title').text(orig_text);
				_vgp_hide_loading();
			}
		);
	});

    $('#group_disease_list').token_typeahead({
        [$.fn.token_typeahead.KEY_URL]:                URL_GET_PANEL_BY_NAME,
        [$.fn.token_typeahead.KEY_ID]:                 'panel_id',
        [$.fn.token_typeahead.KEY_NAME]:               'panel_name',
        [$.fn.token_typeahead.KEY_MAKE_DISPLAY_NAME]:  function(item){
            if(item.notification_number){
                return `${item.panel_name} ( 指定難病 ${item.notification_number} )`;
            }else{
                return item.panel_name
            }
        },
        [$.fn.token_typeahead.KEY_PLACEHOLDER]:        'Start typing...',
        [$.fn.token_typeahead.KEY_HIDDENINPUT]:        "#group_disease_ids",
        [$.fn.token_typeahead.KEY_ISSTATIC]:           false
    });

    $("#group_disease_table tbody").on('click', 'span.delete', function(e){
        e.stopPropagation();
        let $btn = $(this);
        let panel_id = $btn.data("panel_id");
        let $tr = $btn.closest('tr');
        let panel_name = $tr.find("td:nth-child(2)").text();
        html=`<div>${panel_name}</div>`;
        _show_confirm_dialog('グループからこのPanelを削除しますか?', html, function(){
            _add_or_delete_group_panel(panel_id, URL_DELETE_GROUP_DISEASE, function(){
                _remove_group_disease_from_cache(panel_id);
                $tr.remove();
                _reset_group_disease_cnt();
            });
        }, null);
    });

    $('#btn_add_disease_to_group').on('click', function () {

        var $btn = $(this);
        if ($btn.prop('disabled')) return;

        let group_id = _get_selected_group_id();
        if(!group_id){
            alert('Please select group first!');
            return;
        }

        let items = $('#group_disease_list').token_typeahead('getAllItems');
        if(!items || items.length === 0){
            alert('Please input new panel first!');
            return;
        }

        let new_items = items.filter(item =>  !_if_in_group_disease_cache(item.panel_id) );
        if(new_items.length === 0){
            alert('Already in list!');
            return;
        }

        let new_panel_ids = new_items.map(p => p.panel_id).join(',');

        _add_or_delete_group_panel(new_panel_ids, URL_ADD_GROUP_DISEASE, function(){
            _add_to_group_disease_cache(new_items);
            $('#group_disease_list').token_typeahead('resetTokens',[]);
            _create_group_disease_table();
            _reset_group_disease_cnt();
        });
    });

    $("#group_list_table tbody").on('click', 'span.delete', function(e){
        e.stopPropagation();
        let $btn = $(this);
        let group_id = $btn.data("group_id");
        let $tr = $btn.closest('tr');
        let group_title = $tr.find("td:first-child").text();
        html=`<div>${group_title}</div>`;
        _show_confirm_dialog('このグループを削除しますか?', html, function(){
            _delete_group(group_id, $tr)
        }, null);
    });
}

function _delete_group(group_id, $tr){
	_vgp_show_loading();
	utils_run_submit(
		URL_DELETE_GROUP,
		{'group_id':group_id},
		function(data){
			$tr.remove();
			_chang_group_list_num();
			_remove_group_from_cache(group_id);
			if(!_get_selected_group_row()){
				_clear_group_user_list_area();
			}
			//_vgp_hide_loading();
			window.location.reload();
		},
        function(){
            _vgp_hide_loading();
        }
    );
}



function _reset_group_disease_list_input(){
	$('#group_disease_list').token_typeahead('resetTokens',[]);
}

function _clear_group_disease_list_input(){
	$('#group_disease_list').token_typeahead('clear');
}

function _add_or_delete_group_panel(panel_id, url, callback){
    let group_id = _get_selected_group_id();

    $.ajax({
        url: url,
        method: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ group_id: group_id, panel_id: panel_id }),
        success: function (res) {
            if(res.error){
                alert(res.error);
                return;
            }
            callback();
        },
        error: function (xhr, status) {
            _show_ajax_error_msg(xhr, status);
        }
    });
}





function _create_new_group(group_title){
    _vgp_show_loading();
    utils_run_submit(
        URL_ADD_GROUP,
        {'group_title':group_title},
        function(data){
            //_insert_new_group(group_title,data.group_id);
            //_vgp_hide_loading();
			window.location.reload();
        },
        function(){
            _vgp_hide_loading();
        }
    );
}

function _insert_new_group(group_title,group_id){
    let $group_list_table_tbody = $("#group_list_table_tbody");
    // insert new row to group list table
    let new_group_row = `
        <tr data-group_id="${group_id}">
          <td class="group-title">${group_title}</td>
          <td>0</td>
          <td class="delete">
            <span class="delete" data-group_id="${group_id}">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 29C14.45 29 13.9792 28.8042 13.5875 28.4125C13.1958 28.0208 13 27.55 13 27V14H12V12H17V11H23V12H28V14H27V27C27 27.55 26.8042 28.0208 26.4125 28.4125C26.0208 28.8042 25.55 29 25 29H15ZM25 14H15V27H25V14ZM17 25H19V16H17V25ZM21 25H23V16H21V25Z" fill="#9A9A9A"/></svg>
            </span>
          </td>
        </tr>
    `;
    $(new_group_row).appendTo($group_list_table_tbody);

    _chang_group_list_num();
    _add_new_group_to_cache(group_title, group_id);

    // sorting group list table
    _sort_table($("#group_list_table_thead"));

    // do filter
    var group_filter = document.getElementById('group_filter');
    _table_filter(group_filter);

    // find the row and scroll to visiable
    var $targetRow = $("#group_list_table tbody tr").filter(function() {
        return $(this).find("td:first-child").text().trim() === group_title;
    });

    if ($targetRow.length > 0 && $targetRow.is(':visible')) {
        $targetRow[0].scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(function() {$targetRow.trigger("click");}, 200);
    }
}



