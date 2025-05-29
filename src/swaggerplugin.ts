import { Plugin } from '@hapi/hapi';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export interface ZodDocsOptions {
    title?: string;
    version?: string;
    description?: string;
    docsPath?: string;         // default: /ops/docs
    jsonPath?: string;         // default: /ops/openapi.json
    enableSwaggerUI?: boolean; // default: true
    defaultResponseSchema?: z.ZodTypeAny;
}

/**
 * Creates a Hapi plugin that generates OpenAPI docs from zod schemas
 */
export function swaggerPlugin(options: ZodDocsOptions = {}): Plugin<{}> {
    const {
        title = 'Ops API Docs',
        version = '1.0.0',
        description = '',
        docsPath = '/ops/docs',
        jsonPath = '/ops/openapi.json',
        enableSwaggerUI = true,
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
                if (!zodConfig) {
                    continue;
                }

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
                if (zodConfig.payload) {
                    request.body = {
                        content: {
                            'application/json': {
                                schema: zodConfig.payload
                            }
                        }
                    };
                }
                if (zodConfig.query) {
                    request.query = zodConfig.query
                }
                if (zodConfig.params) {
                    request.params = zodConfig.params
                }
                

                registry.registerPath({
                    method: method.toLowerCase() as 'get' | 'post' | 'put' | 'delete',
                    path,
                    summary,
                    tags,
                    request,
                    responses
                });
            }

            const generator = new OpenApiGeneratorV3(registry.definitions);
            const document = generator.generateDocument({
                openapi: '3.0.0',
                info: {
                  version: version,
                  title: title,
                  description: description,
                },
                servers: [{ url: 'v1' }],
              });


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
        <title>${title}</title>
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