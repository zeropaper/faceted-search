var SearchResults   = require('./results');
var View            = require('ampersand-view');



var SearchResult = View.extend({
  autoRender: true,
  template: '<div><div class="score"></div><a class="label"></a></div>',

  bindings: {
    'model.label': [
      {
        type: 'text',
        selector: '.label'
      },
      {
        type: 'attribute',
        name: 'title'
      }
    ],
    'model.value': {
      type: 'attribute',
      name: 'href',
      selector: '.label'
    },
    'model.score': {
      type: 'text',
      selector: '.score'
    },
    'model.focused': {
      type: 'booleanClass',
      name: 'focused'
    }
  }
});


module.exports = View.extend({
  autoRender: true,

  results: null,

  facets: null,

  template: [
    '<div class="faceted-search">',
      '<div class="options"></div>',
      '<div>',
        '<input class="form-control" placeholder="Search" type="search" />',
      '</div>',
      '<div class="results">',
      '</div>',
    '</div>'
  ].join('\n'),

  events: {
    'keyup input': 'searchKeyup',
    'keydown input': 'searchKeydown'
  },

  initialize: function (options) {
    options = options || {};
    this.results = new SearchResults();
    this.prepareResult = options.prepareResult || function () {};
  },

  searchKeydown: function (evt) {
    if (evt.keyCode === 13) {
      if (this.results.length) {
        var href = this.results.at(this.results.indexPos).value;
        location.href = href;
      }
      evt.preventDefault();
    }
    else if (evt.keyCode === 40) {
      this.results.setFocused(this.results.next());
      evt.preventDefault();
    }
    else if (evt.keyCode === 38) {
      this.results.setFocused(this.results.prev());
      evt.preventDefault();
    }
  },

  searchKeyup: function (evt) {
    if ([13, 40, 38].indexOf(evt.keyCode) < 0) {
      this.search();
    }
  },

  searchInputExp: /([^\s]+:[\s]*[^\s]+|[^\s]+)/g,

  search: function () {
    if (this.inputEl.value === this.value) {
      return this;
    }

    this.value = this.inputEl.value;
    if (!this.value) {
      this.results.reset([]);
      return this;
    }

    var searches = (this.value.match(this.searchInputExp) || []).map(function (search) {
      search = search.split(': ');

      return {
        type: search.length > 1 ? search[0] : 'exp',
        target: 'filepath',
        value: search.length === 1 ? search[0] : search.slice(1).join(': ')
      };
    });

    var found = [];
    var prepare = this.prepareResult;
    this.collection.forEach(function (model) {
      if (model.isDir) {
        return;
      }
      var score = 0;

      searches.forEach(function (search) {
        switch (search.type) {
          case 'exp':
            score = score + (model[search.target].split(search.value).length - 1);
            break;

          case 'tag':
            score = score + model.tags.filter(function (tag) {
              return tag.name === search.value;
            }).length;
            break;
        }
      });

      if (score) {
        found.push(prepare({
          score: score,
          label: model.filepath,
          value: model.fileurl
        }));
      }
    });

    this.results.reset(found).sort();
    this.resultsEl.setAttribute('count', found.length);
    return this;
  },

  render: function () {
    this.renderWithTemplate();

    this.cacheElements({
      optionsEl: '.options',
      resultsEl: '.results',
      inputEl: 'input'
    });

    this.renderCollection(this.results, SearchResult, this.resultsEl);
    this.resultsEl.setAttribute('count', 0);

    return this;
  }
});
