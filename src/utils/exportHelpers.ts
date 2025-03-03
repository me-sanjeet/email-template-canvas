
import { CanvasElement, ElementStyle } from '@/context/EditorContext';

// Convert style object to inline CSS string
export const convertStyleToInline = (style: ElementStyle): string => {
  return Object.entries(style)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${value};`;
    })
    .join(' ');
};

// Generate HTML for an element
export const elementToHtml = (element: CanvasElement): string => {
  const styleString = convertStyleToInline(element.style);
  
  switch (element.type) {
    case 'box':
      return `<div style="${styleString}"></div>`;
    case 'text':
      return `<p style="${styleString}">${element.content}</p>`;
    case 'heading':
      return `<h2 style="${styleString}">${element.content}</h2>`;
    case 'image':
      return `<img src="${element.content}" alt="Image" style="${styleString}" />`;
    case 'button':
      return `<button style="${styleString}">${element.content}</button>`;
    case 'divider':
      return `<hr style="${styleString}" />`;
    default:
      return '';
  }
};

// Generate full HTML document
export const generateEmailHtml = (elements: CanvasElement[]): string => {
  // Sort elements by position for better layout
  const sortedElements = [...elements].sort((a, b) => {
    // Sort by Y position first, then X position
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.x - b.x;
  });

  const elementsHtml = sortedElements.map(elementToHtml).join('\n  ');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
    <tr>
      <td>
        ${elementsHtml}
      </td>
    </tr>
  </table>
</body>
</html>`;
};
