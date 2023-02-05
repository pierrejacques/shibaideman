export function isHTMLElement(candidate: any): candidate is HTMLElement {
  return candidate instanceof HTMLElement;
}

export function isSVGElement(candidate: any): candidate is SVGElement {
  return candidate instanceof SVGElement;
}
