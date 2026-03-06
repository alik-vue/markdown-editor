import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { Editor } from '@tiptap/vue-3'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import ToolbarButton from '../ToolbarButton.vue'

const tick = () => new Promise((r) => setTimeout(r, 50))

describe('ToolbarButton', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit, Markdown],
      content: 'hello world',
      contentType: 'markdown',
    })
  })

  afterEach(() => {
    editor.destroy()
  })

  it('renders a button for a known action', () => {
    const wrapper = mount(ToolbarButton, {
      props: { editor, action: 'bold' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('i.ri-bold').exists()).toBe(true)
  })

  it('does not render for an unknown action', () => {
    const wrapper = mount(ToolbarButton, {
      props: { editor, action: 'nonexistent' },
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('renders correct icons for each action', () => {
    const actionIcons: Record<string, string> = {
      bold: 'ri-bold',
      italic: 'ri-italic',
      strike: 'ri-strikethrough',
      bulletList: 'ri-list-unordered',
      orderedList: 'ri-list-ordered',
      blockquote: 'ri-double-quotes-l',
      code: 'ri-code-line',
      codeBlock: 'ri-code-box-line',
      horizontalRule: 'ri-separator',
      undo: 'ri-arrow-go-back-line',
      redo: 'ri-arrow-go-forward-line',
    }

    for (const [action, icon] of Object.entries(actionIcons)) {
      const wrapper = mount(ToolbarButton, {
        props: { editor, action },
      })
      expect(wrapper.find(`i.${icon}`).exists(), `icon for ${action}`).toBe(true)
      wrapper.unmount()
    }
  })

  it('toggles bold when clicked', async () => {
    // Select all text
    editor.commands.selectAll()
    await tick()

    const wrapper = mount(ToolbarButton, {
      props: { editor, action: 'bold' },
    })

    expect(editor.isActive('bold')).toBe(false)
    await wrapper.find('button').trigger('click')
    await tick()
    expect(editor.isActive('bold')).toBe(true)
  })

  it('shows active state when mark is active', async () => {
    editor.commands.selectAll()
    editor.chain().focus().toggleBold().run()
    await tick()

    const wrapper = mount(ToolbarButton, {
      props: { editor, action: 'bold' },
    })
    await tick()

    expect(wrapper.find('button').classes()).toContain('is-active')
  })

  it('shows inactive state when mark is not active', () => {
    const wrapper = mount(ToolbarButton, {
      props: { editor, action: 'bold' },
    })
    expect(wrapper.find('button').classes()).not.toContain('is-active')
  })
})
