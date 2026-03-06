import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MarkdownEditor from '../MarkdownEditor.vue'

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
