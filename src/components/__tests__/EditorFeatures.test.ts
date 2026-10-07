import { mount, type VueWrapper } from '@vue/test-utils'
import type { Editor } from '@tiptap/vue-3'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import MarkdownEditor from '../MarkdownEditor.vue'

const tick = () => new Promise((r) => setTimeout(r, 50))

let mounted: VueWrapper[] = []

async function mountEditor(props: Record<string, unknown> = {}) {
  const wrapper = mount(MarkdownEditor, { attachTo: document.body, props })
  mounted.push(wrapper)
  await tick()

  return wrapper
}

function editorOf(wrapper: VueWrapper): Editor {
  return (wrapper.vm as unknown as { editor: Editor }).editor
}

function keydown(target: EventTarget, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  target.dispatchEvent(event)

  return event
}

afterEach(() => {
  mounted.forEach((wrapper) => wrapper.unmount())
  mounted = []
  document.body.innerHTML = ''
})

describe('toolbar layout', () => {
  it('places the link where the toolbar names it, and draws separators', async () => {
    const wrapper = await mountEditor({ toolbar: ['bold', 'link', '|', 'italic'] })
    const items = wrapper.findAll('.vme-toolbar > li')

    expect(items).toHaveLength(4)
    expect(items[1].find('.vme-link-popover-wrapper').exists()).toBe(true)
    expect(items[2].classes()).toContain('vme-toolbar-separator')
    expect(items[2].attributes('aria-hidden')).toBe('true')
  })

  it('still appends the link when the toolbar leaves it out', async () => {
    const wrapper = await mountEditor({ toolbar: ['bold'] })
    const items = wrapper.findAll('.vme-toolbar > li')

    expect(items[items.length - 1]?.find('.vme-link-popover-wrapper').exists()).toBe(true)
  })
})

describe('paragraph style menu', () => {
  const button = (wrapper: VueWrapper) => wrapper.get('.vme-heading-btn')

  it('names the style of the block under the caret', async () => {
    const wrapper = await mountEditor({
      toolbar: ['heading'],
      modelValue: '## Title\n\nBody',
    })

    editorOf(wrapper).commands.setTextSelection(2)
    await tick()

    expect(button(wrapper).attributes('aria-label')).toBe('Text style: Heading 2')
    expect(button(wrapper).find('i.ri-h-2').exists()).toBe(true)

    editorOf(wrapper).commands.setTextSelection(10)
    await tick()

    expect(button(wrapper).attributes('aria-label')).toBe('Text style: Normal text')
    expect(button(wrapper).find('i.ri-paragraph').exists()).toBe(true)
  })

  it('offers the levels asked for and sets the one chosen, keeping the caret', async () => {
    const values: string[] = []
    const wrapper = await mountEditor({
      toolbar: ['heading'],
      headingLevels: [1, 2, 3, 4, 5],
      modelValue: 'Body',
      'onUpdate:modelValue': (value: string) => values.push(value),
    })

    await button(wrapper).trigger('click')

    const rows = wrapper.findAll('[role="menuitemradio"]')

    expect(rows.map((row) => row.text())).toEqual([
      'Normal text',
      'Heading 1',
      'Heading 2',
      'Heading 3',
      'Heading 4',
      'Heading 5',
    ])
    expect(rows[0].attributes('aria-checked')).toBe('true')

    const press = new MouseEvent('pointerdown', { bubbles: true, cancelable: true })
    rows[4].element.dispatchEvent(press)
    await nextTick()

    expect(press.defaultPrevented).toBe(true)
    expect(values[values.length - 1]).toBe('#### Body')
    expect(wrapper.find('.vme-heading-menu').exists()).toBe(false)
  })

  it('opens leftwards when the window has no room to its right', async () => {
    const wrapper = await mountEditor({ toolbar: ['heading'] })
    const wrapperElement = wrapper.get('.vme-heading-wrapper').element as HTMLElement
    wrapperElement.getBoundingClientRect = () => ({ left: window.innerWidth - 40 }) as DOMRect

    await button(wrapper).trigger('click')

    expect(wrapper.get('.vme-heading-menu').classes()).toContain('vme-heading-menu--end')
  })

  it('speaks the language it is given', async () => {
    const wrapper = await mountEditor({
      toolbar: ['heading'],
      labels: {
        textStyle: 'Стиль текста',
        paragraph: 'Обычный текст',
        heading: (level: number) => `Заголовок ${level}`,
      },
    })

    await button(wrapper).trigger('click')

    expect(button(wrapper).attributes('aria-label')).toBe('Стиль текста: Обычный текст')
    expect(wrapper.findAll('[role="menuitemradio"]')[1].text()).toBe('Заголовок 1')
  })

  it('closes with Escape before anything else hears it', async () => {
    const wrapper = await mountEditor({ toolbar: ['heading'], fullscreenable: true })
    const outside: string[] = []
    const listen = (event: KeyboardEvent) => outside.push(event.key)

    document.addEventListener('keydown', listen)
    await wrapper.get('.vme-fullscreen-btn').trigger('click')
    await button(wrapper).trigger('click')

    const event = keydown(wrapper.get('.ProseMirror').element, 'Escape')
    await nextTick()

    // The menu closes; fullscreen stays for the next Escape.
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.find('.vme-heading-menu').exists()).toBe(false)
    expect(wrapper.get('.vme-editor').classes()).toContain('is-fullscreen')
    expect(outside).toEqual([])
    document.removeEventListener('keydown', listen)
  })
})

