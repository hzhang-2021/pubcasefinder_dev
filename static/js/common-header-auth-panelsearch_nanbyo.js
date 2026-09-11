
$('#nav-user').click(() => {
    $('.common-user').toggleClass('dropdown-menu-open')
})

$('#nav-user').click(() => {
    //closeKarteModal();
    $('#dropdown-user').toggleClass('dropdown-menu-open');
    $('#my-page-mark').toggleClass('vgp-turnward');
})


let modal_login = document.createElement("div");
modal_login.id = "modal-login";
modal_login.classList.add("modal_box");
modal_login.classList.add("modal-karte");
modal_login.innerHTML = `
    <button class="modal-login-button" onclick="location.href='/google-login?service=panelsearch_nanbyo'">
      <span><img src="/static/images/panelsearch_nanbyo/g-logo.png"><span>Log in</span></span>
    </button>
    <div class="modal-login-or">OR</div>
    <div>
      <button class="modal-login-button" onclick="location.href='/google-goto-signup?target=panelsearch_nanbyo'">Sign up</button>
    </div>
`;
document.body.appendChild(modal_login);




$('#nav-login').click(() => {
    openLogin();
})

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
