import { importDeclaration, stringLiteral, isStringLiteral, callExpression } from '@babel/types';

function err(msg) {
  throw new Error('babel-plugin-napkin-modules: ' + msg);
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
    err(`${moduleName} not found`);
  }
}

export default function () {
  return {
    visitor: {
      ImportDeclaration: function (path, state) {
        const specifiers = path.node.specifiers;
        const moduleName = path.node.source.value;
        const modules = state.opts.modules || {}; // passed in via plugin options -- an object of modules to versions, where '*' represents 'latest'
        const newModuleName = alreadyTransformed(modules, moduleName) ? moduleName : transformModule(modules, moduleName);
        const newImport = importDeclaration(specifiers, stringLiteral(newModuleName));
        
        path.replaceWith(newImport);
        path.skip();
      },
      CallExpression: function (path, state) {
        const callee = path.node.callee;
        const args = path.node.arguments || [];
        
        if (callee.name == 'require' && args.length == 1 && isStringLiteral(args[0])) {
          const modules = state.opts.modules || {}; // passed in via plugin options -- an object of modules to versions, where '*' represents 'latest'
          const moduleName = args[0].value;
          const newModuleName = alreadyTransformed(modules, moduleName) ? moduleName : transformModule(modules, moduleName);
          const newCallExpression = callExpression(callee, [stringLiteral(newModuleName)]);
          
          path.replaceWith(newCallExpression);
          path.skip();
        }
      }
    }
  }
}
