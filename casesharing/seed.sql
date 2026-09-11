DELETE FROM casesharing.user_account;

INSERT INTO casesharing.user_account (
    id, google_id, first_name_en, last_name_en, affiliation_en, job_title_en,
    group_en, first_name_nl, last_name_nl, affiliation_nl, job_title_nl,
    group_nl, user_type, email, created_at
) VALUES
(
    1, 'example@gmail.com', 'John', 'Doe', 'Company A', 'Manager', 'Sales',
    'Jan', 'Janssen', 'Bedrijf A', 'Manager', 'Verkoop', 1,
    'john.doe@example.com', NOW()
),

(
    2, 'example123@gmail.com', 'Jane', 'Smith', 'Company B', 'Developer', 'IT',
    'Emma', 'Smit', 'Bedrijf B', 'Ontwikkelaar', 'IT', 2,
    'jane.smith@example.com', NOW()
),

(
    3, 'google789@gmail.com', 'Mike', 'Johnson', 'Company C', 'Analyst',
    'Finance', 'Michiel', 'Jansen', 'Bedrijf C', 'Analist', 'Financiën',
    1, 'mike.johnson@example.com', NOW()
);

-- submissionテーブルの既存データを削除（オプション）
DELETE FROM casesharing.submission;

-- submissionテーブルに初期データを挿入
INSERT INTO casesharing.submission (
    name, user_id, submitter_email, submitter_first_name, submitter_last_name,
    submitter_institution, suspected_diseases, clinical_diagnoses, final_diagnoses,
    phenotypes, gene_symbols, ensembl_ids, entrez_ids,
    matching_rule_medical_info, matching_rule_genotype_info,
    restrict_matches_to_researchers, restrict_matches_to_providers, comment
) VALUES
(
    'Case 1', 1, 'example+john@gmail.com', 'John', 'Doe',
    'Hospital A', 'Suspected Disease 1', 'Clinical Diagnosis 1', 'Final Diagnosis 1',
    'Phenotype 1, Phenotype 2', 'BRCA1, BRCA2', 'ENSG00000012048, ENSG00000139618', '672, 675',
    'RULE1', 'RULE2',
    1, 0, 'This is a comment for Case 1'
),
(
    'Case 2', 2, 'example+jane@gmail.com', 'Jane', 'Smith',
    'Hospital B', 'Suspected Disease 2', 'Clinical Diagnosis 2', 'Final Diagnosis 2',
    'Phenotype 3, Phenotype 4', 'TP53, APC', 'ENSG00000141510, ENSG00000134982', '7157, 324',
    'RULE3', 'RULE4',
    0, 1, 'This is a comment for Case 2'
),
(
    'Case 3', 3, 'example+mike@gmail.com', 'Mike', 'Johnson',
    'Hospital C', 'Suspected Disease 3', 'Clinical Diagnosis 3', 'Final Diagnosis 3',
    'Phenotype 5, Phenotype 6', 'PTEN, MLH1', 'ENSG00000171862, ENSG00000076242', '5728, 4292',
    'RULE5', 'RULE6',
    1, 1, 'This is a comment for Case 3'
);

-- matchingテーブルの既存データを削除（オプション）
DELETE FROM casesharing.matching;

-- matchingテーブルに初期データを挿入
INSERT INTO casesharing.matching (
    source_submission_id, target_submission_id, medical_rule, genotype_rule,
    medical_match, genotype_match, score, date
) VALUES
(
    1, 2, 'required', 'optional',
    TRUE, TRUE, 85, '2024-08-04'
),
(
    1, 3, 'optional', 'optional',
    TRUE, FALSE, 60, '2024-08-04'
),
(
    2, 3, 'ignored', 'required',
    FALSE, TRUE, 40, '2024-08-04'
),
(
    3, 1, 'required', 'required',
    TRUE, TRUE, 90, '2024-08-04'
);