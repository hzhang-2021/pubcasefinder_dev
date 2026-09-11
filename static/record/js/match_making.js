// static/js/match_making.js
// ES moduleのトップレベルではreturnが使えないため、早期リターンはしない
if (window.pcfIsLoggedIn) {
  const tabContainer = document.createElement('div');
  // TODO: 辞書参照する
  const tabLabel = document.documentElement.lang === 'ja' ? '共有' : 'Share'
  tabContainer.innerHTML = `
    <li id="tab-btn-matching" class="tab-btn tab-btn-last">
      <div class="modal-icon modal-share"></div>
      <span>${tabLabel}</span>
    </li>
  `;
  let app;

  fetch('./static/parts/match_making.html')
    .then(res => res.text())
    .then(async templateText => {
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = templateText;

      const matchingTab = tabContainer.querySelector('#tab-btn-matching');
      const content = tempContainer.querySelector('#match-making-content');

      const tabWrap = document.querySelector('#tab-wrap');
      tabWrap.children[0].querySelector('.tab-btn-last').classList.remove('tab-btn-last');
      tabWrap.children[0].appendChild(matchingTab);

      matchingTab.addEventListener('click', async () => {
        if (matchingTab.classList.contains("show")) return;
        tabWrap.querySelector('.tab-btn.show')?.classList.remove('show');
        tabWrap.querySelector('.category-header.show')?.classList.remove('show');
        tabWrap.querySelector('.tab-contents.show')?.classList.remove('show');
        matchingTab.classList.add("show");
        tabWrap.appendChild(content);

        const matchingWrapper = document.querySelector('.matchingFormContentWrapper');
        if (matchingWrapper) {
          matchingWrapper.style.display = 'block';
        }

        const mountPoint = document.getElementById('vue-matching-form');
        if (!mountPoint.hasAttribute('data-mounted')) {
          const { createApp } = await import('https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js');
          const MatchingFormWrapper = await import('./MatchingFormWrapper.vue.js');
          app = createApp(MatchingFormWrapper.default);
          app.mount(mountPoint);
          mountPoint.setAttribute('data-mounted', 'true');
        } else if (window.matchingFormInitialize) {
          window.matchingFormInitialize();
        }
      });
    });
}
