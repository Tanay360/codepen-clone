<template>
    <div :id="editorLang + '-editor'" class="editor" style="width: 100%; height: 100vh;"></div>
</template>

<script>
import loader from "@monaco-editor/loader";

export default {
  name: "Editor",
  props: {
    editorLang: String,
    onChange: Function,
    initialValue: String
  },
  async mounted() {
    loader.init().then((monaco) => {
      const editorOptions = {
          theme: 'vs-dark',
          language: this.editorLang,
          value: this.initialValue,
          quickSuggestions: false,
       };

      const editor = monaco.editor.create(document.getElementById(this.editorLang + '-editor'),   editorOptions);
      editor.getModel().onDidChangeContent(() => {
        this.onChange(editor.getValue());
      })
      window.addEventListener('keydown', e => {
        if (e.ctrlKey) {
          try {
            document.querySelector('.suggest-widget')?.remove()
          } catch (e) {}
        }
      })
    });
  }
}
</script>
