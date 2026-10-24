// Mermaid is readable source without JavaScript and renders lazily in the reader.
export default function remarkMermaid() {
  return (tree, file) => {
    function walk(node) {
      if (node.type === 'code' && node.lang === 'mermaid') {
        const source = node.value;
        if (file.path?.endsWith('.mdx')) {
          // MDX expects JSX AST, rather than Markdown's raw HTML nodes.
          Object.assign(node, {
            type: 'mdxJsxFlowElement',
            name: 'pre',
            attributes: [
              { type: 'mdxJsxAttribute', name: 'class', value: 'mermaid' },
              { type: 'mdxJsxAttribute', name: 'aria-label', value: 'Diagram' },
            ],
            children: [{ type: 'text', value: source }],
          });
        } else {
          const escaped = source
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
          node.type = 'html';
          node.value = `<pre class="mermaid" aria-label="Diagram">${escaped}</pre>`;
        }
      }
      if (node.children) node.children.forEach(walk);
    }
    walk(tree);
  };
}
