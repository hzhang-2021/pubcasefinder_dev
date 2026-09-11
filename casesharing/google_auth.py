from google_auth_oauthlib.flow import Flow
from .error_message import message_unauthorized
import flask


auth_bp = flask.Blueprint('auth_bp', __name__, template_folder='templates')


class NotLoggedInError(Exception):
    def __init__(self, message):
        super().__init__(message)


CLIENT_SECRETS_FILE = 'test_client_secret.json'
SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'openid']


def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }


@auth_bp.route('/casesharing/login_test')
def google_login():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES
    )

    flow.redirect_uri = flask.url_for('auth_bp.oauth2callback', _external=True, _scheme='https')
    # flow.redirect_uri = 'http://localhost:5001/casesharing/oauth2callback'

    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    flask.session['state'] = state
    return flask.redirect(authorization_url)


@auth_bp.route('/casesharing/login_clear')
def clear_credentials():
    if 'credentials' in flask.session:
        del flask.session['credentials']
    return ('Credentials have been cleared.<br><br>')


@auth_bp.route('/casesharing/oauth2callback')
def oauth2callback():
    # Specify the state when creating the flow in the callback so that it can
    # verified in the authorization server response.
    state = flask.session['state']

    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    # flow.redirect_uri = 'http://localhost:5001/casesharing/oauth2callback'
    flow.redirect_uri = flask.url_for('auth_bp.oauth2callback', _external=True, _scheme='https')

    # Use the authorization server's response to fetch the OAuth 2.0 tokens.
    authorization_response = flask.request.url
    flow.fetch_token(authorization_response=authorization_response)

    # Store credentials in the session.
    # ACTION ITEM: In a production app, you likely want to save these
    #              credentials in a persistent database instead.
    credentials = flow.credentials
    flask.session['credentials'] = credentials_to_dict(credentials)

    # return flask.redirect('http://localhost:5001/casesharing')
    return flask.redirect(flask.request.url_root + 'casesharing')


# @auth_bp.route('/casesharing/get_gmail', methods=['GET'])
# def get_gmail(func):
#     def wrapper(*args, **kwargs):
#         # セッションに 'credentials' が存在しない場合、未ログインと判断
#         if 'credentials' not in flask.session:
#             return message_unauthorized
#         credentials = Credentials(**flask.session['credentials'])
#         service = build('oauth2', 'v2', credentials=credentials)
#         user_info = service.userinfo().get().execute()
#         user_email = user_info.get('email')
#         return func(user_email, *args, **kwargs)
#     return wrapper
def get_gmail(func):
    def wrapper(*args, **kwargs):
        user_info = flask.session.get('user-info-pcf')
        if not user_info:
            return message_unauthorized
        user_email = user_info.get('google_id')
        return func(user_email, *args, **kwargs)
    return wrapper
