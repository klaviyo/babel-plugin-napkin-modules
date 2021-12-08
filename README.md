# babel-plugin-napkin-modules

Transforms imports:

```javascript
import moment from 'moment';
import ethers from 'ethers';
const axios = require('axios');
```

into ones with versions if specified via config:

```javascript
import moment from 'moment';
import ethers from 'ethers-1.0.1';
const axios = require('axios-5.1.2');
```

## Installation

```
npm add babel-plugin-napkin-modules
```

## Usage

`.babelrc`:
```json
{
  "plugins": [
    ["napkin-modules", {
        "modules": {
            "moment": "*",
            "ethers": "1.0.1",
            "axios": "5.1.2"
        }
    }]
  ]
}
```

`transform()`:
```javascript
const pluginOptions = {
  modules: {
    moment: '*',
    ethers: '1.0.1',
    axios: '5.1.2'
  }
}

transform(code, {
  presets: [['@babel/preset-env', { modules: false }]],
  plugins: [['babel-plugin-napkin-modules', pluginOptions]]
}).code;
```

## Options

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `modules` | `object` | yes | `{}` | An object with all the modules and corresponding versions, with "*" to represent "latest" where no transform happens |
