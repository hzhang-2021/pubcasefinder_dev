;(function ($) {

	const	URL_GET_ALL_PANEL_ID				= '/panelsearch_get_all_mondo_panel',
			URL_GET_PANEL_ID_BY_PANEL			= '/panelsearch_get_panel_mondo_id_by_name',
			URL_GET_PANEL_ID_BY_GENE			= '/panelsearch_get_panel_mondo_id_by_gene',
			URL_GET_PANEL_DATA_BY_PANEL_ID		= '/sparqlist/api/pcf_get_panel_data_by_mondo_id',
			URL_GET_HPO_DATA_BY_PANEL_ID		= '/sparqlist/api/pcf_get_hpo_data_by_mondo_id',
			URL_GET_HPO_TOOLTIP_DATA_BY_HPO_ID	= '/sparqlist/api/pcf_get_hpo_tooltip_data_by_hpo_id',
			//URL_DOWNLOAD_ALL_PANEL			= '/sparqlist/api/pcf_download_all_panel',
			URL_DOWNLOAD_ALL_PANEL				= '/static/data/panel/all_panel.tsv',
			URL_DOWNLOAD_PANEL					= '/sparqlist/api/pcf_download_panel_by_mondo_id',
			URL_GET_MONDO_ID_BY_HPO_ID			= '/sparqlist/api/ps_get_mondo_id_by_hpo_id';

	const protocol = window.location.protocol;
	const hostname = window.location.hostname;
	const port	 = window.location.port;
	const serverRoot = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
	const URL_GET_GENE_DATA_BY_PANEL_ID = `${serverRoot}/sparqlist/api/pcf_get_gene_by_mondo_id`;


	const	SETTINGS_KEY = 'VGPSettings',	OBJECT_KEY = 'VGPObject',
			LANGUAGE_EN = 'en', LANGUAGE_JA = 'ja',
			SETTINGS_KEY_LANG						= 'language',
			SETTINGS_KEY_SIZE						= 'vgp-size',
			SETTINGS_KEY_ROOT						= 'vgp-root-mondo-id',
			SETTINGS_KEY_TARGET						= 'vgp-target',
			SETTINGS_KEY_FILTER						= 'vgp-filter',
			PHENOTYPE_MODE_UNION = 'union', PHENOTYPE_MODE_INTERSECTION = 'intersection',
			SETTINGS_KEY_FILTER_PHENOTPYE_MODE		= 'vgp-filter-phenotype-mode',
			SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM = 'vgp-filter-phenotype-intersection-num',
			SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST	= 'after_search_idlist',
			SETTINGS_KEY_FUNC_CHECK_CONSISTENCE		= 'check_consistence',
			SETTINGS_KEY_FUNC_AFTER_CHANGE_SORT		= 'after_change_sort',
			SETTINGS_KEY_FUNC_LOAD_CUSTOM_PANEL     = 'load_custom_panel_id_list',
			SETTINGS_KEY_FUNC_ADD_CUSTOM_PANEL      = 'add_custom_panel',
			SETTINGS_KEY_FUNC_DELETE_CUSTOM_PANEL   = 'delete_custom_panel',
			SORT_TARGET_PANEL						= 'panel',
			SORT_TARGET_GENE						= 'gene',
			SETTINGS_KEY_SORT_TARGET				= 'sort-target',
			SORT_DIRECTION_ASC = 'asc',	SORT_DIRECTION_DSC = 'desc',
			SETTINGS_KEY_SORT_DIRECTION				= 'sort-direction',
			CLASS_STATUS_INIT						= 'vgp-status-init',
			CLASS_STATUS_LOADED						= 'vgp-status-loaded',
			CLASS_PANEL_ROW							= 'vgp-panel-row',
			CLASS_PAGENUM_ROW						= 'vgp-pagenum-row',
			CLASS_SORTABLE							= 'vgp-sortable',
			ID_LOADER								= 'vgp-loader',
			ID_CONTENT								= 'vgp-content',
			ID_CONTENT_TITLE						= 'vgp-content-title',
			ID_CONTENT_LIST							= 'vgp-content-list',
			ID_CONTENT_EMPTY						= 'vgp-content-empty',
			TARGET_ALL		 = 'all',
			TARGET_PANEL	 = 'panel',
			TARGET_GENE		 = 'gene'
			TARGET_PHENOTYPE = 'phenotype';

	const URL_HASH_SEARCH = {
		[TARGET_ALL]:		URL_GET_ALL_PANEL_ID,
		[TARGET_PANEL]:		URL_GET_PANEL_ID_BY_PANEL,
		[TARGET_GENE]:		URL_GET_PANEL_ID_BY_GENE,
		[TARGET_PHENOTYPE]: URL_GET_MONDO_ID_BY_HPO_ID
	};
	

	var DEFAULT_SETTINGS = {
		[SETTINGS_KEY_SIZE]:								50,			  
		[SETTINGS_KEY_ROOT]:								'MONDO:0000001',
		[SETTINGS_KEY_TARGET]:								TARGET_PANEL,
		[SETTINGS_KEY_FILTER]:								'',			
		[SETTINGS_KEY_FILTER_PHENOTPYE_MODE]:				PHENOTYPE_MODE_UNION,
		[SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM]:	3,
		[SETTINGS_KEY_LANG]:								LANGUAGE_EN,
		[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST]:			null,
		[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE]:				null,
		[SETTINGS_KEY_FUNC_AFTER_CHANGE_SORT]:				null,
		[SETTINGS_KEY_SORT_TARGET]:							SORT_TARGET_PANEL,
		[SETTINGS_KEY_SORT_DIRECTION]:						SORT_DIRECTION_ASC
	};
	
	var _isFunction = function(value) {	return typeof value === "function";	},
		_isArray = function(value) {return Array.isArray(value);},
		_isDefined = function(value) {return typeof value !== 'undefined';},
		_isEmpty = function(value, allowEmptyString) {
			return (value === null) || (_isDefined(value) === false) || (!allowEmptyString ? value === '' : false) || (_isArray(value) && value.length === 0);
		},
		_parseJson= function(text) {
			var json_data = null;
			try {
				json_data = JSON.parse(text);
			} catch (error) {
				console.log("Error parsing JSON: "+ error.message);
			}
			return json_data;
		},
		_capitalizeFirstLetter = function(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		};
		
	var methods = {
		
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.VisualGenePanelList(this));
			});
		},
		search_panels: function(options){
			let old_settings = this.data(SETTINGS_KEY);
			let settings = $.extend(true,{}, old_settings, options || {});
			$(this).data(SETTINGS_KEY, settings);
			this.data(OBJECT_KEY).search_panels();
			return this;
		},
		get_sort_status: function(){
			let settings = this.data(SETTINGS_KEY);
			let obj = {
			  [SETTINGS_KEY_SORT_TARGET]:	settings[SETTINGS_KEY_SORT_TARGET],
			  [SETTINGS_KEY_SORT_DIRECTION]:settings[SETTINGS_KEY_SORT_DIRECTION]
			}
			return obj;
		},
		download_all_panels: function(){
			this.data(OBJECT_KEY).download_all_panels();
			return this;
		},
		get_selected: function(){
			return this.data(OBJECT_KEY).get_selected();
		},
		update_common_panel: function(){
			return this.data(OBJECT_KEY).update_common_panel();
		}
	};
	
	$.fn.visual_gene_panel_list = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};
	
	$.VisualGenePanelList = function (root_panel) {

		var $root_panel = $(root_panel);

		var init_settings = $root_panel.data(SETTINGS_KEY);	

		var search_idlist_cache = {
			[TARGET_ALL]:		{},
			[TARGET_PANEL]:		{},
			[TARGET_GENE]:		{},
			[TARGET_PHENOTYPE]: {}
		};

		function _construct_cache_key(settings){
			let cache_key = '';
			if(_isEmpty(settings[SETTINGS_KEY_FILTER]) === false){
				cache_key = 'input_text=' +settings[SETTINGS_KEY_FILTER]+'&';
				cache_key = cache_key + 'lang=' + settings[SETTINGS_KEY_LANG]+'&';
			}
			cache_key = cache_key + 'root_mondo_id=' + settings[SETTINGS_KEY_ROOT]+'&'
								  + 'sort=' + settings[SETTINGS_KEY_SORT_TARGET]+'&'
								  + 'dir=' + settings[SETTINGS_KEY_SORT_DIRECTION]+'&';
			return cache_key;
		}

		function _construct_cache_key_phenotype_all(settings){
			let empty_settings = $.extend(true,{}, settings, {[SETTINGS_KEY_FILTER]:''});
			let cache_key_all = _construct_cache_key(empty_settings);
			return cache_key_all;
		}

		function _construct_cache_key_phenotype_phenotype(settings){
			//let hpo_id_list_str = settings[SETTINGS_KEY_FILTER].replaceAll('HP:','').replaceAll('_ja','').replaceAll(',','+');
			let hpo_id_list = settings[SETTINGS_KEY_FILTER].split(",");
			let hpo_id_list_str = hpo_id_list.sort().join(",").replaceAll('HP:','').replaceAll('_ja','').replaceAll(',','+');
			let cache_key_phenotype = '';
			if(settings[SETTINGS_KEY_FILTER_PHENOTPYE_MODE] === PHENOTYPE_MODE_UNION){
				cache_key_phenotype = `hpo_id=${hpo_id_list_str}&mode=&match=`;
			}else{
				cache_key_phenotype = `hpo_id=${hpo_id_list_str}&mode=intersection&match=${settings[SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM]}`;
			}
			return cache_key_phenotype;
		}

		function _specify_target(settings){
			let target = settings[SETTINGS_KEY_TARGET];
			if(_isEmpty(settings[SETTINGS_KEY_FILTER])){
				target = TARGET_ALL;
			}
			return target;
		}
		
		function _is_idlist_loaded(settings) {
			if(_isEmpty(settings[SETTINGS_KEY_FILTER]) || settings[SETTINGS_KEY_TARGET] !== TARGET_PHENOTYPE){
				let cache_key = _construct_cache_key(settings);
				let target = _specify_target(settings);
				return cache_key in search_idlist_cache[target];
			}

			return _is_idlist_loaded_phenotype(settings);
		}

		function _is_idlist_loaded_phenotype_all(settings){
			let cache_key_all = _construct_cache_key_phenotype_all(settings);
			return cache_key_all in search_idlist_cache[TARGET_ALL];
		}

		function _is_idlist_loaded_phenotype_phenotype(settings){
			let cache_key_phenotype = _construct_cache_key_phenotype_phenotype(settings);
			return cache_key_phenotype in search_idlist_cache[TARGET_PHENOTYPE];
		}

		function _is_idlist_loaded_phenotype(settings) {
			return _is_idlist_loaded_phenotype_all(settings) && _is_idlist_loaded_phenotype_phenotype(settings);
		}
		
		function _get_idlist_from_cache(settings){
			if(_isEmpty(settings[SETTINGS_KEY_FILTER]) || settings[SETTINGS_KEY_TARGET] !== TARGET_PHENOTYPE){
				let cache_key = _construct_cache_key(settings);
				let target = _specify_target(settings);
				if(cache_key in search_idlist_cache[target]){
					return search_idlist_cache[target][cache_key];
				}else{
					return null;
				}
			}

			return _get_idlist_from_cache_phenotype(settings);
		}

		function _get_idlist_from_cache_phenotype(settings){
			let cache_key_all = _construct_cache_key_phenotype_all(settings);
			let cache_key_phenotype = _construct_cache_key_phenotype_phenotype(settings);
			let idlist_all = search_idlist_cache[TARGET_ALL][cache_key_all];
			let idlist_phenotype = search_idlist_cache[TARGET_PHENOTYPE][cache_key_phenotype];

			let ret = [];	
			for(let mondo_id of idlist_all){
				if(idlist_phenotype.includes(mondo_id)) ret.push(mondo_id);
			}
			return ret;
		}

		function _store_idlist_to_cache(settings, idlist){
			let cache_key = _construct_cache_key(settings);
			let target = _specify_target(settings);
			search_idlist_cache[target][cache_key] = idlist;
		}

		function _store_idlist_to_cache_phenotype(settings,target,idlist){
			if(target === TARGET_ALL){
				let cache_key_all = _construct_cache_key_phenotype_all(settings);
				search_idlist_cache[target][cache_key_all] = idlist;
			}else{
				let cache_key_phenotype = _construct_cache_key_phenotype_phenotype(settings);
				let tobesaved = idlist.map(item => item.mondo_id);
				search_idlist_cache[target][cache_key_phenotype] = tobesaved;


				//if(settings[SETTINGS_KEY_FILTER_PHENOTPYE_MODE] === PHENOTYPE_MODE_UNION){
    	        //    cache_key_phenotype = `hpo_id=${hpo_id_list_str}&mode=&match=`;
        	    //}else{
            	//    cache_key_phenotype = `hpo_id=${hpo_id_list_str}&mode=intersection&match=${settings[SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM]}`;
	            //}

				let hpo_id_list = settings[SETTINGS_KEY_FILTER].split(",");

				if(settings[SETTINGS_KEY_FILTER_PHENOTPYE_MODE] === PHENOTYPE_MODE_UNION){
					// construct INTERSECTION, NUM:1
					let fake_settings_1 = $.extend(true,{}, settings, {
						[SETTINGS_KEY_FILTER_PHENOTPYE_MODE]: PHENOTYPE_MODE_INTERSECTION,
						[SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM]: 1
					});
					let cache_key_phenotype_1 = _construct_cache_key_phenotype_phenotype(fake_settings_1);
					if(!(cache_key_phenotype_1 in search_idlist_cache[target])){
						search_idlist_cache[target][cache_key_phenotype_1] = tobesaved;
					}

					for(let cnt = 2; cnt <= hpo_id_list.length; cnt++){
						let fake_settings_i = $.extend(true,{}, settings, {
							[SETTINGS_KEY_FILTER_PHENOTPYE_MODE]: PHENOTYPE_MODE_INTERSECTION,
							[SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM]: cnt
						});
						let cache_key_phenotype_i = _construct_cache_key_phenotype_phenotype(fake_settings_i);
						if(!(cache_key_phenotype_i in search_idlist_cache[target])){
							let tobesaved_i = idlist.filter(item => item.hpo_count == cnt).map(item => item.mondo_id);
							search_idlist_cache[target][cache_key_phenotype_i] = tobesaved_i;
						}
					}
				}else{
					if(settings[SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM] == 1){
						// construct UNION
						let fake_settings_1 = $.extend(true,{}, settings, {[SETTINGS_KEY_FILTER_PHENOTPYE_MODE]: PHENOTYPE_MODE_UNION});
						let cache_key_phenotype_1 = _construct_cache_key_phenotype_phenotype(fake_settings_1);
						if(!(cache_key_phenotype_1 in search_idlist_cache[target])){
							search_idlist_cache[target][cache_key_phenotype_1] = tobesaved;
						}

						for(let cnt = 2; cnt <= hpo_id_list.length; cnt++){
							let fake_settings_i = $.extend(true,{}, settings, {
								[SETTINGS_KEY_FILTER_PHENOTPYE_MODE]: PHENOTYPE_MODE_INTERSECTION,
								[SETTINGS_KEY_FILTER_PHENOTPYE_INTERSECTION_NUM]: cnt
							});
							let cache_key_phenotype_i = _construct_cache_key_phenotype_phenotype(fake_settings_i);
							if(!(cache_key_phenotype_i in search_idlist_cache[target])){
								let tobesaved_i = idlist.filter(item => item.hpo_count == cnt).map(item => item.mondo_id);
								search_idlist_cache[target][cache_key_phenotype_i] = tobesaved_i;
							}
						}
					}
				}
			}
		}

		var panel_cache = {};
		function _get_panel_data_from_cache(panel_id){
			let ret=null;
			if(panel_id in panel_cache){
				ret = panel_cache[panel_id];
			}
			return ret;
		}

		function _store_panel_data_to_cache(json_data){
			$.extend(panel_cache, json_data);
		}

		function _get_uncached_panel_list(selected_idlist){
			let ret=[];
			for(let i=0;i<selected_idlist.length; i++){
				if(!(selected_idlist[i] in panel_cache)){
					ret.push(selected_idlist[i]);
				}
			}
			return ret;
		}

		//
		// construct UI
		//
		// UI:loader
		var $div_loader = $('<div>').attr('id', ID_LOADER).appendTo($root_panel);
		var $div_loader_wrapper = $('<div>').addClass("d-flex flex-row vgp-loader-content").appendTo($div_loader);
		$('<span>').addClass("vgp-loader-gif").appendTo($div_loader_wrapper);
		$('<span>').addClass("vgp-loader-text").appendTo($div_loader_wrapper);
		function _show_loader(isWholeScreen){
			if(isWholeScreen){
				if($('#vgp-loader-whole').is(":visible") === false) $('#vgp-loader-whole').show();
			}else{
				if($('#vgp-loader-whole').is(":visible") === false && $('#'+ ID_LOADER).is(":visible") === false) $('#'+ID_LOADER).show();
			}
		};
		function _hide_loader(){
			if($('#'+ID_LOADER).is(":visible")) $("#"+ID_LOADER).hide();
			if($('#vgp-loader-whole').is(":visible")) $('#vgp-loader-whole').hide();
		};

		// UI: content wrapper
		var $div_content = $('<div>').attr('id', ID_CONTENT).addClass('').appendTo($root_panel);
		function _show_content(){
			if($('#'+ ID_CONTENT).is(":visible") === false) $('#'+ID_CONTENT).show();
		};
		function _hide_content(){
			if($('#'+ID_CONTENT).is(":visible")) $("#"+ID_CONTENT).hide();
		};
		function _init_content(){
			$div_content_list.empty();
			_show_content_empty();
		}

		function _onChangeSortDirection(obj){
			$panel = $(obj);
			// get dir
			let dir_class = SORT_DIRECTION_ASC;
			if($panel.hasClass(SORT_DIRECTION_ASC)){
				dir_class = SORT_DIRECTION_DSC;
			}

			// clear 
			$("."+CLASS_SORTABLE).removeClass(SORT_DIRECTION_DSC);
			$("."+CLASS_SORTABLE).removeClass(SORT_DIRECTION_ASC);
			
			// set dir
			$panel.addClass(dir_class);

			// set setting and reload data
			let old_settings = $root_panel.data(SETTINGS_KEY);
			let options = {[SETTINGS_KEY_SORT_TARGET]: $panel.data(SETTINGS_KEY_SORT_TARGET),
						   [SETTINGS_KEY_SORT_DIRECTION]: dir_class};
			let new_settings = $.extend(true,{}, old_settings, options || {});
			$root_panel.data(SETTINGS_KEY,new_settings);
			//clear 
			// load
			_init_content();
			_search_idlist(new_settings);
		   
			if(_isFunction(new_settings[SETTINGS_KEY_FUNC_AFTER_CHANGE_SORT])){
				new_settings[SETTINGS_KEY_FUNC_AFTER_CHANGE_SORT]();
			} 
		}

		// UI: content title 
		let $div_content_title = $('<div>').attr('id',ID_CONTENT_TITLE).addClass('row').appendTo($div_content);

		let $div_content_title_panel = $('<div>').addClass('col row align-items-center vgp-col-panel').appendTo($div_content_title);
		$('<span>').addClass("material-symbols-outlined").text('view_list').appendTo($div_content_title_panel);
		let $span_panel = $('<span>').addClass(CLASS_SORTABLE).text('Panel')
									.data(SETTINGS_KEY_SORT_TARGET, SORT_TARGET_PANEL)
									.click(function(){_onChangeSortDirection(this);})
									.appendTo($div_content_title_panel);
		if(init_settings[SETTINGS_KEY_SORT_TARGET] === SORT_TARGET_PANEL){
			$span_panel.addClass(init_settings[SETTINGS_KEY_SORT_DIRECTION]);
		}
		
		let $div_content_title_gene  = $('<div>').addClass('vgp-col-genenum vgp-col-genenum-title').appendTo($div_content_title);
		$('<span>').addClass("material-symbols-outlined").text('genetics').appendTo($div_content_title_gene);
		let $span_gene = $('<span>').addClass(CLASS_SORTABLE).text('Panel genes')
									.data(SETTINGS_KEY_SORT_TARGET, SORT_TARGET_GENE)
									.click(function(){_onChangeSortDirection(this);})
									.appendTo($div_content_title_gene);
		if(init_settings[SETTINGS_KEY_SORT_TARGET] === SORT_TARGET_GENE){
			$span_gene.addClass(init_settings[SETTINGS_KEY_SORT_DIRECTION]);
		}
		
		// UI: content data panel 
		const $div_content_list = $('<div>').attr('id',ID_CONTENT_LIST).appendTo($div_content);
		$('<div>').attr('id',ID_CONTENT_EMPTY).text('No panels found!').appendTo($div_content);
		function _show_content_empty(){
			if($('#'+ ID_CONTENT_EMPTY).is(":visible") === false) $('#'+ID_CONTENT_EMPTY).show();
		}
		function _hide_content_empty(){
			if($('#'+ID_CONTENT_EMPTY).is(":visible")) $("#"+ID_CONTENT_EMPTY).hide();
		}
		function _get_selected(){
			return $div_content_list.find("input[name='selected_mondo_id']:checked").map(function() {
				return {'mondo_id':$(this).val(), 'name': $(this).data('panel_name'), 'gene_cnt': $(this).data('gene_cnt')};
			}).get();
		}
		function _update_common_panel(){
			let settings = $root_panel.data(SETTINGS_KEY);
			let common_panel_id_list = [];
			if(_isFunction(settings[SETTINGS_KEY_FUNC_LOAD_CUSTOM_PANEL])){
				common_panel_id_list = settings[SETTINGS_KEY_FUNC_LOAD_CUSTOM_PANEL]();
			}
			$root_panel.find('button.common-panel').each(function(index, element) {
				let $btn = $(element);
				let mondo_id = $btn.data('mondo_id');
				if(common_panel_id_list.includes(mondo_id)){
					$btn.addClass('checked').attr('data-original-title', 'Remove from common panel list').find('span').text('check'); 
				}else{
					$btn.removeClass('checked').attr('data-original-title', 'Add to the common panel list').find('span').text('add'); 
				}
			});

		}

		function _get_highlighted_text(text,term){

			if(_isEmpty(term)) return text;

			let resultText = text.toLowerCase();
			let searchText = decodeURIComponent(term.trim());
				searchText = searchText.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s){ return String.fromCharCode(s.charCodeAt(0) - 65248); });
				searchText = searchText.toLowerCase();
			let highlighted_text = text;

			let index = resultText.indexOf(searchText);
			while (index !== -1) {
				 let before	  = resultText.substring(0, index);
				 let before_orig = highlighted_text.substring(0, index);
				 let match	   = resultText.substring(index, index + searchText.length);
				 let match_orig  = highlighted_text.substring(index, index + searchText.length);
				 let after	   = resultText.substring(index + searchText.length);
				 let after_orig  = highlighted_text.substring(index + searchText.length);

				 //resultText = before + '<font class="vgp-highlight">' + match + '</font>';
				 resultText = before + '<span class="vgp-highlight">' + match + '</span>';
				 let newstart = resultText.length;
				 resultText = resultText + after;

				 //highlighted_text = before_orig + '<font class="vgp-highlight">' + match_orig + '</font>' + after_orig;
				 highlighted_text = before_orig + '<span class="vgp-highlight">' + match_orig + '</span>' + after_orig;
				 index = resultText.indexOf(searchText, newstart);
			}
			return highlighted_text;
		}

		function _highlightTerm($obj,term){
			if(_isEmpty(term)) return;

			let text = $obj.text();

			let highlighted_text = _get_highlighted_text(text,term);

			$obj.html(highlighted_text);
		}
		
		function _show_result(settings){

			let num_per_page = settings[SETTINGS_KEY_SIZE];
			let language	 = settings[SETTINGS_KEY_LANG];
			let filter	     = settings[SETTINGS_KEY_FILTER];

			let custom_panel_list = [];
			if(_isFunction(settings[SETTINGS_KEY_FUNC_LOAD_CUSTOM_PANEL])){
				custom_panel_list = settings[SETTINGS_KEY_FUNC_LOAD_CUSTOM_PANEL]();
			}

			let idlist        = _get_idlist_from_cache(settings);
			let total_num     = idlist.length;
			let total_num_str = total_num.toLocaleString("en-US");

			let loaded_num  = $div_content_list.find("." + CLASS_PANEL_ROW).length;
			let isFirstLoad = true;
			if(loaded_num > 0){
				 isFirstLoad = false;
			}

			if(loaded_num === total_num) return;

			let num_maximum = loaded_num + num_per_page;
			num_maximum = Math.min(total_num, num_maximum);

			var $last_row = null;
			if(!isFirstLoad){
				let rows = $div_content_list.find("." + CLASS_PANEL_ROW);
				$last_row = $(rows[rows.length-1]);
				
				if(loaded_num >= num_per_page){
					let $page_row = $('<div>').addClass(CLASS_PAGENUM_ROW).insertAfter($last_row);
					
					let page_num = parseInt(loaded_num/num_per_page, 10);
					
					$("<div>").text("Page " + page_num).appendTo($page_row);

					$last_row = $page_row;
				}
			}

			let i=loaded_num;
			for(; i<num_maximum; i++){
				let panel_id = idlist[i];
				let panel_data = _get_panel_data_from_cache(panel_id);
				let $tr = $('<div>').addClass(CLASS_PANEL_ROW);
				if($last_row === null){
					//when initialize tab panel
					$tr.appendTo($div_content_list);				
				}else{
					$tr.insertAfter($last_row);
				}
				$last_row = $tr;
				if(_isEmpty(panel_data)) {
					$('<label>').css({'margin-left':'15px'}).text('No data for '+panel_id).appendTo($tr);
					//console.log('info: data of (' + panel_id + ') not found by (pcf_get_panel_data_by_mondo_id)!');
					continue;
				}

				$tr.addClass("d-flex flex-row");
				// create row
				let $div_button_panel = $('<div>').addClass('d-flex flex-column vgp-button-panel').appendTo($tr);
				//let $div_btn_wrap0 = $('<div>').addClass('vgp-button-wrap').addClass('rank').appendTo($div_button_panel);
				//$(`<input type="checkbox" value="${panel_id}" name="selected_mondo_id" 
				//			data-panel_name="${_capitalizeFirstLetter(panel_data.name_en)}" 
				//			data-gene_cnt="${panel_data.count_gene_id}">`).appendTo($div_btn_wrap0);

				let $div_btn_wrap0 = $('<div>').addClass('vgp-button-wrap').appendTo($div_button_panel);
				let panel_name_tmp = _capitalizeFirstLetter(panel_data.name_en);
				if(lang === 'ja' && 'name_ja' in panel_data ){
					panel_name_tmp = panel_data.name_ja;
				}
				let $btn_common_panel = $('<button>').addClass('vgp-round-btn').addClass('common-panel')
						.data('panel_name',panel_name_tmp)
						.data('gene_cnt', panel_data.count_gene_id)
						.data('mondo_id', panel_id)
						.click(function(){
							let $btn = $(this);
							$btn.tooltip('hide');

							let mondo_id = $btn.data('mondo_id');
							if($btn.hasClass('checked')){
								$btn.removeClass('checked').attr('data-original-title', 'Add to the common panel list').find('span').text('add');
								if(_isFunction(settings[SETTINGS_KEY_FUNC_DELETE_CUSTOM_PANEL])){
									settings[SETTINGS_KEY_FUNC_DELETE_CUSTOM_PANEL](mondo_id);
								}
							}else{
								$btn.addClass('checked').attr('data-original-title', 'Remove from common panel list').find('span').text('check');
								let gene_cnt = $btn.data('gene_cnt');
								let panel_name = $btn.data('panel_name');
								if(_isFunction(settings[SETTINGS_KEY_FUNC_ADD_CUSTOM_PANEL])){
									setTimeout(() => {
										settings[SETTINGS_KEY_FUNC_ADD_CUSTOM_PANEL]({'mondo_id':mondo_id, 'name': panel_name, 'gene_cnt': gene_cnt});
									}, 100);
								}
							}

							return false;
						})
						.appendTo($div_btn_wrap0);
				let $btn_common_panel_icon = $('<span>').addClass('material-symbols-outlined').text('add').appendTo($btn_common_panel);

				if(custom_panel_list.includes(panel_id)){
					$btn_common_panel.addClass('checked');
					$btn_common_panel_icon.text('check');
					$btn_common_panel.attr({'data-toggle':'tooltip','data-placement':'top','title':'Remove from common panel list.'}).tooltip();
				}else{
					$btn_common_panel.attr({'data-toggle':'tooltip','data-placement':'top','title':'Add to the common panel list.'}).tooltip();
				}

				let $div_btn_wrap1 = $('<div>').addClass('vgp-button-wrap').appendTo($div_button_panel);
				let $btn_download = $('<button>').addClass('vgp-round-btn')
										.data('panel_id', panel_id)
										.click(function(){
											let id = $(this).data('panel_id');
											_download_panel(id);
										})
										.appendTo($div_btn_wrap1);
				$('<span>').addClass('material-symbols-outlined').text('download')
						.attr({'data-toggle':'tooltip','data-placement':'top','title':'Download this panel'})
						.appendTo($btn_download)
						.tooltip();

				let $div_btn_wrap2 = $('<div>').addClass('vgp-button-wrap').appendTo($div_button_panel);
				let $btn_copy = $('<button>').addClass('vgp-round-btn')
					.data('panel_data', panel_data)
					.attr({'data-toggle':'tooltip','data-placement':'top','title':'Copy to the clipboard'})
					.click(function(){

						let $copy_button = $(this);
						let data = $copy_button.data('panel_data');
						let text = JSON.stringify(data, null ,4);

						$copy_button.tooltip('hide').attr('data-original-title', 'Summary successfully copied');

						if (window.clipboardData && window.clipboardData.setData) {
							// Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
							window.clipboardData.setData("Text", text);
						}
						else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
							let textarea = document.createElement("textarea");
							textarea.style = "position: absolute; left: -1000px; top: -1000px";
							textarea.textContent = text;
							document.body.appendChild(textarea);
							//textarea.select();
							try {
								let selection = document.getSelection();
								selection.removeAllRanges();

								let range = document.createRange();
								range.selectNodeContents(textarea);
								selection.addRange(range);
								document.execCommand('copy');
								selection.removeAllRanges();
							}
							catch (ex) {
								console.warn("Copy to clipboard failed.", ex);
							}
							finally {
								document.body.removeChild(textarea);
							}
						}

						setTimeout(() => {
							$copy_button.tooltip('show');
						}, 100);

						//return false	
					 })
					 .on('mouseleave', function(){$(this).attr('data-original-title', 'Copy to the clipboard');})
					 .appendTo($div_btn_wrap2).tooltip();
				$('<span>').addClass('material-symbols-outlined').text('file_copy').appendTo($btn_copy);

				let $div_btn_wrap3 = $('<div>').addClass('vgp-button-wrap').appendTo($div_button_panel);
				let $btn_treeview = $('<button>').addClass('vgp-round-btn vgp-treeview-btn')
												 .data('panel_id', panel_id)
												 .click(function(e){
													 e.preventDefault();
													 let pos = $(window).scrollTop();
													 let id = $(this).data('panel_id');
													 _vgp_show_upstream_treeview(id);
													 e.preventDefault();
												 }).appendTo($div_btn_wrap3);
				let svg_treeview_str = "<svg width=\"25\" height=\"25\" viewBox=\"0 0 25 25\" xmlns=\"http://www.w3.org/2000/svg\">" +
										 "<path d=\"M17.0389 19.6308V17.7874H12.3049V7.91369H8.72523V9.68508H4V5H8.72523V6.83415H17.0389V5H21.7651V9.68508H17.0389V7.91369H13.3928V16.7069H17.0389V14.9438H21.7651V19.6308H17.0389Z\" />" +
									   "</svg>";
				$(svg_treeview_str).addClass("vgp-treeview-title-icon")
								   .attr({'data-toggle':'tooltip','data-placement':'top','title':'Show treeview of this panel'})
								   .appendTo($btn_treeview).tooltip();


				let $div_data_panel = $('<div>').addClass('d-flex flex-column flex-grow-1').css({'overflow':'hidden'}).appendTo($tr);
				//let $div_data_panel = $('<div>').addClass('d-flex flex-column flex-grow-1').appendTo($tr);
				let $div_upper = $('<div>').addClass('d-flex flex-row').appendTo($div_data_panel);
				let $vgp_panel = $('<div>').addClass('flex-grow-1 vgp-col-panel').appendTo($div_upper);
				let $div_vgp_name_wrapper = $('<div>').addClass('d-flex flex-grow-1 vgp-name-wrapper').appendTo($vgp_panel);

				let vgp_name = _capitalizeFirstLetter(panel_data.name_en);
				//let vgp_name = panel_data.name_en;

				//let $vgp_name_div = $('<div>').addClass('vgp-name').text(vgp_name).appendTo($div_vgp_name_wrapper);
				let $vgp_name_div = $('<a>').addClass('vgp-name').text(vgp_name)
											.attr({'href': `/panelsearch_panel_detail?lang=${lang}&panel_id=${panel_id}`, 'target':'_blank'})
											.appendTo($div_vgp_name_wrapper);
				if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($vgp_name_div, filter);
				
				if('synonym' in panel_data && !_isEmpty(panel_data.synonym)){
					let $div_vgp_name_subwrapper = $('<div>').addClass('vgp-name-subwrapper').appendTo($div_vgp_name_wrapper);
					let button = document.createElement('button');
					button.textContent = 'Also known as';
					button.classList.add("list-tag-vgp-synonym");
					let content_text = panel_data.synonym;
					if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) content_text = _get_highlighted_text(panel_data.synonym,filter);
					tippy(button, {
						allowHTML:   true,
						appendTo:	document.body,
						content:	 content_text,
						placement:   'right',
						theme:	   'pcf-popup',
						trigger:	 'click',
						interactive: true,
					});
					$(button).appendTo($div_vgp_name_subwrapper);
				}
			
				if(settings[SETTINGS_KEY_LANG] === LANGUAGE_JA && 'name_ja' in panel_data){
					vgp_name = panel_data.name_ja;
					let $div_vgp_name_wrapper2 = $('<div>').addClass('vgp-name-wrapper').appendTo($vgp_panel);
					let $vgp_name2_div = $('<div>').addClass('vgp-name2').text(vgp_name).appendTo($div_vgp_name_wrapper2);
					if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($vgp_name2_div, filter);
				}
	
				if('definition' in panel_data && !_isEmpty(panel_data.definition)){
					let $div_vgp_def = $('<div>').addClass('vgp-def-wrapper').appendTo($vgp_panel);
					let $p = $('<p>').addClass('description').text(panel_data.definition).appendTo($div_vgp_def);
					if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($p, filter);
					let href_str = encodeURIComponent(panel_data.definition);
					href_str = "https://translate.google.co.jp/?sl=en&tl=ja&text=" + href_str + "&op=translate&hl=ja";
					$("<a>").text(" >> Translate(Google)").attr( 'href', href_str).attr('target', '_blank').appendTo($p);
					$('<span>').addClass('more').text(' ... More >> ').appendTo($p);
					$('<span>').addClass('less').text('<< Close').appendTo($p);
				}

				let $vgp_genenum = $('<div>').addClass('vgp-col-genenum').appendTo($div_upper);
				$('<span>').text( 'count_gene_id' in panel_data ? panel_data.count_gene_id : '0').appendTo($vgp_genenum);

				let $div_lower = $('<div>').addClass('list-show_wrapper').appendTo($div_data_panel);

				let mondo_id  = panel_data.mondo_id;
				let mondo_url = panel_data.mondo_url;
				let omim_id   = 'omim_id' in panel_data ? 'OMIM:'+panel_data.omim_id : '';
				let omim_url  = 'omim_url' in panel_data ? panel_data.omim_url : '';
				let orpha_id  = 'orpha_id'  in panel_data ? 'Orphanet:' + panel_data.orpha_id : '';
				let orpha_url = 'orpha_url' in panel_data ? panel_data.orpha_url : '';
				let icd_id	= 'icd10_id'  in panel_data ? panel_data.icd10_id.replace(/ICD10/g,'ICD-10') : '';
				let icd_url   = 'icd10_url' in panel_data ? panel_data.icd10_url : '';
				let count_phenotype = 'count_hpo_id' in panel_data ? panel_data.count_hpo_id : '';
				count_phenotype = _isEmpty(count_phenotype) ? 0 : parseInt(count_phenotype);
				let count_gene = 'count_gene_id' in panel_data ? panel_data.count_gene_id : '';
				count_gene = _isEmpty(count_gene) ? 0 : parseInt(count_gene);
				let url_phenotype   = URL_GET_HPO_DATA_BY_PANEL_ID + '?mondo_id='+mondo_id.replace(/MONDO:/,'');
				let url_gene		= URL_GET_GENE_DATA_BY_PANEL_ID + '?mondo_id='+mondo_id.replace(/MONDO:/,'')+'&lang='+language;
				let url_hpo_tooltip = URL_GET_HPO_TOOLTIP_DATA_BY_HPO_ID + '?hpo_id=';
				
				$div_lower.vgp_collapse_panel({
					url_phenotype   : url_phenotype,
					url_gene		: url_gene,
					url_hpo_tooltip : url_hpo_tooltip,
					mondo_id		: mondo_id,
					mondo_url	   : mondo_url,
					omim_id		 : omim_id,
					omim_url		: omim_url,
					orpha_id		: orpha_id,
					orpha_url	   : orpha_url,
					icd_id		  : icd_id,
					icd_url		 : icd_url,
					count_phenotype : count_phenotype,
					count_gene	  : count_gene,
					language		: language
				});
				
			}

			// create show more row 
			if(isFirstLoad) {
				// create show more row
				let $bottom_panel = $('<div>').addClass("list-footer").appendTo($div_content_list);
				let list_result_str = "<div class=\"list-results-wrap\">"+
										 "<span class=\"list-results\">"+total_num_str+"</span>" +
										 " panels" +
									   "</div>";
				$(list_result_str).addClass("list-results-wrap").appendTo($bottom_panel);


				let button_str = "<button id=\"show_more_button\"><span><i class=\"material-icons\">add</i></span><p>Show More</p></button>";
				$(button_str)
				.click(function(){
					_show_loader(true);
					_search_panel_data(settings);
				})
				.appendTo($bottom_panel);

				if(i > 0){
					_hide_content_empty();
				}
			}

			if(i >= total_num){
				$("#show_more_button").hide();
			}

		}

		function checkEllipsis(pElement) {
			const scrollHeight = pElement.scrollHeight;
			const clientHeight = pElement.clientHeight;
			return scrollHeight > clientHeight;
		}

		function update_description_ellipsis(){
			const pElements = document.querySelectorAll('.description');
			pElements.forEach(p => {
				p.classList.remove('expanded', 'ellipsis');
				if (checkEllipsis(p)) {
					$(p).addClass('ellipsis');
				}
			});
		}

		function _search_panel_data(settings){
			let idlist = _get_idlist_from_cache(settings);

			let num_per_page = settings[SETTINGS_KEY_SIZE];
			let total_num	= idlist.length;
			let loaded_num   = $div_content_list.find("." + CLASS_PANEL_ROW).length;

			let num = Math.min(loaded_num + num_per_page, total_num);

			// find uncached ids
			let selected_idlist = [];
			for(let i=loaded_num; i<num; i++){
				selected_idlist.push(idlist[i]);
			}

			let uncached_idlist = _get_uncached_panel_list(selected_idlist);
			if(_isEmpty(uncached_idlist)){
				_show_content();
				_show_result(settings);
				update_description_ellipsis();
				_hide_loader();
				return;
			}

			let url_str = URL_GET_PANEL_DATA_BY_PANEL_ID + '?mondo_id=' + (uncached_idlist.join('%2C+').replace(/MONDO:/g, ''));
			_run_ajax(url_str,'GET', null, 'text', true, 
				function(data){
					let obj = _parseJson(data);
					let hash = {};
					for(let j=0;j<obj.length; j++){
						let panel_id = obj[j].mondo_id;
						hash[panel_id] = obj[j];
					}
					_store_panel_data_to_cache(hash);
					if(settings[SETTINGS_KEY_TARGET] !== TARGET_PHENOTYPE && _isFunction(settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE])){
						if(!settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE](settings[SETTINGS_KEY_FILTER])){
							//console.log('filter changed!');
							return;
						}
					}
					_show_content();
					_show_result(settings);
					update_description_ellipsis();
					_hide_loader();
					return;
				},
				function(){
					_hide_loader();
					_show_content();
					return;
				}
			);
		}

		function _get_panel_list_from_search_result(json_data){
			let json_data1 = _parseJson(json_data);
			let k = Object.keys(json_data1)[0];
			return json_data1[k];
		}	

		function _search_idlist(settings){

			_hide_content();
			if(settings[SETTINGS_KEY_TARGET] === TARGET_PHENOTYPE){
				 _show_loader(true);
			}else{
				_show_loader(false);
			}

			// search id
			let is_loaded = _is_idlist_loaded(settings);
			// search panel data
			if(is_loaded){
				if(settings[SETTINGS_KEY_TARGET] !== TARGET_PHENOTYPE && _isFunction(settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE])){
					if(!settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE](settings[SETTINGS_KEY_FILTER])){
						//console.log('filter changed!');
						return;
					}
				}

				let idlist = _get_idlist_from_cache(settings);
				if(_isFunction(settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST])){
					settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST](idlist.length, settings[SETTINGS_KEY_ROOT]);
				}
				_search_panel_data(settings);
				return;
			}



			let ajax_obj_arr = [];

			if(settings[SETTINGS_KEY_TARGET] !== TARGET_PHENOTYPE){
				let url_str = URL_HASH_SEARCH[settings[SETTINGS_KEY_TARGET]];
				if(_isEmpty(settings[SETTINGS_KEY_FILTER])){
					url_str = URL_HASH_SEARCH[TARGET_ALL];
				}
				url_str = url_str + '?' + _construct_cache_key(settings);

				ajax_obj_arr.push({
					'url':	url_str,
					'target': _isEmpty(settings[SETTINGS_KEY_FILTER]) ? TARGET_ALL : settings[SETTINGS_KEY_TARGET]
				});
			}else{
				if(!_is_idlist_loaded_phenotype_all(settings)){
					let url_str = URL_HASH_SEARCH[TARGET_ALL] + '?' + _construct_cache_key_phenotype_all(settings);
					ajax_obj_arr.push({
						'url':    url_str,
						'target': TARGET_ALL
					});
				}

				if(!_isEmpty(settings[SETTINGS_KEY_FILTER]) && !_is_idlist_loaded_phenotype_phenotype(settings)){
					let url_str = URL_HASH_SEARCH[TARGET_PHENOTYPE] + '?' + _construct_cache_key_phenotype_phenotype(settings);
					ajax_obj_arr.push({
						'url':    url_str,
						'target': TARGET_PHENOTYPE
					});
				}
			}

			let total_cnt = ajax_obj_arr.length;
			let completed_cnt = 0;
			ajax_obj_arr.forEach((ajax_obj) => {
				_run_ajax(ajax_obj.url,'GET', null, 'text', true, 
					function(data){
						if(ajax_obj.target === TARGET_ALL){
							let idlist = _get_panel_list_from_search_result(data);
							_store_idlist_to_cache_phenotype(settings,TARGET_ALL,idlist)
						}else if(ajax_obj.target === TARGET_PHENOTYPE){
							let idlist = _parseJson(data);
							_store_idlist_to_cache_phenotype(settings,TARGET_PHENOTYPE,idlist)
						}else{
							let idlist = _get_panel_list_from_search_result(data);
							_store_idlist_to_cache(settings, idlist);
						}

						completed_cnt++;
						if(completed_cnt === total_cnt){
							if(settings[SETTINGS_KEY_TARGET] !== TARGET_PHENOTYPE && _isFunction(settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE])){
								if(!settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE](settings[SETTINGS_KEY_FILTER])){
									return;
								}
							}
						
							if(_isFunction(settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST])){
								let idlist = _get_idlist_from_cache(settings);
								settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST](idlist.length,settings[SETTINGS_KEY_ROOT]);
							}

							_search_panel_data(settings);
						}
						return;
					},
					function(){
						_hide_loader();
						_show_content();
						return;
					}
				);
			});
		}
		

		function _run_ajax(url_str,http_type,post_data,response_dataType,async,callback,callback_fail){

			if(http_type==="GET"){
				$.ajax({	
					url:	  url_str,  // 通信先のURL
					type:	 http_type,// 使用するHTTPメソッド(get/post)
					async:	async,	// 使用するHTTPメソッド(true/false)
					dataType: response_dataType
					//timeout:  3000,
				}).done(function(data1,textStatus,jqXHR) {
					if(_isFunction(callback))callback(data1);
				}).fail(function(jqXHR, textStatus, errorThrown ) {
					//alert('Server access error:' + textStatus + ":" + errorThrown + '\nURL: ' + url_str);
					if(_isFunction(callback_fail)) callback_fail();
					alert('Server access error:' + textStatus + ":" + errorThrown + '\nURL: ' + url_str);
				});
			}else{
				$.ajax({
					url:	  url_str,  // 通信先のURL
					type:	 http_type,// 使用するHTTPメソッド(get/post)
					async:	async,	// 使用するHTTPメソッド(true/false)
					data:	 post_data,
					proccessData: false, 
					dataType: response_dataType
				}).done(function(data1,textStatus,jqXHR) {
					if(_isFunction(callback))callback(data1);
				}).fail(function(jqXHR, textStatus, errorThrown ) {
					//alert('Server access error:' + textStatus + ":" + errorThrown + '\nURL: ' + url_str);
					if(_isFunction(callback_fail)) callback_fail();
					alert('Server access error:' + textStatus + ":" + errorThrown + '\nURL: ' + url_str);
				});
			}
		}

		function _download_all_panels(){
			_hide_content();
			_show_loader();

			// do search idlist
			let url_str = URL_DOWNLOAD_ALL_PANEL;
			_run_ajax(url_str,'GET', null, 'text', true, 
				function(data){
					_hide_loader();
					_show_content();
					_create_download_file(data, 'all_panel.tsv');
					return;
				},
				function(){
					_hide_loader();
					_show_content();
					return;
				}
			);
		}

		function _download_panel(panel_id){
			let  window_y_offset = window.pageYOffset;
			_hide_content();
			_show_loader();

			// do search idlist
			let url_str = URL_DOWNLOAD_PANEL + "?mondo_id=" + panel_id.replace(/MONDO:/,'');
			_run_ajax(url_str,'GET', null, 'text', true, 
				function(data){
					_hide_loader();
					_show_content();
					document.documentElement.scrollTop = document.body.scrollTop = window_y_offset;
					_create_download_file(data, 'panel-'+panel_id.replace(/MONDO:/,'')+'.txt');
					return;
				},
				function(){
					_hide_loader();
					_show_content();
					document.documentElement.scrollTop = document.body.scrollTop = window_y_offset;
					return;
				}
			);
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

		this.update_common_panel = function(){
			return _update_common_panel();
		};

		this.get_selected = function(){
			return _get_selected();
		};

		this.download_all_panels = function(){
			_download_all_panels();
		};

		this.search_panels = function(){
			_init_content();
			var current_settings = $root_panel.data(SETTINGS_KEY);
			_search_idlist(current_settings);
		};
	};


}(jQuery));
