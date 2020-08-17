<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div v-for="(order, index) in orders" :key="index">
          <v-card flat class="mx-auto" max-width="1000">
            <v-card-title>
              # {{ order.id }} -
              Tienda: {{ order.store }}
              <v-spacer></v-spacer>
              Total: {{ order.total }}
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="order.items"
                :items-per-page="5"
                class=""
                flat
              >
              </v-data-table>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  name: 'orders',
  data () {
    return {
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
        { text: 'Cantidad', sortable: false, value: 'qty' },
        { text: 'Subtotal', sortable: false, value: 'subtotal' }
      ],
      orders: []
    }
  },
  mounted () {
    if (process.env) {
      this.getOrders()
    }
  },
  methods: {
    async getOrders () {
      try {
        const response = await axios.get(`${process.env.BASE_URL}/get-orders/${this.$store.state.user.user}`)
        console.log(response)

        for (let i = 0; i < response.data.length; i++) {
          this.orders.push({
            id: response.data[i].id,
            items: JSON.parse(response.data[i].items),
            total: response.data[i].total,
            store: response.data[i].store
          })
        }
        // this.orders = response.data
      } catch (error) {
        console.log(error)
        console.log(error.response)
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  box-shadow: 5px 5px 40px #e0e0e0 !important;
}
</style>