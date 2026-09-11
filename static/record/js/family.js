let relationshipRequiringSpouse = ['spouse_child', 'spouse_sibling', 'spouse_uncle_aunt'];
let relationshipRequiringParent = ['nephew_niece', 'grandchild', 'cousin'];

let pedigreeJsWasBuilt = false;

class KnownPedigreeError extends Error {
    constructor(message) {
        super(message);
        this.name = "KnownPedigreeError";
    }
}

let pedigreeWarnings = [];

function updateExtraInputFieldsForRelationship(relationship, targetDiv, pcfNo, withLabelTarget = false) {
    let target = null;
    let spouseSelect = $(targetDiv).find(`select[name="${columnKeys.CASE_SPOUSE_ID}"]`);
    let spouseSelectBlock = withLabelTarget ? spouseSelect.closest('.form-container') : spouseSelect;
    let parentSelect = $(targetDiv).find(`select[name="${columnKeys.CASE_PARENT_ID}"]`);
    let parentSelectBlock = withLabelTarget ? parentSelect.closest('.form-container') : parentSelect;
    let defaultChoice;
    let patientInfo = contentData.filter(d => d.PCFNo == pcfNo)[0];
    let currentValue = null;
    if(relationshipRequiringSpouse.includes(relationship)) {
        target = spouseSelect;
        defaultChoice = translate('select-spouse');
        currentValue = patientInfo.case_spouse_id;
        spouseSelectBlock.show();
    } else {
        spouseSelectBlock.hide();
    }

    if(relationshipRequiringParent.includes(relationship)) {
        target = parentSelect;
        defaultChoice = translate('select-parent');
        currentValue = patientInfo.case_parent_id;
        parentSelectBlock.show();
    } else {
        parentSelectBlock.hide();
    }
    if(!target)
        return;

    let choices = [];
    let familyMembers = casesInFamily(pcfNo);
    switch(relationship) {
        case 'grandchild':
            choices = familyMembers.filter(m => getRelationshipValue(m.case_relationship) === 'child');
            break;
        case 'nephew_niece':
            choices = familyMembers.filter(m => getRelationshipValue(m.case_relationship) === 'sibling');
            break;
        case 'cousin':
            choices = familyMembers.filter(m => ['uncle_paternal', 'uncle_maternal', 'aunt_maternal', 'aunt_paternal'].includes(getRelationshipValue(m.case_relationship)))
            break;
        case 'spouse_child':
            choices = familyMembers.filter(m => getRelationshipValue(m.case_relationship) === 'child');
            break;
        case 'spouse_sibling':
            choices = familyMembers.filter(m => getRelationshipValue(m.case_relationship) === 'sibling');
            break;
        case 'spouse_uncle_aunt':
            choices = familyMembers.filter(m =>  ['uncle_paternal', 'uncle_maternal', 'aunt_paternal', 'aunt_maternal'].includes(getRelationshipValue(m.case_relationship)));
            break;
    }
    target.prop("disabled", choices.length === 0);
    if (withLabelTarget) {
        if (choices.length === 0) {
            target.closest('.form-container').addClass('disabled');
        } else {
            target.closest('.form-container').removeClass('disabled');
        }
    }
    choices = choices.map(c => c.case_id);
    let innerHTML = `<option value="">${defaultChoice}</option>`
    innerHTML += choices.map(c => `<option value="${c}">${c}</option>`).join('\n');
    target.html(innerHTML);
    target.val(currentValue);
}

function casesInFamily(patientId) {
    let patientData = contentData.filter(d => { return d.PCFNo == patientId })[0]
    if(patientData) {
        return contentData.filter(d => d.PCFNo == patientId || (d.case_family_id && d.case_family_id === patientData.case_family_id));
    }
    return [];
}

function getRelationshipValue(relationshipText) {
    let index = -1;
    for(let options of Object.values(relationshipColumnInfo.options)){
        for(let i = 0; i < options.length; ++i) {
            if(options[i] == relationshipText) {
                index = i;
                break;
            }
        }
        if(index != -1) {
            break;
        }
    }
    return relationshipColumnInfo.options.dataValue[index];
}


function getLifeStatusValue(lifeStatusText) {
    let index = -1;
    for(let options of Object.values(lifeStatusColumnInfo.options)){
        for(let i = 0; i < options.length; ++i) {
            if(options[i] == lifeStatusText) {
                index = i;
                break;
            }
        }
        if(index != -1) {
            break;
        }
    }
    return lifeStatusColumnInfo.options.dataValue[index];
}



function getSexValue(sexText) {
    let index = -1;
    for(let options of Object.values(sexColumnInfo.options)){
        for(let i = 0; i < options.length; ++i) {
            if(options[i] == sexText) {
                index = i;
                break;
            }
        }
        if(index != -1) {
            break;
        }
    }
    return sexColumnInfo.options.dataValue[index];
}

