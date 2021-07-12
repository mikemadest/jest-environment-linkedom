
/**
 * jest environment setting to use linkedom for rendering
 * 
 * source:
 * https://jestjs.io/docs/next/configuration#testenvironment-string
 *  https://gist.github.com/stephenh/056a500708243e2ea43246c28d19d3ae
 * */
const { parseHTML } = require("linkedom");
const NodeEnvironment = require("jest-environment-node");
const getRootNode = require("./get-root-node-polyfill");
const getComputedStyle = require("./get-computed-style-polyfill");

class LinkedomEnvironment extends NodeEnvironment {
  constructor(config, options) {
    super(config, options);

    const dom = parseHTML(
      '<!doctype html><html lang="en"><head /><body /></html>'
    );

    // add missing content
    if (!dom.location) {
      Object.defineProperty(dom, "location", {
        value: { protocol: "http" },
      });
    }

    if (!dom.getComputedStyle) {
      Object.defineProperty(dom, "getComputedStyle", {
        value: getComputedStyle,
      });
    }

    if (!dom.Node.getRootNode) {
      Object.defineProperty(dom.Node.prototype, "getRootNode", {
        enumerable: false,
        configurable: false,
        value: getRootNode,
      });
    }

    // not ideal but Axe needs it in an instanceof test and we just want to avoid an error for now
    if (!dom.NamedNodeMap) {
      Object.defineProperty(dom, "NamedNodeMap", {
        value: function NamedNodeMap() {
          throw new Error("Illegal constructor");
        },
      });
    }

    this.global.window = dom;
    this.global.document = dom.document;
    this.global.navigator = dom.navigator;
  }
}

module.exports = LinkedomEnvironment;
