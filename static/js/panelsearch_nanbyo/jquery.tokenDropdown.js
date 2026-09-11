(function ($) {

	const KEY_SUGGESTIONS      = 'suggestions',
		KEY_HIDDENINPUT        = 'hiddenInput',
		KEY_INITIALTOKEN       = 'initialToken',
		KEY_ONCHANGE           = 'onChange',
		KEY_ISSTATIC           = 'isStatic',
		KEY_ID                 = 'id',
		KEY_NAME               = 'name',
		SETTINGS_KEY           = 'VGP_tokenTypeDropdown_Settings',
		OBJECT_KEY             = 'VGP_tokenTypeDropdown_Object',
		CLASS_STATIC           = 'static';


	const DEFAULT_SETTINGS = {
		[KEY_SUGGESTIONS]:        [],
		[KEY_HIDDENINPUT]:        null,
		[KEY_INITIALTOKEN]:       null,
		[KEY_ONCHANGE]:	          null,
		[KEY_ISSTATIC]:	          false
	}


	var methods = {
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.tokenTypeDropdown(this));
			});
		},
		resetToken: function(newTokens){
			this.data(OBJECT_KEY).resetToken(newTokens);
			return this;
		}
	};
	
	$.fn.token_type_dropdown = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};

	$.fn.token_type_dropdown.KEY_SUGGESTIONS        = KEY_SUGGESTIONS;
	$.fn.token_type_dropdown.KEY_HIDDENINPUT        = KEY_HIDDENINPUT;
	$.fn.token_type_dropdown.KEY_INITIALTOKEN       = KEY_INITIALTOKEN;
	$.fn.token_type_dropdown.KEY_ONCHANGE           = KEY_ONCHANGE;
	$.fn.token_type_dropdown.KEY_ISSTATIC           = KEY_ISSTATIC;
	$.fn.token_type_dropdown.KEY_ID                 = KEY_ID;
	$.fn.token_type_dropdown.KEY_NAME               = KEY_NAME;

	$.tokenTypeDropdown = function (root_panel) {

		const $container  = $(root_panel).addClass('review-dropdown-wrapper');
		const settings     = $container.data(SETTINGS_KEY);	
		const $hiddenInput = $('#'+settings.hiddenInput);

		if(settings[KEY_ISSTATIC]){
			if(settings[KEY_INITIALTOKEN]){
				let value_id = settings[KEY_INITIALTOKEN]  ? settings[KEY_INITIALTOKEN][KEY_ID] : '';
				let value_name = init_value_id ? settings[KEY_INITIALTOKEN][KEY_NAME] : '';
				$hiddenInput.val(value_id);
				$container.text(value_name);
			}
		}else{

			let btn_id = `btn_${settings.hiddenInput}`;

			let init_value_id = settings[KEY_INITIALTOKEN] ? settings[KEY_INITIALTOKEN][KEY_ID] : '';
			let init_value_name = init_value_id ? settings[KEY_INITIALTOKEN][KEY_NAME] : '';

			$hiddenInput.val(init_value_id);

			$container.addClass("form-control dropdown review-dropdown-wrapper")
			let html_str = `
			<button id="${btn_id}" 
					type="button" 
					class="review-dropdown-btn dropdown-toggle" 
					data-toggle="dropdown" 
					aria-expanded="false" 
					tabindex="1">${init_value_name}
			</button>
			`;
			$(html_str).appendTo($container);

			let $dropdown_menu = $('<div>')
									.addClass('dropdown-menu')
									.attr('id', `menu_${settings.hiddenInput}`)
									.appendTo($container);

			settings[KEY_SUGGESTIONS].forEach((suggestion_item) => {
				$('<button>').addClass('dropdown-item').attr('type', 'button').text(suggestion_item[KEY_NAME])
					.data('display_btn_id',btn_id)
					.data('value_id', suggestion_item[KEY_ID])
					.click(function(){
						let $btn = $(this);
						let value_id        = $btn.data('value_id');
						let display_btn_id  = $btn.data('display_btn_id')
						let value_name      = $btn.text();

						$('#' + display_btn_id).text(value_name);
						$hiddenInput.val(value_id);
						
						if(typeof settings[KEY_ONCHANGE] === 'function') {
							settings[KEY_ONCHANGE](value_id);
						}
					})
					.appendTo($dropdown_menu);
			});
		}

		if(settings[KEY_ISSTATIC]) $container.addClass(CLASS_STATIC);

		function _get_name_from_suggestion(value_id){
            let value_name = "";
            settings[KEY_SUGGESTIONS].forEach((suggestion_item) => {
                if(suggestion_item[KEY_ID] == value_id){
                    value_name = suggestion_item[KEY_NAME];
                }
            });
			return value_name;
		}

		// Clear all tokens and add new tokens
		function _resetToken(value_id) {
			let value_name = _get_name_from_suggestion(value_id);

			$hiddenInput.val(value_id);

			if(settings[KEY_ISSTATIC]){
				$container.text(value_name);
			}else{			

				$(`#btn_${settings.hiddenInput}`).text(value_name);

				if(typeof settings[KEY_ONCHANGE] === 'function') {
					settings[KEY_ONCHANGE](value_id);
				}
			}
		}

		this.resetToken = function(value_id) {
			_resetToken(value_id);
		}

	};

})(jQuery);
