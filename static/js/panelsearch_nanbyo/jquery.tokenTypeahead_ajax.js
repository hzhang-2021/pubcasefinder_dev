(function ($) {

	const
		KEY_URL                = 'url',
		KEY_MAKE_DISPLAY_NAME  = 'func_make_display_name',
		KEY_SUGGESTIONS        = 'suggestions',
		KEY_PLACEHOLDER        = 'placeholder',
		KEY_HIDDENINPUT        = 'hiddenInput',
		KEY_INITIALTOKENS      = 'initialTokens',
		KEY_ONCHANGE           = 'onChange',
		KEY_ONADD              = 'onAdd',
		KEY_ONDELETE           = 'onDelete',
		KEY_DELIMAR_I          = 'delimar_i',
		KEY_DELIMAR_O          = 'delimar_o',
		KEY_ISSTATIC           = 'isStatic',
		KEY_STATUS             = 'status',
		KEY_ID                 = 'id',
		KEY_NAME               = 'name',
		SETTINGS_KEY           = 'VGP_TokenTypeAhead_Settings',
		OBJECT_KEY             = 'VGP_TokenTypeAhead_Object',
		CLASS_STATIC           = 'static',
		STATUS_DISABLED        = 'disabled';


	const DEFAULT_SETTINGS = {
		[KEY_URL]:                null,
		[KEY_MAKE_DISPLAY_NAME]:  null,
		[KEY_SUGGESTIONS]:        [],
		[KEY_PLACEHOLDER]:        'Start typing...',
		[KEY_HIDDENINPUT]:        null,
		[KEY_INITIALTOKENS]:      [],
		[KEY_ONCHANGE]:	          null,
		[KEY_ONADD]:              null,
		[KEY_ONDELETE]:           null,
		[KEY_ISSTATIC]:	          false,
		[KEY_DELIMAR_I]:          ',',
		[KEY_DELIMAR_O]:          '|',
		[KEY_STATUS]:             STATUS_DISABLED
	}


	var methods = {
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.tokenTypeahead(this));
			});
		},
		clear: function(){
			this.data(OBJECT_KEY).clear();
			return this;
		},
		resetTokens: function(newTokens){
			this.data(OBJECT_KEY).resetTokens(newTokens);
			return this;
		},
		getAllItems: function(){
			return this.data(OBJECT_KEY).getAllItems();
		}
	};
	
	$.fn.token_typeahead = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};

	$.fn.token_typeahead.KEY_URL                = KEY_URL;
	$.fn.token_typeahead.KEY_MAKE_DISPLAY_NAME  = KEY_MAKE_DISPLAY_NAME;
	$.fn.token_typeahead.KEY_SUGGESTIONS        = KEY_SUGGESTIONS;
	$.fn.token_typeahead.KEY_PLACEHOLDER        = KEY_PLACEHOLDER;
	$.fn.token_typeahead.KEY_HIDDENINPUT        = KEY_HIDDENINPUT;
	$.fn.token_typeahead.KEY_INITIALTOKENS      = KEY_INITIALTOKENS;
	$.fn.token_typeahead.KEY_ONCHANGE           = KEY_ONCHANGE;
	$.fn.token_typeahead.KEY_ONADD              = KEY_ONADD;
	$.fn.token_typeahead.KEY_ONDELETE           = KEY_ONDELETE;
	$.fn.token_typeahead.KEY_ISSTATIC           = KEY_ISSTATIC;
	$.fn.token_typeahead.KEY_ID                 = KEY_ID;
	$.fn.token_typeahead.KEY_NAME               = KEY_NAME;
	$.fn.token_typeahead.KEY_DELIMAR_I          = KEY_DELIMAR_I;
	$.fn.token_typeahead.KEY_DELIMAR_O          = KEY_DELIMAR_O;
	$.fn.token_typeahead.STATUS_DISABLED        = STATUS_DISABLED;

	$.tokenTypeahead = function (root_panel) {

		const root_panel_id = root_panel.id;

		const $root_panel  = $(root_panel).addClass("token-input-wrapper");
		const $container   = $("<div>").addClass("token-input-container").appendTo($root_panel);
		const settings     = $root_panel.data(SETTINGS_KEY);	


		const $hiddenInput = $(settings.hiddenInput);

		if(settings[KEY_ISSTATIC]) $container.addClass(CLASS_STATIC);
		if(settings[KEY_STATUS]) $container.addClass(settings[KEY_STATUS]);

		const $input = $('<input type="text" autocomplete="off" tabindex="1" />')
			.click(function(e){
				e.stopPropagation();
			})
			.attr("placeholder", settings.placeholder)
			.appendTo($container);

		if(!settings[KEY_ISSTATIC]) {
			$container.on("click", (e) => {
				if(!$container.hasClass(STATUS_DISABLED)){
					$input[0].scrollIntoView({ block: "nearest" });
					$input.focus();
				}
			});
		}

		const $dropdown    = $('<div class="typeahead-dropdown d-none"></div>').appendTo($root_panel);

		let tokens = []; // Start with an empty token list

		let activeIndex = -1; // Track the active item in the dropdown

		// Update hidden input
		function updateHiddenInput() {
			let result = tokens.map(token => (token[settings[KEY_ID]])).join(",");
			$hiddenInput.val(result);
		}

		function reset_input_palceholder(){
			$input.attr("placeholder", tokens.length === 0? settings.placeholder : "");
		}

		// Add Token
		function addToken(item, is_tigger_add_event) {

			if (!item || tokens.some(token => (token[settings[KEY_ID]] === item[settings[KEY_ID]]))) return;

			if(is_tigger_add_event && typeof settings[KEY_ONADD] === 'function'){
				settings[KEY_ONADD](item, _after_save_item_to_db);
			}else{
				_after_save_item_to_db(item);
			}
		}

		function _after_save_item_to_db(item){
			tokens.push(item);

			var displayName = item[settings[KEY_NAME]];
			if(typeof settings[KEY_MAKE_DISPLAY_NAME] === 'function'){
				displayName = settings[KEY_MAKE_DISPLAY_NAME](item);
			}
			
			const $token = settings[KEY_ISSTATIC] ?
				$(`<span class="token">${displayName}</span>`) : 
				$(`<span class="token">
					 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
					   <circle cx="8" cy="8" r="8" fill="#BEDFC9"/>
					   <path fill-rule="evenodd" clip-rule="evenodd" d="M5.73684 5.12031C5.65601 5.04224 5.54775 4.99904 5.43538 5.00002C5.32301 5.00099 5.21552 5.04607 5.13606 5.12553C5.0566 5.20499 5.01153 5.31248 5.01055 5.42485C5.00957 5.53722 5.05277 5.64548 5.13084 5.72631L7.39927 7.99473L5.13084 10.2632C5.0899 10.3027 5.05726 10.35 5.03479 10.4023C5.01233 10.4546 5.00051 10.5108 5.00002 10.5677C4.99952 10.6246 5.01037 10.681 5.03191 10.7337C5.05346 10.7864 5.08529 10.8342 5.12553 10.8745C5.16577 10.9147 5.21362 10.9465 5.26629 10.9681C5.31896 10.9896 5.37539 11.0005 5.4323 11C5.4892 10.9995 5.54544 10.9877 5.59773 10.9652C5.65001 10.9427 5.6973 10.9101 5.73684 10.8692L8.00527 8.60073L10.2737 10.8692C10.3545 10.9472 10.4628 10.9904 10.5752 10.9895C10.6875 10.9885 10.795 10.9434 10.8745 10.8639C10.9539 10.7845 10.999 10.677 11 10.5646C11.001 10.4522 10.9578 10.344 10.8797 10.2632L8.61127 7.99473L10.8797 5.72631C10.9578 5.64548 11.001 5.53722 11 5.42485C10.999 5.31248 10.9539 5.20499 10.8745 5.12553C10.795 5.04607 10.6875 5.00099 10.5752 5.00002C10.4628 4.99904 10.3545 5.04224 10.2737 5.12031L8.00527 7.38873L5.73684 5.12031Z" fill="#68746F"/>
					 </svg>
					 ${displayName}
				   </span>`
				);
			
			if(!settings[KEY_ISSTATIC]){
				// stop propagation
				$token.data('item', item).on("click", (e) => {
					e.stopPropagation();
				});

				// attach Remove token event
				$token.find("svg").on("click", (e) => {
					e.stopPropagation();
					removeToken(item);
				});
			}

			$token.insertBefore($input);

			if(!settings[KEY_ISSTATIC]){
				$input.val(""); // Clear input after adding token
				hideDropdown();
				reset_input_palceholder();
			}
			
			updateHiddenInput(); // Update hidden input after adding
			
			if(typeof settings[KEY_ONCHANGE] === "function"){settings[KEY_ONCHANGE]();}
		}

		// Remove Token
		function removeToken(item) {
			if(typeof settings[KEY_ONDELETE] === 'function'){
				settings[KEY_ONDELETE](item, _remove_token);
			}else{
				_remove_token(item);
			}
		}

		function _remove_token(item){
			tokens = tokens.filter((token) => {
				return token[settings[KEY_ID]] !== (item[settings[KEY_ID]] || item);
			}); 

			$container.find('.token').filter(function() {
				let item_e = $(this).data('item');
				return item_e[settings[KEY_ID]] === item[settings[KEY_ID]];
			}).remove();

			updateHiddenInput(); // Update hidden input after removing
			
			if(!settings[KEY_ISSTATIC]) reset_input_palceholder();

			if(typeof settings[KEY_ONCHANGE] === "function"){settings[KEY_ONCHANGE]();}
		}

		// Show dropdown
		function showDropdown(filteredSuggestions) {

			if(settings[KEY_ISSTATIC]) return;

			$dropdown.empty();
			const unselectedSuggestions = filteredSuggestions.filter(
					(item) => !tokens.some(token => (token[settings[KEY_ID]] === item[settings[KEY_ID]]))
			);

			if (unselectedSuggestions.length === 0) {
				hideDropdown();
				return;
			}

			unselectedSuggestions.forEach((item, index) => {
				let displayName = item[settings[KEY_NAME]];
				if(typeof settings[KEY_MAKE_DISPLAY_NAME] === 'function'){
					displayName = settings[KEY_MAKE_DISPLAY_NAME](item);
				}
				const $item = $(`<div class="dropdown-item">${displayName}</div>`);

				$item.data('item',item).on("click", (e) => {
					e.stopPropagation();
					addToken(item, true);
				});

				if (index === activeIndex) {
					$item.addClass("active");
				}

				$dropdown.append($item);
			});

			$dropdown.removeClass("d-none");
			$dropdown.scrollTop(0);
		}

		// Hide dropdown
		function hideDropdown() {
			$dropdown.addClass("d-none");
			activeIndex = -1; // Reset active index
		}

		// Handle arrow navigation
		function navigateDropdown(key) {
			const items = $dropdown.find(".dropdown-item");
			if (!items.length) return;

			if (key === "ArrowDown") {
				activeIndex = (activeIndex + 1) % items.length;
			} else if (key === "ArrowUp") {
				activeIndex = (activeIndex - 1 + items.length) % items.length;
			}

			items.removeClass("active");
			const $activeItem = $(items[activeIndex]);
			$activeItem.addClass("active");
			$activeItem[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
		}

		var searchCache = {};
		function normalizeKeyword(k) {
			return String(k || "").trim().toLowerCase();
		}

		function cacheSet(keyword, items) {
			var k = normalizeKeyword(keyword);
			if (!k) return;

			searchCache[k] = items || [];
		}

		function cacheGet(keyword) {
			var k = normalizeKeyword(keyword);
			if (!k) return null;
			if (searchCache.hasOwnProperty(k)) {
				return searchCache[k];
			}
			return null;
		}

		var timer = null;
		var currentAjax = null;

		function doSearch(keyword) {

			var k = normalizeKeyword(keyword);

			// 先查 cache
			var cached = cacheGet(k);
			if (cached !== null) {	
				settings.suggestions = cached;
				_filter_result_and_show_popup(keyword, cached);
				return;
			}

			// cache 没有 -> ajax
			if (currentAjax) {
				currentAjax.abort();
				currentAjax = null;
			}

			currentAjax = $.ajax({
				url: settings[KEY_URL], // TODO: 换成你的接口
				method: "GET",
				dataType: "json",
				data: { q: keyword },
				success: function (res) {
					var items = (res && res.items) ? res.items : [];

					// 存 cache
					cacheSet(k, items);

					settings.suggestions = items;

					// 渲染
					_filter_result_and_show_popup(k,items);
				},
				error: function (xhr, status) {
					let msg = "request error";
					if (xhr.responseJSON) {
						msg = xhr.responseJSON.error || xhr.responseJSON.message || JSON.stringify(xhr.responseJSON);
					}
					// 2) 纯文本错误
					else if (xhr.responseText) {
						msg = xhr.responseText;
					}
					// 3) HTTP 状态码
					else if (xhr.status) {
						msg = "HTTP " + xhr.status;
					}
					alert(msg);
				}
			});
		}

		function _filter_result_and_show_popup(query,suggestions){
			//const filteredSuggestions = suggestions.filter((item) =>{
			//	return item[settings[KEY_NAME]].toLowerCase().includes(query);
			//});
			if (query) {
				//showDropdown(filteredSuggestions);
				showDropdown(suggestions);
			} else {
				hideDropdown();
			}
		}

		// Input event handlers
		$input.on("input", () => {
			const query = normalizeKeyword($input.val());


			if(settings[KEY_URL]){
				clearTimeout(timer);
				if (query.length < 1) {
					hideDropdown();
					return;
				}

				timer = setTimeout(function () {
					doSearch(query);
				}, 200);

			}else{

				_filter_result_and_show_popup(query, settings.suggestions);
			}
		});

		$input.on("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				if (activeIndex >= 0) {
					const items = $dropdown.find(".dropdown-item");
					const $activeItem = $(items[activeIndex]);
					const itemdata = $activeItem.data('item');
					const item_id = itemdata[settings[KEY_ID]];
					const item = settings.suggestions.find((i) => {
						return i[settings[KEY_ID]] === item_id;
					});
					if (item) addToken(item, true);
				}
			} else if (event.key === "Escape") {
				hideDropdown();
			} else if (event.key === "Tab") {
				hideDropdown();
				$input.val(""); // Clear input
			} else if (event.key === "ArrowDown") {
				event.preventDefault();
				if ($dropdown.hasClass("d-none")) {
					// If dropdown is not visible, show it with all unselected suggestions
					const filteredSuggestions = settings.suggestions.filter(
						(item) => !tokens.some(
							(token) =>token[settings[KEY_ID]] === item[settings[KEY_ID]]
						)
					);
					showDropdown(filteredSuggestions);
				} else {
					// If dropdown is already visible, navigate to the next item
					navigateDropdown(event.key);
				}
			} else if (event.key === "ArrowUp") {
				if (!$dropdown.hasClass("d-none")) {
					event.preventDefault();
					navigateDropdown(event.key);
				}
			}
		});

		// Hide dropdown when clicking outside
		if(!settings[KEY_ISSTATIC]){
			_attach_click_outside_event();
		}

		function _attach_click_outside_event(){
			$(document).on(`click.${root_panel_id}`, (event) => {
				if (!$container.is(event.target) && $container.has(event.target).length === 0) {
					hideDropdown();
				}
			});
		}

		function _release_click_outside_event(){
			$(document).off(`click.${root_panel_id}`);
		}

		// Initialize with initial IDs
		settings.initialTokens.forEach((i) => {
			addToken(i, false);
		});

		// Clear all tokens and add new tokens
		function _resetTokens(newTokens) {
			// Clear existing tokens
			$container.removeClass(STATUS_DISABLED).find('.token').remove();
			tokens = [];
			

			// Add new tokens
			newTokens.forEach((token) => {
				addToken(token, false);
			});

			// Update hidden input
			updateHiddenInput();

			if(!settings[KEY_ISSTATIC]){
				reset_input_palceholder();
			}

		}

		function _clear(){
			$input.val("");
			hideDropdown();
			$container.addClass(STATUS_DISABLED).find('.token').remove();
			tokens = [];
		}

		this.clear = function(){
			_clear();
		}

		this.resetTokens = function(newTokens) {
			_resetTokens(newTokens);
		}

		this.getAllItems = function(){
			return tokens;
		}
	};

})(jQuery);
