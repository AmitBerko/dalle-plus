import { createSlice } from '@reduxjs/toolkit'

export const accountsSlice = createSlice({
	name: 'accounts',
	initialState: { value: [] },
	reducers: {
		setAccounts: (state, action) => {
			state.value = action.payload
		},

		updateAccount: (state, action) => {
			const { accountIndex, newValues } = action.payload
			const updatedAccounts = state.value.map((account, index) => {
				return index === accountIndex ? { ...account, ...newValues } : account
			})
			state.value = updatedAccounts
		},

		addAccount: (state, action) => {
			const accountData = action.payload
			console.log(action.payload)
			const updatedAccounts = [accountData, ...state.value]
			state.value = updatedAccounts
		},

		removeAccount: (state, action) => {
      const cookie = action.payload
      console.log(`cookie is`, cookie)
      const updatedAccounts = state.value.filter((account) => account.cookie !== cookie )

      state.value = updatedAccounts
    },
	},
})

export const { setAccounts, updateAccount, addAccount, removeAccount } = accountsSlice.actions

export default accountsSlice.reducer
