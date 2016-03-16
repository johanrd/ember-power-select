import Ember from 'ember';
import layout from '../../templates/components/power-select/options';

const { get } = Ember;

export default Ember.Component.extend({
  isTouchDevice: (!!self.window && 'ontouchstart' in self.window),
  layout: layout,
  tagName: 'ul',
  attributeBindings: ['role', 'aria-controls'],
  role: 'listbox',

  // Lifecycle hooks
  init() {
    this._super(...arguments);
    this._touchMoveHandler = this._touchMoveHandler.bind(this);
  },

  didInsertElement() {
    this._super(...arguments);
    if (this.get('role') === 'group') { return; }
    let chooseOption = e => {
      if (e.target.dataset.optionIndex) {
        this.get('select.actions.choose')(this._optionFromIndex(e.target.dataset.optionIndex));
      }
    };
    this.element.addEventListener('mousedown', chooseOption);
    this.element.addEventListener('mouseover', e => {
      if (e.target.dataset.optionIndex) {
        this.get('select.actions.highlight')(this._optionFromIndex(e.target.dataset.optionIndex));
      }
    });

    if (!this.get('isTouchDevice')) { return; }

    // Add touch event handlers to detect taps
    this.element.addEventListener('touchstart', () => {
      this.element.addEventListener('touchmove', this._touchMoveHandler);
    });
    this.element.addEventListener('touchend', e => {
      e.preventDefault();
      if (this.hasMoved) {
        this.hasMoved = false;
        return;
      }
      chooseOption(e);
    });

  },

  // Methods
  _touchMoveHandler() {
    this.hasMoved = true;
    this.element.removeEventListener('touchmove', this._touchMoveHandler);
  },

  _optionFromIndex(index) {
    let parts = index.split('.');
    let options = this.get('options');
    let option = get(options, parts[0]);
    for (let i = 1; i < parts.length; i++) {
      option = get(option.options, parts[i]);
    }
    return option;
  },

});
