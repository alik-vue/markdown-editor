<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
    editor: Editor;
}>();

const isOpen = ref(false);
const linkUrl = ref('');
const wrapperRef = ref<HTMLElement | null>(null);

const isActive = computed(() => props.editor.isActive('link'));

watch(isOpen, (open) => {
    if (open) {
        const attrs = props.editor.getAttributes('link');
        linkUrl.value = attrs.href || '';
    }
});

const close = () => {
    isOpen.value = false;
};

const setLink = () => {
    if (linkUrl.value) {
        props.editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run();
    } else {
        props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    nextTick(close);
};

const removeLink = () => {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
    linkUrl.value = '';
    nextTick(close);
};

const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        setLink();
    } else if (e.key === 'Escape') {
        close();
    }
};

const onClickOutside = (event: MouseEvent) => {
    if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
        close();
    }
};

onMounted(() => document.addEventListener('mousedown', onClickOutside));
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside));
</script>

<template>
    <div ref="wrapperRef" class="vme-link-popover-wrapper">
        <button
            type="button"
            class="vme-toolbar-btn"
            :class="{ 'is-active': isActive }"
            @click="isOpen = !isOpen"
        >
            <i class="ri-link"></i>
        </button>

        <div v-if="isOpen" class="vme-link-popover">
            <span class="vme-link-popover-label">Link URL</span>
            <div class="vme-link-popover-row">
                <input
                    v-model="linkUrl"
                    type="url"
                    class="vme-link-input"
                    placeholder="https://..."
                    @keydown="onKeydown"
                />
                <button type="button" class="vme-link-confirm-btn" @click="setLink">
                    <i class="ri-check-line"></i>
                </button>
            </div>
            <button v-if="isActive" type="button" class="vme-link-remove-btn" @click="removeLink">
                <i class="ri-delete-bin-line"></i>
                Remove link
            </button>
        </div>
    </div>
</template>
