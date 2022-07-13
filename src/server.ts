import express, {Express} from 'express';
import http, {Server} from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';

import {
    errorHandlerMiddleware,
    authMiddleware,
} from './middlewares';
import {
    CarbonController,
    AuthController,
} from './controllers';
import {ConfigManager} from './common';
import {ServerConfig} from './interfaces';

export default class HttpServer {
    private readonly serverConfig: ServerConfig;
    private readonly carbonController: CarbonController;
    private readonly authController: AuthController;

    constructor(
        carbonController: CarbonController,
        authController: AuthController,
        configManager: ConfigManager
    ) {
        this.carbonController = carbonController;
        this.authController = authController;
        this.serverConfig = configManager.getServerConfig();
    }

    start(): Server {
        const {port} = this.serverConfig;

        const app = express();
        const server = http.createServer(app);

        this._registerMiddleware(app);
        this._registerRoutes(app);
        this._registerErrorHandler(app);

        console.log(`Listening at port ${port}`);
        server.listen(port);

        return server;
    }

    _registerRoutes(app: Express) {
        app.post('/login', this.authController.login.bind(this.authController));
        app.get('/carbons', this.carbonController.getCarbons.bind(this.carbonController));
        app.get('/carbons/my', this.carbonController.getMyCarbons.bind(this.carbonController));
        app.put('/carbons/:userId/transfer', this.carbonController.transferMyCarbons.bind(this.carbonController));
    }

    _registerMiddleware(app: Express) {
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(express.json());
        app.use(cors());
        app.use(authMiddleware);
    }

    _registerErrorHandler(app: Express) {
        app.use(errorHandlerMiddleware);
    }
}
