;(function ($) {

    //const HPO_DIC="/static/data/casemini/text_input/HPO-japanese.20221104.textinput.txt",
	const HPO_DIC="/static/data/priority-i/HPO-japanese.20221104.textinput.txt",
          IS_NOTOBSERVED_REGEX='[な無](かった|く|い|し)|(られ|され|おら|せ|でき|出来|みえ|認め)ず',
          IS_NOTOBSERVED_CHARS_NUM=20,
          IS_NOTOBSERVED_STOP_LETTERS=["\,","\.","\。","\．","\\n"];


    const SETTINGS_KEY     = 'textInputHPOSettings',
          OBJECT_KEY       = 'textInputHPOObject',
          OBSERVED_Y       = 'observed',
          OBSERVED_N       = 'notobserved',
          CLASS_OBSERVED_Y = 'observed',
          CLASS_OBSERVED_N = 'notobserved',
          CLASS_CHOSEN     = 'chosen',
          STATUS_KEY       = 'textInputHPOStatus',
          STATUS_INIT      = 'init',
          STATUS_LOADING   = 'loading',
          STATUS_LOADED    = 'loaded';

    const LANGUAGE_EN='en', LANGUAGE_JA='ja',
          LANGUAGE = {
            [LANGUAGE_EN] : {
                'placeholder' : 'Type in the patient phenotype description.',
                'sample_label': {
                    [OBSERVED_Y] : 'Observed',
                    [OBSERVED_N] : 'Not Observed'
                }
            },
            [LANGUAGE_JA] : {
                'placeholder' : 'テキストを入力し、「STEP2へ」をクリックして下さい。',
                'sample_label': {
                    [OBSERVED_Y] : '症状あり',
                    [OBSERVED_N] : '症状なし'
                }
            }
        }    
    ;

    var DEFAULT_SETTINGS = {
        language:       LANGUAGE_JA,
        doc_list:       null,
        output_hpo:     null, //func that output hpos
        getDocByColId:  null, //func that load text by docId
        trigger_close:  null,
        on_list_change: null
    };


    var _isFunction = function(value) {
        return typeof value === "function";
    },
    _isArray = function(value){
		return Array.isArray(value);
	},
    _isDefined = function(value) {
        return typeof value !== 'undefined';
    },
    _isEmpty = function(value) {
        return (!(_isDefined(value))) || (value === null) ||  value === '' || (_isArray(value) && value.length === 0);
    },
    _hasJA = function( str ) {
        return ( str && str.match(/[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+/) )? true : false;
    };
    
    var methods = {
        init: function(options) {
            var settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
            return this.each(function () {
                $(this).data(SETTINGS_KEY, settings);
                $(this).data(OBJECT_KEY, new $.TextInputHPO(this));
            });
        },
        load_dic_if_needed: function(isSilentLoading){
            $(this).data(OBJECT_KEY).load_dic_if_needed(isSilentLoading);
        },
        clear_input_area: function(text){
            $(this).data(OBJECT_KEY).clear_input_area();
        },
        find_names_by_id: function(hpo_list){
            return $(this).data(OBJECT_KEY).find_names_by_id(hpo_list);
        },
        get_url_str: function(){
            return $(this).data(OBJECT_KEY).get_url_str();
        },
		trigger_parse_text: function(){
			$(this).data(OBJECT_KEY).trigger_parse_text();
		},
		get_parsed_text: function(){
			return $(this).data(OBJECT_KEY).get_parsed_text();
		},
		set_focus_to_textarea: function(){
			$(this).data(OBJECT_KEY).set_focus_to_textarea();
		},
		set_focus_to_table: function(){
			$(this).data(OBJECT_KEY).set_focus_to_table();
		},
		change_input_area_status: function(isReadOnly){
			$(this).data(OBJECT_KEY).change_input_area_status(isReadOnly);
		},
		get_download_content_hpo: function(){
			return $(this).data(OBJECT_KEY).get_download_content_hpo();
		},
		reset_to_before_parse: function(){
			$(this).data(OBJECT_KEY).reset_to_before_parse();
		}
    };

    $.fn.textinput_hpo = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
    };


    $.TextInputHPO = function (container) {
        
        let $container = $(container).data(STATUS_KEY, STATUS_INIT);
        
        let current_settings = $container.data(SETTINGS_KEY);

        let hpo_dic = new $.TextInputHPO.HPO_dic();
        
        //
        // construct UI
        //
        // loader ui
        let $text_input_loader = $('<div>').attr('id', 'text-input-loader').appendTo($container);
        let $div_loader_wrapper = $('<div>').addClass("d-flex flex-row").appendTo($text_input_loader);
        $('<span>').addClass("text-input-loader-gif").appendTo($div_loader_wrapper);
        $('<span>').attr('id', 'text-input-loader-text').appendTo($div_loader_wrapper);
        function _text_input_show_loader(text){
            if(text){
                $('#text-input-loader-text').text(text);
            }else{
                $('#text-input-loader-text').text("");
            }
            if($('#text-input-loader').css('display') === 'none') $("#text-input-loader").fadeIn("normal");
        };
        function _text_input_hide_loader(){
            if($('#text-input-loader').css('display') === 'none') return;
            $("#text-input-loader").fadeOut("slow");
        };

        // header
        let $header = $('<div>').addClass('text-input-header w-100 d-flex flex-row').appendTo($container);
        let $header_sub_l = $('<div>').addClass('text-input-header-sub step1 w-50 mr-2').appendTo($header);
        $('<h5>').text('STEP1：テキストを入力').appendTo($header_sub_l);
        let $header_sub_r = $('<div>').addClass('text-input-header-sub step2 w-50 ml-2').appendTo($header);
		$('<h5>').text('STEP2：症状を選択').appendTo($header_sub_r);     
		let $sample_wrap = $('<div>').addClass('sample-wrap d-flex flex-nowrap').appendTo($header_sub_r);
        $('<span>').addClass("sample").addClass(CLASS_OBSERVED_Y).addClass('mr-3').text(LANGUAGE[current_settings.language]['sample_label'][OBSERVED_Y]).appendTo($sample_wrap);
        $('<span>').addClass("sample").addClass(CLASS_OBSERVED_N).text(LANGUAGE[current_settings.language]['sample_label'][OBSERVED_N]).appendTo($sample_wrap); 

        // content
        let $content = $('<div>').addClass('text-input-content d-flex justify-content-between').appendTo($container);
        let $text_input_textarea_wrapper = $('<div>').addClass('text-input-wrapper step1 d-flex flex-column')
                                                     .scroll(function(e) {e.stopPropagation();})
                                                     .appendTo($content);

        let $text_input_textarea         = new $.TextInputHPO.HPO_textarea(current_settings.language, function(hpo_id){$text_input_table.chosen(hpo_id);});
        $text_input_textarea.get_textarea().appendTo($text_input_textarea_wrapper);

		let $button_wrapper = $('<div>').addClass('button-wrapper').appendTo($text_input_textarea_wrapper);
		$('<button>').text('症状を再抽出')
					.click(function(){
			            $text_input_table.clear();
			            _parse_text();
					}).appendTo($button_wrapper);

        let $text_input_table_wrapper    = $('<div>').addClass('text-input-wrapper step2')
                                                     .scroll(function(e) {e.stopPropagation();})
                                                     .appendTo($content);
        let $text_input_table = new $.TextInputHPO.HPO_table(
                                        current_settings.language, 
                                        function(hpo_id){$text_input_textarea.chosen(hpo_id);},
                                        function(hpo_id,class_observed){$text_input_textarea.changeObservedStatus(hpo_id, class_observed);},
                                        current_settings.on_list_change
                                    );
        $text_input_table.get_table().appendTo($text_input_table_wrapper);


        // end of ui initialize
        let _clear = function(){
            $text_input_textarea.clear()
            $text_input_table.clear()
            $(":button.doc").removeClass('selected')
        }

        this.clear_input_area = function(){
            _clear();
        }
        
        this.load_dic_if_needed = function(isSilentLoading){
            let status = $container.data(STATUS_KEY);
            if(status === STATUS_LOADING || status === STATUS_LOADED) return;
            if(!hpo_dic.isLoaded()){
                hpo_dic.load_HPO_DIC_from_server(
                    function(){
                        if(!isSilentLoading) _text_input_show_loader(); 
                        $container.data(STATUS_KEY, STATUS_LOADING);
                    },  //func before loading
                    function(){
                        if(!isSilentLoading) _text_input_hide_loader(); 
                        $container.data(STATUS_KEY, STATUS_LOADED);
                    },  //func after load
                    function(){
                        if(!isSilentLoading) _text_input_hide_loader(); 
                        $container.data(STATUS_KEY, STATUS_INIT);
                    }   //func failed loading
                );
            }
        }
        
        this.find_names_by_id = function(hpo_list){
            return hpo_dic.find_names_by_id(hpo_list);
        }

        this.get_url_str = function(){
            let ret_str = $text_input_table.get_observed_hpo_id_list_str();
            return ret_str;
        }

		this.trigger_parse_text = function(){
			$text_input_table.clear();
			_parse_text();
		}

		this.get_parsed_text = function(){
			let usr_input_text = $text_input_textarea.get_text();
			return usr_input_text;
		}
		this.reset_to_before_parse = function(){
			$text_input_textarea.reset_to_before_parse();
		}

		this.set_focus_to_textarea = function(){
			$text_input_textarea.set_focus();
		}

        this.set_focus_to_table = function(){
            $text_input_table.set_focus();
        }

		this.change_input_area_status = function(isReadOnly){
			$text_input_textarea.change_input_area_status(isReadOnly);
			$text_input_table.change_input_area_status(isReadOnly);
		}

		this.get_download_content_hpo = function(){
			let ret = [];
			let hpo_list = $text_input_table.get_hpo_list();
			for(let i = 0; i< hpo_list.length; i++){
				let line = hpo_list[i].id + "\t" +	hpo_list[i].name_ja + "\t" + hpo_list[i].name_en;
				if(hpo_list[i].is_observed === 'yes'){
					line = line + "\t" + "症状あり";
				}else{
					line = line + "\t" + "症状なし";
				}
				ret.push(line);
			}
			return ret.join('\n');
		}


        //
        // functions of parsing text
        //    
        let _parse_text = function(){
            //clear table
            $text_input_table.clear();

            // get the user input text from textarea
            let usr_input_text = $text_input_textarea.get_text();
            if(usr_input_text.length === 0){
                alert('Please input first!');
                $text_input_textarea.set_focus();
                return false;
            } 
            
            usr_input_text = _normalize_text(usr_input_text);
            
            // find hpo match in text
            let hpomatches = _search_hpomatch_from_text(usr_input_text);
            
            // output match to table
            $text_input_table.add(hpomatches);
            
            // output match to textarea
            $text_input_textarea.add(usr_input_text, hpomatches);
        };

        function _normalize_text(note) {
            if(note.length === 0) return "";
            let parsed_text = jaconv.normalize(note);
            if ( String.prototype.normalize ) {
              parsed_text = parsed_text.normalize("NFKC");
            }
            return parsed_text;
        }
        
        function _check_observed_status(startpos, text){
            
            let endpos   = Math.min(startpos + IS_NOTOBSERVED_CHARS_NUM, text.length);
            let str = text.substring(startpos, endpos).trim();
            
            for( let n=0; n<IS_NOTOBSERVED_STOP_LETTERS.length; n++) {
                let stop_letter = IS_NOTOBSERVED_STOP_LETTERS[n];
                let idx_stop = str.indexOf(stop_letter);
                if(idx_stop >=0)str = str.substring(0,idx_stop);
            }
            
            if(str && str.match(IS_NOTOBSERVED_REGEX)){
                return false;
            }
            
            return true;
        }

        function _search_hpomatch_from_text(text) { 
            let text1 = text.toUpperCase();
         
            let matches_lst = [];

            let idx_hashtable = {};
            
            $.each(hpo_dic.get_dic(), function(i, item) {

                let hpo_term = item.SEARCH_KEY;
        
                if(hpo_term.length > 0){
        
                    // check if longer was chosen already.
                    let none_longer_found = true;            
                    let long_lst_str = item.PARENTS;
                    if(long_lst_str.length > 0) {
                        let long_lst = long_lst_str.split(",");
                        for(let j = 0; j < long_lst.length; j++){
                            let key = 'idx_'+ long_lst[j];
                            if(idx_hashtable[key]){
                                none_longer_found = false;
                                break;
                            }
                        } 
                    }
        
                    if(none_longer_found){
                        let counter = 0;
                        for(let pos = text1.indexOf(hpo_term); pos !== -1; pos = text1.indexOf(hpo_term, pos + 1)) {
                            let term_in_text = text.substring(pos, pos + hpo_term.length);
                            let obj = {start:           pos,
                                        end:           pos + hpo_term.length -1,
                                        id_in_dic:       item.HPO_ID,
                                        term_in_dic:   hpo_term,
                                        eterm_in_dic:  item.ET,
                                        jterm_in_dic:  item.JT,
                                        term_in_text:  term_in_text,
                                        is_observed:   _check_observed_status(pos+hpo_term.length, text)
                            };
                            matches_lst.push(obj);
                            counter = counter + 1;
                        }
        
                        if(counter > 0){
                            let key = 'idx_'+i;
                            idx_hashtable[key] = counter;
                        }
                    }else{
                        //check overlap
                        for(let pos = text1.indexOf(hpo_term); pos !== -1; pos = text1.indexOf(hpo_term, pos + 1)) {
                            let start = pos;
                            let end   = pos + hpo_term.length -1;
                            let isOverlapped = false;
                            for(let idx=0; idx<matches_lst.length;idx++){
                                if( end < matches_lst[idx].start || start > matches_lst[idx].end){
                                    //no overlap
                                }else{
                                    //found overlap
                                    isOverlapped = true;
                                    break;
                                }
                            }
        
                            if(!isOverlapped){
                                let term_in_text = text.substring(pos, pos + hpo_term.length);
                                let obj = {start:         pos,
                                           end:             pos + hpo_term.length -1,
                                           id_in_dic:     item.HPO_ID,
                                           term_in_dic:  hpo_term,
                                           eterm_in_dic: item.ET,
                                           jterm_in_dic: item.JT,
                                           term_in_text: term_in_text,
                                           is_observed:  _check_observed_status(pos+hpo_term.length, text)
                                };
                                
                                matches_lst.push(obj);
                               
                                let key = 'idx_'+i;
                                if(key in idx_hashtable){
                                    idx_hashtable[key] = idx_hashtable[key] + 1;
                                }else{
                                    idx_hashtable[key] = 1;
                                }
                            }
                        }
                   }
               }
            });
        
            idx_hashtable.length = 0;
        
            // Startの順にソート（昇順）
            matches_lst.sort(function(a, b) {
                if (a.start < b.start) return -1;
                if (a.start > b.start) return 1;
                if (a.end < b.end) return -1;
                if (a.end > b.end) return 1;
                return 0;
            });
        
            //_remove_overlap(matches_lst);
            return matches_lst;
        }

		$text_input_textarea.set_focus();
        
    };

    $.TextInputHPO.HPO_textarea = function (language, onChosen) {
        
        this.language = language;
        
        let $textarea = $('<div>').attr('id', 'text-input-area')
			.attr('contenteditable','true')
			.attr('data-placeholder', LANGUAGE[this.language].placeholder)
			.attr('autocomplete','off')
			.attr('autocapitalize','off')
			.attr('spellcheck', false)
			.addClass('text-input-textarea')
			.on("paste", function (e) {
		        e.preventDefault();

		        let text;
		        let clp = (e.originalEvent || e).clipboardData;
		        if (clp === undefined || clp === null) {
		            text = window.clipboardData.getData("text") || "";
		            if (text !== "") {
		                if (window.getSelection) {
		                    let newNode = document.createElement("span");
		                    newNode.innerHTML = text;
		                    window.getSelection().getRangeAt(0).insertNode(newNode);
		                } else {
		                    document.selection.createRange().pasteHTML(text);
		                }
		            }
		        } else {
		            text = clp.getData('text/plain') || "";
		            if (text !== "") {
		                document.execCommand('insertText', false, text);
		            }
		        }
		    });

        let onChosenSpan = onChosen;

        this.get_textarea_id = function(){
            return 'text-input-area';
        };

        this.clear = function(){
            $textarea.empty();
        };

        this.chosen = function(hpo_id){
            $textarea.find("span").removeClass(CLASS_CHOSEN);
            $textarea.find("span[data-hpo_id~='"+hpo_id+"']").addClass(CLASS_CHOSEN);
        };

        this.changeObservedStatus = function(hpo_id, class_observed){
            $textarea.find("span[data-hpo_id~='"+hpo_id+"']").removeClass(CLASS_OBSERVED_Y).removeClass(CLASS_OBSERVED_N).addClass(class_observed);
        };


                                
        this.get_text = function(){
			return _get_text();
		}

		this.reset_to_before_parse = function(){
			let text = _get_text();
			_add_text(text);
		}

		function _get_text(){
            let html_str = $textarea.html();

            let note = "";
                        
            let idx = html_str.indexOf("<div>");
            if(idx >= 0){
                while(idx >= 0){
                    // strip letters before <div>
                    let str = html_str.substring(0,idx);
                    note = note + str;
                    html_str = html_str.substring(idx);
                    
                    // get <div>...</div>
                    let idx2 = html_str.indexOf("</div>");
                    let div_str = html_str.substring(0,idx2 + 6);
                    if(note){
                        note = note + "\n" + $(div_str).text();
                    }else{
                        note = $(div_str).text();
                    }
                    html_str = html_str.substring(idx2 + 6);
                    
                    idx = html_str.indexOf("<div>");
                }
                if(html_str.length > 0) {
                    note = note + "\n" + html_str;
                }
                
            }else {
                note =  $textarea.text().trim();
            }
            
            return note;
        }

        this.set_focus = function(){
            setTimeout(function() {$textarea.trigger('focus');}, 10);
        };

		this.change_input_area_status = function(isReadOnly){
        	$textarea.attr('contenteditable',!isReadOnly);
		}

        this.add_text = function(text){
			_add_text(text);
		};

		function _add_text(text){
            let lst = text.split('\n');
            let parsed_text = '<div>' + lst.join('</div><div>') + '</div>'; 
            $textarea.empty().append(parsed_text);
        }

        this.add = function(normalized_text, hpomatches){

            let formated_text = "";
            let current_start_pos = 0;
        
            for( let i=0; i<hpomatches.length; i++) {
                let start  = hpomatches[i].start;
                let end       = hpomatches[i].end;
                let hpo_id = hpomatches[i].id_in_dic;
                
                let before_str = normalized_text.substring(current_start_pos, start);
                let hpo_str    = normalized_text.substring(start, end + 1);
        
                formated_text = formated_text + before_str;
        
                let class_from_symptoms = CLASS_OBSERVED_N;
                if(hpomatches[i].is_observed) class_from_symptoms = CLASS_OBSERVED_Y;
                formated_text = formated_text + '<span class=\"'+class_from_symptoms+'\" data-hpo_id=\"'+hpo_id+'\">' + hpo_str + '</span>';
                current_start_pos = end + 1;
            }
        
            if(current_start_pos < normalized_text.length -1){
                let str = normalized_text.substring(current_start_pos);
                formated_text = formated_text + str;
            }

            let lst = formated_text.split('\n');
            let parsed_text = '<div>' + lst.join('</div><div>') + '</div>'; 
            
            $textarea.empty().append(parsed_text);
            
            $textarea.find('span').click(function(event){
                event.stopPropagation();
                event.preventDefault();
                $textarea.find('span').removeClass(CLASS_CHOSEN);
                $(this).addClass(CLASS_CHOSEN);
                if(_isFunction(onChosenSpan)) {
                    let hpo_id = $(this).attr('data-hpo_id');                    
                    onChosenSpan(hpo_id);
                }
            });
        };

        this.get_textarea = function(){
            return $textarea;
        };
        
    };

    
    $.TextInputHPO.HPO_table = function (language, onChosen, onChange, onListChange) {
        
        this.language = language;
        
        let $table = $('<table>').addClass("text-input-table form-control table table-hover p-0 ")
								.attr('id','hpo-list-input-table').attr('contenteditable','true');
        let $tbody = $('<tbody>').appendTo($table);
        let onChosenRow            = onChosen;
        let onChangeObservedStatus = onChange;
        let onListChangeRow        = onListChange;

        this._change_observed_state = function(hpo_id, observed_class,btn_id){
            let $tr = $('#'+btn_id).closest("tr");
			$tr.find("td[data-hpo_id~='"+hpo_id+"']").removeClass(CLASS_OBSERVED_Y).removeClass(CLASS_OBSERVED_N).addClass(observed_class);
            $tr.removeClass(CLASS_OBSERVED_Y).removeClass(CLASS_OBSERVED_N).addClass(observed_class);
            let $cbx = $tr.find("input[type='checkbox']")
            let hpo_data = $cbx.data('HPO_ITEM')
            hpo_data.is_observed = observed_class === CLASS_OBSERVED_Y ? 'yes':'no'
            $cbx.data('HPO_ITEM',hpo_data)
            if(_isFunction(onChangeObservedStatus)){
                onChangeObservedStatus(hpo_id, observed_class);
            }

            if($cbx.is(':checked') && _isFunction(onListChangeRow)) {
                onListChangeRow();
            }
        };

        this.clear = function(){
            $table.find("tr").remove();
        };

        this.chosen = function(hpo_id){
            $table.find("tr").removeClass(CLASS_CHOSEN);
            $table.find("tr[data-hpo_id~='"+hpo_id+"']").addClass(CLASS_CHOSEN);
            
            let id = $table.find("tr[data-hpo_id~='"+hpo_id+"']").attr('id');
            let element = document.getElementById(id);
            element.scrollIntoViewIfNeeded(); // Centers the element in the visible area
        };

        this.set_focus = function(){
            setTimeout(function() {$table.trigger('focus');}, 10);
        };       

        this.change_input_area_status = function(isReadOnly){
            $table.attr('contenteditable',!isReadOnly);
			$table.find('button').attr('disabled', isReadOnly);
			if(isReadOnly) {
				$table.find('button').addClass("readonly");
				$table.find('input').addClass("readonly");
			}else{
				$table.find('button').removeClass("readonly");
				$table.find('input').removeClass("readonly");
			}
        }
 
        this.get_hpo_list = function(){
            let ret = [];
            $table.find("input[name='hpo_list']:checked").each(function(){
                let hpo_item = $(this).data('HPO_ITEM');
                ret.push(hpo_item);
            });
            return ret;
        };

        this.get_observed_hpo_id_list_str = function(){
            let ret = [];
            $table.find("input[name='hpo_list']:checked").each(function(){
                let hpo_item = $(this).data('HPO_ITEM');
                if(hpo_item.is_observed === 'yes'){
                    ret.push(hpo_item.id);
                }
            });
            return ret.join(",");
        };

 
        this.add = function(hpomatches){
            let hpo_list = {};
            for( let i=0; i<hpomatches.length; i++) {
                let id_in_dic    = hpomatches[i].id_in_dic;
                let is_observed =  hpomatches[i].is_observed;
                if(id_in_dic in hpo_list){
                    if(!is_observed) hpo_list[id_in_dic].is_observed = is_observed;
                }else{
                    hpo_list[id_in_dic] = hpomatches[i];
                }
            }
            
            let i = 0;
            for( let key in hpo_list) {
                let id_in_dic    = hpo_list[key].id_in_dic;
                let jterm_in_dic = hpo_list[key].jterm_in_dic;
                let eterm_in_dic = hpo_list[key].eterm_in_dic;
                let is_observed  = hpo_list[key].is_observed;

                //let $tr = $('<tr>').addClass('table-secondary').appendTo($table);
                let $tr = $('<tr>').addClass('table-secondary').addClass(is_observed?CLASS_OBSERVED_Y:CLASS_OBSERVED_N)
								   .attr('contenteditable','false')
                                   .attr('data-hpo_id', id_in_dic)
                                   .attr('id', 'text-input-table-row-' + i)
                                   .click(function(){
                                        $table.find('tr').removeClass(CLASS_CHOSEN);
                                        $(this).addClass(CLASS_CHOSEN);
                                        
                                        if(_isFunction(onChosenRow)) {
                                            let hpo_id = $(this).attr('data-hpo_id');
                                            onChosenRow(hpo_id);
                                        }
                                   });

                let $td1 = $('<td>').addClass('selection').appendTo($tr);
                let $cbx = $('<input>', {type: 'checkbox', name: 'hpo_list', "checked":"checked"})
								.click(function(event){
									if($(this).hasClass('readonly')){
										event.preventDefault();
										event.stopImmediatePropagation();
									}
								})
								.change(function() {
                                   let $parentTr = $(this).closest('tr');
                                   if($parentTr.hasClass(CLASS_OBSERVED_Y) &&  _isFunction(onListChangeRow)) {
                                       onListChangeRow();
                                   }
                               }) 
                               .appendTo($td1);
                
                let name_text = eterm_in_dic;
                if(this.language === LANGUAGE_JA && jterm_in_dic) name_text = jterm_in_dic;
                let hpo_id = id_in_dic;
                $cbx.css({'margin-bottom':'unset'})
                    .data('HPO_ITEM', {
                        'id':hpo_id, 
                        'name':name_text,
                        'name_ja': jterm_in_dic,
                        'name_en': eterm_in_dic,
                        'is_observed': is_observed?'yes':'no'
                    })
                    .change(function() {
                    $(this).closest('tr').toggleClass('table-secondary');
                });

                let $td2 = $('<td>').attr('data-hpo_id',id_in_dic).addClass(is_observed?CLASS_OBSERVED_Y:CLASS_OBSERVED_N).addClass('hpo_id').appendTo($tr);
                $('<span>').text(id_in_dic).appendTo($td2);
                
                let $td3 = $('<td>').addClass('hpo_name').appendTo($tr);
                let str = eterm_in_dic;
                if(this.language === LANGUAGE_JA && jterm_in_dic) str = jterm_in_dic; 
                $td3.text(str);

                let $td4 = $('<td>').appendTo($tr);
                let dropdown_toggle = document.createElement('button');
                //dropdown_toggle.classList.add('material-symbols-outlined');
                //dropdown_toggle.innerHTML = "more_vert";
				dropdown_toggle.innerHTML = `
					<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black">
					  <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
					</svg>
				`;
                let btn_id = "dropdownMenuButton"+i;
                let lang   = this.language;
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
                    hpo_id:     id_in_dic,
                    btn_id:     btn_id,
                    li_Y_id:    li_Y_id,
                    li_N_id:    li_N_id,
                    hpo_tbl_obj: this,
                    onCreate(instance) {
                        // Setup our own custom state properties
                        instance._isSetClickEvent = false;
                    },
                    onShown(instance) {
                        if (instance._isSetClickEvent) return;
                        let btn_id = instance.props.btn_id;
                        let hpo_id = instance.props.hpo_id;
                        // set click event
                        let li_Y_id = instance.props.li_Y_id;
                        let li_N_id = instance.props.li_N_id;
                        let hpo_tbl_obj = instance.props.hpo_tbl_obj;
                        
                        $("#"+li_Y_id).click(function(){
                            hpo_tbl_obj._change_observed_state(hpo_id,CLASS_OBSERVED_Y,btn_id);
							setTimeout(function(){tippy.hideAll();},100);
                        });
                        
                        $("#"+li_N_id).click(function(){
                            hpo_tbl_obj._change_observed_state(hpo_id,CLASS_OBSERVED_N,btn_id);
							setTimeout(function(){tippy.hideAll();},100);
                        });
                        
                        instance._isSetClickEvent = true;
                    },
                    content(reference) {
                        return  "<ul class=\"dropdown-observe\">" +
                                    "<li id=\""+li_Y_id+"\">" +
                                        "<span class=\""+CLASS_OBSERVED_Y+"\">" +LANGUAGE[lang]['sample_label'][OBSERVED_Y] + "</span>" +
                                    "</li>" +
                                    "<li id=\""+li_N_id+"\">" +
                                        "<span class=\""+CLASS_OBSERVED_N+"\">" +LANGUAGE[lang]['sample_label'][OBSERVED_N] + "</span>" +
                                    "</li>" +
                                "</ul>";
                    }
                });

                $(dropdown_toggle).attr('id',btn_id).appendTo($td4);
                $tbody.append($tr);

                i++;
            }
        };

        this.get_table=function(){
            return $table;
        };
    };
    
    $.TextInputHPO.HPO_dic = function () {

        let hpo_dic_json = [];

        this.get_dic = function(){
            return hpo_dic_json; 
        };

        this.find_names_by_id = function(hpo_list){
            hpo_list.forEach(function(hpo){

                if('name_ja' in hpo) return;

				let hpo_id = hpo.id.replace('_ja','');
                for(let i=0; i<hpo_dic_json.length; i++){
                    if(hpo_dic_json[i].SEARCH_KEY === hpo_id){
                        hpo.name_ja = hpo_dic_json[i].JT;
                        hpo.name_en = hpo_dic_json[i].ET;
                        return;
                    }
                }
				
				if(_hasJA(hpo.name)){
					hpo.name_ja = hpo.name;
					hpo.name_en = "";
				}else{
					hpo.name_ja = "";
					hpo.name_en = hpo.name;
				}

            });
        };

        this.isLoaded = function(){
            return hpo_dic_json.length > 0; 
        };

        this.load_HPO_DIC_from_server = function(f_before,f_after,f_fail){
        
            if(_isFunction(f_before)) f_before();
        
            $.get(HPO_DIC)
             .done(function(data) {
                let lines   = data.split("\n");
                let headers = lines[0].split("\t");
                
                for(let i=1; i<lines.length; i++){
            
                    if(lines[i].trim().length == 0) continue;
                    let currentline=lines[i].split("\t");
					let obj = {};
                    for(let j=0; j<headers.length; j++){
                        obj[headers[j]] = currentline[j];
                    }
					if(obj.SEARCH_KEY.length <= 2 && !_hasJA(obj.SEARCH_KEY)){
						//ignore
					}else{
	                    hpo_dic_json.push(obj);
					}
                }
                if(_isFunction(f_after)) f_after();
             })
             .fail(function(errorThrown ) {
                 alert(errorThrown);
                 if(_isFunction(f_before)) f_fail();
             });
        };
    };

}(jQuery));
