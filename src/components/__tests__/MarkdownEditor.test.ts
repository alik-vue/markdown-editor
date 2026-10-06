import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { AnyExtension } from '@tiptap/core'
import { type Editor, EditorContent } from '@tiptap/vue-3'
import MarkdownEditor from '../MarkdownEditor.vue'
import {
  Decoration,
  DecorationSet,
  type EditorState,
  Extension,
  Plugin,
  PluginKey,
  type ProseMirrorNode,
} from '../../index'

// Wait for tiptap editor to initialize
const tick = () => new Promise((r) => setTimeout(r, 50))

describe('MarkdownEditor', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the editor', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
    })
    await tick()

    expect(wrapper.find('.vme-editor').exists()).toBe(true)
    expect(wrapper.find('.vme-toolbar').exists()).toBe(true)
    expect(wrapper.find('.vme-content').exists()).toBe(true)
    wrapper.unmount()
  })

  it('renders default toolbar actions', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
    })
    await tick()

    const buttons = wrapper.findAll('.vme-toolbar-btn')
    // Default: bold, italic, strike, bulletList, orderedList + link button
    expect(buttons.length).toBe(6)
    wrapper.unmount()
  })

  it('renders the toolbar slot after the link button', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: { toolbar: ['bold'] },
      slots: {
        toolbar: '<li class="extra"><button type="button">Extra</button></li>',
      },
    })
    await tick()

    const items = wrapper.findAll('.vme-toolbar > li')
    expect(items.length).toBe(3)
    expect(items[2].classes()).toContain('extra')
    wrapper.unmount()
  })

  it('renders custom toolbar actions', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: {
        toolbar: ['bold', 'italic'],
      },
    })
    await tick()

    const toolbarItems = wrapper.findAll('.vme-toolbar li')
    // 2 custom actions + 1 link button
    expect(toolbarItems.length).toBe(3)
    wrapper.unmount()
  })

  it('initializes with modelValue content', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: {
        modelValue: '**hello** world',
      },
    })
    await tick()

    const prosemirror = wrapper.find('.vme-prosemirror')
    expect(prosemirror.exists()).toBe(true)
    expect(prosemirror.html()).toContain('<strong>hello</strong>')
    expect(prosemirror.html()).toContain('world')
    wrapper.unmount()
  })

  it('sets placeholder attribute', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: {
        placeholder: 'Type here...',
      },
    })
    await tick()

    const prosemirror = wrapper.find('.vme-prosemirror')
    expect(prosemirror.attributes('data-placeholder')).toBe('Type here...')
    wrapper.unmount()
  })

  it('does not set placeholder attribute when not provided', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
    })
    await tick()

    const prosemirror = wrapper.find('.vme-prosemirror')
    expect(prosemirror.attributes('data-placeholder')).toBeUndefined()
    wrapper.unmount()
  })

  it('renders with empty content when modelValue is empty', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: {
        modelValue: '',
      },
    })
    await tick()

    const prosemirror = wrapper.find('.vme-prosemirror')
    expect(prosemirror.exists()).toBe(true)
    // Editor should be editable and have contenteditable attribute
    expect(prosemirror.attributes('contenteditable')).toBe('true')
    wrapper.unmount()
  })

  it('updates content when modelValue prop changes externally', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: {
        modelValue: 'initial',
      },
    })
    await tick()

    await wrapper.setProps({ modelValue: '**updated**' })
    await tick()

    const prosemirror = wrapper.find('.vme-prosemirror')
    expect(prosemirror.html()).toContain('<strong>updated</strong>')
    wrapper.unmount()
  })

  it('does not re-set content when modelValue matches current editor content', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: {
        modelValue: 'same content',
      },
    })
    await tick()

    // Setting same value should not trigger setContent
    await wrapper.setProps({ modelValue: 'same content' })
    await tick()

    const prosemirror = wrapper.find('.vme-prosemirror')
    expect(prosemirror.html()).toContain('same content')
    wrapper.unmount()
  })

  it('renders markdown features correctly', async () => {
    const markdown = [
      '# Heading',
      '',
      '- item 1',
      '- item 2',
      '',
      '> blockquote',
      '',
      '`inline code`',
    ].join('\n')

    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: {
        modelValue: markdown,
      },
    })
    await tick()

    const html = wrapper.find('.vme-prosemirror').html()
    expect(html).toContain('<h1>')
    expect(html).toContain('<li>')
    expect(html).toContain('<blockquote>')
    expect(html).toContain('<code>')
    wrapper.unmount()
  })
})

