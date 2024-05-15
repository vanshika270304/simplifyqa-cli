import { Command } from 'commander';
import type { CommandModule } from './interfaces/CommandModule.js';
import { logger } from '@utils/logger.js';
import figlet from 'figlet';
import yargs from 'yargs';
import type { ExecutionData } from '@interfaces/IExecution.js';
import { ExecutionDriver } from '@models/ExecutionDriver.model.js';
import { log } from 'console';

interface CommandMap {
  [key: string]: any;
}

class App {
  program: Command;

  cmdMap: CommandMap = {
    l: 'login',
    login: 'login',
    e: 'execute',
    execute: 'execute',
    rd: 'register-device',
    'register-device': 'register-device',
  };

  ExecuteArgsMap: CommandMap = {
    x: 'token',
    token: 'token',
    a: 'appUrl',
    appUrl: 'appUrl',
    t: 'threshold',
    threshold: 'threshold',
  };

  constructor(commands: CommandModule[]) {
    this.program = new Command();
    logger.info(`\n${figlet.textSync('SimplifyQA-CLI')}`);
    this.program.name('sqa').description('CLI for SimplifyQA Client').version('1.0.0');
    this.initializieCommands(commands);
  }

  initializieCommands(commands: CommandModule[]) {
    commands.forEach(command => {
      command.configure(this.program);
    });
  }

  getCommandName(_: any, data: any) {
    return data[_];
  }

  stringToBoolean(str: string): boolean {
    const truePattern: RegExp = /^(true|yes|1)$/i;
    const falsePattern: RegExp = /^(false|no|0)$/i;

    if (truePattern.test(str)) {
      return true;
    } else if (falsePattern.test(str)) {
      return false;
    } else {
      throw new Error('Invalid boolean string');
    }
  }

  async run(argv?: string[]) {
    const options: any = yargs(argv?.slice(2)).argv;
    const matchedCommand = this.cmdMap[options._];

    switch (matchedCommand) {
      case 'login':
        logger.info(matchedCommand);
        break;

      case 'execute':
        const executionData: ExecutionData = {
          token: options.token || options.x,
          appurl: options.appUrl || options.a || 'https://simplifyqa.app',
          threshold: parseFloat(options.threshold || options.t || 100.0),
          verbose: this.stringToBoolean(JSON.parse(options.verbose || options.v || 'false')),
        };

        await new ExecutionDriver().run(executionData).then((resp: boolean) => {
          if (resp) process.exit(0);
          else process.exit(1);
        });

        break;

      case 'register-device':
        logger.info(matchedCommand);
        break;

      default:
        logger.error(`Unknown command: ${options._}`);
        break;
    }
  }
}

export { App };