const sexValueMap = {
    'male': 'M',
    'female': 'F',
    'unknown': 'U'
}

function toPedigreeJSFormat(patientInfo) {
    let age = patientInfo.case_age;
    if(age && age.includes('Y')) {
        age = age.split('Y')[0];
    }
    let diagnosisList = patientInfo.medical_final_diagnosis_name;
    let pedigreeJsFormat = {
        name: patientInfo.PCFNo,
        display_name: patientInfo.case_id,
        sex: sexValueMap[getSexValue(patientInfo.case_sex)] || 'U',
        age: age,
        status: getLifeStatusValue(patientInfo.case_life_status) === 'deceased' ? 1 : 0,
        proband: getRelationshipValue(patientInfo.case_relationship) === "proband_individual",
        // This property is not used in PedigreeJS, just for computation in this script 
        relationship: getRelationshipValue(patientInfo.case_relationship), 
        spouse_id: patientInfo.case_spouse_id,
        parent_id: patientInfo.case_parent_id
    };

    if(diagnosisList) {
        pedigreeJsFormat.diagnosis = diagnosisList
        diagnosisList.forEach(d => {
            pedigreeJsFormat[d] = true;
        })
    };
    return pedigreeJsFormat;
}

function computeDepth(pedigreeJSFormatList, baseNode) {
    let queue = [{ node: baseNode, depth: 0}];   
    /// First, we compute depth of ancestors to obtain root node 
    while(queue.length > 0) {
        let { node, depth } = queue.shift();
        if(node.father) {
            queue.push({ node: pedigreeJSFormatList.filter(d => d.name === node.father)[0], depth: depth + 1 });
        }
        if(node.mother) {
            queue.push({ node: pedigreeJSFormatList.filter(d => d.name === node.mother)[0], depth: depth + 1 });
        }
        node.depth = depth;
    }
    let maxDepth = Math.max(...pedigreeJSFormatList.filter(d => d.depth !== undefined).map(d => d.depth));
    let root = pedigreeJSFormatList.filter(d => d.depth === maxDepth)[0];
    queue = [{ node: root, depth: maxDepth}];
    let visitedNodeName = new Set();

    /// Now, we compute depth of all nodes
    while(queue.length > 0) {
        let { node, depth } = queue.shift();
        if(visitedNodeName.has(node.name))
            continue;
        visitedNodeName.add(node.name);
        if(node.father) {
            queue.push({ node: pedigreeJSFormatList.filter(d => d.name === node.father)[0], depth: depth + 1 });
        }
        if(node.mother) {
            queue.push({ node: pedigreeJSFormatList.filter(d => d.name === node.mother)[0], depth: depth + 1 });
        }
        let spouses = pedigreeJSFormatList.filter(d => d.display_name === node.spouse_id);
        for(let spouse of spouses) {
            queue.push({ node: spouse, depth: depth });
        }
        let children = pedigreeJSFormatList.filter(d => d.father === node.name || d.mother === node.name);
        for(let child of children) {
            queue.push({ node: child, depth: depth - 1 });
        }
        node.depth = depth;
    }
}

