<script setup lang="ts">
import type { AnyExtension } from '@tiptap/core';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { computed, onUnmounted, ref, watch } from 'vue';
import { defaultLabels, type EditorLabels } from '../labels';
import HeadingToolbarButton from './HeadingToolbarButton.vue';
import LinkToolbarButton from './LinkToolbarButton.vue';
import ToolbarButton from './ToolbarButton.vue';

export type ToolbarAction =
    | 'bold'
    | 'italic'
    | 'strike'
    | 'bulletList'
    | 'orderedList'
    | 'blockquote'
    | 'code'
    | 'codeBlock'
    | 'horizontalRule'
    | 'undo'
    | 'redo'
    /** The paragraph style menu: plain text or a heading of `headingLevels`. */
    | 'heading'
    /** The link button. Appended after the rest when the toolbar leaves it out. */
    | 'link'
    /** A thin rule between groups of buttons. */
    | '|';

const props = withDefaults(
    defineProps<{
        modelValue?: string;
        toolbar?: ToolbarAction[];
        placeholder?: string;
        /**
         * Extra Tiptap extensions appended after the built-in set (StarterKit, Markdown).
         * Build them with the constructors exported by this package so they share its
         * bundled Tiptap/ProseMirror copy. Read once when the editor is created.
         */
        extensions?: AnyExtension[];
        /** The heading levels the paragraph style menu offers. */
        headingLevels?: number[];
        /** Offer a button that spreads the editor over the whole window. */
        fullscreenable?: boolean;
        /** Any of the texts the editor draws, translated. */
        labels?: Partial<EditorLabels>;
    }>(),
    {
        modelValue: '',
        toolbar: undefined,
        placeholder: undefined,
        extensions: undefined,
        headingLevels: () => [1, 2, 3],
        fullscreenable: false,
        labels: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

/** Whether the editor covers the window. Escape brings it back. */
const fullscreen = defineModel<boolean>('fullscreen', { default: false });

defineSlots<{
    /**
     * Extra toolbar items after the toolbar's own. Rendered inside the toolbar's
     * `<menu>`, so supply `<li>` elements; the editor is passed in for commands.
     */
    toolbar?: (props: { editor: Editor }) => unknown;
}>();

const labels = computed((): EditorLabels => ({ ...defaultLabels, ...props.labels }));

const toolbar = computed((): ToolbarAction[] => {
    const actions = props.toolbar ?? ['bold', 'italic', 'strike', 'bulletList', 'orderedList'];

    return actions.includes('link') ? actions : [...actions, 'link'];
});

/**
 * Tiptap keeps an empty paragraph after a document's last block when that
 * block is not a paragraph, and the Markdown serializer writes it out as
 * `&nbsp;` — a line the document gains every time it is opened and edited.
 * Only that artefact goes; a paragraph with text in it is never touched.
 */
function withoutTrailingParagraph(markdown: string): string {
    return markdown.replace(/\n\n&nbsp;$/u, '');
}

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
    extensions: [StarterKit, Markdown, ...(props.extensions ?? [])],
    content: props.modelValue ?? '',
    contentType: 'markdown',
    onUpdate({ editor }) {
        emit('update:modelValue', withoutTrailingParagraph(editor.getMarkdown()));
    },
});

watch(
    () => props.modelValue,
    (value) => {
        const currentContent = withoutTrailingParagraph(editor.getMarkdown());
        if (value !== currentContent) {
            editor.commands.setContent(value ?? '', { contentType: 'markdown', emitUpdate: false });
        }
    },
);

/*
 * ---------------------------------------------------------------------
 * Fullscreen. The editor stays where it is in the page — fixed, not
 * teleported — so a dialog it lives in keeps counting it as its own. An
 * ancestor with a transform, filter, backdrop-filter, contain or
 * will-change would become the box a fixed element is placed in, so those
 * are lifted off the ancestors for as long as the editor covers them.
 * ---------------------------------------------------------------------
 */

const root = ref<HTMLElement | null>(null);
const heading = ref<InstanceType<typeof HeadingToolbarButton>[] | null>(null);

