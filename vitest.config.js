"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['lcov', 'html'],
        },
        reporters: ['default', 'junit'],
        outputFile: 'test-results.xml',
    },
});
//# sourceMappingURL=vitest.config.js.map