function updatePropsForHierarchy(pedigreeJSFormatList, proband) {
    // Update top_level and noparents for each node
    let topLevelMother = null, topLevelFather = null;
    let motherForEachLevel = {};
    let fatherForEachLevel = {};
    if(!proband)
        return;
    if(!proband.father && !proband.mother) {
        proband.top_level = true;

        // If children of proband exist, we have to set their spouse as top_level
        let children = pedigreeJSFormatList.filter(p => p.father === proband.name || p.mother === proband.name);
        if(children.length > 0) {
            for(let child of children) {
                let spouses = pedigreeJSFormatList.filter(p => p.name !== proband.name && (p.name === child.father || p.name === child.mother));
                for(let spouse of spouses) {
                    spouse.top_level = true;
                    if(spouse.name === child.father)
                        topLevelFather = spouse;
                    else
                        topLevelMother = spouse;
                }
            }
        }
        if(!topLevelFather)
            topLevelFather = proband;
        else if(!topLevelMother)
            topLevelMother = proband;
        
        for(let patientInPedigreeJs of pedigreeJSFormatList) {
            if(!patientInPedigreeJs.mother && !patientInPedigreeJs.father && !patientInPedigreeJs.top_level) {
                patientInPedigreeJs.noparents = true;
                // We have to set father and mother even if noparents = true. See https://github.com/CCGE-BOADICEA/pedigreejs/issues/143
                patientInPedigreeJs.father = topLevelFather?.name;
                patientInPedigreeJs.mother = topLevelMother?.name;
            }
        }
    } else {
        computeDepth(pedigreeJSFormatList, proband);
        let maxDepth = Math.max(...pedigreeJSFormatList.map(d => d.depth));
        for(let patientInPedigreeJs of pedigreeJSFormatList) {
            if(patientInPedigreeJs.depth === maxDepth) {
                patientInPedigreeJs.top_level = true;
                if(patientInPedigreeJs.sex === 'F')
                    topLevelMother = patientInPedigreeJs;
                else
                    topLevelFather = patientInPedigreeJs;
            } else {
                const isMother = patientInPedigreeJs.sex === 'F' && patientInPedigreeJs.relationship === 'mother';
                const isFather = patientInPedigreeJs.sex === 'M' && patientInPedigreeJs.relationship === 'father';
                const depth = patientInPedigreeJs.depth;

                if (isMother || (!motherForEachLevel[depth] && patientInPedigreeJs.sex === 'F')) {
                    motherForEachLevel[depth] = patientInPedigreeJs;
                }
                
                if (isFather || (!fatherForEachLevel[depth] && patientInPedigreeJs.sex === 'M')) {
                    fatherForEachLevel[depth] = patientInPedigreeJs;
                }
            }
        }

        for(let patientInPedigreeJs of pedigreeJSFormatList) {
            if(!patientInPedigreeJs.mother && !patientInPedigreeJs.father && !patientInPedigreeJs.top_level) {
                patientInPedigreeJs.noparents = true;
                // We have to set father and mother even if noparents = true. See https://github.com/CCGE-BOADICEA/pedigreejs/issues/143
                patientInPedigreeJs.father = (fatherForEachLevel[patientInPedigreeJs.depth + 1] || topLevelFather).name;
                patientInPedigreeJs.mother = (motherForEachLevel[patientInPedigreeJs.depth + 1] || topLevelMother).name;
            }
        }
    }
}

/// Set parents of child inserting dummy spouse if needed
function setParentsWithSpouse(parent, child, familyMemberList, dummySpouseMap) {
    child[parent.sex === 'M' ? 'father' : 'mother'] = parent.name;
    let spouse = familyMemberList.filter(f => f.spouse_id === parent.display_name && relationshipRequiringSpouse.includes(f.relationship))[0];
    if(!spouse) {
        spouse = dummySpouseMap[parent.name];
    }
    if(!spouse) {
        let dummySpouse = {
            name: `spouse_${parent.name}`,
            display_name: '',
            sex: parent.sex === 'M' ? 'F' : 'M',
            dummy: true,
        };
        dummySpouseMap[parent.name] = dummySpouse;
        spouse = dummySpouse;
    }

    child[parent.sex === 'M' ? 'mother' : 'father'] = spouse.name;
}

function addDummyParentsIfNeeded(baseCase, dummySpouseMap) {
    if(!baseCase.father) {
        if(!baseCase.mother) {
            let dummyFather = {
                name: `father_${baseCase.name}`,
                sex: 'M',
                dummy: true,
            };
            let dummyMother = {
                name: `mother_${baseCase.name}`,
                sex: 'F',
                dummy: true,
            };
            baseCase.mother = dummyMother.name;
            baseCase.father = dummyFather.name;
            dummySpouseMap[dummyMother.name] = dummyFather;
            dummySpouseMap[dummyFather.name] = dummyMother;
        } else {
            let dummyFather = {
                name: `spouse_${baseCase.mother}`,
                sex: 'M',
                dummy: true,
            };
            baseCase.father = dummyFather.name;
            dummySpouseMap[dummyFather.name] = dummyFather;
        }
    } else if(!baseCase.mother) {
        let dummyMother = {
            name: `spouse_${baseCase.father}`,
            sex: 'F',
            dummy: true,
        };
        baseCase.mother = dummyMother.name;
        dummySpouseMap[dummyMother.name] = dummyMother;
    }
}

