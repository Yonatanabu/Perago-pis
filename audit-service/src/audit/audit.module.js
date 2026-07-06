"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AuditModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var audit_log_entity_1 = require("./audit-log.entity");
var audit_service_1 = require("./audit.service");
var audit_controller_1 = require("./audit.controller");
var AuditModule = /** @class */ (function () {
    function AuditModule() {
    }
    AuditModule = __decorate([
        (0, common_1.Module)({
            imports: [typeorm_1.TypeOrmModule.forFeature([audit_log_entity_1.AuditLogEntity])],
            controllers: [audit_controller_1.AuditController],
            providers: [audit_service_1.AuditService]
        })
    ], AuditModule);
    return AuditModule;
}());
exports.AuditModule = AuditModule;
