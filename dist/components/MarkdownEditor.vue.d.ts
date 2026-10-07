import { AnyExtension } from '@tiptap/core';
import { Editor } from '@tiptap/vue-3';
import { EditorLabels } from '../labels';
export type ToolbarAction = 'bold' | 'italic' | 'strike' | 'bulletList' | 'orderedList' | 'blockquote' | 'code' | 'codeBlock' | 'horizontalRule' | 'undo' | 'redo'
/** The paragraph style menu: plain text or a heading of `headingLevels`. */
 | 'heading'
/** The link button. Appended after the rest when the toolbar leaves it out. */
 | 'link'
/** A thin rule between groups of buttons. */
 | '|';
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
    /** The heading levels the paragraph style menu offers. */
    headingLevels?: number[];
    /** Offer a button that spreads the editor over the whole window. */
    fullscreenable?: boolean;
    /** Any of the texts the editor draws, translated. */
    labels?: Partial<EditorLabels>;
};
type __VLS_PublicProps = {
    'fullscreen'?: boolean;
} & __VLS_Props;
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: Readonly<{
        /**
         * Extra toolbar items after the toolbar's own. Rendered inside the toolbar's
         * `<menu>`, so supply `<li>` elements; the editor is passed in for commands.
         */
        toolbar?: (props: {
            editor: Editor;
        }) => unknown;
    }> & {
        /**
         * Extra toolbar items after the toolbar's own. Rendered inside the toolbar's
         * `<menu>`, so supply `<li>` elements; the editor is passed in for commands.
         */
        toolbar?: (props: {
            editor: Editor;
        }) => unknown;
    };
    refs: {
        root: HTMLDivElement;
        heading: (import('vue').CreateComponentPublicInstanceWithMixins<Readonly<{
            editor: Editor;
            levels: number[];
            labels: EditorLabels;
        }> & Readonly<{}>, {
            close: () => boolean;
        }, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, import('vue').PublicProps, {}, false, {}, {}, import('vue').GlobalComponents, import('vue').GlobalDirectives, string, {
            wrapperRef: HTMLDivElement;
        }, HTMLDivElement, import('vue').ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            editor: Editor;
            levels: number[];
            labels: EditorLabels;
        }> & Readonly<{}>, {
            close: () => boolean;
        }, {}, {}, {}, {}> | null)[];
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_PublicProps, {
    editor: Editor;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
    "update:fullscreen": (value: boolean) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
    "onUpdate:fullscreen"?: ((value: boolean) => any) | undefined;
}>, {
    labels: Partial<EditorLabels>;
    placeholder: string;
    modelValue: string;
    toolbar: ToolbarAction[];
    extensions: AnyExtension[];
    headingLevels: number[];
    fullscreenable: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    root: HTMLDivElement;
    heading: (import('vue').CreateComponentPublicInstanceWithMixins<Readonly<{
        editor: Editor;
        levels: number[];
        labels: EditorLabels;
    }> & Readonly<{}>, {
        close: () => boolean;
    }, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, import('vue').PublicProps, {}, false, {}, {}, import('vue').GlobalComponents, import('vue').GlobalDirectives, string, {
        wrapperRef: HTMLDivElement;
    }, HTMLDivElement, import('vue').ComponentProvideOptions, {
        P: {};
        B: {};
        D: {};
        C: {};
        M: {};
        Defaults: {};
    }, Readonly<{
        editor: Editor;
        levels: number[];
        labels: EditorLabels;
    }> & Readonly<{}>, {
        close: () => boolean;
    }, {}, {}, {}, {}> | null)[];
}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=MarkdownEditor.vue.d.ts.map