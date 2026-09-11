let charts = {}

const sexLabelValueList = ["male", "female", "other", "unknown"];
function toggleTableChart(type) {
    $('.sidebar-selected').removeClass('sidebar-selected')
    if (type === 'table') {
        document.getElementById('content-patients').style.display = 'block'
        document.getElementById('charts-patients').style.display = 'none'
        document.getElementById('myGrid').click()
        $('.sidebar-patients').addClass('sidebar-selected')
    } else if (type === 'chart') {
        document.getElementById('content-patients').style.display = 'none'
        document.getElementById('charts-patients').style.display = 'block'
        $('.sidebar-analytics').addClass('sidebar-selected')
        createChart()
    }
}

function createChart() {
    createCaseCount();
    createMostCount(
        'family',
        familyOptions,
        columnKeys.CASE_FAMILY_ID
    );
    createMostCount(
        'group',
        groupOptions,
        columnKeys.CASE_GROUP
    );

    function createCaseCount() {
        let container = document.getElementById('chart-case-count');
        const title = translate('chart-title-case-count');
        const totalCount = contentData.length;
        container.innerHTML = `
            <div class="chart-count-title case">${title}</div>
            <div class="chart-count-number">${totalCount}</div>
        `;

        let dl = document.createElement("dl");
        dl.classList.add('chart-case-count-list');
        dataColumns[columnKeys.MEDICAL_CASE_SOLVED].column.source.forEach(label => {
            const count = contentData.filter(d => d[columnKeys.MEDICAL_CASE_SOLVED] === label).length;
            dl.innerHTML += `<dt>${count}件</dt><dd>${label}</dd>`;
        })
        container.appendChild(dl);
    }

    function createMostCount(type, options, columnId) {
        let container = document.getElementById(`chart-${type}-count`)
        const totalCount = options.length;
        let mostName = '-';
        if (totalCount > 0) {
            let maxCount = 0;
            options.forEach(option => {
                const count = contentData.filter(d => d[columnId] === option).length;
                if (count > maxCount) {
                    maxCount = count;
                    mostName = option;
                } else if (count === maxCount) {
                    mostName += `, ${option}`;
                }
            })
        }
        container.innerHTML = `
            <div class="chart-count-title ${type}">${translate(`chart-title-${type}-count`)}</div>
            <div class="chart-count-number">${totalCount}</div>
            <div class="chart-count-most">
                <div class="chart-count-most-title">${translate(`chart-count-most-${type}`)}:</div>
                <div class="chart-count-most-name">${mostName}</div>
            </div>
        `;
    }

    Object.values(charts).forEach(c => c.destroy())

    let sexAgeData = filterData(contentData)
    createMultipleBarChart(document.getElementById('pie-chart-age'), sexAgeData, translate('chart-title-age'))

    let sexData = contentData.map(d => d[columnKeys.CASE_SEX])
    $("#chart-container-sex-title").text(translate('chart-title-sex'))
    createPieChart(document.getElementById('pie-chart-sex'), sexData, translate('chart-title-sex'))

    let groupData = contentData.map(d => d[columnKeys.CASE_GROUP])
    createBarChart(document.getElementById('bar-chart-group'), groupData, translate('chart-title-group'))

    function createPieChart(container, data, title) {
        let ctx = container.getContext('2d')
        let dataObject = {}

        for (let key of data) {
            let displayKey = key || translate('chart-title-null')
            dataObject[displayKey] = dataObject[displayKey] ? dataObject[displayKey] + 1 : 1
        }
        let translatedSexLabelValues = sexLabelValueList.map((labelValue) => dataValueToTranslated(sexColumnInfo.options, labelValue));
        let dataset = translatedSexLabelValues.map((labelValue) => dataObject[labelValue] || 0);

        let chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: translatedSexLabelValues,
                datasets: [{
                    data: dataset,
                    backgroundColor: ['#a0d0f6', '#ffb3c2', '#ffcfa3', '#ccc']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        })

        charts.pieChart = chart
    }

    function createBarChart(container, data, title) {
        let ctx = container.getContext('2d')

        let dataObject = {}

        for (let key of data) {
            let displayKey = key || translate('chart-title-null')
            dataObject[displayKey] = dataObject[displayKey] ? dataObject[displayKey] + 1 : 1
        }

        let chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(dataObject),
                datasets: [{
                    data: Object.values(dataObject)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            callback: function(value) {
                                const label = this.getLabelForValue(value);
                                return label.length > 15 ? `${label.substring(0, 15)}…` : label;
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: translate('chart-multiple-age-sex-y'),
                            align: 'center'
                        },
                        ticks: {
                            display: true,
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: title,
                        position: 'top',
                        align: 'start',
                        font: {
                            size: 14
                        },
                        padding: { top: 10, bottom: 18 }
                    }
                }
            }
        })
        charts.barChart = chart
    }

    function createMultipleBarChart(container, data, title) {
        let ctx = container.getContext('2d')

        let category = categories.filter(c => c.categoryId === columnKeys.CASE_INFO)
        let column = category[0].columns.filter(c => c.columnId === columnKeys.CASE_SEX)
        let labels = sexLabelValueList.map((labelValue) => dataValueToTranslated(column[0].options, labelValue));

        let dataSetsData = []
        let index = 0

        for (let [key, value] of Object.entries(data)) {
            if (index === 0) {
                sexLabelValueList.forEach((labelValue) => {
                    dataSetsData.push([value[labelValue]]);
                })
            } else {
                sexLabelValueList.forEach((labelValue, i) => {
                    dataSetsData[i].push(value[labelValue]);
                })
            }
            index++
        }

        let dataSet = []
        const backgroundColors = ['#a0d0f6', '#ffb3c2', '#ffcfa3', '#ccc'];
        for (let i = 0; i < 4; i++) {
            dataSet.push({
                label: labels[i],
                data: dataSetsData[i],
                backgroundColor: backgroundColors[i]
            })
        }

        let chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['0 ~ 9', '10 ~ 19', '20 ~ 29', '30 ~ 39', '40 ~ 49', '50 ~ 59', '60 ~', translate('chart-label-null')],
                datasets: dataSet,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: title,
                        position: 'top',
                        align: 'start',
                        font: {
                            size: 14
                        },
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: translate('chart-multiple-age-sex-x'),
                            align: 'center'
                        },
                        ticks: {
                            display: true,
                            precision: 0
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: translate('chart-multiple-age-sex-y'),
                            align: 'center'
                        },
                        ticks: {
                            display: true,
                            precision: 0
                        }
                    }
                }
            }
        })
        charts.multipleBarChart = chart
    }

    function filterData(data) {
        let ageGroup = {
            age0: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            },
            age10: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            },
            age20: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            },
            age30: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            },
            age40: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            },
            age50: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            },
            age60: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            },
            blank: {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0
            }
        }

        data.forEach(d => {
            let sex = translatedToDataValue(sexColumnInfo.options, d.case_sex);
            let age = d[columnKeys.CASE_AGE]
            if (!age) {
                ageGroup['blank'][sex] += 1
                return
            }
            const match = age.match(/^(\d+)Y(\d+)?M?(\d+)?D?$/);
            const years = parseInt(match[1]);
            const group = Math.floor(years / 10) * 10;
            if (group >= 60) {
                ageGroup['age60'][sex] += 1
                return
            }
            if (match) {
                const groupName = `age${group}`;
                ageGroup[groupName][sex] += 1
            } else {
                ageGroup['blank'][sex] += 1
            }
        })


        return ageGroup

    }

    // 年齢を数値に変換 ex) 35Y3M → 35.25
    const convertToDecimal = str => {
        if (!str) return
        const regex = /^(\d+Y)?(\d+M)?(\d+D)?$/
        const matches = str.match(regex)

        if (!matches) return null

        let years = 0
        let months = 0
        let days = 0

        if (matches[1]) years = parseInt(matches[1], 10)
        if (matches[2]) months = parseInt(matches[2], 10)
        if (matches[3]) days = parseInt(matches[3], 10)

        return years + months / 12 + days / 365
    }

    /* ↓↓↓診断名ごとの症状グラフ↓↓↓ */
    const container = document.getElementById('bar-chart-sympton')
    createSymptonsHorizontalBarChart(container)
    function createSymptonsHorizontalBarChart(container) {
        $("#chart-container-sympton-title").text(translate('chart-title-sympton'))
        const generateDatasetsByDiagnosis = () => {
            const phenotypeList = contentData.flatMap(d => {
                if (!d.medical_final_diagnosis_name) return []
                const filtered_medical_final_diagnosis_name = d.medical_final_diagnosis_name.filter(name => name)
                return filtered_medical_final_diagnosis_name.flatMap(medical_final_diagnosis => {
                    let phenotypeArray = []
                    Object.entries(d).forEach(([k, v]) => {
                        if (k.startsWith('phenotype')) {
                            if (phenotypeArray.length === 0) {
                                v.forEach(datam => phenotypeArray.push({ [k]: datam, medical_final_diagnosis }))
                            } else {
                                v.forEach((datam, i) => phenotypeArray[i] = { ...phenotypeArray[i], [k]: datam })
                            }
                            return
                        }
                    })
                    return phenotypeArray
                })
            })
            const infoByDiagnosis = {}
            phenotypeList.forEach(phenotype => {
                let onsetAge = convertToDecimal(phenotype.phenotype_age_onset)
                let resolutionAge = convertToDecimal(phenotype.phenotype_resolution)
                const diagnosis = phenotype.medical_final_diagnosis
                const label = phenotype.phenotype_hpo_label[`name_${lang}`] || phenotype.phenotype_hpo_label['name_en']
                // 片方だけ値が無い場合、片方の値を代入する
                if (onsetAge === undefined && resolutionAge !== undefined) onsetAge = resolutionAge
                if (onsetAge !== undefined && resolutionAge === undefined) resolutionAge = onsetAge
                // onsetAgeの方が大きい場合は
                if (onsetAge > resolutionAge) {
                    onsetAge = null
                    resolutionAge = null
                }
                const index = infoByDiagnosis[diagnosis]?.findIndex(info => info.label === label)
                if (infoByDiagnosis[diagnosis] && index >= 0) {
                    infoByDiagnosis[diagnosis][index].onsetAge.push(onsetAge)
                    infoByDiagnosis[diagnosis][index].resolutionAge.push(resolutionAge)
                    return
                }
                infoByDiagnosis[diagnosis] = [
                    ...(infoByDiagnosis[diagnosis] ? infoByDiagnosis[diagnosis] : []),
                    { onsetAge: [onsetAge], resolutionAge: [resolutionAge], label, phenotype_severity: phenotype.phenotype_severity }
                ]
            })
            Object.entries(infoByDiagnosis)
                .forEach(([diagnosis, infoList]) => {
                    infoByDiagnosis[diagnosis] = infoList.map(info => {
                        const filteredOnsetAgeArray = info.onsetAge.filter((age) => age !== null && age !== undefined);
                        const filteredResolutionAgeArray = info.resolutionAge.filter((age) => age !== null && age !== undefined);
                        if (filteredOnsetAgeArray.length === 0) {
                            info.onsetAge = 0
                        } else {
                            const onsetAgeSum = filteredOnsetAgeArray.reduce((total, current) => total + current, 0);
                            const onsetAgeAve = onsetAgeSum && filteredOnsetAgeArray.length ? onsetAgeSum / filteredOnsetAgeArray.length : 0
                            info.onsetAge = onsetAgeAve
                        }
                        if (filteredResolutionAgeArray.length === 0) {
                            info.resolutionAge = 0
                        } else {
                            const resolutionAgeSum = filteredResolutionAgeArray.reduce((total, current) => total + current, 0);
                            const resolutionAgeAve = resolutionAgeSum && filteredResolutionAgeArray.length ? resolutionAgeSum / filteredResolutionAgeArray.length : 0
                            info.resolutionAge = resolutionAgeAve
                        }
                        return info
                    })
                })
            const datasetsByDiagnosis = {}
            Object.entries(infoByDiagnosis).forEach(([diagnosis, info]) => {
                info.sort((i1, i2) => {
                    // 値がどちらも0の場合は最初に持ってくる
                    if (i1.onsetAge === 0 && i1.resolutionAge === 0) return -1
                    if (i2.onsetAge === 0 && i2.resolutionAge === 0) return 1
                    return i2.onsetAge - i1.onsetAge
                })
                datasetsByDiagnosis[diagnosis] = {
                    datasets: [{
                        data: info.map(datam => [datam.onsetAge.toFixed(2), datam.resolutionAge.toFixed(2)]),
                        backgroundColor: info.map(datam => {
                            switch (datam.phenotype_severity?.toLowerCase()) {
                                case translate('mild'):
                                    return '#569FE5'
                                case translate('moderate'):
                                    return '#A0D0FF'
                                case translate('borderline'):
                                    return '#E0C1FF'
                                case translate('severe'):
                                    return '#FFB1D2'
                                case translate('profound'):
                                    return '#FF8177'
                                default:
                                    return '#999'
                            }
                        }),
                        barThickness: 12
                    }],
                    labels: info.map(datam => datam.label)
                }
            })
            return datasetsByDiagnosis
        }
        const datasetsByDiagnosis = generateDatasetsByDiagnosis()
        const diagnosisList = Object.keys(datasetsByDiagnosis)
        const $diagnosisSelectElement = $("#diagnosis-list-select")
        $diagnosisSelectElement.html(diagnosisList.map(diagnosis => `<option value="` + diagnosis + `">${diagnosis}</option>`))
        const initialDiagnosis = diagnosisList[0]
        const datasets = datasetsByDiagnosis[initialDiagnosis]?.datasets
        const labels = datasetsByDiagnosis[initialDiagnosis]?.labels
        if (!datasets) {
            $('.chart-container-sympton-no-data').show()
            $('.chart-container-sympton-select-wrapper').css('visibility', 'hidden')
            $('.chart-container-sympton-canvas').css('display', 'none')
            return
        } else {
            $('.chart-container-sympton-no-data').hide()
            $('.chart-container-sympton-select-wrapper').css('visibility', 'visible')
            $('.chart-container-sympton-canvas').css('display', 'block')
        }
        const ctx = container.getContext('2d')
        const dataCount = datasets[0].data.length
        const chartHeight = dataCount * 24 + 64
        $('.chart-container-sympton').height(chartHeight < 300 ? 300 : chartHeight)
        const symptonsHorizontalBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets
            },
            options: {
                layout: {
                    padding: {
                        top: 42
                    }
                },
                animation: false,
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: translate('chart-phenotype-x')
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: translate('chart-phenotype-y')
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'y',
                    intersect: false
                }
            }
        })
        charts.symptonsHorizontalBarChart = symptonsHorizontalBarChart

        const update = () => {
            const newDiagnosis = $diagnosisSelectElement.val()
            let updatedDataset = {}
            if (!datasetsByDiagnosis[newDiagnosis]) {
                updatedDataset = generateDatasetsByDiagnosis()
            } else {
                updatedDataset = datasetsByDiagnosis
            }
            const dataCount = updatedDataset[newDiagnosis].datasets[0].data.length
            const chartHeight = dataCount * 24 + 64
            $('.chart-container-sympton').height(chartHeight < 300 ? 300 : chartHeight)
            symptonsHorizontalBarChart.data.labels = updatedDataset[newDiagnosis].labels
            symptonsHorizontalBarChart.data.datasets = updatedDataset[newDiagnosis].datasets
            symptonsHorizontalBarChart.update();
        }

        $diagnosisSelectElement.off()
        $diagnosisSelectElement.change(() => update())
    }

    /* グラフの表示/非表示 */
    const graphTitleList = $('.chart-container').map((i, el) => $(el).data('type')).get()
    const cookieValue = document.cookie.split("; ").find((row) => row.startsWith("displayGraphList"))?.split("=")[1];
    const savedDisplayGraphList = cookieValue?.split(',') ?? graphTitleList
    $('.toggle-charts-balloon').html(graphTitleList.map(title => {
        let isChecked = 'checked'
        if (savedDisplayGraphList && !savedDisplayGraphList.includes(title)) isChecked = ''
        return `<label><input type="checkbox" name="graphList" value="${title}" ${isChecked} />${translate(`chart-title-${title}`)}</label>`
    }
    ))
    graphTitleList.forEach(graphTitle => {
        if (savedDisplayGraphList?.includes(graphTitle)) {
            $(`.chart-container-${graphTitle.toLowerCase()}`).show()
        } else {
            $(`.chart-container-${graphTitle.toLowerCase()}`).hide()
        }
    })

    $('.toggle-charts-balloon').click(e => e.stopPropagation())
    $('input[name=graphList]').on('change', function () {
        const title = $(this).val()
        if ($(this).prop("checked")) {
            $(`.chart-container-${title.toLowerCase()}`).show()
        } else {
            $(`.chart-container-${title.toLowerCase()}`).hide()
        }
        const displayGraphList = Array.from($('input[name=graphList]:checked').map(function () { return $(this).val() }))
        document.cookie = `displayGraphList=${displayGraphList.toString()};`
    });
    $('.toggle-charts').off('click').on('click', () => {
        $('.toggle-charts-balloon').toggleClass('hide')
    })
}
