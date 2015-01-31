'use strict';
/* jshint node: true, browser: true */
/* global require: false, describe: false, xdescribe: false, it: false */
var expect = require('expect.js');

function err(label) {
  return function (err) {
    console.info(label, err.stack);
  };
}

describe('SearchResults', function () {
  var SearchResults;

  it('loads', function () {
    expect(function () {
      SearchResults = require('./../index');
    }).not.to.throwError(err('loading SearchResults'));
  });


  describe('collection', function () {
  });
});
