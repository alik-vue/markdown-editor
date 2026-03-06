<script setup lang="ts">
import 'remixicon/fonts/remixicon.css';
import { ref } from 'vue';
import { MarkdownEditor } from '../index';

const value = ref(`# Hello World

This is a **markdown editor** demo.

Try editing this content:
- Bold, *italic*, ~~strikethrough~~
- Ordered and unordered lists
- [Links](https://example.com)
`);

const customTheme = ref(false);
</script>

<template>
    <div class="preview-root" :class="{ 'custom-theme': customTheme }">
        <header class="preview-header">
            <h1>Vue Markdown Editor</h1>
            <label class="preview-toggle">
                <input v-model="customTheme" type="checkbox" />
                Custom theme
            </label>
        </header>

        <main class="preview-main">
            <section class="preview-section">
                <h2>Default editor</h2>
                <MarkdownEditor v-model="value" placeholder="Start writing..." />
            </section>

            <section class="preview-section">
                <h2>Custom toolbar</h2>
                <MarkdownEditor
                    v-model="value"
                    :toolbar="['bold', 'italic', 'bulletList', 'undo', 'redo']"
                />
            </section>

            <section class="preview-section">
                <h2>Raw Markdown output</h2>
                <pre class="preview-output">{{ value }}</pre>
            </section>
        </main>
    </div>
</template>

<style>
*,
*::before,
*::after {
    box-sizing: border-box;
}

body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f9fafb;
    color: #111827;
}

.preview-root {
    max-width: 860px;
    margin: 0 auto;
    padding: 32px 24px;
}

.preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
}

.preview-header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.preview-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    cursor: pointer;
}

.preview-main {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.preview-section h2 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 10px;
}

.preview-output {
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 0.8125rem;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

/* -----------------------------------------------
   Custom theme override example (toggle via checkbox)
   ----------------------------------------------- */
.custom-theme {
    --vme-border-color: #f59e0b;
    --vme-focus-border-color: #d97706;
    --vme-focus-ring: rgba(245, 158, 11, 0.25);
    --vme-confirm-btn-bg: #d97706;
    --vme-confirm-btn-hover-bg: #b45309;
    --vme-link-color: #d97706;
    --vme-btn-active-bg: rgba(245, 158, 11, 0.2);
    --vme-content-min-height: 150px;
    --vme-border-radius: 12px;
}
</style>
