function getProbandForPhenopackets(PCFNo) {
    let familyMembers = casesInFamily(PCFNo);
    return familyMembers.find(
        (person) =>
            nameToDataValueMap["case_relationship"][
            person.case_relationship
            ] === "proband_individual"
    );
}

function patientDataToPhenopacketFamily(patientData) {
    let familyMembers = casesInFamily(patientData.PCFNo);
    let proband = getProbandForPhenopackets(patientData.PCFNo);
    if (!proband) {
        throw new Error(
            translate("message_for_error_no_proband_in_family").replace("{target}", "Phenopackets")
        );
    }
    return {
        id: patientData["case_family_id"],
        proband: patientDataToPhenopacket(proband),
        relatives: familyMembers
            .filter((person) => person.PCFNo != proband.PCFNo)
            .map(patientDataToPhenopacket),
        pedigree: {
            persons:
                createPedigreeForCases(familyMembers)
                    .filter((person) => !person.dummy)
                    .map((person) => {
                        let correspondingPatientDatum = familyMembers.find(
                            (correspondingPatientDatum) =>
                                correspondingPatientDatum.PCFNo === person.name
                        );
                        let sex =
                            phenopacketSexMap[
                            nameToDataValueMap["case_sex"][
                            correspondingPatientDatum.case_sex
                            ]
                            ];
                        let affectedStatus =
                            phenopacketAffectedStatusMap[
                            nameToDataValueMap[
                            "case_presence_or_absence_of_onset"
                            ][
                            correspondingPatientDatum
                                .case_presence_or_absence_of_onset
                            ]
                            ];
                        let paternalId = familyMembers.find(
                            (family) => family.PCFNo === person.father
                        )?.case_id;
                        let maternalId = familyMembers.find(
                            (family) => family.PCFNo === person.mother
                        )?.case_id;
                        return {
                            family_id: correspondingPatientDatum.case_family_id,
                            individual_id: correspondingPatientDatum.case_id,
                            paternalId,
                            maternalId,
                            sex,
                            affectedStatus,
                        };
                    }),
        },
        metaData: familyDataToMetadata(familyMembers),
    };
}

function familyDataToMetadata(familyMembers) {
    let createdBy = [];
    for (let familyMember of familyMembers) {
        if (
            familyMember.case_first_name_of_inputter ||
            familyMember.case_family_name_of_inputter
        ) {
            createdBy.push(
                `${familyMember.case_first_name_of_inputter || ""} ${familyMember.case_family_name_of_inputter || ""}`
            );
        }
    }
    createdBy = createdBy.join(", ");

    return {
        created: new Date().toISOString(),
        createdBy,
        resources: [
            {
                id: "hp",
                name: "human phenotype ontology",
                url: "http://purl.obolibrary.org/obo/hp.owl",
                version: "2019-04-08",
                namespacePrefix: "HP",
                iriPrefix: "http://purl.obolibrary.org/obo/HP_",
            },
            {
                id: "eco",
                name: "evidence and conclusion ontology",
                url: "http://purl.obolibrary.org/obo/eco.owl",
                version: "2022-08-05",
                namespacePrefix: "ECO",
                iriPrefix: "http://purl.obolibrary.org/obo/ECO_",
            },
            {
                id: "ncit",
                name: "NCI Thesaurus OBO Edition",
                url: "http://purl.obolibrary.org/obo/ncit.owl",
                version: "18.05d",
                namespacePrefix: "NCIT",
            },
            {
                id: "mondo",
                name: "Mondo disease ontology",
                url: "http://purl.obolibrary.org/obo/mondo.owl",
                version: "2022-08-05",
                namespacePrefix: "MONDO",
            },
            {
                id: "so",
                name: "Sequence types and features ontology",
                url: "http://purl.obolibrary.org/obo/so.obo",
                version: "2021-11-22",
                namespacePrefix: "SO",
                iriPrefix: "http://purl.obolibrary.org/obo/SO_"
            }
        ],
        phenopacketSchemaVersion: "2.0",
    };
}

