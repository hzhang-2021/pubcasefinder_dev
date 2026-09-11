
$('#nav-user').click(() => {
    $('.common-user').toggleClass('dropdown-menu-open')
})

$('#nav-user').click(() => {
    closeKarteModal();
    $('#dropdown-user').toggleClass('dropdown-menu-open');
    $('#my-page-mark').toggleClass('vgp-turnward');
})

const modalLoginInfoTranslations = {
    ja: [
        `<strong>DiseaseSearch</strong>、<strong>CaseSharing</strong>、<strong>PanelSearch</strong>のログインにはGoogle認証を使用しています。一度ログインすると以下のサービスをご利用いただけます。
         <ul class="login-info-sublist">
           <li><strong>CaseSharing</strong>：症例マッチング機能</li>
         </ul>
        `
    ],
    en: [
        `<strong>DiseaseSearch</strong>, <strong>CaseSharing</strong>, and <strong>PanelSearch</strong> support Google Login. Log in once to access all of these services.
         <ul class="login-info-sublist">
           <li><strong>CaseSharing</strong>: Case Matching</li>
         </ul>
        `
    ],
    ko: [
        `<strong>DiseaseSearch</strong>, <strong>CaseSharing</strong>, <strong>PanelSearch</strong> 로그인에 Google 인증을 사용합니다. 한 번의 로그인으로 다음 서비스들을 모두 이용하실 수 있습니다.
         <ul class="login-info-sublist">
           <li><strong>CaseSharing</strong>: 증례 매칭(Case Matching)</li>
         </ul>
        `,
    ]
}

let modal_login = document.createElement("div");
modal_login.id = "modal-login";
modal_login.classList.add("modal_box");
modal_login.classList.add("modal-karte");
modal_login.classList.add("pcf-common");
modal_login.innerHTML = `
    <button class="modal-login-button" onclick="location.href='/google-login?service=panelsearch'">
      <span><img src="/static/images/panelsearch/g-logo.png"><span>Log in</span></span>
    </button>
    <div class="modal-login-or">OR</div>
    <div>
      <button class="modal-login-button" onclick="location.href='/google-goto-signup?target=panelsearch'">Sign up</button>
    </div>
    <ul class="login-info-list">
      ${modalLoginInfoTranslations[lang].map(item => `<li>${item}</li>`).join('')}
    </ul>
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
