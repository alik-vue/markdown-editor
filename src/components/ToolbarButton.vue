<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { computed } from 'vue';

const props = defineProps<{
    editor: Editor;
    action: string;
}>();

const actionConfig: Record<string, { command: string; icon: string; activeCheck: string }> = {
    bold: { command: 'toggleBold', icon: 'ri-bold', activeCheck: 'bold' },
    italic: { command: 'toggleItalic', icon: 'ri-italic', activeCheck: 'italic' },
    underline: { command: 'toggleUnderline', icon: 'ri-underline', activeCheck: 'underline' },
    strike: { command: 'toggleStrike', icon: 'ri-strikethrough', activeCheck: 'strike' },
    bulletList: { command: 'toggleBulletList', icon: 'ri-list-unordered', activeCheck: 'bulletList' },
    orderedList: { command: 'toggleOrderedList', icon: 'ri-list-ordered', activeCheck: 'orderedList' },
    blockquote: { command: 'toggleBlockquote', icon: 'ri-double-quotes-l', activeCheck: 'blockquote' },
    code: { command: 'toggleCode', icon: 'ri-code-line', activeCheck: 'code' },
    codeBlock: { command: 'toggleCodeBlock', icon: 'ri-code-box-line', activeCheck: 'codeBlock' },
    horizontalRule: { command: 'setHorizontalRule', icon: 'ri-separator', activeCheck: '' },
    undo: { command: 'undo', icon: 'ri-arrow-go-back-line', activeCheck: '' },
    redo: { command: 'redo', icon: 'ri-arrow-go-forward-line', activeCheck: '' },
};

const config = computed(() => actionConfig[props.action] || null);

const isActive = computed(() => {
    if (!config.value?.activeCheck) return false;
    return props.editor.isActive(config.value.activeCheck);
});

const canExecute = computed(() => {
    if (!config.value) return false;
    const command = config.value.command;
    // @ts-expect-error - Dynamic command access
    return props.editor.can().chain().focus()[command]?.().run() ?? false;
});

const executeAction = () => {
    if (!config.value) return;
    const command = config.value.command;
    // @ts-expect-error - Dynamic command access
    props.editor.chain().focus()[command]?.().run();
};
</script>

<template>
    <button
        v-if="config"
        type="button"
        class="vme-toolbar-btn"
        :disabled="!canExecute"
        :class="{ 'is-active': isActive }"
        @click="executeAction"
    >
        <i :class="config.icon"></i>
    </button>
</template>
