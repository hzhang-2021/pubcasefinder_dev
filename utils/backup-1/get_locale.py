# -*- coding: utf-8 -*-

import os
import re
from flask import Flask, session, render_template, request, redirect, url_for, jsonify
from flask_babel import Babel

app = Flask(__name__)
app.secret_key = 'pubcasefinder1210'

def get_locale():
    if 'lang' not in session:
        session['lang'] = request.accept_languages.best_match(['ja', 'ja_JP', 'en'])
    if request.args.get('lang'):
        session['lang'] = request.args.get('lang')
    return session.get('lang', 'en')

# flask の　@babel.localeselector
# https://stackoverflow.com/questions/75229322/flask-babel-get-locale-seems-to-be-not-working
babel = Babel(app, locale_selector=get_locale)