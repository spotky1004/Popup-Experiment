/**
 * @template {*} T
 * @param {*} target 
 * @param {T} source
 * @returns {T} 
 */
export default function typeEqualize(target, source) {
  if (source === null) {
    target = null;
  } else if (Array.isArray(source)) {
    if (typeof target === "undefined") target = Array(source.length).fill();
    if (!Array.isArray(target)) target = [];
    for (let i = 0; i < Math.max(target.length, source.length); i++) {
      target[i] = typeEqualize(target[i], source[Math.min(source.length-1, i)]);
    }
  } else if (typeof source === "object") {
    if (typeof target === "undefined") target = Object.fromEntries(Object.keys(source).map(v => [v, undefined]));
    if (typeof target !== "object") target = {};

    const keys = [...new Set([...Object.keys(target), ...Object.keys(source)])];
    const sourceType = source[Object.keys(source)[0]];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      target[key] = typeEqualize(target[key], source[key] ?? sourceType);
    }
  } else if (typeof source === "undefined") {
    target = target;
  } else {
    target = source.constructor(target ?? source);
  }

  return target;
}
