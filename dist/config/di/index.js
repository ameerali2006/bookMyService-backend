"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyInjection = void 0;
const repository_register_1 = require("./repository.register");
const service_register_1 = require("./service.register");
class DependencyInjection {
    static registerAll() {
        service_register_1.ServiceRegistery.registerService();
        repository_register_1.RepositoryRegistery.registerRepository();
    }
}
exports.DependencyInjection = DependencyInjection;
