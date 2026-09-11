
const KEY = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    NUMPAD_ENTER: 108,
    SEMICOLON: 186,
    COMMA: 188
};

function _attach_filter_text_event(id,do_search_func){
	$("#"+id)
	.bind("input", function (event) {
		if (String.fromCharCode(event.which)) {
			setTimeout(function () { do_search_func(); }, 50);
		}
	})
	.keydown(function (event) {
            
		switch (event.keyCode) {
			case KEY.LEFT:
			case KEY.RIGHT:
			case KEY.UP:
			case KEY.DOWN:
			case KEY.HOME:
			case KEY.END:
				break;
			case KEY.DELETE:
				setTimeout(function () { do_search_func(); }, 50);
				break;
			case KEY.BACKSPACE:
				setTimeout(function () { do_search_func(); }, 50);
				break;
			case KEY.TAB:
			case KEY.ENTER:                
			case KEY.NUMPAD_ENTER:
				setTimeout(function () { do_search_func(); }, 50);
				event.stopPropagation();
				event.preventDefault();
				return false;
			case KEY.ESCAPE:
				return true;
			default:
				if (String.fromCharCode(event.which)) {
					setTimeout(function () { do_search_func(); }, 50);
				}
				break;
		}
	});
}

const
	USER_TYPE_PUBLIC       = 0, 
	USER_TYPE_REVIEWER     = 1,
    USER_TYPE_CURATOR      = 2,
	USER_TYPE_ADMIN        = 3,
	GROUP_USER_ROLE_REVIEWER = 'reviewer',
	GROUP_USER_ROLE_CURATOR  = 'curator',
    STATUS_DELETED         = 5,
    STATUS_DELETED_TO_GO   = 10,
	STATUS_BLOCKED         = 12,
	STATUS_BLOCKED_TO_GO   = 14,
    STATUS_REJECTED        = 15,
    STATUS_REJECTED_TO_GO  = 20,
    STATUS_CANCELLED       = 25,
    STATUS_CANCELLED_TO_GO = 30,
    STATUS_EXPIRED         = 35,
    STATUS_REGISTED        = 40,
    STATUS_EXPIRED_RESET   = 45,
    STATUS_AUTHENTICATED   = 50,
    STATUS_PASSED          = 55,
    STATUS_PASSED_TO_GO    = 60;


var _isFunction = function(value) { return typeof value === "function";},
	_isArray = function(value) {return Array.isArray(value);},
	_isDefined = function(value) {return typeof value !== 'undefined';},
	_isEmpty = function(value, allowEmptyString) {
		return (value === null) || (_isDefined(value) === false) || (!allowEmptyString ? value === '' : false) || (_isArray(value) && value.length === 0);
	},
	_parseJson= function(text) {
		var json_data = null;
		try {
			json_data = JSON.parse(text);
		} catch (d) {}
			return json_data;
	},
	_capitalizeFirstLetter = function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	_format_timestamp = function(timestamp){
		const date = new Date(timestamp);
		const y = date.getFullYear();
		const m = ('0' + (date.getMonth() + 1)).slice(-2);
		const d = ('0' + date.getDate()).slice(-2);
		const h = ('0' + date.getHours()).slice(-2);
		const mi = ('0' + date.getMinutes()).slice(-2);
		const s = ('0' + date.getSeconds()).slice(-2);
		return `${y}/${m}/${d} ${h}:${mi}:${s}`;
	};

function trimAllSpaces(str) {
    return str.replace(/^[\s\u3000]+|[\s\u3000]+$/g, "");
}

function _run_submit(url, data, callback, callback_error){
	// Perform AJAX POST request
	fetch(url, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(data)
	})
	.then(response => response.json())
	.then(data => {
		if (data.error) {
			alert(data.error);
			if(callback_error && _isFunction(callback_error)){
				callback_error();
			}
		} else {
			// Reload the page on success
			if(callback && _isFunction(callback)){
				callback(data);
			}
		}
	})
	.catch(error => {
		console.error('Error:', error);
		alert('An unexpected error occurred.' + error);
		if(callback_error && _isFunction(callback_error)){
			callback_error();
		}
	});
}

function _switch_main_content(){
    $("#main_content").toggleClass("hide");
    $("#main_content2").toggleClass("hide");
}

function _attach_table_checkbox_event(table_class){
	const tables = document.querySelectorAll('.'+table_class);
	tables.forEach(table => {
		const theadCheck = table.querySelector('thead .check-all');
		const tbody = table.querySelector('tbody');

		if (!theadCheck || !tbody) return;

		const updateHeaderState = () => {
			const rowChecks = tbody.querySelectorAll('.row-check');
			const total = rowChecks.length;
			const checked = Array.from(rowChecks).filter(c => c.checked).length;
			if (total === 0) {
				theadCheck.checked = false;
				theadCheck.indeterminate = false;
			} else if (checked === 0) {
				theadCheck.checked = false;
				theadCheck.indeterminate = false;
			} else if (checked === total) {
				theadCheck.checked = true;
				theadCheck.indeterminate = false;
			} else {
				theadCheck.checked = false;
				theadCheck.indeterminate = true;
			}
		};

		theadCheck.addEventListener('change', () => {
			const rowChecks = tbody.querySelectorAll('.row-check');
			rowChecks.forEach(c => c.checked = theadCheck.checked);
			theadCheck.indeterminate = false;
		});

		tbody.addEventListener('change', (e) => {
			const target = e.target;
			if (target.matches('.row-check')) {
				updateHeaderState();
			}
		});

		updateHeaderState();

		table.updateTableState = updateHeaderState;

   	});
}

function _show_confirm_dialog(title,html,on_confirm,pre_confirm){
	Swal.fire({
		title:              `<span class="title">${title}</span>`,
		html:               html,
		heightAuto: false,
		focusConfirm: false, 
		width: '600px',
		icon:               'warning',
		showCancelButton:   true,
		confirmButtonText:  '確定',
		cancelButtonText:   'キャンセル',
		confirmButtonColor: '#3085d6',
		cancelButtonColor:  '#d33',
		scrollbarPadding: false,
		preConfirm: () => {
			if(_isFunction(pre_confirm)){
				pre_confirm();
			}
		},
		didOpen: () => {
			// 阻止弹窗本身的滚动触发 body 滚动
		    const container = Swal.getPopup();
		    container.scrollTop = 0;
		} 
	})
	.then((result) => {
		if (result.isConfirmed) {
			on_confirm();
		} 
	});
}

