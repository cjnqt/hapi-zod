import { Plugin } from '@hapi/hapi';
import Boom from '@hapi/boom';
import { ZodSchema } from 'zod';
import './types'; 
import { fromError } from 'zod-validation-error';

const ZodValidatorPlugin: Plugin<null> = {
  name: 'ZodValidatorPlugin',
  register(server) {
    server.ext('onPreHandler', async (request, h) => {
      const routeValidation = request.route.settings.plugins.zod as {
        payload?: ZodSchema<any>,
        query?: ZodSchema<any>,
        params?: ZodSchema<any>,
        headers?: ZodSchema<any>,
        state?: ZodSchema<any>,
      };

      try {
        if (routeValidation?.payload) {
          routeValidation.payload.parse(request.payload);
        }
        if (routeValidation?.query) {
          routeValidation.query.parse(request.query);
        }
        if (routeValidation?.params) {
          routeValidation.params.parse(request.params);
        }
        if (routeValidation?.headers) {
          routeValidation.headers.parse(request.headers);
        }
        if (routeValidation?.state) {
          routeValidation.state.parse(request.state);
        }
        return h.continue;
      } catch (err) {
        return Boom.badRequest(fromError(err))
      }
    });
  }
};

export default ZodValidatorPlugin;