function addRelationshipToPedigreeJSFormat(pedigreeJSFormatList, probandInPedigreeJS) {
    let fatherInPedigreeJs = null, motherInPedigreeJs = null;
    let siblings = [];
    let children = [];
    // Map from father/mother to their spouse
    let dummySpouseMap = {};
    let spouse_of_proband = pedigreeJSFormatList.filter(p => p.relationship === 'spouse_proband')[0];
    // First step (only for direct relationship from proband) 
    for(let patientPedigreeJSFormat of pedigreeJSFormatList) {
        switch(getRelationshipValue(patientPedigreeJSFormat.relationship)) {
            default:
                break;
            case 'father':
                probandInPedigreeJS.father = patientPedigreeJSFormat.name;
                fatherInPedigreeJs = patientPedigreeJSFormat;
                break;
            case 'mother':
                probandInPedigreeJS.mother = patientPedigreeJSFormat.name;
                motherInPedigreeJs = patientPedigreeJSFormat;
                break;
            case 'parent_unknown':
                if(probandInPedigreeJS.father)
                    probandInPedigreeJS.mother = patientPedigreeJSFormat.name;
                else
                    probandInPedigreeJS.father = patientPedigreeJSFormat.name;
                break;
            case 'child':
                if(!spouse_of_proband) {
                    let dummySpouseOfParent = dummySpouseMap[probandInPedigreeJS.name];
                    if(!dummySpouseOfParent) {
                        dummySpouseOfParent = {
                            name: `spouse_${probandInPedigreeJS.name}`,
                            display_name: '',
                            sex: probandInPedigreeJS.sex === 'F' ? 'M' : 'F',
                            dummy: true,
                        };
                        dummySpouseMap[probandInPedigreeJS.name] = dummySpouseOfParent;
                    }
                    spouse_of_proband = dummySpouseOfParent;
                }
                if(probandInPedigreeJS.sex === 'M') {
                    patientPedigreeJSFormat.father = probandInPedigreeJS.name;
                    patientPedigreeJSFormat.mother = spouse_of_proband.name; 
                }
                else if(probandInPedigreeJS.sex === 'F') {
                    patientPedigreeJSFormat.mother = probandInPedigreeJS.name;
                    patientPedigreeJSFormat.father = spouse_of_proband.name; 
                }
                else {
                    // TODO: Show alert
                }
                children.push(patientPedigreeJSFormat);
                break;

            
            // TODO: Add more relationship           
            // 'grandparent_unknown', 'unknown', 'other_paternal', 'other_maternal',
        }
    }


    // Second step (for two-hop relationship from proband) 
    for(let patientPedigreeJSFormat of pedigreeJSFormatList) {
        switch(getRelationshipValue(patientPedigreeJSFormat.relationship)) {
            default:
                break;
            case 'sibling':
                addDummyParentsIfNeeded(probandInPedigreeJS, dummySpouseMap);
                patientPedigreeJSFormat.father = probandInPedigreeJS.father;
                patientPedigreeJSFormat.mother = probandInPedigreeJS.mother;
                siblings.push(patientPedigreeJSFormat);
                break;
            
            case 'grandparent_paternal':
                if(fatherInPedigreeJs) {
                    if(patientPedigreeJSFormat.sex == 'M')
                        fatherInPedigreeJs.father = patientPedigreeJSFormat.name;
                    else
                        fatherInPedigreeJs.mother = patientPedigreeJSFormat.name;
                } else {
                    // TODO: Show alert or add dummy relationship
                }
                break;

            case 'grandparent_maternal':
                if(motherInPedigreeJs) {
                    if(patientPedigreeJSFormat.sex == 'M')
                        motherInPedigreeJs.father = patientPedigreeJSFormat.name;
                    else
                        motherInPedigreeJs.mother = patientPedigreeJSFormat.name;
                } else {
                    // TODO: Show alert or add dummy relationship
                }
                break;

            case 'grandchild':
                if(children.length === 0) {
                    // TODO: Show alert or add dummy relationship
                }
                else if(children.length === 1) {        
                    setParentsWithSpouse(children[0], patientPedigreeJSFormat, pedigreeJSFormatList, dummySpouseMap);            
                } else if(patientPedigreeJSFormat.parent_id) {
                    let child = children.filter(c => c.display_name === patientPedigreeJSFormat.parent_id)[0];
                    if(child)
                        setParentsWithSpouse(child, patientPedigreeJSFormat, pedigreeJSFormatList, dummySpouseMap);            
                }
                break;
        }   
    }


    // Third step (for three-hop relationship from proband) 
    for(let patientPedigreeJSFormat of pedigreeJSFormatList) {
        switch(getRelationshipValue(patientPedigreeJSFormat.relationship)) {
            default:
                break;
            case 'uncle_paternal':
            case 'aunt_paternal':
                if(fatherInPedigreeJs) {
                    addDummyParentsIfNeeded(fatherInPedigreeJs, dummySpouseMap);
                    patientPedigreeJSFormat.father = fatherInPedigreeJs.father;
                    patientPedigreeJSFormat.mother = fatherInPedigreeJs.mother;
                } else {
                    // TODO: Show alert or add dummy relationship
                }
                break;
            
            case 'uncle_maternal':
            case 'aunt_maternal':
                if(motherInPedigreeJs) {
                    addDummyParentsIfNeeded(motherInPedigreeJs, dummySpouseMap);
                    patientPedigreeJSFormat.father = motherInPedigreeJs.father;
                    patientPedigreeJSFormat.mother = motherInPedigreeJs.mother;
                } else {
                    // TODO: Show alert or add dummy relationship
                }
                break;

            case 'nephew_niece':
                if(siblings.length === 0) {
                    // TODO: Show alert or add dummy relationship
                }
                else if(siblings.length === 1) {                    
                    setParentsWithSpouse(siblings[0], patientPedigreeJSFormat, pedigreeJSFormatList, dummySpouseMap);
                } else if(patientPedigreeJSFormat.parent_id) {
                    let sibling = siblings.filter(s => s.display_name === patientPedigreeJSFormat.parent_id)[0];
                    if(sibling)
                        setParentsWithSpouse(sibling, patientPedigreeJSFormat, pedigreeJSFormatList, dummySpouseMap);            
                }
                break;

        }
    }
    // Fourth step
    for(let patientPedigreeJSFormat of pedigreeJSFormatList) {
        switch(getRelationshipValue(patientPedigreeJSFormat.relationship)) {
            default:
                break;
            case 'cousin':
                if(patientPedigreeJSFormat.parent_id) {
                    let parent = pedigreeJSFormatList.filter(p => p.display_name === patientPedigreeJSFormat.parent_id)[0];
                    if(parent) {
                        setParentsWithSpouse(parent, patientPedigreeJSFormat, pedigreeJSFormatList, dummySpouseMap);
                    }
                }
                break;
        }
    }

    // Add dummy parent node for nodes with only one of father/mother
    for(let patientPedigreeJSFormat of pedigreeJSFormatList) {
        if(patientPedigreeJSFormat.mother && !patientPedigreeJSFormat.father  ||
            patientPedigreeJSFormat.father && !patientPedigreeJSFormat.mother) {
            addDummyParentsIfNeeded(patientPedigreeJSFormat, dummySpouseMap);
        }
    }

    pedigreeJSFormatList.push(...Object.values(dummySpouseMap));
}

