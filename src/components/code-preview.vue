<template>
    <iframe src="" frameborder="0" id="code-preview"></iframe>    
</template>

<script>
    export default {
        name: 'CodePreview',
        props: {
            initialize: Function
        },
        async mounted() {
            this.initialize()
        }
    }
</script>

<style>
    iframe {
        flex: 1;
        height: 100vh;
    }
</style>