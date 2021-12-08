import assert from 'assert';
import { transform as babelTransform } from '@babel/core';

const pluginOptions = {
  modules: {
    moment: '*',
    ethers: '1.0.1'
  }
}

function transform(code) {
  return babelTransform(code, {
    presets: [['@babel/preset-env', { modules: false }]],
    plugins: [['./index', pluginOptions]]
  }).code;
}

describe('import transformations', function () {
  it('should handle imports', function () {
    const code = "import moment from 'moment'; import ethers from 'ethers'; console.log(moment.now());";
    assert.equal(transform(code), "import moment from \"moment\";\nimport ethers from \"ethers-1.0.1\";\nconsole.log(moment.now());");
  });

  it('should error when a module is not included in the object', function () {
    const code = "import moment from 'moment'; import ethers from 'ethers'; import notamodule from 'notamodule'; console.log(moment.now());";
    assert.throws(() => { transform(code) }, Error, 'babel-plugin-napkin-modules: notamodule not found');
  });
});

describe('call expression transformations', function () {
  it('should handle requires without affecting other call expressions', function () {
    const code = "const moment = require('moment'); const ethers = require('ethers'); console.log(moment.now());";
    assert.equal(transform(code), "var moment = require(\"moment\");\n\nvar ethers = require(\"ethers-1.0.1\");\n\nconsole.log(moment.now());");
  });

  it('should error when a module is not included in the object', function () {
    const code = "const moment = require('moment'); const ethers = require('ethers'); const notamodule = require('notamodule'); console.log(moment.now());";
    assert.throws(() => { transform(code) }, Error, 'babel-plugin-napkin-modules: notamodule not found');
  });
});