function removeSpousesWithNoChildren(pedigreeJSFormatList) {
    const spouseRelationShip = ['spouse_proband', 'spouse_child', 'spouse_sibling', 'spouse_uncle_aunt'];
    let spouses = pedigreeJSFormatList.filter(p => spouseRelationShip.includes(p.relationship));
    for(let spouse of spouses) {
        let children = pedigreeJSFormatList.filter(p => p.father === spouse.name || p.mother === spouse.name);
        if(children.length === 0) {
            let index = pedigreeJSFormatList.indexOf(spouse);
            if(index !== -1) {
                pedigreeJSFormatList.splice(index, 1);
                let templateWarning = translate("message_for_warning_spouse_with_no_child");
                pedigreeWarnings.push(templateWarning.replace('{spouse_name}', spouse.display_name));
            }
        }
    }
}

function createPedigreeForCases(cases, enableErrorMessage = false) {
    /**
     * This function creates pedigree for list of cases in the same family.
     * The return value is a list in format for pedigreejs.
     */
    if(cases.length === 0) {
        return [];
    }
    let pedigreeList = cases.map(d => toPedigreeJSFormat(d));

    const relationships = pedigreeList.map(member => member.relationship);
    const probandCount = relationships.filter(r => r === 'proband_individual').length;
    if (enableErrorMessage && relationships.length > 0 && probandCount >= 2) {
        throw new KnownPedigreeError(translate('message_for_error_multiple_proband_in_family').replace("{target}", "家系図"));
    }

    // TODO: How can we handle multiple proband?
    let proband = pedigreeList.filter(d => d.proband)[0];
    if (enableErrorMessage && !proband) {
        throw new KnownPedigreeError(translate('message_for_error_no_proband_in_family').replace("{target}", "家系図"));
    }
    addRelationshipToPedigreeJSFormat(pedigreeList, proband);
    removeSpousesWithNoChildren(pedigreeList);
    updatePropsForHierarchy(pedigreeList, proband);
    return pedigreeList;
}

function convertForPedigreeJS(patientId) {
    let cases = casesInFamily(patientId);
    let pedigreeList = createPedigreeForCases(cases, true);
    let invalidCases = pedigreeList.filter(p => (!p.father || !p.mother) && !p.top_level).map(p => p.name);
    // TODO: Appropriately set sex if it can be inferred from relationship
    pedigreeList = pedigreeList.filter(p => !invalidCases.includes(p.name));
    // Sort by age
    pedigreeList.sort((a, b) => {
        if(a.age && b.age) {
            return parseInt(b.age) - parseInt(a.age);
        }
        return 0;
    });
    return [pedigreeList, invalidCases];
}


