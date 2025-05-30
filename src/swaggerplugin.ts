import { Plugin } from '@hapi/hapi';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi  } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {OpenAPIObjectConfig} from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator';
import { SecuritySchemeObject } from 'openapi3-ts/oas30';
extendZodWithOpenApi(z);

export interface ZodDocsOptions  {
    openapiSpec?: OpenAPIObjectConfig // default: { openapi: '3.0.0', info: { title: 'Ops API Docs', version: '1.0.0' } }
    securitySchemes?: { [name: string] : SecuritySchemeObject }
    docsPath?: string;         // default: /ops/docs
    jsonPath?: string;         // default: /ops/openapi.json
    enableSwaggerUI?: boolean; // default: true
    defaultResponseSchema?: z.ZodTypeAny;
}

/**
 * Creates a Hapi plugin that generates OpenAPI docs from zod schemas
 */
export const swaggerPlugin = (options: ZodDocsOptions = {}): Plugin<{}> => {
    const {
        docsPath = '/ops/docs',
        jsonPath = '/ops/openapi.json',
        enableSwaggerUI = true,
        openapiSpec = {
            openapi: '3.0.0',
            info: {
                title : 'Ops API Docs',
                version: '1.0.0',
                description: ''
            },
        },
        defaultResponseSchema = z.object({ success: z.boolean() })
    } = options;


    return {
        name: 'ZodDocsPlugin',
        version: '1.0.0',
        register: async (server) => {

            const registry = new OpenAPIRegistry();
            const routes = server.table();

            for (const route of routes) {

                const zodConfig = route.settings?.plugins?.zod;

                const method = route.method.toUpperCase();
                const path = route.path;
                const summary = route.settings.description;
                const tags = route.settings.tags || [];


                const responses = {
                    200: {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: defaultResponseSchema
                            }
                        }
                    }
                };

                const request: any = {};

                if (zodConfig?.payload) {
                    request.body = {
                        content: {
                            'application/json': {
                                schema: zodConfig.payload
                            }
                        }
                    };
                }
                if (zodConfig?.query) {
                    request.query = zodConfig.query
                }
                if (zodConfig?.params) {
                    request.params = zodConfig.params
                }
                

                registry.registerPath({
                    method: method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch',
                    path,
                    summary,
                    tags,
                    request,
                    responses
                });
            }

            if(options.securitySchemes) {
                for (const [name, scheme] of Object.entries(options.securitySchemes)) {
                    registry.registerComponent('securitySchemes', name, scheme);
                }
                delete options.securitySchemes;
            }

            const generator = new OpenApiGeneratorV3(registry.definitions);
            const document = generator.generateDocument(openapiSpec);


            server.route({
                method: 'GET',
                path: jsonPath,
                handler: () => {
                    return document;
                },
                options: {
                    tags: ['docs'],
                    description: 'OpenAPI JSON schema',
                    auth: false
                },
            });

            if (enableSwaggerUI) {
                server.route({
                    method: 'GET',
                    path: docsPath,
                    handler: (_, h) => {
                        return h
                            .response(`<!DOCTYPE html>
<html>
    <head>
        <title>${openapiSpec.info.title}</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
            SwaggerUIBundle({ url: '${jsonPath}', dom_id: '#swagger-ui' });
        </script>
    </body>
</html>`)
                            .type('text/html');
                    },
                    options: {
                        tags: ['docs'],
                        auth: false,
                        description: 'Swagger UI'
                    }
                });
            }
        }
    };
}

export const extendZodWithSwagger = (z) => {
    extendZodWithOpenApi(z)
}