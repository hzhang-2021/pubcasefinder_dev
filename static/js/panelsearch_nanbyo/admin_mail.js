const URL_LOAD_EMAIL            = "/panelsearch_nanbyo_admin_load_email";
const URL_LOAD_EMAIL_DETAIL     = "/panelsearch_nanbyo_admin_load_email_detail";
const URL_RESEND_EMAIL          = "/panelsearch_nanbyo_admin_resend_email";
const URL_MODIFY_EMAIL_TEMPLATE = "/panelsearch_nanbyo_admin_modify_email_template";


var ALL_EMAIL_TEMPLATES = [];
var EMAIL_TYPE_HASH = {};
var EMAIL_SETTINGS = {};

const AUTH_TYPE="panelsearch_nanbyo";

function _get_template_by_auth_type_and_name(template_name,auth_type){
    for(let template of ALL_EMAIL_TEMPLATES){
        if(template.template_name === template_name && template.auth_type === auth_type){
			return template;
        }
    }

	return {};
}

function _init(email_templates, email_settings){

	ALL_EMAIL_TEMPLATES = email_templates;

    EMAIL_SETTINGS = email_settings;

	set_mail_smtp_setting();

	let hash_template = {};
	let hash_auth_type = {};
	for(let template of ALL_EMAIL_TEMPLATES){
		if(template.auth_type !== AUTH_TYPE){
			continue;
		}
		EMAIL_TYPE_HASH[template.id] = template.template_name;
		hash_template[template.template_name] = 1;
		hash_auth_type[template.auth_type] = 1
	}
	for(let template_name in hash_template){
		$("#filter_type").append($(`<option value="${template_name}">${template_name}</option>`));
		$("#template_type").append($(`<option value="${template_name}">${template_name}</option>`));
	}
	for(let auth_type in hash_auth_type){
		$("#filter_auth_type").append($(`<option value="${auth_type}">${auth_type}</option>`));
		$("#template_auth_type").append($(`<option value="${auth_type}">${auth_type}</option>`));
	}
	$("#filter_auth_type").val(AUTH_TYPE);
	on_change_template();

	document.getElementById('template_type').onchange = function() {
		on_change_template();
	};
	document.getElementById('template_auth_type').onchange = function() {
		on_change_template();
	};

	$('#btn_template_modify').on('click', function() {
		$('#template-wrapper .ctl-wrapper').addClass('onedit');
		$('#template_subject').prop("disabled", false).focus();
		$('#template_body').prop("disabled", false);

	});

    $('#btn_template_save').on('click', function() {
		let subject_str = utils_trimAllSpaces($('#template_subject').val());
		let body_str = utils_trimAllSpaces($('#template_body').val());

		if(subject_str.length === 0){
			Swal.fire({icon: "error",title: "Oops...",text: "Subject cannot be empty!"});
			setTimeout(function () { $('#template_subject').focus(); }, 100);
			return;
		}

		if(body_str.length === 0){
			Swal.fire({icon: "error",title: "Oops...",text: "Body cannot be empty!"});
			setTimeout(function () { $('#template_body').focus(); }, 100);
			return;
		}

		Swal.fire({
			title: "Really want to save the changes?",
			showCancelButton: true,
			confirmButtonText: "Save",
		}).then((result) => {
			if (result.isConfirmed) {
				save_template();
			}
		});



    });

	$('#btn_template_cancel').on('click', function() {
		on_change_template();
	});


	$('#btn_load_email').on('click', function() {
		let filter_to       = $('#filter_to').val();
		let filter_fromdate = $('#filter_fromdate').val();
		let filter_todate   = $('#filter_todate').val();
		let filter_auth_type  = $('#filter_auth_type').val();
		let filter_status   = $('#filter_status').val();
		let filter_template_name = $('#filter_type').val();

		let params = new URLSearchParams({
			filter_to:filter_to,
			filter_fromdate:filter_fromdate,
			filter_todate:filter_todate,
			filter_auth_type:filter_auth_type,
			filter_status:filter_status,
			filter_template_name:filter_template_name
		}).toString();
		loadTable(params);
	});

	$('<div>').attr("id", "modalOverlay").appendTo('body');

	let modal_html_str = `
<div id="emailModal">
    <h3 id="modalSubject"></h3>
    <p><b>From:</b> <span id="modalFrom"></span></p>
    <p><b>To:</b> <span id="modalTo"></span></p>
    <p><b>Sent at:</b> <span id="modalTime"></span></p>
    <p><b>Status:</b> <span id="modalStatus"></span></p>
    <hr>
    <div id="modalBody"></div>
    <div id="modalError" style="color:red"></div>
    <button id="btnResend" class="action-button mr-4" style="display:none">Resend</button>
    <button id="closeModal" class="cancel-button">Close</button>
</div>
	`;	
	$(modal_html_str).appendTo('body');

	$('#closeModal, #modalOverlay').on('click', function() {
    	$('#emailModal').hide();
	    $('#modalOverlay').hide();
	});
}

