<script setup lang="ts">
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { onUnmounted, watch } from 'vue';
import LinkToolbarButton from './LinkToolbarButton.vue';
import ToolbarButton from './ToolbarButton.vue';

export type ToolbarAction = 'bold' | 'italic' | 'strike' | 'bulletList' | 'orderedList' | 'blockquote' | 'code' | 'codeBlock' | 'horizontalRule' | 'undo' | 'redo';

const props = defineProps<{
    modelValue?: string;
    toolbar?: ToolbarAction[];
    placeholder?: string;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const toolbar = props.toolbar ?? ['bold', 'italic', 'strike', 'bulletList', 'orderedList'];

const editor = new Editor({
    editorProps: {
        attributes: {
            class: 'vme-prosemirror',
            ...(props.placeholder ? { 'data-placeholder': props.placeholder } : {}),
        },
        handleClick: (_view, _pos, event) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'A' || target.closest('a')) {
                event.preventDefault();
                return true;
            }
            return false;
        },
    },
    extensions: [StarterKit, Markdown],
    content: props.modelValue ?? '',
    contentType: 'markdown',
    onUpdate({ editor }) {
        emit('update:modelValue', editor.getMarkdown());
    },
});

onUnmounted(() => editor.destroy());

watch(
    () => props.modelValue,
    (value) => {
        const currentContent = editor.getMarkdown();
        if (value !== currentContent) {
            editor.commands.setContent(value ?? '', { contentType: 'markdown', emitUpdate: false });
        }
    },
);
</script>

<template>
    <div v-if="editor" class="vme-editor">
        <menu class="vme-toolbar">
            <li v-for="action in toolbar" :key="action">
                <ToolbarButton :editor="editor" :action="action" />
            </li>
            <li>
                <LinkToolbarButton :editor="editor" />
            </li>
        </menu>
        <div class="vme-content">
            <EditorContent :editor></EditorContent>
        </div>
    </div>
</template>
