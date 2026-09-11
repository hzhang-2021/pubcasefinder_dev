let hot, exportPlugin, filtersPlugin;
let handsontableLicenseKey;

const TAB_INDEX_FOR_FAMILY = 4;
let uniqueCounterForInput = 0;

let count;
let toReset = true;
let caseCount = 0;

let defaultColumns = [
    columnKeys.MEDICAL_CASE_SOLVED,
    columnKeys.MEDICAL_CHIEF_COMPLAINT,
    columnKeys.MEDICAL_FINAL_DIAGNOSIS,
    columnKeys.MEDICAL_CLINICAL_DIAGNOSIS,
    columnKeys.CASE_SEX,
    columnKeys.CASE_AGE,
    columnKeys.CASE_BIRTH,
    columnKeys.CASE_LIFE_STATUS,
    columnKeys.CASE_GROUP,
    columnKeys.CASE_PRESENCE_OR_ABSENCE_OF_ONSET,
    columnKeys.CASE_EXAMINATION_DAY,
    columnKeys.CASE_RELATIONSHIP,
    columnKeys.CASE_FAMILY_ID,
    columnKeys.CASE_ID,
];
let actions = ["REMOVE", "EDIT"];
actions = ["EDIT", "REMOVE"];

let currentFileName = null;

let geneIdList = [];

let smartTextBoxClearTimer = null;

// columns = HOT columns (settings - type, options, renderer, etc) HEADERS

let columns = [];
let existingColumns = [],
    hiddenColumns = [],
    customColumns = [];
let customColumnCount = 0;

const COLUMN_INDEX_FOR_EDIT = 1;

const minimumYearOfBirth = 1800;

// dataSchema = HOT dataSchema
let dataSchema = {},
    dataColumns = {};
let enableWhenParentDataColumns = {};

// contentData = HOT data
let contentData = [];
let groupOptions = [],
    familyOptions = [];

const hotUndo = document.getElementById("hot-undo");
const hotRedo = document.getElementById("hot-redo");

const hotContainer = document.getElementById("myGrid");

getHandsontableKey();
setInitialLanguage();

let updateSettings = {
    width: "100%",
    height: "100%",
    rowHeaders: true,
    autoColumnSize: true,
    hiddenColumns: true,
    viewportColumnRenderingOffset: 2,
    viewportRowRenderingOffset: 10,
    fixedColumnsLeft: 2,
    search: true,
    manualColumnMove: true,
    manualColumnResize: true,
    manualRowMove: true,
    afterOnCellMouseDown: function (event, cords, TD) {
        if (cords.col === COLUMN_INDEX_FOR_EDIT && cords.row >= 0) {
            openModal(hot.getDataAtCell(cords.row, cords.col));
            if (window.matchingFormInitialize) window.matchingFormInitialize();
        }
    },
    afterRowMove: (
        movedRows,
        finalIndex,
        dropIndex,
        movePossible,
        orderChanged
    ) => {
        if (orderChanged) {
            let tempArray = JSON.parse(JSON.stringify(contentData)); // Clone contentData
            let movedContents = [];
            movedRows = movedRows.sort((a, b) => b - a); // Sort movedRows in descending order
            movedRows.forEach((rowIndex) => {
                movedContents.unshift(tempArray.splice(rowIndex, 1)[0]);
            });

            tempArray.splice(finalIndex, 0, ...movedContents);
            contentData = tempArray;
            // Resume data binding between hot and contentData. The delay is necessary to prevent the change of selection range after reordering
            setTimeout(() => {
                hot.loadData(contentData);
                hot.clearUndo();
                updateUndoRedoButtonAvailable();
            }, 10);
        }

        return true;
    },
    contextMenu: ["undo", "redo", "alignment"],
    allowRemoveColumn: true,
    columnSorting: {
        indicator: true,
        sortEmptyCells: false,
    },
    beforeColumnMove: (movedColumns, finalIndex) => {
        // アクションヘッダーの移動及びアクションヘッダー位置への移動を禁止
        const actionsColumnsCount = actions.length;
        if (movedColumns[0] < actionsColumnsCount || finalIndex < actionsColumnsCount) return false;

        // 移動先が移動元と同じ場合は移動しない
        if (movedColumns[0] === finalIndex) return false;

        let movedContents = [];
        let tempExistingColumns = JSON.parse(JSON.stringify(existingColumns));

        let movedColumnsContents = [];

        movedColumns = movedColumns.map(movedColumn => movedColumn - actionsColumnsCount).sort((a, b) => b - a);
        movedColumns.forEach((columnIndex) => {
            movedContents.unshift(tempExistingColumns.splice(columnIndex, 1)[0]);
            movedColumnsContents.unshift(columns.splice(columnIndex + actionsColumnsCount, 1)[0]);
        });
        tempExistingColumns.splice(finalIndex - actionsColumnsCount, 0, ...movedContents);
        existingColumns = tempExistingColumns;

        columns.splice(finalIndex, 0, ...movedColumnsContents);

        Object.assign(updateSettings, {
            dataSchema: dataSchema,
            colHeaders: getColumnHeaders(),
            columns: columns,
        });
        hot.updateSettings(updateSettings);
        hot.selectColumns(finalIndex, finalIndex + movedColumns.length - 1);
        hot.clearUndo();
        updateUndoRedoButtonAvailable();
        return false;
    },
    beforeColumnSort: (currentSortConfig, destinationSortConfigs) => {
        if (destinationSortConfigs.length > 0) {
            if (destinationSortConfigs[0].column < 2) return false;
        }
    },
    beforeChange: (changes, type) => {
        if (type === "edit") {
            changes.forEach((c) => {
                let row = c[0];
                let col = c[1];
                let newValue = c[3];

                if (!newValue) return;

                if (col === columnKeys.CASE_FAMILY_ID) {
                    if (!familyOptions.includes(newValue))
                        familyOptions.push(newValue);
                } else if (col === columnKeys.CASE_GROUP) {
                    if (!groupOptions.includes(newValue))
                        groupOptions.push(newValue);
                }
                contentData[row].case_updated_at = currentTimeString();
            });
        }
    },
    afterChange(changes, source) {
        if (!changes) return;

        const initDisabledChildData = (row, columnId, value) => {
            const enableWhenChildDataColumns = enableWhenParentDataColumns[columnId];
            if (!enableWhenChildDataColumns) return;

            // 変更した親項目に紐づく子項目がある場合の処理
            Object.keys(enableWhenChildDataColumns).forEach(childColumnId => {
                const childDataColumn = dataColumns[childColumnId].column;
                const translatedNewValue = nameToDataValueMap[columnId][value];
                const enabled = enableWhenChildDataColumns[childColumnId].enableWhen.includes(translatedNewValue);
                if (enabled) return;

                // 親項目の値の変更により、紐づく子項目が有効ではない場合は子項目の値を初期化する
                const defaultValue = getDefaultValue(childDataColumn.inputType, childDataColumn.source);
                contentData[row][childColumnId] = defaultValue;
                initDisabledChildData(row, childColumnId, defaultValue);
            });
        };

        changes.forEach(change => {
            const [row, columnId, oldValue, newValue] = change;
            initDisabledChildData(row, columnId, newValue);
        });
        hot.render();
    },
    afterGetRowHeader: (row, TH) => {
        TH.className = "htMiddle";
    },
    afterGetColHeader: (col, TH) => {
        if (customColumns.includes(existingColumns[col - actions.length])) {
            TH.classList += " custom-column";
        }

        const isNoFilter = TH.querySelector('.no-filter');
        if (isNoFilter) {
            const button = TH.querySelector('.changeType');
            if (!button) return;
            button.parentElement.removeChild(button);
        }
    },
    beforeCopy: (data, coords) => {
        if (coords[0].startCol === 0 || coords[0].startCol === 1) return false;
    },
    beforePaste: (data, coords) => {
        let totalRows = hot.countRows();
        let startRow = coords[0].startRow;
        let copyLength = data.length;
        let newTotalRows = startRow + copyLength;

        if (newTotalRows > totalRows) {
            data.splice(totalRows - startRow - 1, newTotalRows - totalRows);
        }
    },
    beforeRemoveRow: (index, amount, physicalRows) => {
        const hasLinkedSubmission = physicalRows
            .some(r => hot.getSourceDataAtRow(r)?.submission_id);
        if (!hasLinkedSubmission) return;
        alert(translate('alert-row-cannot-delete-with-submission'));
        return false;
    },
    afterRemoveRow: () => {
        hot.clearUndo();
        updateUndoRedoButtonAvailable();
    },
    afterUndoStackChange: () => {
        setTimeout(() => {
            enableDisableUndoRedo(
                hotUndo,
                hot.isUndoAvailable ? hot.isUndoAvailable() : false
            );
        }, 10);
    },
    afterRedoStackChange: (undoneActionsBefore, undoneActionsAfter) => {
        setTimeout(() => {
            enableDisableUndoRedo(
                hotRedo,
                hot.isRedoAvailable ? hot.isRedoAvailable() : false
            );
        }, 10);
    },
    filters: true,
    dropdownMenu: {
        items: {
            "clear_column": {
                name: "Clear column",
                callback: function (key, selection) {
                    // Handsontableの描画処理を一時停止（すべての変更を一度に行い、最後にまとめて描画する）
                    hot.batch(() => {
                        const changes = [];
                        if (selection && selection.length > 0) {
                            selection.forEach(range => {
                                for (let col = range.start.col; col <= range.end.col; col++) {
                                    const columnId = existingColumns[col - actions.length];
                                    const dataColumn = dataColumns[columnId].column
                                    const defaultValue = getDefaultValue(dataColumn.inputType, dataColumn.source);
                                    for (let row = 0; row < hot.countRows(); row++) {
                                        changes.push([row, col, defaultValue]);
                                    }
                                }
                            });
                        }

                        hot.setDataAtCell(changes, 'ContextMenu.customClearColumns');
                    }); // hot.batch() が閉じられたときに自動的に render() が呼び出される
                }
            },
            "---------": {
                name: "---------"
            },
            "make_read_only": {
                name: "Read only"
            },
            "---------2": {
                name: "---------"
            },
            "alignment": {
                name: "Alignment"
            },
            "---------3": {
                name: "---------"
            },
            "filter_by_condition": {
                name: "Filter by condition:"
            },
            "filter_operators": {},
            "filter_by_condition2": {},
            "filter_by_value": {
                name: "Filter by value:"
            },
            "filter_action_bar": {}
        }
    },
    outsideClickDeselects: false,
    undo: true,
    redo: true,
    trimDropdown: false,
};

async function getHandsontableKey() {
    const response = await fetch('/get_handsontable_key');
    const encodedData = await response.text();
    const decodedData = atob(encodedData);
    handsontableLicenseKey = JSON.parse(decodedData);
}

function triggerSearch(value) {
    // Use timeout to prevent search from running on every keyup
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        filterCases(value);
    }, 500);
}

function getColumnHeaders() {
    let columnHeaders = [];
    actions.forEach((a) => {
        let colHeader = "";

        if (a === "CHECKBOX") {
            colHeader = `<input type="checkbox" class="header-checkbox" ${isAllChecked ? 'checked="checked"' : ""
                }>`;
            column.renderer = checkBoxRenderer;
        }
        columnHeaders.unshift(colHeader);
    });
    existingColumns.forEach((columnId) => {
        let columnData = dataColumns[columnId];
        let colHeader = createColumnHeaderTitle(
            columnData.columnName,
            columnData.column.readOnly,
            // 配列の項目は一覧表でフィルター不可
            columnData.column.inputType === "multi-checkbox" || columnData.column.groupBy || columnData.category === "phenotype_info"
        );
        columnHeaders.push(colHeader);
    });
    return columnHeaders;
}

function createColumnHeaderTitle(title, readOnly = false, noFilter = false) {
    return `<i class="material-icons-outlined sort_icon"></i>
    <span class="column-header-title ${readOnly ? "read-only" : ""
        } ${noFilter ? "no-filter" : ""}">${title}</span>`;
}

function filterCases(value) {
    const search = hot.getPlugin("search");

    // set isSearchResult = false for all cells
    for (let i = 0; i < hot.countRows(); i++) {
        for (let j = 0; j < hot.countCols(); j++) {
            let element = hot.getCellMeta(i, j);
            element.isSearchResult = false;
        }
    }

    const searchCallback = function (instance, row, col, data, testResult) {
        let element = instance.getCellMeta(row, col);
        if (testResult && col !== 1) {
            element.isSearchResult = true;
        }
    };

    let queries = value.split(/[\s　]+/).filter((x) => x !== "");
    const totalIndexes = Array.from(Array(hot.countRows()).keys());
    let matching = Array.from(totalIndexes);

    for (let query of queries) {
        //modified start by hzhang@bits
        const queryResult = search.query(
            query,
            searchCallback,
            function (q, v) {
                if (
                    typeof q == "undefined" ||
                    q == null ||
                    !q.toLowerCase ||
                    q.length === 0 ||
                    typeof v == "undefined" ||
                    v == null
                ) {
                    return false;
                }

                if (typeof v === "object" && Array.isArray(v)) {
                    let ret = false;
                    v.forEach((v_e) => {
                        if (!v_e) return;
                        if (typeof v_e === "object" && "name_en" in v_e) {
                            let n_k = `name_${lang}`;
                            let n =
                                n_k in v_e && v_e[n_k]
                                    ? v_e[n_k]
                                    : v_e["name_en"];
                            if (
                                n.toLowerCase().indexOf(q.toLowerCase()) !== -1
                            ) {
                                ret = true;
                            }
                        } else {
                            if (
                                ("" + v_e)
                                    .toLowerCase()
                                    .indexOf(("" + q).toLowerCase()) !== -1
                            ) {
                                ret = true;
                            }
                        }
                    });

                    return ret;
                }

                return (
                    v.toString().toLowerCase().indexOf(q.toLowerCase()) !== -1
                );
            }
        );
        //modified end by hzhang@bits

        let localMatch = []; // Match for each token
        queryResult.forEach((obj) => {
            if (obj.col > 1) localMatch.push(obj.row);
        });
        matching = matching.filter((x) => localMatch.includes(x));
    }

    let count = matching.length;

    hot.updateSettings({ hiddenRows: { rows: totalIndexes } });

    if (value === "") {
        count = "";
        hot.updateSettings(
            {
                hiddenRows: { rows: [] },
                manualRowMove: true,
            }
        );
    } else {
        hot.updateSettings({ manualRowMove: false });
    }

    hot.getPlugin("HiddenRows").showRows(matching);
    hot.render();
    document.getElementById("search-result-count").innerHTML = count;
}

function enableDisableUndoRedo(button, isEnabled) {
    if (isEnabled) {
        button.classList.remove("disabled-button");
    } else {
        button.classList.add("disabled-button");
    }
}

function updateUndoRedoButtonAvailable() {
    enableDisableUndoRedo(
        hotUndo,
        hot.isUndoAvailable ? hot.isUndoAvailable() : false
    );
    enableDisableUndoRedo(
        hotRedo,
        hot.isRedoAvailable ? hot.isRedoAvailable() : false
    );
}

function getDefaultValue(inputType, source) {
    switch (inputType) {
        case "select-date":
        case "text":
        case "number-with-unknown":
            return "";
        case "select":
        case "number":
        case "date":
        case "multi-checkbox":
            return null;
        case "radio":
            return source[0];
        default:
            return null;
    }
}

window.onload = async () => {
    await createColumns();

    // Fetch list of gene ids from TSV file

    fetch("/static/data/gene_id_list.tsv")
        .then((response) => response.text())
        .then((tsvData) => {
            geneIdList = tsvData
                .split("\n")
                .slice(1)
                .map((line) => {
                    let idList = line.split("\t");
                    return {
                        genotype_gene: idList[0],
                        genotype_ncbi_gene_id: idList[1],
                        genotype_ensembl_id: idList[2],
                        hgnc_id: idList[3],
                    };
                });
        })
        .catch((error) => {
            console.error("Failed to load TSV data:", error);
        });

    Object.assign(updateSettings, {
        data: contentData,
        dataSchema: dataSchema,
        colHeaders: getColumnHeaders(),
        columns: columns,
        hiddenColumns: { columns: hiddenColumns },
        licenseKey: handsontableLicenseKey,
    });

    hot = new Handsontable(hotContainer, updateSettings);
    exportPlugin = hot.getPlugin("exportFile");
    filtersPlugin = hot.getPlugin("filters");

    Handsontable.dom.addEvent(
        document.getElementById("search_input"),
        "keyup",
        (event) => {
            triggerSearch(event.target.value);
        }
    );

    document
        .getElementById("search_input")
        .addEventListener("search", function (event) {
            if (event.target.value === "") {
                filterCases("");
            }
        });

    hotUndo.addEventListener("click", () => {
        hot.undo();
        updateUndoRedoButtonAvailable();
    });
    hotRedo.addEventListener("click", () => {
        hot.redo();
        updateUndoRedoButtonAvailable();
    });

    Handsontable.dom.addEvent(hotContainer, "mousedown", function (event) {
        if (
            event.target.nodeName == "INPUT" &&
            event.target.classList.contains("header-checkbox")
        )
            event.stopPropagation();

        updateUndoRedoButtonAvailable();
    });

    Handsontable.dom.addEvent(hotContainer, "mouseup", (event) => {
        let element = event.target;

        if (
            element.nodeName === "INPUT" &&
            element.classList.contains("header-checkbox")
        ) {
            isAllChecked = !isAllChecked;
            element.checked = isAllChecked;
            hot.render();
        }
    });

    addRow();

    $("#pedigree")[0].addEventListener("fullscreenchange", (event) => {
        if (document.fullscreenElement === null) {
            // When we exit fullscreen, the pedigreejs corrupts the pedigree figure, so we need to reload it
            setTimeout(updatePedigreeFigure, 1000);
        }
    });
};

function getDropdownOptions(column) {
    return column.options[lang]?.length > 0
        ? column.options[lang]
        : column.options["en"];
}

