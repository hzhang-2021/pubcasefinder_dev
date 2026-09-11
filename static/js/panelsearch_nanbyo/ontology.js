const URL_LOAD_ONTOLOGY_DATA = '/panelsearch_nanbyo_get_ontology_data';
const URL_UPLOAD_ONTOLOGY_DATA = '/panelsearch_nanbyo_upload_ontology_data';


function _vgp_init() {

	_attatch_list_table_event();
	_attach_load_db_ttl_btn_event();

	_init_ontology_treeview_db();

	_init_ontology_treeview_file();
	
	_init_ontology_treeview_file_dragdrop();

	_load_inuse_data();
	
}

function _load_inuse_data(){

	let $lastRow = $('#ontology-list-table tbody tr:last');

	_load_db_ttl($lastRow, function(ontology_analysis_result){

		let file_name = $lastRow.find('.filename').text();
		let md5 = $lastRow.find('.md5').text();

		$("#ontology_treeview_wrapper_file").ontology_treeview('set_data_inuse', ontology_analysis_result, file_name, md5);
		$lastRow.addClass('selected');
		_vgp_hide_loading();
	});
}

function _attatch_list_table_event(){
	// ontology-list-table tr clicked event
	$('#ontology-list-table-tableBody').on('click', 'tr', function(e) {
		$('#ontology-list-table-tableBody tr').removeClass('selected');
		let $tr = $(this);
		$tr.addClass('selected');
	});
}

function _attach_load_db_ttl_btn_event(){
	document.getElementById('btn_load_selected_ttl_db').addEventListener('click', function() {

		$("#ontology_treeview_wrapper_db").ontology_treeview('clearContent');
		$('#stats_db').text('⏳ 待機中');
		$('#fileStatus_db').text('📄 ファイル未選択');

		let arr = $('#ontology-list-table-tableBody').find('tr.selected');
		if(arr.length === 0){
			alert('Please Select First!');
			return;
		}
		_load_db_ttl(arr.first(), function(){
			console.log("load ttl from db");
		});
	});
}

function _load_db_ttl($tr, callback){
	_vgp_show_loading();

	let ontology_id = $tr.find('.ontology_id').text();
	let ontology_file_name = $tr.find('.filename').text();
	let md5 = $tr.find('.md5').text();
	let url_str = `${URL_LOAD_ONTOLOGY_DATA}?ontology_id=${ontology_id}`;

	$.ajax({
		url: url_str, type: "GET", async: true, dataType: "json"
	}).done(function(data,textStatus,jqXHR) {

		if('error' in data){
			alert(data.error);
			return;
		}
		const ontology_data = JSON.parse(data.ontology_json);

		const ontology_analysis_result = ontology_analysis(ontology_data);

		const totalValid = Object.keys(ontology_data).length;
		const obsolete_cnt = ontology_analysis_result.obsoleteNodes.length;
		const unused_cnt = ontology_analysis_result.unusedNodes.length;

		$('#fileStatus_db').text('📄 '+ontology_file_name);

		$('#stats_db').text(`🧬 ${totalValid} 有効 · 🚫 ${obsolete_cnt} obsolete · 📦 ${unused_cnt} 未使用`);

		$("#ontology_treeview_wrapper_db").ontology_treeview('set_ontology_data', ontology_analysis_result);

		callback(ontology_analysis_result);

		_vgp_hide_loading();

	}).fail(function(jqXHR, textStatus, errorThrown ) {
		_vgp_hide_loading();
		alert(`Server access error: ${textStatus}: ${errorThrown}\nURL: ${url_str}`);
	});
}

function _init_ontology_treeview_db(){
	$("#ontology_treeview_wrapper_db").ontology_treeview({
		[$.fn.ontology_treeview.KEY_TYPE]: $.fn.ontology_treeview.TYPE_DB,
	});
}

