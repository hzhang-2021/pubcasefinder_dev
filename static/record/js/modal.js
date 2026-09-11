$(".modal_open").click(() => {
    openModal(false);
});

$("#nav-info").click(() => {
    openInfo();
});

$("#nav-menu").click(() => {
    closeKarteModal();
});

$("#nav-service").click(() => {
    closeKarteModal();
});

$("#nav-language").click(() => {
    closeKarteModal();
});

$("#menu-save").click((e) => {
    closeKarteModal();
    if (e.target.closest(".save-panel")) return;
    $(".save-panel").toggleClass("save-panel-open");
    $("#menu-save .popup-bg-cover").addClass("active");
});

$("#menu-save .popup-bg-cover").click(() => {
    $(".save-panel").removeClass("save-panel-open");
    $("#menu-save .popup-bg-cover").removeClass("active");
});

$(document).mouseup((e) => {
    const container = $(".save-panel");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.removeClass("save-panel-open");
        $("#menu-save .popup-bg-cover").removeClass("active");
    }
});

function updateStatusOfPhenopacketButton() {
    let disabled = !getProbandForPhenopackets(currentPatient);

    $("button.modal-phenopackets").prop("disabled", disabled);
    // Set the tooltip
    if (disabled) {
        $("button.modal-phenopackets").attr(
            "title",
            translate("message_for_error_no_proband_in_family").replace("{target}", "Phenopackets")
        );
    } else {
        $("button.modal-phenopackets").attr("title", "");
    }
}

$(".nav-list a").on("click", closeKarteModal);

function dataValueToTranslated(columnOptions, dataValue) {
    let translated = dataValue;

    let translatedOptions =
        columnOptions[lang]?.length > 0
            ? columnOptions[lang]
            : columnOptions["en"];

    let index = columnOptions.dataValue.indexOf(dataValue);
    if (index > -1) {
        translated = translatedOptions[index];
    }

    return translated;
}

function translatedToDataValue(columnOptions, translatedValue) {
    let dataValue = translatedValue;

    let translatedOptions =
        columnOptions[lang]?.length > 0
            ? columnOptions[lang]
            : columnOptions["en"];

    let index = translatedOptions.indexOf(translatedValue);
    if (index > -1) {
        dataValue = columnOptions.dataValue[index];
    }

    return dataValue;
}