function update_template(){
    let subject_str = utils_trimAllSpaces($('#template_subject').val());
    let body_str    = utils_trimAllSpaces($('#template_body').val());

    let template_name =  $("#template_type").val();
    let auth_type     = $("#template_auth_type").val();
    let template      =  _get_template_by_auth_type_and_name(template_name,auth_type);

	template.subject_template = subject_str;
	template.body_template    = body_str;
}

function save_template(){

	let subject_str = utils_trimAllSpaces($('#template_subject').val());
	let body_str    = utils_trimAllSpaces($('#template_body').val());

    let template_name =  $("#template_type").val();
    let auth_type     = $("#template_auth_type").val();
    let template      =  _get_template_by_auth_type_and_name(template_name,auth_type);
	let template_id   = template.id;

	_vgp_show_loading();

	fetch(URL_MODIFY_EMAIL_TEMPLATE, { 
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({id:template_id, subject_template:subject_str, body_template:body_str})
	})
    .then(res => res.json())
    .then(data => {
        _vgp_hide_loading();

		if(data.status === 'error'){
	        alert(data.message);
			Swal.fire({icon: "error", title: "Oops...", text: data.message});
		}else{
			update_template();
			Swal.fire({
				icon: "success",
				title: "Your work has been saved",
				showConfirmButton: false,
				timer: 1500
			});
			on_change_template();
		}
    })
    .catch(err => {
        _vgp_hide_loading();
        alert('Failed: ' + err);
    });


}


function set_mail_smtp_setting(){

	$("#smtp-setting-table").find('input').prop('readonly', true);

	$("#smtp_server").val(EMAIL_SETTINGS.smpt_server);
	
	if(EMAIL_SETTINGS.smtp_port == 465){
		// ssl
		document.getElementById("ssl").checked = true;
		document.getElementById("tls").checked = false;
	}else{
		// tls
		document.getElementById("ssl").checked = false;
		document.getElementById("tls").checked = true;
    }

	$("#username").val(EMAIL_SETTINGS.username);

	$("#password").val(EMAIL_SETTINGS.password);

	$("#from_name").val(EMAIL_SETTINGS.from_name);

	$("#from_email").val(EMAIL_SETTINGS.from_email);
}


function on_change_template(){

	$('#template-wrapper .ctl-wrapper').removeClass('onedit');

	let template_name = $("#template_type").val();
	let auth_type     = $("#template_auth_type").val();
	let template      = _get_template_by_auth_type_and_name(template_name,auth_type);

	$("#template_subject").val(template.subject_template).prop("disabled", true);
	$("#template_body").val(template.body_template).prop("disabled", true);
}


function loadTable(params='') {
	fetch(`${URL_LOAD_EMAIL}?${params}`)
	.then(res => res.json())
	.then(data => {
		if ($.fn.DataTable.isDataTable('#email_table')) {
			$('#email_table').DataTable().clear().rows.add(data).draw();
		} else {
			$('#email_table').DataTable({
				data: data,
                order: [[4, 'desc']] ,
				columns: [
					{
						data: 'template_id',
						render: function(data, type, row){
							return EMAIL_TYPE_HASH[data] || '';
						}
					},
					{data: 'name'},
					{data: 'affiliation', className: 'wrap-column' },
					{data: 'to'},
					{
						data: 'sent_at',
						render: function(data, type, row) {
							if (!data) return '';
							return utils_format_date(data);
						}
					},
					{data: 'status'}
				]
			});

            $('#email_table tbody').on('click', 'tr', function() {
				
				$('#email_table').find('tr.selected').removeClass('selected');
				$(this).addClass('selected');

       	        const row = $('#email_table').DataTable().row(this).data();
           	    if (row) showEmailDetail(row.id);
			});
		}
	});
}

function showEmailDetail(id) {
    fetch(`${URL_LOAD_EMAIL_DETAIL}/${id}`)
	.then(res => res.json())
	.then(email => {
		$('#modalSubject').text(email.subject);
		$('#modalFrom').text(email.from);
		$('#modalTo').text(email.to);
		let timestamp = email.sent_at ? email.sent_at : email.created_at;
		$('#modalTime').text(utils_format_date(timestamp));
		$('#modalStatus').text(email.status);
		$('#modalBody').html('<pre style="white-space: pre-wrap;">' + email.body + '</pre>');
		$('#modalError').text(email.error_msg || '');

		if (email.status === 'failed') {
			$('#btnResend').show().off('click').on('click', function() {
				resendEmail(email.id);
			});
		} else {
			$('#btnResend').hide();
		}

		$('#modalOverlay').show();
		$('#emailModal').show();
	});
}

function resendEmail(id) {

	_vgp_show_loading();	

    $('#btnResend').text('Resend...').prop('disabled', true);
    fetch(`${URL_RESEND_EMAIL}/${id}`, { method: 'POST' })
    .then(res => res.json())
    .then(data => {

		_vgp_hide_loading();

        alert(data.message);
        $('#btnResend').text('Resend').prop('disabled', false);
        $('#emailModal').hide();
        $('#modalOverlay').hide();
        $('#btn_load_email').trigger('click');
    })
    .catch(err => {
		_vgp_hide_loading();

        alert('Failed: ' + err);
        $('#btnResend').text('Resend').prop('disabled', false);
    });
}

