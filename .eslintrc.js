module.exports = {
    "env": {
        "node": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaVersion": 2019
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-unused-vars": [
            "error",
            {
                "caughtErrors": "all",
                "args": "none"
            }
        ],
        "no-use-before-define": [
            "error",
            {
                "functions": false
            }
        ],
        "max-len": [
            "error",
            {
                "code": 200,
                "ignoreComments": true,
                "ignoreStrings": true,
                "ignoreTemplateLiterals": true
            }
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-const-assign": "error",
        "quotes": [
            "error",
            "single",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ],
        "quote-props": [
            "error",
            "as-needed",
            {
                "numbers": true
            }
        ],
        "no-cond-assign": "off",
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "object-curly-newline": [
            "error",
            {
                "multiline": true,
                "consistent": true
            }
        ],
        "comma-dangle": [
            "error",
            "never"
        ],
        "comma-spacing": [
            "error",
            {
                "before": false,
                "after": true
            }
        ],
        "comma-style": [
            "error",
            "last"
        ],
        "eol-last": "error",
        "indent": [
            "error",
            2
        ],
        "no-extra-parens": "error",
        "no-mixed-spaces-and-tabs": "error",
        "no-multi-spaces": "error",
        "no-multi-str": "error"
    }
};
