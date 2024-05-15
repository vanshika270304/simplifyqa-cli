#!/usr/bin/env node

import { RegisterDevice } from '@controllers/RegisterDevice.command.js';
import { Execute } from '@controllers/Execute.command.js';
import { Login } from '@controllers/Login.command.js';
import { App } from './app.js';

// ValidateEnv();

const app = new App([new Login(), new RegisterDevice(), new Execute()]);
// const app = new App([new Main(), new Help()]);
await app.run(process.argv);
process.exit(0);
