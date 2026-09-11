(function ($) {

	const KEY_SUGGESTIONS      = 'suggestions',
		KEY_PLACEHOLDER        = 'placeholder',
		KEY_HIDDENINPUT        = 'hiddenInput',
		KEY_INITIALTOKENS      = 'initialTokens',
		KEY_ONCHANGE           = 'onChange',
		KEY_ISAUTOOPENDROPDOWN = 'isAutoOpenDropdown',
		KEY_ISOUTPUTWITHID     = 'isOutputWithID',
		KEY_DELIMAR_I          = 'delimar_i',
		KEY_DELIMAR_O          = 'delimar_o',
		KEY_ISSTATIC           = 'isStatic',
		KEY_LIMIT              = 'limit',
		KEY_ID                 = 'id',
		KEY_NAME               = 'name',
		SETTINGS_KEY           = 'VGP_TokenTypeAhead_Settings',
		OBJECT_KEY             = 'VGP_TokenTypeAhead_Object',
		CLASS_STATIC           = 'static';


	const DEFAULT_SETTINGS = {
		[KEY_SUGGESTIONS]:        [],
		[KEY_PLACEHOLDER]:        'Start typing...',
		[KEY_HIDDENINPUT]:        null,
		[KEY_INITIALTOKENS]:      [],
		[KEY_ONCHANGE]:	          null,
		[KEY_ISAUTOOPENDROPDOWN]: false,
		[KEY_ISOUTPUTWITHID]:     false,
		[KEY_ISSTATIC]:	          false,
		[KEY_DELIMAR_I]:          ',',
		[KEY_DELIMAR_O]:          '|',
		[KEY_LIMIT]:              0
	}


	var methods = {
		init: function(options) {
			let settings = $.extend(true,{}, DEFAULT_SETTINGS, options || {});
			return this.each(function () {
				$(this).data(SETTINGS_KEY, settings);
				$(this).data(OBJECT_KEY, new $.tokenTypeahead(this));
			});
		},
		resetTokens: function(newTokens){
			this.data(OBJECT_KEY).resetTokens(newTokens);
			return this;
		},
		resetSuggestions: function(suggestions){
			this.data(OBJECT_KEY).resetSuggestions(suggestions);
			return this;
		},
		resetStatic: function(isStatic){
			this.data(OBJECT_KEY).resetStatic(isStatic);
			return this;
		}
	};
	
	$.fn.token_typeahaed = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			return methods.init.apply(this, arguments);
		}
	};

	$.fn.token_typeahaed.KEY_SUGGESTIONS        = KEY_SUGGESTIONS;
	$.fn.token_typeahaed.KEY_PLACEHOLDER        = KEY_PLACEHOLDER;
	$.fn.token_typeahaed.KEY_HIDDENINPUT        = KEY_HIDDENINPUT;
	$.fn.token_typeahaed.KEY_INITIALTOKENS      = KEY_INITIALTOKENS;
	$.fn.token_typeahaed.KEY_ONCHANGE           = KEY_ONCHANGE;
	$.fn.token_typeahaed.KEY_ISAUTOOPENDROPDOWN = KEY_ISAUTOOPENDROPDOWN;
	$.fn.token_typeahaed.KEY_ISOUTPUTWITHID     = KEY_ISOUTPUTWITHID;
	$.fn.token_typeahaed.KEY_ISSTATIC           = KEY_ISSTATIC;
	$.fn.token_typeahaed.KEY_ID                 = KEY_ID;
	$.fn.token_typeahaed.KEY_NAME               = KEY_NAME;
	$.fn.token_typeahaed.KEY_LIMIT              = KEY_LIMIT;
	$.fn.token_typeahaed.KEY_DELIMAR_I          = KEY_DELIMAR_I;
	$.fn.token_typeahaed.KEY_DELIMAR_O          = KEY_DELIMAR_O;

	$.tokenTypeahead = function (root_panel) {

		const root_panel_id = root_panel.id;

		var $root_panel  = $(root_panel);
		var $container   = $root_panel.addClass("token-input-container");
		var settings     = $root_panel.data(SETTINGS_KEY);	
		var $hiddenInput = $(settings.hiddenInput);


		let tokens = []; // Start with an empty token list

		// Update hidden input
		function updateHiddenInput() {
			let result;
			if(settings[KEY_ISOUTPUTWITHID]){
				result = tokens.map(token => `${token[KEY_ID]}${settings[KEY_DELIMAR_I]}${token[KEY_NAME]}`).join(settings[KEY_DELIMAR_O]);
			}else{
				result = tokens.map(token => (token[KEY_ID])).join(",");
			}
			$hiddenInput.val(result);
		}

		if(settings[KEY_ISSTATIC]) $container.addClass(CLASS_STATIC);

		const $input       = $('<input type="text" autocomplete="off" tabindex="1" />').attr("placeholder", settings.placeholder);
		const $dropdown    = $('<div class="typeahead-dropdown d-none"></div>');

		let activeIndex = -1; // Track the active item in the dropdown

		$container.append($input, $dropdown);
		
		function reset_input_palceholder(){
			$input.attr("placeholder", tokens.length === 0? settings.placeholder : "");
		}

		// Add Token
		function addToken(item) {

			if (!item || tokens.some(token => (token[KEY_ID] === item[KEY_ID]))) return;

			if(settings[KEY_LIMIT] > 0 && settings[KEY_LIMIT] === tokens.length){
				alert(`Max ${settings[KEY_LIMIT]} items allowed.`);

				if(!settings[KEY_ISSTATIC]){
					$input.val(""); // Clear input after adding token
					hideDropdown();
					reset_input_palceholder();
				}

				return;
			}

			tokens.push(item);

			const displayName = item[KEY_NAME];
			const $token = settings[KEY_ISSTATIC] ?
				$(`<span class="token">${displayName}</span>`) : 
				$(`<span class="token">${displayName}<button type="button" class="remove-btn">&times;</button></span>`);
			

			if(!settings[KEY_ISSTATIC]){
				// attach Remove token event
				$token.find(".remove-btn").on("click", () => {
					removeToken(item, $token);
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
		function removeToken(item, $tokenElement) {
			tokens = tokens.filter((token) => {
				return token[KEY_ID] !== (item[KEY_ID] || item);
			}); 
			$tokenElement.remove();
			updateHiddenInput(); // Update hidden input after removing
			
			if(!settings[KEY_ISSTATIC]) reset_input_palceholder();

			if(typeof settings[KEY_ONCHANGE] === "function"){settings[KEY_ONCHANGE]();}
		}

		// Show dropdown
		function showDropdown(filteredSuggestions) {

			if(settings[KEY_ISSTATIC]) return;

			$dropdown.empty();
			const unselectedSuggestions = filteredSuggestions.filter(
					(item) => !tokens.some(token => (token[KEY_ID] === item[KEY_ID]))
			);

			if (unselectedSuggestions.length === 0) {
				hideDropdown();
				return;
			}

			unselectedSuggestions.forEach((item, index) => {
				const displayName = item[KEY_NAME];
				const $item = $(`<div class="dropdown-item">${displayName}</div>`);

				$item.on("click", () => {
					addToken(item);
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

		// Input event handlers
		$input.on("input", () => {
			const query = $input.val().toLowerCase();
			const filteredSuggestions = settings.suggestions.filter((item) =>{
				const name = item[KEY_NAME];
				return name.toLowerCase().includes(query);
			});

			if (query) {
				showDropdown(filteredSuggestions);
			} else {
				hideDropdown();
			}
		});

		if(settings.isAutoOpenDropdown){
			$input.on("focus", () => {
				if (!$input.val().trim()) {
					const filteredSuggestions = settings.suggestions.filter(
						(item) => !tokens.some(token =>  token[KEY_ID] === item[KEY_ID])
					);
					showDropdown(filteredSuggestions);
				}
			});

			$input.on("click", () => {
				if (!$input.val().trim()) {
					const filteredSuggestions = settings.suggestions.filter(
						(item) => !tokens.some(token => token[KEY_ID] === item[KEY_ID])
					);
					showDropdown(filteredSuggestions);
				}
			});
		}

		$input.on("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				if (activeIndex >= 0) {
					const items = $dropdown.find(".dropdown-item");
					const $activeItem = $(items[activeIndex]);
					const itemName = $activeItem.text();
					const item = settings.suggestions.find((i) => {
						return i[KEY_NAME] === itemName;
					});
					if (item) addToken(item);
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
						(item) => !tokens.some(token[KEY_ID] === item[KEY_ID])
					);
					showDropdown(filteredSuggestions);
				} else {
					// If dropdown is already visible, navigate to the next item
					navigateDropdown(event.key);
				}
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				navigateDropdown(event.key);
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
			if(settings[KEY_ISSTATIC]){
				addToken(i);
			}else{
				const token = settings.suggestions.find((item) => item[KEY_ID] === i[KEY_ID]);
				if (token) addToken(token);
			}
		});

		// Clear all tokens and add new tokens
		function _resetTokens(newTokens) {
			// Clear existing tokens
			$container.find('.token').remove();
			tokens = [];

			// Add new tokens
			newTokens.forEach((token) => {
				addToken(token);
			});

			// Update hidden input
			updateHiddenInput();
		}

		function _resetSuggestions(suggestions){
			settings.suggestions = suggestions;
		}

		this.resetTokens = function(newTokens) {
			_resetTokens(newTokens);
		}

		this.resetSuggestions= function(suggestions){
			_resetSuggestions(suggestions);
		}

		this.resetStatic = function(isStatic){
			if(settings[KEY_ISSTATIC] === isStatic) return;
			settings[KEY_ISSTATIC] = isStatic;
			if(settings[KEY_ISSTATIC]){
				$container.addClass(CLASS_STATIC);
				hideDropdown();
				_release_click_outside_event();
			}else{
				$container.removeClass(CLASS_STATIC);
				_attach_click_outside_event();
			}
		}
	};

})(jQuery);
