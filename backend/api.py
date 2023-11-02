from flask import Flask, request
import os
from flask_cors import CORS, cross_origin
from BingImageCreator import ImageGen

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {"origins": ["https://super-dalle-3.web.app", "http://localhost:3000"]}
    },
    allow_headers=["Content-Type"],
    supports_credentials=True,
    intercept_exceptions=False
)

results = {}

@app.route('/generate-images', methods=['POST'])
@cross_origin()
def generate_images():
    data = request.json
    prompt = data.get('prompt')
    account = data.get('account')
    if not prompt or not account:
        return 'Invalid request data', 400

    generate_images_for_account(account, prompt)
    print(f"account is {account['auth_cookie'][:5]} and results is {results}")
    return results

def generate_images_for_account(account, prompt):
    image_gen = ImageGen(auth_cookie=account['auth_cookie'], auth_cookie_SRCHHPGUSR='your_auth_cookie_SRCHHPGUSR')
    try:
        links = image_gen.get_images(prompt)
        print(f'Links for {account["auth_cookie"][:5]}: {links}')
        results[account['auth_cookie']] = links
    except Exception as e:
        # print(f'Account {account["auth_cookie"][:5]} crashed: {str(e)}')
        print(f'{account['auth_cookie'][:5]} crashed due to: {str(e)[:50]}')

@app.route('/')
def test():
    return "Hello world"

if __name__ == '__main__':
    # Use the PORT environment variable if available, or default to 8080
    app.run(port=int(os.environ.get("PORT", 8080)), host='0.0.0.0', debug=True)


#########################################
# IGNORE THIS:

# from flask import Flask, request, jsonify
# from flask_socketio import SocketIO, send, emit
# from BingImageCreator import ImageGen
# from flask_cors import CORS, cross_origin
# import concurrent.futures

# # Configure Flask to log all requests
# app = Flask(_name_)
# socketio = SocketIO(app, cors_allowed_origins="*")

# CORS(app, resources={r"/api/": {"origins": ""}}, allow_headers=["Content-Type"], supports_credentials=True, intercept_exceptions=False)

# results = {}

# accounts = [
#     # {"auth_cookie": '1JOLYDnx3594zgCDBaUIYjpwp9-lreGa7LRni-zjxluGPkhUOEmuyNL-2lUWCnJgjEG3BDaIbk-RPbjOWu8-nUGpMonVw2tEi5TRNCJu7Al4HCS00a4u3jow7SWX_loO12BHWxITWGddaxRB3Glnb0xPpv_KmtXBtvwst4N4IOz6ibufu9xgpNFe6Msww6xwvxe-tNuKNJ9Zj1Qs1DqQeFg'},
#     # {"auth_cookie": '1RCSOakMvYE4NdE8BJ_bDEuJiQGUQFGVQ2zg7eMAj-2eRTeQJf-EdXAfZxWYAKoowXWfHkw-4stH1MLIIx-gUpY2DkLd0e_Hdtn3UW3g0pbWnjclmyDZJUo7RX3TFwBkqMjUBsFbRpfswNhxrH1iejbURvmMu5p24qKQQkUUTo0r29cIkPcKQwWr2eZK_7ow5r31tD4eO0JDxZ25FDjNttA'},
#     # {"auth_cookie": '12UeZYIBKcA1sOOyNP2r4NLUeBVys278LtB8aHPdIdYGs-tYHZF0AJlBXY4fDbQPDS3DZItPHKbyMzaeCyfbthUUwEFhtrp5QyhCPdmq3GLu7ue5r98y_5fs67mJl9cetxgqB_C0R9G4lF9LtBGGG100WRedZvhvpFJH6f-r9OWNS81vSrVY1g-uUPcirpqbN7iKnBWMPdVg54aq1gM8hqw'},
#     {"auth_cookie": '1JXlLQMLrf2ASuPtWVOxZbO2Zi0lNNBUuk_V6OnLL22xJdITxAGrNp6R3LkP9N3wAUBnLcBZlZ9ck0bN7duU8EsHP1FjEiuotN8c8KWI3j-_DNlHl9RLEYHRNUbVeUcjp5Tn7xBiR-oOGsoKSuf1m4j4b9X2Has8uebeW_0MnRt1qDMLrs7TusmElr8bWbmFUt9ceOj4cpi8S2zuWSvu28Q'},
#     # Add more accounts as needed
# ]

# @app.route('/')
# @cross_origin()
# def test():
#     return "Hello world"

# @app.route('/get-images', methods=['GET'])
# @cross_origin()
# def get_images():
#     prompt = request.args.get('prompt')
#     # Simulate image generation (replace this with your actual code)
#     all_links = generate_images_for_prompt(prompt)
#     return jsonify(all_links)

# def generate_images_for_prompt(prompt):
#     all_links = []

#     def generate_images_for_account(account):
#         nonlocal all_links
#         image_gen = ImageGen(auth_cookie=account['auth_cookie'], auth_cookie_SRCHHPGUSR='your_auth_cookie_SRCHHPGUSR')
#         try:
#             links = image_gen.get_images(prompt)
#             print(f'Account {account["auth_cookie"][:5]} generated {len(links)} images')
#             all_links.extend(links)
#         except Exception as e:
#             print(f'Account {account["auth_cookie"][:5]} crashed: {str(e)}')

#     # Use concurrent.futures to send requests simultaneously
#     with concurrent.futures.ThreadPoolExecutor() as executor:
#         futures = {executor.submit(generate_images_for_account, account) for account in accounts}
#         concurrent.futures.wait(futures)

#     return all_links

# if _name_ == '_main_':
#     app.run(host='0.0.0.0', port=8080, debug=True)