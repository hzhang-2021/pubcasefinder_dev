(function ($) {

	const 
		KEY_TREEVIEW_DATA    = 'treeview_data',
		KEY_HIDDENINPUT_ID   = 'hiddenInput',
		KEY_INITIALTOKENS    = 'initialTokens',
		KEY_DATA_ID          = 'data_id',
		KEY_DATA_NAME        = 'data_name',
		KEY_USE_CONTROL      = 'use_control',
		KEY_CONTROL          = 'is_control',
		SETTINGS_KEY         = 'VGP_TreeviewInput_Settings',
		OBJECT_KEY           = 'VGP_TreeviewInput_Object';

	const DEFAULT_SETTINGS = {
		[KEY_TREEVIEW_DATA]:	[],						//input treeview dataset
		[KEY_DATA_ID]:			'',						//the key used as 'ID' at input treeview dataset 
		[KEY_DATA_NAME]:		'',						//the key used as 'NAME' at input treeview dataset 
		[KEY_HIDDENINPUT_ID]:	null,					//id of the hidden input
		[KEY_INITIALTOKENS]:	[],						//initial tokens
		[KEY_USE_CONTROL]:		false  
	}

	var methods = {
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.TreeviewInput(this));
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
	
	$.fn.treeview_input = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};

	$.fn.treeview_input.KEY_TREEVIEW_DATA    = KEY_TREEVIEW_DATA;
	$.fn.treeview_input.KEY_DATA_ID          = KEY_DATA_ID;
	$.fn.treeview_input.KEY_DATA_NAME        = KEY_DATA_NAME;
	$.fn.treeview_input.KEY_HIDDENINPUT_ID   = KEY_HIDDENINPUT_ID;
	$.fn.treeview_input.KEY_INITIALTOKENS    = KEY_INITIALTOKENS;
	$.fn.treeview_input.KEY_USE_CONTROL      = KEY_USE_CONTROL;

	$.TreeviewInput = function (root_panel) {

		const $root_panel  = $(root_panel).addClass("treeview-input-container");
		const settings     = $root_panel.data(SETTINGS_KEY);	
		const $hiddenInput = $('#' + settings[KEY_HIDDENINPUT_ID]);

		let tokens = []; // Start with an empty token list

		// Update hidden input
		function updateHiddenInput() {
			let result = tokens.map(token => `${token[settings[KEY_DATA_ID]]}--${token[settings[KEY_DATA_NAME]]}`).join('|');
			$hiddenInput.val(result);
		}

		const treeview_id =`${root_panel.id}_treeview`;
		$('<ul>').attr('id',treeview_id).addClass('ztree').appendTo($root_panel);

		let treeview_setting;
       	treeview_setting ={
			check: {
				chkboxType: { "Y" : "", "N" : "" },
				enable: true,
				chkStyle: "checkbox"
			},
			view: {
				selectedMulti: false, 
				showIcon: false, 
				nameIsHTML: true
			},
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
			zTreeObj.getNodesByFilter(function(node) {
				if (node.nando_id === treeNode.nando_id) {
       	            node.checked = treeNode.checked; // 同步选中状态
           	        zTreeObj.updateNode(node);
				}
            });

			var checkedNodes = zTreeObj.getCheckedNodes(true);
			_resetTokens(checkedNodes);
		}

		// Add Token
		function addToken(item) {
			if (!item || tokens.some(token => (token[settings[KEY_DATA_ID]] === item[settings[KEY_DATA_ID]]))) return;

			tokens.push(item);

			updateHiddenInput(); // Update hidden input after adding
		}

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
			tokens = [];

			// Add new tokens
			newTokens.forEach((token) => {
				addToken(token);
			});

			// Update hidden input
			updateHiddenInput();
		}

		function _resetTreeviewSelectCheckStatus(){
			zTreeObj.checkAllNodes(false);

			tokens.forEach(function(token){
				var node = zTreeObj.getNodeByParam(settings[KEY_DATA_ID], token[settings[KEY_DATA_ID]], null);
				if(node){
					zTreeObj.checkNode(node, true, false);  
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