function createColumns() {
    return new Promise((resolve, reject) => {
        let colSequence = 2;

        categories.forEach((category) => {
            category.columns.forEach((c) => {
                let colId = c.columnId;
                let displayName =
                    c["displayName"][lang] || c["displayName"]["en"];
                if (c.displayNameOnTable) {
                    displayName =
                        c.displayNameOnTable[lang] ||
                        c.displayNameOnTable["en"];
                }

                let dataSchemaColId = colId;
                let options;
                if (c.options) {
                    options = getDropdownOptions(c);
                }

                let column = {
                    data: colId,
                    type: c.type,
                    inputType: c.inputType,
                    source: options,
                    strict: c.strict === undefined ? true : c.strict,
                    allowInvalid:
                        c.allowInvalid === undefined ? false : c.allowInvalid,
                    readOnly: !!c.group || c.readOnly || false,
                    groupBy: c.groupBy,
                    className: "htMiddle",
                };

                if (c.type === "date") {
                    column.dateFormat = c.dateFormat || "YYYY/MM";
                    // column.correctFormat = true
                    column.datePickerConfig = {
                        dateFormat: c.dateFormat || "DD/MM/YYYY",
                        firstDay: 0,
                        numberOfMonths: 1,
                        showMonthAfterYear: true,
                        licenseKey: "non-commercial-and-evaluation",
                        keyboardInput: false,
                        // yearSuffix: '年',
                        // maxDate: new Date(),
                        yearRange: [1900, new Date().getFullYear()],
                    };
                    if (!c.includeDay) {
                        column.datePickerConfig.onDraw = function (datepicker) {
                            let close = document.createElement("span");
                            close.classList.add("pika-ok");
                            close.innerHTML = "OK";

                            $(datepicker.el).find("table").addClass("hide");
                            $(datepicker.el).find("button").addClass("hide");

                            close.addEventListener("click", () => {
                                let year = $(
                                    ".pika-select.pika-select-year"
                                ).val();
                                let month = $(
                                    ".pika-select.pika-select-month"
                                ).val();
                                datepicker.el.classList.add("is-hidden");
                                datepicker.setDate(new Date(year, month, 1));
                            });

                            var prevButt = document.querySelector(".pika-prev");
                            prevButt.parentNode.insertBefore(close, prevButt);
                        };
                    }
                } else if (c.type === "dropdown") {
                    column.trimDropdown = true;
                    if (
                        colId === columnKeys.MEDICAL_AGE_ONSET ||
                        colId === columnKeys.FAMILY_MODE_INHERITANCE
                    ) {
                        column.trimDropdown = false;
                    }
                }

                if (
                    colId === columnKeys.CASE_GROUP ||
                    colId === columnKeys.CASE_FAMILY_ID
                ) {
                    column.allowInvalid = true;
                    column.strict = false;
                    column.source = groupOptions;
                    if (colId === columnKeys.CASE_FAMILY_ID)
                        column.source = familyOptions;
                    // add by hzhang@bits start
                } else if (
                    category["categoryId"] === columnKeys.PHENOTYPE_INFO
                ) {
                    if (colId === columnKeys.PHENOTYPE_HPO_LABEL) {
                        column.renderer = phenotypeInfo_phenotypeNameRenderer;
                    } else {
                        column.renderer = multipleRenderer;
                    }
                    // add by hzhang@bits end
                } else if (c.group) {
                    column.editor = false;
                    column.data = colId;
                    column.renderer = c.renderer
                        ? c.renderer
                        : multipleRenderer;
                    column.columnId = colId;
                } else if (
                    category["categoryId"] === columnKeys.GENOTYPE_INFO ||
                    colId === columnKeys.MEDICAL_CHIEF_COMPLAINT
                ) {
                    if (
                        column.groupKey ||
                        colId === columnKeys.MEDICAL_CHIEF_COMPLAINT
                    ) {
                        column.renderer = multipleRenderer;
                    }
                    if (category["categoryId"] === columnKeys.PHENOTYPE_INFO)
                        column.editor = false;
                } else if (c.inputType === "multi-checkbox") {
                    column.renderer = multipleRenderer;
                } else if (c.inputType === "number-with-unknown") {
                    column.renderer = translateUnknownRenderer;
                }

                if (defaultColumns.includes(colId)) {
                    columns.push(column);
                    existingColumns.push(colId);
                }

                dataColumns[colId] = {
                    column: column,
                    sequence: colSequence,
                    category: category.categoryId,
                    columnName: displayName,
                };

                if (c.enableWhen) {
                    enableWhenParentDataColumns[c.parentInputInModal] = {
                        [colId]: {
                            enableWhen: c.enableWhen
                        },
                        ...enableWhenParentDataColumns[c.parentInputInModal]
                    };
                }

                colSequence++;

                dataSchema[dataSchemaColId] = null;
            });
        });

        actions.forEach((a) => {
            let column = {
                data: a === "EDIT" ? "PCFNo" : "",
                className: "htMiddle htCenter",
                editor: false,
                renderer: a === "EDIT" ? editRenderer : removeRenderer,
            };

            if (a === "CHECKBOX") {
                column.renderer = checkBoxRenderer;
            }

            columns.unshift(column);
        });

        for (
            let i = actions.length + defaultColumns.length;
            i < columns.length;
            i++
        ) {
            hiddenColumns.push(i);
        }

        resolve();
    });
}

function addColumn() {
    let modal = document.querySelector(".modal");

    modal.style.display = "block";

    modal.onclick = (e) => {
        if (!e.target.closest(".modal_content")) closeAddColumnModal();
    };

    let add = document.getElementById("add_column_input");
    add.value = "";

    let container = document.querySelector("#modal_container");
    container.innerHTML = "";

    categories.forEach((category) => {
        createColumn(
            category["displayName"][lang],
            "title",
            category["categoryId"],
            null
        );
        category.columns.forEach((c) => {
            let displayName = c["displayName"][lang] || c["displayName"]["en"];
            if (c.displayNameOnTable) {
                displayName =
                    c.displayNameOnTable[lang] || c.displayNameOnTable["en"];
            }
            if (c.table && !(c.onlyJapanese && lang !== "ja") && (c.columnId === columnKeys.SHARE_ID ? window.pcfIsLoggedIn : true))
                createColumn(
                    displayName,
                    c.type,
                    c["columnId"],
                    category["categoryId"],
                    c.readOnly
                );
        });
    });

    if (customColumns.length > 0) {
        createColumn(translate("Custom"), "title", "Custom", null);
        customColumns.forEach((c) => {
            createColumn(c, "custom", c, "Custom");
        });
        updateStatusOfCategoryCheckBox("Custom");
    }

    function createColumn(colName, type, key, parent, readOnly = false) {
        if (type === "title") {
            let icon;

            switch (key) {
                case columnKeys.CASE_INFO:
                    icon = '<div class="add-column-icon modal-patient"></div>';
                    break;
                case columnKeys.MEDICAL_INFO:
                    icon = '<div class="add-column-icon modal-medical"></div>';
                    break;
                case columnKeys.PHENOTYPE_INFO:
                    icon =
                        '<div class="add-column-icon modal-phenotype"></div>';
                    break;
                case columnKeys.GENOTYPE_INFO:
                    icon = '<div class="add-column-icon modal-gene"></div>';
                    break;
                case columnKeys.FAMILY_INFO:
                    icon = '<div class="add-column-icon modal-family"></div>';
                    break;
                case "sample_info":
                    icon = '<div class="add-column-icon modal-sample"></div>';
                    break;
                case "registration_info":
                    icon =
                        '<div class="add-column-icon modal-registration"></div>';
                    break;
                case "Custom":
                    icon = '<i class="material-symbols-outlined">category</i>';
                    break;
            }
            container.innerHTML += `<div class="add_column_title">
                <input type="checkbox" id="cb_${key}" class="add-column-checkbox" data-id="${key}" onchange="showHideAllColumn(this)">
                ${icon}${colName}
            </div>`;
        } else {
            let dataCol = dataColumns[key];

            if (type === "custom" && dataCol) {
                colName = dataCol.columnName;
            }

            container.innerHTML += `
                <div>
                    <input  type="checkbox"
                            class="modal_add_columns"
                            id="${key}"
                            data-id="${key}"
                            data-type="${type}"
                            data-colname="${colName}"
                            data-category2="${key.charAt(0)}"
                            data-category="${parent}"
                            onchange="showHideColumn(this)"
                            ${existingColumns.includes(key) ? "checked" : ""}>
                    <label class="add-column-label ${readOnly ? "readOnly" : ""
                }" for="${key}">${colName}</label>
                    ${type === "custom"
                    ? `<div class="list-icon list-delete add-custom-column" data-colname="${colName}" data-id="${key}" onclick="removeCustomColumn(this)"></div>`
                    : ""
                }
                </div>
            `;
        }
    }

    document.querySelector(".add").onclick = () => {
        if (add.value === "") return;

        customColumnCount += 1;
        let colId = `custom_${`${customColumnCount}`.padStart(3, "0")}`;

        let column = {
            data: colId,
            type: "text",
            className: "htMiddle",
            renderer: "customRenderer",
        };

        dataSchema[colId] = null;
        dataColumns[colId] = {
            column: column,
            columnName: add.value,
        };
        columns.push(column);
        existingColumns.push(colId);
        customColumns.push(colId);
        createColumn(add.value, "custom", colId);

        contentData.map((c) => (c[colId] = null));

        rerenderTable();

        modal.style.display = "none";
        hot.scrollViewportTo({ col: hot.countCols() - 1 });
    };

    function closeAddColumnModal() {
        modal.style.display = "none";
    }

    categories.forEach((category) => {
        updateStatusOfCategoryCheckBox(category.categoryId);
    });
}

function showHideAllColumn(e) {
    let categoryKey = e.dataset.id;

    if (e.checked) {
        let elements = $(`input[data-category='${categoryKey}']:not(:checked)`);
        elements.each((i, c) => {
            showColumn(c.id);
        });
        rerenderTable();
        hot.scrollViewportTo({ col: hot.countCols() - 1 });
    } else {
        let elements = $(`input[data-category='${categoryKey}']:checked`);
        elements.each((i, c) => {
            hideColumn(c.id);
        });

        rerenderTable();
    }

    $(`input[data-category='${categoryKey}']`).prop("checked", e.checked);
}

function showHideColumn(e) {
    if (e.checked) {
        showColumn(e.dataset.id);
        rerenderTable();
        hot.scrollViewportTo({ col: hot.countCols() - 1 });
    } else {
        hideColumn(e.dataset.id);
        rerenderTable();
    }
    updateStatusOfCategoryCheckBox(e.dataset.category);
}

// 一覧表にshare idが表示されていなければ一番左にshare idを表示
function addShareIdColumn() {
    const col = dataColumns[columnKeys.SHARE_ID];
    if (!existingColumns.includes(columnKeys.SHARE_ID)) {
        existingColumns.unshift(columnKeys.SHARE_ID);
        columns.splice(actions.length, 0, col.column);
        rerenderTable();
        hot.scrollViewportTo({ col: actions.length });
    }
}

function updateStatusOfCategoryCheckBox(categoryKey) {
    let uncheckedElements = $(
        `input.modal_add_columns[data-category='${categoryKey}']:not(:checked)`
    );
    $(`input.add-column-checkbox[data-id='${categoryKey}']`).prop(
        "checked",
        uncheckedElements.length === 0
    );
}

function showColumn(colId) {
    let col = dataColumns[colId];

    existingColumns.push(colId);
    columns.push(col.column);
}

function hideColumn(colId) {
    columns = columns.filter((h) => {
        return h.data !== colId && h.columnId !== colId;
    });

    existingColumns.splice(existingColumns.indexOf(colId), 1);
}

function removeCustomColumn(e) {
    let id = e.dataset.id;
    delete dataSchema[id];
    delete dataColumns[id];

    customColumns.splice(customColumns.indexOf(id), 1);

    let isVisible = existingColumns.indexOf(e.dataset.id) > 0;

    if (isVisible) {
        showHideColumn(e);
    }

    contentData.forEach((d) => delete d[id]);

    e.parentElement.remove();
}

function currentTimeString() {
    return new Date().toLocaleString("ja-JP");
}

function addRow(data) {
    let temp = JSON.parse(JSON.stringify(newData));
    temp.case_created_at = currentTimeString();
    temp.case_updated_at = temp.case_created_at;

    let d = new Date();
    let pcfNo = `P${d.getFullYear()}${d.getMonth() + 1
        }${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}${d.getMilliseconds()}`;

    // Add random suffix with 5 alpha-numeric characters
    pcfNo += Math.random().toString(36).substring(2, 7);

    temp.PCFNo = pcfNo;

    let num = caseCount ? parseInt(caseCount) + 1 : hot.countRows() + 1;
    temp[columnKeys.CASE_ID] = `C${num.toString().padStart(7, 0)}`;

    caseCount = num;
    count++;

    if (data) {
        for (let [k, v] of Object.entries(data)) {
            temp[k] = v;
        }
    }

    updateTable([temp]);
    hot.scrollViewportTo({ row: hot.countRows() - 1, col: actions.length });
}

async function updateTable(data, changeHeaders) {
    data.forEach((row) => {
        // Translate if possible
        if (typeof row === "object") {
            Object.keys(row).forEach((columnId) => {
                // For grouped input
                if (Array.isArray(row[columnId])) {
                    let newValues = row[columnId];
                    for (let i = 0; i < newValues.length; i++) {
                        if (Array.isArray(newValues[i])) {
                            // For nestedly grouped input
                            for (let j = 0; j < newValues[i].length; j++) {
                                let value = newValues[i][j];
                                let translatedValue =
                                    dataValueToNameMap?.[columnId]?.[value];
                                if (translatedValue) {
                                    newValues[i][j] = translatedValue;
                                }
                            }
                        }
                        let value = row[columnId][i];
                        let translatedValue =
                            dataValueToNameMap?.[columnId]?.[value];
                        if (translatedValue) {
                            newValues[i] = translatedValue;
                        }
                    }
                    row[columnId] = newValues;
                }
                if (typeof row[columnId] === "string") {
                    let translatedValue =
                        dataValueToNameMap?.[columnId]?.[row[columnId]];
                    if (translatedValue) row[columnId] = translatedValue;
                }
            });
            contentData.push(row);
        }
    });

    if (contentData.length > 0) {
        let newHeaders = Object.keys(data[0]);

        if (
            changeHeaders === "text/csv" ||
            changeHeaders === "text/tab-separated-values"
        ) {
            columns.splice(2, columns.length);
            existingColumns = [];
            customColumns = [];

            newHeaders.forEach((h) => {
                if (h === "PCFNo") return;
                createColumn(h);
            });
        } else {
            newHeaders.forEach((h) => {
                if (h === "PCFNo") return;
                if (!Object.keys(dataColumns).includes(h))
                    createColumn(h, true);
            });
        }
    }

    function createColumn(h, isHidden) {
        let headerData = {
            data: h,
            type: "text",
            readOnly: false,
        };

        let colData = dataColumns[h];
        if (colData) {
            headerData = colData["column"];
        } else {
            if (!additionalData.includes(h)) customColumns.push(h);
            dataColumns[h] = {
                column: headerData,
                columnName: h,
            };
        }

        if (isHidden) return;

        columns.push(headerData);
        existingColumns.push(h);
    }

    let autoColumnSize = hot.getPlugin("autoColumnSize");

    Object.assign(updateSettings, {
        data: contentData,
        colHeaders: getColumnHeaders(),
        columns: columns,
        colWidths: function (index) {
            if (index < 2) {
                return 40;
            } else {
                autoColumnSize.calculateColumnsWidth(index, 0, true);
                return autoColumnSize.getColumnWidth(index);
            }
        },
    });

    contentData.map((d) => {
        let groupId = d[columnKeys.CASE_GROUP];
        if (groupId && !groupOptions.includes(groupId))
            groupOptions.push(groupId);

        let familyId = d[columnKeys.CASE_FAMILY_ID];
        if (familyId && !familyOptions.includes(familyId))
            familyOptions.push(familyId);
    });

    hot.updateSettings(updateSettings);
    hot.render();

    document.getElementById("row_count").innerHTML = `${hot.countRows()}`;
}

function importFile(event) {
    let file = event.target.files[0];
    readFile(file, file.type, event.target.id === "import_btn");
    event.target.value = "";
}

function onDragOver(event) {
    event.preventDefault();
    if (event.dataTransfer.length) event.dataTransfer.dropEffect = "move";
}

function onDrop(event) {
    event.preventDefault();
    if (document.getElementById("modal-karte").style.display === "block")
        return;

    let file = event.dataTransfer.items[0].getAsFile();
    readFile(file, file.type, true);
}

function loadData(data, overwrite, fileType) {
    if (overwrite) {
        contentData = [];

        Object.assign(updateSettings, {
            data: contentData,
        });

        caseCount = 0;

        hot.updateSettings(updateSettings);
        hot.render();
    }

    if (caseCount) {
        let currentCount = parseInt(caseCount);
        caseCount = currentCount + (data.caseCount || data.CASES.length);
    } else {
        caseCount = data.caseCount || data.CASES.length;
    }

    updateTable(data.CASES, fileType);
    createChart();

    if (data.visibleColumns) {
        columns.length = 2;
        existingColumns = [];

        // 未ログイン時はshare idの列を表示しない
        if (!window.pcfIsLoggedIn) {
            data.visibleColumns = data.visibleColumns.filter(c => c !== columnKeys.SHARE_ID);
        }

        data.visibleColumns.forEach((vc) => {
            columns.push(dataColumns[vc]["column"]);
            existingColumns.push(vc);
        });

        rerenderTable();
    }
}

const isPhenopacketFormat = data => {
    if (!data) return;
    return Object.keys(data).includes('subject');
}

const isPhenopacketFamilyFormat = data => {
    if (!data) return;
    return Object.keys(data).includes('proband');
}

