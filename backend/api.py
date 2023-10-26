from flask import Flask, request, jsonify, Response, send_from_directory
import json
import os
from flask_cors import CORS, cross_origin
import concurrent.futures
from BingImageCreator import ImageGen

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, allow_headers=["Content-Type"], supports_credentials=True, intercept_exceptions=False)
results = {}
finished_accounts_count = 0  # Initialize the count
stream_active = False

MAX_DURATION = 30

accounts = [
    # {"auth_cookie": '15EWesECENfdrO2F1vnOlKV4RV_UOzTScFjvp_CQRottfT-4B_BskTiYcQiogatAbh_yfV5djAo7ZeGylY6GgO-2HskbZ7X_nPejyDMDWu_y-eubyOXCqA1G3vvFNuvAjz4_YqkgL86kgUQg66kkaVECzoj0IADLU94XqXHiQtLWQ-mDAXLxgPWpgrBua2Gx1zt052B4kIWai8mg2qLSyDQ'},
    # {"auth_cookie": '1vpfSN322RVsDPbT6sK94kx6mLXnE42FyflwkPuJPSRURachs1A9n_A8WojUEn71bKvsMKJCAaWE2-SU6albhocohnWhV_cNcUTJwAf-fLbUyhoU9z_tjiqnToH3e-30FAUQLRtdZ8a1lLd02NcL48abxiWSi5iu5II-Y7DHQFfgO4psg6c4t7N1ePWukIOCeiMkEgBrGIozBzrj92aFCtw'},
    # {"auth_cookie": '1eLyhX09ULvcR6CkAB8XcfKt9_71mDVsbTE4phqsN-3R7K_-zD9I5c8xMk7YxKHnlv-9ZP1mEfDarE4Y-MqymPytDulJaAvY9iW-8MC_s79oeMfwixHYIc2inb_FXw5FLKDNTszxWoPRJaDizxqvaXKVOBTPWPyuWieGjQiczkEeGjEcfjyddlWq1jFcX0V0z2aiw-vdcDYvTHnvjQSO6EA'},
    # {"auth_cookie": '1tDJdrDjgFoiYZEXUFkUiUV78P557agAa3vIsaTllt1J3OzvU4VO76JysQ7JPQHKtfBxmz8XyJMCk4nG_Sa1CjYWvMN64EDmypwCSmRGQlxfoOAiXeFFxITP75lqZtHq11zbFJBsdMqSjblVw77NDF3njBeqCgcnv5L9w_cqbrauzw8vaRuNgSI3WEu0l05c0gW0vGuESMtVdcVkEnoOVYQ'},
    # {"auth_cookie": '1JOLYDnx3594zgCDBaUIYjpwp9-lreGa7LRni-zjxluGPkhUOEmuyNL-2lUWCnJgjEG3BDaIbk-RPbjOWu8-nUGpMonVw2tEi5TRNCJu7Al4HCS00a4u3jow7SWX_loO12BHWxITWGddaxRB3Glnb0xPpv_KmtXBtvwst4N4IOz6ibufu9xgpNFe6Msww6xwvxe-tNuKNJ9Zj1Qs1DqQeFg'},
    # {"auth_cookie": '1RCSOakMvYE4NdE8BJ_bDEuJiQGUQFGVQ2zg7eMAj-2eRTeQJf-EdXAfZxWYAKoowXWfHkw-4stH1MLIIx-gUpY2DkLd0e_Hdtn3UW3g0pbWnjclmyDZJUo7RX3TFwBkqMjUBsFbRpfswNhxrH1iejbURvmMu5p24qKQQkUUTo0r29cIkPcKQwWr2eZK_7ow5r31tD4eO0JDxZ25FDjNttA'},
    # {"auth_cookie": '1NCtg3-n7d6b8ovpnhCbPrGYU4Oyg6x2aKXfMBQVr9KwcXB3egTnrD0LGZ6Cs6AFuGnvaG4Im_Ae5W8fnzn0kOSeefpUgSkvfWFJqlnuRI017vrsHLSbt7-Iudz2XrjvDMIcefV2LQ6DeHic3L4Pcr2qjKu6fWLFAlgRlz9Z6-_pwBi6_koSWMw8t536yUMQYdoFDJn96K5N2TpEQlt8RtQ'},
    # {"auth_cookie": '1goRrdf3R5yNL6wCUVRzQfsjICu4BBkI432unXgw_gRjhYB6hKIKhmvpxUhJMpmPNlmhGWk8sGuV6C5_q1vVUx7FH3hJcLcsFE83Tx8BD6UknSW9V2RiMx3I4McApRKyOj7ZlAS23SE1wFnVGFDym90umiCicuUJWF9_t_EXiIkFeqhqCdrYaSgCVMetMSHAinUz4syYXg8kFJEbLZ2Vl_w'},
    # {"auth_cookie": '1lBFTDuaDpZ2ZhcaWi4Sk9ToWdHllO-FDy_ZFOYUQOTxn3xCjVHJu7wFncT8VD7ExFZt1ORCw4XSRx2kHq2EJmu8CttRc-IEwWindmXas-W61HLjcT9AyRgKRoDaAsbqKPKSxYClTU1-T1tOb8AWik5WXhl5j_YTsdxrGPYuWb9i0HfYSmTW5pKJdoefODbwlJZDrHPU0DQtcu9vR-u8kkg'},
    # {"auth_cookie": '1eh1K-4EAFN2mcF2dcjau64Nn7276UzXJe4KmQc_H8RefwJ9-Kjizy5jZ_VF253deGsVW1BJBZxlfGnj9IUTzh6-9SZ_WxzZ6QovR_elKTOrAMRahkShbsaujqkckHWaqrm7eWynl8peT_rvZM-2N--Ov1TN4XUrYERYVDUpoSMQ-M1udOqBIbdgH8W4Y8tRK_FxeCmVylTE40XD-WOwn-w'},
    {"auth_cookie": '17nEC3374fufeUXQRb4yu2e95UetjyQqn-zaQ3oT0qO4ArtggJqiSoGrCdcq-u_HLSn1FCD2WpNUPNoQ1TR298-bbOYN3AjZ3gg31xt10SCmPqamfsmu5OaxO6ll-JwSR2N2fgMAlK5PGGodPGnCEBHqjjvThIwAN3GwTWnEBTbDNEn5-_Hp4RehZLvJA9aT82LyheYzJPZV-F7QwaExaiw'},
    # {"auth_cookie": ''},
    # {"auth_cookie": ''},
    # {"auth_cookie": ''},
    # Add more accounts as needed
]

