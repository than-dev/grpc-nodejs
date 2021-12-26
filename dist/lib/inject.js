"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
function inject(fn, database) {
    return (call, callback) => fn(call, callback, database);
}
exports.inject = inject;
//# sourceMappingURL=inject.js.map