const	URL_GET_PANEL_DATA_BY_PANEL_ID            = '/sparqlist/api/pcf_get_panel_data_by_mondo_id',
		URL_GET_PANEL_AUTOREVIEW_GENE_BY_MONDO_ID = '/sparqlist/api/ps_get_autoreview_gene_by_mondo_id?mondo_id=',
		URL_GET_PUBTATOR3_PAPER_COUNT_BY_MONDO_ID = '/sparqlist/api/ps_get_pubtator3_gene_id_paper_count_by_mondo_id?mondo_id=',
		URL_GET_PUBCHEM_PAPER_COUNT_BY_MONDO_ID   = '/sparqlist/api/ps_get_pubchem_gene_id_paper_count_by_mondo_id?mondo_id=',
		URL_DOWNLOAD_PANEL_BY_MONDO_ID            = '/sparqlist/api/pcf_download_panel_by_mondo_id?mondo_id=',
		URL_PANEL_DETAIL                          = '/panel_detail?panel_id=';

const VGP_CUSTOM_PANEL_DEFAULT_NAME = 'Custom panel';

function _update_custom_panel_name(custom_panel_name){
	$('#vgp-panel-name').text(custom_panel_name);
}

function _vgp_init(custom_panel_name, mondo_id_list_str){

	if(custom_panel_name) {
		_update_custom_panel_name(custom_panel_name);
		saveUserCommonPanelListName(custom_panel_name);
	}else{
		let name_in_ls = getUserCommonPanelListName();
		if(name_in_ls) _update_custom_panel_name(name_in_ls);
	}

	if(!mondo_id_list_str){
		_vgp_hide_loading();
		return;
	}

	_vgp_show_loading();

    $('#btn_copy_link').data('mondo_id_list_str',mondo_id_list_str);

	let mondo_id_list = mondo_id_list_str.split(',');

	let init_data = {};
	init_data['panel_data'] = []; 
	init_data['panel_autoreview_gene_data'] = {};
	init_data['pubtator3_paper_cnt_list']   = {};
	init_data['pubchem_paper_cnt_list']     = {};

	let ajax_obj_arr = [];
	ajax_obj_arr.push({
		'type': 'panel_data', 'url': URL_GET_PANEL_DATA_BY_PANEL_ID + '?mondo_id=' + mondo_id_list_str.replace(/MONDO:/g, '')
	})

	mondo_id_list.forEach((mondo_id) => {
		ajax_obj_arr.push({
			'type': 'panel_autoreview_gene_data', 'panel_id': mondo_id, 'url': URL_GET_PANEL_AUTOREVIEW_GENE_BY_MONDO_ID + mondo_id.replace('MONDO:','')
		});
		ajax_obj_arr.push({
			'type': 'pubtator3_paper_cnt_list', 'panel_id': mondo_id,  'url': URL_GET_PUBTATOR3_PAPER_COUNT_BY_MONDO_ID + mondo_id.replace('MONDO:','')
		});
		ajax_obj_arr.push({
			'type': 'pubchem_paper_cnt_list', 'panel_id': mondo_id, 'url': URL_GET_PUBCHEM_PAPER_COUNT_BY_MONDO_ID + mondo_id.replace('MONDO:','')
		});
	});

	let total_cnt = ajax_obj_arr.length;
	let completed_cnt = 0;


	function handle_response(ajax_obj, json_data){
		if(ajax_obj.type === 'panel_data'){
			init_data[ajax_obj.type]    = json_data;
		}else{
			init_data[ajax_obj.type][ajax_obj.panel_id] = json_data;
		}
		completed_cnt++;
		if(completed_cnt === total_cnt){
			_vgp_init_ui_common_panel(init_data.panel_data);
			_vgp_init_ui_panel_entity_common_panel(mondo_id_list, init_data);
			_vgp_init_attach_event_handlers();
			let filter = document.getElementById('vgp-panel-genes-filter');
			_vgp_table_filter(filter);
			_vgp_hide_loading();
		}
	}

	console.log("start download data");
	ajax_obj_arr.forEach((ajax_obj) => {
		_makeAjaxRequest(ajax_obj.url, 
			function(responseData){
				let json_data = JSON.parse(responseData);
				handle_response(ajax_obj, json_data);
			},
			function(){
                let json_data = [];
                if(ajax_obj.type === 'pubtator3_paper_cnt_list' || ajax_obj.type === 'pubchem_paper_cnt_list') {
					handle_response(ajax_obj, []);                   
                }else{
					_vgp_hide_loading();
					alert("ajax error:"+ajax_obj.url);
				}
			}
		);
	});
}