function updateContentOfPedigreeTable(patientId, invalidCases) {
    let pedigree_table = document.getElementById("pedigree-table-section");
    let cases = casesInFamily(patientId);
    // TODO: Localization
    let innerHTML = `
        <table class="pedigree-table"><thead>
            <td>${translate('case_id')}</td>
            <td>${translate('life_status')}</td>
            <td>${translate('sex')}</td>
            <td>${translate('age_ymd')}</td>
            <td>${translate('relationship')}</td>
            <td>${translate('final_diagnosis')}</td>
        </thead>
        <tbody>`;


    for(let c of cases) {
        innerHTML += `<tr ${invalidCases.includes(c.PCFNo) ? 'class="invalid"' : ''}>
            <td>${c.case_id || ''}</td>
            <td>${c.case_life_status || ''}</td>
            <td>${c.case_sex || ''}</td>
            <td>${c.case_age || ''}</td>
            <td class="relationship-cell"></td>
            <td class="diagnosis-cell">${c.medical_final_diagnosis_name?.join(', ') || ''}</td>
        </tr>`;
    }
    innerHTML += `</tbody></table>`;
    pedigree_table.innerHTML = innerHTML;
    let i = 1;
    for(let c of cases) {
        let targetDiv = $(pedigree_table).find(`tr:nth-child(${i}) .relationship-cell`)[0]
        targetDiv.innerHTML += c.case_relationship || '';
        targetDiv.innerHTML += `<select class="select-in-table" name="${columnKeys.CASE_PARENT_ID}" style="display: none;"/>`;
        targetDiv.innerHTML += `<select class="select-in-table" name="${columnKeys.CASE_SPOUSE_ID}" style="display: none;"/>`;
        let pcfNo = c.PCFNo;
        updateExtraInputFieldsForRelationship(getRelationshipValue(c.case_relationship), targetDiv, pcfNo)
        $(targetDiv).find(`select`).on('change', (e) => {
            for(let p of contentData) {
                if (p.PCFNo === pcfNo) {
                    p[e.target.name] = e.target.value
                    break;
                }
            }
            if(currentPatient === pcfNo) {
                $(`#relationship_id_in_case_info select[name=${e.target.name}]`).val(e.target.value);
            }
            updatePedigreeFigure();
        });
        ++i;
    }
}

let generatedColorNumber = 0;
let diseaseColorMap = {};
const diseaseColorCandidates = [
    '#5b85c3',
    '#ffa23e',
    '#42af66',
    '#ff767b',
    '#392187',
    '#C00F55',
    '#006221',
    '#791A1A',
    '#F7CD1E',
    '#9CC92D',
    '#FF7343',
    '#003A90',
    '#D3C293',
    '#11A1CC',
    '#00B293',
    '#85C2D5',
    '#8A7ABE',
];

const dummyColor = '#AAAAAA';

function getColorForDisease(diseaseName) {
    diseaseName = diseaseName?.toLowerCase();
    let existingColor = diseaseColorMap[diseaseName];

    if(existingColor) {
        return existingColor;
    }

    diseaseColorMap[diseaseName] = diseaseColorCandidates[generatedColorNumber % diseaseColorCandidates.length];
    ++generatedColorNumber;
    return diseaseColorMap[diseaseName];
}

function updatePedigreeArea() {
    let invalidCases = updatePedigreeFigure();
    updateContentOfPedigreeTable(currentPatient, invalidCases);
}

