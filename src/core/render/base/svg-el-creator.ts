export default class SvgElCreator {

  static newPath(
    path: string,
    color: string = '#888888',
    stroke: string = 'none'
  ): SVGPathElement {
    return this.newSvgElement('path', {
      d: path,
      fill: color,
      stroke: stroke,
      'fill-rule': 'evenodd',
    }) as SVGPathElement;
  }

  static newText(
    text: string,
    x: number, y: number,
    fontSize: number = 14,
    color: string = '#ffffff',
  ): SVGTextElement {
    const el = this.newSvgElement('text', {
      x: x.toString(),
      y: y.toString(),
      fill: color,
      'font-size': fontSize + 'px',
      'dominant-baseline': 'text-before-edge'
    }) as SVGTextElement;
    el.textContent = text;
    return el;
  }

  static newRect(
    x: number = 0,
    y: number = 0,
    width: number | string | null = null,
    height: number | string | null = null,
    color: string = '#888888',
    radius: number = 0
  ): SVGRectElement{
    const el = this.newSvgElement('rect', {
      x: x.toString(),
      y: y.toString(),
      fill: color,
      stroke: 'none',
    }) as SVGRectElement;
    if (width != null) el.setAttribute('width', width.toString());
    if (height != null) el.setAttribute('height', height.toString());
    if (radius > 0) {
      el.setAttribute('rx', radius.toString());
      el.setAttribute('ry', radius.toString());
    }
    return el;
  }

  static newGroup(
    attributes: { [key: string]: string }
  ): SVGGElement {
    return this.newSvgElement('g', attributes) as SVGGElement;
  }

  static newSvgElement(tag: string, attributes: { [key: string]: string }): SVGElement {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const key in attributes) {
      el.setAttribute(key, attributes[key]);
    }
    return el;
  }
}