function _init_ontology_treeview_file_dragdrop(){
	const $container = $('#ontology-upload-panel');
	$container.on('dragover', function(e) {
		e.preventDefault();
		//$('#ontology-upload-panel').css('borderColor', '#2c5b8c');
		$('#ontology-upload-panel').css({
			'borderColor': '#2c5b8c',
			'borderWidth': '3px',        // 加粗边框
			'borderStyle': 'solid',
			'backgroundColor': '#f0f7ff', // 添加背景色变化
			'boxShadow': '0 0 20px rgba(44, 91, 140, 0.3)' // 添加阴影
		});		
	});
	$container.on('dragleave', function(e) {
		e.preventDefault();
		//$('#ontology-upload-panel').css('borderColor', '#dce4ec');
		$('#ontology-upload-panel').css({
			'borderColor': '#dce4ec',
			'borderWidth': '0px',
			'borderStyle': 'solid',
			'backgroundColor': 'transparent',
			'boxShadow': 'none'
		});
	});

	$container.on('drop', function(e) {
		e.preventDefault();
		$('#ontology-upload-panel').css({
			'borderColor': '#dce4ec',
			'borderWidth': '0px',
			'borderStyle': 'solid',
			'backgroundColor': 'transparent',
			'boxShadow': 'none'
		});		
		const files = e.originalEvent.dataTransfer.files;
		if (files.length > 0) {
			const file = files[0];
			if (file.name.endsWith('.ttl') || file.name.endsWith('.txt') || file.name.endsWith('.rdf') || file.name.endsWith('.owl')) {

				const input = document.getElementById('ttlFile');
				input.files = files;
				const event = new Event('change', { bubbles: true });
				input.dispatchEvent(event);
				return;

				$("#ontology_treeview_wrapper_file").ontology_treeview('clearContent');
				$('#stats').text('⏳ 待機中');
				$('#fileStatus').text('📄 ファイル未選択');
				$('#btn_upload_ttl').hide();

				//document.getElementById('ttlFile').value = file.name;

				$('#fileStatus')
					.text(`⏳ 読み込み中... (${file.name})`)
					.removeClass('loaded error')
					.addClass('file-status');
				
				$('#stats').text('⏳ 処理中...');

				_loadFileAndRender(file);
			} else {
				alert('TTL ファイル (.ttl, .txt, .rdf) をドロップしてください。');
			}
		}
	});

}

var isLoading = false;

function _init_ontology_treeview_file(){

    document.getElementById('ttlFile').addEventListener('change', function(e) {

   	    const file = e.target.files[0];
        if (!file) return;
	
		_vgp_show_loading();
		console.log("start reading file");

        $("#ontology_treeview_wrapper_file").ontology_treeview('clearContent');
		$('#stats').text('⏳ 待機中');
		$('#fileStatus').text('📄 ファイル未選択');
		$('#btn_upload_ttl').hide();


		$('#fileStatus')
			.text(`⏳ 読み込み中... (${file.name})`)
			.removeClass('loaded error')
			.addClass('file-status');
	
		$('#stats').text('⏳ 処理中...');

		setTimeout(function(){
			_loadFileAndRender(file);
		}, 50);


       	//document.getElementById('ttlFile').value = '';
    });

	$("#ontology_treeview_wrapper_file").ontology_treeview({
		[$.fn.ontology_treeview.KEY_TYPE]: $.fn.ontology_treeview.TYPE_FILE,
		[$.fn.ontology_treeview.KEY_ONCONFIRM_UPLOAD]: function(upload_data) {
			// ここで parsed_class_map を使ってアップロード処理を行う

const json_data = JSON.stringify(upload_data);
/*
const size_bytes = new Blob([json_data]).size;
const size_kb = size_bytes / 1024;
const size_mb = size_bytes / 1024 / 1024;

console.log("POST data size:");
console.log(size_bytes + " bytes");
console.log(size_kb.toFixed(2) + " KB");
console.log(size_mb.toFixed(2) + " MB");
*/			
			_vgp_show_loading();
			$.ajax({
				url: URL_UPLOAD_ONTOLOGY_DATA,
				method: 'POST',
				data: json_data,
				contentType: 'application/json',
				success: function(response) {
					if (response.error) {
						alert("Error uploading ontology data: " + response.error);
						_vgp_hide_loading();
						return;
					}
					_vgp_hide_loading();
					alert("Ontology data uploaded successfully!\n Initialized entities for " + response.new_panels + " new panels\nPlease reload the page to see the updated ontology list.");
					// do page reload
					location.reload();
				},
				error: function(xhr, status, error) {
					_vgp_hide_loading();
					alert("Error uploading ontology data: " + error);
					console.log("Error uploading ontology data:"+error);
				}
			});
			// 例: Ajaxでサーバーに送信するなど
		}
	});
}

