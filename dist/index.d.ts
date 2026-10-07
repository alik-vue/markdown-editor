import { default as MarkdownEditor } from './components/MarkdownEditor.vue';
export { MarkdownEditor };
export type { ToolbarAction } from './components/MarkdownEditor.vue';
export { defaultLabels } from './labels';
export type { EditorLabels } from './labels';
/**
 * Constructors from the editor's own bundled Tiptap/ProseMirror copy, so consumers can
 * build extensions for the `extensions` prop without installing a second ProseMirror.
 */
export { Extension } from '@tiptap/core';
export { Plugin, PluginKey } from '@tiptap/pm/state';
export { Decoration, DecorationSet } from '@tiptap/pm/view';
export type { AnyExtension, Extensions } from '@tiptap/core';
export type { EditorState, Transaction } from '@tiptap/pm/state';
export type { EditorView, DecorationAttrs } from '@tiptap/pm/view';
export type { Node as ProseMirrorNode } from '@tiptap/pm/model';
//# sourceMappingURL=index.d.ts.map