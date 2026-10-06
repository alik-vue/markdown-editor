import { AnyExtension } from '@tiptap/core';
import { Editor } from '@tiptap/vue-3';
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
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: Readonly<{
        /**
         * Extra toolbar items after the link button. Rendered inside the toolbar's
         * `<menu>`, so supply `<li>` elements; the editor is passed in for commands.
         */
        toolbar?: (props: {
            editor: Editor;
        }) => unknown;
    }> & {
        /**
         * Extra toolbar items after the link button. Rendered inside the toolbar's
         * `<menu>`, so supply `<li>` elements; the editor is passed in for commands.
         */
        toolbar?: (props: {
            editor: Editor;
        }) => unknown;
    };
    refs: {};
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=MarkdownEditor.vue.d.ts.map