function updatePedigreeFigure() {
    pedigreeWarnings = [];

    const pedigreeButtons = document.getElementById('pedigree_buttons');


    const showPedigreeButtons = () => {
        pedigreeButtons.style.display = 'block';
    }
    const hidePedigreeButtons = () => {
        pedigreeButtons.style.display = 'none';
    }

    try {
        let [pedigreeJsDataset, invalidCases] = convertForPedigreeJS(currentPatient);

        let diseases = pedigreeJsDataset.flatMap(d => d.diagnosis);
        let lowerDiseases = diseases.map(d => d?.toLowerCase());
        let diseasesLegend = diseases.filter((v, i, a) => v && lowerDiseases.indexOf(v.toLowerCase()) === i);

        diseases = diseases.map(d => ({
                type: d,
                colour: getColorForDisease(d)
        }));

        let pedigreeLegend = $('#pedigree-legend')[0]
        if(pedigreeLegend)
            pedigreeLegend.innerHTML = diseasesLegend.map(d => `<div class="pedigree-legend-item"><div class="pedigree-legend-color" style="background-color: ${getColorForDisease(d)}"></div><div class="legend-text">${d}</div></div>`).join('\n');

        diseases.push({
            type: 'dummy',
            colour: dummyColor
        })

        let modalWidth = $('#pedigree').width();

        pedigreeJsOpts = {
            'targetDiv': 'pedigree',
            'btn_target': 'pedigree_buttons',
            'width': modalWidth,
            'height': 450,
            'symbol_size': 35,
            edit: false,
            'store_type': 'array',
            diseases,
            zoomIn: 0.25,
            zoomOut: 2,
            font_size: '.75em',
            font_family: 'Helvetica',
            font_weight: 700,
            dataset: pedigreeJsDataset
        }
        
        if(pedigreeJsWasBuilt) {
            pedigreejs.pedigreejs.rebuild(pedigreeJsOpts);
            showPedigreeButtons();
        } else {
            pedigreejs.pedigreejs.build(pedigreeJsOpts);
            showPedigreeButtons();
            pedigreeJsWasBuilt = true;
        }

        // Apply initial zooming out to avoid overlap with legends
        pedigreejs.pedigreejs_zooming.btn_zoom(pedigreeJsOpts, 0.9);
        // If we set 100% initially, the center of pedigree is not centered
        $('#pedigree svg').attr('width', "100%");

        $('#pedigree svg')[0].addEventListener('wheel', function(event) {
            if (!event.ctrlKey && !event.metaKey) {
                event.stopImmediatePropagation();
                return;
            }
        }, {capture: true});

        if(pedigreeWarnings.length > 0) {
            $('#pedigree-error').html(`<span class="pedigree-error-message">${pedigreeWarnings.join('<br>')}</span>`);
        }
        else {
            $('#pedigree-error').html("");
        }
        return invalidCases;
    } catch(e) {
        let errorMessage = null;
        errorMessage = e.message;

        hidePedigreeButtons();
        
        const parentGenderErrorRegex = /The (mother|father) of family member .+ \(IndivID: .+\) is not specified as (female|male)/;
        const isParentGenderError = errorMessage?.match(parentGenderErrorRegex);

        if(e instanceof KnownPedigreeError) {
            $('#pedigree-error').html(`<span class="pedigree-error-message">${errorMessage}</span>`);
        } else if(isParentGenderError) {
            $('#pedigree-error').html(`<span class="pedigree-error-message">${translate('message_for_error_same_gender_parent').replace("{target}", "家系図")}</span>`);
        } else {
            $('#pedigree-error').html(`<span class="pedigree-error-message">${translate('message_for_pedigree_error')}</span>`);
        }
        $('#pedigree').html('');
        $('#pedigree-legend').html('');
        return [];
    }
    return [];
}



function replaceRectFillAttribute(svg) {
    let rect = svg.querySelector('rect');
    if(rect) {
        rect.style.fill = 'transparent';
        // PDF/PNG出力時にボーダーを削除
        rect.style.stroke = 'none';
        rect.style.border = 'none';
    }
    // SVG要素自体のボーダーも削除
    svg.style.border = 'none';
    svg.style.stroke = 'none';
    // stroke属性も削除
    if(rect) {
        rect.removeAttribute('stroke');
    }
}

function getBasePedigreeSVG() {
    let originalSvg = document.querySelector('#pedigree svg');
    let svg = originalSvg.cloneNode(true);

    // viewBoxからSVGの実際のサイズを取得
    let viewBox = originalSvg.getAttribute('viewBox');
    if (viewBox) {
        let vbValues = viewBox.split(' ');
        let vbWidth = parseFloat(vbValues[2]);
        let vbHeight = parseFloat(vbValues[3]);

        // viewBoxが設定されている場合はそのサイズを使用
        svg.setAttribute("width", vbWidth);
        svg.setAttribute("height", vbHeight);
        svg.setAttribute("viewBox", viewBox);
    } else {
        // viewBoxがない場合は、SVG内のすべての要素の境界ボックスを計算
        let bbox = originalSvg.getBBox();
        svg.setAttribute("width", bbox.width + bbox.x);
        svg.setAttribute("height", bbox.height + bbox.y);
        svg.setAttribute("viewBox", `0 0 ${bbox.width + bbox.x} ${bbox.height + bbox.y}`);
    }

    replaceRectFillAttribute(svg);
    return svg;
}

function downloadPedigreePNG() {
    let svg = getBasePedigreeSVG();
    let svgData = new XMLSerializer().serializeToString(svg);
    
    let legend = document.querySelector("#pedigree-legend");

    let canvas = document.createElement("canvas");
    canvas.width = svg.getAttribute("width");
    canvas.height = svg.getAttribute("height");

    let ctx = canvas.getContext("2d");
    let image = new Image;
    image.onload = function(){
        // #pedigree svg をキャンバスに描画
        ctx.drawImage(image, 0, 0);
        // 凡例が表示され、サイズが確定してから html2canvas を実行
        setTimeout(() => {
            html2canvas(legend, {
                // 必要に応じてオプションを追加
                backgroundColor: null,
                scale: window.devicePixelRatio
            }).then(legendCanvas => {
                if (legendCanvas.width > 0 && legendCanvas.height > 0) {
                    
                    ctx.drawImage(legendCanvas, legend.offsetLeft, legend.offsetTop, legend.offsetWidth, legend.offsetHeight);
                }
                let a = document.createElement("a");
                a.href = canvas.toDataURL("image/png");
                a.setAttribute("download", `pedigree_${getFileNameSuffix()}.png`);
                a.dispatchEvent(new MouseEvent("click"));
            });
        }, 100); // 100ms待機して要素のレンダリングを確実にする
    }
    image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData))); 
}

