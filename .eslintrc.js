module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:sonarjs/recommended",
        "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "import",
        "functional",
        "sonarjs"
    ],
    "root": true,
    "rules": {
        "no-case-declarations": "off",
        "no-inner-declarations": "off",
        "prefer-const": "error",
        curly: "error",
        "spaced-comment": ["error", "always", { block: { balanced: true } }],
        radix: "error",
        "one-var": ["error", "never"],
        "object-shorthand": "error",
        "no-var": "error",
        "no-param-reassign": "error",
        "no-underscore-dangle": "error",
        "no-undef-init": "warn",
        "no-throw-literal": "error",
        "no-new-wrappers": "error",
        "no-eval": "error",
        "no-console": "error",
        "no-caller": "error",
        "no-bitwise": "off",
        eqeqeq: ["error", "smart"],
        "max-classes-per-file": ["error", 1],
        "guard-for-in": "error",
        complexity: "warn",
        "arrow-body-style": "error",
        "import/no-internal-modules": "off",
        "import/order": "error",
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        // Enable if we want to enforce the return type for all the functions
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/array-type": [
        "error",
        {
            default: "array-simple",
            readonly: "generic",
        },
        ],
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/member-delimiter-style": [
        "error",
        {
            multiline: {
            delimiter: "semi",
            requireLast: true,
            },
            singleline: {
            delimiter: "semi",
            requireLast: false,
            },
        },
        ],
        "@typescript-eslint/no-floating-promises": "error",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": ["error"],
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/restrict-plus-operands": "error",
        semi: "off",
        "@typescript-eslint/semi": ["error"],
        "@typescript-eslint/unified-signatures": "error",
        "functional/no-let": "warn",
        "functional/immutable-data": "off",
        "sonarjs/no-small-switch": "off",
        "sonarjs/no-duplicate-string": "error",
        "sonarjs/cognitive-complexity": ["warn", 19],
        "sonarjs/no-small-switch": "error",
        "sonarjs/no-inverted-boolean-check": "error",
        "max-lines-per-function": ["warn", 200]
    }
};
