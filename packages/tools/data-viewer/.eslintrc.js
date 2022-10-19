/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
    extends: [require.resolve("@fluidframework/eslint-config-fluid/strict")],
    parserOptions: {
        project: ["./tsconfig.json"],
    },
    rules: {
        /**
         * Disabled because it disagrees with React.useEffect best practices.
         */
        "unicorn/consistent-function-scoping": "off",
    },
};
