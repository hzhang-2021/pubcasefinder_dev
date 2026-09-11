from sqlalchemy import and_
from .define_table import Matching
from .define_table import Submission
from .define_table import User
from .settings import Session
from ..google_auth import get_gmail
from ..error_message import message_forbidden
from ..error_message import message_unauthorized
import datetime as dt


# POST: /casesharing/matchings/
def post(
        source_submission_id: int,
        target_submission_id: int,
        medical_rule,
        phenotype_rule,
        genotype_rule,
        medical_match,
        phenotype_match,
        genotype_match
):
    with Session() as session:
        existing_matching = session.query(
            Matching
        ).filter(
            and_(
                Matching.source_submission_id == source_submission_id,
                Matching.target_submission_id == target_submission_id
            )
        ).first()
        if not existing_matching:
            matching_to_add = Matching(
                source_submission_id=source_submission_id,
                target_submission_id=target_submission_id,
                medical_rule=medical_rule,
                phenotype_rule=phenotype_rule,
                genotype_rule=genotype_rule,
                medical_match=medical_match,
                phenotype_match=phenotype_match,
                genotype_match=genotype_match,
                score=calc_score(),
                date=dt.date.today()
            )
            session.add_all([matching_to_add])
            session.commit()
            return {
                'body': {
                    'status': 'success',
                    'message': 'Matching added successfully.',
                    'data': matching_to_add.as_dict()
                },
                'response_code': 200
            }


# GET: /casesharing/matchings/{matching_id}
@get_gmail
def get(user_email, matching_id):
    with Session() as session:
        selected_matching = session.query(
            Matching
        ).filter(
            Matching.id == matching_id
        ).first()
        if not selected_matching:
            return {
                'body': {
                    'status': 'error',
                    'error': 'Matching not found.'
                },
                'response_code': 404
            }
        source_submission = session.query(
            Submission
        ).filter(
            Submission.id == selected_matching.source_submission_id
        ).first()
        submitter = session.query(
            User
        ).filter(
            User.id == source_submission.user_id
        ).first()
        if submitter.google_id == user_email:
            return {
                'body': {
                    'status': 'success',
                    'data': selected_matching.as_dict()
                },
                'response_code': 200
            }
        else:
            return message_forbidden


def put(matching_id, column_name, new_value):
    with Session() as session:
        matching_to_update: Matching | None = session.query(
            Matching
        ).filter(
            Matching.id == matching_id
        ).first()
        if matching_to_update:
            setattr(matching_to_update, column_name, new_value)
            session.commit()
            return {
                'body': {
                    'status': 'success',
                    'data': {
                        'updated_field': column_name
                    }
                },
                'response_code': 200
            }
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': 'Matching not found.'
                },
                'response_code': 404
            }


# DELETE: /casesharing/matchings/{matching_id}
def delete(matching_id):
    with Session() as session:
        matching_to_delete = session.query(
            Matching
        ).filter(
            Matching.id == matching_id
        ).first()
        if matching_to_delete:
            session.delete(matching_to_delete)
            session.commit()
            return {
                'body': {
                    'status': 'success',
                    'message': 'Matching deleted successfuly.'
                },
                'response_code': 200
            }
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': 'Matching not found.'
                },
                'response_code': 404
            }


def calc_score():
    return 1


@get_gmail
def get_all_with_submission_id(gmail_address, submission_id):
    with Session() as session:
        accessor = session.query(
            User
        ).filter(
            User.google_id == gmail_address
        ).first()
        if not accessor:
            return message_unauthorized
        matchings = session.query(
            Matching
        ).join(
            Submission, Matching.target_submission_id == Submission.id
        ).filter(
            Matching.source_submission_id == submission_id,
            Submission.status == 'active'
        ).all()
        return {
            'body': {
                'status': 'success',
                'data': [matching.as_dict() for matching in matchings]
            },
            'response_code': 200
        }


@get_gmail
def get_matching_count_with_submission_id(gmail_address, submission_id):
    with Session() as session:
        accessor = session.query(
            User
        ).filter(
            User.google_id == gmail_address
        ).first()
        if not accessor:
            return message_unauthorized
        matchings = session.query(
            Matching
        ).join(
            Submission, Matching.target_submission_id == Submission.id
        ).filter(
            Matching.source_submission_id == submission_id,
            Submission.status == 'active'
        ).all()
        count_already_read = len([matching for matching in matchings if matching.is_read == 1])
        count_not_read = len(matchings) - count_already_read
        return {
            'body': {
                'status': 'success',
                'data': {
                    'total': len(matchings),
                    'already_read': count_already_read,
                    'not_read': count_not_read
                }
            },
            'response_code': 200
        }