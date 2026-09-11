let modalTableSettings = {
    rowHeaders: true,
    width: "100%",
    height: "auto",
    autoColumnSize: {
        useHeaders: true,
    },
    afterGetRowHeader: (row, TH) => {
        TH.className = "htMiddle";
    },
    contextMenu: true,
    allowRemoveColumn: false,
    trimDropdown: false,
};

let geneHot, geneContainer;
let geneHeaders = [],
    geneColumns = [],
    geneDataKey = [];
let geneSchema = {},
    geneData = [],
    currentGeneData = [];

function updateSubtables() {
    let patientData = contentData.filter((d) => {
        return d.PCFNo == currentPatient;
    })[0];
    for (let groupId in inputGroupInfo) {
        if (inputGroupInfo[groupId].onlyJapanese && lang !== "ja") continue;
        clearInputGroupRows(groupId);
        let columns = inputGroupInfo[groupId].columns;
        let inputLength = patientData?.[columns[0].columnId]?.length;
        if (inputLength > 0) {
            for (let i = 0; i < inputLength; i++) {
                let rowContainer = addNewInputGroupRow(groupId);
                for (let column of columns) {
                    if (!column.nestedGroup)
                        updateModalInputValue(
                            rowContainer,
                            column,
                            patientData[column.columnId]?.[i]
                        );
                }
            }
        } else {
            // Just add one empty row
            addNewInputGroupRow(groupId);

            for (let column of columns) {
                patientData[column.columnId] = [column.defaultValue || null];
            }
        }
    }
}

function addGeneRow() {
    geneHot.alter("insert_row_below", geneHot.countRows());
}

function groupContainerClassName(inputGroupId) {
    return `group-container-${inputGroupId}`;
}

function addNewInputGroupRow(inputGroupId) {
    let groupContainer = document.getElementsByClassName(
        groupContainerClassName(inputGroupId)
    )[0];
    let rowContainer = createRowContainer(
        inputGroupInfo[inputGroupId].columns,
        groupContainer,
        inputGroupInfo[inputGroupId].shareHeader
    );
    return rowContainer;
}

