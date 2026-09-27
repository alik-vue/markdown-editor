import { AnyExtension } from '@tiptap/core';
export type ToolbarAction = 'bold' | 'italic' | 'strike' | 'bulletList' | 'orderedList' | 'blockquote' | 'code' | 'codeBlock' | 'horizontalRule' | 'undo' | 'redo';
type __VLS_Props = {
    modelValue?: string;
    toolbar?: ToolbarAction[];
    placeholder?: string;
    /**
     * Extra Tiptap extensions appended after the built-in set (StarterKit, Markdown).
     * Build them with the constructors exported by this package so they share its
     * bundled Tiptap/ProseMirror copy. Read once when the editor is created.
     */
    extensions?: AnyExtension[];
};
declare const _default: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
export default _default;
//# sourceMappingURL=MarkdownEditor.vue.d.ts.map