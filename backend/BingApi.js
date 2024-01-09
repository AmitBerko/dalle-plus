const cheerio = require('cheerio')
const bingUrl = 'https://www.bing.com'

class BingApi {
	#headers
	constructor(cookie) {
		this.cookie = cookie
		this.#headers = {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
			Accept:
				'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.5',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Alt-Used': 'www.bing.com',
			'Upgrade-Insecure-Requests': '1',
			'Sec-Fetch-Dest': 'document',
			'Sec-Fetch-Mode': 'navigate',
			'Sec-Fetch-Site': 'same-origin',
			'Sec-Fetch-User': '?1',
			Cookie: `_U=${cookie};`,
			'X-Forwarded-For': `20.${this.#getRandomNum()}.${this.#getRandomNum()}.${this.#getRandomNum()}`,
		}
	}

	async createImages(prompt, isSlowMode) {
		try {
			const payload = `q=${encodeURIComponent(prompt)}`
			let credits = await this.getCredits()
			if (!credits) {
				credits = 0 // Just incase it fails to get the credits
			}
			console.log(`${credits} credits`)
			// If the account ran out of credits, use slowmode, otherwise let the parameter determine
			let response = await this.#sendRequest(credits > 0 ? isSlowMode : true, payload)
			console.log(`status is ${response.status}`)

			// Error handlers
			if (response.status === 200) {
				const responseHtml = await response.text()
				const $ = cheerio.load(responseHtml)
				const errorAmount = $('.gil_err_img.rms_img').length
				if (
					$('#gilen_son').hasClass('show_n') ||
					(errorAmount === 2 && credits > 0 && isSlowMode)
				) {
					throw 'Dalle-3 is currently unavailable'
				} else if (errorAmount === 2) {
					throw 'Invalid cookie'
				} else if (errorAmount === 4) {
					throw 'Prompt has been blocked'
				} else {
					throw 'Unknown error'
				}
			}

			const eventId = response.headers.get('x-eventid')
			console.log('now moving to getting the images:')
			this.#retrieveImages(eventId)
		} catch (error) {
			console.log(`the error in bingapi is ${error}`)
      throw error // Send the error to main.js
		}
	}

	async getCredits() {
		const response = await fetch(`${bingUrl}/create`, {
			headers: this.#headers,
			method: 'GET',
			mode: 'cors',
		})
		const html = await response.text()
		const $ = cheerio.load(html)
		return $('#token_bal').text()
	}

	// Private helping functions
	#getRandomNum() {
		// Get random ip number
		return Math.floor(Math.random() * 254) + 1
	}

	async #sendRequest(isSlowMode, payload) {
		// Send request functionץ If slow mode is true, send with rt=3, otherwise send with rt=4
		try {
			const response = await fetch(
				`${bingUrl}/images/create?${payload}&rt=${isSlowMode ? '3' : '4'}`,
				{
					headers: this.#headers,
					method: 'POST',
					mode: 'cors',
					redirect: 'manual',
				}
			)

			return response
		} catch (error) {
			console.log('Error in sendRequest:', error)
		}
	}

	async #retrieveImages(eventId) {
		// Retrieve the images after they were created
		try {
			process.stdout.write('Waiting for results')
			while (true) {
				const images = await fetch(`${bingUrl}/images/create/async/results/1-${eventId}`, {
					headers: this.#headers,
					method: 'GET',
					mode: 'cors',
				})

				const html = await images.text()

				if (html.includes(`"errorMessage":"Pending"`)) {
					throw 'Error occured'
				}

				let results = []

				if (html === '') {
					process.stdout.write('.')

					// Wait for 4 seconds and try again
					await new Promise((resolve) => setTimeout(resolve, 4000))
					continue
				}

				const $ = cheerio.load(html)
				for (let i = 0; i < $('.mimg').length; i++) {
					const badLink = $('.mimg')[i].attribs.src
					const goodLink = badLink.slice(0, badLink.indexOf('?')) // Delete the parameters

					results.push(goodLink)
				}

				console.log(results)
				return results
			}
		} catch (error) {
			console.log(`Error in retrieveImages: ${error}`)
		}
	}
}

module.exports = BingApi

/*
  USAGE:
  const bingApi = new BingApi(myCookie)
  const images = await bingApi.createImage(prompt, isSlowMode)
  const credits = await bingApi.getCredits()
*/
