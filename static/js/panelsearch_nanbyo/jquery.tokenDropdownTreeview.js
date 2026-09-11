(function ($) {

	const 
		TYPE_CHECKBOX        = 'checkbox',
		TYPE_SELECTION       = 'selection',
		KEY_TYPE             = 'type',
		KEY_IS_AFFECT_PARENT = 'is_affect_parent',
		OUTPUT_TYPE_ID       = 'output_type_id',
		OUTPUT_TYPE_ID_NAME  = 'output_type_id_name',
		KEY_OUTPUT_TYPE      = 'output_type',
		KEY_TREEVIEW_DATA    = 'treeview_data',
		KEY_PLACEHOLDER      = 'placeholder',
		KEY_HIDDENINPUT_ID   = 'hiddenInput',
		KEY_INITIALTOKENS    = 'initialTokens',
		KEY_ONCHANGE         = 'onChange',
		KEY_DATA_ID          = 'data_id',
		KEY_DATA_NAME        = 'data_name',
		KEY_USE_CONTROL      = 'use_control',
		KEY_CONTROL          = 'is_control',
		SETTINGS_KEY         = 'VGP_tokenDropdownTreeview_Settings',
		OBJECT_KEY           = 'VGP_tokenDropdownTreeview_Object';

	const DEFAULT_SETTINGS = {
		[KEY_TYPE]:				TYPE_CHECKBOX,			//define the treeview type
		[KEY_IS_AFFECT_PARENT]: false,					//when use the checkbox type,define if check affect parent
		[KEY_OUTPUT_TYPE]:		OUTPUT_TYPE_ID,			//define the output type
		[KEY_TREEVIEW_DATA]:	[],						//input treeview dataset
		[KEY_DATA_ID]:			'',						//the key used as 'ID' at input treeview dataset 
		[KEY_DATA_NAME]:		'',						//the key used as 'NAME' at input treeview dataset 
		[KEY_PLACEHOLDER]:		'Select by click ...',	//place holder at input field
		[KEY_HIDDENINPUT_ID]:	null,					//id of the hidden input
		[KEY_INITIALTOKENS]:	[],						//initial tokens
		[KEY_ONCHANGE]:			null,
		[KEY_USE_CONTROL]:		false  
	}

	var methods = {
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.tokenDropdownTreeview(this));
			});
		},
		resetTokens: function(newTokens){
			this.data(OBJECT_KEY).resetTokens(newTokens);
			return this;
		},
		resetTreeview: function(treeviewData){
			this.data(OBJECT_KEY).resetTreeview(treeviewData);
		}
	};
	
	$.fn.token_dropdown_treeview = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};

	$.fn.token_dropdown_treeview.TYPE_CHECKBOX        = TYPE_CHECKBOX;	
	$.fn.token_dropdown_treeview.TYPE_SELECTION       = TYPE_SELECTION;
	$.fn.token_dropdown_treeview.KEY_TYPE             = KEY_TYPE;
	$.fn.token_dropdown_treeview.KEY_IS_AFFECT_PARENT = KEY_IS_AFFECT_PARENT;
	$.fn.token_dropdown_treeview.OUTPUT_TYPE_ID       = OUTPUT_TYPE_ID;
	$.fn.token_dropdown_treeview.OUTPUT_TYPE_ID_NAME  = OUTPUT_TYPE_ID_NAME;
	$.fn.token_dropdown_treeview.KEY_OUTPUT_TYPE      = KEY_OUTPUT_TYPE;
	$.fn.token_dropdown_treeview.KEY_TREEVIEW_DATA    = KEY_TREEVIEW_DATA;
	$.fn.token_dropdown_treeview.KEY_DATA_ID          = KEY_DATA_ID;
	$.fn.token_dropdown_treeview.KEY_DATA_NAME        = KEY_DATA_NAME;
	$.fn.token_dropdown_treeview.KEY_PLACEHOLDER      = KEY_PLACEHOLDER;
	$.fn.token_dropdown_treeview.KEY_HIDDENINPUT_ID   = KEY_HIDDENINPUT_ID;
	$.fn.token_dropdown_treeview.KEY_INITIALTOKENS    = KEY_INITIALTOKENS;
	$.fn.token_dropdown_treeview.KEY_ONCHANGE         = KEY_ONCHANGE;
	$.fn.token_dropdown_treeview.KEY_USE_CONTROL      = KEY_USE_CONTROL;

	$.tokenDropdownTreeview = function (root_panel) {

		const root_panel_id= root_panel.id;
		const $root_panel  = $(root_panel).addClass("token-input-container");
		const settings     = $root_panel.data(SETTINGS_KEY);	
		const $hiddenInput = $('#' + settings[KEY_HIDDENINPUT_ID]);

		let tokens = []; // Start with an empty token list

		// Update hidden input
		function updateHiddenInput() {
			let result;
			if(settings[KEY_OUTPUT_TYPE] === OUTPUT_TYPE_ID){
				result = tokens.map(token => token[settings[KEY_DATA_ID]]).join(',');
			}else{
				result = tokens.map(token => `${token[settings[KEY_DATA_ID]]}--${token[settings[KEY_DATA_NAME]]}`).join('|');
			}
			$hiddenInput.val(result);
		}

		const $input = $('<input type="text" tabindex="1" />').attr("placeholder", settings[KEY_PLACEHOLDER]).prop('readonly',true);
		const $dropdown = $('<div class="typeahead-dropdown d-none"></div>');
		$root_panel.append($input, $dropdown);

		const $treeview_container = $('<div>').addClass("treeview-container").appendTo($dropdown);
		const treeview_id =`${root_panel.id}_treeview`;
		$('<ul>').attr('id',treeview_id).addClass('ztree').appendTo($treeview_container);
		$(`<span id="closeMOI" class="close">Close</span>`)
			.click(function(){
				hideDropdown();
			})
			.appendTo($treeview_container);
		

		let treeview_setting;
		if(settings[KEY_TYPE] === TYPE_CHECKBOX){
        	treeview_setting ={
				check: {
					chkboxType: (settings[KEY_IS_AFFECT_PARENT]) ? { "Y" : "p", "N" : "s" } : { "Y" : "", "N" : "" },
					enable: true,
					chkStyle: "checkbox"
				},
				view: {selectedMulti: false, showIcon: false, nameIsHTML: true},
				data: {
					key: {name: settings[KEY_DATA_NAME], title: settings[KEY_DATA_ID]}
				},
				callback:{
					beforeClick: function (treeId, treeNode, clickFlag) {
						if(settings[KEY_USE_CONTROL] && treeNode[KEY_CONTROL]) return true;
						return false;
					},
					onCheck: onNodeCheck,
					onClick: function(event, treeId, treeNode){
						if(treeNode[KEY_CONTROL]){
							var siblings = treeNode.getParentNode() ? treeNode.getParentNode().children : treeObj.getNodes();
							for (var i = 0; i < siblings.length; i++) {
								var sib = siblings[i];
								if (sib[settings[KEY_DATA_ID]] === treeNode[settings[KEY_DATA_ID]]) continue;
								uncheckAllChildren(sib);
								zTreeObj.checkNode(sib, false, false, true);
							}
						}
					}
				}
			};
		}else{
			treeview_setting = {
				view: {selectedMulti: false, dblClickExpand: false, showIcon: false, nameIsHTML: true},
				callback: {
					onClick: function(event, treeId, treeNode){
						_resetTokens(treeNode);
        			}
				},
				data: {
					key: {name: settings[KEY_DATA_NAME], title: settings[KEY_DATA_ID]}
            	}
			};
		}

		function uncheckAllChildren(node) {
			if (!node.children) return;

			for (var i = 0; i < node.children.length; i++) {
				var child = node.children[i];
				if(child[KEY_CONTROL]) continue;
				uncheckAllChildren(child);
				zTreeObj.checkNode(child, false, false, true);
			}
		}

		function _attach_ctl_button(parent_id, children_arr){
			for(let node of children_arr){
				if('children' in node && node.children.length > 0){
					_attach_ctl_button(node[KEY_DATA_ID], node.children);
				}
			}
			children_arr.push({
				[settings[KEY_DATA_NAME]]: '<span class="control_btn">該当なし</span>',
				[settings[KEY_DATA_ID]]: `${parent_id}-control-btn`,
				[KEY_CONTROL]: true,
				'nocheck': true
			});
		}

		if(settings[KEY_USE_CONTROL] && settings[KEY_TREEVIEW_DATA] && settings[KEY_TREEVIEW_DATA].length > 0){
			let root_node = settings[KEY_TREEVIEW_DATA][0];
			if('children' in root_node){
				let root_node_id = root_node[settings[KEY_DATA_ID]];
				_attach_ctl_button(root_node_id, root_node.children);
			}
		}

		var zTreeObj = $.fn.zTree.init($("#"+treeview_id), treeview_setting, settings[KEY_TREEVIEW_DATA]);

		function onNodeCheck(event, treeId, treeNode){
			if(settings[KEY_IS_AFFECT_PARENT]){
				zTreeObj.getNodesByFilter(function(node) {
					if (node.nando_id === treeNode.nando_id) {
        	            node.checked = treeNode.checked; // 同步选中状态
            	        zTreeObj.updateNode(node);
                	    updateParentCheckedStatus(zTreeObj, node);
					}
	            });
			}

			var checkedNodes = zTreeObj.getCheckedNodes(true);
			_resetTokens(checkedNodes);
		}

		function updateParentCheckedStatus(treeObj, node) {
			var parentNode = node.getParentNode();
			if (parentNode) {
				parentNode.checked = true;
				updateParentCheckedStatus(treeObj, parentNode);
			}
		}

		function reset_input_palceholder(){
			$input.attr("placeholder", tokens.length === 0? settings[KEY_PLACEHOLDER] : "");
		}

		// Add Token
		function addToken(item) {
			if (!item || tokens.some(token => (token[settings[KEY_DATA_ID]] === item[settings[KEY_DATA_ID]]))) return;

			tokens.push(item);

			const displayName = item[settings[KEY_DATA_NAME]];
			const $token = $(`<span class="token">${displayName}<button type="button" class="remove-btn">&times;</button></span>`);

			// attach Remove token event
			$token.find(".remove-btn").on("click", (event) => {
				event.stopPropagation();
				removeToken(item, $token);
			});

			$token.insertBefore($input);
			$input.val(""); // Clear input after adding token
			reset_input_palceholder();
			updateHiddenInput(); // Update hidden input after adding
		}

		// Remove Token
		function removeToken(item, $tokenElement) {
			tokens = tokens.filter((token) => {
				return token[settings[KEY_DATA_ID]] !== (item[settings[KEY_DATA_ID]] || item);
			}); 
			$tokenElement.remove();
			updateHiddenInput(); // Update hidden input after removing
			reset_input_palceholder();
			_resetTreeviewSelectCheckStatus();
			//showDropdown();
			$input.trigger("click");
		}

		// Show dropdown
		function showDropdown() {
			$dropdown.removeClass("d-none");
			$dropdown.scrollTop(0);
		}

		// Hide dropdown
		function hideDropdown() {
			$dropdown.addClass("d-none");
		}

		$input.on("focus", () => {
			showDropdown();
		});

		$input.on("click", () => {
			showDropdown();
		});

		// Hide dropdown when clicking outside
		$(document).on(`click.${root_panel_id}`, (event) => {
			if (!$root_panel.is(event.target) && $root_panel.has(event.target).length === 0) {
				hideDropdown();
			}
		});

		// Initialize with initial IDs
		if(settings[KEY_INITIALTOKENS] && settings[KEY_INITIALTOKENS].length > 0){
			settings[KEY_INITIALTOKENS].forEach((i) => {
				addToken(i);
			});
			_resetTreeviewSelectCheckStatus();
		}

		// Clear all tokens and add new tokens
		function _resetTokens(newTokens) {

			// Clear existing tokens
			$root_panel.find('span.token').remove();
			tokens = [];

			// Add new tokens
			newTokens.forEach((token) => {
				addToken(token);
			});

			// Update hidden input
			updateHiddenInput();

			reset_input_palceholder();
		}

		function _resetTreeviewSelectCheckStatus(){
			if(settings[KEY_TYPE] === TYPE_CHECKBOX){
				zTreeObj.checkAllNodes(false);
			}else{
				zTreeObj.cancelSelectedNode();
			}

			tokens.forEach(function(token){
				var node = zTreeObj.getNodeByParam(settings[KEY_DATA_ID], token[settings[KEY_DATA_ID]], null);
				if(node){
					if(settings[KEY_TYPE] === TYPE_CHECKBOX){
						zTreeObj.checkNode(node, true, false);  
					}else{
						zTreeObj.selectNode(node, false);
					}
				}
			});
		}

		function _resetTreeview(treeviewData){
			if(zTreeObj) zTreeObj.destroy();
			settings[KEY_TREEVIEW_DATA] = treeviewData;

	        if(settings[KEY_USE_CONTROL] && settings[KEY_TREEVIEW_DATA] && settings[KEY_TREEVIEW_DATA].length > 0){
				let root_node = settings[KEY_TREEVIEW_DATA][0];
				if('children' in root_node){
	               let root_node_id = root_node[settings[KEY_DATA_ID]];
    	            _attach_ctl_button(root_node_id, root_node.children);
        	    }
        	}

			zTreeObj = $.fn.zTree.init($("#"+treeview_id), treeview_setting, settings[KEY_TREEVIEW_DATA]);
		}

		this.resetTokens = function(newTokens) {
			_resetTokens(newTokens);
			_resetTreeviewSelectCheckStatus();
		}

		this.resetTreeview = function(treeviewData){
			_resetTreeview(treeviewData);
			_resetTokens([]);
		}
	};

})(jQuery);
