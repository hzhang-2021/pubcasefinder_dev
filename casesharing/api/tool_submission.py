from sqlalchemy import or_
from .define_table import User
from .define_table import Submission
from .define_table import to_matching_rule
from .define_table import Matching
from .settings import Session
from .tool_matching import delete as delete_matching
from .tool_matching import post as add_matching
from .tool_matching import put as put_matching
from ..google_auth import get_gmail
from ..error_message import message_forbidden
from ..error_message import message_unauthorized


# POST: /casesharing/submissions/
@get_gmail
def post(
        gmail_address: str,
        name: str,
        # user_id: int,
        submitter_email: str,
        submitter_first_name: str,
        submitter_last_name: str,
        submitter_institution: str,
        suspected_diseases: str,
        clinical_diagnoses: str,
        final_diagnoses: str,
        phenotypes: str,
        gene_symbols: str,
        ensembl_ids: str,
        entrez_ids: str,
        allelic_states: str,
        inheritances: str,
        matching_rule_medical_info: str,
        matching_rule_phenotype_info: str,
        matching_rule_genotype_info: str,
        restrict_matches_to_researchers: bool,
        restrict_matches_to_providers: bool,
        comment: str = ""
):
    with Session() as session:
        submitter = session.query(
            User
        ).filter(
            User.google_id == gmail_address
        ).first()
        if not submitter:
            return message_unauthorized
        user_id = submitter.id
        submission_to_add = Submission(
            name=name,
            user_id=user_id,
            submitter_email=submitter_email,
            submitter_first_name=submitter_first_name,
            submitter_last_name=submitter_last_name,
            submitter_institution=submitter_institution,
            suspected_diseases=suspected_diseases,
            clinical_diagnoses=clinical_diagnoses,
            final_diagnoses=final_diagnoses,
            phenotypes=phenotypes,
            gene_symbols=gene_symbols,
            ensembl_ids=ensembl_ids,
            entrez_ids=entrez_ids,
            allelic_states=allelic_states,
            inheritances=inheritances,
            matching_rule_medical_info=to_matching_rule(matching_rule_medical_info),
            matching_rule_phenotype_info=to_matching_rule(matching_rule_phenotype_info),
            matching_rule_genotype_info=to_matching_rule(matching_rule_genotype_info),
            restrict_matches_to_researchers=restrict_matches_to_researchers,
            restrict_matches_to_providers=restrict_matches_to_providers,
            comment=comment,
            status="active"
        )

        session.add_all([submission_to_add])
        session.commit()
        screan_submissions(submission_to_add)
        return {
            'body': {
                'status': 'success',
                'message': 'Submission added successfully.',
                'data': submission_to_add.as_dict()
            },
            'response_code': 200
        }


# GET: /casesharing/submissions/{submission_id}
# TODO: 要検討：ログイン制限だけにする
@get_gmail
def get(gmail_address, submission_id):
    with Session() as session:
        accessor = session.query(
            User
        ).filter(
            User.google_id == gmail_address
        ).first()
        if not accessor:
            return message_unauthorized
        selected_submission = session.query(
            Submission
        ).filter(
            Submission.id == submission_id
        ).first()
        if selected_submission:
            return {
                'body': {
                    'status': 'success',
                    'data': selected_submission.as_dict()
                },
                'response_code': 200
            }
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': {
                        'code': 404,
                        'message': 'Submission not found.'
                    }
                },
                'response_code': 404
            }


# PUT (multiple fields): /casesharing/submissions/{submission_id}
@get_gmail
def put_multiple(gmail_address, submission_id, updates):
    with Session() as session:
        submission_to_update: Submission | None = session.query(
            Submission
        ).filter(
            Submission.id == submission_id
        ).first()
        if submission_to_update:
            submitter = session.query(
                User
            ).filter(
                User.id == submission_to_update.user_id
            ).first()
            
            if submitter.google_id == gmail_address:
                if "status" in updates and updates["status"] not in ("suspend", "active"):
                    return {
                        'body': {
                            'status': 'error',
                            'error': 'matching status must be "suspend" or "active".'
                        },
                        'response_code': 422
                    }
                
                # 全てのフィールドを更新
                updated_fields = []
                for column_name, new_value in updates.items():
                    setattr(submission_to_update, column_name, new_value)
                    updated_fields.append(column_name)
                
                # matchingの再計算
                child_matching = session.query(
                    Matching
                ).filter(
                    or_(
                        Matching.source_submission_id == submission_id,
                        Matching.target_submission_id == submission_id
                    )
                )
                
                for matching in child_matching:
                    source_submission = session.query(
                        Submission
                    ).filter(
                        Submission.id == matching.source_submission_id
                    ).first()
                    target_submission = session.query(
                        Submission
                    ).filter(
                        Submission.id == matching.target_submission_id
                    ).first()
                    matching_info = is_matched(source_submission=source_submission, target_submission=target_submission)
                    if not matching_info["matched"]:
                        delete_matching(matching_id=matching.id)
                    else:
                        put_matching(
                            matching_id=matching.id,
                            column_name="medical_rule",
                            new_value=matching_info["medical_rule"]
                        )
                        put_matching(
                            matching_id=matching.id,
                            column_name="phenotype_rule",
                            new_value=matching_info["phenotype_rule"]
                        )
                        put_matching(
                            matching_id=matching.id,
                            column_name="genotype_rule",
                            new_value=matching_info["genotype_rule"]
                        )
                        put_matching(
                            matching_id=matching.id,
                            column_name="medical_match",
                            new_value=matching_info["medical_match"]
                        )
                        put_matching(
                            matching_id=matching.id,
                            column_name="phenotype_match",
                            new_value=matching_info["phenotype_match"]
                        )
                        put_matching(
                            matching_id=matching.id,
                            column_name="genotype_match",
                            new_value=matching_info["genotype_match"]
                        )
                    # if column_name in ["suspected_diseases", "clinical_diagnoses", "final_diagnoses"]:
                    #     if (matching.medical_rule == "required" or
                    #             (matching.medical_rule == "optional" and not matching.genotype_match)):
                    #         delete_matching(matching_id=matching.id)

                    # elif column_name in ["gene_symbols", "ensembl_ids", "entrez_ids"]:
                    #     if (matching.genotype_rule == "required" or
                    #             (matching.genotype_rule == "optional" and not matching.medical_match)):
                    #         delete_matching(matching_id=matching.id)
                session.commit()
                screan_submissions(submission_to_update)
                return {
                    'body': {
                        'status': 'success',
                        'message': 'Submission updated successfuly.',
                        'data': {
                            'updated_fields': updated_fields
                        }
                    },
                    'response_code': 200
                }
            else:
                return message_forbidden
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': {
                        'message': 'Submission not found.'
                    }
                },
                'response_code': 404
            }