@app.route('/generate-images', methods=['POST'])
@cross_origin()
def generate_images():
    prompt = request.json.get('prompt')
    global stream_active
    stream_active = True
    generate_images_for_accounts(prompt)
    return 'Image generation started'

@app.route('/test-testing')
def test1():
    return 'test1'

@app.route('/test2-testing2', methods=['POST'])
def test2():
    return 'test2'

@app.route('/test3-testing3', methods=['GET'])
def test3():
    return 'test3'

@app.route('/sse')
@cross_origin()
def sse():
    def event_stream():
        global finished_accounts_count
        global stream_active
        while stream_active:  # Continue while the stream is active
            with app.app_context():
                copied_results = results.copy()
                for account, links in copied_results.items():
                    data = {'account': account, 'links': links}
                    yield f'data: {json.dumps(data)}\n\n'
                    results.pop(account, None)
                    finished_accounts_count += 1  # Increment the count for each finished account
                if finished_accounts_count == len(accounts):
                    stream_active = False  # Set stream_active to False when all accounts are finished

    return Response(event_stream(), mimetype='text/event-stream')

def fetch_images(account, prompt):
    image_gen = ImageGen(auth_cookie=account['auth_cookie'], auth_cookie_SRCHHPGUSR='your_auth_cookie_SRCHHPGUSR')
    try:
        links = image_gen.get_images(prompt)
        print(f'Links for {account["auth_cookie"][:5]}: {links}')
        results[account['auth_cookie']] = links  # Store results for this account
    except Exception as e:
        print(f'Account {account["auth_cookie"][:5]} crashed: {str(e)}')

def generate_images_for_accounts(prompt):
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(accounts)) as executor:
        futures = {executor.submit(fetch_images, account, prompt): account for account in accounts}

        for future in concurrent.futures.as_completed(futures):
            account = futures[future]
            print(f'Account {account["auth_cookie"][:5]} finished image generation')

@app.route('/')
def test():
    return "Hello world"

@app.route('/gila')
def gila():
    return "gila bisa"


if __name__ == '__main__':
    # Use the PORT environment variable if available, or default to 8080
    app.run(port=int(os.environ.get("PORT", 8080)), host='0.0.0.0', debug=True)
