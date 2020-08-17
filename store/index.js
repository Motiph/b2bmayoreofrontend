import cookieparser from 'cookieparser'
import Cookie from 'js-cookie'

import axios from 'axios'

export const state = () => ({
  cart: {
    dialog: false
  },
  user: null,
  username: '',
  token: ''
})

export const mutations = {
  SHOPPING_CART_DIALOG: (state, payload) => {
    state.cart.dialog = payload
  },
  // SET_ACCOUNT: (state, payload) => {
  //   state.account = payload
  // }
  SET_USER: (state, payload) => {
    state.user = payload
  },
  SET_USER_NAME: (state, payload) => {
    state.username = payload
  },
  SET_TOKEN: (state, payload) => {
    state.token = payload
  }
}

async function getUserBytoken(token) {
  try {
    const response = await axios.post(`${process.env.BASE_URL}/get-token/`, {
      key: token
    })
    return response
  } catch (error) {
    throw error
  }
}


export const actions = {
  shoppingCartDialog ({ commit }, payload) {
    commit('SHOPPING_CART_DIALOG', payload)
  },
  setUser({ commit }, payload) {
    commit('SET_USER', payload)
  },
  setUserName({ commit }, payload) {
    commit('SET_USER_NAME', payload)
  },
  setToken({ commit }, payload) {
    commit('SET_TOKEN', payload)
  },

  async logout({ commit }) {
    Cookie.remove('b2bmayoreotoken')
    await commit('SET_USER', null)
    await commit('SET_TOKEN', '')
    this.$router.push('/login')
    // location.href = '/login'
  },

  async nuxtServerInit({ commit }, { req }) {
      
    if (process.server && process.static) return
    if (!req.headers.cookie) return
    const parsed = cookieparser.parse(req.headers.cookie)
    const accessTokenCookie = parsed.b2bmayoreotoken
    if (!accessTokenCookie) return

    const user = await getUserBytoken(accessTokenCookie)
    console.log(user)
    if (user) {
      commit('SET_USER_NAME', user.data.username)
      commit('SET_USER', user.data.user)
    }

  }
}
