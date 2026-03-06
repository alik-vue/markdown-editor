import Link from '@tiptap/extension-link'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { Editor } from '@tiptap/vue-3'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import LinkToolbarButton from '../LinkToolbarButton.vue'

const tick = () => new Promise((r) => setTimeout(r, 50))

describe('LinkToolbarButton', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      element: document.createElement('div'),
      extensions: [StarterKit, Markdown, Link.configure({ openOnClick: false })],
      content: 'hello world',
      contentType: 'markdown',
    })
  })

  afterEach(() => {
    editor.destroy()
    document.body.innerHTML = ''
  })

  it('renders the link button', () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
    })
    expect(wrapper.find('button.vme-toolbar-btn').exists()).toBe(true)
    expect(wrapper.find('i.ri-link').exists()).toBe(true)
  })

  it('popover is closed by default', () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
    })
    expect(wrapper.find('.vme-link-popover').exists()).toBe(false)
  })

  it('opens popover on button click', async () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
      attachTo: document.body,
    })

    await wrapper.find('button.vme-toolbar-btn').trigger('click')
    await tick()

    expect(wrapper.find('.vme-link-popover').exists()).toBe(true)
    expect(wrapper.find('.vme-link-input').exists()).toBe(true)
    wrapper.unmount()
  })

  it('closes popover on second button click', async () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
      attachTo: document.body,
    })

    const btn = wrapper.find('button.vme-toolbar-btn')
    await btn.trigger('click')
    expect(wrapper.find('.vme-link-popover').exists()).toBe(true)

    await btn.trigger('click')
    await tick()
    expect(wrapper.find('.vme-link-popover').exists()).toBe(false)
    wrapper.unmount()
  })

  it('closes popover on Escape key', async () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
      attachTo: document.body,
    })

    await wrapper.find('button.vme-toolbar-btn').trigger('click')
    expect(wrapper.find('.vme-link-popover').exists()).toBe(true)

    await wrapper.find('.vme-link-input').trigger('keydown', { key: 'Escape' })
    await tick()

    expect(wrapper.find('.vme-link-popover').exists()).toBe(false)
    wrapper.unmount()
  })

  it('renders input with placeholder', async () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
      attachTo: document.body,
    })

    await wrapper.find('button.vme-toolbar-btn').trigger('click')
    const input = wrapper.find('.vme-link-input')
    expect(input.attributes('placeholder')).toBe('https://...')
    expect(input.attributes('type')).toBe('url')
    wrapper.unmount()
  })

  it('does not show remove button when no link is active', async () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
      attachTo: document.body,
    })

    await wrapper.find('button.vme-toolbar-btn').trigger('click')
    expect(wrapper.find('.vme-link-remove-btn').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows active state when cursor is on a link', async () => {
    editor.commands.selectAll()
    editor.chain().focus().setLink({ href: 'https://example.com' }).run()
    await tick()

    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
    })
    await tick()

    expect(wrapper.find('button.vme-toolbar-btn').classes()).toContain('is-active')
  })

  it('closes popover on click outside', async () => {
    const wrapper = mount(LinkToolbarButton, {
      props: { editor },
      attachTo: document.body,
    })

    await wrapper.find('button.vme-toolbar-btn').trigger('click')
    expect(wrapper.find('.vme-link-popover').exists()).toBe(true)

    // Simulate click outside
    const outsideEvent = new MouseEvent('mousedown', { bubbles: true })
    document.body.dispatchEvent(outsideEvent)
    await tick()

    expect(wrapper.find('.vme-link-popover').exists()).toBe(false)
    wrapper.unmount()
  })
})
