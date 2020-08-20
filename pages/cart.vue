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
                :items-per-page="-1"
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
                    <span style="color: green;" class="font-weight-black">${{ props.item.price }}</span>
                  </td>
                  <td class="text-xs-left">
                  
                    <v-container style="padding: 0px">
                      <v-row dense>
                        <v-col cols="12">

                            {{ props.item.stock.name }}:
                            <div style="float: right;"  >
                              <span class="mx-2 font-weight-black">{{ props.item.stock.qty }}</span>  
                              <select v-model="props.item.stock.selectedQty" @change="updateQty(props.item)"  name="cars" class="store-qty" id="cars" >
                                <option :value="qty"  v-for="(qty, index) in props.item.stock.qty" :key="index">{{ qty }}</option>
                              </select>
                              <v-btn @click="deleteFromCart(props.item)" dark color="red" small depressed>Borrar</v-btn>
                            </div>  
                          
                        </v-col>

                      </v-row>
                    </v-container>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <h2>Total $ {{ getTotal }}</h2>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  name: 'cart',
  data () {
    return {
      url: 'http://189.223.128.30:8081/',
      loading: false,
      headers: [
        {
          text: 'Linea',
          align: 'start',
          sortable: false,
          value: 'lineCode',
        },
        { text: 'Número de parte', sortable: true, value: 'partNumber' },
        { text: 'Descripción', sortable: false, value: 'description' },
        { text: 'Precio', sortable: false, value: 'price' },
        { text: 'Cantidad disponible', align: 'end', sortable: false, value: 'stock' },
      ],
      items: []
    }
  },

  computed: {
    getTotal () {
      if (process.browser) {
        let total = 0
        for (let i = 0; i < this.items.length; i++) {
          total += parseFloat(this.items[i].price) * parseInt(this.items[i].stock.selectedQty) 
        }
        return parseFloat(total).toFixed(2)
      }
    }
  },

  created () {
    if (process.browser) {
      this.getCart()
    }
  },
  methods: {
    getCart () {
      let shoppingCart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))
      this.items = shoppingCart
    },

    updateQty (product) {
      console.log('actualizando')
      let shoppingCart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))

      let item = shoppingCart.find(obj => {
        return obj.partNumber === product.partNumber && obj.lineCode === product.lineCode && obj.branchId === product.branchId
      })

      let idx = shoppingCart.indexOf(item)
      shoppingCart[idx] = product
      
      localStorage.setItem('mayoreoShoppingCart', JSON.stringify(shoppingCart))
    },

    deleteFromCart (product) {
      let shoppingCart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))
      let idx = shoppingCart.indexOf(product)
      shoppingCart.splice(idx, 1)

      idx = this.items.indexOf(product)
      this.items.splice(idx, 1)

      localStorage.setItem('mayoreoShoppingCart', JSON.stringify(shoppingCart))
    },

    async sendOrderToPacesetter(order) {
      try {
        let xml = '<OptiCat TransId="' + order.id + '"><Order>' +
        '<header account="' + this.$store.state.username + '" branch="' + order.store + '"' +
        ' type="Normal" fillflag="backord" ponumber="1001"></header>'

        let items = JSON.parse(order.items)

        for (let i = 0; i < items.length; i++) {
          xml += '<part linecode="' + items[i].lineCode + '" partno="' + items[i].partNumber + '" qtyreq="' + items[i].qty + '"/>'
        }
        xml += '</Order></OptiCat>'
        console.log(xml)
        const response = await axios.post(this.url, xml)
        console.log(response)
  
      } catch (error) {
        console.log(error)
        console.log(error.response)
      }
    },


    async saveOrder() {
      console.log('guardando orden')
      this.loading = true
      let items = []

      // guarda todas las tiendas seleccionadas
      if (this.items.length > 0) {
        for (let i = 0; i < this.items.length; i++) {
          let store = items.find(obj => {
            return obj.pace_store_id === this.items[i].branchId
          })
          if (store === undefined) {
            items.push({
              pace_store_id: this.items[i].branchId, 
              items: []
            })
          }
        }
      
        // busca la tienda en items y le agrega los productos de esa tienda
        for (let i = 0; i < this.items.length; i++) {
          let store = items.find(obj => {
            return obj.pace_store_id === this.items[i].branchId
          })
          if (store !== undefined) {
            store.items.push({
              lineCode: this.items[i].lineCode,
              partNumber: this.items[i].partNumber,
              price: this.items[i].price,
              subtotal: (parseFloat(this.items[i].price) * parseFloat(this.items[i].stock.selectedQty)).toFixed(2),
              description: this.items[i].description,
              qty: this.items[i].stock.selectedQty
            })
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
            const response = await axios.post(`${process.env.BASE_URL}/save-order/`, data)
            console.log(response)
            await this.sendOrderToPacesetter(response.data)
          } catch (error) {
            console.log(error)
            console.log(error.response)
          }
        }

        this.items.splice(0, this.items.length)
        localStorage.setItem('mayoreoShoppingCart', JSON.stringify([]))
        this.loading = false
        confirm('La orden fue enviada')
      }
      console.log(items)
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