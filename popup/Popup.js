/**
 * @param {() => boolean} fn 
 */
async function waitFor(fn) {
  await new Promise((res) => {
    const intervalID = setInterval(() => {
      if (fn()) {
        clearInterval(intervalID);
        res();
      }
    });
  });
  return true;
}



export const TICK_RATE = Math.floor(1000 / 60);

/**
 * @typedef PopupConfig 
 * @prop {number} x 
 * @prop {number} y 
 * @prop {number} width 
 * @prop {number} height 
 * @prop {boolean} stopOnParentBlur 
 * @prop {boolean} dragableX 
 * @prop {boolean} dragableY 
 * @prop {boolean} resizableWidth 
 * @prop {boolean} resizableHeight 
 * @prop {boolean} reopenOnClose  
 * @prop {boolean} noFullscreen remove a lot of bugs
 * @prop {number} focusLevel 0: no auto focus, 1: focus if hidden, 2: always focus 
 */
/** @type {PopupConfig} */
export const defaultConfig = {
  x: 100,
  y: 160,
  width: 320,
  height: 200,
  stopOnParentBlur: true,
  dragableX: true,
  dragableY: true,
  resizableWidth : true,
  resizableHeight: true,
  reopenOnClose: false,
  noFullscreen: true,
  focusLevel: 0,
};

/**
 * @typedef {{ [K: string]: any }} VariableSpace 
 */
/**
 * @template {VariableSpace} T 
 * @typedef {(vars: T) => string} ContentGenerator 
 */

/**
 * @template {VariableSpace} T var type
 */
export default class Popup {

  /** @type {Window} */
  #window = null;
  /** @type {ContentGenerator<T>} */
  #contentGenerator = vars => "";
  #x = 100;
  #y = 160;
  #width = 320;
  #height = 200;
  /** @type {PopupConfig} */
  config = {...defaultConfig};
  /** @type {number?} */
  #loopIntervalID = null;
  /** @type {T} */
  #variableSpace = {};
  #isResume = false;

  /**
   * @param {ContentGenerator<T>} contentGenerator 
   * @param {PopupConfig} config 
   * @param {T} variables 
   */
  constructor(contentGenerator, config, variables = {}) {
    config = {...config};
    console.log(config);
    if ("x" in config) {
      this.#x = config.x;
      delete config.x;
    }
    if ("y" in config) {
      this.#y = config.y;
      delete config.y;
    }
    if ("width" in config) {
      this.#width = config.width;
      delete config.width;
    }
    if ("height" in config) {
      this.#height = config.height;
      delete config.height;
    }
    console.log(config);

    this.#contentGenerator = contentGenerator;
    this.config = {...this.config, ...config};
    this.#variableSpace = variables;

    this.openNewWindow(contentGenerator);
  }

  get window() {
    return this.#window;
  }

  get document() {
    return this.#window.document;
  }

  get width() {
    return this.#width;
  }
  set width(value) {
    this.#width = value;
    this.#window.resizeTo(this.#width, this.#height);
  }

  get height() {
    return this.#height;
  }
  set height(value) {
    this.#height = value;
    this.#window.resizeTo(this.#width, this.#height);
  }

  get x() {
    return this.#x;
  }
  set x(value) {
    this.#x = value;
    this.#window.moveTo(this.#x, this.#y);
  }

  get y() {
    return this.#y;
  }
  set y(value) {
    this.#y = value;
    this.#window.moveTo(this.#x, this.#y);
  }



  async openNewWindow() {
    this.closeWindow();

    await waitFor(() => !this.config.stopOnParentBlur || !document.hidden);
    this.#isResume = false;

    this.#window = window.open("", "", `width=0, height=0, left=0, top=0`);
    this.#window["vars"] = this.#variableSpace;
    this.#window["isNotReloaded"] = true;
    this.#window.moveTo(this.#x, this.#y);
    this.#window.resizeTo(this.#width, this.#height);

    const subDoc = this.#window.document;
    subDoc.write(this.#contentGenerator(this.#variableSpace));

    this.#window.addEventListener("blur", () => {
      if (this.config.focusLevel === 2) this.#window.focus();
    });
    window.addEventListener("blur", () => {
      if (this.config.stopOnParentBlur && document.hidden) {
        this.#isResume = true;
        this.closeWindow(false);
      }
    });
    window.addEventListener("beforeunload", () => {
      this.closeWindow();
    });

    this.#loopIntervalID = setInterval(() => {
      const curX = this.#window.screenX;
      const curY = this.#window.screenY;
      const curWidth = this.#window.outerWidth;
      const curHeight = this.#window.outerHeight;

      if (
        (
          this.config.noFullscreen &&
          window.screen.width === curWidth &&
          window.screen.height === curHeight
        ) ||
        (
          !this.#window.isNotReloaded
        )
      ) {
        this.#isResume = true;
        this.openNewWindow();
        return;
      }

      if (this.config.stopOnParentBlur && document.hidden) {
        this.#isResume = true;
        this.closeWindow(false);
        return;
      }

      if (this.#window.closed) {
        if (this.#isResume || this.config.reopenOnClose) this.openNewWindow();
        else this.closeWindow();
        return;
      }

      if (this.#window.screenTop < 0 && this.#window.screenY < 0) {
        this.#isResume = true;
        this.openNewWindow();
        return;
      }

      if (
        this.config.focusLevel === 2 ||
        (
          this.config.focusLevel === 1 &&
          subDoc.hidden
        )
      ) this.#window.focus();

      let forceMove = false;
      let forceResize = false;
      if (this.#x !== curX) {
        if (this.config.dragableX) this.#x = curX;
        else forceMove = true;
      }
      if (this.#y !== curY) {
        if (this.config.dragableY) this.#y = curY;
        else forceMove = true;
      }
      if (this.#width !== curWidth) {
        if (this.config.resizableWidth) this.#width = curWidth;
        else forceResize = true;
      }
      if (this.#height !== curHeight) {
        if (this.config.resizableHeight) this.#height = curHeight;
        else forceResize = true;
      }
      if (forceMove) this.#window.moveTo(this.#x, this.#y);
      if (forceResize) this.#window.resizeTo(this.#width, this.#height);
    }, TICK_RATE);
  }

  closeWindow(endLoop = true) {
    if (this.#loopIntervalID !== null && endLoop) {
      clearInterval(this.#loopIntervalID);
    }

    if (
      this.#window !== null &&
      !this.#window.closed
    ) {
      this.#window.close();
      return true;
    }
  }

  /**
   * @param {keyof T} name 
   * @param {T[keyof T]} value 
   */
  setVar(name, value) {
    this.#variableSpace[name] = value;
  }

  /**
   * @param {keyof T} name 
   */
  getVar(name) {
    return this.#variableSpace[name];
  }

  isClosed() {
    return this.#window.closed;
  }
}
