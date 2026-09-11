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

