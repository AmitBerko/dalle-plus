import { createSlice } from '@reduxjs/toolkit'

export const accountsSlice = createSlice({
	name: 'accounts',
	initialState: { value: [] },
	reducers: {
		setAccounts: (state, action) => {
			return {
				...state,
				value: action.payload,
			}
		},

		updateAccount: (state, action) => {
			const { accountIndex, newValues } = action.payload
			const updatedAccounts = state.value.map((account, index) => {
				return index === accountIndex ? { ...account, ...newValues } : account
			})
			return {
				...state,
				value: updatedAccounts,
			}
		},

		addAccount: (state, action) => {
			const accountData = action.payload
			const updatedAccounts = [...state.value, accountData]
			return {
				...state,
				value: updatedAccounts,
			}
		},

		removeAccount: (state, action) => {
			const cookie = action.payload
			const updatedAccounts = state.value.filter((account) => account.cookie !== cookie)
			return {
				...state,
				value: updatedAccounts,
			}
		},
	},
})

export const { setAccounts, updateAccount, addAccount, removeAccount, getAccounts } =
	accountsSlice.actions

export default accountsSlice.reducer
