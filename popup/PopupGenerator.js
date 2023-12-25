import Popup, { defaultConfig as realDefaultConfig } from "./Popup.js";
import typeEqualize from "../util/typeEqualize.js";

/**
 * @template {import("./Popup.js").VariableSpace} T 
 */
export default class PopupGenerator {
  /** @type {import("./Popup.js").ContentGenerator<T>} */
  contentGenerator = () => {};
  /** @type {import("./Popup.js").PopupConfig} */
  defaultConfig = {};
  /** @type {T} */
  defaultVars = {};
  
  /**
   * @param {import("./Popup.js").ContentGenerator<T>} contentGenerator 
   * @param {import("./Popup.js").PopupConfig} defaultConfig 
   * @param {T} defaultVars 
   */
  constructor(contentGenerator, defaultConfig, defaultVars) {
    this.contentGenerator = contentGenerator;
    this.defaultConfig = defaultConfig;
    this.defaultVars = defaultVars;
  }

  /**
   * @param {import("./Popup.js").PopupConfig} config 
   * @param {T} vars 
   */
  create(config, vars) {
    config = typeEqualize(typeEqualize(typeEqualize(-1, config), this.defaultConfig), realDefaultConfig);
    vars = typeEqualize(typeEqualize(-1, vars), this.defaultVars);

    return new Popup(this.contentGenerator, config, vars);
  }
}
