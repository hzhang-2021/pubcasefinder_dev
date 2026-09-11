
const	CLASS_STEP1='step1',CLASS_STEP2='step2',CLASS_STEP3='step3',
		CLASS_STEP4='step4',CLASS_STEP5='step5',CLASS_STEP6='step6',
		CLASS_STEP_LIST=[CLASS_STEP1,CLASS_STEP2,CLASS_STEP3,CLASS_STEP4,CLASS_STEP5,CLASS_STEP6];

const	ID_INDICATER_LIST_PANEL			      = 'indicater-list-panel',
		ID_TEXT_INPUT_CONTAINER			      = 'text-input-container',
		ID_CONTAINER_INDICATER_TAB_LIST_PANEL = 'content-indicater-tab-list',
		ID_CONTENT_WRAPPER_LIST_PANEL		  = 'content-wrapper-list-panel',
		ID_CONTROL_LIST_PANEL				  = 'control-list-panel',
		WRAPPER_ID_LIST=[	ID_INDICATER_LIST_PANEL, 
							ID_TEXT_INPUT_CONTAINER, 
							ID_CONTAINER_INDICATER_TAB_LIST_PANEL, 
							ID_CONTENT_WRAPPER_LIST_PANEL, 
							ID_CONTROL_LIST_PANEL
						];
const	ID_CONTENT_INDICATER_STEP3='content-indicater-step3',
		ID_CONTENT_INDICATER_STEP4='content-indicater-step4',
		ID_CONTENT_INDICATER_STEP5='content-indicater-step5',
		ID_CONTENT_INDICATER_STEP6='content-indicater-step6',
		CLASS_STATUS_LOADED='loaded',
		ID_CONTENT_INDICATER_LIST=[	ID_CONTENT_INDICATER_STEP3,
									ID_CONTENT_INDICATER_STEP4,
									ID_CONTENT_INDICATER_STEP5,
									ID_CONTENT_INDICATER_STEP6
								];


//const	FILTER_STEP3='HP:0000006',FILTER_STEP4='HP:0000006',FILTER_STEP5='NANDO:1000001',FILTER_STEP6='NANDO:1000001',
const	FILTER_STEP3='',FILTER_STEP4='',FILTER_STEP5='NANDO:1000001',FILTER_STEP6='NANDO:1000001',
		FILTER_LIST=[FILTER_STEP3,FILTER_STEP4,FILTER_STEP5,FILTER_STEP6],
		ID_PCF_CONTENT_STEP3='pcf-content-step3',
		ID_PCF_CONTENT_STEP4='pcf-content-step4',ID_PCF_FILTER_STEP4 ='pcf-filter-step4' ,
		ID_PCF_CONTENT_STEP5='pcf-content-step5',
		ID_PCF_CONTENT_STEP6='pcf-content-step6',ID_PCF_FILTER_STEP6 ='pcf-filter-step6';

const	ID_BTN_GOTO_STEP2='btn_goto_step2',ID_BTN_TRIGGER_PARSE_TEXT='btn_trigger_parse_text',ID_BTN_DOWNLOAD='btn_trigger_download';

var pcf_show_loading = function(){
	if($('#fh5co-loader').css('display') === 'none') $("#fh5co-loader").fadeIn("normal");
	tippy.hideAll();
};

var pcf_hide_loading = function() {
	if($('#fh5co-loader').css('display') === 'none') return;
	$("#fh5co-loader").fadeOut("slow");
};

var pcf_show_alert_dialog = function(jqXHR, textStatus, errorThrown, url_str, retry_data_obj){
	$('.modal-backdrop').remove();
	let $alert_dialog = $("#alert_dialog");
	$('#alertModalLabel').text("Error occured.");
	if(jqXHR.statusText){
		let msgtext = jqXHR.status + ': ' + jqXHR.statusText;
		if(jqXHR.responseText){
			msgtext += '\n' + jqXHR.responseText;
		}
		$('#alert_response_text').text(msgtext);
	}else{
		$('#alert_response_text').text(jqXHR.status + ': ' + jqXHR.responseText);
	}
	$('#alert_url').text(url_str);
	$('#btn_retry').data('RETRY_DATA', retry_data_obj);
	$("#alert_dialog").modal('show');
}

