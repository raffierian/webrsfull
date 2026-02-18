import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS
 * Allows a safe subset of tags and attributes for rich text content
 */
export const sanitizeContent = (html) => {
    if (!html) return html;

    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            'img', 'h1', 'h2', 'span', 'div', 'u', 's', 'em', 'strong'
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            '*': ['style', 'class'],
            'img': ['src', 'alt', 'width', 'height', 'loading'],
            'a': ['href', 'name', 'target', 'rel']
        },
        allowedStyles: {
            '*': {
                // Allow safe styling properties
                'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/i, /^hsl\(/i],
                'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/i, /^hsl\(/i],
                'text-align': [/^left$/i, /^right$/i, /^center$/i, /^justify$/i],
                'font-size': [/^\d+(?:px|em|rem|%)$/i],
                'font-weight': [/^\d+$/i, /^bold$/i, /^normal$/i],
                'padding': [/^\d+(?:px|em|rem|%)$/i],
                'margin': [/^\d+(?:px|em|rem|%)$/i]
            }
        },
        // Transform links to add rel="noopener noreferrer" for security
        transformTags: {
            'a': sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' })
        }
    });
};
