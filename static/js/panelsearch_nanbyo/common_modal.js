//$('.modal_open').click(() => {
//    //console.log('hello')
//    openModal(false)
//})

$('#nav-info').click(() => {
    openInfo()
})

$('#nav-menu').click(() => {
    closeKarteModal()
    $('.common-menu').toggleClass('dropdown-menu-open')
})

$('#nav-service').click(() => {
    closeKarteModal()
    $('.common-service').toggleClass('dropdown-menu-open')
})

$('#nav-language').click(() => {
    closeKarteModal()
    $('#dropdown-language').toggleClass('dropdown-menu-open')
})

/*
$('#menu-save').click((e) => {
    closeKarteModal();
    if (e.target.closest('.save-panel')) return;
    $('.save-panel').toggleClass('save-panel-open');
    $('#menu-save .popup-bg-cover').addClass('active');
});

$('#menu-save .popup-bg-cover').click(() => {
    $('.save-panel').removeClass('save-panel-open');
    $('#menu-save .popup-bg-cover').removeClass('active');
});

$(document).mouseup((e) => {
    //console.log('clicked', e.target)

    const container = $('.save-panel');
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.removeClass('save-panel-open');
        $('#menu-save .popup-bg-cover').removeClass('active');
    }
});

*/

$('.nav-list a').on('click', closeKarteModal)

function openModal() {
    //console.log('openModal')
    var modal = '#modal-karte'

    modalResize()

    //inputValues()

    $(modal).fadeIn()

    $(window).on('resize', function () {
        modalResize()
    })


    function modalResize() {
        var w = $(window).width();
        var h = $(window).height();

        var x = (w - $(modal).outerWidth(true)) / 2;
        var y = (h - $(modal).outerHeight(true)); 

        $(modal).css({ 'left': x + 'px', 'top': y + 'px' });
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


function openInfo() {
    closeKarteModal()

    $('body').append('<div class="modal_bg"></div>')
    $('.modal_bg').fadeIn()

    let modal = '#modal-info'
    $(modal).fadeIn()

    modalResize()

    $(window).on('resize', function () {
        modalResize()
    })

    function modalResize() {
        var w = $(window).width()
        var h = $(window).height()

        var x = (w - $(modal).outerWidth(true)) / 2
        var y = (h - $(modal).outerHeight(true)) / 2

        $(modal).css({ 'left': x + 'px', 'top': y + 'px' })
    }

    $('.info-modal-close, .modal_bg').off().click(function (e) {
        $('.modal_box').fadeOut()
        $('.modal_bg').fadeOut('slow', function () {
            $('.modal_bg').remove()
        })
    })

}

function closeKarteModal() {
    if ($('#modal-karte').css('display') === 'block') {
        $('#modal-karte').fadeOut()
    }
}




//resize handle
const modal = document.querySelector('#modal-karte');

let isResizing = false;
let lastX = 0;
if (modal) {
    const resizeHandle = modal.querySelector('.resize-handle');

    resizeHandle.addEventListener('mousedown', (event) => {
        isResizing = true;
        lastX = event.clientX;
    });
}

document.addEventListener('mousemove', (event) => {
    if (!isResizing) return;

    const delta = event.clientX - lastX;
    lastX = event.clientX;
    const modalWidth = parseInt(getComputedStyle(modal).getPropertyValue('width'));
    let newWidth = modalWidth - delta;
    if (newWidth < 400) newWidth = 400;
    if (newWidth < 520) {
        document.querySelectorAll("#modal-karte .tab-wrap ul .tab-btn span").forEach(elem => elem.style.display = "none");
    } else {
        document.querySelectorAll("#modal-karte .tab-wrap ul .tab-btn span").forEach(elem => elem.style.display = "block");
    }


    modal.style.width = newWidth + 'px';
});

document.addEventListener('mouseup', () => {
    isResizing = false;
});

