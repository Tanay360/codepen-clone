<script>
    import { defineStore } from 'pinia'
    export const usePenStore = defineStore('codepens', {
      state: () => {
        return { pens: [] }
      },
      actions: {
        changePens(pens) {
          this.pens.splice(0,this.pens.length)
          Array.prototype.push.apply(this.pens, pens);
        },
      },
    })

    export const useSnackBarStore = defineStore('snackbar', {
      state: () => {
        return { snackbar: false, snackbarText: '' }
      },
      actions: {
        showSnackBar(text) {
          this.snackbarText = text;
          this.snackbar = true;
        },
        hideSnackBar() {
          this.snackbar = false;
          this.snackbarText = '';
        }
      }
    })

    export const useSearchStore = defineStore('search', {
      state: () => {
        return {
          search: false,
          searchValue: ''
        }
      },

      actions: {
        startSearch() {
          this.search = true;
        },
        changeSearch(text) {
          this.searchValue = text;
        },
        endSearch() {
          this.search = false;
          this.searchValue = '';
        }
      }
    })
  </script>

  <script setup>
    import { Pen } from '@/database/db';
    import * as Rx from 'rxjs' 
    import localforage from 'localforage';
    import 'localforage-observable'
    import router from '@/router';

    function makeid(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const getAllPens = async () => {
      const pens = [];
      const keys = await localforage.keys()
      for (let key of keys) {
        const value = await localforage.getItem(key)
        if (typeof value === "object") {
          if (value != null) {
            try {
              pens.push(value)
            } catch (e) {}
          }
        }
      }
      return pens.sort((a, b) => b.dateModified - a.dateModified);
    }

    const codePens = usePenStore();
    (async () => {
      await localforage.ready()
      codePens.changePens(await getAllPens())
      localforage.newObservable.factory = function (subscribeFn) {
          return Rx.Observable.create(subscribeFn);
      };
      localforage.configObservables({
        crossTabNotification: true,
        crossTabChangeDetection: true
      });
      localforage.newObservable({
        crossTabNotification: true
      }).subscribe({
        next: async function() {
          codePens.changePens(await getAllPens())
        }
      });
    })()

    const snackbarState = useSnackBarStore();
    const searchState = useSearchStore();

    const changeSearch = (text) => {
      searchState.changeSearch(text);
    }

    const searchPressed = (e) => {
      if (e.keyCode == 13 || e.key == 'Enter') {
        e.preventDefault();
        search();
      }
    }


    const endSearch = async () => {
      codePens.changePens(await getAllPens())
      searchState.endSearch();
    }

    const search = async () => {
      const pens = (await getAllPens()).filter((pen) => {
        return pen.name.toLowerCase().includes(searchState.searchValue.toLowerCase());
      })
      codePens.changePens(pens);
    }

    const openPen = (id) => {
      router.push(`pen?id=${id}`);
    }

    const isObjectPresent = (obj) => {
      return obj != null && typeof obj !== "undefined"
    }

    const createNewPen = async () => {
      let id = makeid(5);
      while (isObjectPresent(await localforage.getItem(id))) {
        id = makeid(5);
      
      }
      try {
        await localforage.setItem(id, {
          id: id,
          html: '<!-- Your code here -->',
          css: '/* Your code here */',
          js: '// Your code here',
          dateModified: new Date().getTime(),
          name: `Pen ${id}`
        })
        snackbarState.showSnackBar(`Created new pen with id ${id}`)
      } catch (e) {
        snackbarState.showSnackBar('Some error occurred: ' + e);
      }
    }
  </script>

  <template>
    <main>
        <div class="app_bar">
          <v-app-bar style="background-color:#333; background-image: linear-gradient(225deg, #1e1e1e, #333);" dark v-if="!searchState.search">
            <v-icon style="margin-right: 10px; font-size: 2rem;">mdi-xml</v-icon>
            <v-toolbar-title>Codepen Clone</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn fab @click="searchState.startSearch">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </v-app-bar>
          <v-toolbar elevation="4" dark v-if="searchState.search">
            <v-btn fab style="margin-right: 10px;" @click="endSearch" elevation="0">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-text-field label="Search" prepend-inner-icon="mdi-magnify" style="margin-top: 25px;" @change="changeSearch" @keyup="searchPressed"></v-text-field>

          </v-toolbar>
        </div>

        <div class="code_pens">
          <v-list dense dark>
            <v-card v-for="(item) in (codePens.pens)" :key="item.id" class="pa-0" elevation="3" >
              <v-btn elevation="5" class="w-full text-left elevate_hover" style="text-transform: none; font-size: 1.1rem; border-radius: 0;padding: 25px;" @click="() => openPen(item.id)">
                <v-icon class="mr-4">mdi-code-tags</v-icon>
                {{item.name}}
              </v-btn>
              <div class="mt-4"></div>
            </v-card>
          </v-list>        
        </div>

        <div class="new_pen">
          <v-btn
            @click="createNewPen"
            rounded
            color="primary"
            dark
          >
          <v-icon style="margin-right: 5px;">mdi-pencil</v-icon>
            Create New Pen
          </v-btn>

        </div>
        <v-snackbar
          v-model="snackbarState.snackbar"
          :timeout="2000"
        >
          {{ snackbarState.snackbarText }}

          <template v-slot:action="{ attrs }">
            <v-btn
              color="pink"
              text
              v-bind="attrs"
              @click="snackbarState.hideSnackBar"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>

    </main>
  </template>

  <style scoped>
    .new_pen {
      position: fixed;
      bottom: 3%;
      right: 1%;
    }

    .elevate_hover:hover {
      transform: scale(98%);
      border-radius: 10px !important;
    }

    .mt-4 {
      margin-top: 4px;
    }

    .mr-4 {
      margin-right: 4px;
    }

    .pa-0 {
      padding: 0;
    }
    .w-full {
      width: 100%;
    }

    .text-left {
      text-align: left;
      justify-content: flex-start;
    }
  </style>
