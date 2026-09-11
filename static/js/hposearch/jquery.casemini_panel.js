/*
 * jQuery Plugin: Search hpo or disease 
 */
;(function ($) {
    const URL_GET_TOOLTIP_DATA_BY_HPO_ID = '/sparqlist/api/pcf_get_hpo_tooltip_data_by_hpo_id',
          URL_GET_TOOLTIP_DATA_BY_MONDO_ID = '/sparqlist/api/pcf_get_disease_tooltip_data_by_mondo_id',
          URL_GET_TOOLTIP_DATA_BY_NANDO_ID = 'https://nanbyodata.jp/sparqlist/api/nanbyodata_get_overview_by_nando_id';

    const LANGUAGE_EN="en",LANGUAGE_JA="ja",
          TARGET_HPO="hpo",TARGET_ICD10="icd_10",TARGET_OMOR="omim_orpha",TARGET_NANBYO = "nanbyo",
          OBJECT_KEY="caseminiPanelObject",
          SETTINGS_KEY="caseminiPanelObject_settings",
          LANGUAGE ={
              [LANGUAGE_JA] : {
                  'info_list_title': {
                      [TARGET_HPO]:   "臨床症状一覧",
                      [TARGET_ICD10]: "疾患一覧",
                      [TARGET_OMOR]:  "疾患一覧",
                      [TARGET_NANBYO]:"疾患一覧"
                  },
                  'observed': "症状あり",
                  'notobserved':"症状なし",
                  'description_image':{
                      [TARGET_HPO]:   "/static/images/hposearch/step_1.png",
                      [TARGET_ICD10]: "/static/images/hposearch/step2.png",
                      [TARGET_OMOR]:  "/static/images/hposearch/step2.png",
                      [TARGET_NANBYO]:"/static/images/hposearch/step2.png"
                  },
                  'btn_casemini_copy_title': "臨床症状一覧をコピー",
                  'btn_do_pcf_search_title': "疑い病名を検索",
                  'btn_disease_copy_title': "疾患一覧をコピー",
                  'msg_confirm_clear_list':{
                      [TARGET_HPO]:   "臨床症状一覧の臨床症状を全て削除しますか？",
                      [TARGET_ICD10]: "疾患一覧の疾患を全て削除しますか？",
                      [TARGET_OMOR]:  "疾患一覧の疾患を全て削除しますか？",
                      [TARGET_NANBYO]:"疾患一覧の疾患を全て削除しますか？"
                  },
                  'msg_confirm_delete': "削除しますか？"
              }
          };

    var DEFAULT_SETTINGS = {
        target:                TARGET_HPO,
        language:              LANGUAGE_JA,
        id_action_btn_wrapper: null,
        data_version:          '',
        data_update_date:      ''
    };

    function _construct_id(prefix, content){return prefix + "_" + content;}

    function _isObject(value){return $.isPlainObject(value);}

    function _isArray(value) { return $.isArray(value); }

    function _isEmpty(value, allowEmptyString) {
        return (value === null) || (value === undefined) ||
               (!allowEmptyString ? value === '' : false) ||
               (_isArray(value) && value.length === 0) ||
               (_isObject(value) && Object.keys(value).length === 0);
    }

    function _isExistVal(key, hash) {
        if (_isEmpty(hash)) return false;
        if (!(key in hash)) return false;
        return !_isEmpty(hash[key]);
    }


    // Additional public (exposed) methods
    var methods = {
        init: function(options) {
            var settings = $.extend({}, DEFAULT_SETTINGS, options || {})
            return this.each(function () {
                $(this).data(SETTINGS_KEY, settings);
                $(this).data(OBJECT_KEY, new $.casemini_panel(this, settings));
            });
        },
        setInputBoxFocus: function(){
            $(this).data(OBJECT_KEY).setInputBoxFocus();
        }
    };

    // Expose the .tokenInput function to jQuery as a plugin
    $.fn.casemini_panel = function (method) {
        // Method calling and initialization logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
    };

    // TokenList class for each input
    $.casemini_panel = function (div_casemini_panel, settings) {
   
        var current_settings = $(div_casemini_panel).data(SETTINGS_KEY);

        var caseminiData = [];

        //init ID of UI elements 
        var id_search_box_form     = _construct_id(settings.target, 'search_box_form');
        var id_list_num            = _construct_id(settings.target, 'casemini_list_num');
        var id_list_wrapper        = _construct_id(settings.target, 'casemini_list_wrapper');
        var id_list                = _construct_id(settings.target, 'casemini_list');
        var id_description_wrapper = _construct_id(settings.target, 'casemini_description_wrapper');
        var id_btn_clear_list      = _construct_id(settings.target, 'casemini_clear');
        var id_btn_add_rows        = _construct_id(settings.target, 'casemini_addRows');
        var id_btn_copy            = _construct_id(settings.target, 'casemini_copy');
        var id_btn_pcf_search      = _construct_id(settings.target, 'do_pcf_search');

        this.setInputBoxFocus = function(){
            $("#"+id_search_box_form).search_box_form("setInputBoxFocus");
        };

        function _casemini_clear(){
            tippy.hideAll();
            let msg = LANGUAGE[current_settings.language]['msg_confirm_clear_list'][current_settings.target]; 
            if (confirm(msg)) {
                $('#'+id_list).empty();
                caseminiData.splice(0);
                _casemini_updateNum();
            }
        }

        function _casemini_updateNum() {
            $('#'+id_list_num).text(`(${caseminiData.length})`);
            if(caseminiData.length){
                $('#'+id_description_wrapper).hide();
                $('#'+id_list_wrapper).show();
                $('#'+id_btn_clear_list).show();
            }else{
                $('#'+id_description_wrapper).show();
                $('#'+id_list_wrapper).hide();
                $('#'+id_btn_clear_list).hide();
            }
        }

        function _casemini_reset_list() {
            // hpo list reset
            $('#'+id_list_num).text('(0)')
            $('#'+id_list).empty()
        }

        function _casemini_addRows() {
            tippy.hideAll();
            let list = $("#"+id_search_box_form).search_box_form('get_tokens');
            if (!list || !list.length) return;
            list.forEach(hpo => {
                let hpo_id = hpo.id.replace('_ja', '');
                let existed_hpo = [];
                caseminiData.filter((hpo_existed, idx) => {
                    let hid_existed = hpo_existed.id.replace('_ja', '');
                    if (hid_existed === hpo_id) {
                        existed_hpo.push(idx)
                    }
                })
                if (existed_hpo.length) {
                    if(current_settings.target === TARGET_HPO){
                        let idx = existed_hpo[0];
                        if('is_observed' in hpo){
                            caseminiData[idx]['is_observed'] = hpo.is_observed;
                        }else{
                            caseminiData[idx]['is_observed'] = 'yes';
                        }
                        return;
                    }
                }
                caseminiData.push(hpo);
            })

            $("#"+id_search_box_form).search_box_form('clear_tokens');
            _casemini_reset_list();
            _casemini_createRows();
        }
 
        function _contruct_popup_content_val(key, hash, delimer) {
            if (!_isExistVal(key, hash)) return '';

            if (_isEmpty(hash[key])) return '';

            if (_isArray(hash[key])) {
                if (_isEmpty(delimer)) return hash[key].join(',');
                return hash[key].join(delimer);
            }

            return hash[key];
        }

        function _contruct_popup_content_val_hash(key_id,key_url,hash){
            if(!_isExistVal(key_id,hash)) return '';

            let ret = "";
            for(let i =0;i<hash[key_id].length;i++){
                let id  = hash[key_id][i];
                let url = hash[key_url][i];
                ret = ret + "<a href=\""+url+"\" target=\"_blank\">"+id+"</a>";
            }
            return ret;
        }

        function _contruct_popup_content_val_hash2(prefix,hash){
            
            if(hash.length === 0) return '';

            let ret = "";
            for(let i =0;i<hash.length;i++){
                let id  = prefix +hash[i].id;
                let url = hash[i].url;
                ret = ret + "<a href=\""+url+"\" target=\"_blank\">"+id+"</a>";
            }
            return ret;
        }

        function _contruct_popup_content_omor(mondo_id, popup_data, lang) {
            let max_text_len = mondo_id.length;
            let name_ja = _contruct_popup_content_val('name_ja', popup_data);
            let name_en = _contruct_popup_content_val('name_en', popup_data);
            if (_isEmpty(name_ja) && _isEmpty(name_en)) {
                return ['no data found for ' + mondo_id, max_text_len];
            }

            if (max_text_len < name_ja.length) max_text_len = name_ja.length;
            if (max_text_len < name_en.length) max_text_len = name_en.length;

            let mondo_url = _contruct_popup_content_val('mondo_url', popup_data);
            if (max_text_len < mondo_url.length) max_text_len = mondo_url.length;

            let definition = _contruct_popup_content_val('definition', popup_data);
            if (max_text_len < definition.length) max_text_len = definition.length;

            let synonym = _contruct_popup_content_val('synonym', popup_data, ', ');
            if (max_text_len < synonym.length) max_text_len = synonym.length;

            let omim_list = _contruct_popup_content_val_hash('omim_id','omim_url',popup_data);
            if(max_text_len < omim_list.length) max_text_len = omim_list.length;

            let orpha_list = _contruct_popup_content_val_hash('orpha_id','orpha_url',popup_data);
            if(max_text_len < orpha_list.length) max_text_len = orpha_list.length;

            let content = `
                <table>
                    <tr><th class="pcf-popup-phenotype_inlist">ID  </th><td><a href="${mondo_url}" target="_blank">${mondo_id}</a></td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Label(en) </th><td>${name_en}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Label(ja) </th><td>${name_ja}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Definition</th><td>${definition}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Synonym   </th><td>${synonym}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">OMIM      </th><td>${omim_list}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Orphanet  </th><td>${orpha_list}</td></tr>
                </table>
            `;
            return [content, max_text_len];            
        }

        function _contruct_popup_content_nanbyo(nando_id, popup_data, lang) {
            let nando_url = 'https://nanbyodata.jp/disease/'+nando_id+'?lang=ja';
            let max_text_len = nando_id.length;
            let name_ja = _contruct_popup_content_val('label_ja', popup_data);
            let name_en = _contruct_popup_content_val('label_en', popup_data);
            if (_isEmpty(name_ja) && _isEmpty(name_en)) {
                return ['no data found for ' + nando_id, max_text_len];
            }

            if (max_text_len < name_ja.length) max_text_len = name_ja.length;
            if (max_text_len < name_en.length) max_text_len = name_en.length;

            let definition = _contruct_popup_content_val('definition', popup_data);
            if (max_text_len < definition.length) max_text_len = definition.length;

            let description = _contruct_popup_content_val('description', popup_data);
            if (max_text_len < description.length) max_text_len = description.length;

            let synonym_en = _contruct_popup_content_val('alt_label_en', popup_data, ', ');
            if (max_text_len < synonym_en.length) max_text_len = synonym_en.length;

            let synonym_ja = _contruct_popup_content_val('alt_label_ja', popup_data, ', ');
            if (max_text_len < synonym_ja.length) max_text_len = synonym_ja.length;

            let mondo_list ='';
            if('mondos' in popup_data){
                 mondo_list = _contruct_popup_content_val_hash2('',popup_data['mondos']);
                 if(max_text_len < mondo_list.length) max_text_len = mondo_list.length;
            }

            let omim_list = '';
            if('db_xrefs' in popup_data && 'omim' in popup_data['db_xrefs']){
                omim_list = _contruct_popup_content_val_hash2('OMIM:',popup_data['db_xrefs']['omim']);
                if(max_text_len < omim_list.length) max_text_len = omim_list.length;
            }
            
            let orpha_list = '';
            if('db_xrefs' in popup_data && 'orphanet' in popup_data['db_xrefs']){
                orpha_list = _contruct_popup_content_val_hash2('ORPHA:',popup_data['db_xrefs']['orphanet']);
                if(max_text_len < orpha_list.length) max_text_len = orpha_list.length;
            }
            let content = `
                <table>
                    <tr><th class="pcf-popup-phenotype_inlist">ID  </th><td><a href="${nando_url}" target="_blank">${nando_id}</a></td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Label(en) </th><td>${name_en}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Label(ja) </th><td>${name_ja}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Definition</th><td>${definition}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Description</th><td>${description}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Synonym(en)</th><td>${synonym_en}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Synonym(ja)</th><td>${synonym_ja}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">MONDO      </th><td>${mondo_list}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">OMIM      </th><td>${omim_list}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Orphanet  </th><td>${orpha_list}</td></tr>
                </table>
            `;
            return [content, max_text_len];            
        }



        function _contruct_popup_content_hpo(hpo_id, popup_data, lang) {
            let max_text_len = hpo_id.length;
            let name_ja = _contruct_popup_content_val('name_ja', popup_data);
            let name_en = _contruct_popup_content_val('name_en', popup_data);
            if (_isEmpty(name_ja) && _isEmpty(name_en)) {
                return ['no data found for ' + popup_id, max_text_len];
            }
            if (max_text_len < name_ja.length) max_text_len = name_ja.length;
            if (max_text_len < name_en.length) max_text_len = name_en.length;
            let hpo_url = _contruct_popup_content_val('hpo_url', popup_data);
            if (max_text_len < hpo_url.length) max_text_len = hpo_url.length;
            let definition = _contruct_popup_content_val('definition', popup_data);
            if (max_text_len < definition.length) max_text_len = definition.length;
            let comment = _contruct_popup_content_val('comment', popup_data);
            if (max_text_len < comment.length) max_text_len = comment.length;
            let synonym = _contruct_popup_content_val('synonym', popup_data, ', ');
            if (max_text_len < synonym.length) max_text_len = synonym.length;
            let content = `
                <table>
                    <tr><th class="pcf-popup-phenotype_inlist">HPO ID  </th><td><a href="${hpo_url}" target="_blank"> ${hpo_id} </a></td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Label(ja) </th><td>${name_ja}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Label(en) </th><td>${name_en}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Definition</th><td>${definition}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Comment   </th><td>${comment}</td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Synonym   </th><td>${synonym}</td></tr>
                </table>
            `;

            return [content, max_text_len];
        }

        function _contruct_popup_content_icd10(id, name) {
            let max_text_len = id.length;
            if (max_text_len < name.length) max_text_len = name.length;
            let hpo_url = 'http://www.byomei.org/Scripts/search/index_search.asp?searchstring='+id;
            let content = `
                <table>
                    <tr><th class="pcf-popup-phenotype_inlist">ID  </th><td><a href="${hpo_url}" target="_blank"> ${id} </a></td></tr>
                    <tr><th class="pcf-popup-phenotype_inlist">Label </th><td>${name}</td></tr>
                </table>
            `;
            return content;
        }

        function phenotypeInfo_change_observed_state(hpo_id,is_observed,btn_id){
            let j=0;
            for(;j<caseminiData.length;j++){
                let hpo_id_list = caseminiData[j].id.replace('_ja','');
                if(hpo_id_list === hpo_id){
                    caseminiData[j].is_observed=is_observed;
                    break;
                }
            }

            $('#'+btn_id).removeClass('observed').removeClass('notobserved')
                 .addClass(is_observed==='yes'? 'observed' : 'notobserved');
        }

        //create li of disease
        function _casemini_createRow($li,i,data){
            let $header = $('<div>').addClass('d-flex flex-row flex-nowrap phenotype_list_row_header').appendTo($li);
            

            let $row_sub_1 = $('<div>').addClass('flex-item phenotype_list_row_header_sub').appendTo($header);

            $('<span>').addClass('material-symbols-outlined hpo_delete').text('delete')
                       .data('idx_in_caseminiData', i)
                       .click(function (e) {
                           tippy.hideAll();
                           if (confirm(LANGUAGE[current_settings.language]['msg_confirm_delete'])) {
                                let idx = $(this).data('idx_in_caseminiData');
                                caseminiData.splice(idx, 1);
                                _casemini_reset_list();
                                _casemini_createRows();
                           }
                           e.stopPropagation();
                       })
                       .appendTo($row_sub_1);

            let hpo_id = data.id.replace('_ja','');
            let btn_id = _construct_id(current_settings.target, "btn_data_id_"+i);

            let $hpd_id_btn_wrapper = $('<div>').attr('id',btn_id).addClass("phenotype_list_row_header_sub ml-2 mr-3").addClass(current_settings.target)
                                                .addClass(current_settings.target === TARGET_HPO ? 'hpd_id_btn_wrapper' : 'casemini-id-btn-wrapper')
                                                .appendTo($header);

            if(current_settings.target === TARGET_HPO){
                if('is_observed' in caseminiData[i] && caseminiData[i].is_observed === 'no'){
                    $hpd_id_btn_wrapper.addClass("notobserved");
                }else{
                    $hpd_id_btn_wrapper.addClass("observed");
                }
            }

            let button = document.createElement('button');
            button.textContent = hpo_id;
            button.classList.add("list-tag");
            button.classList.add("hpo_id");
            let popup_url = null;
            if(current_settings.target === TARGET_OMOR){
                popup_url = URL_GET_TOOLTIP_DATA_BY_MONDO_ID + "?mondo_id=" + hpo_id;
            }else if(current_settings.target === TARGET_NANBYO){
                popup_url = URL_GET_TOOLTIP_DATA_BY_NANDO_ID + "?nando_id=" + hpo_id.replace('NANDO:','');
            }else if(current_settings.target === TARGET_HPO){
                popup_url = URL_GET_TOOLTIP_DATA_BY_HPO_ID + '?hpo_id=' + hpo_id;;
            }

            tippy(button, {
                    arrow:         false,
                    allowHTML:     true,
                    appendTo:      document.body,
                    animation:     'scale',
                    animationFill: true,
                    trigger:       'click',
                    maxWidth:      800,
                    strategy:      'fixed',
                    interactive:    true,
                    theme:         'pcf-popup',
                    placement:     'bottom-start',
                    content:       current_settings.target === TARGET_ICD10 ? _contruct_popup_content_icd10(hpo_id, data.name):'Loading...',
                    offset:        [0, 0],
                    popup_url:     popup_url,
                    popup_id:      hpo_id,
                    popup_target:  current_settings.target,
                    popup_lang:    current_settings.language === 'ja' ? 'ja' : 'en',
                    onCreate(instance) {
                        instance._isFetching = false;
                        instance._src = null;
                        instance._error = null;
                    },
                    onShow(instance) {
                        if (instance._isFetching || instance._src || instance._error || instance.props.popup_target === TARGET_ICD10) {
                            return;
                        }
    
                        instance._isFetching = true;
    
                        let url = instance.props.popup_url;
                        let hpo_id = instance.props.popup_id;
                        let lang = instance.props.popup_lang;
                        let target = instance.props.popup_target;

                        $.ajax({
                            url: url,
                            type: 'GET',
                            async: true,
                            dataType: 'text'
                        }).done(function (data, textStatus, jqXHR) {
                            let json_data = JSON.parse(data);
                            let content, max_text_len;
                            if(target === TARGET_HPO){
                                [content, max_text_len] = _contruct_popup_content_hpo(hpo_id, json_data, lang);
                            }else if(target === TARGET_OMOR){
                                [content, max_text_len] = _contruct_popup_content_omor(hpo_id, json_data, lang);
                            }else if(target === TARGET_NANBYO){
                                [content, max_text_len] = _contruct_popup_content_nanbyo(hpo_id, json_data, lang);
                            }

                            if (max_text_len < 40) {
                                instance.setProps({ maxWidth: 600 });
                            } else if (max_text_len < 60) {
                                instance.setProps({ maxWidth: 700 });
                            } else if (max_text_len < 80) {
                                instance.setProps({ maxWidth: 800 });
                            } else if (max_text_len < 120) {
                                instance.setProps({ maxWidth: 900 });
                            } else {
                                instance.setProps({ maxWidth: 950 });
                            }
                            instance.setContent(content);
                            instance._src = 'done';
                        }).fail(function (jqXHR, textStatus, errorThrown) {
                            instance.setContent(`Request failed from server.`);
                            instance._src = null;
                        }).always(function () {
                            instance._isFetching = false;
                        });
                        
                    }
            });
                    
            $(button).click(function (e) { e.stopPropagation(); }).appendTo($hpd_id_btn_wrapper);

            if(current_settings.target === TARGET_NANBYO){
                let txt = '告示番号 : '+data.notification_number;
                let $div = $('<div>').text(txt)
                                     .addClass('phenotype_list_row_header_sub')
                                     .addClass('casemini-notification-number-wrapper')
                                     .appendTo($header);
            }

            if (current_settings.target === TARGET_OMOR) {
                let $row_sub_3 = $('<div>').addClass('phenotype_list_row_header_sub')
                                           .addClass('casemini_list_item_name_left mr-3 ml-3').appendTo($header);
                let $row_sub_4 = $('<div>').addClass('phenotype_list_row_header_sub').addClass("push-right").appendTo($header);
                let hpo_name_ja = data['name_ja'];
                $('<span>').addClass('text-left').text(hpo_name_ja).appendTo($row_sub_3);
                let hpo_name_en = data['name_en'];
                $('<span>').addClass('text-left').text(hpo_name_en).appendTo($row_sub_4);
            }else if(current_settings.target === TARGET_NANBYO || current_settings.target === TARGET_HPO){
                let $row_sub_x = $('<div>').addClass('phenotype_list_row_header_sub').addClass("ml-3").addClass('d-flex flex-row flex-grow-1').appendTo($header);
                let $row_sub_3 = $('<div>').addClass('w-50').appendTo($row_sub_x);
                let $row_sub_4 = $('<div>').addClass('w-50').addClass("ml-3").appendTo($row_sub_x);
                let hpo_name_ja = data['name_ja'];
                $('<span>').addClass('text-left').text(hpo_name_ja).appendTo($row_sub_3);
                let hpo_name_en = data['name_en'].replace('[指定]','').replace('[小慢]','');
                $('<span>').addClass('text-left').text(hpo_name_en).appendTo($row_sub_4);
            } else {
                let hpo_name = data.name;
                let $row_sub_x = $('<div>').addClass('phenotype_list_row_header_sub').addClass("push-right").appendTo($header);
                $('<span>').addClass('hpo_name').addClass('text-left').text(hpo_name).appendTo($row_sub_x);
            }

            if(current_settings.target === TARGET_HPO){

                let $header_sub_right = $('<div>').addClass('phenotype_list_row_header_sub').appendTo($header);

                let dropdown_toggle = document.createElement('button');
                dropdown_toggle.classList.add('material-symbols-outlined');
                dropdown_toggle.innerHTML = "more_vert";
                let li_Y_id = "dropdownMenuButton"+i+'li_y';
                let li_N_id = "dropdownMenuButton"+i+'li_n';
    
                tippy(dropdown_toggle, {
                    allowHTML:  true,
                    appendTo:   document.body,
                    maxWidth:   150,
                    trigger:    'click',
                    strategy:   'fixed',
                    interactive:true,
                    theme:      'pcf_menu',
                    placement:  'left',
                    hpo_id:     hpo_id,
                    btn_id:     btn_id,
                    li_Y_id:    li_Y_id,
                    li_N_id:    li_N_id,
                    onCreate(instance) {
                        instance._isSetClickEvent = false;
                    },
                    onShown(instance) {
                        if (instance._isSetClickEvent) return;
                        let btn_id = instance.props.btn_id;
                        let hpo_id = instance.props.hpo_id;
                        let li_Y_id = instance.props.li_Y_id;
                        let li_N_id = instance.props.li_N_id;
    
                        $("#"+li_Y_id).click(function(){
                            phenotypeInfo_change_observed_state(hpo_id,'yes',btn_id);
                            setTimeout(function(){tippy.hideAll();},100);
                        });
    
                        $("#"+li_N_id).click(function(){
                            phenotypeInfo_change_observed_state(hpo_id,'no',btn_id);
                            setTimeout(function(){tippy.hideAll();},100);
                        });
    
                        instance._isSetClickEvent = true;
                    },
                    content(reference) {
                        let observed = LANGUAGE[current_settings.language]['observed'];
                        let notobserved = LANGUAGE[current_settings.language]['notobserved']; 
                        return  "<ul class=\"dropdown-observe\">" +
                                "<li id=\""+li_Y_id+"\">" +
                                    "<span class=\"observed\">" + observed + "</span>" +
                                "</li>" +
                                "<li id=\""+li_N_id+"\">" +
                                    "<span class=\"notobserved\">" +notobserved + "</span>" +
                                "</li>" +
                                "</ul>";
                    }
                });
    
                $(dropdown_toggle).attr('id',btn_id).appendTo($header_sub_right);
            }

            if(current_settings.target === TARGET_HPO || 
               current_settings.target === TARGET_ICD10 || 
               current_settings.target === TARGET_NANBYO) return;

            let cbx_num = 'orphanet' in data ? data['orphanet'].split("|").length : 0;
            cbx_num += ('omim' in data ? data['omim'].split("|").length : 0);

            let $cbx_wrapper_flex = $('<div>').addClass('phenotype_list_row_header_sub_cbx d-flex flex-row flex-wrap');
            if(cbx_num > 3){
                $cbx_wrapper_flex.appendTo($header);
            }

            let svg = `<svg focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path class="" fill="currentColor" d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"></path></svg>`;

            ['orphanet','omim'].forEach(col_name => {
                if(col_name in data && data[col_name]){

                    let arr = data[col_name].split("|");

                    for(let idx=0;idx<arr.length;idx++){

                        let $div_cbx_wrapper = $('<div>').addClass('casemini_cbx_wrapper');
                        if(cbx_num > 3){
                            $div_cbx_wrapper.appendTo($cbx_wrapper_flex);
                        }else{
                            $div_cbx_wrapper.addClass('phenotype_list_row_header_sub').appendTo($header);
                        }

                        let cbx_id = _construct_id(current_settings.target, "CBX_"+col_name+'_'+i+'_'+idx);
                        $('<input>').attr('type', 'checkbox').prop('checked', true).attr('id', cbx_id).appendTo($div_cbx_wrapper);
                    
                        let text = arr[idx];
                        let $a = $('<a>').text(text).appendTo($div_cbx_wrapper);
                        if(col_name === 'omim'){
                            if(text.startsWith('OMIMPS:')){
                                //https://omim.org/phenotypicSeries/PS600513
                                text=text.replace('OMIMPS:','');
                                $a.prop('href', 'https://omim.org/phenotypicSeries/PS' + text).prop('target', '_blank');

                                //$('<img>').appendTo($div_cbx_wrapper);
                                $(svg).appendTo($a);
                            }else{
                                //https://omim.org/entry/305100
                                text=text.replace('OMIM:','');
                                $a.prop('href', 'http://identifiers.org/mim/' + text).prop('target', '_blank');
                                //$('<img>').appendTo($div_cbx_wrapper);
                                $(svg).appendTo($a);
                            }
                        }else if(col_name === 'orphanet'){
                            //https://www.orpha.net/en/disease/detail/181?name=181&mode=orpha
                            text = text.replace('Orphanet:','').replace('ORPHA:','');
                            $a.prop('href', 'https://www.orpha.net/en/disease/detail/'+text+'?name='+text+'&mode=orpha').prop('target', '_blank');
                            //$('<img>').appendTo($div_cbx_wrapper);
                            $(svg).appendTo($a);
                        }

                    }
                }
            });
        }

        function _casemini_createRows(){
            if (!caseminiData || !caseminiData.length) return;
            _casemini_updateNum();
            let $ul = $('#'+id_list);
            for (let i = 0; i < caseminiData.length; i++) {
                let $li = $('<li>').addClass('phenotype_list_row').addClass('shadow-sm').appendTo($ul);
                _casemini_createRow($li,i,caseminiData[i]);
            }
        }

        // ****
        // init UI
        // ****

        let ver_update_txt = `( Version:${current_settings.data_version} | Update:${current_settings.data_update_date} )`;

        div_casemini_panel.innerHTML = `
            <div class="search-box_wrapper">
                <div id="${id_search_box_form}"></div>
            </div>
            <p class="casemini_add_wrapper">
                <button id="${id_btn_add_rows}" class="casemini_action_btn color-action2">
                    <i class="material-symbols-outlined">add_notes</i>一覧に追加
                </button>
                <span class="right-aligned">${current_settings.data_version}</span>
            </p>
            <div class="d-flex flex-row casemini_list_title ${settings.target}">
                <div class="casemini_list_title_sub flex-fill">
                    <span>${LANGUAGE[settings.language]['info_list_title'][settings.target]}</span>
                    <span id="${id_list_num}">(0)</span>
                    <span class="casemini_list_clear" id="${id_btn_clear_list}">X Clear all</span>
                </div>
                <div class="casemini_list_title_sub">
                    <span class="sample observed mr-3">${LANGUAGE[settings.language]['observed']}</span>
                    <span class="sample notobserved">${LANGUAGE[settings.language]['notobserved']}</span>
                </div>
            </div>
            <div class="casemini_list_wrapper" id="${id_list_wrapper}">
                <ul class="casemini_list" id="${id_list}"></ul>
            </div>
            <div id="${id_description_wrapper}">
                <img src="${LANGUAGE[settings.language]['description_image'][settings.target]}" />
            </div>
        `;

        let $action_btn_wrapper = $("#"+current_settings.id_action_btn_wrapper);
        if(current_settings.target === TARGET_HPO){
            let btn_inner_html = `
                <button id="${id_btn_copy}" class="casemini_action_btn ${current_settings.target}">
                    <i class="material-symbols-outlined">file_copy</i>${LANGUAGE[settings.language]['btn_casemini_copy_title']}
                </button>
            `;
            $(btn_inner_html).addClass('mr-2').appendTo($action_btn_wrapper);
            
            let btn_inner_html2 = `
                <button id="${id_btn_pcf_search}" class="casemini_action_btn color-action2 ${current_settings.target}">
                    <i class="material-symbols-outlined">search</i>${LANGUAGE[settings.language]['btn_do_pcf_search_title']}
                </button>
            `;
            $(btn_inner_html2).appendTo($action_btn_wrapper);
           
        }else{
            let btn_inner_html = `
                <button id="${id_btn_copy}" class="casemini_action_btn ${current_settings.target}">
                    <i class="material-symbols-outlined">file_copy</i>${LANGUAGE[settings.language]['btn_disease_copy_title']}
                </button>
            `;
            $(btn_inner_html).appendTo($action_btn_wrapper);
        }


        $("#"+id_search_box_form).search_box_form({
            'lang': settings.language === 'ja' ? 'ja' : 'en',
            'doc_list': null,
            'getDocByColId': null,
            'search_type': settings.target,
            'onClickTextBtn': settings.target!==TARGET_HPO? null : function (isActived) {
                if (isActived) {
                    $('#'+id_btn_add_rows).show();
                } else {
                    $('#'+id_btn_add_rows).hide();
                }
            },
        });

        if(settings.target===TARGET_HPO){
            $("#"+id_search_box_form).search_box_form('load_dic_if_needed');
        }

        $('#'+id_btn_add_rows).click(function(e){                                
            _casemini_addRows();
            e.preventDefault();
            e.stopPropagation();
        });

        $("#"+id_btn_clear_list).click(function(e){
            _casemini_clear();
            e.preventDefault();
            e.stopPropagation();
        });

        function _copy_to_clipboard(text){
            if(window.clipboardData && window.clipboardData.setData) {
                window.clipboardData.setData("Text", text);
            } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
                let textarea = document.createElement("textarea");
                textarea.style = "position: absolute; left: -1000px; top: -1000px";
                textarea.textContent = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
        }

        if(current_settings.target === TARGET_HPO){
            $("#"+id_btn_pcf_search).click(function(e){
                let hpo_lst = [];
                for(let i=0; i<caseminiData.length; i++){
                    if(!('is_observed' in caseminiData[i]) || caseminiData[i].is_observed === 'yes'){
                        hpo_lst.push(caseminiData[i].id.replace('_ja',''));
                    }
                }
                if(hpo_lst.length === 0){
                    alert("No HPOs(with symptoms)");
                    return;
                }

                let url = "/result?phenotype=" + 
                          hpo_lst.join('_ja%2C') +'_ja'+
                          "&target=omim&filter=&size=10&display_format=full&lang=ja";
                window.open(url);                
            });
        }

        $("#"+id_btn_copy)
               .tooltip({'title':'Copied to clipboard!', 'trigger':'manual', 'placement':'top', container: 'body'})
               .on('click', function(e){
                    $(this).tooltip('show');
                    let textArr = [];
                    for(let i=0; i<caseminiData.length; i++){
                        let row = caseminiData[i].id.replace('_ja','');
                        if(current_settings.target === TARGET_HPO){
                            if('is_observed' in caseminiData[i] && caseminiData[i].is_observed==='no'){
                                row = row + "\t" + LANGUAGE['ja']['notobserved'];
                            }else{
                                row = row + "\t" + LANGUAGE['ja']['observed'];
                            }
                            row = row + "\t" + caseminiData[i].name_en;
                            row = row + "\t" + caseminiData[i].name_ja;
                        }else if(current_settings.target === TARGET_ICD10){
                            row = row + "\t" + caseminiData[i].group;
                            row = row + "\t" + caseminiData[i].disease_control_number;
                            row = row + "\t" + caseminiData[i].name;
                        }else if(current_settings.target === TARGET_OMOR){
                            row = row + "\t" + caseminiData[i].name_en;
                            row = row + "\t" + caseminiData[i].name_ja;

                            ['orphanet','omim'].forEach(col_name => {
                                let val = '';
                                if(col_name in caseminiData[i] && caseminiData[i][col_name]){
                                    let arr = caseminiData[i][col_name].split('|');
                                    for(let idx=0;idx<arr.length;idx++){
                                        let cbx_id = _construct_id(current_settings.target, 'CBX_'+col_name+'_'+i+'_'+idx);
                                        if ($('#'+cbx_id).is(':checked'))
                                            val = val.length===0 ? arr[idx] : val + "|" + arr[idx];
                                    }
                                }
                                row = row + "\t" + val;
                            });

                        }else if(current_settings.target === TARGET_NANBYO){
                            row = row + "\t" + caseminiData[i].notification_number
                                      + "\t" + caseminiData[i].name_en.replace('[指定]','').replace('[小慢]','')
                                      + "\t" + caseminiData[i].name_ja;
                                      
                        }
                        textArr.push(row);
                    }
                    let text = textArr.join("\n");
                    _copy_to_clipboard(text);

                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                })
                .on('mouseleave', function () {
                    $(this).tooltip('hide');
                });

        
    };
}(jQuery));

