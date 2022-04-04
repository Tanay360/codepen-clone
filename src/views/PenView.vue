<script>
  import { defineStore } from 'pinia'
  export const usePenStore = defineStore('pen', {
    state: () => {
      return {
        pen: null
      }
    },
    actions: {
      changePen(pen) {
        this.pen = pen;
      }
    }
    
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

</script>

<script setup> 
  import MonacoEditor from '@/components/monaco-editor.vue'
  import CodePreview from '@/components/code-preview.vue';
  import { Pen } from '@/database/db'
  import localforage from 'localforage';
  import router from '@/router';
  const snackbarState = useSnackBarStore();
  const penState = usePenStore();
  function getParameterByName(name, url = window.location.href) {
      name = name.replace(/[\[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  const closePen = () => {
    router.push('/')
  }
  const penId = getParameterByName('id');
  (async () => {
    if (penId == null) {
      snackbarState.showSnackBar('Pen id is undefined!');
      setTimeout(() => {
        closePen()
      }, 2000);
      return;
    }
    try {
      const pen = await localforage.getItem(penId);
      if (typeof pen === "undefined") {
        throw 'Pen is undefined!';
      }
      penState.changePen(pen);
      // initIframe();
    } catch (e) {
        snackbarState.showSnackBar('Could not load pen!');
        setTimeout(() => {
          closePen()
        }, 2000);
        return;
    }
  })()

  function initIframe() {
    const iframeOutput = document.getElementById('code-preview');
    if (iframeOutput == null) {
      console.log('Exit')
      return;
    }
    iframeOutput.contentWindow.document.open();
    const htmlEl = document.createElement('html');
    const headEl = document.createElement('head');
    const styleEl = document.createElement('style');
    styleEl.innerHTML = penState.pen.css;
    const st2 = document.createElement('style');
    st2.innerHTML = '* {\n color: white;\n}';
    headEl.appendChild(st2)
    headEl.appendChild(styleEl);
    htmlEl.appendChild(headEl)
    const bodyEl = document.createElement('body')
    bodyEl.innerHTML = penState.pen.html
    const scriptEl = document.createElement('script');
    scriptEl.textContent = penState.pen.js
    bodyEl.appendChild(scriptEl)
    htmlEl.appendChild(bodyEl)
    iframeOutput.contentWindow.document.appendChild(htmlEl)
  }

  const iframeChange = () => {
    const iframeOutput = document.getElementById('code-preview');
    if (iframeOutput == null) {
      return;
    }
    const dom = iframeOutput.contentWindow.document;
    const styleEl = dom.querySelectorAll('style')[1]
    styleEl.innerHTML = penState.pen.css;
    const scriptEl = document.createElement('script')
    scriptEl.textContent = penState.pen.js
    const bodyEl = dom.querySelector('body')
    bodyEl.innerHTML = penState.pen.html
    bodyEl.appendChild(scriptEl)
  }
  
  const cssChanged = async (value) => {
    if (penState.pen == null) {
      return;
    }
    const newPen = {
      ...penState.pen,
      css: value
    }
    await localforage.setItem(penState.pen.id, {
      ...penState.pen,
      dateModified: new Date().getTime(),
      css: value
    })
    penState.changePen(newPen)
    iframeChange();
  }

  
  const htmlChanged = async (value) => {
    if (penState.pen == null) {
      return;
    }
    const newPen = {
      ...penState.pen,
      html: value
    }
    await localforage.setItem(penState.pen.id, {
      ...penState.pen,
      dateModified: new Date().getTime(),
      html: value
    })
    penState.changePen(newPen)
    iframeChange();
  }


  const jsChanged = async (value) => {
    if (penState.pen == null) {
      return;
    }
    const newPen = {
      ...penState.pen,
      js: value
    }
    await localforage.setItem(penState.pen.id, {
      ...penState.pen,
      dateModified: new Date().getTime(),
      js: value
    })
    penState.changePen(newPen)
    iframeChange();
  }

  const deletePen = async () => {
    await localforage.removeItem(penState.pen.id)
    snackbarState.showSnackBar(`Deleted ${penState.pen.name}`)
    setTimeout(() => {
      closePen();
    }, 100);
  }

  let tab = 'html'
  const getTabs = () => {
    return [
      {
        name: 'html',
        initialValue: penState.pen.html,
        onChange: htmlChanged
      },{
        name: 'css',
        initialValue: penState.pen.css,
        onChange: cssChanged
      },{
        name: 'javascript',
        initialValue: penState.pen.js,
        onChange: jsChanged
      }
    ]
  }
</script>

<template>
  <main>
    <div class="app-bar">
      <v-app-bar dark>
        <v-btn fab style="margin-right: 10px;" @click="closePen">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>Edit {{penState.pen?.name ?? 'Pen'}}</v-toolbar-title>
        <v-spacer></v-spacer>
         <v-btn 
            v-if='penState.pen != null' 
            fab 
            @click="deletePen"
          >
          <v-icon>mdi-delete</v-icon>
         </v-btn>
      </v-app-bar>
      <div class="code-editors-container" v-if="penState.pen != null">
        <div class="tabs-cont">
          <v-tabs
            v-model="tab"
            align-with-title
            dark
          >
            <v-tabs-slider color="yellow"></v-tabs-slider>

            <v-tab
              v-for="item in getTabs()"
              :key="item.name"
            >
              {{ item.name }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
              <v-tab-item
                v-for="item in getTabs()"
                :key="item.name"
              >
                <MonacoEditor :editorLang="item.name" :initialValue="item.initialValue" :onChange="item.onChange"/>
              </v-tab-item>
          </v-tabs-items>
        
        </div>
        <CodePreview :initialize='initIframe'/>
      </div>
      <v-progress-circular
          v-else-if="penState.pen == null"
          indeterminate
          color="primary"
      ></v-progress-circular>

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
  .tabs-cont {
    flex: 1;
    height: 100vh; 
  }
  .code-editors-container {
    display: flex;
  }
</style>