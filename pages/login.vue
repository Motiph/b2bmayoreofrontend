<template>
  <v-row>
    <v-col cols="12" class="">
      <v-card flat class="mx-auto" max-width="400">
        <v-card-title>
          <v-img :src="require('~/assets/images/logo.png')"></v-img>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <input class="login-input"  type="text" placeholder="Usuario" v-model="username"> <br>
              </v-col>
              <v-col cols="12">
                <input class="login-input"  type="password" placeholder="Contraseña" v-model="password">
              </v-col>
              <v-col cols="12">
                <v-btn
                  large
                  :loading="loading"
                  color="warning"
                  depressed
                  block
                  @click="login"
                >
                  Iniciar sesión
                </v-btn>
              </v-col>

            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-col>

  </v-row>
</template>

<script>
import Cookie from 'js-cookie'
import axios from 'axios'

export default {
  layout: 'login',
  data () {
    return {
      loading: false,
      username: '',
      password: ''
    }
  },

  mounted () {
    console.log(process.env.BASE_URL)
  },
  methods: {
    async login () {
      if (this.username !== '' && this.password !== '') {
        this.loading = true
        try {
          const response = await axios.post(`${process.env.BASE_URL}/login/`, {
            username: this.username,
            password: this.password
          })

          this.$store.dispatch('setUser', response.data.user)
          this.$store.dispatch('setToken', response.data.token)
          this.$store.dispatch('setUserName', response.data.username)
          Cookie.set('b2bmayoreotoken', response.data.token)
          console.log(response)
          this.$router.push('/')
        } catch (error) {
          console.log(error)
          console.log(error.response)
        }
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  box-shadow: 5px 5px 40px #e0e0e0 !important;
}
.login-input {
  width: 100%;
  height: 50px;
  background: #eaeaea;
  border-radius: 5px;
  padding: 10px;
}
</style>