import rtlCSSJS from 'rtl-css-js';

import { LTR_SELECTOR, RTL_SELECTOR } from './withRTLExtension';

function separateDirectionalStyles(originalStyles, autoRTLStyles) {
  const sharedStyles = {};
  const ltrStyles = { ...originalStyles };
  const rtlStyles = {};

  let hasRTLStyles = false;
  Object.entries(autoRTLStyles)
    .forEach(([key, value]) => {
      if (value === originalStyles[key]) {
        delete ltrStyles[key];
        sharedStyles[key] = value;
        return;
      }

      if (value && typeof value === 'object') {
        delete ltrStyles[key];
        // In some cases (pseudoselectors, matchmedia queries, etc.), the style
        // value may be an object, and we need to recurse.
        const recursiveStyles = separateDirectionalStyles(originalStyles[key], value);

        if (recursiveStyles != null) {
          hasRTLStyles = true;
          const {
            sharedStyles: recursiveSharedStyles,
            ltrStyles: recursiveLtrStyles,
            rtlStyles: recursiveRtlStyles,
          } = recursiveStyles;

          sharedStyles[key] = recursiveSharedStyles;
          ltrStyles[key] = recursiveLtrStyles;
          rtlStyles[key] = recursiveRtlStyles;
        } else {
          sharedStyles[key] = value;
        }
      } else if (value != null) {
        hasRTLStyles = true;
        rtlStyles[key] = value;
      }
    });

  if (!hasRTLStyles) return null;

  return { sharedStyles, ltrStyles, rtlStyles };
}

export default function generateDirectionalStyles(originalStyles) {
  const directionalStyles = separateDirectionalStyles(originalStyles, rtlCSSJS(originalStyles));
  if (!directionalStyles) return null;

  const { sharedStyles, ltrStyles, rtlStyles } = directionalStyles;
  return {
    ...sharedStyles,
    [LTR_SELECTOR]: ltrStyles,
    [RTL_SELECTOR]: rtlStyles,
  };
}