function createRowContainer(
    columns,
    parent,
    shareHeader,
    forNestedGroup = false,
    onDeleteButtonClick = null
) {
    let rowContainer = document.createElement("div");
    if (shareHeader) {
        rowContainer.className = "input-group-row share-header-row";
    } else {
        rowContainer.className = "input-group-row group-area-container";
    }
    parent.appendChild(rowContainer);
    let rowIndex = Array.from(rowContainer.parentNode.children).indexOf(
        rowContainer
    );
    let patientData = contentData.filter((d) => {
        return d.PCFNo == currentPatient;
    })[0];

    let addedNestedGroup = new Set();

    columns.forEach((column, index) => {
        if (column.nestedGroup && !forNestedGroup) {
            if (addedNestedGroup.has(column.nestedGroup)) {
                return;
            }
            addedNestedGroup.add(column.nestedGroup);
            let containerClass = groupContainerClassName(column.nestedGroup);
            addGroupSection(
                rowContainer,
                containerClass,
                column,
                nestedGroupInfo[column.nestedGroup].shareHeader,
                () => {
                    let groupContainer =
                        rowContainer.getElementsByClassName(containerClass)[0];
                    createRowContainer(
                        nestedGroupInfo[column.nestedGroup].columns,
                        groupContainer,
                        false,
                        true,
                        onDeleteNestedColumnClicked
                    );
                    for (let nestedColumn of nestedGroupInfo[column.nestedGroup].columns) {
                        patientData[nestedColumn.columnId][rowIndex] =
                            patientData[nestedColumn.columnId][rowIndex] || [];
                        patientData[nestedColumn.columnId][rowIndex].push(
                            nestedColumn.defaultValue || null
                        );
                    }
                },
                groupLabels[column.nestedGroup]
            );
            let groupContainer =
                rowContainer.getElementsByClassName(containerClass)[0];
            let inputLength =
                patientData?.[column.columnId]?.[rowIndex]?.length;
            function onDeleteNestedColumnClicked(e) {
                if (confirm(translate("comfirm-delete"))) {
                    const currentGroupContainer = $(e.target).closest(".input-group-row")[0];
                    const currentNestedIndex = Array.from(
                        currentGroupContainer.parentNode.children
                    ).indexOf(currentGroupContainer);
                    const currentRowIndex = Array.from(rowContainer.parentNode.children).indexOf(
                        rowContainer
                    );
                    for (let nestedColumn of nestedGroupInfo[column.nestedGroup].columns) {
                        patientData[nestedColumn.columnId][currentRowIndex]?.splice(
                            currentNestedIndex,
                            1
                        );
                    }
                    $(e.target).closest(".input-group-row").remove();
                }
            }

            if (inputLength > 0) {
                for (let i = 0; i < inputLength; i++) {
                    let nestedRowContainer = createRowContainer(
                        nestedGroupInfo[column.nestedGroup].columns,
                        groupContainer,
                        false,
                        true,
                        onDeleteNestedColumnClicked
                    );
                    for (let nestedColumn of nestedGroupInfo[column.nestedGroup]
                        .columns) {
                        updateModalInputValue(
                            nestedRowContainer,
                            nestedColumn,
                            patientData[nestedColumn.columnId][rowIndex]?.[i]
                        );
                    }
                }
            } else {
                createRowContainer(
                    nestedGroupInfo[column.nestedGroup].columns,
                    groupContainer,
                    false,
                    true,
                    onDeleteNestedColumnClicked
                );
                for (let nestedColumn of nestedGroupInfo[column.nestedGroup].columns) {
                    patientData[nestedColumn.columnId] =
                        patientData[nestedColumn.columnId] || [];
                    patientData[nestedColumn.columnId][rowIndex] = [
                        nestedColumn.defaultValue || null,
                    ];
                }
            }
        } else {
            createModalInput(rowContainer, column, shareHeader);
        }
        if (shareHeader && index === Object.keys(columns).length - 1) {
            let container = document.createElement("div");
            let tr = $(rowContainer.lastChild).closest("tr")[0];
            container.classList.add("form-container");
            tr.appendChild(container);
            addDeleteButton(container);
        }
    })
    if (!shareHeader) {
        addDeleteButton(rowContainer);
    }

    function addDeleteButton(target) {
        let deleteButton = document.createElement("div");
        deleteButton.className = "delete-input-group-row-btn";
        if (onDeleteButtonClick) {
            deleteButton.onclick = onDeleteButtonClick;
        } else {
            deleteButton.onclick = function () {
                if (confirm(translate("comfirm-delete"))) {
                    const currentRowIndex = Array.from(rowContainer.parentNode.children).indexOf(
                        rowContainer
                    );
                    for (let column of columns) {
                        patientData[column.columnId].splice(currentRowIndex, 1);
                    }
                    parent.removeChild(rowContainer);
                }
            };
        }
        $(target).append(deleteButton);
    }

    return rowContainer;
}

function clearInputGroupRows(inputGroupId) {
    let groupContainer = document.getElementsByClassName(
        groupContainerClassName(inputGroupId)
    )[0];
    if (groupContainer) groupContainer.innerHTML = "";
}

function resetData() {
    geneHeaders = [];
    geneColumns = [];
    geneDataKey = [];
    geneSchema = {};
    geneData = [];

    if (geneHot) {
        Object.assign(modalTableSettings, {
            licenseKey: handsontableLicenseKey,
        });
        const geneSettings = JSON.parse(JSON.stringify(modalTableSettings));
        geneHot.updateSettings(geneSettings);
        geneHot.render();
    }
}

function deleteModalRenderer(
    instance,
    td,
    row,
    col,
    prop,
    value,
    cellProperties
) {
    Handsontable.renderers.BaseRenderer.apply(this, arguments);

    td.innerHTML = `<div class="list-icon list-delete"></div>`;
    td.onclick = function () {
        if (confirm(translate("comfirm-delete"))) {
            instance.alter("remove_row", row, 1);
        }
    };
}

Handsontable.renderers.registerRenderer(
    "deleteModalRenderer",
    deleteModalRenderer
);
