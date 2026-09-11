(function ($) {

	const 
		SETTINGS_KEY   = 'VGP_OntologyTreeviewInput_Settings',
		OBJECT_KEY     = 'VGP_OntologyTreeviewInput_Object',
		KEY_TYPE       = 'type',
		KEY_DATA_INUSE = 'data_in_use',
		KEY_FILE_INUSE = 'file_in_use',
		KEY_MD5_INUSE  = 'md5_in_use',
		KEY_ONCONFIRM_UPLOAD = 'onConfirmUpload',
		TYPE_DB        = 'type_db',
		TYPE_FILE      = 'type_file';

	const DEFAULT_SETTINGS = {
		[KEY_TYPE]: TYPE_DB,
		[KEY_DATA_INUSE]: null,
		[KEY_FILE_INUSE]: null,
		[KEY_MD5_INUSE]: null,
		[KEY_ONCONFIRM_UPLOAD]: null
	}

	var methods = {
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.OntologyTreeview(this));
			});
		},
		set_ontology_data: function(treeData, filename, md5){
			this.data(OBJECT_KEY).set_ontology_data(treeData, filename, md5);
			return this;
		},
		clearContent: function(){
			this.data(OBJECT_KEY).clearContent();
		},
		set_data_inuse: function(ontology_analysis_result,filename_inuse,md5_inuse){
			this.data(OBJECT_KEY).set_data_inuse(ontology_analysis_result,filename_inuse,md5_inuse);
			return this;
		},
	};
	
	$.fn.ontology_treeview = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};

	$.fn.ontology_treeview.KEY_TYPE  = KEY_TYPE;
	$.fn.ontology_treeview.TYPE_DB   = TYPE_DB;
	$.fn.ontology_treeview.TYPE_FILE = TYPE_FILE;
	$.fn.ontology_treeview.KEY_ONCONFIRM_UPLOAD = KEY_ONCONFIRM_UPLOAD;

	$.OntologyTreeview = function (root_panel) {

		const $container = $(root_panel).addClass("ontology-treeview-container");
		const settings   = $container.data(SETTINGS_KEY);	


		if(settings[KEY_TYPE] === TYPE_FILE){
			let htmlstr =`
				<div class="modal fade" id="confirmationModal" tabindex="-1" role="dialog" aria-labelledby="confirmationModalLabel" aria-hidden="true">
					<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
						<div class="modal-content">
							<div class="modal-header">
								<h4 class="modal-title" id="confirmationModalLabel">Confirm Upload Ontology</h4>
								<button type="button" class="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div class="modal-body">
								<p id="confirmationModalMessage">Are you sure you want to upload this ontology?</p>
								<ul class="list-group" id="confirmationModal-list-group">
									<li class="list-group-item d-flex flex-row">
										<span class="font-weight-bold list-group-item-title">Ontology File</span>
										<span id="confirmationModal-file-name"></span>
									</li>
									<li class="list-group-item d-flex flex-row">
										<span class="font-weight-bold list-group-item-title">MD5 Hash</span>
										<span id="confirmationModal-file-md5"></span>
									</li>
									<li class="list-group-item d-flex flex-row">
										<span class="font-weight-bold list-group-item-title">指定パネル数</span>
										<span id="confirmationModal-specified-panel-count"></span>
									</li>
									<li class="list-group-item d-flex flex-row">
										<span class="font-weight-bold list-group-item-title">未指定パネル数</span>
										<span id="confirmationModal-unspecified-panel-count"></span>
									</li>
									<li class="list-group-item d-flex flex-row">
										<span class="font-weight-bold list-group-item-title">新規追加ノード数</span>
										<span id="confirmationModal-added-count"></span>
									</li>
									<li class="list-group-item d-flex flex-row">
										<span class="font-weight-bold list-group-item-title">削除ノード数</span>
										<span id="confirmationModal-removed-count"></span>
									</li>
									<li class="list-group-item d-flex flex-row">
										<span class="font-weight-bold list-group-item-title">Comment</span>
										<div class="comment-wrapper">
											<textarea class="form-control" id="confirmationModal-comment" rows="5" placeholder="Enter your comment here..."></textarea>
										</div>
									</li>
									<li class="list-group-item d-flex flex-row">
										<div class="alert alert-warning" role="alert" id="confirmationModal-warning">
											Please enter a comment before uploading.
										</div>
									</li>
								</ul>
							</div>
							<div class="modal-footer">
								<button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
								<button type="button" class="btn btn-danger" id="btnConfirmUpload">Upload</button>
							</div>
						</div>
					</div>
				</div>
			`;
			$(htmlstr).appendTo('body');

			$('#btn_upload_ttl').on('click', function() {
				$('#confirmationModal').modal('show');
				$('#confirmationModal-warning').hide();
				$('#btnConfirmUpload').off('click').on('click', function() {

					let comment = $('#confirmationModal-comment').val();
					if(!comment || comment.trim() === ''){
						$('#confirmationModal-warning').show();
						$('#confirmationModal-comment').focus();
						return;
					}

					let parsed_class_map = $('#btnConfirmUpload').data('parsed_class_map');
					let upload_data = {
						new_ontology_classmap: parsed_class_map,
						new_description: $('#confirmationModal-comment').val(),
						new_ontology_file: $('#confirmationModal-file-name').text(),
						new_ontology_file_md5: $('#confirmationModal-file-md5').text()
					};

					if($.isFunction(settings.onConfirmUpload)){
						$('#confirmationModal').modal('hide');
						settings.onConfirmUpload(upload_data);
					}else{
						alert("Error: onConfirmUpload callback is not defined.");
					}

				});
			});
		}



		// パネル関連
		// ===== パネル1: 比較 ===== 
		const ID_COMPAREPANEL	   = `${root_panel.id}_comparePanel`;
		const ID_COMPAREBODY	   = `${root_panel.id}_compareBody`;
		const ID_COMPARETOGGLE	   = `${root_panel.id}_compareToggle`;
		const ID_COMPAREBADGE      = `${root_panel.id}_compareBadge`;
		const ID_COMPARECONTAINER = `${root_panel.id}_compareContainer`;

		let style_hide = (settings[KEY_TYPE] === TYPE_DB) ? 'display:none;' : '';
		let html_comparePanel_str = `
		<div class="panel" id="${ID_COMPAREPANEL}" style="${style_hide}">
			<div class="panel-header" data-target="${ID_COMPAREBODY}">
				<span class="panel-title">
					≷ 現在使用中Ontologyと比較
					<span class="badge badge-tree" id="${ID_COMPAREBADGE}"></span>
				</span>
				<span class="toggle-icon collapsed" id="${ID_COMPARETOGGLE}">▼</span>
			</div>
			<div class="panel-body" id="${ID_COMPAREBODY}" style="display:none;">
				<div id="${ID_COMPARECONTAINER}">
				</div>
			</div>
		</div>		
		`;
		$(html_comparePanel_str).appendTo($container);
		const $comparePanel  = $container.find('#'+ID_COMPAREPANEL);
		const $compareBody   = $container.find('#'+ID_COMPAREBODY);
		const $compareToggle = $container.find('#'+ID_COMPARETOGGLE);
		const $compareBadge  = $container.find('#'+ID_COMPAREBADGE);
		const $compareContainer  = $container.find('#'+ID_COMPARECONTAINER);

		
		// ===== パネル1: ツリービュー ===== 
		const ID_TREEPANEL	   = `${root_panel.id}_treePanel`;
		const ID_TREEBADGE	   = `${root_panel.id}_treeBadge`;
		const ID_TREEBODY	   = `${root_panel.id}_treeBody`;
		const ID_TREETOGGLE	   = `${root_panel.id}_treeToggle`;
		const ID_TREECONTAINER = `${root_panel.id}_treeContainer`;
		const ID_TREEDEMO	   = `${root_panel.id}_treeDemo`;
		const ID_EMPTYMESSAGE  = `${root_panel.id}_emptyMessage`;
		let html_treePanel_str = `
		<div class="panel" id="${ID_TREEPANEL}">
			<div class="panel-header" data-target="${ID_TREEBODY}">
				<span class="panel-title">
					🌳 ツリービュー
					<span class="badge badge-tree" id="${ID_TREEBADGE}">0</span>
				</span>
				<span class="toggle-icon collapsed" id="${ID_TREETOGGLE}">▼</span>
			</div>
			<div class="panel-body" id="${ID_TREEBODY}" style="display:none;">
				<div id="${ID_TREECONTAINER}">
					<ul id="${ID_TREEDEMO}" class="ztree"></ul>
					<div class="empty-message" id="${ID_EMPTYMESSAGE}">
						<span>📂</span>
						TTL ファイルを選択してツリーを生成してください
					</div>
				</div>
			</div>
		</div>		
		`;
		$(html_treePanel_str).appendTo($container);
		const $treePanel  = $container.find('#'+ID_TREEPANEL);
		const $treeBody   = $container.find('#'+ID_TREEBODY);
		const $treeToggle = $container.find('#'+ID_TREETOGGLE);
		const $treeBadge  = $container.find('#'+ID_TREEBADGE);
		const $emptyMessage = $container.find('#'+ID_EMPTYMESSAGE);

		// ===== パネル2: Using ノード一覧 (初期折叠) =====
		const ID_USINGPANEL	   = `${root_panel.id}_usingPanel`;
		const ID_USINGBODY	   = `${root_panel.id}_usingBody`;
		const ID_USINGCOUNT	   = `${root_panel.id}_usingCount`;
		const ID_USINGTOGGLE	   = `${root_panel.id}_usingToggle`;
		const ID_USINGTABLE	   = `${root_panel.id}_usingTable`;
		const ID_USINGTABLEBODY = `${root_panel.id}_usingTableBody`;
		let html_usingPanel_str = `
		<div class="panel" id="${ID_USINGPANEL}">
			<div class="panel-header" data-target="${ID_USINGBODY}">
				<span class="panel-title">
					🟢 使用中ノード一覧
					<span class="badge badge-using" id="${ID_USINGCOUNT}">0</span>
				</span>
				<span class="toggle-icon collapsed" id="${ID_USINGTOGGLE}">▼</span>
			</div>
			<div class="panel-body" id="${ID_USINGBODY}" style="display:none;">
				<div class="table-wrap">
					<table class="data-table" id="${ID_USINGTABLE}">
						<thead><tr><th>ID</th><th>Type</th><th>ラベル (ja)</th><th>ラベル (en)</th></tr></thead>
						<tbody id="${ID_USINGTABLEBODY}"><tr><td colspan="4" class="empty-message-table">使用中ノードはありません</td></tr></tbody>
					</table>
				</div>
			</div>
		</div>		
		`;
		$(html_usingPanel_str).appendTo($container);
		const $usingPanel	  = $container.find('#'+ID_USINGPANEL);
		const $usingBody	  = $container.find('#'+ID_USINGBODY);
		const $usingToggle	  = $container.find('#'+ID_USINGTOGGLE);
		const $usingCount	  = $container.find('#'+ID_USINGCOUNT);
		const $usingTableBody = $container.find('#'+ID_USINGTABLEBODY);


		// ===== パネル2: Obsolete ノード一覧 (初期折叠) =====
		const ID_OBSOLETEPANEL	   = `${root_panel.id}_obsoletePanel`;
		const ID_OBSOLETEBODY	   = `${root_panel.id}_obsoleteBody`;
		const ID_OBSOLETECOUNT	   = `${root_panel.id}_obsoleteCount`;
		const ID_OBSOLETETOGGLE	   = `${root_panel.id}_obsoleteToggle`;
		const ID_OBSOLETETABLE	   = `${root_panel.id}_obsoleteTable`;
		const ID_OBSOLETETABLEBODY = `${root_panel.id}_obsoleteTableBody`;
		let html_obsoletePanel_str = `
		<div class="panel" id="${ID_OBSOLETEPANEL}">
			<div class="panel-header" data-target="${ID_OBSOLETEBODY}">
				<span class="panel-title">
					🚫 Obsolete ノード一覧
					<span class="badge badge-obsolete" id="${ID_OBSOLETECOUNT}">0</span>
				</span>
				<span class="toggle-icon collapsed" id="${ID_OBSOLETETOGGLE}">▼</span>
			</div>
			<div class="panel-body" id="${ID_OBSOLETEBODY}" style="display:none;">
				<div class="table-wrap">
					<table class="data-table" id="${ID_OBSOLETETABLE}">
						<thead><tr><th>ID</th><th>ラベル (ja)</th><th>ラベル (en)</th></tr></thead>
						<tbody id="${ID_OBSOLETETABLEBODY}"><tr><td colspan="3" class="empty-message-table">obsolete ノードはありません</td></tr></tbody>
					</table>
				</div>
			</div>
		</div>		
		`;
		$(html_obsoletePanel_str).appendTo($container);
		const $obsoletePanel	 = $container.find('#'+ID_OBSOLETEPANEL);
		const $obsoleteBody	     = $container.find('#'+ID_OBSOLETEBODY);
		const $obsoleteToggle	 = $container.find('#'+ID_OBSOLETETOGGLE);
		const $obsoleteCount	 = $container.find('#'+ID_OBSOLETECOUNT);
		const $obsoleteTableBody = $container.find('#'+ID_OBSOLETETABLEBODY);

		//===== パネル3: 未使用ノード一覧 (初期折叠) =====
		const ID_UNUSEDPANEL		 = `${root_panel.id}_unusedPanel`;
		const ID_UNUSEDBODY		     = `${root_panel.id}_unusedBody`;
		const ID_UNUSEDCOUNT		 = `${root_panel.id}_unusedCount`;
		const ID_UNUSEDTOGGLE		 = `${root_panel.id}_unusedToggle`;
		const ID_TOTALVALIDNODES	 = `${root_panel.id}_totalValidNodes`;
		const ID_TREEDISPLAYEDNODES  = `${root_panel.id}_treeDisplayedNodes`;
		const ID_UNUSEDTOTAL		 = `${root_panel.id}_unusedTotal`;
		const ID_UNUSEDTABLE		 = `${root_panel.id}_unusedTable`;
		const ID_UNUSEDTABLEBODY	 = `${root_panel.id}_unusedTableBody`;
		let html_unusedPanel_str = `
		<div class="panel" id="${ID_UNUSEDPANEL}">
			<div class="panel-header" data-target="${ID_UNUSEDBODY}">
				<span class="panel-title">
					📦 未使用ノード一覧
					<span class="badge badge-unused" id="${ID_UNUSEDCOUNT}">0</span>
				</span>
				<span class="toggle-icon collapsed" id="${ID_UNUSEDTOGGLE}">▼</span>
			</div>
			<div class="panel-body" id="${ID_UNUSEDBODY}" style="display:none;">
				<div class="table-wrap">
					<table class="data-table" id="${ID_UNUSEDTABLE}">
						<thead><tr><th>ID</th><th>ラベル (ja)</th><th>ラベル (en)</th><th>親の数</th></tr></thead>
						<tbody id="${ID_UNUSEDTABLEBODY}"><tr><td colspan="4" class="empty-message-table">未使用ノードはありません</td></tr></tbody>
					</table>
				</div>
			</div>
		</div>
		`;
		$(html_unusedPanel_str).appendTo($container);
		const $unusedPanel		  = $container.find('#'+ID_UNUSEDPANEL);
		const $unusedBody		  = $container.find('#'+ID_UNUSEDBODY);
		const $unusedToggle	      = $container.find('#'+ID_UNUSEDTOGGLE);
		const $unusedCount		  = $container.find('#'+ID_UNUSEDCOUNT);
		const $unusedTableBody	  = $container.find('#'+ID_UNUSEDTABLEBODY);


		function _clearContent() {
			// zTree をクリア (空のツリーを表示)
			try {
				const emptySetting = {
					view: { showIcon: true, showLine: true },
					data: { simpleData: { enable: false } }
				};
				$.fn.zTree.init($container.find("#treeDemo"), emptySetting, []);
			} catch (e) {
				// 無視
			}

			$compareBadge.text('');
			$compareContainer.empty();
			$compareBody.hide();
			$compareToggle.text('▼').addClass('collapsed');;

			// 空メッセージを表示
			$emptyMessage.show();

			// バッジをリセット
			$treeBadge.text('0');
			$obsoleteCount.text('0');
			$unusedCount.text('0');

			// ツリーパネル: 初期折叠
			$treeBody.hide();
			$treeToggle.text('▼').addClass('collapsed');;

			// 使用中パネル: 初期折叠
			$usingBody.hide();
			$usingToggle.text('▼').addClass('collapsed');

			// Obsolete / 未使用パネル: 初期折叠
			$obsoleteBody.hide();
			$obsoleteToggle.text('▼').addClass('collapsed');

			// unused
			$unusedBody.hide();
			$unusedToggle.text('▼').addClass('collapsed');

			// 使用中テーブルをリセット
			$usingTableBody.html('<tr><td colspan="4" class="empty-message-table">使用中ノードはありません</td></tr>');

			// obsolete テーブルをリセット
			$obsoleteTableBody.html('<tr><td colspan="3" class="empty-message-table">obsolete ノードはありません</td></tr>');

			// 未使用テーブルをリセット
			$unusedTableBody.html('<tr><td colspan="4" class="empty-message-table">未使用ノードはありません</td></tr>');
		}
		
		// クリックイベント
		//$container.find('.panel-header').on('click', function() {
		$container.on('click', '.panel-header', function() {			
			const targetId = $(this).data('target');
			const $body = $container.find('#' + targetId);
			const $toggle = $(this).find('.toggle-icon');

			if ($body.is(':visible')) {
				$body.slideUp(200);
				$toggle.text('▼').addClass('collapsed');
			} else {
				$body.slideDown(200);
				$toggle.text('▲').removeClass('collapsed');
			}
		});

		//setupPanels();

		const treeview_setting = {
			view: { showIcon: true, showLine: true, selectedMulti: false, nameIsHTML: true },
			//data: { simpleData: { enable: false } },
			data: { key: {name: "displayName", title: "nando_id"}   },
			callback: {}
		};

		function utils_create_treeview_data_from_ontology(
			ontology_json_data, lang, is_attach_descendant_cnt, isFirstTimeLoad
		){
			//"nando_id"
			//"panel_id"
			//"descendant_cnt" 
			//"panel_name_en"
			//"panel_name_ja"
			//"children"

			ontology_json_data['isFirstTimeLoad'] = isFirstTimeLoad;

			ontology_json_data['lang']			= lang;

			let name = (lang === 'ja' ) ? ontology_json_data.panel_name_ja : ontology_json_data.panel_name_en;

			if(ontology_json_data.descendant_cnt > 0){
				if(is_attach_descendant_cnt){
					ontology_json_data['displayName'] = `${name} <font class="vgp-treeview-decendant-num">(${ontology_json_data.descendant_cnt})</font>`;
				}else{
					ontology_json_data['displayName'] = name;	
				}
				ontology_json_data['isParent'] = true;
				
				if(Array.isArray(ontology_json_data['children'])){
					for (let child of ontology_json_data['children']){
						utils_create_treeview_data_from_ontology(child, lang, is_attach_descendant_cnt, isFirstTimeLoad);
					}
				}
			}else{
				ontology_json_data['displayName'] = name;
				ontology_json_data['isParent'] = false;
				ontology_json_data['isFirstTimeLoad'] = false;
			}
		}

		function _renderAll(ontology_data, filename, md5){

			$emptyMessage.hide();
			try {
				let copy = JSON.parse(JSON.stringify(ontology_data.treeviewData));
				utils_create_treeview_data_from_ontology(copy, 'ja', true, false)
				copy.open = true;
				copy.children[0].open = true;
				copy.children[1].open = true;
				$.fn.zTree.init($container.find("#"+ID_TREEDEMO), treeview_setting, [copy]);
				//if(settings[KEY_TYPE] === TYPE_DB){
				//	$treePanel.find('.panel-header').trigger('click');
				//}
			} catch (e) {
				console.error('zTree エラー:', e);
				$stats.text('⚠️ ツリー表示エラー');
				if (settings.onError) settings.onError(e);
			}

			const totalValid  = Object.keys(ontology_data.nandoData).length;
			const obsoleteCnt = ontology_data.obsoleteNodes.length;
			const unusedCnt   = ontology_data.unusedNodes.length;
			//$treeBadge.text(totalValid - obsoleteCnt - unusedCnt);
			$treeBadge.text(Object.keys(ontology_data.usedNodes).length);
			if(settings[KEY_TYPE] === TYPE_FILE){
				_renderCompare(ontology_data.usedNodes, filename, md5)
			}

			_renderTables(ontology_data.usedNodes, ontology_data.obsoleteNodes, ontology_data.unusedNodes);
		}

		function _renderTables(usedNodeshash, obsoleteNodes, unusedNodes){

			let usedNodes = Object.values(usedNodeshash);
			if (usedNodes.length > 0) {

				usedNodes.sort((a, b) => {
					if(a.type !== b.type){
						return a.type.localeCompare(b.type);
					}
					return a.id.localeCompare(b.id);
				});

				$usingCount.text(usedNodes.length);
				let html = '';
				for (let node of usedNodes) {
					html += `<tr>
						<td class="id-col">${node.id}</td>
						<td class="type-col">${node.type}</td>
						<td class="label-col">${node.name_ja || '-'}</td>
						<td class="label-col">${node.name_en || '-'}</td>
					</tr>`;
				}
				$usingTableBody.html(html);
			}

			if (obsoleteNodes.length > 0) {
				$obsoleteCount.text(obsoleteNodes.length);
				let html = '';
				for (let node of obsoleteNodes) {
					html += `<tr>
						<td class="id-col">${node.id}</td>
						<td class="label-col">${node.name_ja || '-'}</td>
						<td class="label-col">${node.name_en || '-'}</td>
					</tr>`;
				}
				$obsoleteTableBody.html(html);
			}

			if (unusedNodes.length > 0) {
				$unusedCount.text(unusedNodes.length);
				let html = '';
				for (let node of unusedNodes) {
					html += `<tr>
						<td class="id-col">${node.id}</td>
						<td class="label-col">${node.name_ja || '-'}</td>
						<td class="label-col">${node.name_en || '-'}</td>
						<td class="count-col">${node.parents ? node.parents.length : 0}</td>
					</tr>`;
				}
				$unusedTableBody.html(html);
			}
		}

		function _renderCompare(new_hash, new_filename, new_md5){

			let old_hash     = settings[KEY_DATA_INUSE];
			let old_filename = settings[KEY_FILE_INUSE];
			let old_md5      = settings[KEY_MD5_INUSE];

			let report = compare_used_nodes(old_hash, new_hash);

			if(settings[KEY_TYPE] === TYPE_FILE){
				$('#confirmationModal-added-count').text(report.added.length);
				$('#confirmationModal-removed-count').text(report.removed.length);
			}

			let diff_arr = ['file', 'added', 'removed', 'modified_notification_number','modified_parents','modified_children','modified_name', 'modified_synonym'];
			let diff_title_hash ={
				'file':                        'Ontology File',  
				'added':                       '新規追加', 
				'removed':                     '削除', 
				'modified_notification_number':'告示番号変更',
				'modified_parents':            '親変更',
				'modified_children':           '子変更',
				'modified_name':               '名前の変更', 
				'modified_synonym':            '類語の変更'
			}
			let diff_count_id_hash ={
				'added':                       'diff_added_count', 
				'removed':                     'diff_removed_count', 
				'modified_notification_number':'diff_modified_notification_number_count',
				'modified_parents':            'diff_modified_parents_count',
				'modified_children':           'diff_modified_children_count',
				'modified_name':               'diff_modified_name_count', 
				'modified_synonym':            'diff_modified_synonym_count'
			}

			for(let diff of diff_arr){

				if(diff in report){
					if(report[diff].length === 0) continue;
				}

				let ID_SUBPANEL = `${root_panel.id}_subpanel_${diff}`;
				let ID_SUBPANEL_BODY = `${root_panel.id}_subpanel_body_${diff}`;
				let ID_SUBPANEL_TOGGLE = `${root_panel.id}_subpanel_toggle_${diff}`;
				let ID_SUBPANEL_TABLE  = `${root_panel.id}_subpanel_table_${diff}`;
				let ID_SUBPANEL_TABLE_THEAD  = `${root_panel.id}_subpanel_table_thead_${diff}`;
				let ID_SUBPANEL_TABLE_TBODY  = `${root_panel.id}_subpanel_table_tbody_${diff}`;
				let num_span = '';
				if(diff in diff_count_id_hash){
					num_span = `<span class="badge badge-using" id="${diff_count_id_hash[diff]}">${report[diff].length}</span>`;
				}
				let html_subPanel_str = `
				<div class="panel" id="${ID_SUBPANEL}">
					<div class="panel-header sub" data-target="${ID_SUBPANEL_BODY}">
						<span class="panel-title">
							${diff_title_hash[diff]}
							${num_span}
						</span>
						<span class="toggle-icon collapsed" id="${ID_SUBPANEL_TOGGLE}">▼</span>
					</div>
					<div class="panel-body sub" id="${ID_SUBPANEL_BODY}" style="display:none;">
						<table class="data-table" id="${ID_SUBPANEL_TABLE}">
							<thead id="${ID_SUBPANEL_TABLE_THEAD}"></thead>
							<tbody id="${ID_SUBPANEL_TABLE_TBODY}"></tbody>
						</table>
					</div>
				</div>		
				`;
				$(html_subPanel_str).appendTo($compareContainer);

				let $thead = $compareContainer.find('#'+ID_SUBPANEL_TABLE_THEAD);
				let $tbody = $compareContainer.find('#'+ID_SUBPANEL_TABLE_TBODY);
				if(diff === "file"){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').appendTo($tr_header);
					$('<th>').text('File Name').appendTo($tr_header);
					$('<th>').text('File MD5').appendTo($tr_header);

					let $tr_inuse = $('<tr>').appendTo($tbody);
					$('<td>使用中Ontology</td>').appendTo($tr_inuse);
					$(`<td>${old_filename}</td>`).appendTo($tr_inuse);
					$(`<td>${old_md5}</td>`).appendTo($tr_inuse);

					let $tr_new = $('<tr>').appendTo($tbody);
					$('<td>Ontology From File</td>').appendTo($tr_new);
					$(`<td>${new_filename}</td>`).appendTo($tr_new);
					$(`<td>${new_md5}</td>`).appendTo($tr_new);

					if(old_md5 === new_md5){
						$compareBadge.text('同一');
						if($('#btn_upload_ttl').length){
							$('#btn_upload_ttl').hide();
						}
						return;
					}else{
						$compareBadge.text('異なる');
					}
				}else if(diff === 'added'){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').text('ID').appendTo($tr_header);
					$('<th>').text('Name_ja').appendTo($tr_header);
					$('<th>').text('Name_en').appendTo($tr_header);
					$('<th>').text('Type').appendTo($tr_header);

					report[diff].sort((a, b) => a.id.localeCompare(b.id));
					for(let node of report[diff]){
						let $tr = $('<tr>').appendTo($tbody);
						$('<td>').text(node.id).appendTo($tr);
						$('<td>').text(node.name_ja).appendTo($tr);
						$('<td>').text(node.name_en).appendTo($tr);
						$('<td>').text(node.type).appendTo($tr);
					}
				}else if(diff === 'removed'){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').text('ID').appendTo($tr_header);
					$('<th>').text('Name_ja').appendTo($tr_header);
					$('<th>').text('Name_en').appendTo($tr_header);
					$('<th>').text('Type').appendTo($tr_header);

					report[diff].sort((a, b) => a.id.localeCompare(b.id));
					for(let node of report[diff]){
						let $tr = $('<tr>').appendTo($tbody);
						$('<td>').text(node.id).appendTo($tr);
						$('<td>').text(node.name_ja).appendTo($tr);
						$('<td>').text(node.name_en).appendTo($tr);
						$('<td>').text(node.type).appendTo($tr);
					}
				}else if(diff === 'modified_notification_number'){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').text('ID').appendTo($tr_header);
					$('<th>').text('Name_ja').appendTo($tr_header);
					$('<th>').text('告示番号(inuse)').appendTo($tr_header);
					$('<th>').text('告示番号(new)').appendTo($tr_header);
					$('<th>').text('Type').appendTo($tr_header);

					report[diff].sort();
					for(let id of report[diff]){
						let $tr = $('<tr>').appendTo($tbody);
						$('<td>').text(id).appendTo($tr);
						$('<td>').text(old_hash[id].name_ja).appendTo($tr);
						$('<td>').text(old_hash[id].notification_number).appendTo($tr);
						$('<td>').text(new_hash[id].notification_number).appendTo($tr);
						$('<td>').text(old_hash[id].type).appendTo($tr);
					}
				}else if(diff === 'modified_parents'){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').text('Name').appendTo($tr_header);
					$('<th>').text('parents_inuse').appendTo($tr_header);
					$('<th>').text('parents_new').appendTo($tr_header);
					$('<th>').text('Type_inuse').appendTo($tr_header);
					$('<th>').text('Type_new').appendTo($tr_header);

					report[diff].sort();
					for(let id of report[diff]){
						let $tr = $('<tr>').appendTo($tbody);
						$('<td>').text(old_hash[id].name_ja + '(' + old_hash[id].id + ')').appendTo($tr);

						let parents_arr_old = old_hash[id].parents_inuse.sort().map(pid => old_hash[pid].name_ja);
						$('<td>').html(parents_arr_old.join("<br>")).appendTo($tr);

						let parents_arr_new = new_hash[id].parents_inuse.sort().map(pid => new_hash[pid].name_ja);
						$('<td>').html(parents_arr_new.join("<br>")).appendTo($tr);

						$('<td>').text(old_hash[id].type).appendTo($tr);
						$('<td>').text(new_hash[id].type).appendTo($tr);
					}

				}else if(diff === 'modified_children'){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').text('Name').appendTo($tr_header);
					$('<th>').text('children_removed_inuse').appendTo($tr_header);
					$('<th>').text('children_added_new').appendTo($tr_header);
					$('<th>').text('Type').appendTo($tr_header);

					report[diff].sort();
					for(let id of report[diff]){
						let $tr = $('<tr>').appendTo($tbody);
						
						$('<td>').text(old_hash[id].name_ja + '(' + old_hash[id].id + ')').appendTo($tr);

						let compare_result = compare_array(old_hash[id].children_inuse, new_hash[id].children_inuse);

						let children_arr_old = compare_result.removed.sort().map(cid => old_hash[cid].name_ja);
						$('<td>').html(children_arr_old.join("<br>")).appendTo($tr);

						let children_arr_new = compare_result.added.sort().map(cid => new_hash[cid].name_ja);
						$('<td>').html(children_arr_new.join("<br>")).appendTo($tr);

						$('<td>').text(old_hash[id].type).appendTo($tr);
					}

				}else if(diff === 'modified_name'){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').text('ID').appendTo($tr_header);
					$('<th>').text('Name_ja_inuse').appendTo($tr_header);
					$('<th>').text('Name_ja_new').appendTo($tr_header);
					$('<th>').text('Name_en_inuse').appendTo($tr_header);
					$('<th>').text('Name_en_new').appendTo($tr_header);
					$('<th>').text('Type').appendTo($tr_header);

					report[diff].sort();
					for(let id of report[diff]){
						let $tr = $('<tr>').appendTo($tbody);
						$('<td>').text(old_hash[id].id).appendTo($tr);
						$('<td>').text(old_hash[id].name_ja).appendTo($tr);
						$('<td>').text(new_hash[id].name_ja).appendTo($tr);
						$('<td>').text(old_hash[id].name_en).appendTo($tr);
						$('<td>').text(new_hash[id].name_en).appendTo($tr);
						$('<td>').text(old_hash[id].type).appendTo($tr);
					}

				}else if(diff === 'modified_synonym'){
					let $tr_header = $('<tr>').appendTo($thead);
					$('<th>').text('Name').appendTo($tr_header);
					$('<th>').text('Synonym_ja_inuse').appendTo($tr_header);
					$('<th>').text('Synonym_ja_new').appendTo($tr_header);
					$('<th>').text('Synonym_en_inuse').appendTo($tr_header);
					$('<th>').text('Synonym_en_new').appendTo($tr_header);
					$('<th>').text('Type').appendTo($tr_header);

					report[diff].sort();
					for(let id of report[diff]){
						let $tr = $('<tr>').appendTo($tbody);
						$('<td>').text(old_hash[id].name_ja + '(' + old_hash[id].id + ')').appendTo($tr);
						$('<td>').html(old_hash[id].synonym_ja.sort().join("<br>")).appendTo($tr);
						$('<td>').html(new_hash[id].synonym_ja.sort().join("<br>")).appendTo($tr);
						$('<td>').html(old_hash[id].synonym_en.sort().join("<br>")).appendTo($tr);
						$('<td>').html(new_hash[id].synonym_en.sort().join("<br>")).appendTo($tr);												
						$('<td>').text(old_hash[id].type).appendTo($tr);
					}
				}
			}
		}

		this.clearContent = function(){
			_clearContent();
		}

		this.set_ontology_data=function(ontology_analysis_result, filename, md5){
			if(settings[KEY_TYPE] === TYPE_FILE) {
				$('#confirmationModal-file-name').text(filename);
				$('#confirmationModal-file-md5').text(md5);
				$('#confirmationModal-specified-panel-count').text(ontology_analysis_result.specified_panel_cnt);
				$('#confirmationModal-unspecified-panel-count').text(ontology_analysis_result.unspecified_panel_cnt);
				$('#confirmationModal-specified-added-count').text(0);
				$('#confirmationModal-specified-removed-count').text(0);
				$('#confirmationModal-comment').val('');
				$('#btnConfirmUpload').data('parsed_class_map', ontology_analysis_result.parsed_class_map);
			}

			_renderAll(ontology_analysis_result, filename, md5);
		}

		this.set_data_inuse= function(ontology_analysis_result,filename_inuse,md5_inuse){
			settings[KEY_DATA_INUSE] = ontology_analysis_result.usedNodes;
			settings[KEY_FILE_INUSE] = filename_inuse;
			settings[KEY_MD5_INUSE] = md5_inuse;
		}
	};

})(jQuery);