describe('fullscreen', () => {
  it('offers no button unless asked', async () => {
    const wrapper = await mountEditor()

    expect(wrapper.find('.vme-fullscreen-btn').exists()).toBe(false)
  })

  it('covers the window from the far end of the toolbar, and comes back', async () => {
    const wrapper = await mountEditor({ fullscreenable: true })
    const toggle = () => wrapper.get('.vme-fullscreen-btn')

    expect(wrapper.findAll('.vme-toolbar > li').slice(-1)[0]?.classes()).toContain('vme-toolbar-end')

    await toggle().trigger('click')

    expect(wrapper.get('.vme-editor').classes()).toContain('is-fullscreen')
    expect(toggle().attributes('aria-label')).toBe('Exit fullscreen')
    expect(wrapper.emitted('update:fullscreen')).toEqual([[true]])

    await toggle().trigger('click')

    expect(wrapper.get('.vme-editor').classes()).not.toContain('is-fullscreen')
    expect(toggle().attributes('aria-label')).toBe('Fullscreen')
  })

  // Fixed inside a transformed or filtered ancestor, the editor would
  // cover that ancestor rather than the window.
  it('lifts what would hold it inside an ancestor, and puts it back', async () => {
    const dialog = document.createElement('div')
    dialog.style.setProperty('transform', 'translateX(10px)')
    document.body.appendChild(dialog)

    const wrapper = mount(MarkdownEditor, { attachTo: dialog, props: { fullscreenable: true } })
    mounted.push(wrapper)
    await tick()

    await wrapper.get('.vme-fullscreen-btn').trigger('click')

    expect(dialog.style.getPropertyValue('transform')).toBe('none')

    await wrapper.get('.vme-fullscreen-btn').trigger('click')

    expect(dialog.style.getPropertyValue('transform')).toBe('translateX(10px)')
  })

  it('leaves with Escape from wherever the focus is, and stops the key there', async () => {
    const wrapper = await mountEditor({ fullscreenable: true })
    const outside: string[] = []
    const listen = (event: KeyboardEvent) => outside.push(event.key)

    document.addEventListener('keydown', listen)
    await wrapper.get('.vme-fullscreen-btn').trigger('click')

    const event = keydown(document.body, 'Escape')
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(outside).toEqual([])
    expect(wrapper.get('.vme-editor').classes()).not.toContain('is-fullscreen')
    document.removeEventListener('keydown', listen)
  })

  it('lets Escape through while not fullscreen', async () => {
    const wrapper = await mountEditor({ fullscreenable: true })

    const event = keydown(wrapper.get('.ProseMirror').element, 'Escape')

    expect(event.defaultPrevented).toBe(false)
  })
})

describe('default content styles', () => {
  it('styles a plain quote, and leaves one an extension dressed to it', async () => {
    const { readFileSync } = await import('node:fs')
    const sheet = readFileSync('src/styles/index.css', 'utf8')

    expect(sheet).toMatch(/\.vme-content \.ProseMirror blockquote:not\(\[class\]\) \{[^}]*border-left: var\(--vme-blockquote-border\);/u)
    expect(sheet).toMatch(/\.vme-content \.ProseMirror h1 \{ font-size: var\(--vme-h1-font-size\); \}/u)
  })
})

describe('the Markdown it gives back', () => {
  // Tiptap keeps an empty paragraph after a closing quote, serialized as
  // `&nbsp;`: the document would grow a line with every edit.
  it('never adds the empty paragraph Tiptap keeps after a closing block', async () => {
    const values: string[] = []
    const wrapper = await mountEditor({
      modelValue: 'Opening\n\n> A quote',
      'onUpdate:modelValue': (value: string) => values.push(value),
    })
    const editor = editorOf(wrapper)

    editor.commands.insertContentAt(1, 'X')
    await nextTick()

    expect(values[values.length - 1]).toBe('XOpening\n\n> A quote')
    expect(editor.getMarkdown()).not.toBe(values[values.length - 1])
  })

  it('exposes the Tiptap editor', async () => {
    const wrapper = await mountEditor({ modelValue: 'Hi' })

    expect(editorOf(wrapper).getMarkdown()).toBe('Hi')
  })
})
