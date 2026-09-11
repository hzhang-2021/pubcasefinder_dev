let currentPatient
let changedData = {}

// タッチデバイスかどうかを判定
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function checkBoxRenderer(instance, td) {
    Handsontable.renderers.TextRenderer.apply(this, arguments)

    if (isAllChecked) {
        td.innerHTML = `<input type="checkbox" class="checkbox" checked>`
    }
    else {
        td.innerHTML = `<input type="checkbox" class="checkbox">`
    }

    return td
}

function editRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments)

    // div要素を動的に生成してイベントを設定
    const div = document.createElement('div');
    div.className = 'list-icon list-edit';
    div.style.cursor = 'pointer';

    // ハンドラ関数（mousedownとtouchstartで共通）
    const handleEdit = function(event) {
        event.stopPropagation();
        event.preventDefault();

        // セルを選択状態にする（UX改善）
        if (hot && hot.selectCell) {
            hot.selectCell(row, col);
        }

        // セル選択が視覚的に表示されてからモーダルを開く
        setTimeout(() => {
            if (typeof openModal === 'function') {
                openModal(value);
            }
        }, 100); // 100ms遅延でセル選択を視覚的に確認できる
    };

    // タッチデバイスの場合はtouchstartのみ、それ以外はmousedownのみ
    if (isTouchDevice) {
        div.addEventListener('touchstart', handleEdit, { passive: false });
    } else {
        div.addEventListener('mousedown', handleEdit);
    }

    td.innerHTML = '';
    td.appendChild(div);
}

function removeRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.BaseRenderer.apply(this, arguments)

    // div要素を動的に生成してイベントを設定
    const div = document.createElement('div');
    div.className = 'list-icon list-delete';
    div.style.cursor = 'pointer';

    // ハンドラ関数（mousedownとtouchstartで共通）
    const handleDelete = function(event) {
        event.stopPropagation();
        event.preventDefault();

        // セルを選択状態にする（UX改善）
        if (hot && hot.selectCell) {
            hot.selectCell(row, col);
        }

        // セル選択が視覚的に表示されてからconfirmダイアログを表示
        setTimeout(() => {
            const visibleData = hot ? hot.getData() : []
            const pcfnoIdx = columns.findIndex(col => col.data === 'case_id');
            const visibleOne = visibleData[row]
            if (confirm(translate('confirm-case-delete', { caseId: visibleOne[pcfnoIdx] }))) {
                if(currentPatient === contentData[row]?.PCFNo) {
                    $('.modal-close').click();
                }
                hot.alter('remove_row', row, 1)
                document.getElementById('row_count').innerHTML = hot.countRows()

                let searchWord = document.getElementById("search_input").value;
                if(searchWord !== "") {
                    // Update count of search result
                    filterCases(document.getElementById("search_input").value);
                }
            } else {
                // iPad Chrome対応: confirmをキャンセルした場合、セル選択を解除（連続タップ対応）
                if (hot && hot.deselectCell) {
                    hot.deselectCell();
                }
            }
        }, 100); // 100ms遅延でセル選択を視覚的に確認できる
    };

    // タッチデバイスの場合はtouchstartのみ、それ以外はmousedownのみ
    if (isTouchDevice) {
        div.addEventListener('touchstart', handleDelete, { passive: false });
    } else {
        div.addEventListener('mousedown', handleDelete);
    }

    td.innerHTML = '';
    td.appendChild(div);
}

function multipleRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.BaseRenderer.apply(this, arguments)
    let displayValue = value
    if (value) {
        if (typeof value === 'string') {
            value = value.split(',')
        }

        displayValue = value.join('<br>')
    }
    if (prop !== columnKeys.MEDICAL_CHIEF_COMPLAINT) td.classList.add('htDimmed')
    td.innerHTML = displayValue
}

function getLatest(type, value) {
    if (!value || value.length < 1) return ''
    return value[value.length - 1][type] || ''
}

function customRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.TextRenderer.apply(this, arguments)
    td.classList.add('custom-cell')
}

function translateUnknownRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.BaseRenderer.apply(this, arguments)
    td.textContent = value === 'unknown' ? translate(value) : value;
}

Handsontable.renderers.registerRenderer('removeRenderer', removeRenderer)
Handsontable.renderers.registerRenderer('editRenderer', editRenderer)
Handsontable.renderers.registerRenderer('multipleRenderer', multipleRenderer)
Handsontable.renderers.registerRenderer('customRenderer', customRenderer)
Handsontable.renderers.registerRenderer('translateUnknownRenderer', translateUnknownRenderer)
