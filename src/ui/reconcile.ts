// Preserve mounted controls, focus and pointer targets while updating changing content.
export function reconcile(target: Element, source: Element): void {
    for (const attr of Array.from(target.attributes)) {
        if (!source.hasAttribute(attr.name)) {
            target.removeAttribute(attr.name);
        }
    }
    for (const attr of Array.from(source.attributes)) {
        if (target.getAttribute(attr.name) !== attr.value) {
            target.setAttribute(attr.name, attr.value);
        }
    }
    if (target instanceof HTMLInputElement && source instanceof HTMLInputElement) {
        target.value = source.value;
    }
    const key = (node: Node) => node instanceof Element
        ? [
            'id', 'data-action', 'data-stage', 'data-quiz', 'data-place', 'data-select'
        ].map(a => node.getAttribute(a) ? a + ':' + node.getAttribute(a) : '').filter(Boolean).join('|') : '';
    let cursor = target.firstChild;
    for (const next of Array.from(source.childNodes)) {
        const identity = key(next);
        let current = cursor;
        if (identity) {
            current = Array.from(target.childNodes).find(n => key(n) === identity) ?? null;
        }
        if (!current || current.nodeType !== next.nodeType || current.nodeName !== next.nodeName || (key(current) !== identity)) {
            target.insertBefore(next.cloneNode(true), cursor);
            continue;
        }
        if (current !== cursor) {
            target.insertBefore(current, cursor);
        }
        if (current instanceof Element && next instanceof Element) {
            reconcile(current, next);
        }
        else if (current.nodeValue !== next.nodeValue) {
            current.nodeValue = next.nodeValue;
        }
        cursor = current.nextSibling;
    }
    while (cursor) {
        const next = cursor.nextSibling;
        target.removeChild(cursor);
        cursor = next;
    }
}

