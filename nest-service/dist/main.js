"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.CLIENT_URL,
        ].filter(Boolean),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api');
    const port = process.env.PORT || 3002;
    await app.listen(port);
    console.log(`🚀 NestJS service running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map