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
			const credits = await this.getCredits()
      if (!credits) {
        throw 'Invalid cookie'
      }
			console.log(`${credits} credits`)
			// If the account ran out of credits, use slowmode, otherwise let the parameter determine
			let response = await this.#sendRequest(credits > 0 ? isSlowMode : true, payload)
			console.log(`status is ${response.status}`)
			if (response.status === 200) {
				const responseHtml = await response.text()
				if (responseHtml.includes('gil_err_tc')) {
          throw 'Blocked prompt'
				}
				throw 'Either a problem with bing or your account is already generating'
			}

			// Error when using slow mode
			// if (response.status === 200 && isSlowMode) {
			// 	throw 'Account is already generating'
			// }

			// // Error when using fast mode
			// if (response.status === 200 && !isSlowMode) {
			// 	console.log('Blocked or you ran out of credits. trying with slow mode:')
			// 	response = await this.#sendRequest(true, payload)

			// 	// Just incase it still doesn't work
			// 	if (response.status === 200) {
			// 		throw 'Account is already generating'
			// 	}
			// }

			// console.log('response status is', response.status)
			const eventId = response.headers.get('x-eventid')
			console.log(`eventId is ${eventId}`)

			console.log('now moving to getting the images:')
			return await this.#retrieveImages(eventId)
		} catch (error) {
			console.log(`error is ${error}`)
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
