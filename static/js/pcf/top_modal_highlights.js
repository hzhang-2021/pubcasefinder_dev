(function ($) {
		// modal
		$(function () {
				var currentModalId = null;
				var modalSelector = '.top_modal_highlights';
				var closeSelector = '.top_modal_highlights_close';
				var wheelLocked = false;
				var touchStartX = null;
				var touchStartY = null;
				var swipeThreshold = 50;
				var transitionDuration = 420;
				var autoplayDelay = 7600;
				var autoplayTimer = null;
				var autoplayPaused = false;

				function restartPillProgress() {
						$(modalSelector).removeClass('top_modal_highlights_is_timing');
						if (autoplayPaused || !currentModalId) return;

						var $modal = $('#' + currentModalId);
						if (!$modal.length) return;

						// Force a reflow so the progress animation starts from zero on each slide.
						void $modal[0].offsetWidth;
						$modal.addClass('top_modal_highlights_is_timing');
				}

				function ensureAutoplayControls() {
						$('.top_modal_highlights_nav').each(function () {
								if ($(this).find('.top_modal_highlights_autoplay_toggle').length) return;
								$(this).append('<button type="button" class="top_modal_highlights_autoplay_toggle" aria-label="一時停止"><span></span></button>');
						});
				}

				function updateAutoplayControls() {
						$('.top_modal_highlights_autoplay_toggle')
								.toggleClass('is_paused', autoplayPaused)
								.attr('aria-label', autoplayPaused ? '再生' : '一時停止');
						restartPillProgress();
				}

				function stopAutoplay() {
						if (autoplayTimer) {
								clearInterval(autoplayTimer);
								autoplayTimer = null;
						}
				}

				function startAutoplay() {
						stopAutoplay();
						if (autoplayPaused || !currentModalId) return;
						autoplayTimer = setInterval(function () {
								moveModalByDirection('next');
						}, autoplayDelay);
				}

				function positionModal($modal) {
						var w = $(window).width();
						var h = $(window).height();
						var x = (w - $modal.outerWidth(true)) / 2;
						var y = (h - $modal.outerHeight(true)) / 2;
						$modal.css({ 'left': x + 'px', 'top': y + 'px' });
				}

				function closeModal() {
						stopAutoplay();
						currentModalId = null;
						$(modalSelector).fadeOut();
						$('.top_modal_highlights_bg').fadeOut('slow', function () {
								$('.top_modal_highlights_bg').remove();
						});
				}

				function showModal(modalId, direction) {
						var $modal = $('#' + modalId);
						if (!$modal.length) return;

						if (!$('.top_modal_highlights_bg').length) {
								$('body').append('<div class="top_modal_highlights_bg"></div>');
								$('.top_modal_highlights_bg').fadeIn();
						}

						var previousModalId = currentModalId;
						var $previousModal = previousModalId ? $('#' + previousModalId) : $();
						var hasPrevious = $previousModal.length && previousModalId !== modalId;

						currentModalId = modalId;
						startAutoplay();
						updateAutoplayControls();

						if (!hasPrevious) {
								$(modalSelector).hide();
								positionModal($modal);
								$modal.stop(true, true).css({ opacity: 0, display: 'block' }).animate({ opacity: 1 }, 220);
								return;
						}

						positionModal($previousModal);
						positionModal($modal);

						$modal.stop(true, true).css({
								display: 'block',
								opacity: 0
						});

						$previousModal.stop(true, true).animate({
								opacity: 0
						}, transitionDuration, function () {
								$previousModal.hide().css({ opacity: 1 });
						});

						$modal.animate({
								opacity: 1
						}, transitionDuration);
				}

				function moveModalByDirection(direction) {
						if (!currentModalId) return;

						var $pills = $('#' + currentModalId).find('.top_modal_highlights_pill');
						var currentIndex = $pills.index($pills.filter('.is_active'));
						if (currentIndex < 0) return;

						var nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
						if (nextIndex < 0) nextIndex = $pills.length - 1;
						if (nextIndex >= $pills.length) nextIndex = 0;

						var nextTarget = $pills.eq(nextIndex).attr('data-target');
						if (nextTarget) showModal(nextTarget, direction);
				}

				ensureAutoplayControls();
				updateAutoplayControls();

				$(document).on('click', '.top_modal_highlights_open', function () {
						autoplayPaused = false;
						updateAutoplayControls();
						showModal($(this).attr('data-target'));
				});

				$(document).on('click', '.top_modal_highlights_switch', function (e) {
						e.preventDefault();
						var $pills = $(this).closest('.top_modal_highlights_nav').find('.top_modal_highlights_pill');
						var currentIndex = $pills.index($pills.filter('.is_active'));
						var targetIndex = $pills.index(this);
						var direction = targetIndex < currentIndex ? 'prev' : 'next';
						showModal($(this).attr('data-target'), direction);
				});

				$(document).on('click', '.top_modal_highlights_autoplay_toggle', function (e) {
						e.preventDefault();
						autoplayPaused = !autoplayPaused;
						updateAutoplayControls();
						if (autoplayPaused) {
								stopAutoplay();
						} else {
								startAutoplay();
						}
						restartPillProgress();
				});

				$(document).on('click', '.top_modal_highlights_bg, ' + closeSelector, function () {
						closeModal();
				});

				$(window).on('resize.modalStory', function () {
						if (!currentModalId) return;
						positionModal($('#' + currentModalId));
				});

				$(document).on('wheel', '.top_modal_highlights_shell', function (e) {
						var original = e.originalEvent;
						if (!currentModalId || !original) return;

						var deltaX = original.deltaX || 0;
						var deltaY = original.deltaY || 0;
						if (Math.abs(deltaX) < 30 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
						if (wheelLocked) return;

						e.preventDefault();
						wheelLocked = true;
						moveModalByDirection(deltaX > 0 ? 'next' : 'prev');

						setTimeout(function () {
								wheelLocked = false;
						}, 420);
				});

				$(document).on('touchstart', '.top_modal_highlights_shell', function (e) {
						var touch = e.originalEvent.touches && e.originalEvent.touches[0];
						if (!touch) return;
						touchStartX = touch.clientX;
						touchStartY = touch.clientY;
				});

				$(document).on('touchend', '.top_modal_highlights_shell', function (e) {
						var touch = e.originalEvent.changedTouches && e.originalEvent.changedTouches[0];
						if (!touch || touchStartX === null || touchStartY === null) return;

						var deltaX = touch.clientX - touchStartX;
						var deltaY = touch.clientY - touchStartY;

						touchStartX = null;
						touchStartY = null;

						if (Math.abs(deltaX) < swipeThreshold || Math.abs(deltaX) <= Math.abs(deltaY)) return;
						moveModalByDirection(deltaX < 0 ? 'next' : 'prev');
				});
		});
})(jQuery);
