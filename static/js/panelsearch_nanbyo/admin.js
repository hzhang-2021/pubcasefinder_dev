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
			if(utils_isFunction(pre_confirm)){
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

