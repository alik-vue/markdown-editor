import { Editor } from '@tiptap/vue-3';
import { EditorLabels } from '../labels';
/**
 * The paragraph style of the block under the caret — plain text or a
 * heading — as an icon on the toolbar, with a menu of the styles to switch
 * to. The menu keeps the editor's focus: rows choose on pointerdown.
 */
type __VLS_Props = {
    editor: Editor;
    levels: number[];
    labels: EditorLabels;
};
declare const _default: import('vue').DefineComponent<__VLS_Props, {
    close: () => boolean;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    wrapperRef: HTMLDivElement;
}, HTMLDivElement>;
export default _default;
//# sourceMappingURL=HeadingToolbarButton.vue.d.ts.map