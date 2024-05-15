import { Command } from 'commander';
import type { CommandModule } from '../interfaces/CommandModule.js';
// import { logger } from '@utils/logger.js';

class RegisterDevice implements CommandModule {
  program!: Command;

  constructor() {}

  configure(program: Command) {
    program
      .command('register-device')
      .alias('rd')
      .description('Performs registration of a local/remote device on SimplifyQA Server')
      .option('-a, --app-url <app_url>', 'Specifies the URL of the SimplifyQA instance where the application is hosted', 'https://simplifyqa.app')
      .option('-i, --ip <IP_address>', 'Specifies the IP address of the remote device')
      .option('-m, --mac <MAC_address>', 'Specifies the MAC address of the remote device');
    // .action((options: any) => {
    //   logger.info('Device Registered Successfully!!');
    //   logger.info(options.appUrl);
    //   logger.info(options.ip);
    //   logger.info(options.mac);
    // });
    this.program = program;
  }

  getCommand(): Command {
    return this.program;
  }
}

export { RegisterDevice };
