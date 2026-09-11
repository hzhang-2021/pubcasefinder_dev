;(function ($) {

	const URL_GET_ALL_PANEL_ID			     = '/panelsearch_nanbyo_get_all_panel',
		  URL_GET_PANEL_ID_BY_PANEL		     = '/panelsearch_nanbyo_get_panel_id_match_panel_name_synonym',
		  URL_GET_PANEL_ID_BY_GENE		     = '/panelsearch_nanbyo_get_panel_id_match_gene_symbol_ncbiid',
		  URL_GET_PANEL_DATA_BY_PANEL_ID	 = '/sparqlist/api/ps_get_panel_data_by_nando_id',
		  URL_GET_HPO_DATA_BY_PANEL_ID	     = '/sparqlist/api/pcf_get_hpo_data_by_nando_id',
		  URL_GET_HPO_TOOLTIP_DATA_BY_HPO_ID = '/sparqlist/api/pcf_get_hpo_tooltip_data_by_hpo_id',
		  URL_DOWNLOAD_ALL_PANEL			 = '/static/data/panelsearch_nanbyo/all_panel.tsv',
		  URL_LOAD_MULTI_CLASS               = '/panelsearch_nanbyo_load_multi_class',
          URL_GET_PANEL_DEFINITIVE_GENE_BY_NANDO_ID = '/sparqlist/api/ps_get_definitive_gene_by_nando_id_250516_test?nando_id=',
		  URL_GET_PANEL_AUTOREVIEW_GENE_BY_NANDO_ID = '/sparqlist/api/ps_get_autoreview_gene_by_nando_id_250516_test?nando_id=',
		  URL_GET_PANEL_REVIEW                      = '/panelsearch_nanbyo_get_panel_review',
		  URL_PANEL_DETAIL					        = '/panelsearch_nanbyo_panel_detail',
		  URL_PANEL_ENTITY_DETAIL                   = '/panelsearch_nanbyo_panel_entity_detail';

	const protocol = window.location.protocol; // e.g., 'http:' or 'https:'
	const hostname = window.location.hostname; // e.g., 'example.com'
	const port     = window.location.port;         // e.g., '8080', '' if default port
	const serverRoot = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
	const URL_GET_GENE_DATA_BY_PANEL_ID = `${serverRoot}/sparqlist/api/ps_get_gene_by_nando_id`;


	const SETTINGS_KEY		  = 'VGPSettings',
		  OBJECT_KEY		  = 'VGPObject',
		  LANGUAGE_EN		  = 'en',
		  LANGUAGE_JA		  = 'ja',
		  SETTINGS_KEY_LANG   = 'language',
		  SETTINGS_KEY_SIZE   = 'vgp-size',
		  SETTINGS_KEY_ROOT   = 'vgp-root-panel-id',
		  SETTINGS_KEY_TARGET = 'vgp-target',
		  SETTINGS_KEY_FILTER = 'vgp-filter',
		  SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST = 'after_search_idlist',
		  SETTINGS_KEY_FUNC_CHECK_CONSISTENCE   = 'check_consistence',
		  SETTINGS_KEY_FUNC_AFTER_CHANGE_SORT   = 'after_change_sort',
		  SORT_TARGET_PANEL		      = 'panel',
		  SORT_TARGET_GENE			  = 'gene',
		  SETTINGS_KEY_SORT_TARGET	  = 'sort-target',
		  SORT_DIRECTION_ASC		  = 'asc',
		  SORT_DIRECTION_DSC		  = 'desc',
		  SETTINGS_KEY_SORT_DIRECTION = 'sort-direction',
		  CLASS_STATUS_INIT   = 'vgp-status-init',
		  CLASS_STATUS_LOADED = 'vgp-status-loaded',
		  CLASS_PANEL_ROW	  = 'vgp-panel-row',
		  CLASS_PAGENUM_ROW   = 'vgp-pagenum-row',
		  CLASS_SORTABLE	  = 'vgp-sortable',
		  ID_LOADER		      = 'vgp-loader',
		  ID_CONTENT		  = 'vgp-content',
		  ID_CONTENT_TITLE	  = 'vgp-content-title',
		  ID_CONTENT_LIST	  = 'vgp-content-list',
		  ID_CONTENT_EMPTY	  = 'vgp-content-empty',
		  TARGET_ALL   = 'all',
		  TARGET_PANEL = 'panel',
		  TARGET_GENE  = 'gene',
		  SOURCE_LIST  = [
			  {
			   key:	'notification_number', 
			   label:  {[LANGUAGE_EN]:'Notification number : ', [LANGUAGE_JA]:'告示番号 : '},
			   isLink: false
			  },
			  {
			   key:	'mhlw_url',
			   label:  {[LANGUAGE_EN]:'Overview/Diagnostic criteria', [LANGUAGE_JA]:'概要、診断基準等'},
			   isLink: true
			  },
			  {
			   key:	'source',
			   label:  {[LANGUAGE_EN]:'Clinical record form',[LANGUAGE_JA]:'臨床調査個人票・医療意見書'},
			   isLink: true
			  },
			  {
			   key:	'nanbyou_url',
			   label:  {[LANGUAGE_EN]:'Information center for intractable disease',[LANGUAGE_JA]:'難病情報センター'},
			   isLink: true
			  },
			  {
			   key:	'nando_url',
			   label:  {[LANGUAGE_EN]:'NanbyoData',[LANGUAGE_JA]:'NanbyoData'},
			   isLink: true
			  }
		  ],
		  ID_LIST = [
			  {key_id: 'nando_id',	  key_url: 'nando_url'},
			  {key_id: 'omim_id',	  key_url: 'omim_url'},
			  {key_id: 'orphanet_id', key_url: 'orphanet_url'},
			  {key_id: 'kegg_id',	  key_url: 'kegg_url'},
			  {key_id: 'icd10_id',	  key_url: 'icd10_url'}
		  ]
		  ;

	const URL_HASH_SEARCH = {
		[TARGET_ALL]:   URL_GET_ALL_PANEL_ID,
		[TARGET_PANEL]: URL_GET_PANEL_ID_BY_PANEL,
		[TARGET_GENE]:  URL_GET_PANEL_ID_BY_GENE
	};
	

	var DEFAULT_SETTINGS = {
		[SETTINGS_KEY_SIZE]:	50,			    // panel data per page
		[SETTINGS_KEY_ROOT]:	2,              // root panel id
		[SETTINGS_KEY_TARGET]:	TARGET_PANEL,	// TARGET_ALL or TARGET_PANEL or TARGET_GENE
		[SETTINGS_KEY_FILTER]:	'',			    // filter string
		[SETTINGS_KEY_LANG]:	LANGUAGE_EN,
		[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST]: null,
		[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE]:   null,
		[SETTINGS_KEY_FUNC_AFTER_CHANGE_SORT]:   null,
		[SETTINGS_KEY_SORT_TARGET]:			     SORT_TARGET_GENE,
		[SETTINGS_KEY_SORT_DIRECTION]:		     SORT_DIRECTION_DSC
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
			  [SETTINGS_KEY_SORT_TARGET]:settings[SETTINGS_KEY_SORT_TARGET],
			  [SETTINGS_KEY_SORT_DIRECTION]: settings[SETTINGS_KEY_SORT_DIRECTION]
			}
			return obj;
		},
		download_all_panels: function(){
			this.data(OBJECT_KEY).download_all_panels();
			return this;
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
			[TARGET_ALL]:   {},
			[TARGET_PANEL]: {},
			[TARGET_GENE]:  {}
		};

		function _construct_cache_key(settings){
			let cache_key = '';
			if(utils_isEmpty(settings[SETTINGS_KEY_FILTER]) === false){
				cache_key = 'input_text=' +settings[SETTINGS_KEY_FILTER]+'&';
			}
			cache_key = cache_key + 'lang=' + settings[SETTINGS_KEY_LANG]+'&'
								  + 'root_panel_id=' + settings[SETTINGS_KEY_ROOT]+'&'
								  + 'sort=' + settings[SETTINGS_KEY_SORT_TARGET]+'&'
								  + 'dir=' + settings[SETTINGS_KEY_SORT_DIRECTION]+'&';
			return cache_key;
		}
		
		function _specify_target(settings){
			let target = settings[SETTINGS_KEY_TARGET];
			if(utils_isEmpty(settings[SETTINGS_KEY_FILTER])){
				target = TARGET_ALL;
			}
			return target;
		}
		
		function _is_idlist_loaded(settings) {
			let cache_key = _construct_cache_key(settings);
			let target = _specify_target(settings);
			return cache_key in search_idlist_cache[target];
		}
		
		function _get_idlist_from_cache(settings){
			let cache_key = _construct_cache_key(settings);
			let target = _specify_target(settings);
			if(cache_key in search_idlist_cache[target]){
				return search_idlist_cache[target][cache_key];
			}else{
				return null;
			}
		}
		
		function _store_idlist_to_cache(settings,idlist){
			let cache_key = _construct_cache_key(settings);
			let target = _specify_target(settings);
			search_idlist_cache[target][cache_key] = idlist;
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
				if(!(selected_idlist[i][0] in panel_cache)){
					ret.push(selected_idlist[i][0]);
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
			if($('#'+ID_LOADER).is(":visible")) {
				$("#"+ID_LOADER).hide();
			}
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
		   
			if(utils_isFunction(new_settings[SETTINGS_KEY_FUNC_AFTER_CHANGE_SORT])){
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
		var $div_content_list = $('<div>').attr('id',ID_CONTENT_LIST).appendTo($div_content);
		$('<div>').attr('id',ID_CONTENT_EMPTY).text('No panels found!').appendTo($div_content);
		function _show_content_empty(){
			if($('#'+ ID_CONTENT_EMPTY).is(":visible") === false) $('#'+ID_CONTENT_EMPTY).show();
		};
		function _hide_content_empty(){
			if($('#'+ID_CONTENT_EMPTY).is(":visible")) $("#"+ID_CONTENT_EMPTY).hide();
		};

		function _get_highlighted_text(text,term){

			if(utils_isEmpty(term)) return text;

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
			if(utils_isEmpty(term)) return;

			let text = $obj.text();

			let highlighted_text = _get_highlighted_text(text,term);

			$obj.html(highlighted_text);
		}
		
		function _show_result(settings){

			let num_per_page = settings[SETTINGS_KEY_SIZE];
			let language	 = settings[SETTINGS_KEY_LANG];
			let filter	   = settings[SETTINGS_KEY_FILTER];

			let idlist = _get_idlist_from_cache(settings);
			let total_num = idlist.length;
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
				let nando_id = idlist[i][0];
				let panel_id = idlist[i][1];
				let panel_data = _get_panel_data_from_cache(nando_id);
				let $tr = $('<div>').addClass(CLASS_PANEL_ROW);
				if($last_row === null){
					//when initialize tab panel
					$tr.appendTo($div_content_list);				
				}else{
					$tr.insertAfter($last_row);
				}
				$last_row = $tr;
				if(utils_isEmpty(panel_data)) {
					$('<label>').css({'margin-left':'15px'}).text('No data for '+panel_id + " " + nando_id).appendTo($tr);
					//console.log('info: data of (' + panel_id + ') not found by (pcf_get_panel_data_by_mondo_id)!');
					continue;
				}

				$tr.addClass("d-flex flex-row");
				// create row
				let $div_button_panel = $('<div>').addClass('d-flex flex-column vgp-button-panel').appendTo($tr);
				let $div_btn_wrap1 = $('<div>').addClass('vgp-button-wrap').appendTo($div_button_panel);
				let $btn_download = $('<button>').addClass('vgp-round-btn')
										.data('nando_id', nando_id)
										.data('panel_id', panel_id)
										.data('panel_name', (settings[SETTINGS_KEY_LANG] === LANGUAGE_JA && 'label_ja' in panel_data && !utils_isEmpty(panel_data.label_ja))? panel_data.label_ja : panel_data.label_en )
										.click(function(){
											let nando_id = $(this).data('nando_id');
											let panel_id = $(this).data('panel_id');
											let panel_name = $(this).data('panel_name');
											_download_panel(nando_id,panel_id,panel_name);
										})
										.appendTo($div_btn_wrap1);
				$('<span>').addClass('material-symbols-outlined').text('download')
						.attr({'data-toggle':'tooltip','data-placement':'top','title':'Download this panel'})
						.appendTo($btn_download)
						.tooltip();

				let $div_btn_wrap2 = $('<div>').addClass('vgp-button-wrap').appendTo($div_button_panel);
				let $btn_copy = $('<button>').addClass('vgp-round-btn')
											 .data('panel_data', panel_data)
											 .click(function(){
												let data = $(this).data('panel_data');
												let text = JSON.stringify(data, null ,4);
												let $copy_button = $(this);
												$copy_button.tooltip('show');
												utils_copyToClipboard(text);
												return false	
											 })
											 .tooltip({'title':'Summary successfully copied', 'trigger':'manual', 'placement':'bottom'})
											 .on('mouseleave', function(){$(this).tooltip('hide');})
											 .appendTo($div_btn_wrap2);
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

				let $div_upper = $('<div>').addClass('d-flex flex-row').appendTo($div_data_panel);

				let $vgp_panel = $('<div>').addClass('flex-grow-1 vgp-col-panel').appendTo($div_upper);

				let $div_vgp_name_wrapper = $('<div>').addClass('vgp-name-wrapper').appendTo($vgp_panel);
				let $h2 = $("<h2>");
				let panel_name = '';
				if(settings[SETTINGS_KEY_LANG] === LANGUAGE_JA && 'label_ja' in panel_data && !utils_isEmpty(panel_data.label_ja)){
					panel_name = panel_data.label_ja;
					if (typeof panel_name.normalize === "function") {
						panel_name = panel_name.normalize("NFC");
					}
					$h2.addClass('temp-label-ja').appendTo($div_vgp_name_wrapper);
					let $ruby =$('<ruby>').text(panel_name).appendTo($h2);
					if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($ruby, filter);
					if('label_hira' in panel_data && !utils_isEmpty(panel_data.label_hira)){
						let $rt = $('<rt>').text(panel_data.label_hira).appendTo($ruby);
						if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($rt, filter);
					}
					let $h3 = $('<h3>').addClass("temp-label-en").text(panel_data.label_en).appendTo($div_vgp_name_wrapper); 
					if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($h3, filter);
				}else{
					$h2.addClass("temp-label-en").text(panel_data.label_en).appendTo($div_vgp_name_wrapper);
					panel_name = panel_data.label_en;
					if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($h2, filter);
				}

				if(!panel_name){
					// cannot find label_en or label_ja in the panel data
					// get panel name from the data(api_psn_get_all_panel)
					if(settings[SETTINGS_KEY_LANG] === LANGUAGE_JA){
						panel_name = idlist[i][3];
					}else{
						panel_name = idlist[i][2];
					} 
				}
				$h2.data('href',URL_PANEL_DETAIL + '?panel_id='+ panel_id 
												 + '&nando_id='+ nando_id 
												 + '&panel_name=' + encodeURIComponent(panel_name)
												 + '&lang=' + settings[SETTINGS_KEY_LANG])
				   .click(function(){
						let href = $(this).data("href");
						window.open(href, '_blank');
					});


				let $div_vgp_id_wrapper = $('<div>').addClass('d-flex flex-wrap vgp-source-wrapper').appendTo($vgp_panel);
				SOURCE_LIST.forEach((item) => {
					if(item.key in panel_data && !utils_isEmpty(panel_data[item.key])){
						if(item.key === 'nando_url' && nando_id.startsWith("NANDO:300000")){
						}else{
							if(item.isLink){
								let text = item.label[settings[SETTINGS_KEY_LANG]];
								let href = panel_data[item.key]
								$('<a>').attr('target','_blank').attr('href', href).text(text).appendTo($div_vgp_id_wrapper);
							}else{
								let text  = item.label[settings[SETTINGS_KEY_LANG]] + panel_data[item.key];
								let $span = $('<span>').addClass('id').text(text).appendTo($div_vgp_id_wrapper);
								if(settings[SETTINGS_KEY_TARGET]===TARGET_PANEL) _highlightTerm($span, filter);
							}
						}
					}
				});

				let definition_text = "";
				if(settings[SETTINGS_KEY_LANG]===LANGUAGE_JA && 'description' in panel_data && !utils_isEmpty(panel_data.description)){
					definition_text = panel_data.description;
				}else if('mondo_description' in panel_data && !utils_isEmpty(panel_data.mondo_description)){
					definition_text = panel_data.mondo_description;
				}else if('medgen_definition' in panel_data && !utils_isEmpty(panel_data.medgen_definition)){
					definition_text = panel_data.medgen_definition;
				}

				if(!utils_isEmpty(definition_text)){
					let $div_vgp_def = $('<div>').addClass('vgp-def-wrapper').appendTo($vgp_panel);
					//let $p = $('<p>').text(definition_text).appendTo($div_vgp_def);
					//let href_str = encodeURIComponent(definition_text);
					//href_str = `https://translate.google.co.jp/?sl=auto&text=${href_str}&op=translate`;
					//$("<a>").text(" >> Translate(Google)").attr( 'href', href_str).attr('target', '_blank').appendTo($p);
					utils_create_collapse_text_box($div_vgp_def,definition_text);
				}

				let $vgp_genenum = $('<div>').addClass('vgp-col-genenum').appendTo($div_upper);
				//$('<span>').text( 'count_gene_id' in panel_data ? panel_data.count_gene_id : '0').appendTo($vgp_genenum);
				$('<span>').text( 'count' in panel_data ? panel_data.count : '0').appendTo($vgp_genenum);

				let $div_lower = $('<div>').addClass('list-show_wrapper').appendTo($div_data_panel);

				let count_phenotype = 'count_hpo_id' in panel_data ? panel_data.count_hpo_id : '';
				count_phenotype = utils_isEmpty(count_phenotype) ? 0 : parseInt(count_phenotype);

				let count_gene = 'count' in panel_data ? panel_data.count : '';
				count_gene = utils_isEmpty(count_gene) ? 0 : parseInt(count_gene);

				let url_phenotype = URL_GET_HPO_DATA_BY_PANEL_ID + '?nando_id=' +  nando_id.replace(/NANDO:/,'');

				let url_gene	  = URL_GET_GENE_DATA_BY_PANEL_ID + '?nando_id=' + nando_id.replace(/NANDO:/,'')+'&lang='+language;

				let url_hpo_tooltip = URL_GET_HPO_TOOLTIP_DATA_BY_HPO_ID + '?hpo_id=';
				
				let vgp_collapse_panel_setting_obj = {
					url_phenotype   : url_phenotype,
					url_gene		: url_gene,
					url_hpo_tooltip : url_hpo_tooltip,
					count_phenotype : count_phenotype,
					count_gene	    : count_gene,
					language		: language
				}

				ID_LIST.forEach((item) => {
					if(item.key_id === "nando_id"){
						vgp_collapse_panel_setting_obj[item.key_id]  = nando_id;
						vgp_collapse_panel_setting_obj[item.key_url] = panel_data[item.key_url];
					}else if(item.key_id in panel_data && !utils_isEmpty(panel_data[item.key_id])){
						vgp_collapse_panel_setting_obj[item.key_id]  = panel_data[item.key_id];
						vgp_collapse_panel_setting_obj[item.key_url] = panel_data[item.key_url];
					}
				});
		
				$div_lower.vgp_collapse_panel(vgp_collapse_panel_setting_obj);	
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

			utils_call_update_all_collapse_text_box();
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
			if(utils_isEmpty(uncached_idlist)){
				_hide_loader();
				_show_content();
				_show_result(settings);
				return;
			}

			let url_str = URL_GET_PANEL_DATA_BY_PANEL_ID + '?nando_id=' + (uncached_idlist.join('%2C+').replace(/NANDO:/g, ''));
			_run_ajax(url_str,'GET', null, 'text', true, 
				function(data){
					let obj = utils_parseJson(data);
					let hash = {};
					for(let j=0;j<obj.length; j++){
						//let panel_id = obj[j].mondo_id;
						let nando_url = obj[j].nando_url;
						let tmp = nando_url.split('NANDO_');
						let panel_id = "NANDO:" + tmp[1];
						hash[panel_id] = obj[j];
					}
					_store_panel_data_to_cache(hash);
					if(utils_isFunction(settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE])){
						if(!settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE](settings[SETTINGS_KEY_FILTER])){
							//console.log('filter changed!');
							return;
						}
					}
					_hide_loader();
					_show_content();
					_show_result(settings);
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
			let json_data1 = utils_parseJson(json_data);
			let k = Object.keys(json_data1)[0];
			return json_data1[k];
		}	

		function _search_idlist(settings){

			_hide_content();
			_show_loader();

			// search id
			let is_loaded = _is_idlist_loaded(settings);
			// search panel data
			if(is_loaded){
				if(utils_isFunction(settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE])){
					if(!settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE](settings[SETTINGS_KEY_FILTER])){
						//console.log('filter changed!');
						return;
					}
				}

				let idlist = _get_idlist_from_cache(settings);
				if(utils_isFunction(settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST])){
					settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST](idlist.length);
				}
				_search_panel_data(settings);
				return;
			}

			let url_str = URL_HASH_SEARCH[settings[SETTINGS_KEY_TARGET]];
			if(utils_isEmpty(settings[SETTINGS_KEY_FILTER])){
				url_str = URL_HASH_SEARCH[TARGET_ALL];
			}
			url_str = url_str + '?' + _construct_cache_key(settings);

			_run_ajax(url_str,'GET', null, 'text', true, 
				function(data){
					if(
    					data &&  
						typeof data === 'object' &&  
						!Array.isArray(data) &&  
						'error' in data
					){
						alert('error ocurred during load idlist due to :' +data.error);
						_hide_loader();
						return;
					}else{
						let idlist = _get_panel_list_from_search_result(data);
						_store_idlist_to_cache(settings, idlist);

						if(utils_isFunction(settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE])){
							if(!settings[SETTINGS_KEY_FUNC_CHECK_CONSISTENCE](settings[SETTINGS_KEY_FILTER])){
								//console.log('filter changed!');
								return;
							}
						}
						//console.log('show result for filter (' + settings[SETTINGS_KEY_FILTER] +')');
						if(utils_isFunction(settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST])){
							settings[SETTINGS_KEY_FUNC_AFTER_SEARCH_IDLIST](idlist.length);
						}
						_search_panel_data(settings);
						return;
					}
				},
				function(){
					_hide_loader();
					_show_content();
					return;
				}
			);

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
					if(utils_isFunction(callback))callback(data1);
				}).fail(function(jqXHR, textStatus, errorThrown ) {
					//alert('Server access error:' + textStatus + ":" + errorThrown + '\nURL: ' + url_str);
					if(utils_isFunction(callback_fail)) callback_fail();
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
					if(utils_isFunction(callback))callback(data1);
				}).fail(function(jqXHR, textStatus, errorThrown ) {
					//alert('Server access error:' + textStatus + ":" + errorThrown + '\nURL: ' + url_str);
					if(utils_isFunction(callback_fail)) callback_fail();
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

		function _download_panel(nando_id, panel_id, panel_name){
			let  window_y_offset = window.pageYOffset;
			_hide_content();

			_show_loader(true);

			let ajax_obj_arr = [
				{
					'url': `${URL_LOAD_MULTI_CLASS}?lang=${lang}`,
					'output_data_key': 'multi_class'
				},
				{
					'url': URL_GET_PANEL_AUTOREVIEW_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
					'output_data_key': 'panel_autoreview_gene_data'
				},
				{
					'url': URL_GET_PANEL_REVIEW + '?panel_id='+ panel_id,
					'output_data_key': 'panel_review'
				}
			];

			_run_ajax(`${URL_GET_ALL_PANEL_ID}?lang=${lang}&sort=panel&dir=asc&root_panel_id=${panel_id}`,'GET', null, 'text', true, 
				
				function(response_data){
					all_panel_list = _get_panel_list_from_search_result(response_data);

					for(let row of all_panel_list){
						let nando_id = row[0];
						ajax_obj_arr.push({
							'url':  URL_GET_PANEL_DEFINITIVE_GENE_BY_NANDO_ID + nando_id.replace(/NANDO:/g, ''),
							'output_data_key': 'panel_definitive_gene_data',
							'nando_id': nando_id
						});
					}

					let ret_data = {};
					let total_cnt = ajax_obj_arr.length;
					let completed_cnt = 0;

					ajax_obj_arr.forEach((ajax_obj) => {
					
						_run_ajax(ajax_obj.url,'GET', null, 'text', true, 
							function(data){
								let json_data = JSON.parse(data);
			
								if(ajax_obj.output_data_key === 'panel_definitive_gene_data'){

					            	if(!(ajax_obj.output_data_key in ret_data)){
                						ret_data[ajax_obj.output_data_key] = {};
            						}
            						if(ajax_obj.nando_id in json_data){
                						ret_data[ajax_obj.output_data_key][ajax_obj.nando_id] = json_data[ajax_obj.nando_id];
									}
            					}else{

								ret_data[ajax_obj.output_data_key] = json_data;
								}
								completed_cnt++;
								if(completed_cnt === total_cnt){
									_hide_loader();
									_show_content();
									document.documentElement.scrollTop = document.body.scrollTop = window_y_offset;
									
									let nando_to_panel_id_hash = all_panel_list.reduce((acc, row) => {
										const [nando_id, panel_id, name_en, name_ja] = row;
										acc[nando_id]={};
										acc[nando_id]['panel_id'] = panel_id;
										acc[nando_id]['panel_name'] = lang === 'ja' ? name_ja : name_en;
										return acc;
									}, {});

									ret_data['nando_to_panel_id_hash'] = nando_to_panel_id_hash;

									_create_download_file(ret_data, panel_name+'.tsv');

									return;
								}
							},
							function(){
								_hide_loader();
								_show_content();
								document.documentElement.scrollTop = document.body.scrollTop = window_y_offset;
								return;
							}
						);

					});
				},
				function(){
					_hide_loader();
					_show_content();
					document.documentElement.scrollTop = document.body.scrollTop = window_y_offset;
					return;
				}
			);
		}

		function _create_download_file(ret_data,fileName){

			let rows = [];
			rows.push([
				'panel_disease_id',
				'panel_disease_name',
				'reference_nando_id',
				'disease_name_en',
				'disease_name_ja',
				'ncbi_gene_id',
				'gene_symbol',
				'classification',
				'source',
				'source_url',
				'moi_en',
				'moi_ja'
			]);

			let nando_to_panel_id_hash = ret_data.nando_to_panel_id_hash;

			let moi_hash = ret_data.multi_class.mode_of_inheritance_hash;

			['panel_definitive_gene_data','panel_autoreview_gene_data','panel_review'].forEach((datakey) => {
				let data = ret_data[datakey];
				if(datakey === 'panel_definitive_gene_data' || datakey === 'panel_autoreview_gene_data'){
					Object.keys(data).forEach((itemkey) => {
						let dataArr = data[itemkey];
						for(let item of dataArr){
							rows.push([
								nando_to_panel_id_hash[item.reference_nando_id]['panel_id'],
								nando_to_panel_id_hash[item.reference_nando_id]['panel_name'],
								item.reference_nando_id,
								item.nando_en,
								item.nando_ja,
								item.ncbi_gene_id,
								item.hgnc_gene_symbol,
								item.rating,
								item.source,
								item.source_url,
								(datakey === 'panel_autoreview_gene_data') ? item.moi_en : '',
								(datakey === 'panel_autoreview_gene_data') ? item.moi_ja : ''
							]);
						}
					})
				}else{
					const protocol = window.location.protocol;
					const hostname = window.location.hostname;
					const port     = window.location.port;
					const serverRoot = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
					
					for(let item of data){
						let moi_ids         = item.mode_of_inheritances;
						let moi_idarr       = moi_ids.split(',');
						let moi_name_arr_en = moi_ids.length>0 ? moi_idarr.map(i => moi_hash[i]['name_en']) : [];
						let moi_name_arr_ja = moi_ids.length>0 ? moi_idarr.map(i => moi_hash[i]['name_ja']) : [];
						let moi_en          = moi_name_arr_en.join(',');
						let moi_ja          = moi_name_arr_ja.join(',');

						let urlstr =
							"panel_id="         + encodeURIComponent(item.panel_id)         + "&" +
							"panel_name="       + encodeURIComponent(item.panel_name)       + "&" +
							"nando_id="         + encodeURIComponent(item.nando_id)         + "&" +
							"gene_id="          + encodeURIComponent(item.gene_id)          + "&" +
							"gene_symbol="      + encodeURIComponent(item.gene_symbol)      + "&" +
							"entity_name="      + encodeURIComponent(item.entity_name)      + "&" +
							"entity_type_id="   + encodeURIComponent(item.entity_type_id)   + "&" +
							"rating="           + encodeURIComponent(item.rating)           + "&" +
							"lang="+lang;

						urlstr = `${protocol}//${hostname}${port ? `:${port}` : ''}${URL_PANEL_ENTITY_DETAIL}?${urlstr}`;

						rows.push([
							item.panel_id,
							item.panel_name,
							item.nando_id,
							item.panel_name_en,
							item.panel_name_ja,
							item.gene_id,
							item.gene_symbol,
							item.rating,
							'User review',
							urlstr,
							moi_en,
							moi_ja
						]);
					}					
				}
			});

			let tsvContent = rows.map(row => row.join("\t")).join("\n");
			utils_download_tsvfile(tsvContent,fileName);
		}

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
