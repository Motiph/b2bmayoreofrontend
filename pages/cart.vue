<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card flat class="mx-auto" max-width="1000">
          <v-card-title>
            Carrito
            <v-spacer></v-spacer>
            <v-btn :loading="loading" depressed="" @click="saveOrder()">
              <v-icon left small>fas fa-paper-plane</v-icon>
              Enviar orden
            </v-btn>
          </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="items"
                :items-per-page="5"
                class=""
                flat
              >
              <template v-slot:item="props">
                <tr style="padding-top: 10px" :class="{'row-color': props.item.alter}">
                  <td>
                    <span>{{ props.item.lineCode }}</span>
                  </td>
                  <td>
                    <span>{{ props.item.partNumber }}</span>
                  </td>  
                  <td>
                    <span>{{ props.item.description }}</span>
                  </td>  
                  <td>
                    <span>{{ props.item.price }}</span>
                  </td>
                  <td class="text-xs-left">
                    <div v-for="(item, index) in props.item.stock" :key="index" class="qty-select">
                      <v-container style="padding: 0px">
                        <v-row dense>
                          <v-col cols="12">

                              {{ item.name }}:
                              <div style="float: right;"  >
                                <span class="mx-2 font-weight-black">{{ item.qty }}</span>  
                                <select v-model="item.selectedQty" @change="addToCart(props.item)" name="cars" class="store-qty" id="cars" >
                                  <option value="0" >0</option>
                                  <option :value="qty"  v-for="(qty, index) in item.qty" :key="index">{{ qty }}</option>
                
                                </select>
                              </div>  
                            
                          </v-col>

                        </v-row>
                      </v-container>

                    </div>
                  </td>
                </tr>
              </template>
            
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      loading: false,
      headers: [
        {
          text: 'Linea',
          align: 'start',
          sortable: false,
          value: 'lineCode',
        },
        { text: 'Número de parte', sortable: false, value: 'partNumber' },
        { text: 'Descripción', sortable: false, value: 'description' },
        { text: 'Precio', sortable: false, value: 'price' },
        { text: 'Cantidad disponible', align: 'end', sortable: false, value: 'stock' },
      ],
      items: []
    }
  },

  computed: {
    getTotal () {

    }
  },

  created () {
    if (process.browser) {
      this.getCart()
    }
  },
  methods: {
    getCart () {
      let cart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))
      this.items = cart
    },

    addToCart (product) {
      if (process.browser) {

        let cart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))
        console.log(cart)
        let item = cart.find(obj => {
          return obj.partNumber === product.partNumber && obj.lineCode === product.lineCode
        })

        if (item === undefined) {
          cart.push(product)
        }

        localStorage.setItem('mayoreoShoppingCart', JSON.stringify(cart))
      }
    },

    async saveOrder() {
      console.log('guardando orden')
      this.loading = true
      let items = []

      // guarda todas las tiendas seleccionadas
      for (let i = 0; i < this.items.length; i++) {
        for (let o = 0; o < this.items[i].stock.length; o++) {
          if (this.items[i].stock[o].selectedQty > 0) {

            let store = items.find(obj => {
              return obj.pace_store_id == this.items[i].stock[o].branchId
            })

            if (store === undefined) {
              items.push({
                pace_store_id: this.items[i].stock[o].branchId, 
                items: []
              })
            }
          }
        }
      }

      // busca la tienda en items y le agrega los productos de esa tienda
      for (let i = 0; i < this.items.length; i++) {
        for (let o = 0; o < this.items[i].stock.length; o++) {
          if (this.items[i].stock[o].selectedQty > 0) {

            let store = items.find(obj => {
              return obj.pace_store_id == this.items[i].stock[o].branchId
            })

            if (store !== undefined) {
              store.items.push({
                lineCode: this.items[i].lineCode,
                partNumber: this.items[i].partNumber,
                price: this.items[i].price,
                subtotal: (parseFloat(this.items[i].price) * parseFloat(this.items[i].stock[o].selectedQty)).toFixed(2),
                description: this.items[i].description,
                qty: this.items[i].stock[o].selectedQty
              })
            }
          }
        }
      }

      for (let i = 0; i < items.length; i++) {

        let total = 0
        for (let o = 0; o < items[i].items.length; o++) {
          total += parseFloat(items[i].items[o].subtotal)
        }

        let data = {
          items: JSON.stringify(items[i].items),
          store: items[i].pace_store_id,
          user: this.$store.state.user.user,
          total: total.toFixed(2)
        }
        console.log(data)
        try {
          const response = await axios.post('http://localhost:8000/save-order/', data)
          console.log(response)
        } catch (error) {
          console.log(error)
          console.log(error.response)
        }
      }

      confirm('La orden fue enviada')
      this.loading = false

    }
  }
}
</script>

<style scoped>
.v-card {
  box-shadow: 5px 5px 40px #e0e0e0 !important;
}
.store-qty {
  border: 1px solid #aaaaaa;
  border-radius: 5px;
  /* max-width: 50px; */
  background: #fff;
  text-align: center;
  min-width: 50px;
}
</style>