function pcf_show_alert_dialog_msg(title,msg){
	let $alert_dialog = $("#alert_dialog_msg");
	$('#alert_dialog_msg_title').text(title);
	$('#alert_dialog_msg_body').html(msg);
	$alert_dialog.modal('show');
}

function pcf_show_alert_dialog_msg_with_callback(title,msg,callback){
    let $alert_dialog = $("#alert_dialog_msg");
    $('#alert_dialog_msg_title').text(title);
    $('#alert_dialog_msg_body').text(msg);

	$alert_dialog.on('hidden.bs.modal', function (event) {
		callback();
		$(this).off('hidden.bs.modal');
	});

    $alert_dialog.modal('show');
}


$('#alert_dialog').scroll(function (event) {
	event.stopPropagation();
	return false;
});

$('#alert_dialog_msg').scroll(function (event) {
	event.stopPropagation();
	return false;
});

$('#btn_copy_alert_url')
	.tooltip({'title':'URL Copied to clipboard!', 'trigger':'manual', 'placement':'bottom'})
	.on('click', function (e) {
		$(this).tooltip('show');
		let copyTarget = document.getElementById("alert_url");
		copyTarget.select();
		document.execCommand("Copy");
		e.preventDefault();
		e.stopPropagation();
		return false;
	})
	.on('mouseleave', function () {
		$(this).tooltip('hide');
	});

$('#btn_retry').on('click', function (e) {
	$('#btn_alert_close').trigger('click');
	setTimeout(function() {
		let retry_data_obj = $('#btn_retry').data('RETRY_DATA');
		let id_root_container = retry_data_obj.id_root_container;
		$("#"+id_root_container).pcf_content('retry', retry_data_obj);
	}, 100);
});

$('#alert_dialog').on('shown.bs.modal', function () {
	setTimeout(function() {
	   	$('#alert_response_text').trigger('focus');
	}, 10);
});


function _change_input_area_status(isReadOnly){
	//$('#text-input-area').attr('contenteditable',!isReadOnly);
	//$('#hpo-list-input-table').attr('contenteditable',!isReadOnly);
	//$('#hpo-list-input-table').find('input, button').attr('disabled', isReadOnly);
	$('#text-input-container').textinput_hpo('change_input_area_status', isReadOnly);
}

function _change_step_status(class_of_step){
	let class_list_str = CLASS_STEP_LIST.join(' ');
	WRAPPER_ID_LIST.forEach(function(wrapper_id){
		$('#'+wrapper_id).removeClass(class_list_str).addClass(class_of_step);
	});
}

function _init_content_step_status(){
	ID_CONTENT_INDICATER_LIST.forEach(function(id_content_indicater){
		$('#'+id_content_indicater).removeClass(CLASS_STATUS_LOADED);
    });
	$("#"+ID_PCF_FILTER_STEP4).pcf_filter("clear_all_filters");
	$("#"+ID_PCF_FILTER_STEP6).pcf_filter("clear_all_filters");
}

function _set_content_step_status_loaded(id_content_indicater){
	if(_is_content_step_status_loaded(id_content_indicater) === false)
		$('#'+id_content_indicater).addClass(CLASS_STATUS_LOADED);   
}

function _is_content_step_status_loaded(id_content_indicater){
	return $('#'+id_content_indicater).hasClass(CLASS_STATUS_LOADED);
}

$(document).on('keydown', function(e) {
	// ESCAPE key pressed
	if (e.keyCode == 27) {
		tippy.hideAll();
	}
});


$(window).on('resize', function(e) {
	tippy.hideAll();
});


function _complement_download_data(callback){
	pcf_show_loading();

	let uniqueFilterArray = [...new Set(FILTER_LIST)];

	// because all of the 4 pcf-content share the same cache.
	// we can use any one of them to do complete task.
	$("#"+ID_PCF_CONTENT_STEP3).pcf_content('complement_download_data',{
		'filter_list': uniqueFilterArray,
		'after_complement_download_data':callback
	});
}



function doSearch(id_pcf_content_container, id_pcf_filter_container, callback){
	let hpo_id_list =  $('#text-input-container').textinput_hpo("get_url_str");
	let search_option = {
		'phenotype': hpo_id_list.replace(/_ja/gi,''),
		'filter_2':  (id_pcf_filter_container) ? $("#"+id_pcf_filter_container).pcf_filter("get_url_str") : '',
		'callback_once_after_search': (callback) ? callback : null
	};
	$("#"+id_pcf_content_container).pcf_content('search',search_option);
}