function formatDate(dateInput, format = "YYYY/MM/DD HH:mm:ss") {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    const tokens = {
        YYYY: date.getFullYear(),
        MM: String(date.getMonth() + 1).padStart(2, '0'),
        M: date.getMonth() + 1,
        DD: String(date.getDate()).padStart(2, '0'),
        D: date.getDate(),
        HH: String(date.getHours()).padStart(2, '0'),
        H: date.getHours(),
        mm: String(date.getMinutes()).padStart(2, '0'),
        m: date.getMinutes(),
        ss: String(date.getSeconds()).padStart(2, '0'),
        s: date.getSeconds(),
    };
    return format.replace(/YYYY|MM|M|DD|D|HH|H|mm|m|ss|s/g, match => tokens[match]);
}

// アッパースネークケースをタイトルケースに変換
const formatToTitleCase = input => {
    if (!input) return "";
    return input
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function detectLanguage(text) {
    const jaRegex = /[\u3040-\u30FF\u31F0-\u31FF\uFF66-\uFF9F]/; // ひらがな・カタカナ
    const koRegex = /[\uAC00-\uD7AF]/; // ハングル
    const zhRegex = /[\u4E00-\u9FFF]/; // 漢字（中/日/韓 共通）
    const zhchtHints = /[繁體臺灣香港]/; // 繁体字特有語彙

    if (jaRegex.test(text)) return 'ja';
    if (koRegex.test(text)) return 'ko';
    if (zhRegex.test(text)) {
        if (zhchtHints.test(text)) return 'zhcht'; // 繁体っぽい文字を優先的に判断
        return 'zh'; // 簡体字 or その他
    }

    // 半角英字が多いなら英語とみなす
    const enRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
    if (enRatio > 0.6) return 'en';

    return null;
}

const generatePhenopacketObj = (person, familyId, relationship = "") => {
    const subject = person.subject;
    const generateSex = phSex => {
        if (!phSex) return "unknown";
        if (phSex === "OTHER_SEX") return "other";
        if (phSex === "UNKNOWN_SEX") return "unknown";
        return phSex.toLowerCase();
    }
    const interpretation = Array.isArray(person.interpretations) ? person.interpretations[0] : person.interpretation;
    const expressionsValues = interpretation?.diagnosis?.genomicInterpretations?.flatMap(g => {
        if (!Array.isArray(g?.variationDescriptor?.expressions)) return [];
        return [g?.variationDescriptor?.expressions[0]?.value.split(":")] || [];
    })
    const case_name_of_inputter = person.metaData.createdBy.split(" ");
    const [case_first_name_of_inputter, ...case_family_name_of_inputter] = case_name_of_inputter;
    const case_age = subject.timeAtLastEncounter?.age?.iso8601duration || null;
    const d = new Date();
    const pcfNo = `P${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}${d.getMilliseconds()}`;

    return {
        "case_family_id": familyId || null,
        "case_id": person.id || subject.id || "",
        "case_relationship": relationship || null,
        "case_life_status": subject.vitalStatus?.status
            ? subject.vitalStatus.status.toLowerCase()
            : "unknown",
        "case_birth": subject.dateOfBirth?.timestamp ? formatDate(subject.dateOfBirth.timestamp, 'YYYY/MM') : null,
        "case_death": (subject.vitalStatus?.timeOfDeath?.timestamp)
            ? formatDate(subject.vitalStatus.timeOfDeath.timestamp, 'YYYY/MM')
            : null,
        "case_age_on_examination": case_age?.startsWith('P') ? case_age.slice(1) : case_age,
        "case_sex": generateSex(subject.sex),
        "medical_case_solved": interpretation?.progressStatus || 'UNKNOWN_PROGRESS',
        "phenotype_hpo_id": person.phenotypicFeatures?.flatMap(f => [f.type?.id] || []) || [],
        "phenotype_hpo_label": person.phenotypicFeatures?.flatMap(f => {
            if (!f.type?.label) return []
            const lang = detectLanguage(f.type.label)
            return detectLanguage ? [{ [`name_${lang}`]: f.type.label }] : []
        }) || [],
        "phenotype_resolution": person.phenotypicFeatures?.flatMap(f => [f.resolution?.age?.iso8601duration?.replace('P', '')] || []) || [],
        "medical_body_weight_at_examination": person.measurements?.flatMap(m => {
            if (m.assay?.id === "NCIT:C182174" && m.value?.quantity?.value) {
                return [m.value.quantity.value.toString()];
            }
            return [];
        }) || [],
        "medical_body_height_at_examination": person.measurements?.flatMap(m => {
            if (m.assay?.id === "NCIT:C164634" && m.value?.quantity?.value) {
                return [m.value.quantity.value.toString()];
            }
            return [];
        }) || [],
        "medical_head_circumference_at_examination": person.measurements?.flatMap(m => {
            if (m.assay?.id === "NCIT:C81255" && m.value?.quantity?.value) {
                return [m.value.quantity.value.toString()];
            }
            return [];
        }) || [],
        "medical_body_info_date_at_examination": [...new Set(person.measurements?.flatMap(m => {
            return m.timeObserved?.timestamp ? [m.timeObserved.timestamp.replace(/\//g, '-')] : [];
        }))],
        "genotype_analysis": interpretation?.summary || "",
        "genotype_status": interpretation?.diagnosis?.genomicInterpretations?.flatMap(d => {
            return d.interpretationStatus ? [formatToTitleCase(d.interpretationStatus)] : [];
        }) || [],
        "genotype_cdna_change": expressionsValues?.map(([cdna, _transcript]) => cdna) || [],
        "genotype_transcript": expressionsValues?.map(([_cdna, transcript]) => transcript) || [],
        "genotype_pathogenicity": interpretation?.diagnosis?.genomicInterpretations?.flatMap(d => {
            if (!d?.variantInterpretation?.acmgPathogenicityClassification) return [];
            return [d.variantInterpretation.acmgPathogenicityClassification];
        }) || [],
        "genotype_gene": interpretation?.diagnosis?.genomicInterpretations?.flatMap(d => {
            if (!d?.gene?.symbol) return [];
            return [d.gene.symbol];
        }) || [],
        "genotype_allelic_state": interpretation?.diagnosis?.genomicInterpretations?.flatMap(d => {
            if (!d?.variationDescriptor?.allelicState?.label) return [];
            return [d.variationDescriptor.allelicState.label];
        }) || [],
        "genotype_chr_position": interpretation?.diagnosis?.genomicInterpretations?.flatMap(d => {
            if (!d?.variationDescriptor?.vcfRecord?.chrom || !d?.variationDescriptor?.vcfRecord?.pos) return [];
            return [`${d.variationDescriptor.vcfRecord.chrom}:${d.variationDescriptor.vcfRecord.pos}`];
        }) || [],
        "genotype_reference": interpretation?.diagnosis?.genomicInterpretations?.flatMap(d => {
            if (!d?.variationDescriptor?.vcfRecord) return [];
            return [d.variationDescriptor.vcfRecord.genomeAssembly] || [];
        }) || [],
        "genotype_annotation": interpretation?.diagnosis?.genomicInterpretations?.flatMap(d => {
            if (!d?.variationDescriptor?.structuralType?.id) return [];
            const matchedObj = annotationMap.find(obj => {
                return obj.priorityFlag && obj.ontologyClassId === d.variationDescriptor.structuralType.id;
            })
            const annotation = matchedObj ? matchedObj.annotation : null;
            return annotation ? [annotation] : [];
        }) || [],
        "case_created_at": formatDate(person.metaData.created, 'YYYY/M/D HH:mm:ss') || "",
        "case_first_name_of_inputter": case_first_name_of_inputter || null,
        "case_family_name_of_inputter": case_family_name_of_inputter.join('') || null,
        // 以降Phenopacketには直接ないのでdefault値
        "case_updated_at": "",
        "case_age": null,
        "case_group": null,
        "case_examination_day": null,
        "case_note": null,
        "medical_chief_complaint": null,
        "medical_age_onset": null,
        "medical_current_history": null,
        "medical_previous_history": null,
        "PCFNo": pcfNo,
        "case_parent_id": null,
        "case_spouse_id": null,
        "case_sympton": null,
        "medical_prenatal_perinatal_history": null,
        "medical_early_developmental_and_schooling_history": null,
        "medical_process": null,
        "medical_medications": null,
        "medical_allergies": null,
        "medical_social_history": null,
        "medical_drinking": null,
        "medical_travel_history": null,
        "medical_vaccination_history": null,
        "medical_physical_findings": null,
        "medical_examination_findings": null,
        "phenotype_medical_current_history": [],
        "phenotype_medical_previous_history": [],
        "phenotype_process": [],
        "phenotype_family_history": [],
        "phenotype_excluded": [],
        "phenotype_clinical_relevance": [],
        "phenotype_severity": [],
        "phenotype_temporal_pattern": [],
        "phenotype_pace_progression": [],
        "phenotype_comments": [],
        "genotype_protein_charge": [],
        "genotype_inheritance": [],
        "genotype_comments": [],
        "phenotype_age_onset": [],
        "family_history": null,
        "family_mode_inheritance": null,
        "family_other_affected_relatives": "unknown",
        "family_consanguinity": "unknown",
        "family_paternal_ethnicity": null,
        "family_maternal_ethnicity": null,
        "case_participation_of_relatives_in_this_study": "not_applicable",
        "case_sex_details": null,
        "case_cause_of_death": null,
        "case_cause_of_death_details": null,
        "case_icd_11_code_of_cause_of_death": null,
        "case_last_date_of_confirmation_of_survival": null,
        "case_ethnicity_group": null,
        "case_free_comment_about_ethnicity_group": null,
        "case_country_of_birth": null,
        "case_state_of_birth": null,
        "case_city_of_birth": null,
        "case_free_comment_about_birth": null,
        "case_presence_of_prenatal_abnormalities": "unknown",
        "case_presence_of_abnormalities_at_birth": "unknown",
        "case_presence_of_medical_assistance_at_birth": "unknown",
        "case_gestational_age_at_birth": null,
        "case_age_of_mother_at_birth": null,
        "case_age_of_father_at_birth": null,
        "case_presence_of_assisted_reproductive_technology": "unknown",
        "case_type_of_assisted_reproductive_technology": null,
        "case_date_of_survey": null,
        "case_name_of_facility": null,
        "case_code_of_facility": null,
        "case_family_name_of_doctor_in_charge": null,
        "case_first_name_of_doctor_in_charge": null,
        "medical_presence_of_previous_history": "unknown",
        "medical_disease_of_previous_history_id": [],
        "medical_disease_of_previous_history_name": [],
        "medical_note_of_previous_history": null,
        "medical_presence_of_complications": "unknown",
        "medical_complication_history_id": [],
        "medical_complication_history_name": [],
        "medical_note_of_complications": null,
        "medical_complications_history": null,
        "medical_presence_of_pregnancy": "unknown",
        "medical_number_of_pregnancy": null,
        "medical_presence_of_childbirth": "unknown",
        "medical_number_of_childbirth": null,
        "medical_presence_of_miscarriage_or_stillbirth": "unknown",
        "medical_number_of_stillbirth": null,
        "medical_number_of_miscarriage": null,
        "medical_number_of_artificial_abortion": null,
        "medical_presence_of_employment": "unknown",
        "medical_occupational_classification": null,
        "medical_occupational_classification_other_details": null,
        "medical_body_height_at_birth": null,
        "medical_body_weight_at_birth": null,
        "medical_head_circumference_at_birth": null,
        "medical_body_height_at_registration": null,
        "medical_body_weight_at_registration": null,
        "medical_head_circumference_at_registration": null,
        "medical_age_at_measurement": null,
        "medical_presence_of_drinking_habits": "unknown",
        "medical_presence_of_smoking_habits": "unknown",
        "medical_number_of_smoking": null,
        "medical_years_of_smoking": null,
        "medical_suspected_disease_id": [],
        "medical_suspected_disease_name": [],
        "medical_suspection_of_genetic_disease": "unknown",
        "medical_presence_of_familiality": "unknown",
        "medical_symptoms_related_within_family_lineage": null,
        "presence_of_multisystem_disorder": "unknown",
        "medical_disease_area": null,
        "medical_disease_area_details": null,
        "medical_confirmation_of_clinical_diagnosis": "unknown",
        "medical_clinical_diagnosis_id": [],
        "medical_clinical_diagnosis_name": [],
        "medical_clinical_diagnosis_date": [],
        "medical_final_diagnosis_id": [],
        "medical_final_diagnosis_name": [],
        "medical_final_diagnosis_date": [],
        "medical_presence_of_designated_intractable_disease_certification": "not_applied",
        "medical_applied_intractable_disease_id": [],
        "medical_applied_intractable_disease_name": [],
        "medical_presence_of_pediatric_chronic_specific_disease_certification": "not_applied",
        "medical_applied_pediatric_disease_id": [],
        "medical_applied_pediatric_disease_name": [],
        "genotype_presence_of_genetic_testing": "unknown",
        "genotype_presence_of_abnormalities_in_genetic_testing": "unknown",
        "genotype_date_of_testing": [],
        "genotype_testing_company_name": [],
        "genotype_testing_company_name_other_details": [],
        "genotype_type_of_testing": [],
        "genotype_testing_other_details": [],
        "genotype_result_of_testing": [],
        "genotype_ncbi_gene_id": [],
        "genotype_ensembl_id": [],
        "family_presence_of_onset_in_family": "unknown",
        "family_presence_of_miscarriage_or_stillbirth_of_mother": "unknown",
        "family_number_of_stillbirth_of_mother": null,
        "family_number_of_miscarriage_of_mother": null,
        "family_number_of_artificial_abortion_of_mother": null,
        "family_relative_name": [],
        "family_generation_number_of_relative": [],
        "family_presence_of_genetic_cancer_testing": [],
        "family_genetic_cancer_testing_result_file": [],
        "family_presence_of_cancer_history": [],
        "family_cancer_history_cancer_type": [],
        "family_cancer_history_cancer_type_other_details": [],
        "family_cancer_history_age_of_onset": [],
        "family_presence_of_lifestyle_disease_history": [],
        "family_lifestyle_disease_history": [],
        "family_lifestyle_disease_history_other_details": [],
        "family_consanguinity_of_parents": "unknown",
        "family_family_tree_pdf": null,
        "family_date_of_family_tree": null,
        "family_generation_number_of_proband": null,
        "sample_sampling_date": null,
        "sample_id": null,
        "sample_presense_of_treatment_drug_at_sampling": "unknown",
        "sample_type": null,
        "sample_type_other_detail": null,
        "sample_prescription": [],
        "sample_route_of_administration": [],
        "sample_yj_code": [],
        "sample_test_date": null,
        "sample_wbc": null,
        "sample_rbc": null,
        "sample_hemoglobin": null,
        "sample_hematocrit": null,
        "sample_plt": null,
        "sample_tp": null,
        "sample_alb": null,
        "sample_t_bil": null,
        "sample_alp": null,
        "sample_ast_got": null,
        "sample_alt_gpt": null,
        "sample_ldh": null,
        "sample_ck": null,
        "sample_gamma_gtp": null,
        "sample_cre": null,
        "sample_ua": null,
        "sample_bun": null,
        "sample_amy": null,
        "sample_t_cho": null,
        "sample_tg": null,
        "sample_ldl_cho": null,
        "sample_hdl_cho": null,
        "sample_na": null,
        "sample_k": null,
        "sample_ip": null,
        "sample_cl": null,
        "sample_ca": null,
        "sample_crp": null,
        "sample_glu": null,
        "sample_hba1c": null,
        "sample_test_item": [],
        "sample_test_value": [],
        "sample_test_unit": [],
        "registration_disease_name": null,
        "registration_diagnosis_status": "not_applicable",
        "registration_age_group": "not_applicable",
        "registration_genetic_status": "not_applicable",
        "registration_affection": "not_applicable",
        "registration_note": null,
        "registration_consent_form_type": "not_applicable",
        "registration_consent_acquirer": "not_applicable",
        "registration_proxy_relation": null,
        "registration_proxy_relation_other": null,
        "registration_consent_form_version": null,
        "registration_ascent": "unknown",
        "registration_ascent_version": null,
        "registration_consent_acquisition_date": null,
        "registration_consent_withdrawal": "unknown",
        "registration_consent_withdrawer": "not_applicable",
        "registration_proxy_relation_withdrawer": null,
        "registration_proxy_relation_withdrawer_other_details": null,
        "registration_consent_withdrawal_version": null,
        "registration_ascent_withdrawer": "unknown",
        "registration_ascent_withdrawal_version": null,
        "registration_consent_withdrawal_date": null
    };
}

const convertPhenopacketToCaseSharingData = (phenopacketData) => {
    let proband = {};
    let family_id = "";
    const isTypeFamily = isPhenopacketFamilyFormat(phenopacketData);
    let relatives = [];
    if (isTypeFamily) {
        proband = phenopacketData.proband || {};
        family_id = phenopacketData.id;
        if (phenopacketData.relatives?.length > 0) {
            relatives = phenopacketData.relatives.map(relative => {
                return generatePhenopacketObj(relative, family_id);
            });
        }
    } else {
        proband = phenopacketData || {};
    }
    const caseSharingObj = generatePhenopacketObj(proband, family_id, "proband_individual");
    let cases = [caseSharingObj, ...(relatives.length > 0 ? relatives : [])];
    if (phenopacketData.pedigree?.persons.length > 0) {
        cases = cases.map(caseObject => {
            caseObject["case_presence_or_absence_of_onset"] = 'unknown';
            // 発症の有無
            const targetPerson = phenopacketData.pedigree.persons.find(person => person.individual_id === caseObject.case_id);
            if (targetPerson?.affectedStatus) {
                const matchedEntry = Object.entries(phenopacketAffectedStatusMap).find(
                    ([_, value]) => value === targetPerson.affectedStatus
                );
                if (matchedEntry) {
                    const [matchedKey] = matchedEntry;
                    caseObject["case_presence_or_absence_of_onset"] = matchedKey;
                }
            }
            return caseObject;
        });
    }
    return {
        "CASES": cases,
        "keyName": {}
    };
}

function loadJsonData(data, overwrite, fileType) {
    if (fileType === "application/x-yaml") data = YAML.parse(data);
    if (typeof data === "string") data = JSON.parse(data);

    customColumnCount = 0;
    customColumns = [];

    if (isPhenopacketFamilyFormat(data) || isPhenopacketFormat(data)) {
        data = convertPhenopacketToCaseSharingData(data);
    }

    for (let [k, v] of Object.entries(data.keyName)) {
        dataSchema[k] = null;
        dataColumns[k] = {
            column: {
                data: k,
                type: "text",
                className: "htMiddle",
                renderer: "customRenderer",
            },
            columnName: v,
        };
        customColumnCount += 1;
        customColumns.push(k);
    }
    loadData(data, overwrite);
}

function readFile(file, fileType, overwrite) {
    const translatedConfirmText = translate(overwrite ? "confirm-file-import" : "confirm-file-merge");
    if (!confirm(translatedConfirmText)) return;
    let reader = new FileReader();
    currentFileName = file.name;
    reader.onload = (event) => {
        let data = event.target.result;
        loadJsonData(data, overwrite, fileType);
    };
    reader.readAsText(file);
    hot.clearUndo();
    filtersPlugin.clearConditions();
    updateUndoRedoButtonAvailable();
}

function convertCSVToJSON(csv, isExport) {
    let json = Papa.parse(csv, {
        headers: true,
        delimiter: "",
    });

    let patientsData = [];
    let inputData = json.data;
    let notIncluded = [0, 1];
    let colHeadears = inputData[0];

    let columnsInGroup = {}; // Map [columnId] => [groupKey]
    categories.forEach((category) => {
        category.columns.forEach((c) => {
            if (c.groupBy) {
                columnsInGroup[c.columnId] = c.groupBy;
            }
        });
    });

    inputData.forEach((d, idx) => {
        let data = {};
        if (idx > 0) data["PCFNo"] = d[0];

        for (let i = 0; i < d.length; i++) {
            if (isExport) {
                if (notIncluded.includes(i)) continue;
            }

            if (idx === 0) continue;

            let headerText =
                dataColumns[existingColumns[i - notIncluded.length]]
                    ?.columnName;
            let columnId = getColumnId(headerText);

            let value = d[i];

            if (isExport && columnsInGroup[columnId]) {
                let groupId = columnsInGroup[columnId];
                if (contentData.length > 0) {
                    let groupInfo = contentData[idx - 1][groupId];
                    if (groupInfo) {
                        value = groupInfo[groupInfo.length - 1][columnId];
                    } else {
                        value = "";
                    }
                }
            }

            data[isExport ? headerText : columnId] = value;
        }

        if (Object.keys(data).length > 0) {
            patientsData.push(data);
        }
    });

    return { CASES: patientsData };
}

function getColumnId(columnHeader) {
    let colId;
    categories.forEach((category) => {
        let col = category.columns?.filter((c) => {
            return c.displayName[lang] == columnHeader;
        });
        if (col && col.length > 0) return (colId = col[0].columnId);
    });

    if (!colId) colId = getKeyFromTranslation(elementTranslation, columnHeader);

    return colId || columnHeader;
}

function getKeyFromTranslation(obj, val) {
    return Object.keys(obj).find((key) =>
        !(typeof obj[key] === "object")
            ? obj[key] === val
            : getKeyFromTranslation(obj[key], val)
    );
}

// Map [columnId] => [name in current language] => [dataValue] for type = 'dropdown' or inputType = 'multi-checkbox' columns
let nameToDataValueMap = {};

// Reversed version of nameToDataValueMap: [columnId] => [dataValue] => [name in current language]
let dataValueToNameMap = {};

for (let category of categories) {
    for (let column of category.columns) {
        if (column.inputType === "number-with-unknown") {
            nameToDataValueMap[column.columnId] = {};
            nameToDataValueMap[column.columnId][translate("unknown")] =
                "unknown";
            dataValueToNameMap[column.columnId] = {
                unknown: translate("unknown"),
            };
            continue;
        } else if (
            (column.type !== "dropdown" &&
                column.inputType !== "multi-checkbox" &&
                column.inputType !== "select" &&
                column.inputType !== "checkbox") ||
            !column.options
        )
            continue;
        nameToDataValueMap[column.columnId] = {};
        dataValueToNameMap[column.columnId] = {};
        let optionsInLang = column.options[lang] || column.options["en"];
        optionsInLang.forEach((optionName, index) => {
            if (column.options.dataValue?.[index]) {
                nameToDataValueMap[column.columnId][optionName] =
                    column.options.dataValue[index];
                dataValueToNameMap[column.columnId][
                    column.options.dataValue[index]
                ] = optionName;
            }
        });
    }
}
function getExportData() {
    $(".save-panel").toggleClass("save-panel-open");

    let type = document.getElementById("dl-select").value;
    let isAll = type === "json";

    let dlData;

    if (isAll) {
        dlData = contentData;
    } else {
        alert(
            "Only the data in the table will be downloaded. Please select the json format if you want to edit this data in this system in the future."
        );

        let exportedString = exportPlugin.exportAsString("csv", {
            bom: false,
            columnDelimiter: "\t",
            columnHeaders: true,
            exportHiddenColumns: isAll,
            exportHiddenRows: isAll,
            rowHeaders: false,
            fileExtension: "tsv",
        });

        dlData = convertCSVToJSON(exportedString, true);
    }

    if (type === "json") exportedString = getJSONDownload(dlData);
    if (type === "csv") exportedString = Papa.unparse(dlData.CASES);
    if (type === "tsv")
        exportedString = Papa.unparse(dlData.CASES, { delimiter: "\t" });

    exportFile(type, exportedString);
}

function getJSONDownload(dlData) {
    let jsonResult = {};
    let patientsData = [],
        visibleColumns = [],
        keyName = {};

    dlData.forEach((d, idx) => {
        let pData = {};
        for (let [k, v] of Object.entries(d)) {
            if (k.split("_")[0] === "custom") {
                keyName[k] = dataColumns[k].columnName;
            }
            if (nameToDataValueMap[k] && typeof v === "string") {
                // Translate to dataValue if possible
                v = nameToDataValueMap[k][v] || v;
            } else if (Array.isArray(v)) {
                // Translate to dataValue if possible
                v = v.map((value) => {
                    // For nested array
                    if (Array.isArray(value)) {
                        return value.map(
                            (v) => nameToDataValueMap[k]?.[v] || v
                        );
                    }
                    return nameToDataValueMap[k]?.[value] || value;
                });
            }

            pData[k] = v;
        }

        patientsData.push(pData);
    });

    existingColumns.forEach((c) => {
        visibleColumns.push(c);
    });

    jsonResult = {
        CASES: patientsData,
        visibleColumns,
        keyName,
        lang,
        caseCount: caseCount,
    };

    return jsonResult;
}

function getFileNameSuffix() {
    let d = new Date();

    function addZero(number) {
        return String(number).padStart(2, "0");
    }

    return `${d.getFullYear()}${addZero(d.getMonth() + 1)}${addZero(
        d.getDate()
    )}${addZero(d.getHours())}${addZero(d.getMinutes())}`;
}

function removeExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

function exportFile(type, file, options = {}) {
    // JSON形式での保存処理を変更
    if (type === "json") {
        // JSONデータ文字列
        let jsonString = JSON.stringify(file, null, 4);

        // デフォルトのファイル名を設定
        let filename;
        if (currentFileName) {
            filename = currentFileName;
        } else {
            filename = `patients_${getFileNameSuffix()}.${type}`;
            currentFileName = filename;
        }

        // 拡張子が正しいか確認
        if (filename.indexOf('.json') === -1) {
            filename = filename + '.json';
        }

        // File System Access APIが利用可能な場合（Chrome 86+、Edge 86+）
        if ('showSaveFilePicker' in window) {
            const saveFile = async () => {
                try {
                    const opts = {
                        suggestedName: filename,
                        types: [{
                            description: 'JSON Files',
                            accept: { 'application/json': ['.json'] },
                        }],
                    };

                    // 「名前を付けて保存」ダイアログを表示
                    const fileHandle = await window.showSaveFilePicker(opts);
                    const writable = await fileHandle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                } catch (err) {
                    return;
                }
            };

            saveFile();
            return;
        }

        // フォールバック保存方法
        saveFallback();

        function saveFallback() {
            // JSONデータをBlobオブジェクトとして作成
            let jsonBlob = new Blob([jsonString], { type: 'application/json' });

            // IEおよびEdge用のmsSaveOrOpenBlob API
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(jsonBlob, filename);
                return;
            }

            // 他のブラウザでは通常のダウンロードメカニズムを使用
            const blobUrl = URL.createObjectURL(jsonBlob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // URL解放
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        }

        return;
    }

    // CSV/TSV形式の場合は既存の処理を使用
    let a = document.createElement("a");

    // ファイル名の設定
    if (currentFileName) {
        // 元のファイル拡張子を新しいタイプに置き換える
        const extensionRegex = /\.[^/.]+$/;
        if (extensionRegex.test(currentFileName)) {
            a.download = currentFileName.replace(extensionRegex, `.${type}`);
        } else {
            a.download = `${currentFileName}.${type}`;
        }
    } else {
        a.download = `patients_${getFileNameSuffix()}.${type}`;
    }

    a.style.visibility = "hidden";

    let data =
        `text/json;charset=utf-8,` +
        `${encodeURIComponent(JSON.stringify(file, null, 4))}`;
    a.href = `data:${data}`;

    if (type === "csv" || type === "tsv") {
        let data = new Blob(["\ufeff" + file], {
            type: "text/csv;charset=utf-8;",
        });
        a.href = URL.createObjectURL(data);
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function editTable(isSave) {
    toReset = true;
    if (!isSave) {
        return resetData();
    }

    // new patient
    if (!currentPatient) {
        let elements = document.querySelectorAll(
            `.tab-wrap input, .tab-wrap select, .tab-wrap textarea`
        );

        let newPatient = {};
        elements.forEach((e) => {
            //add by hzhang@bits start
            if (!("columnname" in e.dataset)) return;
            //add by hzhang@bits end
            if (e.type === "radio") {
                newPatient[e.dataset.columnname] =
                    $(`input[name="${e.name}"]:checked`).val() || null;
            } else {
                let value = e.value;
                if (
                    e.dataset.columnname === columnKeys.CASE_BIRTH ||
                    e.dataset.columnname === columnKeys.CASE_DEATH
                ) {
                    let pre = e.dataset.columnname;
                    value = `${document.querySelector(
                        `.tab-wrap *[name="${pre}_year"]`
                    ).value
                        }/${document.querySelector(
                            `.tab-wrap *[name="${pre}_month"]`
                        ).value
                        }`;
                    if (value === "0/0") value = "";
                } else if (
                    e.dataset.columnname === columnKeys.CASE_EXAMINATION_DAY
                ) {
                    let col = e.dataset.columnname;
                    value = `${document.querySelector(
                        `.tab-wrap *[name="${col}_year"]`
                    ).value
                        }/${document.querySelector(
                            `.tab-wrap *[name="${col}_month"]`
                        ).value
                        }/${document.querySelector(`.tab-wrap *[name="${col}_day"]`)
                            .value
                        }`;
                    if (value === "0/0/0") value = "";
                } else if (e.dataset.columnname === columnKeys.CASE_FAMILY_ID) {
                    if (!familyOptions.includes(value))
                        familyOptions.push(value);
                } else if (e.dataset.columnname === columnKeys.CASE_GROUP) {
                    if (!groupOptions.includes(value)) groupOptions.push(value);
                }

                newPatient[e.dataset.columnname] = value;
            }
        });

        syncGroupInputValues(newPatient);

        // add by hzhang@bits start
        Object.keys(phenotypeData).forEach((cid) => {
            newPatient[cid] = phenotypeData[cid];
        });
        // add by hzhang@bits end

        delete newPatient["undefined"];
        addRow(newPatient);
        return;
    }

    // existing patient
    let patientData = contentData.filter((d) => {
        return d.PCFNo == currentPatient;
    })[0];

    syncGroupInputValues(patientData);

    function syncGroupInputValues(patientData) {
        geneDataKey.forEach((k) => {
            patientData[k] = [];
        });

        geneData.forEach((gd) => {
            for (let [k, v] of Object.entries(gd)) {
                patientData[k].push(v);
            }
        });
    }

    // add by hzhang@bits start
    Object.keys(phenotypeData).forEach((cid) => {
        patientData[cid] = phenotypeData[cid];
    });
    // add by hzhang@bits end

    categories.forEach((category) => {
        category.columns.forEach((col) => {
            if (col.inputType === "multi-checkbox") {
                let optionLang =
                    col["options"][lang].length > 0
                        ? col["options"][lang]
                        : col["options"]["en"];
                let checkboxes = Array.from(
                    document.querySelectorAll(`.${col.columnId}-checkbox`)
                );
                if (col.groupBy) {
                    let checkboxGroupIndices = checkboxes.map(
                        (box) => box.dataset.checkboxGroupIndex
                    );
                    // get unique values
                    checkboxGroupIndices = checkboxGroupIndices.filter(
                        (value, index, self) => self.indexOf(value) === index
                    );

                    // FIXME: do not use integer index
                    patientData[col.columnId] = checkboxGroupIndices.map(
                        (index) => {
                            let checkboxGroup = checkboxes.filter(
                                (box) =>
                                    box.dataset.checkboxGroupIndex === index
                            );
                            return checkboxGroup
                                .map((box, i) => {
                                    if (box.checked) return optionLang[i];
                                })
                                .filter((v) => v);
                        }
                    );
                } else {
                    // FIXME: do not use integer index
                    patientData[col.columnId] = checkboxes
                        .map((box, i) => {
                            if (box.checked) return optionLang[i];
                        })
                        .filter((v) => v);
                }
            } else if (
                col.options &&
                category.categoryId === "phenotype_info"
            ) {
                patientData[col.columnId] = patientData[col.columnId].map((v) =>
                    dataValueToTranslated(col.options, v)
                );
            }
        });
    });

    hot.render();
    resetData();

    function resetData() {
        currentPatient = "";
        window.__currentPatientForMatchingForm = "";
        window.dispatchEvent(new CustomEvent('matchingFormPatientChange', { detail: { pcfNo: "" } }));
        // changedData = {}
    }
}

function rerenderTable() {
    Object.assign(updateSettings, {
        dataSchema: dataSchema,
        colHeaders: getColumnHeaders(),
        columns: columns,
    });

    hot.updateSettings(updateSettings);
    hot.render();
}

function beforeLoad() {
    if (contentData.length > 0)
        localStorage.contentData = JSON.stringify(contentData);
    return "load";
}

function addGroupSection(
    parent,
    containerClass,
    column,
    shareHeader,
    onAddClicked,
    label
) {
    let wrapper = document.createElement("div");
    wrapper.classList.add("w-100", "form-container");
    let tr = document.createElement("tr");
    let td = document.createElement("td");
    let addButton = document.createElement("button");

    if (shareHeader) {
        td.classList.add("group-area-container");
    }

    addButton.innerHTML = `
        <span class="group-table-add-row">
            <i class="material-icons-outlined">add_circle_outline</i>${translate(
        "add"
    )}</span>
    `;
    addButton.addEventListener("click", onAddClicked);
    let container = document.createElement("div");
    container.dataset.group = column.groupBy;
    container.classList.add("table-container", containerClass);
    if (label) {
        let groupLabel = document.createElement("th");
        groupLabel.innerText = label[lang] || label["en"];
        wrapper.appendChild(groupLabel);
    }
    td.appendChild(container);
    td.appendChild(addButton);
    wrapper.appendChild(td);
    tr.appendChild(wrapper);
    parent.appendChild(tr);
}

function pageReload() {
    window.location.reload();
}

function highlightElement(element) {
    // Highlight the element temorarily by fadein and fadeout
    element.classList.add("temporary-highlight");
    setTimeout(() => {
        element.classList.add("fade-in");
        setTimeout(() => {
            element.classList.remove("fade-in");
            setTimeout(() => {
                element.classList.remove("temporary-highlight");
            }, 1000);
        }, 500);
    }, 100);
}

function setInitialLanguage() {
    document.getElementById("search_input").placeholder =
        translate("search_input");
    document.querySelector("#add-row span").innerText = translate("add-row");
    document.querySelector("#add-column span").innerText =
        translate("add-column");
    document.querySelector("#add_column_input").placeholder =
        translate("add-column-input");
    document.querySelector(".add").innerText = translate("add-column-button");

    translateModal();

    function translateModal() {
        let container = document.getElementById("tab-wrap");
        container.innerHTML = "";

        let ul = document.createElement("ul");
        container.appendChild(ul);

        categories.forEach((category, i) => {
            let liClass = ["tab-btn"];
            if (i === 0) liClass.push("show", "tab-btn-first");
            if (i === categories.length - 1) liClass.push("tab-btn-last");

            let li = document.createElement("li");
            li.classList.add(...liClass);
            li.innerHTML += `
                <div class="${category.iconClass}"></div>
                <span>${category["displayName"][lang] ||
                category["displayName"]["en"]
                }</span>
            `;
            ul.appendChild(li);

            let divClass = ["tab-contents"];
            if (i === 0) divClass.push("show");

            let categoryHeader = document.createElement("header");
            categoryHeader.classList.add("category-header", "w-100");
            if (i === 0) {
                divClass.push("show");
                categoryHeader.classList.add("show");
            }
            container.appendChild(categoryHeader);
            let sectionNav = document.createElement("nav");
            sectionNav.classList.add("section-nav");
            categoryHeader.appendChild(sectionNav);

            let sectionNavLeftScrollButton = document.createElement("button");
            sectionNavLeftScrollButton.appendChild(
                document.createElement("span")
            );
            sectionNavLeftScrollButton.classList.add(
                "section-nav-scroll-button",
                "section-nav-scroll-button-left"
            );
            categoryHeader.appendChild(sectionNavLeftScrollButton);
            function updateScrollButtonVisibility() {
                // Hide button if it reaches the end
                let scroll = $(sectionNav).scrollLeft();
                let maxScroll = sectionNav.scrollWidth - sectionNav.clientWidth;
                if (scroll >= maxScroll - 1) {
                    $(sectionNavRightScrollButton).hide();
                } else {
                    $(sectionNavRightScrollButton).show();
                }
                if (scroll <= 1) {
                    $(sectionNavLeftScrollButton).hide();
                } else {
                    $(sectionNavLeftScrollButton).show();
                }
            }
            sectionNavLeftScrollButton.addEventListener("click", () => {
                let scroll = $(sectionNav).scrollLeft();
                $(sectionNav).animate(
                    {
                        scrollLeft: scroll - 200,
                    },
                    200,
                    updateScrollButtonVisibility
                );
            });

            let sectionNavRightScrollButton = document.createElement("button");
            sectionNavRightScrollButton.classList.add(
                "section-nav-scroll-button",
                "section-nav-scroll-button-right"
            );
            categoryHeader.appendChild(sectionNavRightScrollButton);
            sectionNavRightScrollButton.appendChild(
                document.createElement("span")
            );

            sectionNavRightScrollButton.addEventListener("click", () => {
                let scroll = $(sectionNav).scrollLeft();
                $(sectionNav).animate(
                    {
                        scrollLeft: scroll + 200,
                    },
                    200,
                    updateScrollButtonVisibility
                );
            });

            let div = document.createElement("div");
            div.classList.add(...divClass);
            div.id = `tab-content-${category.categoryId}`;
            container.appendChild(div);

            let navigationInfos = [];

            function updateNavigationInfos() {
                navigationInfos = [];
                $(".navigation-point").each(function (i, elem) {
                    let navigationButton = $(container).find(
                        `.section-nav-button[data-section=${$(elem).data(
                            "section"
                        )}]`
                    )[0];
                    navigationInfos.push({
                        navigationButton,
                        elem,
                    });
                });
            }

            let scrollTimer = null;
            let activeNavButton = null;

            function highlightNavigationButton(target = null) {
                if (!target && activeNavButton) return;
                let scroll = Math.round($(div).scrollTop());
                const margin = 80;
                $(container).find(".section-nav-button").removeClass("active");

                if (target) {
                    $(target).addClass("active");
                    activeNavButton = target;
                    setTimeout(() => {
                        activeNavButton = null; // Forcibly remember the active button for 1 second
                    }, 1000);
                } else {
                    for (let navigationInfo of navigationInfos) {
                        if (
                            scroll <
                            navigationInfo.elem.offsetTop +
                            navigationInfo.elem.offsetHeight -
                            margin
                        ) {
                            $(navigationInfo.navigationButton).addClass(
                                "active"
                            );
                            clearTimeout(scrollTimer);
                            scrollTimer = setTimeout(() => {
                                navigationInfo.navigationButton.scrollIntoView({
                                    behavior: "smooth",
                                    inline: "center",
                                });
                            }, 100);
                            break;
                        }
                    }
                }
            }

            $(div).scroll((e) => {
                highlightNavigationButton();
            });

            const resizeObserver = new ResizeObserver((entries) => {
                updateNavigationInfos();
                highlightNavigationButton();
                updateScrollButtonVisibility();
            });
            resizeObserver.observe(div);

            li.addEventListener("click", () => {
                $(".show").removeClass("show");
                $(li).addClass("show");
                $(categoryHeader).addClass("show");
                $(div).addClass("show");
                if (category.categoryId === columnKeys.FAMILY_INFO) {
                    updatePedigreeArea();
                }
                // 共有タブを非表示にする
                const matchingFormContentWrapper = document.querySelector(".matchingFormContentWrapper");
                if (matchingFormContentWrapper) {
                    matchingFormContentWrapper.style.display = "none";
                }
            });

            if (i === 2) {
                // modified by hzhang@bits start
                phenotypeInfo_initUI(div);
                // modified by hzhang@bits end
                return;
            }

            let table = document.createElement("table");
            table.classList.add("form-table");
            if (i === 1) table.classList.add("treatment-table");
            if (i === 4) table.classList.add("family-table");
            table.innerHTML = `<tbody id="tbody_${category.categoryId}">`;
            div.appendChild(table);

            function sectionContainerId(sectionName) {
                return `section_${category.categoryId}_${sectionName}`;
            }

            function subsectionContainerId(sectionName, subsectionName) {
                return `subsection_${category.categoryId}_${sectionName}_${subsectionName}`;
            }

            let categoryBody = document.getElementById(
                `tbody_${category.categoryId}`
            );

            category.sections?.forEach((section) => {
                if (section.onlyJapanese && lang !== "ja") return;
                let sectionId = sectionContainerId(section.name);
                let sectionRow = document.createElement("tr");
                categoryBody.appendChild(sectionRow);

                let sectionContainer = document.createElement("div");
                sectionContainer.classList.add(
                    "form-container",
                    "w-100",
                    "navigation-point"
                );
                sectionContainer.dataset.section = section.name;
                sectionRow.appendChild(sectionContainer);

                let sectionHeader = document.createElement("th");
                sectionHeader.classList.add("section-header");
                sectionHeader.innerText =
                    section.displayName[lang] || section.displayName["en"];
                sectionContainer.appendChild(sectionHeader);

                let sectionCell = document.createElement("td");
                sectionCell.classList.add("section-area-td");
                sectionContainer.appendChild(sectionCell);

                let sectionNavButton = document.createElement("button");
                sectionNavButton.classList.add("section-nav-button");
                sectionNavButton.innerText =
                    section.displayName[lang] || section.displayName["en"];
                sectionNavButton.dataset.section = section.name;

                sectionNavButton.addEventListener("click", () => {
                    sectionHeader.scrollIntoView({
                        behavior: "smooth",
                    });
                    highlightElement(sectionHeader);
                    highlightNavigationButton(sectionNavButton);
                });

                let sectionContextMenu = document.createElement("div");
                sectionContextMenu.classList.add("section-context-menu");
                sectionContextMenu.dataset.section = section.name;
                document.body.appendChild(sectionContextMenu);

                let sectionNavHoverTimer = null;

                $(sectionNavButton).hover(
                    function () {
                        $(`.section-context-menu`).hide();
                        const sectionNavButtonOffset =
                            $(sectionNavButton).offset();
                        const sectionContextMenuTop =
                            sectionNavButtonOffset.top +
                            $(window).scrollTop() +
                            sectionNavButton.offsetHeight +
                            10;
                        sectionContextMenu.style.top = `${sectionContextMenuTop}px`;
                        sectionContextMenu.style.left = `${sectionNavButtonOffset.left}px`;
                        $(sectionContextMenu).show();

                        if (
                            sectionNavButtonOffset.left +
                            sectionContextMenu.offsetWidth >
                            window.innerWidth
                        ) {
                            sectionContextMenu.style.left = `${window.innerWidth -
                                sectionContextMenu.offsetWidth
                                }px`;
                        }

                        // limit the height of the context menu not to exceed the window height
                        const sectionContextMenuHeight =
                            sectionContextMenu.offsetHeight;
                        if (
                            sectionContextMenuTop + sectionContextMenuHeight >
                            window.innerHeight
                        ) {
                            sectionContextMenu.style.height = `${window.innerHeight - sectionContextMenuTop - 10
                                }px`;
                        }
                    },
                    function () {
                        sectionNavHoverTimer = setTimeout(() => {
                            $(sectionContextMenu).hide();
                        }, 200);
                    }
                );

                $(sectionContextMenu).hover(
                    function () {
                        if (sectionNavHoverTimer)
                            clearTimeout(sectionNavHoverTimer);
                    },
                    function () {
                        $(sectionContextMenu).hide();
                    }
                );

                sectionNav.appendChild(sectionNavButton);

                if (section.subsections) {
                    let subsectionHeader = document.createElement("div");
                    subsectionHeader.classList.add("subsection-header");
                    sectionCell.appendChild(subsectionHeader);
                    section.subsections.forEach((subsection, i) => {
                        let subsectionContainer = document.createElement("div");
                        subsectionContainer.classList.add(
                            "subsection-container",
                            "form-container",
                            "w-100"
                        );
                        let subContainerId = subsectionContainerId(
                            section.name,
                            subsection.name
                        );
                        subsectionContainer.id = subContainerId;
                        subsectionContainer.dataset.section = section.name;
                        subsectionContainer.dataset.subsection =
                            subsection.name;
                        sectionCell.appendChild(subsectionContainer);
                        let subsectionSwitch = document.createElement("btn");
                        subsectionSwitch.classList.add("subsection-switch");
                        subsectionSwitch.innerText =
                            subsection.displayName[lang] ||
                            subsection.displayName["en"];
                        subsectionSwitch.dataset.subsection = subsection.name;

                        subsectionSwitch.addEventListener("click", () => {
                            $(subsectionContainer)
                                .siblings()
                                .removeClass("visible-subsection");
                            $(subsectionContainer).addClass(
                                "visible-subsection"
                            );
                            $(subsectionSwitch).addClass("active");
                            $(subsectionSwitch)
                                .siblings()
                                .removeClass("active");
                        });
                        subsectionHeader.appendChild(subsectionSwitch);
                        if (i == 0) {
                            subsectionContainer.classList.add(
                                "visible-subsection"
                            );
                            subsectionSwitch.classList.add("active");
                        }
                    });
                } else {
                    let sectionDiv = document.createElement("div");
                    sectionDiv.classList.add("section-area-container");
                    sectionDiv.id = sectionId;

                    sectionCell.appendChild(sectionDiv);
                }
            });

            category.columns.forEach((c) => {
                if (c.onlyJapanese && lang !== "ja") return;
                let containerId = sectionContainerId(c.section);
                if (c.subsection) {
                    containerId = subsectionContainerId(
                        c.section,
                        c.subsection
                    );
                }
                if (!containerId)
                    containerId = sectionContainerId(category.sections[0].name);
                let parent = document.getElementById(containerId);
                if (!parent) parent = categoryBody;
                if (
                    c.section && !c.hideContextMenu &&
                    (!c.inSameRow ||
                        c.contextMenuLabel ||
                        c.showContextMenuInSameRow)
                ) {
                    let sectionContextMenu = document.querySelector(
                        '.section-context-menu[data-section="' +
                        c.section +
                        '"]'
                    );
                    if (sectionContextMenu) {
                        let sectionContextMenuContent =
                            document.createElement("a");
                        if (c.contextMenuLabel) {
                            sectionContextMenuContent.innerText =
                                c.contextMenuLabel[lang] ||
                                c.contextMenuLabel["en"];
                        } else if (c.additionalLabel) {
                            sectionContextMenuContent.innerText =
                                c.additionalLabel[lang] ||
                                c.additionalLabel["en"];
                        } else {
                            sectionContextMenuContent.innerText =
                                c.displayName[lang] || c.displayName["en"];
                        }
                        sectionContextMenuContent.href = "#";
                        sectionContextMenuContent.classList.add(
                            "section-context-menu-item"
                        );
                        sectionContextMenu.appendChild(
                            sectionContextMenuContent
                        );

                        let sectionNavButton = document.querySelector(
                            '.section-nav-button[data-section="' +
                            c.section +
                            '"]'
                        );
                        sectionContextMenuContent.addEventListener(
                            "click",
                            () => {
                                let inputHeader = document.querySelector(
                                    `th[data-column="${c.columnId}"]`
                                );
                                if (c.subsection) {
                                    let subsectionSwith = $(div).find(
                                        `.subsection-switch[data-subsection="${c.subsection}"]`
                                    )[0];
                                    if (subsectionSwith) {
                                        subsectionSwith.click();
                                    }
                                }
                                inputHeader.scrollIntoView({
                                    behavior: "smooth",
                                });
                                highlightElement(inputHeader);
                                highlightNavigationButton(sectionNavButton);
                                $(sectionContextMenu).hide();
                            }
                        );
                    }
                }
                if (c.groupBy) {
                    let containerClass = groupContainerClassName(c.groupBy);
                    let groupContainer =
                        document.getElementsByClassName(containerClass)[0];
                    if (!groupContainer) {
                        addGroupSection(
                            parent,
                            containerClass,
                            c,
                            inputGroupInfo[c.groupBy].shareHeader,
                            () => {
                                addNewInputGroupRow(c.groupBy);
                                for (let column of inputGroupInfo[c.groupBy]
                                    .columns) {
                                    let patientData = contentData.filter(
                                        (d) => {
                                            return d.PCFNo == currentPatient;
                                        }
                                    )[0];
                                    if (!patientData[column.columnId]) {
                                        patientData[column.columnId] = [];
                                    }
                                    patientData[column.columnId].push(
                                        column.defaultValue || null
                                    );
                                }
                            },
                            groupLabels[c.groupBy]
                        );
                    }
                } else {
                    createModalInput(parent, c);
                }
            });

            document.addEventListener("selectedLabel", function (event) {
                const inputBoxId = event.detail.inputBoxId;
                const labelInfo = event.detail.labelInfo;
                const input = document.getElementById(inputBoxId);
                clearTimeout(smartTextBoxClearTimer);
                let newValue =
                    lang === "ja" ? labelInfo.label_ja : labelInfo.label_en;
                const isChanged = input.dataset.lastSelectedValue !== newValue;
                if (!newValue) newValue = labelInfo.keyword;
                if (isChanged) {
                    input.value = newValue;
                    input.dispatchEvent(new Event("change"));
                }
                input.dataset.lastSelectedValue = newValue;
                input.updateValueOfPairedIdList(labelInfo, isChanged);
            });

            updateNavigationInfos();

            /// For family
            if (i === TAB_INDEX_FOR_FAMILY) {
                let parent = document.getElementById(
                    "section_family_info_pedigree"
                );
                let tr = document.createElement("tr");
                tr.classList.add("pedigree-table-row");
                parent.insertBefore(tr, parent.children[0]);

                tr.innerHTML = `
                    <th class="pedigree-table-header">
                        <span>${translate("pedigree-auto-generation")}</span>
                        <a class="additional-link" target='_blank' href='/guides'>FAQ</a>
                    </th>
                    <div class="pedigreejs-wrapper">
                        <div id="pedigree" style="width: 100%; min-width: 782px; height: 100%; position:relative">
                        </div>
                        <div id="pedigree-legend"></div>
                    </div>
                    <div class="pedigree-under-container">
                        <span id="pedigree-error"></span>
                        <div id="pedigree_buttons">
                            <label class="btn download-pedigree-btn">
                                <input id="download_pedigree_json" type="button" style="display: none;"/>JSON
                            </label>
                            <label class="btn download-pedigree-btn">
                                <input id="download_pedigree_svg" type="button" style="display: none;"/>SVG
                            </label>
                            <label class="btn download-pedigree-btn">
                                <input id="download_pedigree_png" type="button" style="display: none;">PNG
                            </label>
                            <label class="btn download-pedigree-btn">
                                <input id="download_pedigree_pdf" type="button" style="display: none;">PDF
                            </label>
                        </div>
                    </div>
                    <div id="pedigree-table-section" style="width: 100%; height: 100%;"></div>
                `;

                $("#download_pedigree_png").click(downloadPedigreePNG);
                $("#download_pedigree_svg").click(downloadPedigreeSVG);
                $("#download_pedigree_json").click(downloadPedigreeJSON);
                $("#download_pedigree_pdf").click(downloadPedigreePDF);
            }
        });
    }
}

function changeDeathOptions(type) {
    let d = new Date();

    let birthYear = document.querySelector(
        `.tab-wrap *[name="${columnKeys.CASE_BIRTH}_year"]`
    ).value;
    let birthMonth = document.querySelector(
        `.tab-wrap *[name="${columnKeys.CASE_BIRTH}_month"]`
    ).value;

    let deathYear = document.querySelector(
        `.tab-wrap *[name="${columnKeys.CASE_DEATH}_year"]`
    ).value;

    if (type === "year") {
        createYearOptions(
            birthYear,
            d.getFullYear(),
            `${columnKeys.CASE_DEATH}_year`
        );
    } else if (type === "month") {
        if (deathYear === birthYear) {
            createMonthOptions(
                birthMonth,
                12,
                `${columnKeys.CASE_DEATH}_month`
            );
        }
    }
    document.querySelector(
        `.tab-wrap *[name="${columnKeys.CASE_DEATH}_year"]`
    ).value = deathYear;
}

function dateOptions(type, includeDay = false, padZero = true) {
    let this_month, this_year, today;
    today = new Date();
    this_year = today.getFullYear();
    this_month = today.getMonth() + 1;

    createYearOptions(minimumYearOfBirth, this_year, `${type}_year`);
    createMonthOptions(1, 12, `${type}_month`, padZero);
    if (includeDay) {
        let input = document.querySelector(`.tab-wrap *[name="${type}_day"]`);
        if (input) input.innerHTML = createDayOptions(padZero);
    }
}

function createYearOptions(startYear, endYear, id) {
    let input = document.querySelector(`.tab-wrap *[name="${id}"]`);
    if (!input) return;
    startYear = parseInt(startYear) || minimumYearOfBirth;
    endYear = parseInt(endYear);
    let opt = `<option value="-">${translate("select-year")}</option>`;

    for (let i = endYear; i >= startYear; i--) {
        opt += `<option value="${i.toString()}"}>${i}</option>`;
    }

    return (input.innerHTML = opt);
}

function createMonthOptions(startMonth, endMonth, id, padZero = true) {
    startMonth = parseInt(startMonth) || 1;
    endMonth = parseInt(endMonth);
    let opt = `<option value="-">${translate("select-month")}</option>`;

    for (let i = startMonth; i <= endMonth; i++) {
        let display = i;
        let temp = i;

        // if (temp % 10 === 0 && end !== 12) display = `${i}s`

        opt += `<option value="${padZero ? i.toString().padStart(2, "0") : i
            }">${display}</option>`;
    }

    const element = document.querySelector(`.tab-wrap *[name="${id}"]`);
    if (element) {
        element.innerHTML = opt;
    }
}

function createDayOptions(padZero = true) {
    let options = `<option value="-">${translate("select-day")}</option>`;
    for (let i = 0; i <= 30; i++) {
        options += `<option value="${padZero ? i.toString().padStart(2, "0") : i.toString()
            }">${i}</option>`;
    }
    return options;
}

function onchangeHandlerForModalInput(
    key,
    value,
    columnDef = null,
    element = null
) {
    let forDate = columnDef
        ? columnDef.inputType === "select-date" ||
        columnDef.inputType === "select-age"
        : false;
    if (forDate) {
        const defaultValue = "-";
        let year =
            document.querySelector(`.tab-wrap *[name="${key}_year"]`)
                .value || defaultValue;
        let month = document.querySelector(
            `.tab-wrap *[name="${key}_month"]`
        ).value;
        let day = document.querySelector(
            `.tab-wrap *[name="${key}_day"]`
        )?.value;
        let forAge = columnDef.inputType === "select-age";
        if (forAge) {
            value = "";
            const isDefaultYear = year === defaultValue
            const isDefaultMonth = month === defaultValue
            const isDefaultDay = day === defaultValue
            if (day) {
                if (!isDefaultYear || !isDefaultMonth || !isDefaultDay) {
                    year = isDefaultYear ? 0 : Number(year);
                    month = isDefaultMonth ? 0 : Number(month);
                    day = isDefaultDay ? 0 : Number(day);
                    if (year !== 0 || month !== 0 || day !== 0) {
                        value += `${year}Y${month}M${day}D`;
                    }
                }
            } else {
                // 年月のみの場合
                if (!isDefaultYear || !isDefaultMonth) {
                    year = isDefaultYear ? 0 : Number(year);
                    month = isDefaultMonth ? 0 : Number(month);
                    if (year !== 0 || month !== 0) {
                        value += `${year}Y${month}M`;
                    }
                }
            }
        } else {
            if (
                year === defaultValue &&
                month === defaultValue &&
                (!day || day === defaultValue)
            ) {
                value = "";
            } else {
                if (day) value = `${year}/${month}/${day}`;
                else value = `${year}/${month}`;
            }
        }
    }

    // getDataはフィルタリング後の画面に表示されているデータを取得する
    const visibleData = hot ? hot.getData() : [];
    const pcfnoIdx = columns.findIndex(col => col.data === 'PCFNo');
    const patientIdx = visibleData.findIndex(row => row[pcfnoIdx] === currentPatient);


    if (patientIdx !== -1) {
        const currentContent = contentData.find(p => p.PCFNo === currentPatient);

        if (columnDef?.nestedGroup) {
            let rowContainer = $(element).closest(".input-group-row");
            let rowIndex = rowContainer.index();
            let parentRowIndex = rowContainer
                .parent()
                .closest(".input-group-row")
                .index();
            if (!currentContent[key]) currentContent[key] = [];
            let targetField = currentContent[key];
            if (!targetField) targetField = [];
            if (!targetField[parentRowIndex])
                targetField[parentRowIndex] = [];
            targetField[parentRowIndex][rowIndex] = value;
        } else if (columnDef?.groupBy && element) {
            let rowIndex = $(element).closest(".input-group-row").index();
            if (rowIndex === -1) return;
            if (!currentContent[key]) currentContent[key] = [];
            let targetField = currentContent[key];
            targetField[rowIndex] = value;
        } else {
            currentContent[key] = value;
        }
        currentContent.case_updated_at = currentTimeString();
    }


    let columnIdx = existingColumns.indexOf(key);

    if (columnIdx >= 0 && patientIdx !== -1) {
        columnIdx += actions.length;
        if (!columnDef?.groupBy) {
            hot.setDataAtCell(patientIdx, columnIdx, value);
        }
    }
}

function createModalInput(parent, c, noWrap = false) {
    let td, tr, parentInputInModal;
    if (c.parentInputInModal) {
        parentInputInModal = parent.querySelector(
            `*[data-columnname="${c.parentInputInModal}"]`
        );
    }
    let container = document.createElement("div");

    if (c.inSameRow) {
        let previousSibling = parent.lastChild;
        tr = $(previousSibling).closest("tr")[0];
        if (c.fullWidth) {
            container.classList.add("flex-grow-1");
        } else {
            $(previousSibling)
                .find(".form-container:last-of-type")
                .removeClass("flex-grow-1");
        }
    } else {
        tr = document.createElement("tr");
        parent.appendChild(tr);
        if (!["readOnly", "select"].includes(c.inputType)) {
            container.classList.add("flex-grow-1");
        }
    }

    if (noWrap) {
        tr.classList.add("flex-nowrap");
    }

    if (c.noBorder) {
        tr.previousSibling?.classList.add("no-border-bottom");
    }

    container.classList.add("form-container");
    if (c.parentInputInModal && !c.autocomplete && parentInputInModal.autocomplete === "on") {
        container.classList.add("mb-4");
    }


    tr.appendChild(container);
    if (c.additionalStyle) {
        for (let key in c.additionalStyle)
            container.style[key] = c.additionalStyle[key];
    }

    let th = document.createElement("th");
    th.id = c.columnId;
    th.dataset.column = c.columnId;
    th.innerText = c["displayName"][lang] || c["displayName"]["en"];
    th.classList = "input-header";
    if (c.additionalLabel) {
        let additionalLabelText =
            c.additionalLabel[lang] || c.additionalLabel["en"];
        th.innerText = `${additionalLabelText}\n${th.innerText}`;
    }

    if (c.additionalLink) {
        let link = document.createElement("a");
        link.href = c.additionalLink.url;
        link.target = "_blank";
        link.innerText =
            c.additionalLink.label[lang] || c.additionalLink.label["en"];
        link.classList.add("additional-link");
        th.appendChild(link);
    }

    container.appendChild(th);
    td = document.createElement("td");
    container.appendChild(td);

    if (c.smartTextBox) {
        td.classList.add("smart-box-container");
    }

    if (c.onlyJapanese && lang !== "ja") $(container).hide();

    if (c.inputType === "select-age") {
        let yearInput = document.createElement("input");
        yearInput.type = "number";
        yearInput.min = 0;
        yearInput.classList.add(
            ...[`${c.columnId}_year`, "select_age_year", "age_select_age_year", "select_age"]
        );
        yearInput.id = `${c.columnId}_year`;
        yearInput.name = `${c.columnId}_year`;
        yearInput.dataset.columnname = c.columnId;
        // マウスホイールによる値変更を無効化
        yearInput.addEventListener('wheel', event => event.preventDefault(), { passive: false });
        $(yearInput).on("change", (e) => {
            const inputValue = e.target.value;
            if (inputValue < 0) {
                e.target.value = "";
                return;
            }
            if (inputValue.includes('.')) {
                e.target.value = inputValue.split('.')[0];
                return;
            }
        });
        td.appendChild(yearInput);

        let selectMonth = document.createElement("select");
        selectMonth.name = `${c.columnId}_month`;
        selectMonth.id = `${c.columnId}_month`;
        selectMonth.classList.add("select_age_month", "select_age");
        selectMonth.dataset.columnname = c.columnId;
        td.appendChild(selectMonth);

        let selectDay = document.createElement("select");
        selectDay.name = `${c.columnId}_day`;
        selectDay.id = `${c.columnId}_day`;
        selectDay.classList.add("select_age_day", "select_age");
        selectDay.dataset.columnname = c.columnId;
        if (!c.excludeDay) {
            td.appendChild(selectDay);
        }

        yearInput.onchange =
            selectMonth.onchange =
            selectDay.onchange =
            function (e) {
                onchangeHandlerForModalInput(
                    c.columnId,
                    e.target.value,
                    c,
                    e.target
                );
            };
    } else if (c.inputType === "date") {
        let input = document.createElement("input");
        input.type = "date";
        input.name = c.columnId;
        input.dataset.columnname = c.columnId;
        td.appendChild(input);

        input.addEventListener("change", (e) => {
            let value = e.target.value;
            value = value ? value.replace(/-/g, '/') : value;
            onchangeHandlerForModalInput(
                c.columnId,
                value,
                c,
                e.target
            );
        });
        if (c.additionalClass) {
            input.classList.add(c.additionalClass);
        }
    } else if (
        c.inputType === "text" ||
        c.inputType === "input-select" ||
        c.inputType === "number" ||
        c.inputType === "number-with-unknown"
    ) {
        let input = document.createElement("input");
        input.type = "text";
        input.name = c.columnId;
        input.dataset.columnname = c.columnId;
        input.autocomplete = "off";
        td.appendChild(input);

        input.addEventListener("change", (e) => {
            onchangeHandlerForModalInput(
                c.columnId,
                e.target.value,
                c,
                e.target
            );
        });

        if (c.smartTextBox) {
            input.id = `${c.columnId}_${uniqueCounterForInput++}`;
            if (window.smartTextBox) {
                window.smartTextBox(input.id, c.candidateSourcePath, {
                    include_no_match: true,
                    max_results: 20,
                });
            }
            let idListDiv = document.createElement("div");
            idListDiv.classList.add("id-list");
            td.appendChild(idListDiv);
            input.updateValueOfPairedIdList = (idObj, isClearPatiendData = false) => {
                let patientData = contentData.find((p) => p.PCFNo === currentPatient);
                if (!patientData) return;
                let idObjAfterMapped = {};
                let sourceNameMap = c.sourceNameMap;
                for (let [sourceName, mappedName] of Object.entries(sourceNameMap)) {
                    let mappedValue = idObj?.[sourceName] || idObj?.[mappedName];
                    if (c.sourcePrefixBlacklist?.[sourceName] && mappedValue?.startsWith(c.sourcePrefixBlacklist[sourceName])) {
                        continue;
                    }

                    if (mappedValue) {
                        idObjAfterMapped[mappedName] = mappedValue;
                    }
                }
                let rowIndex = $(input).closest(".input-group-row")?.index();
                if (rowIndex === -1 || rowIndex === null) return;
                patientData[c.pairedIdColumn] = patientData[c.pairedIdColumn] || [];

                if (isClearPatiendData) {
                    patientData[c.pairedIdColumn][rowIndex] = idObjAfterMapped;
                } else {
                    patientData[c.pairedIdColumn][rowIndex] = {
                        ...patientData[c.pairedIdColumn][rowIndex],
                        ...idObjAfterMapped
                    };
                }

                input.updateIdListLabel();
            };

            const createIdListItem = (mappedName, mappedValue, options = {}) => {
                const { isShowDeleteIcon = false, isSourceListWithoutHeader = false } = options;
                const displayMappedValue = isSourceListWithoutHeader ? mappedValue.split(':')[1] : mappedValue;
                const deleteIconHtml = isShowDeleteIcon ?
                    `<i class="material-symbols-outlined id-list-delete-icon" data-id-list-item="${mappedName}">close</i>` : '';
                const labelClass = !displayMappedValue ? '' : 'id-list-label';
                return `
                    <div class="id-list-item">
                        <div>${mappedName}</div>
                        <span class="id-list-separator">：</span>
                        <label class="${labelClass}">
                            <span class="id-list-label-text">${displayMappedValue}</span>${deleteIconHtml}
                        </label>
                    </div>
                `;
            };

            input.updateIdListLabel = () => {
                let patientData = contentData.find((p) => p.PCFNo === currentPatient);
                if (!patientData) return;
                let rowIndex = $(input).closest(".input-group-row")?.index();
                if (rowIndex === -1 || rowIndex === null) return;
                let idObj = patientData[c.pairedIdColumn][rowIndex];
                let divHtmlList = [];
                let sourceNameMap = c.sourceNameMap;

                for (let mappedName of Object.values(sourceNameMap)) {
                    let mappedValue = idObj?.[mappedName];
                    if (mappedValue) {
                        divHtmlList.push(createIdListItem(mappedName, mappedValue, {
                            isShowDeleteIcon: true,
                            isSourceListWithoutHeader: c.sourceListWithoutHeader?.includes(mappedName)
                        }));
                    } else {
                        divHtmlList.push(createIdListItem(mappedName, ''));
                    }
                }
                idListDiv.innerHTML = divHtmlList.join('');
            };

            idListDiv.addEventListener('click', (e) => {
                const deleteIcon = e.target.closest('.id-list-delete-icon');
                if (!deleteIcon) return;

                const mappedName = deleteIcon.dataset.idListItem;
                const idListItem = deleteIcon.closest('.id-list-item');
                if (idListItem) {
                    idListItem.remove();

                    let patientData = contentData.find((p) => p.PCFNo === currentPatient);
                    if (patientData) {
                        let rowIndex = $(input).closest(".input-group-row")?.index();
                        if (rowIndex !== -1 && rowIndex !== null && patientData[c.pairedIdColumn]?.[rowIndex]) {
                            delete patientData[c.pairedIdColumn][rowIndex][mappedName];
                        }
                    }
                }
                input.updateIdListLabel();
            });

            let initialDivHtmlList = [];
            if (c.sourceNameMap) {
                for (let mappedName of Object.values(c.sourceNameMap)) {
                    initialDivHtmlList.push(createIdListItem(mappedName, ''));

                }
                idListDiv.innerHTML = initialDivHtmlList.join('');
            }
            // Reset paired id cell when the input is changed by keyboard input
            input.addEventListener("change", (e) => {
                if (input.dataset.lastSelectedValue !== e.target.value) {
                    smartTextBoxClearTimer = setTimeout(() => {
                        input.updateValueOfPairedIdList({});
                    }, 200);
                }
            });
            // changeイベントだと値が確定するまで発火しないので値が空の時だけinputイベントを使う
            input.addEventListener('input', (e) => {
                if (e.target.value === '') {
                    smartTextBoxClearTimer = setTimeout(() => {
                        input.updateValueOfPairedIdList({}, true);
                    }, 200);
                }
            })
        }

        if (c.pairedIdColumn) {
            input.dataset.pairedIdColumn = c.pairedIdColumn;
        }

        if (c.inputType === "input-select") {
            let select = document.createElement("select");
            select.id =
                c.columnId === columnKeys.CASE_FAMILY_ID
                    ? "family_options"
                    : "group_options";
            td.appendChild(select);
            td.id = "group_wrap";

            select.onchange = function (e) {
                onchangeHandlerForModalInput(
                    c.columnId,
                    e.target.value,
                    c,
                    e.target
                );
                e.target.previousSibling.value = e.target.value;
                e.target.selectedIndex = 0;
            };
        } else if (c.inputType === "number") {
            if (!c.groupBy || !inputGroupInfo[c.groupBy].shareHeader) {
                input.classList.add("auto-width");
            }
            input.type = "number";
            input.min = "0";
            // マウスホイールによる値変更を無効化
            input.addEventListener('wheel', event => event.preventDefault(), { passive: false });
        } else if (c.inputType === "number-with-unknown") {
            input.classList.add("auto-width");
            input.type = "number";
            input.min = "0";
            // マウスホイールによる値変更を無効化
            input.addEventListener('wheel', event => event.preventDefault(), { passive: false });
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.name = c.columnId;
            checkbox.id = `checkbox-${c.columnId}`;
            checkbox.value = translate("Unknown");
            checkbox.dataset.columnname = c.columnId;
            checkbox.classList.add("auto-width", "ml-3", "unknown-checkbox");

            checkbox.onchange = function (e) {
                if (e.target.checked) {
                    input.disabled = true;
                    input.value = '';
                    onchangeHandlerForModalInput(
                        c.columnId,
                        "unknown",
                        c,
                        e.target
                    );
                } else {
                    input.disabled = false;
                    onchangeHandlerForModalInput(
                        c.columnId,
                        input.value,
                        c,
                        input
                    );
                }
            };

            td.appendChild(checkbox);

            let label = document.createElement("label");
            label.innerText = checkbox.value;
            label.htmlFor = checkbox.id;
            td.appendChild(label);
        }

        if (c.additonalLabel) {
            let span = document.createElement("span");
            input.classList.add("auto-width");
            span.innerText = c.additonalLabel;
            span.classList.add("ml-2");
            td.appendChild(span);
        }

        const geneIdInputNameList = [
            "genotype_ncbi_gene_id",
            "genotype_gene",
            "genotype_ensembl_id",
        ];

        if (geneIdInputNameList.includes(c.columnId)) {
            input.addEventListener("input", (e) => {
                let geneId = e.target.value;
                let commonParent = $(e.target).closest(".input-group-row");

                let targetGeneIds = geneIdList.find(
                    (gene) => gene[c.columnId] === geneId
                );
                if (!targetGeneIds || geneId === "") return;
                for (let geneIdInputName of geneIdInputNameList) {
                    let input = commonParent.find(
                        `input[data-columnname="${geneIdInputName}"]`
                    )[0];
                    if (
                        input &&
                        input.value != targetGeneIds?.[geneIdInputName]
                    ) {
                        input.value = targetGeneIds?.[geneIdInputName] || "";
                        input.dispatchEvent(new Event("change"));
                    }
                }
            });
        }
    } else if (c.inputType === "select") {
        if (c.autocomplete) {
            let input = document.createElement("input");
            input.type = "text";
            input.name = c.columnId;
            input.dataset.columnname = c.columnId;
            input.autocomplete = "on";

            td.appendChild(input);
            let candidatesForCurrentLanguage = c.options[lang];

            if (candidatesForCurrentLanguage?.length > 0) {
                let candidatesId = `${c.columnId}_list`;
                input.setAttribute("list", candidatesId);

                let datalist = document.createElement("datalist");
                datalist.id = candidatesId;
                candidatesForCurrentLanguage.forEach((candidate) => {
                    let option = document.createElement("option");
                    option.innerText = candidate;
                    datalist.appendChild(option);
                });
                td.appendChild(datalist);
            }
            input.addEventListener("change", (e) => {
                if (e.target.autocomplete !== "on" || candidatesForCurrentLanguage?.find(val => e.target.value === val)) {
                    onchangeHandlerForModalInput(
                        c.columnId,
                        e.target.value,
                        c,
                        e.target
                    );
                }
            });
            input.addEventListener("blur", (e) => {
                if (e.target.autocomplete !== "on") return;

                const data = contentData.find(p => p.PCFNo === currentPatient);
                const registeredValue = data[c.columnId];
                const isExist = !!candidatesForCurrentLanguage?.find(val => registeredValue === val);
                if (!isExist) {
                    e.target.value = null;
                } else if (e.target.value !== registeredValue) {
                    e.target.value = registeredValue || null;
                }
            });

            let clear = document.createElement("div");
            clear.classList.add("autocomplete-clear");
            clear.innerHTML = "clear";
            clear.onclick = () => {
                $(td).find("input").val(null).change();
                onchangeHandlerForModalInput(
                    c.columnId,
                    null,
                    c
                );
            };
            td.appendChild(clear);
            if (c.autocompleteWhen) {
                $(clear).hide();
            }
        } else {
            let select = document.createElement("select");
            select.name = c.columnId;
            select.dataset.columnname = c.columnId;
            select.dataset.only_japanese = !!c.onlyJapanese;
            td.appendChild(select);

            let option = document.createElement("option");
            option.value = "";
            switch(c.columnId) {
                case columnKeys.CASE_PARENT_ID:
                    option.innerText = translate("select-parent");
                    break;
                case columnKeys.CASE_SPOUSE_ID:
                    option.innerText = translate("select-spouse");
                    break;
                default:
                    option.innerText = translate("select");
                    break;
            }
            option.hidden = false;
            select.add(option);

            let options = c.options.dataValue;
            let optionLang =
                c["options"][lang]?.length > 0
                    ? c["options"][lang]
                    : c["options"]["en"];
            options.forEach((o, i) => {
                let option = document.createElement("option");
                option.value = o;
                option.innerText = optionLang[i];
                select.add(option);
            });

            if (c.columnId === columnKeys.CASE_RELATIONSHIP) {
                tr.id = 'relationship_id_in_case_info';
                select.addEventListener("change", (e) => {
                    updateExtraInputFieldsForRelationship(
                        e.target.value,
                        $('#relationship_id_in_case_info'),
                        currentPatient,
                        true
                    );
                    onchangeHandlerForModalInput(
                        c.columnId,
                        dataValueToTranslated(c.options, e.target.value),
                        c,
                        e.target
                    );
                    updateStatusOfPhenopacketButton();
                });
            } else {
                select.addEventListener("change", (e) => {
                    onchangeHandlerForModalInput(
                        c.columnId,
                        dataValueToTranslated(c.options, e.target.value),
                        c,
                        e.target
                    );
                });
            }
        }
    } else if (c.inputType === "select-date") {
        let selectYear = document.createElement("select");
        selectYear.classList.add(...[`${c.columnId}_year`, "select_date_year", "select_date"]);
        selectYear.id = `${c.columnId}_year`;
        selectYear.name = `${c.columnId}_year`;
        selectYear.dataset.columnname = c.columnId;
        td.appendChild(selectYear);

        selectYear.onchange = function (e) {
            onchangeHandlerForModalInput(
                c.columnId,
                selectYear.value,
                c,
                e.target
            );
            if (c.columnId === `${columnKeys.CASE_BIRTH}`) {
                changeDeathOptions("year");
            } else if (c.columnId === `${columnKeys.CASE_DEATH}`) {
                changeDeathOptions("month");
            }
        };

        let selectMonth = document.createElement("select");
        selectMonth.classList.add("select_date_month", "select_date");
        selectMonth.name = `${c.columnId}_month`;
        selectMonth.id = `${c.columnId}_month`;
        selectMonth.dataset.columnname = c.columnId;
        td.appendChild(selectMonth);

        selectMonth.onchange = function (e) {
            onchangeHandlerForModalInput(
                c.columnId,
                selectMonth.value,
                c,
                e.target
            );
            if (c.columnId === `${columnKeys.CASE_BIRTH}_year`) {
                changeDeathOptions("month");
            }
        };

        if (c.includeDay) {
            let selectDay = document.createElement("select");
            selectDay.name = `${c.columnId}_day`;
            selectDay.id = `${c.columnId}_day`;
            selectDay.dataset.columnname = c.columnId;
            selectDay.classList.add("select_date_day", "select_date");
            td.appendChild(selectDay);

            selectDay.onchange = function (e) {
                onchangeHandlerForModalInput(
                    c.columnId,
                    selectDay.value,
                    c,
                    e.target
                );
            };
        }
    } else if (c.inputType === "radio" || c.inputType === "radio-input") {
        let options = c.options.dataValue;
        let optionLang =
            c["options"][lang]?.length > 0
                ? c["options"][lang]
                : c["options"]["en"];
        options.forEach((o, i) => {
            let radioId = `${c.columnId}_${o}_${uniqueCounterForInput}`;
            let radioLabel = document.createElement("label");
            radioLabel.htmlFor = radioId;
            radioLabel.innerHTML = `
                    <input id="${radioId}" type="radio" name="${c.columnId
                }_${uniqueCounterForInput}" value="${o}" 
                ${i === 0 ? 'checked="checked"' : ""}
                        data-columnname="${c.columnId}">
                    ${optionLang[i]}
            `;
            td.appendChild(radioLabel);
            let radio = document.getElementById(radioId);
            $(radio).on("change", (e) => {
                let targetValue = e.currentTarget.value;

                targetValue = dataValueToTranslated(c.options, targetValue);
                onchangeHandlerForModalInput(
                    c.columnId,
                    targetValue,
                    c,
                    e.target
                );
            });
            if (c.additionalClass) {
                radio.classList.add(c.additionalClass);
                let label = $(td).find("label[for='" + radioId + "']")[0];
                label.classList.add(c.additionalClass);
            }
        });
        ++uniqueCounterForInput;

        let clear = document.createElement("div");
        clear.classList.add("radio-clear");
        clear.innerHTML = "clear";
        clear.onclick = () => {
            if (options.length > 0) {
                $(td)
                    .find(`input[value=${options[0]}]`)
                    .prop("checked", true)
                    .change();
            } else {
                $(td).find(`input`).prop("checked", false).change();
            }
        };
        td.appendChild(clear);

        if (c.inputType === "radio-input") {
            let input = document.createElement("input");
            input.classList.add("input-top");
            input.type = "text";
            input.name = `${c.columnId}-list`;
            td.appendChild(input);
        }
    } else if (c.inputType === "textarea") {
        let textarea = document.createElement("textarea");
        textarea.cols = 30;
        textarea.rows = 5;
        textarea.name = c.columnId;
        textarea.dataset.columnname = c.columnId;
        td.appendChild(textarea);

        textarea.addEventListener("change", (e) => {
            onchangeHandlerForModalInput(
                c.columnId,
                e.target.value,
                c,
                e.target
            );
        });
    } else if (c.inputType === "multi-checkbox") {
        let options = c.options.dataValue;
        let optionLang =
            c["options"][lang]?.length > 0
                ? c["options"][lang]
                : c["options"]["en"];
        options.forEach((o, i) => {
            let name = `${c.columnId}_${o}`;
            // Create unique id for label
            let id = `${name}-${uniqueCounterForInput}`;
            td.innerHTML += `<label for="${id}" class="label-with-checkbox"><input id="${id}" type="checkbox" name="${c.columnId}" data-checkbox-group-index=${uniqueCounterForInput} data-columnname="${c.columnId}" value="${o}" class="${c.columnId}-checkbox">${optionLang[i]}</label>`;
            if (c.additionalClass) {
                let label = $(td).find("label[for='" + id + "']")[0];
                label.classList.add(c.additionalClass);
            }
        });

        uniqueCounterForInput++;
    } else if (c.inputType === "multiple-radio") {
        td.innerHTML = `
            <label for="sporadic">
                <input id="sporadic" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}" value="Sporadic"
                    data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Sporadic
            </label>
            <details open>
                <summary>
                    <label for="autosomal_dominant_inheritance">
                        <input id="autosomal_dominant_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                            value="Autosomal dominant inheritance"
                            data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Autosomal
                        dominant
                        inheritance
                    </label>
                </summary>
                <label for="sex_limited_autosomal_dominant" class="family-mode-inheritance-child-label">
                    <input id="sex_limited_autosomal_dominant" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="Sex-limited autosomal dominant"
                        data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Sex-limited
                    autosomal dominant
                </label>
                <label for="autosomal_dominant_somatic_cell_mutation" class="family-mode-inheritance-child-label">
                    <input id="autosomal_dominant_somatic_cell_mutation" type="radio" class="plain-radio family-mode-inheritance-input"
                        name="${columnKeys.FAMILY_MODE_INHERITANCE}" value="Autosomal dominant somatic cell mutation"
                        data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Autosomal
                    dominant somatic cell mutation
                </label>
                <label for="autosomal_dominant_contiguous_gene_syndrome" class="family-mode-inheritance-child-label">
                    <input id="autosomal_dominant_contiguous_gene_syndrome" type="radio" class="plain-radio family-mode-inheritance-input"
                        name="${columnKeys.FAMILY_MODE_INHERITANCE}" value="Autosomal dominant contiguous gene syndrome"
                        data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Autosomal
                    dominant contiguous gene syndrome
                </label>
            </details>
            <label for="autosomal_recessive_inheritance">
                <input id="autosomal_recessive_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                    value="Autosomal recessive inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Autosomal
                recessive inheritance
            </label>
            <details open>
                <summary>
                    <label for="gonosomal_inheritance">
                        <input id="gonosomal_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                            value="Gonosomal inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Gonosomal
                        inheritance
                    </label>
                </summary>
                <label for="x_linked_inheritance" class="family-mode-inheritance-child-label">
                    <input id="x_linked_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="X-linked inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">X-linked
                    inheritance
                </label>
                <label for="x_linked_dominant_inheritance" class="family-mode-inheritance-child-label">
                    <input id="x_linked_dominant_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="X-linked dominant inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">X-linked
                    dominant inheritance
                </label>
                <label for="x_linked_recessive_inheritance" class="family-mode-inheritance-child-label">
                    <input id="x_linked_recessive_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="X-linked recessive inheritance"
                        data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">X-linked
                    recessive inheritance
                </label>
                <label for="y_linked_inheritance" class="family-mode-inheritance-child-label">
                    <input id="y_linked_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="Y-linked inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Y-linked
                    inheritance
                </label>
            </details>
            <details open>
                <summary>
                    <label for="multifactorial_inheritance">
                        <input id="multifactorial_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                            value="Multifactorial inheritance"
                            data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Multifactorial
                        inheritance
                    </label>
                </summary>
                <label for="digenic_inheritance" class="family-mode-inheritance-child-label">
                    <input id="digenic_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="Digenic inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Digenic
                    inheritance
                </label>
                <label for="oligogenic_inheritance" class="family-mode-inheritance-child-label">
                    <input id="oligogenic_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="Oligogenic inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Oligogenic
                    inheritance
                </label>
                <label for="polygenic_inheritance" class="family-mode-inheritance-child-label">
                    <input id="polygenic_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                        value="Polygenic inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Polygenic
                    inheritance
                </label>
            </details>
            <label for="mitochondrialx_inheritance">
                <input id="mitochondrialx_inheritance" type="radio" class="plain-radio family-mode-inheritance-input" name="${columnKeys.FAMILY_MODE_INHERITANCE}"
                    value="Mitochondrial inheritance" data-columnname="${columnKeys.FAMILY_MODE_INHERITANCE}">Mitochondrial
                inheritance
            </label>
        `;

        let clear = document.createElement("div");
        clear.classList.add("radio-clear");
        clear.innerHTML = "clear";
        clear.onclick = () => {
            contentData.forEach((p) => {
                if (p.PCFNo === currentPatient) p[c.columnId] = "";
            });

            hot.render();
            $(td).find("input").prop("checked", false);
        };
        td.appendChild(clear);

        $('.family-mode-inheritance-input').on("change", (e) => {
            let targetValue = e.currentTarget.value;

            targetValue = dataValueToTranslated(c.options, targetValue);
            onchangeHandlerForModalInput(
                c.columnId,
                targetValue,
                c,
                e.target
            );
        });

    } else if (c.inputType === "readOnly") {
        let label = document.createElement("label");
        label.dataset.columnname = td.dataset.columnname = c.columnId;
        label.classList.add("read-only");
        label.updateValue = (value) => {
            onchangeHandlerForModalInput(c.columnId, value, c, label);
        };
        td.appendChild(label);
    }

    if (c.parentInputInModal && (c.enableWhen || c.autocompleteWhen)) {
        let baseChildInput = tr.querySelector(`*[name="${c.columnId}"]`);
        let allChildInputs = tr.querySelectorAll(`*[name="${c.columnId}"]`);
        if (!baseChildInput) {
            baseChildInput = tr.querySelector(
                `*[data-columnname="${c.columnId}"]`
            );
            allChildInputs = tr.querySelectorAll(
                `*[data-columnname="${c.columnId}"]`
            );
        }
        let childInputArea = $(baseChildInput).closest(".form-container")[0];
        let updateStatus = (newParentValue) => {
            const enableWhen = !($(parentInputInModal).data("only_japanese") && lang !== "ja") && c.enableWhen
            if (enableWhen) {
                let enabled = c.enableWhen.includes(newParentValue);
                allChildInputs.forEach((childInput, i) => {
                    childInput.disabled = !enabled;
                    let oldValue = childInput.value;
                    if (!enabled) {
                        if (
                            childInput.type === "number" ||
                            childInput.type === "date" ||
                            childInput.type === "text"
                        ) {
                            childInput.value = "";
                            if (oldValue !== childInput.value) {
                                childInput.dispatchEvent(new Event("change"));
                            }
                        } else if (
                            childInput.tagName.toLowerCase() === "select"
                        ) {
                            childInput.selectedIndex = 0;
                            if (oldValue !== childInput.value) {
                                childInput.dispatchEvent(new Event("change"));
                            }
                        } else if (childInput.type === "checkbox") {
                            childInput.checked = false;
                            if (oldValue !== childInput.checked) {
                                childInput.dispatchEvent(new Event("change"));
                            }
                        } else if (childInput.type === "radio") {
                            if (i === 0) {
                                childInput.checked = true;
                                childInput.dispatchEvent(new Event("change"));
                            }
                        }
                    }
                });
                if (c.inputType == "multi-checkbox" || c.inputType == "radio") {
                    $(childInputArea)
                        .find(`input[data-columnname="${c.columnId}"]`)
                        .prop("disabled", !enabled);
                } else if (c.inputType === "number-with-unknown") {
                    $(childInputArea)
                        .find(`input[type=checkbox][name="${c.columnId}"]`)
                        .prop("disabled", !enabled);
                    $(childInputArea)
                        .find(`input[type=number][name="${c.columnId}"]`)
                        .prop("disabled", !enabled);
                }
                childInputArea.classList.toggle("disabled", !enabled);
            } else if (c.autocompleteWhen) {
                let autocompleteEnabled =
                    c.autocompleteWhen.includes(newParentValue);

                baseChildInput.autocomplete = autocompleteEnabled
                    ? "on"
                    : "off";
                // Somehow, setting autocomplete to "off" does not work for some browsers, so we need to also set list to null
                baseChildInput.setAttribute(
                    "list",
                    autocompleteEnabled ? `${c.columnId}_list` : null
                );
                if (autocompleteEnabled) {
                    $(baseChildInput).siblings(".autocomplete-clear").show();
                    $(baseChildInput).closest(".form-container")[0].classList.remove("mb-4");
                } else {
                    $(baseChildInput).siblings(".autocomplete-clear").hide();
                    $(baseChildInput).closest(".form-container")[0].classList.add("mb-4");
                }
            }
        };

        if (childInputArea) {
            if (parentInputInModal.type === "checkbox") {
                // inputType = "multi-checkbox" の場合を想定
                for (let choice of c.enableWhen) {
                    let parentInput = parent?.querySelector(
                        `*[data-columnname="${c.parentInputInModal}"][value="${choice}"]`
                    );
                    if (parentInput) {
                        $(parentInput).on("change", (e) => {
                            updateStatus(e.target.checked && e.target.value);
                        });
                    }
                }
                updateStatus(false);
            } else if (parentInputInModal.type === "radio") {
                let parentInputs = parent?.querySelectorAll(
                    `*[data-columnname="${c.parentInputInModal}"]`
                );
                for (let parentInput of parentInputs) {
                    $(parentInput).on("change", (e) => {
                        updateStatus(e.target.checked && e.target.value);
                    });
                }
                updateStatus(false);
            } else {
                $(parentInputInModal).on("change", (e) => {
                    updateStatus(e.target.value);
                });

                const contentDataIndex = contentData.findIndex(item => item.PCFNo === currentPatient);
                const contentDataItem = contentData[contentDataIndex];

                let parentInputInModalValue = false;
                if (contentDataItem) {
                    parentInputInModalValue = contentDataItem[c.parentInputInModal];

                }

                let loopCount = 0;
                while (Array.isArray(parentInputInModalValue) && loopCount < 5) {
                    parentInputInModalValue = parentInputInModalValue[0];
                    loopCount++;
                }

                updateStatus(parentInputInModalValue);
            }

            if ($(parentInputInModal).data("only_japanese") && lang !== "ja" && c.enableWhen) {
                $(childInputArea)
                    .find(`input[data-columnname="${c.columnId}"]`)
                    .on("change", (e) => {
                        const enableWhenValue = Array.isArray(c.enableWhen) ? c.enableWhen[0] : c.enableWhen;
                        $(parentInputInModal).val(e.target.value ? enableWhenValue : null);
                        $(parentInputInModal)[0].dispatchEvent(new Event('change'));
                    });
            }
        }
    }
}

function translate(word, variables = {}) {
    if (!elementTranslation[word]) return null;

    let result = null;
    if (elementTranslation[word][lang]) {
        result = elementTranslation[word][lang];
    } else {
        result = elementTranslation[word]["en"];
    }
    for (let [key, value] of Object.entries(variables)) {
        result = result.replace(`{${key}}`, value);
    }
    return result;
}

function parseAgeString(ageString) {
    let year = null,
        month = null,
        day = null;
    if (ageString?.includes("Y")) {
        let dateItems = ageString.split("Y");
        year = parseInt(dateItems[0]);
        ageString = dateItems[1];
    }
    if (ageString?.includes("M")) {
        let dateItems = ageString.split("M");
        month = parseInt(dateItems[0]);
        ageString = dateItems[1];
    }
    if (ageString?.includes("D")) {
        let dateItems = ageString.split("D");
        day = parseInt(dateItems[0]);
    }
    if (!Number.isInteger(year)) year = "";
    if (!Number.isInteger(month)) month = "";
    if (!Number.isInteger(day)) day = "";
    return [year, month, day];
}

let infoTranslations = {
    en: [
        {
            "What is CaseSharing?":
                'CaseSharing is a system for managing and sharing case information on rare and genetic diseases. The system can be used without user registration. Lets get an idea of how to use this system with <a href="/static/data/casesharing_sample_20260608.json" download="casesharing_sample_20260608.json" target="_blank">sample data</a>.',
        },
        {
            "Usable in a local environment":
                "Case information managed by CaseSharing is not stored in the cloud, but in your own computer. Case information can also be exported to the Phenopackets format, an international case information sharing format. This makes it easy for users to control their own information management and sharing.",
        },
        {
            "Encouraging collaboration":
                "In the future, CaseSharing will support not only Phenopackets but also other formats such as OMOP so that information can be shared smoothly with other systems. In addition, this system supports English, Japanese, Korean, Chinese, and other languages to facilitate information sharing with users around the world.",
        },
        {
            Disclaimer:
                'Please refer to <a href="/termsofservice?lang=en" target="_blank">this link</a>.',
        },
    ],
    ja: [
        {
            "CaseSharingとは？":
                'CaseSharingは、希少疾患・遺伝性疾患の症例情報を、管理・共有するためのシステムです。ユーザ登録なしに利用することができます。<a href="/static/data/casesharing_sample_20260608.json" download="casesharing_sample_20260608.json" target="_blank">サンプルデータ</a>を用いて本システムの使用イメージをつかみましょう。',
        },
        {
            ローカル環境で使える:
                "CaseSharingで管理する症例情報は、クラウドに保存するのではなく、自身のコンピュータに保存します。また、国際的な症例情報共有形式であるPhenopacketsで症例情報を出力することも可能です。これにより、情報管理や共有を自身でコントロールすることが容易となります。",
        },
        {
            コラボレーションを促進:
                "将来、他のシステムとスムーズに情報共有ができるように、Phenopacketsだけでなく、OMOPなど他の形式にも対応する予定です。また、本システムは英語、日本語、韓国語、中国語などの言語に対応しており、世界各地のユーザとの情報共有もスムーズになります。",
        },
        {
            免責事項:
                '<a href="/termsofservice" target="_blank">リンク先</a>を参照してください。',
        },
    ],
    ko: [
        {
            "CaseSharing이란?":
                'CaseSharing은 희귀 질환 및 유전성 질환의 사례 정보를 관리하고 공유하기 위한 시스템입니다. 사용자 등록 없이 이용할 수 있습니다. <a href="/static/data/casesharing_sample_20260608.json" download="casesharing_sample_20260608.json" target="_blank">샘플 데이터</a>를 활용하여 본 시스템의 사용 이미지를 파악해 봅시다.',
        },
        {
            "로컬 환경에서 사용 가능":
                "CaseSharing에서 관리하는 증례 정보는 클라우드에 저장하는 것이 아니라 자신의 컴퓨터에 저장합니다. 또한 국제적인 증례 정보 공유 형식인 Phenopackets로 증례 정보를 출력할 수도 있습니다. 이를 통해 정보 관리와 공유를 자체적으로 제어할 수 있습니다.",
        },
        {
            "협업 촉진":
                "미래에 다른 시스템과의 원활한 정보 공유를 위해 Phenopackets 뿐만 아니라 OMOP 등 다른 형식에도 대응할 예정입니다. 또한 본 시스템은 영어, 일본어, 한국어, 중국어 등의 다양한 언어를 지원하므로 전 세계 각지의 사용자들과 정보 공유도 원활해질 것입니다.",
        },
        {
            "면책 사항":
                '<a href="/termsofservice?lang=ko" target="_blank">링크</a>를 참조해 주시기 바랍니다.',
        },
    ],
    zh: [
        {
            "什么是个案分享？":
                '病例共享是一个管理和共享罕见病和遗传病病例信息的系统。无需用户注册即可使用该系统。让我们了解一下如何将此系统与<a href="/static/data/casesharing_sample_20260608.json" download="casesharing_sample_20260608.json" target="_blank">示例数据</a>一起使用。',
        },
        {
            可在本地环境中使用:
                "CaseSharing 管理的案例信息不存储在云端，而是存储在您自己的计算机中。案例信息还可以导出为 Phenopackets 格式，这是一种国际案例信息共享格式。这使得用户可以轻松控制自己的信息管理和共享。",
        },
        {
            鼓励合作:
                "未来, CaseSharing不仅支持Phenopackets, 还支持OMOP等其他格式, 以便与其他系统顺利共享信息。此外，该系统还支持英文、日文、韩文、中文等多种语言，方便与全球用户进行信息共享。",
        },
        {
            免责声明:
                '<a href="/termsofservice?lang=en" target="_blank">请参考这</a>个链接。',
        },
    ],
    zhcht: [
        {
            "什麼是個案分享？":
                '病例共享是一個管理和共享罕見病和遺傳病病例信息的系統。無需用戶註冊即可使用該系統。讓我們了解一下如何將此系統與<a href="/static/data/casesharing_sample_20260608.json" download="casesharing_sample_20260608.json" target="_blank">示例數據</a>一起使用。',
        },
        {
            可在本地環境中使用:
                "CaseSharing 管理的案例信息不存儲在雲端，而是存儲在您自己的計算機中。案例信息還可以導出為 Phenopackets 格式，這是一種國際案例信息共享格式。這使得用戶可以輕鬆控制自己的信息管理和共享。",
        },
        {
            鼓勵合作:
                "未來, CaseSharing不僅支持Phenopackets, 還支持OMOP等其他格式, 以便與其他系統順利共享信息。此外, 該系統還支持英文、日文、韓文、中文等多種語言，方便與全球用戶進行信息共享。",
        },
        {
            免責聲明:
                '請參考<a href="/termsofservice?lang=en" target="_blank">此鏈接</a>。',
        },
    ],
};

let modalContent = document.getElementById("modal-info-content");
modalContent.innerHTML = `
<img src="/static/record/images/logo_CaseSharing_RC.svg" class="info-case-img">        
<ul>
        <li>
            <i>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
            <defs>
                <clipPath id="clip-Info-case-01">
                <rect width="400" height="400"/>
                </clipPath>
            </defs>
            <g id="Info-case-01" clip-path="url(#clip-Info-case-01)">
                <path id="パス_124801" data-name="パス 124801" d="M33-16H295a49.056,49.056,0,0,1,49,49V178a49.056,49.056,0,0,1-49,49H33a49.056,49.056,0,0,1-49-49V33A49.056,49.056,0,0,1,33-16ZM295,195a17.019,17.019,0,0,0,17-17V33a17.019,17.019,0,0,0-17-17H33A17.019,17.019,0,0,0,16,33V178a17.019,17.019,0,0,0,17,17Z" transform="translate(36 45)"/>
                <path id="パス_124802" data-name="パス 124802" d="M26-16H302a42,42,0,0,1,0,84H26a42,42,0,0,1,0-84ZM302,36a10,10,0,0,0,0-20H26a10,10,0,0,0,0,20Z" transform="translate(36 303)"/>
                <circle id="楕円形_478" data-name="楕円形 478" cx="21.5" cy="21.5" r="21.5" transform="translate(88 96)" fill="#11101d"/>
                <circle id="楕円形_479" data-name="楕円形 479" cx="21.5" cy="21.5" r="21.5" transform="translate(88 157)" fill="#11101d"/>
                <path id="線_970" data-name="線 970" d="M128,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H128A16,16,0,0,1,144,0,16,16,0,0,1,128,16Z" transform="translate(174.5 117.5)"/>
                <path id="線_971" data-name="線 971" d="M128,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H128A16,16,0,0,1,144,0,16,16,0,0,1,128,16Z" transform="translate(174.5 178.5)"/>
            </g>
            </svg>
            </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][0])}</h4>
                <p>${Object.values(infoTranslations[lang][0])}
                </p>
            </span>
        </li>
        <li>
        <i>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
        <defs>
            <clipPath id="clip-Info-case-02">
            <rect width="400" height="400"/>
            </clipPath>
        </defs>
        <g id="Info-case-02" clip-path="url(#clip-Info-case-02)">
            <g id="グループ_56859" data-name="グループ 56859" transform="translate(119.571 119.777)">
            <path id="長方形_8102" data-name="長方形 8102" d="M-1.373-7.5h244.74A6.458,6.458,0,0,1,249.5-1.373v244.74a6.458,6.458,0,0,1-6.127,6.127H-1.373A6.458,6.458,0,0,1-7.5,243.367V-1.373A6.458,6.458,0,0,1-1.373-7.5ZM238.1,3.9H3.9V238.1H238.1Z" transform="translate(7.5 7.5)" fill="#1a1311"/>
            <path id="長方形_8102_-_アウトライン" data-name="長方形 8102 - アウトライン" d="M-1.373-15H243.368A13.984,13.984,0,0,1,257-1.373v244.74a13.984,13.984,0,0,1-13.627,13.627H-1.373A13.984,13.984,0,0,1-15,243.367V-1.373A13.984,13.984,0,0,1-1.373-15ZM230.6,11.4H11.4V230.6H230.6Z" transform="translate(7.5 7.5)" fill="#1a1311"/>
            <path id="楕円形_427" data-name="楕円形 427" d="M41.789-7.5A49.289,49.289,0,1,1-7.5,41.789,49.345,49.345,0,0,1,41.789-7.5Zm0,88.613A39.324,39.324,0,1,0,2.465,41.789,39.368,39.368,0,0,0,41.789,81.113Z" transform="translate(81.615 48.258)" fill="#1a1311"/>
            <path id="楕円形_427_-_アウトライン" data-name="楕円形 427 - アウトライン" d="M41.789-15A56.789,56.789,0,1,1-15,41.789,56.853,56.853,0,0,1,41.789-15Zm0,88.613A31.824,31.824,0,1,0,9.965,41.789,31.86,31.86,0,0,0,41.789,73.613Z" transform="translate(81.615 48.258)" fill="#1a1311"/>
            <path id="パス_104805" data-name="パス 104805" d="M4.089,91.084A5.7,5.7,0,0,1-1.585,84.8c.084-.814,9.3-81.436,83.471-82.639,67.63-1.088,84.865,78.341,85.031,79.143a5.7,5.7,0,0,1-11.158,2.317c-.607-2.9-15.529-71-73.689-70.066-64,1.038-72.01,69.513-72.32,72.427A5.7,5.7,0,0,1,4.089,91.084Z" transform="translate(45.803 163.786)" fill="#1a1311"/>
            <path id="パス_104805_-_アウトライン" data-name="パス 104805 - アウトライン" d="M4.089,98.584H3.7L2.7,98.511A13.214,13.214,0,0,1-9.045,84.028c.091-.88,10.061-88.055,90.809-89.364l1.495-.012c72.53,0,90.826,84.282,91,85.133a13.2,13.2,0,0,1-25.843,5.374c-.548-2.618-14-64.111-65.164-64.111l-1.064.009c-57.435.931-64.7,63.076-64.983,65.721A13.171,13.171,0,0,1,4.089,98.584Z" transform="translate(45.803 163.786)" fill="#1a1311"/>
            </g>
            <g id="グループ_56860" data-name="グループ 56860" transform="translate(22.572 19.714)">
            <path id="前面オブジェクトで型抜き_3" data-name="前面オブジェクトで型抜き 3" d="M98.67,256.993H6.133A6.454,6.454,0,0,1,0,250.868V6.13A6.457,6.457,0,0,1,6.133,0H250.869A6.459,6.459,0,0,1,257,6.13V100.5H245.6V11.4H11.4V245.6H98.67v11.394Z" transform="translate(0 0)" fill="#1a1311"/>
            <path id="前面オブジェクトで型抜き_3_-_アウトライン" data-name="前面オブジェクトで型抜き 3 - アウトライン" d="M98.67,264.493H6.133A13.985,13.985,0,0,1-7.5,250.868V6.13A13.987,13.987,0,0,1,6.133-7.5H250.869A13.987,13.987,0,0,1,264.5,6.13V108H238.1V18.9H18.9V238.1H106.17v26.394Z" transform="translate(0 0)" fill="#1a1311"/>
            </g>
        </g>
        </svg>
        </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][1])}</h4>
                <p>${Object.values(infoTranslations[lang][1])}
                </p>
            </span>
        </li>
        <li>
        <i>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
            <defs>
                <clipPath id="clip-path">
                <rect id="長方形_8895" data-name="長方形 8895" width="379.264" height="336.2" fill="none" stroke="#707070" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
                </clipPath>
                <clipPath id="clip-Info-case-03">
                <rect width="400" height="400"/>
                </clipPath>
            </defs>
            <g id="Info-case-03" clip-path="url(#clip-Info-case-03)">
                <g id="グループ_56862" data-name="グループ 56862" transform="translate(10.367 31.9)">
                <g id="グループ_56861" data-name="グループ 56861" transform="translate(0 0)" clip-path="url(#clip-path)">
                    <path id="パス_124800" data-name="パス 124800" d="M179.281,321.138A51.336,51.336,0,0,1,142.733,306L55.943,219.2a51.961,51.961,0,0,1-.713-72.388l46.186-48.033a44.863,44.863,0,0,1,62.9-1.542l22.317,21.04a12.461,12.461,0,0,0,17.356-17.88L130.355,26.769a19.7,19.7,0,0,0-27.858,0L26.769,102.5a19.721,19.721,0,0,0,0,27.858A16,16,0,1,1,4.142,152.983a51.757,51.757,0,0,1,0-73.113L79.87,4.142a51.7,51.7,0,0,1,73.114,0L179.7,30.86l19.8-18.147a44.852,44.852,0,0,1,60.933.478l87.594,82.859a51.7,51.7,0,0,1,1.383,73.756L216.2,305.638a51.315,51.315,0,0,1-36.643,15.5ZM133.649,117.083a12.683,12.683,0,0,0-9.168,3.883L78.3,169a19.8,19.8,0,0,0,.273,27.579l86.79,86.793a19.7,19.7,0,0,0,27.987-.135L326.569,147.4a19.7,19.7,0,0,0-.527-28.1l-87.6-82.862a12.745,12.745,0,0,0-17.316-.135L202.35,53.509l24.265,24.265a44.461,44.461,0,0,1-61.936,63.79l-22.313-21.037A12.671,12.671,0,0,0,133.649,117.083Z" transform="translate(13.029 13.03)"/>
                    <path id="線_972" data-name="線 972" d="M0,76.64a15.945,15.945,0,0,1-11.131-4.508,16,16,0,0,1-.36-22.625l58.74-60.64a16,16,0,0,1,22.625-.36,16,16,0,0,1,.36,22.625l-58.74,60.64A15.954,15.954,0,0,1,0,76.64Z" transform="translate(95.96 172.732)"/>
                    <path id="線_973" data-name="線 973" d="M0,76.64a15.945,15.945,0,0,1-11.131-4.508,16,16,0,0,1-.36-22.625l58.74-60.64a16,16,0,0,1,22.625-.36,16,16,0,0,1,.36,22.625l-58.74,60.64A15.954,15.954,0,0,1,0,76.64Z" transform="translate(128.415 205.186)"/>
                    <path id="線_974" data-name="線 974" d="M0,76.64a15.945,15.945,0,0,1-11.131-4.508,16,16,0,0,1-.36-22.625l58.74-60.64a16,16,0,0,1,22.625-.36,16,16,0,0,1,.36,22.625l-58.74,60.64A15.954,15.954,0,0,1,0,76.64Z" transform="translate(163.476 239.247)"/>
                </g>
                </g>
            </g>
            </svg>
            </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][2])}</h4>
                <p>${Object.values(infoTranslations[lang][2])}
                </p>
            </span>
        </li>
        <li>
        <i>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="400" height="400" viewBox="0 0 400 400">
        <defs>
            <clipPath id="clip-path">
            <rect id="長方形_8897" data-name="長方形 8897" width="309" height="377" transform="translate(-0.285 0.346)" fill="none" stroke="#707070" stroke-width="32"/>
            </clipPath>
            <clipPath id="clip-Info-case-04">
            <rect width="400" height="400"/>
            </clipPath>
        </defs>
        <g id="Info-case-04" clip-path="url(#clip-Info-case-04)">
            <g id="グループ_56864" data-name="グループ 56864" transform="translate(46.777 11.79)">
            <g id="グループ_56863" data-name="グループ 56863" transform="translate(-0.492 -0.136)" clip-path="url(#clip-path)">
                <path id="長方形_8896" data-name="長方形 8896" d="M0-16H269A16,16,0,0,1,285,0V261a16,16,0,0,1-16,16H0a16,16,0,0,1-16-16V0A16,16,0,0,1,0-16ZM253,16H16V245H253Z" transform="translate(19.715 19.346)"/>
                <path id="パス_124801" data-name="パス 124801" d="M273.458,168.7H34.709A45.761,45.761,0,0,1-11,123V71a16,16,0,0,1,32,0v52A13.725,13.725,0,0,0,34.709,136.7H257.458V71a16,16,0,0,1,32,0v81.7A16,16,0,0,1,273.458,168.7Z" transform="translate(14.986 205.386)"/>
                <path id="線_975" data-name="線 975" d="M121,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H121A16,16,0,0,1,137,0,16,16,0,0,1,121,16Z" transform="translate(93.715 97.346)"/>
                <path id="線_976" data-name="線 976" d="M121,16H0A16,16,0,0,1-16,0,16,16,0,0,1,0-16H121A16,16,0,0,1,137,0,16,16,0,0,1,121,16Z" transform="translate(93.715 163.346)"/>
            </g>
            </g>
        </g>
        </svg>
        </i>
            <span>
                <h4>${Object.keys(infoTranslations[lang][3])}</h4>
                <p>${Object.values(infoTranslations[lang][3])}
                </p>
            </span>
        </li>
    </ul>
`;
