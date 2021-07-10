/**
 * @param {(Element|null)} e
 * @param {(null|string)=} t
 * @return {(CSSStyleDeclaration|null)}
 */
function getComputedStyle(element) {
  this.el = element;

  this.getPropertyValue = function(prop) {
    /** @type {RegExp} */
    // eslint-disable-next-line no-useless-escape
    const regExp = /(\-([a-z]){1})/g;
    let updatedProp = prop === 'float' ? 'styleFloat' : prop;

    if (regExp.test(updatedProp)) {
      updatedProp = updatedProp.replace(regExp, function(match, ...parts) {
        return parts[1].toUpperCase();
      });
    }
    return element?.currentStyle?.[updatedProp]
      ? element.currentStyle[updatedProp]
      : null;
  };
  return this;
}

module.exports = getComputedStyle;