function sendShare(id_pcf_content_container){
	setTimeout(function() {
		let hpo_id_list =  $('#text-input-container').textinput_hpo("get_url_str");
		hpo_id_list = hpo_id_list.replace(/_ja/gi,''),
		$("#"+id_pcf_content_container).pcf_content('sendShare',hpo_id_list);
	}, 10);
}


var PRE_DEFINED_ZIP_ID = "";

function _init_priority_i(r_id) {

	PRE_DEFINED_ZIP_ID = r_id;

	$('#'+ID_BTN_TRIGGER_PARSE_TEXT).click(function(){
		// preprocess-check
		let user_input_text = $('#text-input-container').textinput_hpo('get_parsed_text');
		if(!user_input_text){
			pcf_show_alert_dialog_msg_with_callback('','患者の症状または診療録を入力してください!', function(){
				$('#text-input-container').textinput_hpo('set_focus_to_textarea');
			});
			return;
		}

		// do process
		$('#text-input-container').textinput_hpo('trigger_parse_text');
		$('#text-input-container').textinput_hpo('set_focus_to_table');
	});

	$('#'+ID_BTN_DOWNLOAD).click(function(){
		let filename = PRE_DEFINED_ZIP_ID;
		if(!filename) filename = $("#"+ID_PCF_CONTENT_STEP3).pcf_content('getTimeStamp');

		var zip = new JSZip();

		let step1_content = $('#text-input-container').textinput_hpo('get_parsed_text');
		zip.file('step1_'+filename+'.txt',step1_content);

		let step2_content = $('#text-input-container').textinput_hpo('get_download_content_hpo');
		zip.file('step2_'+filename+'.tsv',step2_content);

		[{filename_prefix: 'step3_', id_pcf_content:ID_PCF_CONTENT_STEP3},
             {filename_prefix: 'step4_', id_pcf_content:ID_PCF_CONTENT_STEP4},
             {filename_prefix: 'step5_', id_pcf_content:ID_PCF_CONTENT_STEP5},
             {filename_prefix: 'step6_', id_pcf_content:ID_PCF_CONTENT_STEP6}
        ].forEach(function(obj){
            let download_content_hash = $('#'+obj.id_pcf_content).pcf_content('get_download_content');
            let step_content = "";
            if(download_content_hash.selected_disease_division){
                step_content = '# 疑い疾患領域：' + download_content_hash.selected_disease_division+"\n";
            }else{
				step_content = "# 疑い疾患領域：\n";
			}
            step_content+= download_content_hash.omims.join("\n") + "\n";
            zip.file(obj.filename_prefix + filename+'.tsv',step_content);
        });

        zip.generateAsync({ type: 'blob' }).then(function(content) {
			saveAs(content, filename+'.zip');
		});

        setTimeout(function() {
			pcf_show_alert_dialog_msg('',filename+'.zipファイルのダウンロードが完了しました。ダウンロードファイルを <a href=\"mailto:priority@cmg.med.keio.ac.jp\">priority@cmg.med.keio.ac.jp</a> 宛のメールで提出してください。');
		}, 10);
	});

	$('.control-wrapper button.back').click(function(){
		let $btn = $(this);
		let target_class = $btn.data('target_class');
		if(target_class === CLASS_STEP2){
			if (confirm('STEP3からSTEP6で選択した情報が削除されますがよろしいですか？')) {
				_change_step_status(target_class);
				_init_content_step_status();
				_change_input_area_status(false);
			}
		}else if(target_class === CLASS_STEP1){
			_change_step_status(target_class);
			$('#text-input-container').textinput_hpo('reset_to_before_parse');
		}else{
			_change_step_status(target_class);
		}

	});

    $('.control-wrapper button.next').click(function(){

		let $btn = $(this);
		let id_btn_goto_step     = this.id;
		let id_content_indicater = $btn.data('id-content-indicater');
		let id_pcf_content       = $btn.data('id-content');
		let id_pcf_filter        = $btn.data('id-filter');
		let target_class         = $btn.data('target_class');

		let user_input_text = $('#text-input-container').textinput_hpo('get_parsed_text');
		if(!user_input_text){
			pcf_show_alert_dialog_msg_with_callback('','患者の症状または診療録を入力してください!', function(){
				$('#text-input-container').textinput_hpo('set_focus_to_textarea');
			});
			return;
		}

		if(id_btn_goto_step === ID_BTN_GOTO_STEP2){
			$('#text-input-container').textinput_hpo('trigger_parse_text');
			_change_step_status(target_class);
			$('#text-input-container').textinput_hpo('set_focus_to_table');
			return;
		}else{
			let hpo_id_list =  $('#text-input-container').textinput_hpo("get_url_str");
			if(!hpo_id_list){
				pcf_show_alert_dialog_msg_with_callback('','HPO(症状あり)を選択してください!', function(){
					$('#text-input-container').textinput_hpo('set_focus_to_table');
				});
				return;
			}
			_change_input_area_status(true);
			if(!_is_content_step_status_loaded(id_content_indicater)){
				doSearch(id_pcf_content,id_pcf_filter,function(){
					_change_step_status(target_class);
					_set_content_step_status_loaded(id_content_indicater);
					if(target_class === CLASS_STEP3){
						// send share
						sendShare(id_pcf_content);
					}
				});
			}else{
				_change_step_status(target_class);
			}
			return;
		}
        
    });



	$('#text-input-container').textinput_hpo({'langua:e': 'ja'});
	$('#text-input-container').textinput_hpo('load_dic_if_needed', true);

	[
		{id_pcf_content:ID_PCF_CONTENT_STEP3, filter:FILTER_STEP3, id_pcf_filter:null, on_clear_filter2:null, load_filter2_text:null, on_filter_change:null},
		{id_pcf_content:ID_PCF_CONTENT_STEP4, filter:FILTER_STEP4, id_pcf_filter:ID_PCF_FILTER_STEP4,
         on_clear_filter2:  function(){
			$("#"+ID_PCF_FILTER_STEP4).pcf_filter("clear_all_filters");
			setTimeout(function(){doSearch(ID_PCF_CONTENT_STEP4,ID_PCF_FILTER_STEP4,null);},10);
		 },
         load_filter2_text: function(id_list,lang){
			let text = $("#"+ID_PCF_FILTER_STEP4).pcf_filter("load_filter_list_text",id_list,lang);
			return text;
		 },
         on_filter_change:  function(){
			doSearch(ID_PCF_CONTENT_STEP4,ID_PCF_FILTER_STEP4,null);
		 }
		},
		{id_pcf_content:ID_PCF_CONTENT_STEP5, filter:FILTER_STEP5, id_pcf_filter:null, on_clear_filter2:null, load_filter2_text:null, on_filter_change:null},
		{id_pcf_content:ID_PCF_CONTENT_STEP6, filter:FILTER_STEP6, id_pcf_filter:ID_PCF_FILTER_STEP6,
		 on_clear_filter2:  function(){
			$("#"+ID_PCF_FILTER_STEP6).pcf_filter("clear_all_filters");
			setTimeout(function(){doSearch(ID_PCF_CONTENT_STEP6,ID_PCF_FILTER_STEP6,null);},10);
		 },
		 load_filter2_text: function(id_list,lang){
			let text = $("#"+ID_PCF_FILTER_STEP6).pcf_filter("load_filter_list_text",id_list,lang);
			return text;
		 },
		 on_filter_change:  function(){
			doSearch(ID_PCF_CONTENT_STEP6,ID_PCF_FILTER_STEP6,null);
		 }
		}
	].forEach(function(obj){
		// create pcf-content
		$("#"+obj.id_pcf_content).pcf_content({
			'target':            "omim", 
			'lang':              "ja", 
			'size':              50, 
			'format':            "short", 
			'filter':            obj.filter,
			'on_clear_filter2':  obj.on_clear_filter2,
			'load_filter2_text': obj.load_filter2_text
		});

		if(obj.id_pcf_filter){
			//create pcf-filter
			$("#"+obj.id_pcf_filter).pcf_filter({
				'lang':  "ja",
				'on_filter_change': obj.on_filter_change 
		    });
		}
	});

	$('[data-toggle="tooltip"]').tooltip({'trigger':'hover'});

	$('div[data-tippy-root]').mouseout(function(e){
		 tippy.hideAll();
	});
}

