/* eslint-disable import/no-extraneous-dependencies */
const { parseHTML } = require('linkedom');
const { LegacyFakeTimers, ModernFakeTimers } = require('@jest/fake-timers');
const { installCommonGlobals } = require('jest-util');
const { ModuleMocker } = require('jest-mock');
const VM = require('vm');
const getRootNode = require('./get-root-node-polyfill');
const getComputedStyle = require('./get-computed-style-polyfill');

/**
 * source:
 *  https://gist.github.com/stephenh/056a500708243e2ea43246c28d19d3ae
 * */

class LinkedomEnvironment {
  constructor(config, options) {
    const window = parseHTML(
      '<!doctype html><html lang="en"><head /><body /></html>',
    );

    // linkedom don't define window.location
    if (!window.location) {
      Object.defineProperty(window, 'location', {
        value: { protocol: 'http' },
      });
    }

    if (!window.getComputedStyle) {
      Object.defineProperty(window, 'getComputedStyle', {
        value: getComputedStyle,
      });
    }

    if (!window.Node.getRootNode) {
      Object.defineProperty(window.Node.prototype, 'getRootNode', {
        enumerable: false,
        configurable: false,
        value: getRootNode,
      });
    }

    // not ideal but Axe needs it in an instanceof test and we just want to avoid an error for now
    if (!window.NamedNodeMap) {
      Object.defineProperty(window, 'NamedNodeMap', {
        value: function NamedNodeMap() {
          throw new Error('Illegal constructor');
        },
      });
    }

    this.global = window.document.defaultView;
    this.moduleMocker = new ModuleMocker(this.global);
    VM.createContext(this.global);

    // Functions are not an instanceof the "Function" class in the VM context, so therefore we set it to the used "Function" class.
    VM.runInContext('window.Function = (() => {}).constructor;', this.global);

    // Node's error-message stack size is limited at 10, but it's pretty useful
    // to see more than that when a test fails.
    this.global.Error.stackTraceLimit = 100;

    if (!this.global) {
      throw new Error('LinkeDOM did not return a Window object');
    }
    installCommonGlobals(this.global, config.globals);

    // Removes window.fetch() as it should not be used in a test environment.
    delete this.global.fetch;
    delete this.global.window.fetch;

    if (options.console) {
      this.global.console = options.console;
      this.global.window.console = options.console;
    }

    this.fakeTimers = new LegacyFakeTimers({
      config,
      global: this.global,
      moduleMocker: this.moduleMocker,
      timerConfig: {
        idToRef: id => id,
        refToId: ref => ref,
      },
    });

    this.fakeTimersModern = new ModernFakeTimers({
      config,
      global: this.global,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  async setup() {
    // do nothing there apparently
  }

  async teardown() {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }
    if (this.fakeTimersModern) {
      this.fakeTimersModern.dispose();
    }
    if (this.global) {
      // Dispose "document" to prevent "load" event from triggering.
      Object.defineProperty(this.global, 'document', { value: null });
      if (this.global.close) {
        this.global.close();
      }
    }
    this.errorEventListener = null;
    this.global = null;
    this.moduleMocker = null;
    this.fakeTimers = null;
    this.fakeTimersModern = null;
  }

  /**
   * Runs a script.
   *
   * @param script Script.
   * @returns Result.
   */
  runScript(script) {
    return script.runInContext(this.global);
  }

  getVmContext() {
    return this.global;
  }
}

module.exports = LinkedomEnvironment;
