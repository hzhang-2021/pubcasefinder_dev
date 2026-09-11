/*
$('#nav-info').click(() => {
    openInfo()
})

$('#nav-menu').click(() => {
    $('.common-menu').toggleClass('dropdown-menu-open')
})

$('#nav-service').click(() => {
    $('.common-service').toggleClass('dropdown-menu-open')
})

$('#nav-language').click(() => {
    $('#dropdown-language').toggleClass('dropdown-menu-open')
})


$('ul#dropdown-language li').click((e) => {
    if (e.target.classList.contains('popup-bg-cover')) return document.getElementById('dropdown-language').classList.toggle('dropdown-menu-open')
    let newLang = e.target.dataset.lang

    document.getElementById('selected-language-display').innerText = e.target.innerText
    localStorage.lang = newLang

    // reload current URL with lang=newLang
    let url = new URL(window.location.href)
    url.searchParams.set('lang', newLang)
    // open url
    window.location.href = url.href
})
*/


let lang = localStorage.lang || 'en'
lang = lang === 'undefined' ? 'en' : lang

$().ready(() => {
    lang = $('#r_lang').val(); 
	$(`.dropdown-menu-item[data-lang='${lang}']`).addClass('dropdown-selected')
    let obj = document.getElementById('selected-language-display');
	if(obj) obj.innerText = $('.dropdown-selected').text()
    
    // attach event of open modal to common header

    const template_common_menu = document.getElementById('dropdown-menu_common_menu_wrap');
    template_common_menu.style.display = 'block';
    tippy('#dropdown-trigger_common_menu_wrap', {
            arrow:         true,
            allowHTML:     true,
            appendTo:      document.body,
            animation:     'scale-extreme',
            maxWidth:      500,
            strategy:     'fixed',
            interactive:   true,
            trigger:      'click',
            theme:        'pcf-popup',
            placement:    'bottom',
            content:       template_common_menu,
            onShown(instance) {
                //$('#share_link').val(share_link_val);
            },
        });

    const template_common_service = document.getElementById('dropdown-menu_common_service_wrap');
    template_common_service.style.display = 'block';
    tippy('#dropdown-trigger_common_service_wrap', {
            arrow:         true,
            allowHTML:     true,
            appendTo:      document.body,
            animation:     'scale-extreme',
            maxWidth:      500,
            strategy:     'fixed',
            interactive:   true,
            trigger:      'click',
            theme:        'pcf-popup',
            placement:    'bottom',
            content:       template_common_service,
            onShown(instance) {
                //$('#share_link').val(share_link_val);
            },
        });

    const template_common_language = document.getElementById('dropdown-menu_common_language_wrap');
    template_common_language.style.display = 'block';
    tippy('#dropdown-trigger_common_language_wrap', {
            arrow:         true,
            allowHTML:     true,
            appendTo:      document.body,
            animation:     'scale-extreme',
            maxWidth:      500,
            strategy:     'fixed',
            interactive:   true,
            trigger:      'click',
            theme:        'pcf-popup2',
            placement:    'bottom',
            content:       template_common_language,
            onCreate(instance) {
                instance._isSetClickEvent = false;
            },
            onShown(instance) {
                if (instance._isSetClickEvent) return;

                var liElements = document.querySelectorAll('#dropdown-menu_common_language_wrap li');
                liElements.forEach(function(li) {
                    li.addEventListener('click', function() {
                        if (!li.classList.contains('dropdown-selected')) {
                            var data_lang = li.getAttribute('data-lang');
                            var value = $('#link_en').val();
                            if(data_lang ==="ja"){
                                value = $('#link_ja').val();
                            }
                            location.href=value;
                        }
                    });
                });
            }
        });
})

