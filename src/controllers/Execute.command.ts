import { Command } from 'commander';
import type { CommandModule } from '@interfaces/CommandModule.js';
import inquirer from 'inquirer';
import { ExecutionModel } from '@models/Execution.model.js';
import type { ExecutionData } from '@interfaces/IExecution.js';
import { ExecutionDriver } from '@models/ExecutionDriver.model.js';
import { logger } from '@utils/logger.js';
import { exec } from 'child_process';
// import { RemoteExecuteImpl } from "@services/RemoteExecutionServices/RemoteExecuteImpl.js";

class Execute implements CommandModule {
  program!: Command;

  constructor() {}

  configure(program: Command) {
    program
      .command('execute')
      .alias('e')
      .description('Performs an Execution on SimplifyQA Server')
      .requiredOption('-x, --token <execution_token>', 'Execution Token derived from the pipelines module of SimplifyQA')
      .requiredOption(
        '-a, --app-url <app_url>',
        'Specifies the URL of the SimplifyQA instance where the application is hosted',
        'https://simplifyqa.app',
      )
      .requiredOption('-t, --threshold <threshold_percentage>', 'Specifies the threshold percentage for execution (0.00% to 100.00%)', '100.00')
      .requiredOption('-v, --verbose', 'Flag to enable verbose mode (true/false)', 'false');

    this.program = program;
  }

  getCommand(): Command {
    return this.program;
  }
}

export { Execute };