function _vgp_init_ui_common_panel(panel_data){
	clearCommonPanelList();
	let list = [];
	for(let i=0; i< panel_data.length; i++){
		list.push({mondo_id: panel_data[i].mondo_id, name: panel_data[i].name_en, gene_cnt: panel_data[i].count_gene_id});
	}
	addMultiCommonPanelItemToList(list);
}

function _vgp_init_ui_panel_entity_common_panel(mondo_id_list, init_data){

	if(!mondo_id_list) return;

	let $tbody_panel = $('#vgp-panel-table-tbody');

	let panel_list = init_data.panel_data.sort(function(a,b){
		let name_a = (lang==='ja' && 'name_ja' in a) ? a.name_ja : _capitalizeFirstLetter(a.name_en);
		let name_b = (lang==='ja' && 'name_ja' in b) ? b.name_ja : _capitalizeFirstLetter(b.name_en);
		return name_a.localeCompare(name_b);
	});

	$('#btn_download_panel').data('panel_list', panel_list);

	let max_len = 0;

	for(let i=0; i<panel_list.length;i++ ){
		let panel_item = panel_list[i];
		
		let panel_id = panel_item.mondo_id;
		let panel_name = _capitalizeFirstLetter(panel_item.name_en);
		if(lang==='ja' && 'name_ja' in panel_item){
			panel_name = panel_item.name_ja;
		}
		let $tr = $('<tr>').appendTo($tbody_panel);
		let $td = $(`<td colspan="2"></td>`).appendTo($tr);
		let $row_wrapper = $('<div>').addClass('row-wrapper').appendTo($td);
		let $row_upper = $('<div>').addClass('upper-row').appendTo($row_wrapper);

		let $div_with_panel = $('<div>').addClass('width-panel').appendTo($row_upper);
		$(`<a>${panel_name}<svg></svg></a>`).attr('target','_blank').attr('href',`${URL_PANEL_DETAIL}${panel_id}`).appendTo($div_with_panel);
		let $ctl_wrapper = $('<div>').addClass('width-panel-gene').appendTo($row_upper);
		$('<span>').addClass('ctl').text(panel_item.count_gene_id).appendTo($ctl_wrapper);
		$(`<span class="ctl expand material-icons" data-td-id="td-panel-${panel_id.replace("MONDO:",'')}">expand_more</span>`).appendTo($ctl_wrapper);
		let svg = `<svg width="23" height="24" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.0634 3.1875H19.1997H3.79966H1.93597C1.39648 3.1875 0.955078 3.6289 0.955078 4.16839C0.955078 4.70788 1.39648 5.14928 1.93597 5.14928H2.81877V20.206C2.81877 21.8244 4.14298 23.0996 5.7124 23.0996H17.2869C18.8563 23.0996 20.1806 21.8244 20.1806 20.206V5.14928H21.0634C21.6028 5.14928 22.0442 4.70788 22.0442 4.16839C22.0442 3.6289 21.6028 3.1875 21.0634 3.1875ZM18.3169 20.255C18.3169 20.7945 17.8755 21.2359 17.336 21.2359H5.76145C5.22196 21.2359 4.78056 20.7945 4.78056 20.255V5.14928H18.3169V20.255Z" fill="#212529"/><path d="M7.42816 1.96178H15.5696C16.109 1.96178 16.5504 1.52038 16.5504 0.980892C16.5504 0.441401 16.109 0 15.5696 0H7.42816C6.88867 0 6.44727 0.441401 6.44727 0.980892C6.44727 1.52038 6.88867 1.96178 7.42816 1.96178Z" fill="#212529"/><path d="M7.67425 19.4216C8.21374 19.4216 8.65514 18.9802 8.65514 18.4898V7.8471C8.65514 7.30761 8.21374 6.86621 7.67425 6.86621C7.13476 6.86621 6.69336 7.30761 6.69336 7.8471V18.4407C6.69336 18.9802 7.13476 19.4216 7.67425 19.4216Z" fill="#212529"/><path d="M11.5004 19.4216C12.0399 19.4216 12.4813 18.9802 12.4813 18.4898V7.8471C12.4813 7.30761 12.0399 6.86621 11.5004 6.86621C10.9609 6.86621 10.5195 7.30761 10.5195 7.8471V18.4407C10.5195 18.9802 10.9609 19.4216 11.5004 19.4216Z" fill="#212529"/><path d="M15.3266 19.4216C15.8661 19.4216 16.2584 18.9802 16.3075 18.4898V7.8471C16.3075 7.30761 15.8661 6.86621 15.3266 6.86621C14.7871 6.86621 14.3457 7.30761 14.3457 7.8471V18.4407C14.3457 18.9802 14.7871 19.4216 15.3266 19.4216Z" fill="#212529"/></svg>`;
		$(`<span>${svg}<span>`).addClass('ctl delete').data('panel_name', panel_name).data('mondo_id', panel_id).appendTo($ctl_wrapper);

		let $row_lower = $('<div>').addClass('lower-row hidden').attr('id', `td-panel-${panel_id.replace("MONDO:",'')}`).appendTo($row_wrapper);

		let $panel_genes_table = $('<table>').attr('id',`vgp-panel-gene-table-${panel_id.replace("MONDO:",'')}`).addClass('vgp-panel-genes-table').appendTo($row_lower);

		let $thead = $('<thead>').appendTo($panel_genes_table);
		let $tr_head = $('<tr>').appendTo($thead);
		let $th_entity = $(`<th class="width-entity"><span data-sort-id="0" data-sort-method="vgp-sort-method-innerletter" data-sort-inner-target="vgp-panel-gene-name" class="vgp-sorter">Entity</span></th>`).appendTo($tr_head);
		$(`<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.39623 6.45912L11 10.0629L10.0629 11L6.45912 7.39623C5.78616 7.8805 4.97484 8.1761 4.08805 8.1761C1.83019 8.1761 0 6.34591 0 4.08805C0 1.83019 1.83019 0 4.08805 0C6.34591 0 8.1761 1.83019 8.1761 4.08805C8.1761 4.97484 7.8805 5.78616 7.39623 6.45912ZM4.08805 1.25786C2.52201 1.25786 1.25786 2.52201 1.25786 4.08805C1.25786 5.65409 2.52201 6.91824 4.08805 6.91824C5.65409 6.91824 6.91824 5.65409 6.91824 4.08805C6.91824 2.52201 5.65409 1.25786 4.08805 1.25786Z" fill="#697468"></path></svg>`).addClass('ml-2').appendTo($th_entity);
		$(`<th class="width-source-panel"><span data-sort-id="0" data-sort-method="vgp-sort-method-innerletter" data-sort-inner-target="vgp-panel-name" class="vgp-sorter">Source Panel</span></th>`).appendTo($tr_head);
		$(`<th class="width-sources"><span data-sort-id="0" data-sort-method="vgp-sort-method-innernum" data-sort-inner-target="vgp-panel-review-num" class="vgp-sorter">Ratings</span></th>`).appendTo($tr_head);

		let $panel_gene_table_tbody = $('<tbody>').appendTo($panel_genes_table);

		let len = _vgp_init_ui_panel_entity($panel_gene_table_tbody, panel_id,   init_data['panel_autoreview_gene_data'][panel_id], init_data['pubtator3_paper_cnt_list'][panel_id], init_data['pubchem_paper_cnt_list'][panel_id]);

		if(max_len < len) max_len = len;
	}

	_update_panel_entity_name_width(max_len);
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

function _vgp_table_filter(filter){
	let $filter            = $(filter);
	let table_id           = $filter.data('table-id');
	let target_row_class   = '.' + $filter.data('target-row-class');
	let inner_target_class = '.' + $filter.data('sort-inner-target');

	let filterValue = $filter.val().toLowerCase();

	let found_hash = {};
	$('#' + table_id).find(target_row_class).filter(function(){
		let text = $(this).find(inner_target_class).eq(0).text().toLowerCase();
		let hit = text.indexOf(filterValue);
        $(this).toggle(hit > -1);
		if(hit > -1){
			found_hash[text] = 1;
		}
	});

	let num = Object.keys(found_hash).length;
	$('.vgp-panel-genes-num').text(num);
	$(filter).attr('placeholder', `Filter ${num} Genes`)
}


function do_create_download_file(){
	let $btn = $('#btn_download_panel');
	let panel_list = $btn.data('panel_list');

	let data = "";
	for(let i = 0; i < panel_list.length; i++){
		let panel_obj = panel_list[i];

		let download_data = panel_obj['download_data'];
		let download_data_list = download_data.split("\n");

		if(i > 0){
			download_data_list.shift();
		}

		data += download_data_list.join("\n");

	}

	let filename =$('#vgp-panel-name').text();
	_create_download_file(data, `${filename}.txt`);
}


function _vgp_init_attach_event_handlers(){
	$('[data-toggle="tooltip"]').tooltip({'trigger':'hover'});

	$('#vgp-panel-genes-filter').on("input", function(){
		_vgp_table_filter(this);
	});


	$('#btn_download_panel').click(function(){
		let $btn = $(this);

		if($btn.hasClass('loaded')){
			do_create_download_file();
			return;
		}

		let panel_list = $btn.data('panel_list');
		_vgp_show_loading();
		let total_cnt = panel_list.length;
		let completed_cnt = 0;
		panel_list.forEach((panel_obj) => {
			let url = URL_DOWNLOAD_PANEL_BY_MONDO_ID + panel_obj.mondo_id;
			_makeAjaxRequest(url,
				function(responseData){
	
					panel_obj['download_data'] = responseData;

					completed_cnt++;
					if(completed_cnt === total_cnt){
						$btn.addClass('loaded');
						_vgp_hide_loading();
						do_create_download_file();
					}
				},
				function(){
					_vgp_hide_loading();
				}
			);
		});

	});


	$('.vgp-panel-table').on('click', 'span.vgp-summary-controll', function(){
		_vgp_summary_control(this);
	});

	$('.vgp-panel-table').on('click', 'button.vgp-panel-gene-name', function(){
		//_vgp_open_gene_detail(this);
		let href = $(this).find('span').attr('href');
		window.open(href, "_blank");
	});

	$('.vgp-panel-table').on('click', 'span.ctl.delete', function(){
		let $btn = $(this);
		let mondo_id = $btn.data('mondo_id');
		let panel_name = $btn.data('panel_name');
		if(window.confirm(`Really want to delete this panel(${panel_name})?`)){
			deleteCommonPanelItem(mondo_id);
			$btn.closest('tr').remove();
		
			let mondo_id_list_str = $('#btn_copy_link').data('mondo_id_list_str');
			let mondo_id_list = mondo_id_list_str.split(',');
			let mondo_id_list_new = mondo_id_list.filter(function(mondo_id_in_list){
				return mondo_id_in_list !== mondo_id;
			});
			let mondo_id_list_str_new = mondo_id_list_new.join(",");

			$('#btn_copy_link').data('mondo_id_list_str', mondo_id_list_str_new);

			let orig_list = $('#btn_download_panel').data('panel_list');
			let new_list = orig_list.filter(panel => {return panel.mondo_id !== mondo_id});
			$('#btn_download_panel').data('panel_list', new_list);

			let filter = document.getElementById('vgp-panel-genes-filter');
			_vgp_table_filter(filter);

			let custom_panel_name = $('#vgp-panel-name').text();
			const protocol = window.location.protocol;
			const hostname = window.location.hostname;
			const port     = window.location.port;
			const serverRoot = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
            const url = `${serverRoot}/panelsearch_common_panel`;
			let href = url + "?custom_panel_name=" + encodeURIComponent(custom_panel_name) +"&panel_id_list_str=" + encodeURIComponent(mondo_id_list_str_new);
			history.replaceState(null, "", href);
			//window.location.href = href;
		}
	});

	$('.vgp-panel-table').on('click', 'span.ctl.expand', function(){
		let $btn = $(this);
		let td_id = $btn.data("td-id");
		$('#'+td_id).toggleClass('hidden');
		if($btn.text() === 'expand_more'){
			$btn.text('expand_less');
		}else{
			$btn.text('expand_more');
		}
	});

	setTimeout(function () { _attach_panel_gene_name_event(); }, 50);

	$('.vgp-panel-table').on('click', 'span.vgp-sorter', function(){
		_vgp_table_sort(this);
	});

	const editableDiv = document.getElementById('vgp-panel-name');
    $('#vgp-panel-name-ctl').click(function(){
        editableDiv.setAttribute('contenteditable', 'true');
        editableDiv.focus();
    });
	
	editableDiv.addEventListener('blur', () => {
    	editableDiv.setAttribute('contenteditable', 'false');

		let new_name =  $('#vgp-panel-name').text();
		if(new_name && new_name !== VGP_CUSTOM_PANEL_DEFAULT_NAME){
			saveUserCommonPanelListName(new_name);
		}
    });


	$('#btn_copy_link')
        .tooltip({'title':'URL Copied to clipboard!', 'trigger':'manual', 'placement':'bottom'})
		.on('click', function (e) {
			$(this).tooltip('show');
			let mondo_id_list_str = $(this).data('mondo_id_list_str');
			let custom_panel_name = $('#vgp-panel-name').text();
			if(custom_panel_name === VGP_CUSTOM_PANEL_DEFAULT_NAME) custom_panel_name = '';

		    const protocol = window.location.protocol;
		    const hostname = window.location.hostname;
		    const port     = window.location.port;
		    const serverRoot = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
		    const url  = `${serverRoot}/panelsearch_common_panel`;

			let text = url + "?custom_panel_name=" +(custom_panel_name ? encodeURIComponent(custom_panel_name) : '') + 
							 "&panel_id_list_str=" + encodeURIComponent(mondo_id_list_str) +
							 "&lang=" + lang ;
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

}
