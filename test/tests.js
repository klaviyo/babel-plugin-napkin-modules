import assert from 'assert';
import { transform as babelTransform } from '@babel/core';

const pluginOptions = {
  modules: {
    moment: '*',
    ethers: '1.0.1'
  }
};

function transform(code, transformOptions = {}) {
  return babelTransform(code, {
    presets: [['@babel/preset-env', transformOptions]],
    plugins: [['./index', pluginOptions]]
  }).code;
}

describe('es6', function () {
  const es6Option = { modules: false }

  describe('import transformations', function () {
    it('should handle imports', function () {
      const code = "import moment from 'moment'; import ethers from 'ethers'; console.log(moment.now());";
      assert.equal(transform(code, es6Option), "import moment from \"moment\";\nimport ethers from \"ethers-1.0.1\";\nconsole.log(moment.now());");
    });

    it('should error when a module is not included in the object', function () {
      const code = "import moment from 'moment'; import ethers from 'ethers'; import notamodule from 'notamodule'; console.log(moment.now());";
      assert.throws(() => { transform(code, es6Option) }, Error, 'babel-plugin-napkin-modules: notamodule not found');
    });
  });

  describe('call expression transformations', function () {
    it('should handle requires without affecting other call expressions', function () {
      const code = "const moment = require('moment'); const ethers = require('ethers'); console.log(moment.now());";
      assert.equal(transform(code, es6Option), "var moment = require(\"moment\");\n\nvar ethers = require(\"ethers-1.0.1\");\n\nconsole.log(moment.now());");
    });

    it('should error when a module is not included in the object', function () {
      const code = "const moment = require('moment'); const ethers = require('ethers'); const notamodule = require('notamodule'); console.log(moment.now());";
      assert.throws(() => { transform(code, es6Option) }, Error, 'babel-plugin-napkin-modules: notamodule not found');
    });
  });
});

describe('commonjs', function () {
  describe('import transformations', function () {
    it('should handle imports', function () {
      const code = "import moment from 'moment'; import ethers from 'ethers'; console.log(moment.now());";
      assert.equal(transform(code), "\"use strict\";\n\nvar _moment = _interopRequireDefault(require(\"moment\"));\n\nvar _ethers = _interopRequireDefault(require(\"ethers-1.0.1\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\nconsole.log(_moment[\"default\"].now());");
    });

    it('should error when a module is not included in the object', function () {
      const code = "import moment from 'moment'; import ethers from 'ethers'; import notamodule from 'notamodule'; console.log(moment.now());";
      assert.throws(() => { transform(code) }, Error, 'babel-plugin-napkin-modules: notamodule not found');
    });
  });
  
  describe('call expression transformations', function () {
    it('should handle requires without affecting other call expressions', function () {
      const code = "const moment = require('moment'); const ethers = require('ethers'); console.log(moment.now());";
      assert.equal(transform(code), "\"use strict\";\n\nvar moment = require(\"moment\");\n\nvar ethers = require(\"ethers-1.0.1\");\n\nconsole.log(moment.now());");
    });

    it('should error when a module is not included in the object', function () {
      const code = "const moment = require('moment'); const ethers = require('ethers'); const notamodule = require('notamodule'); console.log(moment.now());";
      assert.throws(() => { transform(code) }, Error, 'babel-plugin-napkin-modules: notamodule not found');
    });
  });
});