function updateModalInputValue(parent, column, value) {
    function showHideDeathDate(parent, value) {
        if (value === "deceased") {
            parent.show();
        } else {
            parent.hide();
        }
    }

    let element,
        colId = column.columnId;
    if (column.inputType === "multi-checkbox") {
        let nameToDataValue = nameToDataValueMap[column.columnId];
        value = value || [];
        if (!Array.isArray(value)) value = [value];
        let dataValues = value.map((v) => nameToDataValue[v]);
        for (let v of column.options.dataValue) {
            let input = parent.querySelector(
                `input[type=checkbox][name=${column.columnId}][value=${v}]`
            );
            let oldValue = input.checked;
            input.checked = dataValues.includes(v);
            if (oldValue !== input.checked)
                input.dispatchEvent(new Event("change"));
        }
        return;
    }

    if (
        column.inputType === "select-age" ||
        column.inputType === "select-date"
    ) {
        element = parent.querySelector(`*[name="${colId}_year"]`);
    } else {
        if (column.options && !column.autocomplete) {
            value = translatedToDataValue(column.options, value);
        }
        element = parent.querySelector(`*[data-columnname="${colId}"]`);
    }
    if (column.inputType === "readOnly") {
        element = parent.querySelector(`label[data-columnname="${colId}"]`);
        element.innerText = value || "";
        return;
    }
    if (!element) return;

    if (colId === columnKeys.CASE_RELATIONSHIP) {
        updateExtraInputFieldsForRelationship(
            value,
            $('#relationship_id_in_case_info'),
            currentPatient,
            true
        );
    } else if (colId === columnKeys.CASE_LIFE_STATUS) {
        let parent = $(`#${columnKeys.CASE_DEATH}`).parent();
        showHideDeathDate(parent, "deceased");
    } else if (column.inputType === "select-date") {
        let monthId = `${column.columnId}_month`;
        let date = value ? value.toString().split("/") : [""];
        let yearValue = date[0];
        if (yearValue) element.value = yearValue;

        let monthElement = parent.querySelector(
            `.tab-wrap *[name="${monthId}"]`
        );
        let monthValue = date[1];
        if (monthValue) monthElement.value = monthValue;

        if (colId === `${columnKeys.CASE_BIRTH}_year`) {
            changeDeathOptions("year");
            changeDeathOptions("month");
        }
        let dayId = `${column.columnId}_day`;
        let dayElement = parent.querySelector(`.tab-wrap *[name="${dayId}"]`);
        if (dayElement) {
            let dayValue = date[2];
            if (dayValue) dayElement.value = dayValue;
        }
        return;
    } else if (column.inputType === "select-age") {
        let [year, month, day] = parseAgeString(value ? value.toString() : "");
        if (year !== "") element.value = year;

        let monthElement = parent.querySelector(
            `.tab-wrap *[name="${colId}_month"]`
        );
        if (month !== "") monthElement.value = month;
        let dayElement = parent.querySelector(
            `.tab-wrap *[name="${colId}_day"]`
        );
        if (day !== "") dayElement.value = day;
        return;
    }

    let type = element.type;

    if (!value) {
        if (!column.defaultValue && !column.options) {
            $(element).change();
            return;
        }
        value = column.defaultValue;
        if (!value && column.options && column.inputType === "radio")
            value = column.options?.dataValue?.[0];
    }

    if (type === "radio") {
        let radio = $(parent)
            .find(`input[data-columnname="${colId}"][value="${value}"]`)
            .prop("checked", true);
        if (radio.length > 0) {
            radio.change();
        } else {
            $(parent)
                .find(`input[data-columnname="${colId}"][value="${value}"]`)
                .change();
        }
    } else {
        if (column.inputType === "number-with-unknown") {
            let unknown = value === "unknown" || value === translate("unknown");
            parent.querySelector(
                `input[name="${colId}"][type="checkbox"]`
            ).checked = unknown;
            element.disabled = unknown;
            if (!unknown) element.value = value;
        } else if (column.inputType === "select") {
            if (column.autocomplete) {
                if (value) element.value = value;
            } else {
                let translatedValue =
                    nameToDataValueMap?.[column.columnId]?.[value] || value;
                if (translatedValue) element.value = translatedValue;
            }
        } else if (column.inputType === "date") {
            element.value = value ? value.replace(/\//g, '-') : value;
        } else {
            element.value = value;
        }
        $(element).change();
    }

    if(column.smartTextBox && element.updateIdListLabel) {
        element.updateIdListLabel();
    }
}

function openModal(patientId) {
    var modal = "#modal-karte";
    toReset = true;

    if ($(modal).css("display") === "block") {
        editTable(true);
    }

    modalReset();

    modalResize();
    populateGroupFamilyOptions("group_options");
    populateGroupFamilyOptions("family_options");

    inputValues();

    $(modal).fadeIn();

    updateSubtables();

    $(".modal-close, .modal-copy")
        .off()
        .click(function (e) {
            editTable($(this).hasClass("modal-close"));
            // Avoid bugs when modal-close is double clicked
            if ($(this).hasClass("modal-close")) $(this).off();

            if ($(this).hasClass("modal-copy")) copyPatient();

            $(".modal_box").fadeOut();

            // iPad Chrome対応: モーダルを閉じた後にセル選択を解除してフォーカス状態をクリア
            if (typeof hot !== 'undefined' && hot.deselectCell) {
                hot.deselectCell();
            }
        });
    //This will be activated again when we go live.
    $(".modal-phenopackets")
        .off()
        .click(function (e) {
            $('.phenopacket-save-panel').show()
            $('#modal-karte .popup-bg-cover').show()
        });
    $(".phenopacket-save-button").off().click(() => {
        const formatType = $(".phenopacket-format-select").val();
        generatePhenopackets(formatType)
    })

    $('#modal-karte .popup-bg-cover').click(() => {
        $('.phenopacket-save-panel').hide()
        $('#modal-karte .popup-bg-cover').hide()
    });

    $(window).on("resize", function () {
        modalResize();
    });

    updatePedigreeArea();
    updateStatusOfPhenopacketButton();

    function modalResize() {
        var w = $(window).width();
        var h = $(window).height();

        var x = (w - $(modal).outerWidth(true)) / 2;
        var y = (h - $(modal).outerHeight(true)) / 2;

        $(modal).css({ left: x + "px", top: y + "px" });
    }

    function modalReset() {
        $(
            `.tab-wrap input[type="text"], .tab-wrap input[type="number"], .tab-wrap input[type="date"], .tab-wrap textarea, .tab-wrap select`
        ).val("");
        $(".tab-wrap input:radio").prop("checked", false);
        $(`#${columnKeys.CASE_DEATH}`).parent().hide();
        for (let category of categories) {
            for (let column of category.columns) {
                if (column.inputType === "select-date") {
                    dateOptions(column.columnId, column.includeDay);
                }
                if (column.inputType === "select-age") {
                    dateOptions(column.columnId, true, false);
                    setOptionsForAge(column.columnId);
                }
            }
        }

        // add by hzhang@bits start
        phenotypeInfo_reset();
        // add by hzhang@bits end

        $(`input[name="${columnKeys.CASE_PARENT_ID}]`).hide();
        $(`input[name="${columnKeys.CASE_SPOUSE_ID}]`).hide();
    }

    function setOptionsForAge(columnId) {
        let parent = document.querySelector(`.tab-wrap`);
        // For month
        let options = `<option value="-">${translate(
            "select-age-month"
        )}</option>`;
        for (let i = 0; i <= 11; i++) {
            options += `<option value="${i}">${i}</option>`;
        }
        parent.querySelector(`*[name="${columnId}_month"]`).innerHTML = options;

        // For day
        let dayElement = parent.querySelector(`*[name="${columnId}_day"]`);
        if(dayElement) {
            parent.querySelector(`*[name="${columnId}_day"]`).innerHTML =
                createDayOptions(false);
        }
    }

    function populateGroupFamilyOptions(element) {
        let parent = document.getElementById(element);
        if (!parent) return;

        parent.innerHTML = "";
        let data =
            element === "group_options"
                ? JSON.parse(JSON.stringify(groupOptions))
                : JSON.parse(JSON.stringify(familyOptions));

        let firstOption =
            element === "group_options"
                ? translate("select-group")
                : translate("select-family");
        data.unshift(firstOption);

        data.forEach((d) => {
            let option = document.createElement("option");
            option.value = d;
            option.innerText = d;
            parent.appendChild(option);
        });
    }

    function inputValues() {
        let patientData = {};
        let PCFNo = "";
        let shareId = '';
        if (patientId) {
            patientData = contentData.filter((d) => {
                return d.PCFNo == patientId;
            })[0];
            currentPatient = patientData["PCFNo"];
            PCFNo = patientData["PCFNo"];
            shareId = patientData[columnKeys.SHARE_ID] ?? '-';
        } else {
            addRow();
            patientData = contentData[contentData.length - 1];
            currentPatient = patientData["PCFNo"];
            PCFNo = patientData["PCFNo"];
            shareId = patientData[columnKeys.SHARE_ID] ?? '-';
        }
        window.__currentPatientForMatchingForm = currentPatient;
        window.dispatchEvent(new CustomEvent('matchingFormPatientChange', { detail: { pcfNo: currentPatient } }));

        const caseInfoEl = document.getElementById(`tbody_${columnKeys.CASE_INFO}`);
        caseInfoEl.querySelector("#PCFNo").nextElementSibling.innerHTML = PCFNo;
        caseInfoEl.querySelector(`#${columnKeys.SHARE_ID}`).nextElementSibling.innerHTML = shareId;

        categories.forEach((category) => {
            // modified by hzhang@bits start
            if (category.categoryId === columnKeys.PHENOTYPE_INFO) {
                phenotypeInfo_inputValues(patientData);
                return;
            }
            // modified by hzhang@bits end

            category.columns.forEach((c) => {
                if (!c.groupBy)
                    updateModalInputValue(
                        document.querySelector(".tab-wrap"),
                        c,
                        patientData[c.columnId]
                    );
            });
        });
    }
}

// TODO!! update
function generatePhenopackets(formatType) {
    let patientData = contentData.filter((d) => {
        return d.PCFNo == currentPatient;
    })[0];
    if (!patientData) return;

    try {
        let jsonString = JSON.stringify(
            patientDataToPhenopacketFamily(patientData)
        );
        const exportData = formatType === "yaml" ? YAML.stringify(YAML.parse(jsonString), 10) : jsonString
        exportFile(formatType, exportData);

        function exportFile(type, file) {
            let a = document.createElement("a");
            a.download = `patients_${Date.now()}.${type}`;
            a.style.visibility = "hidden";
            const contentType = {
                "yaml": "text/yaml;charset=utf-8",
                "json": "application/json"
            }

            let data =
                `${contentType[type]},` +
                `${encodeURIComponent(file)}`;
            a.href = `data:${data}`;

            document.body.appendChild(a);
            a.click();
            a.remove();
        }
    } catch (e) {
        console.error(e);
        alert(e);
    }
}

function copyPatient() {
    let patientId =
        document.getElementById("PCFNo").nextElementSibling.innerHTML;
    let patientData = contentData.filter((d) => {
        return d.PCFNo == patientId;
    })[0];
    if (!patientData) return;

    let temp = JSON.parse(JSON.stringify(patientData));
    delete temp.PCFNo;
    delete temp.share_id;
    delete temp.submission_id;

    addRow(temp);
}

function openInfo() {
    closeKarteModal();

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

function closeKarteModal() {
    if ($("#modal-karte").css("display") === "block") {
        $("#modal-karte").fadeOut();

        // iPad Chrome対応: モーダルを閉じた後にセル選択を解除してフォーカス状態をクリア
        if (typeof hot !== 'undefined' && hot.deselectCell) {
            hot.deselectCell();
        }
    }
}

//resize handle
const modal = document.querySelector("#modal-karte");

let isResizing = false;
let lastX = 0;
if (modal) {
    const resizeHandle = modal.querySelector(".resize-handle");

    resizeHandle.addEventListener("mousedown", (event) => {
        isResizing = true;
        lastX = event.clientX;
    });
}

document.addEventListener("mousemove", (event) => {
    if (!isResizing) return;

    const delta = event.clientX - lastX;
    lastX = event.clientX;
    const modalWidth = parseInt(
        getComputedStyle(modal).getPropertyValue("width")
    );
    let newWidth = modalWidth - delta;
    if (newWidth < 400) newWidth = 400;
    if (newWidth < 760) {
        document
            .querySelectorAll("#modal-karte .tab-wrap ul .tab-btn span")
            .forEach((elem) => (elem.style.display = "none"));
    } else {
        document
            .querySelectorAll("#modal-karte .tab-wrap ul .tab-btn span")
            .forEach((elem) => (elem.style.display = "block"));
    }

    modal.style.width = newWidth + "px";
});

document.addEventListener("mouseup", () => {
    isResizing = false;
});
