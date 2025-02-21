import {Application, Request, Response} from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
const packageJson = require('./../../package.json');


const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "DROP-RIDE REST API Docs",
            version: packageJson.version,
        },
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",

                }
            }
        },
        security: [
            {
                bearerAuth: [],
            }
        ]
    },
    servers: [
        {
          url: "https://drop-app-ytc9.onrender.com",
        },
      ],
    apis: ["./src/routes/*.ts"],
    
}


const swaggerSpec = swaggerJSDoc(swaggerOptions);

function swaggerDocs (app: Application, port: number) {
    // swagger page
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    // Docs in JSON FORMAT
    app.get("/docs.json", (req: Request, res: Response) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    console.log(`Docs available at http://localhost:${port}/docs`)
}

export default swaggerDocs