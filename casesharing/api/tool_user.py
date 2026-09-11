from .define_table import User
from .define_table import Submission
from sqlalchemy import select
from .settings import Session
from .tool_submission import delete as delete_submission
from ..google_auth import get_gmail
from ..error_message import message_forbidden
import datetime as dt


# POST: users
def post(
        google_id: str,
        first_name_en: str,
        last_name_en: str,
        affiliation_en: str,
        job_title_en: str,
        group_en: str,
        user_type: int,
        email: str,
        first_name_nl: str = "",
        last_name_nl: str = "",
        affiliation_nl: str = "",
        job_title_nl: str = "",
        group_nl: str = ""
):
    with Session() as session:
        user_emails = {user.email for user in session.scalars(select(User))}
        if email in user_emails:
            return {
                'body': {
                    'status': 'error',
                    'error': "email is not unique."
                },
                'response_code': 409
            }

        user_to_add = User(
            google_id=google_id,
            first_name_en=first_name_en,
            last_name_en=last_name_en,
            affiliation_en=affiliation_en,
            job_title_en=job_title_en,
            group_en=group_en,
            first_name_nl=first_name_nl,
            last_name_nl=last_name_nl,
            affiliation_nl=affiliation_nl,
            job_title_nl=job_title_nl,
            group_nl=group_nl,
            user_type=user_type,
            email=email,
            created_at=dt.datetime.now()
        )

        session.add_all([user_to_add])
        session.commit()
        return {
            'body': {
                'status': 'success',
                'message': 'User added successfully.',
                'data': user_to_add.as_dict()
            },
            'response_code': 200
        }


# GET: /casesharing/users/<user_id>
@get_gmail
def get(gmail_address, user_id):
    with Session() as session:
        selected_user = session.query(
            User
        ).filter(
            User.id == user_id
        ).first()
        if selected_user:
            if selected_user.google_id == gmail_address:
                return {
                    'body': {
                        'status': 'success',
                        'data': selected_user.as_dict()
                    },
                    'response_code': 200
                }
            else:
                return message_forbidden
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': 'User not found.'
                },
                'response_code': 404
            }


# DELETE: /casesharing/users/{user_id}
@get_gmail
def delete(gmail_address, user_id):
    with Session() as session:
        user_to_delete: User | None = session.query(
            User
        ).filter(
            User.id == user_id
        ).first()
        if user_to_delete:
            if user_to_delete.google_id == gmail_address:
                child_submission = session.query(
                    Submission
                ).filter(
                    Submission.user_id == user_id
                )
                for submission in child_submission:
                    delete_submission(submission_id=submission.id)
                session.delete(user_to_delete)
                session.commit()
                return {
                    'body': {
                        'status': 'success',
                        'message': 'User deleted successfuly.'
                    },
                    'response_code': 200
                }
            else:
                return message_forbidden
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': 'User not found.'
                },
                'response_code': 404
            }


@get_gmail
def put(gmail_address, user_id, column_name, new_value):
    with Session() as session:
        user_to_update: User | None = session.query(
            User
        ).filter(
            User.id == user_id
        ).first()
        if user_to_update:
            if user_to_update.google_id == gmail_address:
                setattr(user_to_update, column_name, new_value)
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
                return message_forbidden
        else:
            return {
                'body': {
                    'status': 'error',
                    'error': 'User not found.'
                },
                'response_code': 404
            }