function dateStringToISOString(dateString) {
    // Convert YYYY/MM to ISOString
    if (!dateString) return null;
    try {
        let yearString = dateString.split("/")[0];
        let monthString = dateString.split("/")[1];
        if (yearString && monthString) {
            return new Date(
                parseInt(yearString),
                parseInt(monthString) - 1
            ).toISOString();
        } else if (yearString) {
            return new Date(parseInt(yearString)).toISOString();
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

function patientDataToPhenopacket(patientData) {
    return {
        id: patientData["case_id"] || "",
        subject: patientDataToPhenopacketSubject(patientData),
        phenotypicFeatures: patientDataToPhenotypicFeatures(patientData),
        interpretations: [patientDataToInterpretation(patientData)],
        measurements: medicalBodyInfoToMeasurements(patientData),
        metaData: patientDataToMetadata(patientData),
    };
}

function patientDataToMetadata(patientData) {
    let createdBy = "";
    if (
        patientData["case_first_name_of_inputter"] ||
        patientData["case_family_name_of_inputter"]
    ) {
        createdBy = `${patientData["case_first_name_of_inputter"] || ""} ${patientData["case_family_name_of_inputter"] || ""}`;
    }
    return {
        created: new Date().toISOString(),
        createdBy,
        resources: [
            {
                id: "hp",
                name: "human phenotype ontology",
                url: "http://purl.obolibrary.org/obo/hp.owl",
                version: "2019-04-08",
                namespacePrefix: "HP",
                iriPrefix: "http://purl.obolibrary.org/obo/HP_",
            },
            {
                id: "eco",
                name: "evidence and conclusion ontology",
                url: "http://purl.obolibrary.org/obo/eco.owl",
                version: "2022-08-05",
                namespacePrefix: "ECO",
                iriPrefix: "http://purl.obolibrary.org/obo/ECO_",
            },
            {
                id: "ncit",
                name: "NCI Thesaurus OBO Edition",
                url: "http://purl.obolibrary.org/obo/ncit.owl",
                version: "18.05d",
                namespacePrefix: "NCIT",
            },
            {
                id: "mondo",
                name: "Mondo disease ontology",
                url: "http://purl.obolibrary.org/obo/mondo.owl",
                version: "2022-08-05",
                namespacePrefix: "MONDO",
            },
        ],
        phenopacketSchemaVersion: "2.0",
    };
}

function patientDataToPhenopacketSubject(patientData) {
    let status =
        nameToDataValueMap["case_life_status"][
            patientData["case_life_status"]
        ]?.toUpperCase();
    if (!status) status = "UNKNOWN_STATUS";

    let vitalStatus = { status };

    if (status === "DECEASED") {
        let timeOfDeath = dateStringToISOString(patientData["case_death"]);
        vitalStatus.timeOfDeath = {
            timestamp: timeOfDeath,
        };
    }

    let sex =
        nameToDataValueMap["case_sex"][patientData["case_sex"]]?.toUpperCase();
    if (sex === "OTHER") sex = "OTHER_SEX";
    if (!sex || sex === "UNKNOWN") sex = "UNKNOWN_SEX";

    let subject = {
        id: patientData["case_id"],
        sex,
        timeAtLastEncounter: {
            age: {
                iso8601duration: patientData["case_age_on_examination"]
                    ? `P${patientData["case_age_on_examination"]}`
                    : null,
            },
        },
        vitalStatus,
    };
    let dateOfBirth = dateStringToISOString(patientData["case_birth"]);
    if (dateOfBirth != null) {
        subject.dateOfBirth = dateOfBirth;
    }
    return subject;
}

function patientDataToPhenotypicFeatures(patientData) {
    let phenotypicFeatures = [];
    if (patientData.phenotype_hpo_id) {
        for (let i = 0; i < patientData.phenotype_hpo_id.length; ++i) {
            let excluded = patientData["phenotype_excluded"][i];
            excluded = excluded === "yes";

            let modifiers = [];
            let clinical_relevance =
                patientData["phenotype_clinical_relevance"][i];
            if (clinical_relevance === "minor") {
                modifiers.push({
                    id: "HP:0045090",
                    label: "Minor finding",
                });
            } else if (clinical_relevance === "distinctive") {
                modifiers.push({
                    id: "HP:0045089",
                    label: "Distinctive finding",
                });
            }

            let temporalPattern =
                phenotypeTemporalPatternMap[
                patientData["phenotype_temporal_pattern"][i]
                ];
            if (temporalPattern) {
                modifiers.push(temporalPattern);
            }
            let paceOfProgression =
                phenotypePaceProgressionMap[
                patientData["phenotype_pace_progression"][i]
                ];
            if (paceOfProgression) {
                modifiers.push(paceOfProgression);
            }

            let severity =
                phenotypeSeverityMap[patientData["phenotype_severity"][i]];

            let resolution = patientData["phenotype_resolution"][i];
            if (resolution) {
                resolution = {
                    age: {
                        iso8601duration: `P${resolution}`,
                    },
                };
            }

            let description = patientData["phenotype_comments"][i] || "";

            let phenotypicFeature = {
                type: {
                    id: patientData.phenotype_hpo_id[i],
                    label: patientData.phenotype_hpo_label[i].name_en,
                },
                excluded,
                modifiers,
                severity,
                resolution,
                description,
                onset: {
                    ontologyClass: phenotypeAgeOnsetToHpoClass(patientData["phenotype_age_onset"][i])
                }
            };

            phenotypicFeatures.push(phenotypicFeature);
        }
    }
    return phenotypicFeatures;
}

function phenotypeAgeOnsetToHpoClass(ageOnset) {
    let [year, month, day] = parseAgeString(ageOnset);
    // check null or undefined
    if (
        (year == null || year == "") &&
        (month == null || month == "") &&
        (day == null || day == "")
    ) {
        return null;
    }
    if (year >= 1) {
        if (year <= 5) {
            return {
                id: "HP:0011463",
                label: "Childhood onset",
            };
        } else if (year <= 15) {
            return {
                id: "HP:0003621",
                label: "Juvenile onset",
            };
        } else if (year <= 18) {
            return {
                id: "HP:0025708",
                label: "Early young adult onset",
            };
        } else if (year <= 24) {
            return {
                id: "HP:0025709",
                label: "Intermediate young adult onset",
            };
        } else if (year <= 39) {
            return {
                id: "HP:0025710",
                label: "Late young adult onset",
            };
        } else if (year <= 60) {
            return {
                id: "HP:0003596",
                label: "Middle age onset",
            };
        } else {
            // older than 60
            return {
                id: "HP:0003584",
                label: "Late onset",
            };
        }
    } else {
        if (month > 0 || day > 28) {
            return {
                id: "HP:0003593",
                label: "Infantile onset",
            };
        } else {
            return {
                id: "HP:0003623",
                label: "Neonatal onset",
            };
        }
    }
}

function medicalBodyInfoToMeasurements(patientData) {
    /* Sample:
    ```
     - assay:
        id: "NCIT:C81255"
        label: "Head Circumference"
      value:
        quantity:
          unit:
            id: "NCIT:C49668"
            label: "Centimeter"
          value: 59.2
        timeObserved:
          timestamp: "2022-05-08"
  
    ```
    */
    let measurements = [];
    for (
        let i = 0;
        i < patientData.medical_body_info_date_at_examination.length;
        i++
    ) {
        let eachBodyInfo = {
            medical_body_weight_at_examination:
                patientData.medical_body_weight_at_examination[i],
            medical_body_height_at_examination:
                patientData.medical_body_height_at_examination[i],
            medical_head_circumference_at_examination:
                patientData.medical_head_circumference_at_examination[i],
            medical_body_info_date_at_examination:
                patientData.medical_body_info_date_at_examination[i],
        };
        // body weight
        measurements.push({
            assay: {
                id: "NCIT:C182174",
                label: "Weight at Diagnosis",
            },
            value: {
                quantity: {
                    unit: {
                        id: "NCIT:C28252",
                        label: "Kilogram",
                    },
                    value: Number(eachBodyInfo.medical_body_weight_at_examination),
                },
            },
            timeObserved: {
                timestamp:
                    eachBodyInfo.medical_body_info_date_at_examination,
            }
        });

        // body height
        measurements.push({
            assay: {
                id: "NCIT:C164634",
                label: "Body Height",
            },
            value: {
                quantity: {
                    unit: {
                        id: "NCIT:C49668",
                        label: "Centimeter",
                    },
                    value: Number(eachBodyInfo.medical_body_height_at_examination),
                },
            },
            timeObserved: {
                timestamp:
                    eachBodyInfo.medical_body_info_date_at_examination,
            }
        });

        // head circumference
        measurements.push({
            assay: {
                id: "NCIT:C81255",
                label: "Head Circumference",
            },
            value: {
                quantity: {
                    unit: {
                        id: "NCIT:C49668",
                        label: "Centimeter",
                    },
                    value: Number(eachBodyInfo.medical_head_circumference_at_examination),
                },
            },
            timeObserved: {
                timestamp:
                    eachBodyInfo.medical_body_info_date_at_examination,
            }
        });
    }
    return measurements;
}

function patientDataToInterpretation(patientData) {
    let interpretation = {
        id: patientData.case_id,
        summary: patientData.genotype_analysis,
        diagnosis: {
            genomicInterpretations:
                retrieveGenomicInterpretations(patientData),
        },
    };
    /*
    Sample Format:
     ```
       interpretation:
         id: "CONSORTIUM:0000123456"
         progressStatus: SOLVED"
         diagnosis:
           disease:
             id: "OMIM:263750"
             label: "Miller syndrome"
     ```
     */

    // TODO: Implement after the data format of medical_final_diagnosis is decided.
    if (patientData.medical_case_solved) {
        interpretation.progressStatus =
            nameToDataValueMap.medical_case_solved[
            patientData.medical_case_solved
            ];
    }

    return interpretation;
}

function retrieveGenomicInterpretations(patientData) {
    let genomicInterpretations = [];
    if (patientData.genotype_gene) {
        for (let i = 0; i < patientData.genotype_gene.length; ++i) {
            const variationDescriptor = {}
            const chr = patientData.genotype_chr_position[i];
            const cdna = patientData.genotype_cdna_change[i];
            const protein = patientData.genotype_protein_charge[i];
            if (patientData.genotype_allelic_state[i]) {
                variationDescriptor.allelicState =
                {
                    id: genotypeAllelicStateMap[
                        patientData.genotype_allelic_state[i]
                    ],
                    label: patientData.genotype_allelic_state[i],
                };
            }
            if (
                cdna &&
                patientData.genotype_transcript[i]
            ) {
                variationDescriptor.expressions = [
                    {
                        syntax: "hgvs",
                        value: `${cdna}:${patientData.genotype_transcript[i]}`,
                    },
                ];
            }
            if (chr) {
                const [chrom, pos] = chr.split(":");
                if (chrom && pos) {
                    variationDescriptor.vcfRecord = { chrom, pos }
                }
            }
            if (
                patientData.genotype_reference[i]
            ) {
                variationDescriptor.vcfRecord = {
                    ...variationDescriptor.vcfRecord,
                    genomeAssembly: patientData.genotype_reference[i]
                }
            }
            if (
                patientData.genotype_annotation[i]
            ) {
                const matchedObj = annotationMap.find(obj => obj.annotation === patientData.genotype_annotation[i]);
                if (matchedObj) {
                    variationDescriptor.structuralType = {
                        id: matchedObj.ontologyClassId,
                        label: matchedObj.ontologyClassLabel
                    };
                }
            }

            const matchedObj = geneIdList.find(obj => obj.genotype_gene === patientData.genotype_gene[i]);
            if (matchedObj) {
                const geneContext = {
                    ...(matchedObj.hgnc_id && { valueId: `HGNC:${matchedObj.hgnc_id}` }),
                    ...(matchedObj.genotype_gene && { symbol: matchedObj.genotype_gene })
                };
                if (Object.keys(geneContext).length) {
                    variationDescriptor.geneContext = geneContext;
                }
            }
            if (chr || cdna || protein) {
                if (chr) {
                    variationDescriptor.moleculeContext = 'genomic';
                } else if (cdna) {
                    variationDescriptor.moleculeContext = 'transcript';
                } else if (protein) {
                    variationDescriptor.moleculeContext = 'protein';
                }
            }
            const genomicInterpretation = {
                subjectOrBiosampleId: patientData.case_id,
                interpretationStatus:
                    patientData.genotype_status[i]?.toUpperCase().replace(/ /g, "_"),
                variantInterpretation: {
                    acmgPathogenicityClassification:
                        patientData.genotype_pathogenicity[i],
                    variationDescriptor
                },
            };
            genomicInterpretations.push(genomicInterpretation);
        }
    }
    return genomicInterpretations;
}

// Map from case_presence_or_absence_of_onset in casesharing to affected status in phenopackets
const phenopacketAffectedStatusMap = {
    onset: "AFFECTED",
    asymptomatic: "UNAFFECTED",
    unknown: "MISSING",
};

// Map from sex in casesharing to sex in phenopackets
const phenopacketSexMap = {
    male: "MALE",
    female: "FEMALE",
    other: "OTHER_SEX",
    unknown: "UNKNOWN_SEX",
};

const genotypeAllelicStateMap = {
    heterozygous: "GENO:0000135",
    homozygous: "GENO:0000136",
    hemizygous: "GENO:0000134",
};

const phenotypeSeverityMap = {
    mild: {
        id: "HP:0012825",
        label: "Mild",
    },
    moderate: {
        id: "HP:0012826",
        label: "Moderate",
    },
    borderline: {
        id: "HP:0012827",
        label: "Borderline",
    },
    profound: {
        id: "HP:0012828",
        label: "Profound",
    },
    severe: {
        id: "HP:0012829",
        label: "Severe",
    },
};

const phenotypeTemporalPatternMap = {
    Acute: {
        id: "HP:0011009",
        label: "Acute",
    },
    "Acute emergence over days": {
        id: "HP:0025308",
        label: "Acute emergence over days",
    },
    "Acute emergence over hours": {
        id: "HP:0025307",
        label: "Acute emergence over hours",
    },
    "Acute emergence over minutes": {
        id: "HP:0025306",
        label: "Acute emergence over minutes",
    },
    chronic: {
        id: "HP:0011010",
        label: "Chronic",
    },
    diurnal: {
        id: "HP:0025302",
        label: "Diurnal",
    },
    fluctuating: {
        id: "HP:0031914",
        label: "Fluctuating",
    },
    insidious: {
        id: "HP:0003587",
        label: "Insidious onset",
    },
    migratory: {
        id: "HP:0025279",
        label: "Migratory",
    },
    nocturnal: {
        id: "HP:0025301",
        label: "Nocturnal",
    },
    prolonged: {
        id: "HP:0025297",
        label: "Prolonged",
    },
    recurrent: {
        id: "HP:0031796",
        label: "Recurrent",
    },
    Episodic: {
        id: "HP:0025303",
        label: "Episodic",
    },
    Periodic: {
        id: "HP:0025304",
        label: "Periodic",
    },
    Quotidian: {
        id: "HP:0025305",
        label: "Quotidian",
    },
    "Seizure cluster": {
        id: "HP:0033349",
        label: "Seizure cluster",
    },
    stable: {
        id: "HP:0031915",
        label: "Stable",
    },
    subacute: {
        id: "HP:0011011",
        label: "Subacute",
    },
    transient: {
        id: "HP:0025153",
        label: "Transient",
    },
};

const phenotypePaceProgressionMap = {
    Progressive: {
        id: "HP:0003676",
        label: "Progressive",
    },
    "Slowly progressive": {
        id: "HP:0003677",
        label: "Slowly progressive",
    },
    "Rapidly progressive": {
        id: "HP:0003678",
        label: "Rapidly progressive",
    },
    Nonprogressive: {
        id: "HP:0003680",
        label: "Nonprogressive",
    },
    "Variable progression rate": {
        id: "HP:0003682",
        label: "Variable progression rate",
    },
};
