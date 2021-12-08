import { importDeclaration, stringLiteral, isStringLiteral, callExpression } from '@babel/types';

function err(msg) {
  throw new Error('babel-plugin-napkin-modules: ' + msg);
}

function transformModule(modules, moduleName) {
  let name = moduleName;
  
  if (modules[moduleName] == '*') {
    // continue with the default import
  } else if (modules[moduleName]) {
    // otherwise append the version
    name = moduleName + `-${modules[moduleName]}`;
  } else {
    err(`${moduleName} not found`);
  }
  
  return name;
}

export default function () {
  return {
    visitor: {
      ImportDeclaration: function (path, state) {
        const specifiers = path.node.specifiers;
        const moduleName = path.node.source.value;
        const modules = state.opts.modules || {}; // passed in via plugin options -- an object of modules to versions, where '*' represents 'latest'
        const newModuleName = transformModule(modules, moduleName);
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
          const newModuleName = transformModule(modules, moduleName);
          const newCallExpression = callExpression(callee, [stringLiteral(newModuleName)]);
          
          path.replaceWith(newCallExpression);
          path.skip();
        }
      }
    }
  }
}
