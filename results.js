var State           = require('ampersand-state');
var Collection      = require('ampersand-collection');

module.exports = Collection.extend({
  comparator: function (a, b) {
    return a.score < b.score;
  },

  model: State.extend({
    props: {
      score: ['number', false, 0],
      label: 'string',
      value: 'string'
    },

    session: {
      focused: 'boolean'
    },

    derived: {
      index: {
        deps: ['collection'],
        fn: function () {
          return this.collection.indexOf(this);
        }
      }
    }
  }),

  indexPos: 0,

  prev: function () {
    if (!this.length) {
      return false;
    }

    this.indexPos = this.indexPos - 1;

    if (this.indexPos < 0) {
      this.indexPos = this.length - 1;
    }
    return this.at(this.indexPos);
  },

  next: function () {
    if (!this.length) {
      return false;
    }

    this.indexPos = this.indexPos + 1;

    if (this.indexPos === this.length) {
      this.indexPos = 0;
    }
    return this.at(this.indexPos);
  },

  initialize: function () {
    this.on('reset', function (collection) {
      collection.index = 0;
      collection.setFocused(0);
    });
  },

  setFocused: function (focusedResult) {
    if (!isNaN(focusedResult)) {
      focusedResult = this.at(focusedResult);
    }

    this.forEach(function (result) {
      if (focusedResult.cid === result.cid) { return; }

      result.set({
        focused: false
      });
    });

    if (focusedResult && !focusedResult.focused) {
      focusedResult.focused = true;
    }

    return this;
  }
});
