;(function ($) {
    const LANGUAGE_JA = 'ja',LANGUAGE_EN = 'en',
          TYPE_TITLE='title',TYPE_NANBYO="nanbyo",TYPE_DISEASE='disease',TYPE_INHERITANCE='inheritance',TYPE_GENDER='gender',TYPE_AGE='age',
          GUIDE_IMG_SRC={
              [TYPE_TITLE]:       '/static/images/pcf/filter.svg',
              [TYPE_NANBYO]:      '/static/images/pcf/nanbyo-guide.svg',
              [TYPE_DISEASE]:     '/static/images/pcf/body-black.svg',
              [TYPE_INHERITANCE]: '/static/images/pcf/dna-black.svg',
              [TYPE_AGE]:         '/static/images/pcf/age-group-black.svg',
              [TYPE_GENDER]:      '/static/images/pcf/genders-black.svg'
          },
          LABEL_TITLE={
              [LANGUAGE_EN]:{
                  [TYPE_TITLE]:       'Basic Filter',
                  [TYPE_NANBYO]:      'Intractable Disease',
                  [TYPE_DISEASE]:     'Disease Category',
                  [TYPE_INHERITANCE]: 'Mode of Inheritance',
                  [TYPE_AGE]:         'Age',
                  [TYPE_GENDER]:      'Gender'
              },
              [LANGUAGE_JA]:{
                  [TYPE_TITLE]:       'Basic Filter',
                  [TYPE_NANBYO]:      '難病',
                  [TYPE_DISEASE]:     '疑い疾患領域',
                  [TYPE_INHERITANCE]: '遺伝形式',
                  [TYPE_AGE]:         '年齢',
                  [TYPE_GENDER]:      '性別',
              }
          },
          DATA_LIST = {
              [TYPE_NANBYO]:[
                  {[LANGUAGE_JA]:'指定難病', [LANGUAGE_EN]:'Designated intractable disease', id:'NANDO:1000001'},
                  {[LANGUAGE_JA]:'小児慢性特定疾病', [LANGUAGE_EN]:'Specific pediatric chronic diseases', id:'NANDO:2000001'},
              ],
              [TYPE_DISEASE]:[
                  {[LANGUAGE_JA]:'症候性疾患',             [LANGUAGE_EN]:'Syndromic',       id:'MONDO:0002254'},
                  {[LANGUAGE_JA]:'染色体異常',             [LANGUAGE_EN]:'Chromosomal',     id:'MONDO:0019040'},
                  {[LANGUAGE_JA]:'発生または形態形成障害', [LANGUAGE_EN]:'Developmental',   id:'MONDO:0021147'},
                  {[LANGUAGE_JA]:'神経系障害',             [LANGUAGE_EN]:'Nervous system',  id:'MONDO:0005071'},
                  {[LANGUAGE_JA]:'精神障害',               [LANGUAGE_EN]:'Psychiatric',     id:'MONDO:0002025'},
                  {[LANGUAGE_JA]:'頭部障害',               [LANGUAGE_EN]:'Head/Brain',      id:'MONDO:0005042', init_class:'hidden'},
                  {[LANGUAGE_JA]:'視覚系障害',             [LANGUAGE_EN]:'Visual system',   id:'MONDO:0024458', init_class:'hidden'},
                  {[LANGUAGE_JA]:'耳鼻科系疾患',           [LANGUAGE_EN]:'Ear/Nose/Throat', id:'MONDO:0024623', init_class:'hidden'},
                  {[LANGUAGE_JA]:'聴覚系障害',             [LANGUAGE_EN]:'Auditory system', id:'MONDO:0002409', init_class:'hidden'},
                  {[LANGUAGE_JA]:'口腔疾患',               [LANGUAGE_EN]:'Oral/Teeth',      id:'MONDO:0006858', init_class:'hidden'},
                  {[LANGUAGE_JA]:'心血管障害',             [LANGUAGE_EN]:'Cardiovascular',  id:'MONDO:0004995', init_class:'hidden'},
                  {[LANGUAGE_JA]:'呼吸器系障害',           [LANGUAGE_EN]:'Respiratory',     id:'MONDO:0005087', init_class:'hidden'},
                  {[LANGUAGE_JA]:'消化器系障害',           [LANGUAGE_EN]:'Digestive',       id:'MONDO:0004335', init_class:'hidden'},
                  {[LANGUAGE_JA]:'肝胆脾障害',             [LANGUAGE_EN]:'Hepatobiliary/Splenic', id:'MONDO:0005154|MONDO:0005281|MONDO:0002332', init_class:'hidden'},
                  {[LANGUAGE_JA]:'尿路系障害',             [LANGUAGE_EN]:'Urinary system',  id:'MONDO:0002118', init_class:'hidden'},
                  {[LANGUAGE_JA]:'生殖器系障害',           [LANGUAGE_EN]:'Reproductive',    id:'MONDO:0005039', init_class:'hidden'},
                  {[LANGUAGE_JA]:'筋骨格系障害',           [LANGUAGE_EN]:'Musculoskeletal', id:'MONDO:0002081', init_class:'hidden'},
                  {[LANGUAGE_JA]:'骨障害',                 [LANGUAGE_EN]:'Bone/Joint',      id:'MONDO:0005381', init_class:'hidden'},
                  {[LANGUAGE_JA]:'皮膚障害',               [LANGUAGE_EN]:'Dermatologic',    id:'MONDO:0005093', init_class:'hidden'},
                  {[LANGUAGE_JA]:'血液障害',               [LANGUAGE_EN]:'Hematologic',     id:'MONDO:0005570', init_class:'hidden'},
                  {[LANGUAGE_JA]:'内分泌系障害',           [LANGUAGE_EN]:'Endocrine',       id:'MONDO:0005151', init_class:'hidden'},
                  {[LANGUAGE_JA]:'代謝疾患',               [LANGUAGE_EN]:'Metabolic',       id:'MONDO:0005066', init_class:'hidden'},
                  {[LANGUAGE_JA]:'新生物',                 [LANGUAGE_EN]:'Neoplasm',        id:'MONDO:0005070', init_class:'hidden'},
                  {[LANGUAGE_JA]:'結合組織障害',           [LANGUAGE_EN]:'Connective tissue', id:'MONDO:0003900', init_class:'hidden'},
                  {[LANGUAGE_JA]:'免疫系障害',             [LANGUAGE_EN]:'Immune system',     id:'MONDO:0005046', init_class:'hidden'},
                  {[LANGUAGE_JA]:'炎症性疾患',             [LANGUAGE_EN]:'Inflammatory',      id:'MONDO:0021166', init_class:'hidden'},
                  {[LANGUAGE_JA]:'ミトコンドリア病',       [LANGUAGE_EN]:'Mitochondrial',     id:'MONDO:0044970', init_class:'hidden'}
              ],
              [TYPE_INHERITANCE]: [
                  {[LANGUAGE_JA]:'常染色体顕性遺伝', [LANGUAGE_EN]:'Autosomal dominant', id:'HP:0000006'},
                  {[LANGUAGE_JA]:'常染色体潜性遺伝', [LANGUAGE_EN]:'Autosomal recessive', id:'HP:0000007'},
                  {[LANGUAGE_JA]:'X連鎖顕性遺伝', [LANGUAGE_EN]:'X-linked dominant', id:'HP:0001423'},
                  {[LANGUAGE_JA]:'X連鎖潜性遺伝', [LANGUAGE_EN]:'X-linked recessive', id:'HP:0001419'},
                  {[LANGUAGE_JA]:'Y連鎖遺伝', [LANGUAGE_EN]:'Y-linked', id:'HP:0001450'},
                  {[LANGUAGE_JA]:'ミトコンドリア遺伝', [LANGUAGE_EN]:'Mitochondrial', id:'HP:0001427'}
              ],
              [TYPE_AGE]:         [
                  {[LANGUAGE_JA]:'先天性',   [LANGUAGE_EN]:'Congenital', id:'AGE:congenital'},
                  {[LANGUAGE_JA]:'出生前',   [LANGUAGE_EN]:'Antenatal',  id:'AGE:antenatal'},
                  {[LANGUAGE_JA]:'新生児期', [LANGUAGE_EN]:'Neonatal',   id:'AGE:neonatal'},
                  {[LANGUAGE_JA]:'幼児期',   [LANGUAGE_EN]:'Infantile',  id:'AGE:infantile'},
                  {[LANGUAGE_JA]:'小児期',   [LANGUAGE_EN]:'Childhood',  id:'AGE:childhood'},
                  {[LANGUAGE_JA]:'少年期',   [LANGUAGE_EN]:'Juvenile',   id:'AGE:juvenile'},
                  {[LANGUAGE_JA]:'成人',     [LANGUAGE_EN]:'Adult',      id:'AGE:adult'}
              ],
              [TYPE_GENDER]:      [
                  {[LANGUAGE_JA]:'男性', [LANGUAGE_EN]:'Male',   id:'GENDER:male'},
                  {[LANGUAGE_JA]:'女性', [LANGUAGE_EN]:'Female', id:'GENDER:female'}
              ]
          };

    const OBJECT_KEY="pcffilterPanelObject",
          SETTINGS_KEY="pcffilterPanelObject_settings",SETTING_KEY_LANG='lang',SETTING_KEY_SCHEME='scheme',
          SCHEME_LIST='scheme-list',SCHEME_GUIDE='scheme-guide',SCHEME_STANDARD=1280,
          SETTING_KEY_STATUS='PCF-FILTER-STATUS',STATUS_OPEN='STATUS-OPEN',STATUS_CLOSE='STATUS-CLOSE',
          SETTING_KEY_LOGICAL='logical',LOGICAL_OR='or',LOGICAL_AND='and',LOGICAL_NOT='not',
          SETTING_KEY_GUIDE_TABLE_PANEL_ID='id_guide_table_panel',
          SETTING_KEY_GUIDE_BTN_ID_CLASS='filter-guide-button-class',
          SETTING_KEY_ON_FILTER_CHANGE='on_filter_change',
          SETTING_KEY_PRE_LIST='prePopulate';

    function _judge_scheme_by_body_width(){
        let body_width =  $('body').width();
        if(body_width <= SCHEME_STANDARD) return SCHEME_GUIDE;
        return SCHEME_LIST;
    }

    var DEFAULT_SETTINGS = {
        [SETTING_KEY_LANG]:   LANGUAGE_JA,
        [SETTING_KEY_STATUS]: STATUS_CLOSE,
        [SETTING_KEY_SCHEME]: SCHEME_LIST,
        [SETTING_KEY_LOGICAL]:LOGICAL_OR,
        [SETTING_KEY_GUIDE_TABLE_PANEL_ID]:'pcf-filter-guide-table-panel',
        [SETTING_KEY_GUIDE_BTN_ID_CLASS]:'pcf-filter-guide-button',
        [SETTING_KEY_ON_FILTER_CHANGE]: null,
        [SETTING_KEY_PRE_LIST]:''
    };

    var methods = {
        init: function(options) {
            var settings = $.extend({}, DEFAULT_SETTINGS, options || {});
            if(settings[SETTING_KEY_LANG] !== LANGUAGE_JA) settings[SETTING_KEY_LANG]=LANGUAGE_EN;
            if(settings[SETTING_KEY_PRE_LIST]){
				if(settings[SETTING_KEY_PRE_LIST].indexOf('AND_') >= 0){
					settings[SETTING_KEY_LOGICAL] = LOGICAL_AND;
				}else if(settings[SETTING_KEY_PRE_LIST].indexOf('NOT_') >= 0){
					settings[SETTING_KEY_LOGICAL] = LOGICAL_NOT;
				}
			}
            return this.each(function () {
                $(this).data(SETTINGS_KEY, settings);
                $(this).data(OBJECT_KEY, new $.pcf_filter(this, settings));
            });
        },
        clear_all_filters: function(){
            this.data(OBJECT_KEY).clear_all_filters();
            return this;
        },
        get_url_str: function(){
            let str = this.data(OBJECT_KEY).get_url_str();
            return str;
        },
        load_filter_list_text: function(id_list,lang){
            let ret = [];
            let logical = "or";
            if(id_list.indexOf('AND_')>=0){
                logical = "and";
            }else if(id_list.indexOf('NOT_')>=0){
                logical = "not";
			}

            let arr = id_list.replaceAll('AND_','').replaceAll('NOT_','').split(',');
            for(let type in DATA_LIST){
                let items_arr = DATA_LIST[type];
                for(let j=0;j<items_arr.length;j++){
                    if(arr.includes(items_arr[j].id)){
                        ret.push(items_arr[j][lang]);
                    }
                }        
            }
            
			if(logical === "not"){
				return 'not ' + ret.join(' && not ');
			}else{
	            return ret.join(' ' + logical + ' ');
			}
        },
		get_scheme: function(){
			return _judge_scheme_by_body_width();
		}
    };

    $.fn.pcf_filter = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
    };

    $.pcf_filter = function (div_pcf_filter_panel, settings) {

        var pre_hash = {};
        if(settings[SETTING_KEY_PRE_LIST]){
            let list = settings[SETTING_KEY_PRE_LIST].split(',');
            list.forEach(filter_item => {
                let key = filter_item.replace('AND_','').replace('NOT_','');
                pre_hash[key] = 1;
            });
        }
        // init UI
        // root panel of list 
        var $root_panel = $(div_pcf_filter_panel);

        // panel of guide(modal)
        var $filter_guide_table_panel = $("#"+settings[SETTING_KEY_GUIDE_TABLE_PANEL_ID]);

        // button with turn on or of guide table
		$(document).on('click', '.'+settings[SETTING_KEY_GUIDE_BTN_ID_CLASS], function() {
            if($filter_guide_table_panel.is(':visible') === false){
                _open_guide_table_panel();
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        });

        const ID_PCF_FILTER_LIST_PANEL = 'pcf-filter-list-panel';
        var $filter_list_panel = $('<div>').addClass('pcf-filter-wrapper').attr('id',ID_PCF_FILTER_LIST_PANEL).appendTo($root_panel);

        const ID_LOGICAL_OR_LIST  = 'PCF-FILTER-LOGICAL-CTL-OR-LIST',
              ID_LOGICAL_AND_LIST = 'PCF-FILTER-LOGICAL-CTL-AND-LIST',
              ID_LOGICAL_NOT_LIST = 'PCF-FILTER-LOGICAL-CTL-NOT-LIST',
              ID_LOGICAL_OR_TBL   = 'PCF-FILTER-LOGICAL-CTL-OR-TBL',
              ID_LOGICAL_AND_TBL  = 'PCF-FILTER-LOGICAL-CTL-AND-TBL',
              ID_LOGICAL_NOT_TBL  = 'PCF-FILTER-LOGICAL-CTL-NOT-TBL';

        // init list panel
        let list_panel_lst = [TYPE_TITLE,TYPE_NANBYO,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_AGE];
        if(settings[SETTING_KEY_LANG] !=  LANGUAGE_JA){
            list_panel_lst = [TYPE_TITLE,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_AGE];
        }

        list_panel_lst.forEach(type => {

            let $wrapper_div = $('<div>').addClass("d-flex flex-column filter-block").addClass(type).appendTo($filter_list_panel);

            let id_list_wrapper_div = type + '-list_wrapper_div';

            let $header_div = $('<div>').addClass('header d-flex align-items-center').addClass(type).appendTo($wrapper_div);
            let $header_sub_div_l = $('<div>').addClass('d-flex flex-row align-items-center').appendTo($header_div);
            $('<img>').prop('src',GUIDE_IMG_SRC[type]).addClass(type === TYPE_TITLE?'mr-1':'ml-1 mr-1').appendTo($header_sub_div_l);
            $('<span>').text(LABEL_TITLE[settings[SETTING_KEY_LANG]][type]).appendTo($header_sub_div_l);
            let $header_sub_div_r = $('<div>').addClass('ml-auto').appendTo($header_div);
            
            if(type === TYPE_TITLE){
                let $btn_div = $('<div>').addClass('d-flex logical-panel').appendTo($wrapper_div);
                _construct_logical_btn_list($btn_div, 'list');
            }else{

                let $list_wrapper_div = $('<div>').attr('id', id_list_wrapper_div).addClass('list-panel').appendTo($wrapper_div);
                for(let idx=0; idx<DATA_LIST[type].length; idx++){
                    _construct_filter_item($list_wrapper_div,type,idx,DATA_LIST[type][idx],'list');
                }

                if(type === TYPE_DISEASE){
                   let $wrapper_ctl = $('<div>').addClass('inside-pcf-filter-guide-table item-panel ctl')
						.data('wrapper_id',id_list_wrapper_div)
						.data('action', 'show')
						.click(function(){
							let $btn = $(this);
							let wrapper_id = $btn.data('wrapper_id');
							let action = $btn.data('action');
							if(action === 'show'){
								$('#'+wrapper_id).find('.hidden').addClass('show');
								$btn.find('.text').text('Close');
								$btn.find('.material-symbols-outlined').text('keyboard_double_arrow_up');
								$btn.data("action", 'hide');
							}else{
								$('#'+wrapper_id).find('.hidden').removeClass('show');
								$btn.find('.text').text('More');
								$btn.find('.material-symbols-outlined').text('keyboard_double_arrow_down');
								$btn.data("action", 'show');
							}
						})
						.appendTo($list_wrapper_div);
					$('<span>').addClass('text').text('More').appendTo($wrapper_ctl);
					$('<span>').addClass("material-symbols-outlined").text('keyboard_double_arrow_down').appendTo($wrapper_ctl);
                }
            }
        });
        //$filter_list_panel.hide();

        $filter_guide_table_panel.addClass("inside-pcf-filter-guide-table");
        var $filter_guide_table       = $('<table>').addClass("inside-pcf-filter-guide-table").addClass("pcf-filter-guide-table").appendTo($filter_guide_table_panel);
        var $filter_guide_table_tbody = $('<tbody>').addClass("inside-pcf-filter-guide-table").appendTo($filter_guide_table);

        //let list_guide_table_lst = [TYPE_TITLE,TYPE_NANBYO,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_AGE,TYPE_GENDER];
        let list_guide_table_lst = [TYPE_TITLE,TYPE_NANBYO,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_AGE];
        if(settings[SETTING_KEY_LANG] !=  LANGUAGE_JA){
            //list_guide_table_lst = [TYPE_TITLE,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_AGE,TYPE_GENDER];
            list_guide_table_lst = [TYPE_TITLE,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_AGE];
        }

        list_guide_table_lst.forEach(type => {
            let $tr_header = $('<tr>').addClass("inside-pcf-filter-guide-table").addClass('header-row').addClass(type).appendTo($filter_guide_table_tbody);
            let $td_header = $('<td>').addClass("inside-pcf-filter-guide-table").prop('colspan','3').appendTo($tr_header);
            if(type===TYPE_TITLE){
               let $logical_wrapper = $('<div>').addClass("inside-pcf-filter-guide-table").addClass("logical-panel").addClass('d-flex flex-row').appendTo($td_header);
               _construct_logical_btn_list($logical_wrapper, 'table');
            }else{
                let $header_div = $('<div>').addClass("inside-pcf-filter-guide-table")
                                            .addClass("header-panel").addClass('d-flex flex-row mt-2').appendTo($td_header);
                let $header_sub_div_l = $('<div>').addClass("inside-pcf-filter-guide-table")
                                                  .addClass('d-flex flex-row align-items-center').appendTo($header_div);
                $('<img>').prop('src',GUIDE_IMG_SRC[type])
                          .addClass("inside-pcf-filter-guide-table")
                          .addClass('ml-2 mr-2').appendTo($header_sub_div_l);
                let txt = LABEL_TITLE[settings[SETTING_KEY_LANG]][type];
                $('<span>').addClass("inside-pcf-filter-guide-table").text(txt.replace('　','')).appendTo($header_sub_div_l);
                let $header_sub_div_r = $('<div>').addClass("inside-pcf-filter-guide-table").addClass('ml-auto mr-2').appendTo($header_div);
                let $ctl = $('<span>').addClass("inside-pcf-filter-guide-table").addClass("material-symbols-outlined").text('keyboard_arrow_up').appendTo($header_sub_div_r);

                let class_data_row = type + "-table-row";
                $header_div.data('class_data_row', class_data_row).click(function(){
                    let $header = $(this);
                    let class_row = $header.data('class_data_row');
                    if($header.hasClass('collapsed')){
                        $header.removeClass('collapsed');
                        $filter_guide_table_tbody.find('.'+class_row).show();
                        $header.find(".material-symbols-outlined").text('keyboard_arrow_up');
                    }else{
                        $header.addClass('collapsed');
                        $filter_guide_table_tbody.find('.'+class_row).hide(); 
                        $header.find(".material-symbols-outlined").text('keyboard_arrow_down');
                    }
                });

                // data rows
                let $datarow;
                for(let i=0;i<DATA_LIST[type].length;i++){

                    let item = DATA_LIST[type][i];

                    let divisor = 2;
                    if(type === TYPE_DISEASE) divisor  = 3;
                    if( i % divisor === 0){
                        $datarow =$('<tr>').addClass("inside-pcf-filter-guide-table").addClass('data-row').addClass(class_data_row).appendTo($filter_guide_table_tbody);
                    }

                    let $td = $('<td>').addClass("inside-pcf-filter-guide-table").appendTo($datarow);
                    if(divisor === 2 && i % divisor === 1) $td.prop('colspan','2');

                    _construct_filter_item($td,type,i,item,'table');
                }
            }
        });


        // init scheme
        setTimeout(function(){ 
            //SETTING_KEY_SCHEME
            _update_scheme();
        }, 100);

        $(window).on('resize', function(e) {
            _close_guide_table_panel();
            //$filter_list_panel.hide();
            //$filter_guide_panel.show();
            _update_scheme();
        });

        function _open_guide_table_panel(){
            if($filter_guide_table_panel.is(':visible') === false){
                $filter_guide_table_panel.show();
                $(document.body).on('click', _pcf_filter_table_eventClick);
                $(document.body).on('keydown', _pcf_filter_table_eventKeydown)
            }
        }

        function _close_guide_table_panel(){
            if($filter_guide_table_panel.is(':visible')){
                $filter_guide_table_panel.hide();
                $(document.body).off('keydown', _pcf_filter_table_eventKeydown);
                $(document.body).off('click', _pcf_filter_table_eventClick);
            }
        }

        function _pcf_filter_table_eventClick(e){
            let $target = $(e.target);
            if( !$target.hasClass('inside-pcf-filter-guide-table')){
                setTimeout(function(){
                    _close_guide_table_panel();
                },51);
                return false;
            }
        }

        function _pcf_filter_table_eventKeydown(e){
            setTimeout(function(){
                _close_guide_table_panel();
            },51);
            return false;
        }


        function _update_scheme(){
            let scheme = _judge_scheme_by_body_width();
            _update_settings(SETTING_KEY_SCHEME, scheme);
            $root_panel.removeClass(SCHEME_LIST).removeClass(SCHEME_GUIDE).addClass(scheme);
            $('.pcf-filter-guide-button').removeClass(SCHEME_LIST).removeClass(SCHEME_GUIDE).addClass(scheme);
        }

        function _update_settings(key,val){
            let current_settings = $root_panel.data(SETTINGS_KEY);
            let new_settings = $.extend(true,{}, current_settings, {[key]: val});
            $root_panel.data(SETTINGS_KEY, new_settings);
        }


        function _get_checked_filter_items(){
            let inputArr = $filter_guide_table_panel.find("input[name='pcf-filter-item-tbl']:checked");
            let val_arr = [];
            for(let i=0;i<inputArr.length;i++){
                let content = $(inputArr[i]).val();
                val_arr.push(content);
            }
            return val_arr;
        }

        function _clear_all_check(){
            $filter_guide_table_panel.find("input[name='pcf-filter-item-tbl']:checked").prop('checked',false);
            $filter_list_panel.find("input[name='pcf-filter-item-list']:checked").prop('checked',false);
        }

        function _get_url_str(){
            let filter_arr = _get_checked_filter_items();
            if(filter_arr.length===0) return '';

            let current_settings = $root_panel.data(SETTINGS_KEY);
            let logical = current_settings[SETTING_KEY_LOGICAL];
            if(logical===LOGICAL_OR){
                return filter_arr.join(',');
            }else if(logical===LOGICAL_AND){
                return filter_arr.join(',AND_');
            }else{
                return 'NOT_' + filter_arr.join(',NOT_');
            }
        }

        function _on_filter_change(){

            setTimeout(function(){
                _close_guide_table_panel();
            },51);

            let current_settings = $root_panel.data(SETTINGS_KEY);
            let callback = current_settings[SETTING_KEY_ON_FILTER_CHANGE];
            if($.isFunction(callback)){
                callback();
            }
        }

        function _construct_filter_item($container,type,idx,item,list_or_table){

            let ID_FILTER_ITEM_LIST = 'pcf-filter-item-list-'+type+"-"+idx;
            let ID_FILTER_ITEM_TBL  = 'pcf-filter-item-tbl-'+type+"-"+idx;

            let init_class = (list_or_table === 'list' && 'init_class' in item) ? item.init_class : '';

            let $item_wrapper = $('<div>').addClass(`inside-pcf-filter-guide-table d-flex flex-row align-items-baseline item-panel ${init_class}`).appendTo($container);
            let $d1 =  $('<div>').addClass("inside-pcf-filter-guide-table").appendTo($item_wrapper);

            $('<input>').addClass("inside-pcf-filter-guide-table").attr('type', 'checkbox')
                        .prop('checked', item.id in pre_hash ? true : false)
                        .attr('id',list_or_table==='list'?ID_FILTER_ITEM_LIST:ID_FILTER_ITEM_TBL)
                        .data('relative_id',list_or_table==='list'?ID_FILTER_ITEM_TBL:ID_FILTER_ITEM_LIST)
                        .attr('name', list_or_table==='list'?'pcf-filter-item-list':'pcf-filter-item-tbl')
                        .click(function(){
                            let $btn = $(this);
                            let checked = $btn.prop('checked');
                            let relative_id = $btn.data('relative_id');
                            $('#'+relative_id).prop('checked',checked);
                            _on_filter_change();
                        })
                        .val(item.id).appendTo($d1);

            $('<div>').addClass("inside-pcf-filter-guide-table").text(item[settings[SETTING_KEY_LANG]]).addClass(list_or_table==='list'?'':'ml-2').appendTo($item_wrapper);
        }

        function _construct_logical_btn_list($container,list_or_table){
            [
              {
                logical:     LOGICAL_OR, 
                class:       'left PCF-LOGICAL-BTN',
                id:          list_or_table==='list' ? ID_LOGICAL_OR_LIST  : ID_LOGICAL_OR_TBL,
                relative_id: list_or_table==='list' ? ID_LOGICAL_OR_TBL   : ID_LOGICAL_OR_LIST
              },
              {
                logical:     LOGICAL_AND,
                class:       'middle PCF-LOGICAL-BTN',
                id:          list_or_table==='list' ? ID_LOGICAL_AND_LIST  : ID_LOGICAL_AND_TBL,
                relative_id: list_or_table==='list' ? ID_LOGICAL_AND_TBL   : ID_LOGICAL_AND_LIST
              },
              {
                logical:     LOGICAL_NOT,
                class:       'right PCF-LOGICAL-BTN',
                id:          list_or_table==='list' ? ID_LOGICAL_NOT_LIST  : ID_LOGICAL_NOT_TBL,
                relative_id: list_or_table==='list' ? ID_LOGICAL_NOT_TBL   : ID_LOGICAL_NOT_LIST
              },
            ].forEach(item => {
                
                $('<div>').addClass(list_or_table==='list' ? 'flex-fill ctl' : 'ctl inside-pcf-filter-guide-table')
                          .addClass(item.class)
                          .addClass(settings[SETTING_KEY_LOGICAL]===item.logical?'selected':'')
                          .attr('id',item.id).data('relative_id',item.relative_id)
                          .click(function(){

                               let $btn = $(this);

                               if($btn.hasClass('selected')) return;

                               let relative_id = $btn.data('relative_id');
                               $('.PCF-LOGICAL-BTN').removeClass('selected');
                               $btn.addClass('selected');
                               $("#"+relative_id).addClass('selected');

                               _update_settings(SETTING_KEY_LOGICAL, $btn.text().toLowerCase());

                               //let selected_filters_arr = _get_checked_filter_items();
                               //if(selected_filters_arr.length > 1) _on_filter_change();
                               _on_filter_change();
                          })
                          .text(item.logical.toUpperCase()).appendTo($container);
            });
        }


        // public functions
        this.clear_all_filters = function(){
            _clear_all_check();
        };

        this.get_url_str = function(){
            return _get_url_str();
        };

    };
}(jQuery));
