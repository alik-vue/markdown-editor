<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { computed, onUnmounted, ref, watch } from 'vue';
import type { EditorLabels } from '../labels';

/**
 * The paragraph style of the block under the caret — plain text or a
 * heading — as an icon on the toolbar, with a menu of the styles to switch
 * to. The menu keeps the editor's focus: rows choose on pointerdown.
 */
const props = defineProps<{
    editor: Editor;
    levels: number[];
    labels: EditorLabels;
}>();

const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

/** The menu's least width (see `.vme-heading-menu`), to tell if it fits. */
const MENU_WIDTH = 190;

/**
 * Near the window's right edge — a toolbar in a sidebar — the menu opens
 * leftwards, under the button's right edge, rather than off the screen.
 */
const alignEnd = ref(false);

type Level = 1 | 2 | 3 | 4 | 5 | 6;

const styles = computed(() => [
    { level: 0, label: props.labels.paragraph, icon: 'ri-paragraph' },
    ...props.levels.map((level) => ({
        level,
        label: props.labels.heading(level),
        icon: `ri-h-${level}`,
    })),
]);

/** 0 is plain text. Read on every render, which each transaction causes. */
const current = computed(
    () =>
        styles.value.find(
            (style) => style.level !== 0 && props.editor.isActive('heading', { level: style.level }),
        ) ?? styles.value[0],
);

const choose = (level: number) => {
    open.value = false;

    if (level === 0) {
        props.editor.chain().focus().setParagraph().run();
    } else {
        props.editor.chain().focus().setHeading({ level: level as Level }).run();
    }
};

/** A click with no pointer behind it is the keyboard's. */
const onRowClick = (event: MouseEvent, level: number) => {
    if (event.detail === 0) {
        choose(level);
    }
};

const onPointerdownOutside = (event: PointerEvent) => {
    if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
        open.value = false;
    }
};

watch(open, (isOpen) => {
    if (isOpen) {
        const left = wrapperRef.value?.getBoundingClientRect().left ?? 0;
        alignEnd.value = left + MENU_WIDTH > window.innerWidth;
        document.addEventListener('pointerdown', onPointerdownOutside, true);
    } else {
        document.removeEventListener('pointerdown', onPointerdownOutside, true);
    }
});

onUnmounted(() => document.removeEventListener('pointerdown', onPointerdownOutside, true));

/** Escape closes the menu; the editor asks before it handles the key itself. */
const close = (): boolean => {
    const wasOpen = open.value;
    open.value = false;

    return wasOpen;
};

defineExpose({ close });
</script>

<template>
    <div ref="wrapperRef" class="vme-heading-wrapper">
        <button
            type="button"
            class="vme-toolbar-btn vme-heading-btn"
            :class="{ 'is-active': open }"
            aria-haspopup="menu"
            :aria-expanded="open"
            :aria-label="`${labels.textStyle}: ${current.label}`"
            :title="current.label"
            :data-heading-current="current.level"
            @pointerdown.prevent
            @click="open = !open"
        >
            <i :class="current.icon"></i>
            <i class="ri-arrow-down-s-line vme-heading-chevron"></i>
        </button>

        <div
            v-if="open"
            class="vme-heading-menu"
            :class="{ 'vme-heading-menu--end': alignEnd }"
            role="menu"
            :aria-label="labels.textStyle"
        >
            <button
                v-for="style in styles"
                :key="style.level"
                type="button"
                role="menuitemradio"
                class="vme-heading-item"
                :class="[`vme-heading-item--${style.level === 0 ? 'p' : `h${style.level}`}`, { 'is-active': style.level === current.level }]"
                :aria-checked="style.level === current.level"
                :data-heading-level="style.level"
                @pointerdown.prevent="choose(style.level)"
                @click="onRowClick($event, style.level)"
            >
                <i :class="style.icon" aria-hidden="true"></i>
                {{ style.label }}
            </button>
        </div>
    </div>
</template>