# DELETE: /casesharing/submissions/{submission_id}
@get_gmail
def delete(gmail_address, submission_id):
    with Session() as session:
        submission_to_delete: Submission | None = session.query(
            Submission
        ).filter(
            Submission.id == submission_id
        ).first()
        if submission_to_delete:
            submitter = session.query(
                User
            ).filter(
                User.id == submission_to_delete.user_id
            ).first()
            if submitter.google_id == gmail_address:
                child_matching = session.query(
                    Matching
                ).filter(
                    or_(
                        Matching.source_submission_id == submission_id,
                        Matching.target_submission_id == submission_id
                    )
                )
                for matching in child_matching:
                    delete_matching(matching_id=matching.id)
                session.delete(submission_to_delete)
                session.commit()
                return {
                    'body': {
                        'status': 'success',
                        'message': 'Submission deleted successfuly.'
                    },
                    'response_code': 204
                }
            else:
                return message_forbidden
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': {
                        'message': 'Submission not found.'
                    }
                },
                'response_code': 404
            }


def is_matched(source_submission: Submission, target_submission: Submission):
    medical_rule = source_submission.matching_rule_medical_info
    phenotype_rule = source_submission.matching_rule_phenotype_info or 'ignored'
    genotype_rule = source_submission.matching_rule_genotype_info
    medical_match = source_submission.is_medical_info_matched(target_submission)
    phenotype_match = source_submission.is_phenotype_info_matched(target_submission)
    genotype_match = source_submission.is_genotype_info_matched(target_submission)

    rules = {'medical': medical_rule, 'phenotype': phenotype_rule, 'genotype': genotype_rule}
    matches = {'medical': medical_match, 'phenotype': phenotype_match, 'genotype': genotype_match}
    required_keys = [k for k, v in rules.items() if v == 'required']
    optional_keys = [k for k, v in rules.items() if v == 'optional']

    if not required_keys and not optional_keys:
        raise ValueError("All matching rules cannot be 'ignored' at the same time.")

    if required_keys:
        matched = all(matches[k] for k in required_keys)
    else:
        matched = any(matches[k] for k in optional_keys)

    return {
        "matched": matched,
        "medical_rule": medical_rule,
        "phenotype_rule": phenotype_rule,
        "genotype_rule": genotype_rule,
        "medical_match": medical_match,
        "phenotype_match": phenotype_match,
        "genotype_match": genotype_match
    }


def try_matching(source_submission: Submission, target_submission: Submission):
    matching_info = is_matched(source_submission=source_submission, target_submission=target_submission)
    if matching_info["matched"]:
        add_matching(
            source_submission_id=source_submission.id,
            target_submission_id=target_submission.id,
            medical_rule=matching_info["medical_rule"],
            phenotype_rule=matching_info["phenotype_rule"],
            genotype_rule=matching_info["genotype_rule"],
            medical_match=matching_info["medical_match"],
            phenotype_match=matching_info["phenotype_match"],
            genotype_match=matching_info["genotype_match"]
        )


def screan_submissions(new_submission: Submission):
    if new_submission.status != 'active':
        return
    with Session() as session:
        existing_submissions: list[Submission] = session.query(
            Submission
        ).filter(
            Submission.status == 'active'
        )
        for submission in existing_submissions:
            if new_submission.user_id == submission.user_id:
                continue
            try_matching(source_submission=new_submission, target_submission=submission)
            try_matching(source_submission=submission, target_submission=new_submission)
