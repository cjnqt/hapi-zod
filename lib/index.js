"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boom_1 = __importDefault(require("@hapi/boom"));
require("./types");
const zod_validation_error_1 = require("zod-validation-error");
const ZodValidatorPlugin = {
    name: 'ZodValidatorPlugin',
    register(server) {
        server.ext('onPreHandler', async (request, h) => {
            const routeValidation = request.route.settings.plugins.zod;
            try {
                if (routeValidation?.payload) {
                    const validatedPayload = routeValidation.payload.parse(request.payload);
                    Object.defineProperty(request, 'payload', { value: validatedPayload, writable: false });
                }
                if (routeValidation?.query) {
                    Object.defineProperty(request, 'query', { value: routeValidation.query.parse(request.query), writable: false });
                }
                if (routeValidation?.params) {
                    Object.defineProperty(request, 'params', { value: routeValidation.params.parse(request.params), writable: false });
                }
                return h.continue;
            }
            catch (err) {
                return boom_1.default.badRequest((0, zod_validation_error_1.fromError)(err));
            }
        });
    }
};
exports.default = ZodValidatorPlugin;
