<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="">
        <v-card flat class="mx-auto" max-width="1000">
          <v-card-title>Buscador de partes</v-card-title>
          <v-card-text>
            <v-form>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    md="4"
                  >
                    <input v-model="line" class="search-input pa-2" type="text" placeholder="Linea (opcional)">
                  </v-col>

                  <v-col
                    cols="12"
                    md="4"
                  >
                    <input v-model="partNumber" class="search-input pa-2" type="text" placeholder="Número de parte (requerida)">
                  </v-col>

                  <v-col
                    cols="12"
                    md="4"
                  >
                  <v-btn @click="searchProduct" :loading="loading" color="#5cb85c" dark block depressed>
                    <v-icon left small>fas fa-search</v-icon>
                    Buscar
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
            No busqueda parcial
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
    <v-row>
      <v-col cols="12" class="">
        <v-card class="mx-auto" max-width="1000">
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
                              <select v-model="item.selectedQty" name="" class="store-qty" id="" >
                                <option value="0" >0</option>
                                <option :value="qty"  v-for="(qty, index) in item.qty" :key="index">{{ qty }}</option>
                              </select>
                              <v-btn @click="addToCart(props.item, item)" small depressed>Agregar</v-btn>
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

    <v-dialog v-model="$store.state.cart.dialog" max-width="700">
      <v-card >
        <v-card-title>Shopping cart</v-card-title>
        <v-card-text>
            <v-data-table
              :headers="headers"
              :items="cart"
              :items-per-page="5"
              class=""
              flat
            >
            </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      top
      timeout="1000"
      color="success"
    >
      {{ snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios'
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

export default {
  middleware: 'home',
  components: {
    Logo,
    VuetifyLogo
  },
  data () {
    return {
      snackbar: {
        show: false,
        text: 'El producto fue agregado al carrito'
      },
      url: 'http://189.223.128.30:8081/',
      partNumber: '',
      line: '',
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
      items: [
      ],
      altarnateSetted: [],
      cart: [],
      shoppingCart: [],
      stores: []
    }
  },

  created () {
    if (process.browser) {
      this.setStores()
      this.shoppingCart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))
      console.log(this.shoppingCart)
      if (this.shoppingCart === null) {
        console.log('creando cart')
        this.shoppingCart = (localStorage.setItem('mayoreoShoppingCart', JSON.stringify([])))
        console.log(typeof(this.shoppingCart))
      }
    }
  },

  methods: {

    getStore (pace_store_id) {
      return this.stores.find(store => {
        return store.pace_store_id === pace_store_id
      })
    },

    setStores () {
      console.log('seteando stores')
      let stores = []
      stores.push(this.$store.state.user.main_store)
      for (let group = 0; group < this.$store.state.user.groups.length; group++) {
        console.log('1')
        for (let store = 0; store < this.$store.state.user.groups[group].stores.length; store++) {
          console.log('2')
          let obj = stores.find(object => {
            return object.id === this.$store.state.user.groups[group].stores[store].id
          })
          if (obj === undefined) {
            stores.push(this.$store.state.user.groups[group].stores[store])
          }
        }
      }

      this.stores = stores
    },

    addToCart (product, stock) {
      if (process.browser) {
        if (parseInt(stock.selectedQty) > 0) {
          let shoppingCart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))

          let item = shoppingCart.find(obj => {
            return obj.partNumber === product.partNumber && obj.lineCode === product.lineCode && obj.branchId === stock.branchId
          })

          // Agregamos la tienda al producto en el carrito para identificarlo
          let newShoppingCartProduct = {
            branchId: stock.branchId,
            description: product.description,
            lineCode: product.lineCode,
            partNumber: product.partNumber,
            price: product.price,
            stock: stock
          }

          if (item === undefined) {
            shoppingCart.push(newShoppingCartProduct)
          } else {
            // si el producto ya esta en el carrito sacamos su index y lo sustituimos
            let idx = shoppingCart.indexOf(item)
            shoppingCart[idx] = newShoppingCartProduct
          }

          console.log(shoppingCart)
          
          localStorage.setItem('mayoreoShoppingCart', JSON.stringify(shoppingCart))
          this.snackbar.show = true

        } else {
          confirm('Seleccione una cantidad antes de agregar al carrito')
        }
      }
      // if (process.browser) {
        

      //   let cart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))
      //   console.log(cart)
      //   let item = cart.find(obj => {
      //     return obj.partNumber === product.partNumber && obj.lineCode === product.lineCode
      //   })

      //   if (item === undefined) {
      //     cart.push(product)
      //   }


      //   localStorage.setItem('mayoreoShoppingCart', JSON.stringify(cart))
      // }
    },
    // addToCart (product) {
    //   console.log('agreando al carrito')
    //   if (process.browser) {

    //     let cart = JSON.parse(localStorage.getItem('mayoreoShoppingCart'))
    //     console.log(cart)
    //     let item = cart.find(obj => {
    //       return obj.partNumber === product.partNumber && obj.lineCode === product.lineCode
    //     })

    //     if (item === undefined) {
    //       cart.push(product)
    //     }


    //     localStorage.setItem('mayoreoShoppingCart', JSON.stringify(cart))
    //   }
    // },

    setItems (items) {
      console.log('items finales')
      console.log(items)
      let articlesCopy = []
      Object.assign(articlesCopy, items)

      let articles = []
      for (let i = 0; i < articlesCopy.length; i++) {
        if (articlesCopy[i].hasStock) {
          console.log('push en inicio ', articlesCopy[i].partNumber)
          console.log(articles)
          articles.unshift(articlesCopy[i])
          for (let alt = 0; alt < articlesCopy[i].alternates.length; alt++) {
            articles.push(articlesCopy[i].alternates[alt])
          }
        } else {
          console.log('push en final ', articlesCopy[i].partNumber)
          console.log(articles)
          articles.push(articlesCopy[i])
          for (let alt = 0; alt < articlesCopy[i].alternates.length; alt++) {
            articles.push(articlesCopy[i].alternates[alt])
          }
        }

      }
      this.items = articles
      // this.table.items = items
    },
    async searchProduct () {
      this.altarnateSetted.splice(0, this.altarnateSetted.length)
      console.log('buscando')
      console.log(this.line)
      console.log(this.partNumber)
      this.loading = true
      this.items.splice(0, this.items.length)
      let parser = ''
      let items = []
      if (this.partNumber !== '') {
        console.log('entro')
        const response = await this.searchPacesetter(this.line, this.partNumber)
        parser = await this.xmlParser(response.data)
        if (parser.StockCheckReply[0].Part[0].ChoosePart) {
          if (parser.StockCheckReply[0].Part[0].ChoosePart.length > 0) {
            let chooseParts = parser.StockCheckReply[0].Part[0].ChoosePart
            for (let i = 0; i < chooseParts.length; i++) {
              const response2 = await this.searchPacesetter(chooseParts[i].$.LineCode, chooseParts[i].$.PartNum)
              let parser2 = await this.xmlParser(response2.data)
              console.log('costo')
              console.log(parser2.StockCheckReply[0].Part[0].$.Cost)
              console.log('cantidad')
              console.log(parser2.StockCheckReply[0].Part[0].$.QtyAvail)
              let item = {
                alter: false,
                lineCode: parser2.StockCheckReply[0].Part[0].$.LineCode,
                partNumber: parser2.StockCheckReply[0].Part[0].$.PartNum,
                price: parser2.StockCheckReply[0].Part[0].$.Cost,
                description: parser2.StockCheckReply[0].Part[0].$.Desc,
                alternates: [],
                stock: []
              }

              if (parser2.StockCheckReply[0].Part[0].$.QtyAvail > 0) {
                let branchIdPaceSetter = parser2.StockCheckReply[0].Header[0].$.Branch === 1 ? '0' + parser2.StockCheckReply[0].Header[0].$.Branch : parser2.StockCheckReply[0].Header[0].$.Branch
                let qtyInMainStore = {
                  branchId: branchIdPaceSetter,
                  name: 
                    this.getStore(branchIdPaceSetter) === undefined ? 
                    branchIdPaceSetter : 
                    this.getStore(branchIdPaceSetter).name,
                  qty: parseInt(parser2.StockCheckReply[0].Part[0].$.QtyAvail),
                  nameWithQty:
                    parser2.StockCheckReply[0].Part[0].$.QtyAvail +
                    ' - ' +
                    branchIdPaceSetter,
                  selectedQty: 0
                }
                item.stock.push(qtyInMainStore)
              }

              if (parser2.StockCheckReply[0].Part[0].AltLoc) {
                for (let alt in parser2.StockCheckReply[0].Part[0].AltLoc) {
                  
                  let branchIdPaceSetter = parser2.StockCheckReply[0].Part[0].AltLoc[alt].$.Branch.length === 1 ? '0' + parser2.StockCheckReply[0].Part[0].AltLoc[alt].$.Branch : parser2.StockCheckReply[0].Part[0].AltLoc[alt].$.Branch


                  item.hasStock = true
                  item.stock.push({
                    branchId: branchIdPaceSetter,
                    name: this.getStore(branchIdPaceSetter) === undefined ?
                      branchIdPaceSetter :
                      this.getStore(branchIdPaceSetter).name,
                    qty: parseInt(parser2.StockCheckReply[0].Part[0].AltLoc[alt].$.Qty),
                    nameWithQty: parser2.StockCheckReply[0].Part[0].AltLoc[alt].$.Qty + ' - ' + 'Tienda ' + branchIdPaceSetter,
                    selectedQty: 0
                  })
                }
              }

              if (parser2.StockCheckReply[0].Part[0].Alternate) {
                if (parser2.StockCheckReply[0].Part[0].Alternate.length > 0) {
                  await this.setAlternates(parser2.StockCheckReply[0].Part[0].Alternate, parser2.StockCheckReply[0].Header[0].$.Branch, item)
                }
              }

              items.push(item)

            }
          }
        }

        this.setItems(items)

      }
      this.loading = false
    },

    async setAlternates (alternates, branch, article) {

      for (let i = 0; i < alternates.length; i++) {
        let alreadySetted = this.altarnateSetted.find(obj => {
          return obj.partNumber === alternates[i].$.PartNum && obj.lineCode === alternates[i].$.LineCode
        })

        if (alreadySetted === undefined) {
          let item = {
            alter: true,
            lineCode: alternates[i].$.LineCode,
            partNumber: alternates[i].$.PartNum,
            price: alternates[i].$.Cost,
            description: alternates[i].$.Desc,
            stock: [],
            alterOf: article.partNumber
          }
          if (parseInt(alternates[i].$.QtyAvail) > 0) {
            let branchIdPaceSetter = branch === 1 ? '0' + branch : branch

            let tmpObj = {
              branchId: branchIdPaceSetter,
              name: this.getStore(branchIdPaceSetter) === undefined ? branch : this.getStore(branchIdPaceSetter).name,
              qty: parseInt(alternates[i].$.QtyAvail),
              nameWithQty: alternates[i].$.QtyAvail + ' - ' + branchIdPaceSetter,
              selectedQty: 0
            }
            item.hasStock = true
            item.stock.push(tmpObj)
          }

          if (alternates[i].AltLoc) {
            for (let alt in alternates[i].AltLoc) {
              let branchIdPaceSetter = alternates[i].AltLoc[alt].$.Branch.length === 1 ? '0' + alternates[i].AltLoc[alt].$.Branch : alternates[i].AltLoc[alt].$.Branch

              article.hasStock = true
              item.hasStock = true
              item.stock.push({
                branchId: branchIdPaceSetter,
                name: this.getStore(branchIdPaceSetter) === undefined ? 
                  branchIdPaceSetter : 
                  this.getStore(branchIdPaceSetter).name,
                qty: parseInt(alternates[i].AltLoc[alt].$.Qty),
                nameWithQty: alternates[i].AltLoc[alt].$.Qty + ' - ' + 'Tienda ' + branchIdPaceSetter,
                selectedQty: 0
              })
            }
          }

          if (item.hasStock) {
            this.altarnateSetted.push({
              partNumber: alternates[i].$.PartNum,
              lineCode: alternates[i].$.LineCode
            })
            article.alternates.push(item)
          }
        }

      }
    },
    async searchPacesetter (line, partNumber) {

      let stores = []
      stores.push(this.$store.state.user.main_store.pace_store_id)

      for (let group = 0; group < this.$store.state.user.groups.length; group++) {
        for (let store = 0; store < this.$store.state.user.groups[group].stores.length; store++) {
          if (!stores.includes(this.$store.state.user.groups[group].stores[store].pace_store_id)) {
            stores.push(this.$store.state.user.groups[group].stores[store].pace_store_id)
          }
        }
      }

      console.log('stores')
      console.log(stores)
      try {
        let xml =
          '<?xml version="1.0" encoding="UTF-8" ?>' +
          '<OptiCat>' +
          '<StockCheck>' +
          '<Header Src="b2b" Branch="' +
          stores.join('') +
          '" AcctNum="' +
          this.$store.state.username +
          '">' +
          '</Header>' +
          '<Part Desc=' +
          '"' +
          '' +
          '" ' +
          'LineCode=' +
          '"' +
          line +
          '" ' +
          'SeqNum="1"' +
          ' LineNum="1" PartNum=' +
          '"' +
          partNumber +
          '"' +
          ' QtyReq="1"/>' +
          '</StockCheck>' +
          '</OptiCat>'
        console.log(xml)
        const response = await axios.post(`${process.env.BASE_URL}/search-pacesetter/`, {
          xml: xml
        })
        console.log('Response de xml')
        console.log(response)
        return response
      } catch (error) {
        console.log(error)
        console.log(error.response)
      }
    },
    // async searchPacesetter (line, partNumber) {

    //   let stores = []
    //   stores.push(this.$store.state.user.main_store.pace_store_id)

    //   for (let group = 0; group < this.$store.state.user.groups.length; group++) {
    //     for (let store = 0; store < this.$store.state.user.groups[group].stores.length; store++) {
    //       if (!stores.includes(this.$store.state.user.groups[group].stores[store].pace_store_id)) {
    //         stores.push(this.$store.state.user.groups[group].stores[store].pace_store_id)
    //       }
    //     }
    //   }

    //   console.log('stores')
    //   console.log(stores)
    //   try {
    //     let xml =
    //       '<?xml version="1.0" encoding="UTF-8" ?>' +
    //       '<OptiCat>' +
    //       '<StockCheck>' +
    //       '<Header Src="b2b" Branch="' +
    //       stores.join('') +
    //       '" AcctNum="' +
    //       this.$store.state.username +
    //       '">' +
    //       '</Header>' +
    //       '<Part Desc=' +
    //       '"' +
    //       '' +
    //       '" ' +
    //       'LineCode=' +
    //       '"' +
    //       line +
    //       '" ' +
    //       'SeqNum="1"' +
    //       ' LineNum="1" PartNum=' +
    //       '"' +
    //       partNumber +
    //       '"' +
    //       ' QtyReq="1"/>' +
    //       '</StockCheck>' +
    //       '</OptiCat>'
    //     console.log(xml)
    //     const response = await axios.post(this.url, xml, { headers: { 'Content-Type': 'text/xml' } })
    //     console.log('Response de xml')
    //     console.log(response.data)
    //     return response
    //   } catch (error) {
    //     console.log(error)
    //     console.log(error.response)
    //   }
    // },

    async xmlParser (stringXml) {
      var response = ''
      var parseString = require('xml2js').parseString
      await parseString(stringXml, function (err, result) {
        if (err) {
          console.log('Error', err)
        }
        response = result.OptiCat
        console.log('RESULT')
        console.log(response)
      })
      return response
    }
  }
}
</script>

<style scoped>
.v-card {
  box-shadow: 5px 5px 40px #e0e0e0 !important;
}
.search-input {
  border: 1px solid #e0e0e0;
  width: 100%;
  height: 100%;
  border-radius: 5px;
}
.row-color {
  background-color: #d4e0fa;
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