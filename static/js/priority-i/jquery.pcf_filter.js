;(function ($) {
    const LANGUAGE_JA = 'ja',LANGUAGE_EN = 'en',
          TYPE_TITLE='title',TYPE_NANBYO="nanbyo",TYPE_DISEASE='disease',TYPE_INHERITANCE='inheritance',TYPE_GENDER='gender',TYPE_AGE='age',
          GUIDE_IMG_SRC={
              [TYPE_TITLE]:       '/static/images/priority-i/filter.svg',
              [TYPE_NANBYO]:      '/static/images/priority-i/nanbyo-guide.svg',
              [TYPE_DISEASE]:     '/static/images/priority-i/body.svg',
              [TYPE_INHERITANCE]: '/static/images/priority-i/dna.svg',
              [TYPE_GENDER]:      '/static/images/priority-i/genders.svg',
              [TYPE_AGE]:         '/static/images/priority-i/age-group.svg'
          },
          LABEL_TITLE={
              [LANGUAGE_EN]:{
                  [TYPE_TITLE]:       'Narrow down the disease',
                  [TYPE_NANBYO]:      'Intractable disease',
                  [TYPE_DISEASE]:     'Suspected　 Disease Area',
                  [TYPE_INHERITANCE]: 'Mode of inheritance',
                  [TYPE_GENDER]:      'Gender',
                  [TYPE_AGE]:         'Age'
              },
              [LANGUAGE_JA]:{
                  [TYPE_TITLE]:       '疾患を絞り込む',
                  [TYPE_NANBYO]:      '難病',
                  [TYPE_DISEASE]:     '疑い疾患領域',
                  [TYPE_INHERITANCE]: '遺伝形式',
                  [TYPE_GENDER]:      '性別',
                  [TYPE_AGE]:         '年齢'
              }
          },
          DATA_LIST = {
              [TYPE_NANBYO]:[
                  {[LANGUAGE_JA]:'指定難病', [LANGUAGE_EN]:'designated incurable disease', id:'NANDO:1000001'},
                  {[LANGUAGE_JA]:'小児慢性特定疾病', [LANGUAGE_EN]:'Infant Chronic Specific Diseases', id:'NANDO:2000001'},
              ],
              [TYPE_DISEASE]:[
                  {[LANGUAGE_JA]:'発生または形態形成障害', [LANGUAGE_EN]:'disorder of development or morphogenesis', id:'MONDO:0021147'},
                  {[LANGUAGE_JA]:'神経系障害', [LANGUAGE_EN]:'nervous system disorder', id:'MONDO:0005071'},
                  {[LANGUAGE_JA]:'精神障害', [LANGUAGE_EN]:'psychiatric disorder', id:'MONDO:0002025'},
                  {[LANGUAGE_JA]:'頭部障害', [LANGUAGE_EN]:'head disease', id:'MONDO:0005042'},
                  {[LANGUAGE_JA]:'視覚系障害', [LANGUAGE_EN]:'disease of visual system', id:'MONDO:0024458'},
                  {[LANGUAGE_JA]:'耳鼻科系疾患', [LANGUAGE_EN]:'otorhinolaryngologic disease', id:'MONDO:0024623'},
                  {[LANGUAGE_JA]:'聴覚系障害', [LANGUAGE_EN]:'auditory system disease', id:'MONDO:0002409'},
                  {[LANGUAGE_JA]:'口腔疾患', [LANGUAGE_EN]:'mouth disease', id:'MONDO:0006858'},
                  {[LANGUAGE_JA]:'心血管障害', [LANGUAGE_EN]:'cardiovascular disease', id:'MONDO:0004995'},
                  {[LANGUAGE_JA]:'呼吸器系障害', [LANGUAGE_EN]:'respiratory system disease', id:'MONDO:0005087'},
                  {[LANGUAGE_JA]:'消化器系障害', [LANGUAGE_EN]:'digestive system disease', id:'MONDO:0004335'},
                  {[LANGUAGE_JA]:'肝胆脾障害', [LANGUAGE_EN]:'liver/gallbladder/splenic disease', id:'MONDO:0005154|MONDO:0005281|MONDO:0002332'},
                  {[LANGUAGE_JA]:'尿路系障害', [LANGUAGE_EN]:'urinary system disease', id:'MONDO:0002118'},
                  {[LANGUAGE_JA]:'生殖器系障害', [LANGUAGE_EN]:'reproductive system disease', id:'MONDO:0005039'},
                  {[LANGUAGE_JA]:'筋骨格系障害', [LANGUAGE_EN]:'musculoskeletal system disease', id:'MONDO:0002081'},
                  {[LANGUAGE_JA]:'骨障害', [LANGUAGE_EN]:'bone disease', id:'MONDO:0005381'},
                  {[LANGUAGE_JA]:'皮膚障害', [LANGUAGE_EN]:'skin disease', id:'MONDO:0005093'},
                  {[LANGUAGE_JA]:'血液障害', [LANGUAGE_EN]:'hematologic disease', id:'MONDO:0005570'},
                  {[LANGUAGE_JA]:'内分泌系障害', [LANGUAGE_EN]:'endocrine system disease', id:'MONDO:0005151'},
                  {[LANGUAGE_JA]:'代謝疾患', [LANGUAGE_EN]:'metabolic disease', id:'MONDO:0005066'},
                  {[LANGUAGE_JA]:'新生物', [LANGUAGE_EN]:'neoplasm (disease)', id:'MONDO:0005070'},
                  {[LANGUAGE_JA]:'結合組織障害', [LANGUAGE_EN]:'connective tissue disease', id:'MONDO:0003900'},
                  {[LANGUAGE_JA]:'免疫系障害', [LANGUAGE_EN]:'immune system disorder', id:'MONDO:0005046'},
                  {[LANGUAGE_JA]:'炎症性疾患', [LANGUAGE_EN]:'inflammatory disease', id:'MONDO:0021166'},
                  {[LANGUAGE_JA]:'染色体異常', [LANGUAGE_EN]:'chromosomal anomaly', id:'MONDO:0019040'},
                  {[LANGUAGE_JA]:'症候性疾患', [LANGUAGE_EN]:'syndromic disease', id:'MONDO:0002254'},
                  {[LANGUAGE_JA]:'ミトコンドリア病', [LANGUAGE_EN]:'mitochondrial disease', id:'MONDO:0044970'}
              ],
              [TYPE_INHERITANCE]: [
                  {[LANGUAGE_JA]:'常染色体顕性遺伝', [LANGUAGE_EN]:'Autosomal dominant inheritance', id:'HP:0000006'},
                  {[LANGUAGE_JA]:'常染色体潜性遺伝', [LANGUAGE_EN]:'Autosomal recessive inheritance', id:'HP:0000007'},
                  {[LANGUAGE_JA]:'X連鎖顕性遺伝', [LANGUAGE_EN]:'X-linked dominant inheritance', id:'HP:0001423'},
                  {[LANGUAGE_JA]:'X連鎖潜性遺伝', [LANGUAGE_EN]:'X-linked recessive inheritance', id:'HP:0001419'},
                  {[LANGUAGE_JA]:'Y連鎖遺伝', [LANGUAGE_EN]:'Y-linked inheritance', id:'HP:0001450'},
                  {[LANGUAGE_JA]:'ミトコンドリア遺伝', [LANGUAGE_EN]:'Mitochondrial inheritance', id:'HP:0001427'}
              ],
              [TYPE_GENDER]:      [
                  {[LANGUAGE_JA]:'男性', [LANGUAGE_EN]:'Male',   id:'GENDER:male'},
                  {[LANGUAGE_JA]:'女性', [LANGUAGE_EN]:'Female', id:'GENDER:female'}
              ],
              [TYPE_AGE]:         [
                  {[LANGUAGE_JA]:'先天性',   [LANGUAGE_EN]:'Congenital', id:'AGE:congenital'},
                  {[LANGUAGE_JA]:'出生前',   [LANGUAGE_EN]:'Antenatal',  id:'AGE:antenatal'},
                  {[LANGUAGE_JA]:'新生児期', [LANGUAGE_EN]:'Neonatal',   id:'AGE:neonatal'},
                  {[LANGUAGE_JA]:'幼児期',   [LANGUAGE_EN]:'Infantile',  id:'AGE:infantile'},
                  {[LANGUAGE_JA]:'小児期',   [LANGUAGE_EN]:'Childhood',  id:'AGE:childhood'},
                  {[LANGUAGE_JA]:'少年期',   [LANGUAGE_EN]:'Juvenile',   id:'AGE:juvenile'},
                  {[LANGUAGE_JA]:'成人',     [LANGUAGE_EN]:'Adult',      id:'AGE:adult'}
              ]
          };

    const OBJECT_KEY="pcffilterPanelObject",
          SETTINGS_KEY="pcffilterPanelObject_settings",SETTING_KEY_LANG='lang',SETTING_KEY_SCHEME='scheme',
          SCHEME_LIST='scheme-list',SCHEME_GUIDE='scheme-guide',SCHEME_STANDARD=1270,
          SETTING_KEY_STATUS='PCF-FILTER-STATUS',STATUS_OPEN='STATUS-OPEN',STATUS_CLOSE='STATUS-CLOSE',
          SETTING_KEY_LOGICAL='logical',LOGICAL_OR='or',LOGICAL_AND='and',
          SETTING_KEY_ON_FILTER_CHANGE='on_filter_change',
          SETTING_KEY_PRE_LIST='prePopulate';

    function _judge_scheme_by_body_width(){
        return SCHEME_LIST;
    }

    var DEFAULT_SETTINGS = {
        [SETTING_KEY_LANG]:                 LANGUAGE_JA,
        [SETTING_KEY_STATUS]:               STATUS_CLOSE,
        [SETTING_KEY_SCHEME]:               SCHEME_LIST,
        [SETTING_KEY_LOGICAL]:              LOGICAL_OR,
        [SETTING_KEY_ON_FILTER_CHANGE]:     null,
        [SETTING_KEY_PRE_LIST]:             ''
    };

    var methods = {
        init: function(options) {
            var settings = $.extend({}, DEFAULT_SETTINGS, options || {});
            if(settings[SETTING_KEY_LANG] !== LANGUAGE_JA) settings[SETTING_KEY_LANG]=LANGUAGE_EN;
            if(settings[SETTING_KEY_PRE_LIST] && settings[SETTING_KEY_PRE_LIST].indexOf('AND_') >= 0) settings[SETTING_KEY_LOGICAL] = LOGICAL_AND;
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
            }
            let arr = id_list.replaceAll('AND_','').split(',');
            for(let type in DATA_LIST){
                let items_arr = DATA_LIST[type];
                for(let j=0;j<items_arr.length;j++){
                    if(arr.includes(items_arr[j].id)){
                        ret.push(items_arr[j][lang]);
                    }
                }        
            }
            
            return ret.join(' ' + logical + ' ');
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

		var id_root_pcf_filter_panel = div_pcf_filter_panel.id;

        var pre_hash = {};
        if(settings[SETTING_KEY_PRE_LIST]){
            let list = settings[SETTING_KEY_PRE_LIST].split(',');
            list.forEach(filter_item => {
                let key = filter_item.replace('AND_','');
                pre_hash[key] = 1;
            });
        }
        // init UI
        var $root_panel = $(div_pcf_filter_panel);

        const ID_PCF_FILTER_GUIDE_PANEL = 'pcf-filter-guide-panel';
        var $filter_guide_panel = $('<div>').addClass('pcf-filter-wrapper').attr('id', ID_PCF_FILTER_GUIDE_PANEL).appendTo($root_panel);

        const ID_PCF_FILTER_LIST_PANEL = 'pcf-filter-list-panel';
        var $filter_list_panel = $('<div>').addClass('pcf-filter-wrapper').attr('id',ID_PCF_FILTER_LIST_PANEL).appendTo($root_panel);

        const ID_LOGICAL_OR_LIST  = 'PCF-FILTER-LOGICAL-CTL-OR-LIST',
              ID_LOGICAL_AND_LIST = 'PCF-FILTER-LOGICAL-CTL-AND-LIST',
              ID_LOGICAL_OR_TBL   = 'PCF-FILTER-LOGICAL-CTL-OR-TBL',
              ID_LOGICAL_AND_TBL  = 'PCF-FILTER-LOGICAL-CTL-AND-TBL';

        $filter_guide_panel.css({'cursor':'pointer','display':'none'}).click(function(event){
			$filter_list_panel.show();
			$filter_guide_panel.hide();
			event.stopPropagation();
			event.preventDefault();
			return false;
        });

        // init guide panel
        //[TYPE_TITLE,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_GENDER,TYPE_AGE].forEach(type => {
        [TYPE_TITLE,TYPE_DISEASE].forEach(type => {
            let $div = $('<div>').addClass("pcf-filter-guide-btn").addClass(type).appendTo($filter_guide_panel);
            $('<img>').prop('src', GUIDE_IMG_SRC[type]).appendTo($div);
        });

        // init list panel
        //[TYPE_TITLE,TYPE_DISEASE,TYPE_INHERITANCE,TYPE_GENDER,TYPE_AGE].forEach(type => {
        [TYPE_DISEASE].forEach(type => {
            let $wrapper_div = $('<div>').addClass("d-flex flex-column filter-block mb-2").addClass(type).appendTo($filter_list_panel);

            let $header_div = $('<div>').addClass('header d-flex align-items-center').addClass(type).appendTo($wrapper_div);
            let id_list_wrapper_div = id_root_pcf_filter_panel + "-" +type + '-list_wrapper_div';

            //let $header_sub_div_l = $('<div>').addClass('d-flex flex-row align-items-center').appendTo($header_div);
            let $header_sub_div_l = $('<div>').css({'white-space': 'nowrap'}).appendTo($header_div);
            $('<img>').prop('src',GUIDE_IMG_SRC[type]).addClass(type === TYPE_TITLE?'mr-1':'ml-1 mr-1').appendTo($header_sub_div_l);
            $('<span>').css({'white-space': 'nowrap'}).text(LABEL_TITLE[settings[SETTING_KEY_LANG]][type]).appendTo($header_sub_div_l);

            let $header_sub_div_r = $('<div>').addClass('ml-auto').appendTo($header_div);
            let $ctl = $('<span>').addClass("material-symbols-outlined").text(type === TYPE_TITLE?'chevron_left':'keyboard_arrow_up').appendTo($header_sub_div_r);
            if(type === TYPE_TITLE){
                $header_div.click(function(){
                    $filter_guide_panel.show();
                    $filter_list_panel.hide();
                });
            }else{
                $header_div.data('id_list_wrapper_div',id_list_wrapper_div).click(function(){
                    let $header = $(this);
                    let id_list_wrapper = $header.data('id_list_wrapper_div');
                    if($header.hasClass('collapsed')){
                        $header.removeClass('collapsed');
                        //$('#'+id_list_wrapper).show();
						$('#'+id_list_wrapper).show();
                        $header.find(".material-symbols-outlined").text('keyboard_arrow_up');
                    }else{
                        $header.addClass('collapsed');
                        //$('#'+id_list_wrapper).hide();
						$('#'+id_list_wrapper).hide();
                        $header.find(".material-symbols-outlined").text('keyboard_arrow_down');
                    }
                });
            }

            if(type === TYPE_TITLE){
            }else{

                let $list_wrapper_div = $('<div>').attr('id', id_list_wrapper_div).addClass('list-panel').appendTo($wrapper_div);
                for(let idx=0; idx<DATA_LIST[type].length; idx++){
                    _construct_filter_item($list_wrapper_div,type,idx,DATA_LIST[type][idx],'list');
                }
            }
        });

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
        }

        function _update_settings(key,val){
            let current_settings = $root_panel.data(SETTINGS_KEY);
            let new_settings = $.extend(true,{}, current_settings, {[key]: val});
            $root_panel.data(SETTINGS_KEY, new_settings);
        }


        function _get_checked_filter_items(){
            let inputArr = $filter_list_panel.find("input[name='pcf-filter-item-list']:checked");
            let val_arr = [];
            for(let i=0;i<inputArr.length;i++){
                let content = $(inputArr[i]).val();
                val_arr.push(content);
            }
            return val_arr;
        }

        function _clear_all_check(){
            $filter_list_panel.find("input[name='pcf-filter-item-list']:checked").prop('checked',false);
        }

        function _get_url_str(){
            let filter_arr = _get_checked_filter_items();
            if(filter_arr.length===0) return '';

            let current_settings = $root_panel.data(SETTINGS_KEY);
            let logical = current_settings[SETTING_KEY_LOGICAL];
            let str = filter_arr.join(logical===LOGICAL_OR ? ',' : ',AND_');
            return str;
        }

        function _on_filter_change(){

            let current_settings = $root_panel.data(SETTINGS_KEY);
            let callback = current_settings[SETTING_KEY_ON_FILTER_CHANGE];
            if(typeof callback === "function"){
                callback();
            }
        }

        function _construct_filter_item($container,type,idx,item,list_or_table){

            let ID_FILTER_ITEM_LIST = 'pcf-filter-item-list-'+type+"-"+idx;
            let ID_FILTER_ITEM_TBL  = 'pcf-filter-item-tbl-'+type+"-"+idx;

            let $item_wrapper = $('<div>').addClass("inside-pcf-filter-guide-table").addClass('d-flex flex-row align-items-baseline item-panel').appendTo($container);
            let $d1 =  $('<div>').addClass("inside-pcf-filter-guide-table").appendTo($item_wrapper);

            $('<input>').addClass("inside-pcf-filter-guide-table").attr('type', 'checkbox')
                        .prop('checked', item.id in pre_hash ? true : false)
                        .attr('id',list_or_table==='list'?ID_FILTER_ITEM_LIST:ID_FILTER_ITEM_TBL)
                        .data('relative_id',list_or_table==='list'?ID_FILTER_ITEM_TBL:ID_FILTER_ITEM_LIST)
                        .attr('name', list_or_table==='list'?'pcf-filter-item-list':'pcf-filter-item-tbl')
                        .click(function(){
                            //let $btn = $(this);
                            //let checked = $btn.prop('checked');
                            //let relative_id = $btn.data('relative_id');
                            //$('#'+relative_id).prop('checked',checked);
                            _on_filter_change();
                        })
                        .val(item.id).appendTo($d1);

            $('<div>').addClass("inside-pcf-filter-guide-table").text(item[settings[SETTING_KEY_LANG]]).addClass(list_or_table==='list'?'':'ml-2').appendTo($item_wrapper);
        }

        function _construct_logical_btn_list($container,list_or_table){
            [
              {
                logical:     LOGICAL_OR, 
                id:          list_or_table==='list' ? ID_LOGICAL_OR_LIST  : ID_LOGICAL_OR_TBL,
                relative_id: list_or_table==='list' ? ID_LOGICAL_OR_TBL   : ID_LOGICAL_OR_LIST,
                other_id_1:  list_or_table==='list' ? ID_LOGICAL_AND_LIST : ID_LOGICAL_AND_TBL,
                other_id_2:  list_or_table==='list' ? ID_LOGICAL_AND_TBL  : ID_LOGICAL_AND_LIST
              },
              {
                logical:     LOGICAL_AND,
                id:          list_or_table==='list' ? ID_LOGICAL_AND_LIST  : ID_LOGICAL_AND_TBL,
                relative_id: list_or_table==='list' ? ID_LOGICAL_AND_TBL   : ID_LOGICAL_AND_LIST,
                other_id_1:  list_or_table==='list' ? ID_LOGICAL_OR_LIST   : ID_LOGICAL_OR_TBL,
                other_id_2:  list_or_table==='list' ? ID_LOGICAL_OR_TBL    : ID_LOGICAL_OR_LIST
              }
            ].forEach(item => {
                
                $('<div>').addClass(list_or_table==='list' ? 'flex-fill ctl' : 'ctl inside-pcf-filter-guide-table')
                          .addClass(item.logical===LOGICAL_OR?'left':'right')
                          .addClass(settings[SETTING_KEY_LOGICAL]===item.logical?'selected':'')
                          .attr('id',item.id).data('relative_id',item.relative_id)
                          .data('other_id_1',item.other_id_1).data('other_id_2',item.other_id_2)
                          .click(function(){
                               let $btn = $(this);
                               if($btn.hasClass('selected')) return;

                               let relative_id = $btn.data('relative_id');
                               let other_id_1 = $btn.data('other_id_1');
                               let other_id_2 = $btn.data('other_id_2');
                               $btn.addClass('selected');
                               $("#"+relative_id).addClass('selected');
                               $("#"+other_id_1).removeClass('selected');
                               $("#"+other_id_2).removeClass('selected');

                               _update_settings(SETTING_KEY_LOGICAL, $btn.text());

                               let selected_filters_arr = _get_checked_filter_items();
                               if(selected_filters_arr.length > 1) _on_filter_change();
                          })
                          .text(item.logical).appendTo($container);
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
