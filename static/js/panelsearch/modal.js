$('#nav-user').click(() => {
    closeKarteModal();
    $('#dropdown-user').toggleClass('dropdown-menu-open');
    $('#my-page-mark').toggleClass('vgp-turnward');
})

$('#nav-login').click(() => {
    openLogin();
})

$("#nav-menu").click(() => {
    closeKarteModal();
});

$("#nav-service").click(() => {
    closeKarteModal();
});

$("#nav-language").click(() => {
    closeKarteModal();
});

function openLogin() {
    closeKarteModal();
    $('body').append('<div class="modal_bg"></div>');
    $('.modal_bg').fadeIn();
    let modal = '#modal-login';
    $(modal).fadeIn();
    modalResize();
    $(window).on('resize', function () {
        modalResize()
    })
    function modalResize() {
        var w = $(window).width();
        var h = $(window).height();
        var x = (w - $(modal).outerWidth(true)) / 2;
        var y = (h - $(modal).outerHeight(true)) / 2;
        $(modal).css({ 'left': x + 'px', 'top': y + 'px' });
    }
    $('.info-modal-close, .modal_bg').off().click(function (e) {
        $('.modal_box').fadeOut();
        $('.modal_bg').fadeOut('slow', function () {
            $('.modal_bg').remove()
        });
    });
}

function closeKarteModal() {
    if ($("#modal-karte") && $("#modal-karte").css("display") === "block") {
        $("#modal-karte").fadeOut();
    }
}

const MODAL = {
	"modal-karte": [
		{'btn_id': 'btn-vgp-review-gene',       'input_id': 'vgp-input-review-gene',          'val': ''},
		{'btn_id': 'btn-vgp-review-rating',     'input_id': 'vgp-input-review-rating',        'val': ''},
		{'btn_id': 'btn-vgp-review-inheritance','input_id': 'vgp-input-review-inheritance',   'val': ''},
		{'btn_id': '',                          'input_id': 'vgp-input-review-pathogenicity', 'val': ''},
		{'btn_id': '',                          'input_id': 'vgp-input-review-publication',   'val': ''},
		{'btn_id': '',                          'input_id': 'vgp-input-review-phenotype',     'val': ''},
		{'btn_id': '',                          'input_id': 'vgp-input-review-comment',       'val': ''}
	]
};

function resetModal(modal_id, panel_id, gene_name_list, selected_gene_name){

	$("#vgp-input-review-panel_id").val(panel_id);

	MODAL[modal_id].forEach((obj) => {
		let btn_id   = obj.btn_id;
		let input_id = obj.input_id;
		let value    = obj.val;
		if(btn_id){
			$btn = $("#" + btn_id);
			$btn.text(value);
			if(value){
				$btn.removeClass("is-empty");
			}else{
				$btn.removeClass("is-empty").addClass("is-empty");
				let placeholder = $btn.data("placeholder");
				$btn.text(placeholder);
			}
		}

		$("#" + input_id).val(value);
	});

	let $dropdown_menu_gene = $("#dropdown-menu-vgp-review-gene");
	$dropdown_menu_gene.empty();
	gene_name_list.forEach((gene_name) => {
		let btn_str = `<button class="dropdown-item" type="button" onclick="modal_dropdown_change_value(this,'btn-vgp-review-gene','vgp-input-review-gene');">${gene_name}</button>`;
		$(btn_str).appendTo($dropdown_menu_gene);
	});
	if(selected_gene_name){
		$("#btn-vgp-review-gene").text(selected_gene_name).removeClass("is-empty");
		$("#vgp-input-review-gene").val(selected_gene_name);
	}
}

function openModal(modal_id, panel_id, gene_list, selected_gene){

	let modal = "#"+modal_id;

	resetModal(modal_id, panel_id, gene_list, selected_gene);

	modalResize();

	$(modal).fadeIn();	

	let modal_close_btn = "#" + modal_id + " .modal-close";
	$(modal_close_btn).off().click(function (e) {
		$(this).off();
		$(".modal_box").fadeOut();
	});

	$(window).on("resize", function () {
		if ($(modal).css("display") === "block") {
        	modalResize();
		}
    });

    function modalResize() {
        var w = $(window).width();
        var h = $(window).height();

        var x = (w - $(modal).outerWidth(true)) / 2;
        var y = (h - $(modal).outerHeight(true));

        $(modal).css({ left: x + "px", top: y + "px" });
    }
}


function closeModal(modal_id){
  $(modal_id).fadeOut();
}

function miniModal(modal){
  if ($(modal).find('form').css('display') === 'block') {
      $(modal).find('form').hide();
      var h = $(window).height();
      var y = (h - $(modal).find('.modal-karte-content').outerHeight(true));
      $(modal).css({ 'top': y + 'px' });
  }
}

function maxModal(modal){
  if ($(modal).find('form').is(":hidden")) {
      $(modal).find('form').show();
      var h = $(window).height();
      var y = (h - $(modal).find('.modal-karte-content').outerHeight(true));
      $(modal).css({ 'top': y + 'px' });
  }
}

function modal_dropdown_change_value(clicked_item,btn_id,input_id){
	let $clicked = $(clicked_item);
	let value = $clicked.text();
	$("#"+btn_id).text(value);
	$("#"+btn_id).removeClass('is-empty');
	$("#"+input_id).val(value);
}

//resize handle
const modal = document.querySelector("#modal-karte");
let isResizing = false;
let lastX = 0;
if (modal) {
    const resizeHandle = modal.querySelector(".resize-handle");
    resizeHandle.addEventListener("mousedown", (event) => {
        isResizing = true;
        lastX = event.clientX;
    });
}

document.addEventListener("mousemove", (event) => {
    if (!isResizing) return;

    const delta = event.clientX - lastX;
    lastX = event.clientX;
    const modalWidth = parseInt(        getComputedStyle(modal).getPropertyValue("width")
    );
    let newWidth = modalWidth - delta;
    if (newWidth < 400) newWidth = 400;
    if (newWidth < 520) {
        document
            .querySelectorAll("#modal-karte .tab-wrap ul .tab-btn span")
            .forEach((elem) => (elem.style.display = "none"));
    } else {
        document
            .querySelectorAll("#modal-karte .tab-wrap ul .tab-btn span")
            .forEach((elem) => (elem.style.display = "block"));
    }

    modal.style.width = newWidth + "px";
});

document.addEventListener("mouseup", () => {
    isResizing = false;
});



