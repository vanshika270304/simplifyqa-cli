import { Command } from 'commander';
import type { CommandModule } from '../interfaces/CommandModule.js';
import { logger } from '@utils/logger.js';
import { ConnHandlerImpl } from '@services/ConnHandler.service.js';
import type { HttpResponse } from '@interfaces/IExecution.js';

class Login implements CommandModule {
  program!: Command;

  constructor() {}

  configure(program: Command) {
    program
      .command('login')
      .alias('l')
      .description('Performs a Login on SimplifyQA Server')
      .requiredOption('-u, --username <username>', 'Specifies the username/email of the user')
      .requiredOption('-p, --password <password>', 'Specifies the password of the user')
      .option('-c, --company <company>', 'Specifies the company name of the SimplifyQA instance for which the application is hosted', 'Simplify3x')
      .option('-a, --app-url <app_url>', 'Specifies the URL of the SimplifyQA instance where the application is hosted', 'https://simplifyqa.app')
      .option('-t, --type <type>', 'Specifies the client type of login on SimplifyQA instance', 'web');
    //     .action(async (options: any) => {
    //       const appUrl = options.appUrl;
    //       const loginPayload = {
    //         company: options.company,
    //         password: options.password,
    //         email: options.username,
    //         type: options.type,
    //       };

    //       logger.info(JSON.stringify(appUrl));
    //       logger.info(JSON.stringify(loginPayload));
    //       await new ConnHandlerImpl()
    //         .makeHttpPostRequest(appUrl, loginPayload)
    //         .then((response: HttpResponse) => {
    //           logger.info(JSON.stringify(response.body));
    //         })
    //         .catch((error: Error) => {
    //           logger.error(`Error: ${error.message}`);
    //         });
    //     });
    this.program = program;
  }

  getCommand(): Command {
    return this.program;
  }
}

export { Login };
