export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "E-Commerce API",
    version: "1.0.0",
    description: "Documentation for the roadmap.sh E-Commerce API challenge",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  paths: {
    "/api/products": {
      get: {
        summary: "Returns a list of all products",
        responses: {
          200: {
            description: "A JSON array of product objects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      name: { type: "string" },
                      price: { type: "number" },
                      stock: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
