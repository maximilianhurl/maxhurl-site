from datetime import date
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin
from os import environ
import requests


app = Flask(__name__, static_folder='static/build', static_url_path='/static')
CORS(app)


MAILGUN_KEY = environ['MAILGUN_KEY']
APP_MESSAGE_KEY = environ['APP_MESSAGE_KEY']
MARK_MESSAGE_KEY = environ['MARK_MESSAGE_KEY']


@app.context_processor
def inject_current_year():
    return dict(year=date.today().year)


@app.route("/")
def index():
    return render_template('base.html')


@app.route("/cv/")
def cv():
    return render_template('cv.html')


@app.route('/robots.txt')
def robots():
    return app.send_static_file('robots.txt')


def send_message(to, subject, message):
    requests.post(
        "https://api.mailgun.net/v2/sandboxb7645bd943614e39bb23ef85318eb9e1.mailgun.org/messages",
        auth=("api", MAILGUN_KEY),
        data={
            "from": "no-reply <no-reply@sandboxb7645bd943614e39bb23ef85318eb9e1.mailgun.org>",
            "to": to,
            "subject": subject,
            "text": message
        }
    )


@app.route("/send-mark-message/", methods=['POST'])
@cross_origin()
def send_mark_message():

    for value in ['name', 'message', 'email', 'phone_number', 'mark_message_key']:
        if value not in request.form.keys():
            return jsonify(message="Unable to send message"), 400

    if request.form["mark_message_key"] != MARK_MESSAGE_KEY:
        return jsonify(message="Incorrect key"), 400

    to_emails = "Max <max@maxhurl.co.uk>, Mark <info@theshoelounge.net>"
    name = request.form["name"]
    email = request.form["email"]
    phone_number = request.form["phone_number"]
    message = request.form["message"]

    email_text = """
        Name:\n %s \n\n
        Email:\n %s \n\n
        Phone Number:\n %s \n\n
        Message:\n %s \n
    """ % (name, email, phone_number, message)

    send_message(to_emails, "theshoelounge.net Contact Form Message", email_text)

    return jsonify(message="Message sent"), 200


@app.route("/send-app-message/", methods=['POST'])
def send_app_message():

    # Send an email if all the parameters are there

    for value in ['user_email', 'user_message', 'app_message_key']:
        if value not in request.form.keys():
            return jsonify(message="Unable to send message"), 400

    if request.form["app_message_key"] != APP_MESSAGE_KEY:
        return jsonify(message="Incorrect key"), 400

    user_email = request.form["user_email"]
    user_message = request.form["user_message"]

    email_text = "User Email:\n %s \n\n User Message:\n %s \n" % (user_email, user_message)

    send_message("Max <max@maxhurl.co.uk>", "Jotter Feedback Message", email_text)

    return jsonify(message="Message sent"), 200


if __name__ == "__main__":
    app.run(debug=False)
