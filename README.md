# @alikmanukian/vue-markdown-editor

A lightweight, customizable Markdown editor component for Vue 3, built on top of [Tiptap](https://tiptap.dev/).

- WYSIWYG editing with Markdown output
- Configurable toolbar (bold, italic, strikethrough, lists, links, and more)
- Default styles with full CSS variable theming — override anything without `!important`
- Zero dependency on any UI framework (no shadcn, no Tailwind required)
- Fully typed with TypeScript

---

## Installation

```bash
npm install @alikmanukian/vue-markdown-editor remixicon
```

> **Why remixicon?** The toolbar uses [Remix Icons](https://remixicon.com/) for its buttons. It is listed as a peer dependency so you control how and where you import it — and you can reuse it across your project.

---

## Quick Start

### 1. Import the styles

In your app's entry file (`main.ts` or equivalent):

```ts
// Remixicon — required for toolbar icons
import 'remixicon/fonts/remixicon.css';

// Editor default styles
import '@alikmanukian/vue-markdown-editor/styles';
```

### 2. Use the component

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { MarkdownEditor } from '@alikmanukian/vue-markdown-editor';

const content = ref('Hello **world**!');
</script>

<template>
  <MarkdownEditor v-model="content" />
</template>
```

That's it. The editor binds to `v-model` and emits the current content as a Markdown string on every change.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `string` | `''` | The Markdown content (use with `v-model`) |
| `toolbar` | `ToolbarAction[]` | See below | Which toolbar buttons to display and in what order |
| `placeholder` | `string` | — | Placeholder text shown when the editor is empty |
| `extensions` | `AnyExtension[]` | `[]` | Extra Tiptap extensions appended after the built-in set. Read once, when the editor is created. See [Custom extensions](#custom-extensions) |
| `headingLevels` | `number[]` | `[1, 2, 3]` | The heading levels the `heading` toolbar menu offers |
| `fullscreenable` | `boolean` | `false` | Show a button at the toolbar's far end that spreads the editor over the window |
| `fullscreen` | `boolean` | `false` | Whether the editor covers the window (use with `v-model:fullscreen`). Escape leaves it |
| `labels` | `Partial<EditorLabels>` | English | Any text the editor draws, translated. See [Labels](#labels) |

### Default toolbar

```ts
['bold', 'italic', 'strike', 'bulletList', 'orderedList']
```

The link button is appended at the end of the toolbar unless the toolbar names `link` itself.

### Available `ToolbarAction` values

| Value | Description |
|---|---|
| `bold` | Bold |
| `italic` | Italic |
| `strike` | Strikethrough |
| `bulletList` | Unordered list |
| `orderedList` | Ordered list |
| `blockquote` | Blockquote |
| `code` | Inline code |
| `codeBlock` | Code block |
| `horizontalRule` | Horizontal rule |
| `undo` | Undo |
| `redo` | Redo |
| `heading` | Paragraph style menu: plain text or a heading of `headingLevels`; the button shows the style under the caret |
| `link` | Link popover (placed here instead of at the end) |
| `\|` | A thin separator between groups of buttons |

### Labels

```ts
interface EditorLabels {
  textStyle: string                    // 'Text style'
  paragraph: string                    // 'Normal text'
  heading: (level: number) => string   // level => `Heading ${level}`
  fullscreen: string                   // 'Fullscreen'
  exitFullscreen: string               // 'Exit fullscreen'
  linkUrl: string                      // 'Link URL'
  removeLink: string                   // 'Remove link'
}
```

Pass any subset: `:labels="{ paragraph: 'Обычный текст' }"`. `defaultLabels` is exported.

### Fullscreen

With `fullscreenable`, the editor becomes `position: fixed` over the window, staying where it is in
the DOM (a dialog around it still counts it as its own). Ancestors with a `transform`, `filter`,
`backdrop-filter`, `contain` or `will-change` are neutralised while it is fullscreen, and restored
afterwards. Escape — from inside the editor or anywhere on the page — leaves fullscreen and is not
passed on; an open menu closes first. A wrapper that listens for Escape itself (in the capture phase,
above the editor) sees the key first.

### Exposed

The component exposes `editor`, the Tiptap instance (`ref.value.editor`).

### Markdown output

The empty paragraph Tiptap keeps after a document's last non-paragraph block (serialized as
`&nbsp;`) is dropped from the emitted Markdown, so a document does not grow a line with every edit.

---

## Events

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `string` | Emitted on every content change with the current Markdown string |

---

## Slots

| Slot | Props | Description |
| --- | --- | --- |
| `toolbar` | `{ editor }` | Extra items after the link button, inside the toolbar's `<menu>` — supply `<li>` elements. |

```vue
<MarkdownEditor v-model="text">
  <template #toolbar>
    <li><button type="button" class="vme-toolbar-btn">…</button></li>
  </template>
</MarkdownEditor>
```

## Custom extensions

Tiptap and ProseMirror are bundled inside this package, so an extension built from a separately installed `@tiptap/core` or `@tiptap/pm` would talk to a second ProseMirror copy and break. Build extensions from the constructors the package re-exports instead. They come from the same copy the editor uses:

| Export | Source |
|---|---|
| `Extension` | `@tiptap/core` |
| `Plugin`, `PluginKey` | `@tiptap/pm/state` |
| `Decoration`, `DecorationSet` | `@tiptap/pm/view` |
| Types: `AnyExtension`, `Extensions`, `EditorState`, `Transaction`, `EditorView`, `DecorationAttrs`, `ProseMirrorNode` | same packages |

Pass the result through the `extensions` prop. The built-in extensions (StarterKit, Markdown) always stay registered, and your extensions come after them. Decorations change only the rendered DOM, so the emitted Markdown stays the same.

The example below adds a class to every blockquote whose first line starts with a `[!type]` marker:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  Decoration,
  DecorationSet,
  Extension,
  MarkdownEditor,
  Plugin,
  PluginKey,
  type ProseMirrorNode,
} from '@alikmanukian/vue-markdown-editor';

const calloutDecoration = Extension.create({
  name: 'calloutDecoration',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('calloutDecoration'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.descendants((node: ProseMirrorNode, pos: number) => {
              if (node.type.name !== 'blockquote') {
                return true;
              }
              const match = /^\[!(\w+)\]/.exec(node.firstChild?.textContent ?? '');
              if (match) {
                decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: `callout callout-${match[1]}` }));
              }
              return false;
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

const content = ref('> [!tip] Remember\n>\n> Decorations never touch the Markdown.');
</script>

<template>
  <MarkdownEditor v-model="content" :extensions="[calloutDecoration]" />
</template>
```

Create the extension once, outside reactive state. The prop is read when the editor is created, so changing it later has no effect.

---

## Customizing Styles

### Method 1 — CSS Custom Properties (recommended)

All visual aspects of the editor are controlled by CSS custom properties. Override them in your own stylesheet after importing the default styles:

```css
/* Apply to all editor instances */
:root {
  --vme-border-color: #a855f7;
  --vme-focus-border-color: #9333ea;
  --vme-focus-ring: rgba(147, 51, 234, 0.25);
  --vme-border-radius: 10px;
  --vme-content-min-height: 300px;
}
```

Or scope it to a specific instance using the `.vme-editor` class:

```css
.my-form .vme-editor {
  --vme-border-color: #f59e0b;
  --vme-focus-border-color: #d97706;
  --vme-border-radius: 0;
}
```

### Method 2 — Replace default styles entirely

Skip importing the default styles and write your own from scratch using the `vme-*` class names:

```ts
// main.ts — do NOT import the default styles
import 'remixicon/fonts/remixicon.css';
import './my-editor-styles.css'; // your own styles
```

```css
/* my-editor-styles.css */
.vme-editor { /* wrapper */ }
.vme-toolbar { /* toolbar <menu> */ }
.vme-toolbar-btn { /* toolbar button */ }
.vme-toolbar-btn.is-active { /* active state */ }
.vme-content { /* editor content wrapper */ }
.vme-content .ProseMirror { /* the actual editable area */ }
.vme-link-popover-wrapper { /* link button + popover wrapper */ }
.vme-link-popover { /* link URL popover panel */ }
.vme-link-input { /* URL <input> inside popover */ }
.vme-link-confirm-btn { /* confirm button inside popover */ }
.vme-link-remove-btn { /* remove link button */ }
```

### Full list of CSS custom properties

| Property | Default | Description |
|---|---|---|
| `--vme-border-color` | `#d1d5db` | Editor border color |
| `--vme-border-radius` | `6px` | Editor border radius |
| `--vme-bg` | `transparent` | Editor background |
| `--vme-shadow` | subtle | Editor box shadow |
| `--vme-focus-border-color` | `#6366f1` | Border color on focus |
| `--vme-focus-ring` | `rgba(99,102,241,.25)` | Focus ring color |
| `--vme-toolbar-border-color` | `rgba(0,0,0,.12)` | Separator between toolbar and content |
| `--vme-toolbar-padding` | `4px` | Toolbar inner padding |
| `--vme-btn-size` | `32px` | Toolbar button size (width & height) |
| `--vme-btn-radius` | `4px` | Toolbar button border radius |
| `--vme-btn-hover-bg` | `rgba(0,0,0,.08)` | Button hover background |
| `--vme-btn-active-bg` | `rgba(0,0,0,.15)` | Active/pressed button background |
| `--vme-btn-icon-size` | `16px` | Icon font size inside buttons |
| `--vme-content-padding` | `8px 12px` | Padding around the editable area |
| `--vme-content-min-height` | `200px` | Minimum height of the editing area |
| `--vme-font-family` | `inherit` | Editor font family |
| `--vme-font-size` | `0.875rem` | Editor font size |
| `--vme-line-height` | `1.6` | Editor line height |
| `--vme-link-color` | `#6366f1` | Hyperlink color |
| `--vme-list-padding` | `1.5em` | List indentation |
| `--vme-popover-bg` | `#ffffff` | Link popover background |
| `--vme-popover-border` | `#e5e7eb` | Link popover border color |
| `--vme-popover-shadow` | subtle | Link popover shadow |
| `--vme-popover-width` | `280px` | Link popover width |
| `--vme-confirm-btn-bg` | `#6366f1` | Link confirm button background |
| `--vme-confirm-btn-hover-bg` | `#4f46e5` | Link confirm button hover background |
| `--vme-remove-btn-color` | `#ef4444` | Remove link button text color |
| `--vme-separator-color` | `rgba(0,0,0,0.12)` | Toolbar separator (`\|`) |
| `--vme-blockquote-border` | `2px solid rgba(0,0,0,0.2)` | Blockquote left rule (a blockquote carrying classes from an extension is left unstyled) |
| `--vme-blockquote-padding` | `0.75rem` | Blockquote left padding |
| `--vme-blockquote-margin` | `0.5em 0` | Blockquote margin |
| `--vme-blockquote-color` | `#6b7280` | Blockquote text color |
| `--vme-heading-font-weight` | `600` | Heading weight |
| `--vme-heading-line-height` | `1.3` | Heading line height |
| `--vme-heading-margin` | `0.9em 0 0.3em` | Heading margin |
| `--vme-h1-font-size` … `--vme-h6-font-size` | `1.75em` … `1em` | Heading sizes |
| `--vme-menu-item-active-color` | `#6366f1` | Current style in the paragraph style menu |
| `--vme-fullscreen-bg` | `#ffffff` | Fullscreen background |
| `--vme-fullscreen-padding` | `16px` | Gap around the fullscreen editor |
| `--vme-fullscreen-z-index` | `100` | Fullscreen stacking order |

---

## Usage Examples

### With Tailwind CSS

The component uses regular CSS class names, not Tailwind utilities, so it works alongside Tailwind without any conflicts. Override the design tokens in your CSS:

```css
/* resources/css/app.css */
:root {
  --vme-border-color: theme(colors.gray.300);
  --vme-focus-border-color: theme(colors.violet.500);
  --vme-focus-ring: theme(colors.violet.500 / 25%);
}
```

### In a form (Laravel / Inertia)

```vue
<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { MarkdownEditor } from '@alikmanukian/vue-markdown-editor';

const form = useForm({ body: '' });
</script>

<template>
  <form @submit.prevent="form.post('/posts')">
    <MarkdownEditor v-model="form.body" placeholder="Write your post..." />
    <p v-if="form.errors.body" class="text-red-500">{{ form.errors.body }}</p>
    <button type="submit">Publish</button>
  </form>
</template>
```

### Custom toolbar

```vue
<MarkdownEditor
  v-model="content"
  :toolbar="['bold', 'italic', 'bulletList', 'orderedList', 'blockquote', 'undo', 'redo']"
/>
```

### Read-only display with `parseMarkdown`

The package does not export a render utility — for displaying stored Markdown as HTML, use [marked](https://marked.js.org/) + [DOMPurify](https://github.com/cure53/DOMPurify) directly:

```ts
import DOMPurify from 'dompurify';
import { marked } from 'marked';

function renderMarkdown(content: string): string {
  const html = marked.parse(content, { async: false }) as string;
  return DOMPurify.sanitize(html);
}
```

---

## Testing

Tests are written with [Vitest](https://vitest.dev/) and [Vue Test Utils](https://test-utils.vuejs.org/), using [happy-dom](https://github.com/nicedaycode/happy-dom) as the DOM environment.

```bash
# Run all tests once
npm test

# Run in watch mode (re-runs on file changes)
npx vitest

# Run with browser-like UI
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### Test structure

Tests live in `src/components/__tests__/`:

| File | What it covers |
|---|---|
| `MarkdownEditor.test.ts` | Rendering, toolbar configuration, v-model binding, placeholder, markdown output, custom extensions |
| `ToolbarButton.test.ts` | Icon mapping, active/inactive state, command execution |
| `LinkToolbarButton.test.ts` | Popover open/close, keyboard handling, click outside, link active state |

---

## Development (live preview)

Clone or open the package directory and run:

```bash
npm install
npm run dev
```

This starts a Vite dev server at `http://localhost:5173` with a live preview of the component. Any changes to files in `src/` are hot-reloaded instantly.

To build the distributable package:

```bash
npm run build
```

Output is placed in the `dist/` folder.

---

## Local linking

To use the package in another local project before publishing it to npm:

```bash
# In the package directory
cd /path/to/vue-markdown-editor
npm link

# In your project
npm link @alikmanukian/vue-markdown-editor
```

Or reference it directly in your project's `package.json`:

```json
{
  "dependencies": {
    "@alikmanukian/vue-markdown-editor": "file:/path/to/vue-markdown-editor"
  }
}
```

---

## License

MIT
