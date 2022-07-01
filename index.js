import { importDeclaration, stringLiteral, isStringLiteral, callExpression } from '@babel/types';
import { NODE14_BUILTIN_MODULES } from './constants.js';

function err(msg) {
  throw new Error('Napkin Modules: ' + msg);
}

function alreadyTransformed(modules, moduleName) {
  const modulesList = Object.keys(modules).map((m) => transformModule(modules, m));
  return modulesList.includes(moduleName);
}

function transformModule(modules, moduleName) {
  if (modules[moduleName] == '*') {
    return moduleName;
  } else if (modules[moduleName]) {
    // otherwise append the version
    return `${moduleName}-${modules[moduleName]}`;
  } else {
    err(`${moduleName} is not installed.`);
  }
}

function getModuleNameAndPath(value) {
  if (!value) {
    err('Empty import or require statement.');
  }

  const splitValue = value.split('/');

  if (value.charAt(0) == '@') {
    return {
      moduleName: splitValue[0] + '/' + splitValue[1],
      modulePath: splitValue.slice(2)
    }
  } else {
    return {
      moduleName: splitValue[0],
      modulePath: splitValue.slice(1)
    }
  }
}

export default function () {
  return {
    visitor: {
      ImportDeclaration: function (path, state) {
        const specifiers = path.node.specifiers;
        const { moduleName, modulePath } = getModuleNameAndPath(path.node.source.value);
        const modules = Object.assign(state.opts.modules || {}, NODE14_BUILTIN_MODULES); // passed in via plugin options -- an object of modules to versions, where '*' represents 'latest'
        const newModuleName = alreadyTransformed(modules, moduleName) ? moduleName : transformModule(modules, moduleName);
        const newImport = importDeclaration(specifiers, stringLiteral([newModuleName, ...modulePath].join('/')));
        
        path.replaceWith(newImport);
        path.skip();
      },
      CallExpression: function (path, state) {
        const callee = path.node.callee;
        const args = path.node.arguments || [];
        
        if (callee.name == 'require' && args.length == 1 && isStringLiteral(args[0])) {
          const modules = Object.assign(state.opts.modules || {}, NODE14_BUILTIN_MODULES); // passed in via plugin options -- an object of modules to versions, where '*' represents 'latest'
          const { moduleName, modulePath } = getModuleNameAndPath(args[0].value);
          const newModuleName = alreadyTransformed(modules, moduleName) ? moduleName : transformModule(modules, moduleName);
          const newCallExpression = callExpression(callee, [stringLiteral([newModuleName, ...modulePath].join('/'))]);
          
          path.replaceWith(newCallExpression);
          path.skip();
        }
      }
    }
  }
}
