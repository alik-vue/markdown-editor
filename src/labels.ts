/**
 * Every piece of text the editor draws itself. English by default; pass
 * `labels` to the editor to translate any of them.
 */
export interface EditorLabels {
    /** The paragraph style menu's name, read out with the current style. */
    textStyle: string;
    /** Plain text in the paragraph style menu. */
    paragraph: string;
    /** A heading in the paragraph style menu. */
    heading: (level: number) => string;
    fullscreen: string;
    exitFullscreen: string;
    linkUrl: string;
    removeLink: string;
}

export const defaultLabels: EditorLabels = {
    textStyle: 'Text style',
    paragraph: 'Normal text',
    heading: (level) => `Heading ${level}`,
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit fullscreen',
    linkUrl: 'Link URL',
    removeLink: 'Remove link',
};