describe('MarkdownEditor extensions prop', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  const calloutMarkdown = ['> [!tip] Title', '>', '> Body text', '', 'Plain paragraph'].join('\n')

  /**
   * Decorates blockquotes whose first paragraph starts with `[!type]`, built only from
   * the constructors this package exports.
   */
  function createCalloutDecoration(seenDocuments: string[]) {
    const key = new PluginKey('callout-decoration')

    return Extension.create({
      name: 'calloutDecoration',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key,
            props: {
              decorations(state: EditorState) {
                seenDocuments.push(state.doc.textContent)
                const decorations: Decoration[] = []
                state.doc.descendants((node: ProseMirrorNode, pos: number) => {
                  if (node.type.name !== 'blockquote') {
                    return true
                  }
                  const match = /^\[!(\w+)\]/.exec(node.firstChild?.textContent ?? '')
                  if (match) {
                    decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: `callout callout-${match[1]}` }))
                  }
                  return false
                })
                return DecorationSet.create(state.doc, decorations)
              },
            },
          }),
        ]
      },
    })
  }

  function editorOf(wrapper: ReturnType<typeof mount>): Editor {
    return wrapper.findComponent(EditorContent).props('editor') as Editor
  }

  async function appendTextAndCaptureMarkdown(extensions?: AnyExtension[]): Promise<string | undefined> {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: { modelValue: calloutMarkdown, ...(extensions ? { extensions } : {}) },
    })
    await tick()

    editorOf(wrapper).chain().focus('end').insertContent(' appended').run()
    await tick()

    const emitted = wrapper.emitted('update:modelValue')
    wrapper.unmount()

    return emitted?.[emitted.length - 1]?.[0] as string | undefined
  }

  it('registers an extension passed via the prop and lets it see the document', async () => {
    const seenDocuments: string[] = []
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: { modelValue: calloutMarkdown, extensions: [createCalloutDecoration(seenDocuments)] },
    })
    await tick()

    expect(editorOf(wrapper).extensionManager.extensions.map((extension) => extension.name)).toContain('calloutDecoration')
    expect(seenDocuments.some((text) => text.includes('[!tip] Title'))).toBe(true)

    const blockquote = wrapper.find('.vme-prosemirror blockquote')
    expect(blockquote.classes()).toContain('callout')
    expect(blockquote.classes()).toContain('callout-tip')
    wrapper.unmount()
  })

  it('drops the decoration once the marker is removed', async () => {
    const wrapper = mount(MarkdownEditor, {
      attachTo: document.body,
      props: { modelValue: calloutMarkdown, extensions: [createCalloutDecoration([])] },
    })
    await tick()
    expect(wrapper.find('.vme-prosemirror blockquote').classes()).toContain('callout')

    await wrapper.setProps({ modelValue: '> Just a quote' })
    await tick()

    expect(wrapper.find('.vme-prosemirror blockquote').classes()).not.toContain('callout')
    wrapper.unmount()
  })

  it('emits the same markdown with and without a decoration extension', async () => {
    const withoutExtensions = await appendTextAndCaptureMarkdown()
    const withDecoration = await appendTextAndCaptureMarkdown([createCalloutDecoration([])])

    expect(withoutExtensions).toBe(['> [!tip] Title', '>', '> Body text', '', 'Plain paragraph appended'].join('\n'))
    expect(withDecoration).toBe(withoutExtensions)
  })
})
