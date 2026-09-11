/*
 * jQuery Plugin: Search phenotype,disease_icd-10,disease_omim_orpha,disease_nanbyo
 */
;(function ($) {

    const LANGUAGE_JA='ja', LANGUAGE_EN='en',
          UISETTING_TAG_SIZE_S='s', UISETTING_TAG_SIZE_M='m', UISETTING_TAG_SIZE_L='l',
          UISETTING_TAG_SIZE_LST=[UISETTING_TAG_SIZE_S,UISETTING_TAG_SIZE_M,UISETTING_TAG_SIZE_L],
          LANGUAGE = {
            [LANGUAGE_JA] : {
                'TEXT_INPUT_TITLE'             : '文章から症状を自動抽出',
                'UISETTING_BTN_TITLE'          : '設定',
                'UISETTING_TBL_LABEL_TAGSIZE'  : 'タグサイズ:',
                'UISETTING_TBL_LABEL_LANGUAGE' : 'クエリー言語:',
                'UISETTING_TAG_SIZE_LABEL'    : {
                    [UISETTING_TAG_SIZE_S] : '小',
                    [UISETTING_TAG_SIZE_M] : '中',
                    [UISETTING_TAG_SIZE_L] : '大'
                }
            },
            [LANGUAGE_EN] : {
                'TEXT_INPUT_TITLE'             : 'Automatically extract signs and symptoms from text',
                'UISETTING_BTN_TITLE'          : 'Setting',
                'UISETTING_TBL_LABEL_TAGSIZE'  : 'Tag size:',
                'UISETTING_TBL_LABEL_LANGUAGE' : 'Query language:',
                'UISETTING_TAG_SIZE_LABEL'     : {
                    [UISETTING_TAG_SIZE_S] : 'Small',
                    [UISETTING_TAG_SIZE_M] : 'Medium',
                    [UISETTING_TAG_SIZE_L] : 'Large'
                }
            }
        },
        SERACH_TYPE_HPO='hpo',SERACH_TYPE_DISEASE_ICD10='icd_10',SERACH_TYPE_DISEASE_OMIM_ORPHA='omim_orpha',SERACH_TYPE_DISEASE_NANBYO='nanbyo',
        TOKENINPUT_ID={
            [SERACH_TYPE_HPO]:                'tokeninput_hpo',
            [SERACH_TYPE_DISEASE_ICD10]:      'tokeninput_icd10',
            [SERACH_TYPE_DISEASE_OMIM_ORPHA]: 'tokeninput_omim_orpha',
            [SERACH_TYPE_DISEASE_NANBYO]:     'tokeninput_nanbyo'
        },
        URL_TOKENINPUT_HPO={
            [SERACH_TYPE_HPO]:                '/casemini_tokeninput_hpo',
            [SERACH_TYPE_DISEASE_ICD10]:      '/casemini_tokeninput_icd_10',
            [SERACH_TYPE_DISEASE_OMIM_ORPHA]: '/casemini_tokeninput_omim_orpha',
            [SERACH_TYPE_DISEASE_NANBYO]:     '/casemini_tokeninput_nando'
        },
        URL_TOKENINPUT_HPO_SECOND={
            [SERACH_TYPE_HPO]:                '/casemini_get_similar_hpo_by_text',
            [SERACH_TYPE_DISEASE_ICD10]:      '/casemini_get_similar_icd_10_by_text',
            [SERACH_TYPE_DISEASE_OMIM_ORPHA]: '/casemini_get_similar_omim_orpha_by_text',
            [SERACH_TYPE_DISEASE_NANBYO]:     '/casemini_get_similar_nando_by_text'
        }
        ;

    var DEFAULT_SETTINGS = {
        url_tokeninput_hpo:         URL_TOKENINPUT_HPO[SERACH_TYPE_HPO],
        url_tokeninput_hpo_second:  URL_TOKENINPUT_HPO_SECOND[SERACH_TYPE_HPO],
        url_popup_hierarchy_hpo:    '/casemini_popup_hierarchy_hpo',
        lang:                       'ja',
        doc_list:                   null,
        getDocByColId:              null,
        onClickTextBtn:             null,	
        getExcludeHPOList:          null,	
        uisetting_tag_size:         UISETTING_TAG_SIZE_L,
        uisetting_language:         'en,ja',  /* remove setting for this item and set it always be en,ja */
        search_type:                SERACH_TYPE_HPO
    };

    function setCookie(cname,cvalue){
        document.cookie = cname+"="+cvalue+";" + `expires=${new Date(new Date().getTime()+1000*60*60*24*365).toGMTString()}; path=/`;
    }

    function getCookie(cname){
        if(!document.cookie){
            document.cookie = `expires=${new Date(new Date().getTime()+1000*60*60*24*365).toGMTString()}; path=/`;
            return "";
        }        
        
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name)===0) { return c.substring(name.length,c.length); }
        }
        return "";
    }

    function _construct_unique_id(prefix, content_id){
        return prefix + "__" + content_id;
    }

    var windowNavigatorLanguage = (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language ||
                                    window.navigator.userLanguage || window.navigator.browserLanguage;
                                    
    function isWindowNavigatorLanguageJa(){
        return windowNavigatorLanguage === "ja" || windowNavigatorLanguage.toLowerCase() === "ja-jp";
    }

    // Additional public (exposed) methods
    var methods = {
        init: function(options) {
            let settings = $.extend({}, DEFAULT_SETTINGS, options || {})

            if(!(settings.lang in LANGUAGE)){ settings.lang = LANGUAGE_JA}
            let root_container_id = $(this).attr("id");
            let cookie_name_tag_size = _construct_unique_id(root_container_id, 'uisetting_tag_size');
            let cookie_tag_size = getCookie(cookie_name_tag_size);
            if(cookie_tag_size){
                settings['uisetting_tag_size'] = cookie_tag_size;
            }else{
                setCookie(cookie_name_tag_size, settings['uisetting_tag_size']);
            }

            settings.url_tokeninput_hpo = URL_TOKENINPUT_HPO[settings.search_type];
            settings.url_tokeninput_hpo_second = URL_TOKENINPUT_HPO_SECOND[settings.search_type];

            return this.each(function () {
                $(this).data("searchBoxFormObject", new $.Search_Box_Form(this, settings));
            });
        },
        add_token:    function(item) {
            this.data("searchBoxFormObject").add_token(item);
            return this;
        },
        get_tokens: function() {
            return this.data("searchBoxFormObject").get_tokens();
        },
        clear_tokens:  function(item) {
            this.data("searchBoxFormObject").clear_tokens();
            return this;
        },
        clear_input_area: function() {
            this.data("searchBoxFormObject").clear_input_area();
            return this;
        },
        load_dic_if_needed: function(isSilentLoading){
            $(this).data("searchBoxFormObject").load_dic_if_needed(isSilentLoading);
        },
        trigger_doc_input: function(docId){
            $(this).data("searchBoxFormObject").trigger_doc_input(docId);
        },
        setInputBoxFocus: function(){
            $(this).data("searchBoxFormObject").setInputBoxFocus();
        }
    };

    // Expose the .tokenInput function to jQuery as a plugin
    $.fn.search_box_form = function (method) {
        // Method calling and initialization logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
    };

    // TokenList class for each input
    $.Search_Box_Form = function (div_search_box_form, settings) {

        var root_container_id = div_search_box_form.id;
        var $div_wrapper = $(div_search_box_form).addClass("search-box_form d-flex flex-nowrap").data('SETTINGS', settings);

        //
        // utility modules
        //
        function uniq_fast(a) {
            let seen = {};
            let out = [];
            let len = a.length;
            let j = 0;
            for(let i = 0; i < len; i++) {
                let item = a[i];
                if(seen[item] !== 1) {
                    seen[item] = 1;
                    out[j++] = item;
                }
            }
            return out;
        }
        
        function _get_tokeninput_id(){
            let current_settings = $div_wrapper.data('SETTINGS');
            return TOKENINPUT_ID[current_settings.search_type];
        }

        //
        // sub modules for UI
        //
        function create_text_input_button(language){
            let $btn = $('<button>').addClass('round-button').attr('id',"btn_text_input_trigger");
            $('<img>').attr({
                'src':            '/static/record/images/HPOID_grey.svg',
                'data-toggle':    'tooltip',
                'data-html':'true',
                'data-original-title': LANGUAGE[language]['TEXT_INPUT_TITLE']
            })
			let $span = $('<span>').addClass("material-symbols-outlined").text('playlist_add')
					   .attr({'data-toggle':'tooltip','data-original-title':LANGUAGE[language]['TEXT_INPUT_TITLE']})
            .tooltip({trigger: 'hover', placement:'top', container: 'body', boundary: 'window' })
            .appendTo($btn);

            return $btn;
        }


        // trigger to show setting GUI
        function create_uisetting_button(language){
            let btn_id = _construct_unique_id(root_container_id, 'btn_uisetting_trigger');
            let $btn = $('<button>').attr('tid',btn_id).addClass('round-button');
            $('<span>').addClass('material-icons btn_uisetting_trigger').text('settings')
                        .attr('id',btn_id)
                        .attr({
                            'data-toggle':'tooltip',
                            'data-html':'true',
                            'data-original-title': LANGUAGE[language]['UISETTING_BTN_TITLE']
                        })
                        .tooltip({trigger: 'hover', placement:'top', container: 'body', boundary: 'window' })
                        .appendTo($btn);
            return $btn;
        }

        function create_uisetting_ui(language, uisetting_tag_size, uisetting_language, trigger_btn_id){

            let dropdown_id = _construct_unique_id(root_container_id, 'dropdown-menu_uisetting');
            let $dropdown = $('<div>').attr({'id':dropdown_id}).addClass('dropdown-menu-wrapper').appendTo('body');
            let $form     = $('<div>').appendTo($dropdown);
            let $tbl      = $('<table>').appendTo($form);

            let $tr0      = $('<tr>').appendTo($tbl);
            let $td0_1    = $('<td>').text(LANGUAGE[language]['UISETTING_BTN_TITLE']).addClass('uititle').attr("colspan",2).appendTo($tr0);
            
            let $tr1      = $('<tr>').appendTo($tbl);
            $('<td>').text(LANGUAGE[language]['UISETTING_TBL_LABEL_TAGSIZE']).addClass('title').css({"padding-top":"10px"}).appendTo($tr1);
            let $td1_2    = $('<td>').appendTo($tr1);
            let $select_tagsize = $('<select>').addClass("sel_tagsize").appendTo($td1_2);
            UISETTING_TAG_SIZE_LST.forEach(function(tag_size){
                $('<option>').text(LANGUAGE[language]['UISETTING_TAG_SIZE_LABEL'][tag_size])
                             .val(tag_size)
                             .appendTo($select_tagsize);
            });
            $select_tagsize.val(uisetting_tag_size).change(function() {
                let selected_tag_size = $(this).val();

                let cookie_name_tag_size = _construct_unique_id(root_container_id, 'uisetting_tag_size');
                setCookie(cookie_name_tag_size, selected_tag_size);
                
                let oldsettings = $div_wrapper.data('SETTINGS');
                let newsettings = $.extend({}, oldsettings, {'uisetting_tag_size':selected_tag_size});
                $div_wrapper.data('SETTINGS', newsettings);

                let tokeninput_id = TOKENINPUT_ID[newsettings.search_type];
                $("#"+tokeninput_id).tokenInput("setTagSize",selected_tag_size);
                if(newsettings.search_type === SERACH_TYPE_HPO) $("#"+tokeninput_id).popupRelationHPO("setTagSize",selected_tag_size);
                
                return false;
            });

            const template_uisetting = document.getElementById(dropdown_id);
            template_uisetting.style.display = 'block';
            tippy('#'+trigger_btn_id, 
                {
                    arrow:         true,
                    allowHTML:     true,
                    appendTo:      document.body,
                    animation:     'scale-extreme',
                    maxWidth:      500,
                    width:           450,
                    strategy:     'fixed',
                    interactive:   true,
                    trigger:      'click',
                    theme:        'pcf-popup',
                    placement:    'bottom-start',
                     offset:      [-15, 10],
                    content:      template_uisetting
                }
            );
        }

        function create_clear_button(){
            return $('<button>').addClass('round-button material-icons').text('clear')
                        .click(function(){
                            let current_settings = $div_wrapper.data('SETTINGS');
                            let tokeninput_id = TOKENINPUT_ID[current_settings.search_type];
                            $("#"+tokeninput_id).tokenInput("clear");
                            if(current_settings.search_type === SERACH_TYPE_HPO){
                                $("#"+tokeninput_id).popupRelationHPO('triggerChangeState');
                            }
                            return false;
                        });
        }

        //
        // modules for outside call
        //
        this.update_setting = function(newoption) {
            var oldsettings = $div_wrapper.data('SETTINGS');
            var newsettings = $.extend({}, oldsettings, newoption || {});
            $div_wrapper.data('SETTINGS', newsettings);
        };                

        this.add_token = function(item) {
            let tokeninput_id = _get_tokeninput_id();
            $("#"+tokeninput_id).tokenInput("add", item);
        };

        this.get_tokens = function() {
            let tokeninput_id = _get_tokeninput_id();
            let hpo_list = $("#"+tokeninput_id).tokenInput("get");
            if(!hpo_list || !hpo_list.length) return hpo_list;
            let current_settings = $div_wrapper.data('SETTINGS');
            if(current_settings.search_type === SERACH_TYPE_HPO) $div_text.textinput_hpo('find_names_by_id', hpo_list);
            return hpo_list;
        };

        this.clear_tokens = function() {
            let tokeninput_id = _get_tokeninput_id();
            $("#"+tokeninput_id).tokenInput("clear");
        };

        this.clear_input_area = function() {
            let current_settings = $div_wrapper.data('SETTINGS');
            let tokeninput_id = _get_tokeninput_id();
            $("#"+tokeninput_id).tokenInput("clear");
            if(current_settings.search_type === SERACH_TYPE_HPO){
                $div_text.textinput_hpo('clear_input_area');
                $div_text.removeClass('active');
                $text_input_trigger.removeClass('selected');
            }
        };

        this.trigger_doc_input = function(docId){
            $text_input_trigger.trigger('click');
            $div_text.textinput_hpo('set_text_bydocId',docId);
        };

        this.setInputBoxFocus = function(){
            let tokeninput_id = _get_tokeninput_id();
            $("#"+tokeninput_id).tokenInput("setInputBoxFocus");
        };

        //
        // Initialization UI
        //
        var $div_left   = $('<div>').addClass("search-box_controller_left d-flex flex-column").appendTo($div_wrapper);
        if(settings.search_type !== SERACH_TYPE_HPO) $div_left.addClass("justify-content-center");
        var $div_middle = $('<div>').addClass("flex-grow-1 tokeninput_hpo_wrapper").appendTo($div_wrapper);
        var $div_right  = $('<div>').addClass("search-box_controller_right d-flex flex-column justify-content-center").appendTo($div_wrapper);

        var $text_input_trigger;
        if(settings.search_type === SERACH_TYPE_HPO){
            let $div_l1 = $('<div>').addClass("button_wrapper").appendTo($div_left);
            let $div_l2 = $('<div>').addClass("button_wrapper").appendTo($div_left);        
            $text_input_trigger = create_text_input_button(settings.lang).appendTo($div_l1).click(function(){
                $div_text.textinput_hpo('load_dic_if_needed');
                $div_text.textinput_hpo('clear_input_area');

                if(typeof settings.onClickTextBtn === "function"){
                    settings.onClickTextBtn($(this).hasClass('selected'))
                }

                $div_text.toggleClass('active');
                $(this).toggleClass('selected');
                if($div_text.hasClass('active')) $('#text-input-area').focus();
            });

            let $ui_trigger_btn = create_uisetting_button(settings.lang).appendTo($div_l2);    
            create_uisetting_ui(settings.lang, settings.uisetting_tag_size, settings.uisetting_language, $ui_trigger_btn.attr('tid'));
        }else{
            let $div_l1 = $('<div>').addClass("button_wrapper").appendTo($div_left);
            let $ui_trigger_btn = create_uisetting_button(settings.lang).appendTo($div_l1);    
            create_uisetting_ui(settings.lang, settings.uisetting_tag_size, settings.uisetting_language, $ui_trigger_btn.attr('tid'));
        }

        let $div_r1 = $('<div>').addClass("button_wrapper").appendTo($div_right);
        create_clear_button().appendTo($div_r1);

        var $div_text;
        var tokeninput_id = TOKENINPUT_ID[settings.search_type];
        //$('<textarea>').attr('rows','1').attr('id',tokeninput_id).attr('name','str_phenotypes').appendTo($div_middle);
        $('<textarea>').attr('rows','1').attr('id',tokeninput_id).appendTo($div_middle);
        $("#"+tokeninput_id).tokenInput(
            settings.url_tokeninput_hpo, 
            {
                theme:               "facebook", 
                lang:                settings.lang,
                search_type:         settings.search_type,
                uisetting_language:  settings.uisetting_language,
                uisetting_tag_size:  settings.uisetting_tag_size,
                second_url_str:      settings.url_tokeninput_hpo_second,
                onLongerQuery:       settings.search_type !== SERACH_TYPE_HPO? null : function(text){
                    if($text_input_trigger.hasClass('selected')) {
                        $div_text.textinput_hpo('set_text',text)
                    }else{
                        $text_input_trigger.trigger('click')
                        $div_text.textinput_hpo('set_text',text)
                    }
                },
                onClickDelete:       settings.search_type !== SERACH_TYPE_HPO? null : function() {
                    $("#tokeninput_hpo").popupRelationHPO('triggerChangeState');
                },
                getExcludeHPOList:   settings.getExcludeHPOList
            }
        );
        if(settings.search_type === SERACH_TYPE_HPO){

            $("#"+tokeninput_id)
                .popupRelationHPO( settings.url_popup_hierarchy_hpo,
                                {'is_hierarchy_fullscreen': false,
                                'language_in': settings.lang,
                                'prependTo': div_search_box_form.id
                                });

            $("#"+tokeninput_id).tokenInput("setInputBoxFocus");

            $div_text = $('<div>').attr('id', 'text-input-container').insertAfter($div_wrapper);
            $div_text.textinput_hpo({ 
                doc_list: settings.doc_list,
                language: settings.lang,
                getDocByColId: settings.getDocByColId,
                output_hpo: function(hpo_list){
                    $("#tokeninput_hpo").tokenInput("add_hpo_list", hpo_list);
                },
                load_text:  null,
                trigger_close: function(){
                    $text_input_trigger.trigger('click')
                }
            });

            this.load_dic_if_needed = function(){
                $div_text.textinput_hpo('load_dic_if_needed', true);
            };
        }
    };
}(jQuery));

