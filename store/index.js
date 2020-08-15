import cookieparser from 'cookieparser'
import axios from 'axios'

export const state = () => ({
  cart: {
    dialog: false
  },
  user: null,
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
  SET_TOKEN: (state, payload) => {
    state.token = payload
  }
}

async function getUserBytoken(token) {
  try {
    const response = await axios.post('http://localhost:8000/get-token/', {
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
  setToken({ commit }, payload) {
    commit('SET_TOKEN', payload)
  },
  
  async nuxtServerInit({ commit }, { req }) {
      
    // Pide la configuracion del sitio al backend
    // const siteConfig = await getSiteConfig()
    // if (siteConfig) {
    //   commit('SET_SITE_CONFIG', siteConfig.data)
    // }

    if (process.server && process.static) return
    if (!req.headers.cookie) return
    const parsed = cookieparser.parse(req.headers.cookie)
    const accessTokenCookie = parsed.b2bmayoreotoken
    if (!accessTokenCookie) return

    const user = await getUserBytoken(accessTokenCookie)

    // this.$store.dispatch('setUser', response.data.user)
    // this.$store.dispatch('setToken', response.data.token)
    // Cookie.set('b2bmayoreotoken', response.data.token)

    if (user) {
      commit('SET_USER', user.data.user)
    }
    // console.log('cuenta')
    // console.log(account.data)
    // if (account) {
    //   commit('users/SET_USER', account.data.user)
    //   return
    // }
  }
}
