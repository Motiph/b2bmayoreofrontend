<template>
  <v-app dark>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
      color="#ffeb3b"
    >
    <v-btn depressed @click="$router.push('/')">Inicio</v-btn>
    <v-spacer></v-spacer>
    <v-btn class="ma-2" depressed @click="$router.push('/cart')" >
      <v-icon small left>fas fa-shopping-cart</v-icon>
      Carrito
    </v-btn>
    <v-btn  class="ma-2"  depressed @click="$router.push('/orders')">
      Ordenes
    </v-btn>
    <v-btn  class="ma-2"  depressed @click="logout">
      Salir
    </v-btn>
    </v-app-bar>
    <v-img style="padding-top: 64px; border-bottom: 1px solid #fff" max-height="200" :src="require('~/assets/images/background.png')">
      <template>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <h1 class="image-title">SHOP</h1>
        </v-row>
      </template>
    </v-img>

    <v-main>
      <nuxt  keep-alive :keep-alive-props="{ exclude: ['cart', 'orders'] }"/>
    </v-main>
    <!-- <v-footer
      class=""
      :absolute="!fixed"
      app
    >
      <v-img  class="mx-auto" max-width="800"  :src="require('~/assets/images/logo.png')"></v-img>
    </v-footer> -->
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  },
  methods: {
    openShoppingCart () {
      this.$store.dispatch('shoppingCartDialog', true)
    },
    async logout () {
      await this.$store.dispatch('logout')
    }
    
  }
}
</script>

<style>
#app {
  background: #f8f8f8;
}
.image-title {
  color: white;
  text-shadow: 4px 4px 4px #333 !important;
  font-size: 5.25rem !important;
}
</style>