function downloadPedigreeSVG() {
    let svg = getBasePedigreeSVG();
    let legend = document.querySelector('#pedigree-legend');

    // #pedigree-legendをラスタ画像に変換
    html2canvas(legend).then(legendCanvas => {
        // ラスタ画像をBase64エンコード
        let imgData = legendCanvas.toDataURL("image/png");
        
        // Base64エンコードされた画像をSVGのimage要素として埋め込む
        let imageElem = document.createElementNS("http://www.w3.org/2000/svg", "image");
        imageElem.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imgData);
        imageElem.setAttribute("x", legend.offsetLeft);
        imageElem.setAttribute("y", legend.offsetTop);
        imageElem.setAttribute("width", legend.offsetWidth);
        imageElem.setAttribute("height", legend.offsetHeight);
        svg.appendChild(imageElem);

        // SVGをダウンロード
        let combinedSvgData = new XMLSerializer().serializeToString(svg);
        let blob = new Blob([combinedSvgData], {type: "image/svg+xml;charset=utf-8"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.setAttribute("download", `pedigree_${getFileNameSuffix()}.svg`);
        a.dispatchEvent(new MouseEvent("click"));
        URL.revokeObjectURL(url);
    });
}

function downloadPedigreeJSON() {
    let pedigreeJsDataset = pedigreejs.pedigreejs_pedcache.current(pedigreeJsOpts)    ;
    let json = JSON.stringify(pedigreeJsDataset, null, 2);
    let a = document.createElement('a');
    a.download = `pedigree_${getFileNameSuffix()}.json`;
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(json);
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// PDF生成用の定数
const PDF_MARGIN = 20; // PDFページ内の余白（mm）

/**
 * CanvasからPDFを生成して保存する共通関数
 * @param {HTMLCanvasElement} canvas - PDF化するCanvas要素
 */
function generateAndSavePDF(canvas) {
    // jsPDFを初期化（横向き、A4サイズ）
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // A4横向きのサイズ（mm）
    const pdfWidth = 297;
    const pdfHeight = 210;

    // PDFに収まるようにスケールを計算（余白を考慮）
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const scale = Math.min((pdfWidth - PDF_MARGIN) / imgWidth, (pdfHeight - PDF_MARGIN) / imgHeight);

    // PDFに収まるようにサイズを調整
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // 中央揃えの位置を計算
    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;

    // CanvasをPDFに追加
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, scaledWidth, scaledHeight);

    // PDFをダウンロード
    pdf.save(`pedigree_${getFileNameSuffix()}.pdf`);
}

function downloadPedigreePDF() {
    // SVGと凡例を取得
    let svg = getBasePedigreeSVG();
    let legend = document.querySelector('#pedigree-legend');

    // Canvas要素を作成（凡例分の余白を追加）
    const svgWidth = parseFloat(svg.getAttribute("width"));
    const svgHeight = parseFloat(svg.getAttribute("height"));
    const legendHeight = legend ? legend.offsetHeight : 0;
    const padding = 20;

    let canvas = document.createElement("canvas");
    canvas.width = Math.max(svgWidth, 800);  // 最小幅を設定
    canvas.height = svgHeight + legendHeight + padding;

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let svgData = new XMLSerializer().serializeToString(svg);

    // SVGをCanvasに描画
    let image = new Image();
    image.onload = function() {
        // SVGを中央に配置
        const svgX = (canvas.width - svgWidth) / 2;
        ctx.drawImage(image, svgX, 0, svgWidth, svgHeight);

        // 凡例をCanvasに描画
        if (legend) {
            setTimeout(() => {
                html2canvas(legend, {
                    backgroundColor: null,
                    scale: 1  // スケールを固定
                }).then(legendCanvas => {
                    if (legendCanvas.width > 0 && legendCanvas.height > 0) {
                        // 凡例をSVGの下に配置
                        const legendX = (canvas.width - legendCanvas.width) / 2;
                        const legendY = svgHeight + padding;
                        ctx.drawImage(legendCanvas, legendX, legendY, legendCanvas.width, legendCanvas.height);
                    }

                    // PDF生成と保存
                    generateAndSavePDF(canvas);
                });
            }, 100);
        } else {
            // 凡例がない場合はSVGのみをPDFに出力
            generateAndSavePDF(canvas);
        }
    };
    image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData)));
}