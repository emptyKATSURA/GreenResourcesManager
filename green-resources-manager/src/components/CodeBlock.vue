<template>
  <pre class="code-block" :class="`language-${language}`"><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Prism from 'prismjs'
import 'prism-themes/themes/prism-vsc-dark-plus.css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-json'

const props = withDefaults(defineProps<{
  code: string
  language?: string
}>(), {
  language: 'javascript'
})

const highlightedCode = computed(() => {
  const grammar = Prism.languages[props.language]
  if (grammar) {
    return Prism.highlight(props.code, grammar, props.language)
  }
  // 如果没有对应语言的语法，返回转义后的代码
  return props.code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
})
</script>

<style scoped>
.code-block {
  border: 1px solid var(--border-color, #333);
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
}

.code-block code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}
</style>
