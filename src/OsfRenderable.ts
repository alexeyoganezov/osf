import { OsfObservable, IOsfObservable } from './internal';

export interface IOsfRenderable extends IOsfObservable {
  el?: Element
  init(): void
  remove(): void
}

/**
 * An entity that creates or uses DOM element and has create/remove logic with lifecycle methods.
 */
export abstract class OsfRenderable extends OsfObservable implements IOsfRenderable {
  /**
   * Root HTML element of a subtree used by the class.
   */
  public el?: Element;

  /**
   * A flag to prevent repetitive this.beforeInit() call
   */
  protected wasBeforeInitCalled: boolean = false;

  /**
   * A flag to prevent repetitive this.afterInit() call
   */
  protected wasAfterInitCalled: boolean = false;

  /**
   * Perform additional actions before this.init() call.
   * Meant to be extended by child classes.
   */
  protected beforeInit(): void {

  }

  /**
   * Process this.beforeInit() call.
   */
  protected async handleBeforeInit(): Promise<void> {
    if (!this.wasBeforeInitCalled) {
      await this.beforeInit();
      this.wasBeforeInitCalled = true;
    }
  }

  /**
   * Initialization logic.
   */
  public abstract init(): void;

  /**
   * Perform additional actions after this.init() call.
   * Meant to be extended by child classes.
   */
  protected afterInit(): void {

  }

  /**
   * Process this.afterInit() call.
   */
  protected async handleAfterInit(): Promise<void> {
    if (!this.wasAfterInitCalled) {
      await this.afterInit();
      this.wasAfterInitCalled = true;
    }
  }

  /**
   * Perform additional actions before this.remove() call.
   * Meant to be extended by child classes.
   */
  protected beforeRemove(): void {

  }

  /**
   * Remove managed element from DOM
   */
  public abstract remove(): void;

  /**
   * Perform additional actions after this.remove() call.
   * Meant to be extended by child classes.
   */
  protected afterRemove(): void {

  }
}