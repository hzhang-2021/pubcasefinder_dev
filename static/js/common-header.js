$("#nav-info").click(() => {
  openInfo();
});

$("#nav-menu").click(() => {
  $(".common-menu").toggleClass("dropdown-menu-open");
});

$("#nav-service").click(() => {
  $(".common-service").toggleClass("dropdown-menu-open");
});

$("#nav-language").click(() => {
  $("#dropdown-language").toggleClass("dropdown-menu-open");
});

function openInfo() {
  $("body").append('<div class="modal_bg"></div>');
  $(".modal_bg").fadeIn();

  let modal = "#modal-info";
  $(modal).fadeIn();

  modalResize();

  $(window).on("resize", function () {
    modalResize();
  });

  function modalResize() {
    var w = $(window).width();
    var h = $(window).height();

    var x = (w - $(modal).outerWidth(true)) / 2;
    var y = (h - $(modal).outerHeight(true)) / 2;

    $(modal).css({ left: x + "px", top: y + "px" });
  }

  $(".info-modal-close, .modal_bg")
    .off()
    .click(function (e) {
      $(".modal_box").fadeOut();
      $(".modal_bg").fadeOut("slow", function () {
        $(".modal_bg").remove();
      });
    });
}

$("ul#dropdown-language li").click((e) => {
  if (e.target.classList.contains("popup-bg-cover"))
    return document
      .getElementById("dropdown-language")
      .classList.toggle("dropdown-menu-open");
  let newLang = e.target.dataset.lang;

  // reload current URL with lang=newLang
  let url = new URL(window.location.href);
  url.searchParams.set("lang", newLang);
  // open url
  window.location.href = url.href;
});

let lang = document.documentElement.lang;
// Overwrite lang with URL lang if exists
{
  let url = new URL(window.location.href);
  let urlLang = url.searchParams.get("lang");
  if (urlLang) lang = urlLang;
}

$().ready(() => {
  $(`.dropdown-menu-item[data-lang='${lang}']`).addClass("dropdown-selected");
  let obj = document.getElementById("selected-language-display");
  if(obj) obj.innerText = $(".dropdown-selected").text();
});

$(window).on("scroll", function () {
  if ($(".common-nav-container").height() < $(this).scrollTop()) {
    $(".common-nav-container").addClass("change-color");
  } else {
    $(".common-nav-container").removeClass("change-color");
  }
});