const CONTAINING_BLOCK_STYLES: Record<string, string> = {
    transform: 'none',
    translate: 'none',
    scale: 'none',
    rotate: 'none',
    perspective: 'none',
    filter: 'none',
    'backdrop-filter': 'none',
    contain: 'none',
    'will-change': 'auto',
};

let lifted: { element: HTMLElement; property: string; value: string; priority: string }[] = [];

function liftContainingBlocks(): void {
    for (
        let element = root.value?.parentElement ?? null;
        element !== null && element !== document.body;
        element = element.parentElement
    ) {
        const computedStyle = getComputedStyle(element);

        for (const [property, neutral] of Object.entries(CONTAINING_BLOCK_STYLES)) {
            const current = computedStyle.getPropertyValue(property);

            if (current === '' || current === neutral) {
                continue;
            }

            lifted.push({
                element,
                property,
                value: element.style.getPropertyValue(property),
                priority: element.style.getPropertyPriority(property),
            });
            element.style.setProperty(property, neutral, 'important');
        }
    }
}

function restoreContainingBlocks(): void {
    for (const { element, property, value, priority } of lifted) {
        if (value === '') {
            element.style.removeProperty(property);
        } else {
            element.style.setProperty(property, value, priority);
        }
    }

    lifted = [];
}

/** An open menu closes first; only then does Escape leave fullscreen. */
function closeMenus(): boolean {
    return (heading.value ?? []).some((menu) => menu.close());
}

/**
 * Escape inside the editor, in the capture phase: anything wrapping the
 * editor sees the key first and may keep it (an autocomplete of its own);
 * whatever it lets through closes a menu or leaves fullscreen, and goes no
 * further — a dialog around the editor would close on the same key.
 */
function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
        return;
    }

    if (closeMenus()) {
        event.preventDefault();
        event.stopPropagation();

        return;
    }

    if (fullscreen.value) {
        fullscreen.value = false;
        event.preventDefault();
        event.stopPropagation();
    }
}

/**
 * Escape from outside the editor — the fullscreen button does not take
 * the focus — still leaves fullscreen, ahead of every other listener. A
 * key pressed inside the editor is left to `onKeydown`.
 */
function onWindowKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || root.value?.contains(event.target as Node)) {
        return;
    }

    closeMenus();
    fullscreen.value = false;
    event.preventDefault();
    event.stopPropagation();
}

watch(fullscreen, (on) => {
    if (on) {
        liftContainingBlocks();
        window.addEventListener('keydown', onWindowKeydown, true);
    } else {
        restoreContainingBlocks();
        window.removeEventListener('keydown', onWindowKeydown, true);
    }
});

onUnmounted(() => {
    restoreContainingBlocks();
    window.removeEventListener('keydown', onWindowKeydown, true);
    editor.destroy();
});

defineExpose({ editor });
</script>

<template>
    <div
        v-if="editor"
        ref="root"
        class="vme-editor"
        :class="{ 'is-fullscreen': fullscreen }"
        @keydown.capture="onKeydown"
    >
        <menu class="vme-toolbar">
            <template v-for="(action, index) in toolbar" :key="`${action}-${index}`">
                <li v-if="action === '|'" class="vme-toolbar-separator" aria-hidden="true"></li>
                <li v-else-if="action === 'link'">
                    <LinkToolbarButton :editor="editor" :labels="labels" />
                </li>
                <li v-else-if="action === 'heading'">
                    <HeadingToolbarButton ref="heading" :editor="editor" :levels="headingLevels" :labels="labels" />
                </li>
                <li v-else>
                    <ToolbarButton :editor="editor" :action="action" />
                </li>
            </template>
            <slot name="toolbar" :editor="editor" />
            <li v-if="fullscreenable" class="vme-toolbar-end">
                <button
                    type="button"
                    class="vme-toolbar-btn vme-fullscreen-btn"
                    :aria-pressed="fullscreen"
                    :aria-label="fullscreen ? labels.exitFullscreen : labels.fullscreen"
                    :title="fullscreen ? labels.exitFullscreen : labels.fullscreen"
                    @pointerdown.prevent
                    @click="fullscreen = !fullscreen"
                >
                    <i :class="fullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'"></i>
                </button>
            </li>
        </menu>
        <div class="vme-content">
            <EditorContent :editor></EditorContent>
        </div>
    </div>
</template>
