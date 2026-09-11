
const URL_LOAD_AUTHLOG = "/common_admin_load_authentication_log";

/* ---------- State ---------- */
const state = {
  logs: [],
  searchTimer: null
};

/* ---------- Utils ---------- */
function submitWithLoading(url, data, onSuccess, onFail){
  _vgp_show_loading();
  _run_submit(
    url,
    data,
    res => {
      onSuccess && onSuccess(res);
      _vgp_hide_loading();
    },
    () => {
      onFail && onFail();
      _vgp_hide_loading();
    }
  );
}

function getFilters(){
  const checked = document.querySelectorAll('.filter-results:checked');
  let dateTo = $('#dateTo').val();
  if(dateTo.length > 0) dateTo += " 23:59:59";
  return {
    filter_name:     trimAllSpaces($('#filter_letter').val()),
    filter_fromdate: $('#dateFrom').val(),
    filter_todate:   dateTo,
    filter_results:  Array.from(checked).map(cb => cb.value).join(',')
  };
}

/* ---------- Init ---------- */
function _init(){
  loadLogAndRender();
  attachEvents();
}

/* ---------- Load ---------- */
function loadLogAndRender(){
  submitWithLoading(
    URL_LOAD_AUTHLOG,
    getFilters(),
    logs => {
      state.logs = logs || [];
      $("#total_num").text(state.logs.length);
      renderTable(state.logs);
    }
  );
}

/* ---------- Events ---------- */
function attachEvents(){

  _attach_filter_text_event("filter_letter", debounceSearch);

  // dropdown checkbox
  const $menu = $('.dropdown.filter .dropdown-menu');

  $menu.on('click', e => e.stopPropagation());

  $menu.on('click', '.dropdown-item-checkbox', function (e) {
    if ($(e.target).is('input, label')) return;
    const $cb = $(this).find('input[type=checkbox]');
    $cb.prop('checked', !$cb.prop('checked')).trigger('change');
  });

  $menu.on('change', 'input.form-check-input', loadLogAndRender);

  $('#dateFrom, #dateTo').on('change', loadLogAndRender);

  // sorter
  $('#authlog_table').on('click', 'span.vgp-sorter', function(){
    const $s = $(this);
    const cls = $s.hasClass('vgp-asc') ? 'vgp-dsc' : 'vgp-asc';
    $s.closest('tr').find('.vgp-sorter').removeClass('vgp-asc vgp-dsc');
    $s.addClass(cls);
    renderTable(state.logs);
  });

  // page size
  $("#dropdown-menu-size").on('click', '.dropdown-item', function () {
    const $btn = $(this);
    if ($btn.hasClass("selected")) return;

    $("#dropdown-menu-size .selected").removeClass("selected");
    $btn.addClass("selected");

    const size = $btn.data("num_per_page");
    $("#btn-vgp-size").data("num_per_page", size).text(size);

    renderTable(state.logs);
  });
}

/* ---------- Search ---------- */
function debounceSearch(){
  clearTimeout(state.searchTimer);
  const keyword = trimAllSpaces($('#filter_letter').val());

  state.searchTimer = setTimeout(() => {
    submitWithLoading(
      URL_LOAD_AUTHLOG,
      getFilters(),
      logs => {
        if (trimAllSpaces($('#filter_letter').val()) === keyword) {
          state.logs = logs || [];
          $("#total_num").text(state.logs.length);
          renderTable(state.logs);
        }
      }
    );
  }, 150);
}

/* ---------- Table ---------- */
function renderTable(logs){
  const sorted = sortLogs([...logs]); // 不污染 cache
  const pageSize = parseInt($('#btn-vgp-size').data('num_per_page'), 10);

  $('#table-pagination-desc').empty();
  if ($('#table-pagination').data('pagination')) {
    $('#table-pagination').pagination('destroy');
  }

  $('#table-pagination').pagination({
    dataSource: sorted,
    pageSize,
    callback(data, pagination){
      const $tbody = $("#authlog_table_tbody").empty();
      data.forEach(item => createRow(item, $tbody));
      updatePaginationDesc(pagination);
    }
  });
}

function updatePaginationDesc(p){
  const totalPage = Math.ceil(p.totalNumber / p.pageSize);
  $('#table-pagination-desc').text(
    totalPage
      ? `Page ${p.pageNumber} of ${totalPage}, total ${p.totalNumber} items`
      : `total ${p.totalNumber} items`
  );
}

/* ---------- Row ---------- */
function createRow(log, $tbody){

  const keyword = trimAllSpaces($('#filter_letter').val()).toLowerCase();
  const regex = keyword
    ? new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    : null;

  const highlight = txt =>
    regex && txt.toLowerCase().includes(keyword)
      ? txt.replace(regex, '<mark>$1</mark>')
      : txt;

  const $tr = $('<tr>').appendTo($tbody);

  [
    'created_at',
    'user_name',
    'email',
    'user_agent',
    'action',
    'result',
    'reason'
  ].forEach(key => {

    if (key === 'result') {
      const ok = log.result === 'success';
      $('<td>')
        .append(
          $('<span>')
            .addClass('result-tag')
            .addClass(ok ? 'success' : 'fail')
            .text(ok ? '成功' : '失敗')
        )
        .appendTo($tr);
    } else if (key === 'user_name') {
      $('<td>').html(highlight(log.user_name || '-')).appendTo($tr);
    } else if (key === 'email') {
      $('<td>').html(highlight(log.email || '-')).appendTo($tr);
    } else {
      $('<td>').text(log[key] || '-').appendTo($tr);
    }
  });
}

/* ---------- Sort ---------- */
function sortLogs(arr){
  const $sorter = $("#authlog_table thead").find('.vgp-asc, .vgp-dsc').first();
  if (!$sorter.length) return arr;

  const key = $sorter.data("target-class");
  const desc = $sorter.hasClass("vgp-dsc");

  arr.sort((a,b) => {
    const at = (a[key] || '').toLowerCase();
    const bt = (b[key] || '').toLowerCase();
    let r = at.localeCompare(bt, 'ja', { sensitivity: 'base' });
    return desc ? -r : r;
  });

  return arr;
}