function parseTTLWithN3(text) {
	return new Promise((resolve, reject) => {
		try {
			const parser = new N3.Parser({ format: 'text/turtle' });
			const quads = [];
			parser.parse(text, (error, quad, prefixes) => {
				if (error) { reject(error); return; }
				if (prefixes) { /* 必要なら保存 */ }
				if (quad) { quads.push(quad); }
				else { resolve(quads); }
			});
		} catch (e) { reject(e); }
	});
}

//async function calculateMD5(file) {
//    const buffer = await file.arrayBuffer();
//    return SparkMD5.ArrayBuffer.hash(buffer);
//}

async function calculateMD5(file) {
    return new Promise((resolve, reject) => {
        const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
        const chunkSize = 1024 * 1024; // 1MB chunks
        const chunks = Math.ceil(file.size / chunkSize);
        const spark = new SparkMD5.ArrayBuffer();
        let currentChunk = 0;
        
        function loadNext() {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            
            // 使用 setTimeout 让 UI 有机会更新
            setTimeout(() => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    spark.append(e.target.result);
                    currentChunk++;
                    
                    // 更新进度（可选）
                    const progress = (currentChunk / chunks) * 100;
                    
                    if (currentChunk < chunks) {
                        // 继续处理下一块
                        loadNext();
                    } else {
                        resolve(spark.end());
                    }
                };
                reader.onerror = function() {
                    reject(new Error('Failed to read file chunk'));
                };
                reader.readAsArrayBuffer(blobSlice.call(file, start, end));
            }, 0);
        }
        
        loadNext();
    });
}

async function _loadFileAndRender(file) {
	const fileStatus = document.getElementById('fileStatus');
	const statsEl = document.getElementById('stats');
	const emptyMessage = document.getElementById('emptyMessage');
	const progressBar = document.getElementById('progressBar');
	const progressFill = document.getElementById('progressFill');	

	const reader = new FileReader();
	reader.onload = async function(e) {
		try {
			console.log("read file into memory then do ");

			const text = e.target.result;
			progressBar.classList.add('active');
			progressFill.style.width = '30%';
			fileStatus.className = 'file-status';
			
			fileStatus.textContent = `⏳ calculate MD5... (${file.name})`;
			const md5 = await calculateMD5(file);
			progressFill.style.width = '50%';

			fileStatus.textContent = `⏳ パース中... (${file.name})`;
			const quads = await parseTTLWithN3(text);
			progressFill.style.width = '70%';

			ontology_parsed_class_map = extractClassInfo(quads);
			progressFill.style.width = '90%';

			fileStatus.textContent = `✅ 読み込み完了 (${Object.keys(ontology_parsed_class_map).length} 有効クラス)`;
			fileStatus.className = 'file-status loaded';
			statsEl.textContent = `⏳ ツリー構築中...`;

			const ontology_analysis_result = ontology_analysis(ontology_parsed_class_map);
			ontology_analysis_result.filename = file.name;
			ontology_analysis_result.md5 = md5;

			const totalValid = Object.keys(ontology_parsed_class_map).length;
			const obsolete_cnt = ontology_analysis_result.obsoleteNodes.length;
			const unused_cnt = ontology_analysis_result.unusedNodes.length;

			$('#fileStatus').text('📄 '+file.name);
			//$('#fileStatus').text('解析終了');

			$('#stats').text(`🧬 ${totalValid} 有効 · 🚫 ${obsolete_cnt} obsolete · 📦 ${unused_cnt} 未使用`);

			$('#btn_upload_ttl').show();
			
			$("#ontology_treeview_wrapper_file").ontology_treeview('set_ontology_data', ontology_analysis_result, file.name, md5);


			progressFill.style.width = '100%';
			setTimeout(() => {
				progressBar.classList.remove('active');
				progressFill.style.width = '0%';
			}, 500);
			_vgp_hide_loading();
			isLoading = false;
		} catch (err) {
			console.error('パースエラー:', err);
			fileStatus.textContent = '❌ ファイル解析エラー: ' + err.message;
			fileStatus.className = 'file-status error';
			statsEl.textContent = '⚠️ エラー';
			progressBar.classList.remove('active');
			_vgp_hide_loading();
			isLoading = false;
		}
	};
	reader.onerror = function() {
		fileStatus.textContent = '❌ ファイル読み込みエラー';
		fileStatus.className = 'file-status error';
		statsEl.textContent = '⚠️ エラー';
		progressBar.classList.remove('active');
		_vgp_hide_loading();
		isLoading = false;
	};
	setTimeout(() => {
		reader.readAsText(file);
	}, 50);
}
