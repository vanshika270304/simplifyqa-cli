import { ExecutionModel } from '@models/Execution.model.js';
import type { ExecutionData } from '@interfaces/IExecution.js';
import { format } from 'date-fns';
import { logger } from '@utils/logger.js';

class ExecutionDriver {
  constructor() {}

  async run(data: ExecutionData): Promise<boolean> {
    let exec_obj: ExecutionModel;
    let issues_flag: boolean = false;

    try {
      const exec_token: string = data.token;
      let environment: string | undefined = data.appurl;
      let threshold: number | string | undefined = data.threshold;
      let verbose: boolean | undefined = data.verbose;

      const invalid_exec_token_msg: string = ' ERR: The EXEC_TOKEN value is invalid';
      const invalid_env_msg: string = ' ERR: The APPURL value is invalid. (Resolving to default app url: https://simplifyqa.app)';
      const invalid_threshold_msg: string = ' ERR: The THRESHOLD value is invalid. (Resolving to default threshold: 100%)';

      const exec_pass_status_msg: string = 'Execution Passed!';
      const exec_fail_status_msg: string = 'Execution Failed!';
      const exec_pass_with_warn_status_msg: string =
        'Execution performed successfully with resolved values. Please change the values to avoid future warnings.';

      if (exec_token.length != 88) {
        logger.info(invalid_exec_token_msg);
        logger.error(invalid_exec_token_msg);
        logger.info('*'.repeat(51) + 'EOF' + '*'.repeat(51) + '\n');
        return false;
      }

      if (environment != undefined) {
        if (environment.length < 2) {
          issues_flag = true;
          logger.info(invalid_env_msg);
          environment = '';
        }
      } else {
        issues_flag = true;
        logger.info(invalid_env_msg);
        environment = '';
      }

      if (threshold != undefined) {
        if (Number.isNaN(threshold)) {
          issues_flag = true;
          logger.info(invalid_threshold_msg);
          threshold = 100;
        } else {
          if (threshold > 100 || threshold < 0) {
            issues_flag = true;
            logger.info(invalid_threshold_msg);
            threshold = 100;
          }
        }
      } else {
        issues_flag = true;
        logger.info(invalid_threshold_msg);
        threshold = 100;
      }

      if (verbose == undefined) {
        issues_flag = true;
        verbose = false;
      }
      logger.info('**************************************SIMPLIFYQA PIPELINE CONNECTOR**************************************');
      logger.info('The Set Parameters are:');
      // logger.info( "=".repeat(105));
      exec_obj = new ExecutionModel({
        exec_token: exec_token,
        env: environment,
        threshold: threshold,
        verbose: verbose,
      });
      logger.info(
        'Execution Token: ' + '*'.repeat(70) + exec_obj.getExecToken().slice(exec_obj.getExecToken().length - 18, exec_obj.getExecToken().length),
      );
      logger.info('App Url: ' + exec_obj.getAppUrl());
      logger.info('Threshold: ' + exec_obj.getThreshold() + ' %');
      logger.info('Verbose: ' + exec_obj.getVerbose());
      // logger.info(JSON.stringify(exec_obj));
      let triggered: any = await exec_obj.startExec();

      if (triggered === null && !exec_obj.getRetry()) {
        logger.error(`\n${exec_fail_status_msg}`);
        logger.error('Execution Failed!');
        logger.error('\n');
        logger.error('*'.repeat(51) + 'EOF' + '*'.repeat(51) + '\n');
        return false;
      }

      logger.info(`EXECUTION STATUS: INITIALIZING TESTCASES in the triggered suite`);
      let status: any = null;
      status = await exec_obj.checkExecStatus({ payload_flag: true });

      while (status === null) {
        status = await new Promise(resolve => {
          setTimeout(async () => {
            const newStatus = await exec_obj.checkExecStatus({
              payload_flag: false,
            });
            resolve(newStatus);
          }, 5000);
        });
        logger.info(status);
      }

      logger.info(`EXECUTION STATUS: Execution IN-PROGRESS for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`);
      logger.info(
        `${' '.repeat(27)}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
          .getExecPercent()
          .toFixed(2)} %, fail percentage: ${exec_obj.getFailPercent().toFixed(2)} %, threshold: ${exec_obj.getThreshold().toFixed(2)} % )\n`,
      );

      let results_array: any = status.data.data.result;

      results_array.forEach((item: { tcCode: string; tcName: string; result: string; totalSteps: number }) => {
        logger.info(`${' '.repeat(27)}${item.tcCode}: ${item.tcName} | TESTCASE ${item.result.toUpperCase()} (total steps: ${item.totalSteps})`);
      });

      if (exec_obj.getVerbose()) {
        logger.info(`REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`);
      }

      if (exec_obj.getVerbose()) {
        logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
      }

      while (exec_obj.getExecStatus() === 'INPROGRESS' && exec_obj.getThreshold() > exec_obj.getFailPercent()) {
        let curr_tcs = exec_obj.getExecutedTcs();

        status = await new Promise(resolve => {
          setTimeout(async () => {
            const newStatus = await exec_obj.checkExecStatus({
              payload_flag: false,
            });
            resolve(newStatus);
          }, 5000);
        });

        if (curr_tcs < exec_obj.getExecutedTcs()) {
          logger.info(`EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`);
          logger.info(
            `${' '.repeat(27)}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
              .getExecPercent()
              .toFixed(2)} %, fail percentage: ${exec_obj.getFailPercent().toFixed(2)} %, threshold: ${exec_obj.getThreshold().toFixed(2)} % )\n`,
          );
          let results_array: any = status.data.data.result;

          results_array.forEach((item: { tcCode: string; tcName: string; result: string; totalSteps: number }) => {
            logger.info(`${' '.repeat(27)}${item.tcCode}: ${item.tcName} | TESTCASE ${item.result.toUpperCase()} (total steps: ${item.totalSteps})`);
          });

          if (exec_obj.getVerbose()) {
            logger.info(`REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`);
          }

          if (exec_obj.getVerbose()) {
            logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
          }
        }

        if (exec_obj.getThreshold() <= exec_obj.getFailPercent()) {
          logger.info(`\nTHRESHOLD REACHED!!!!!!!!!!!!!!!!!`);
          break;
        }
      }

      let setResult: boolean = true;

      if (exec_obj.getThreshold() <= exec_obj.getFailPercent()) {
        logger.info(`EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`);
        logger.info(
          `${' '.repeat(27)}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
            .getExecPercent()
            .toFixed(2)} %, fail percentage: ${exec_obj.getFailPercent().toFixed(2)} %, threshold: ${exec_obj.getThreshold().toFixed(2)} % )\n`,
        );
        results_array = status.data.data.result;

        results_array.forEach((item: { tcCode: string; tcName: string; result: string; totalSteps: number }) => {
          logger.info(`${' '.repeat(27)}${item.tcCode}: ${item.tcName} | TESTCASE ${item.result.toUpperCase()} (total steps: ${item.totalSteps})`);
        });

        if (exec_obj.getVerbose()) {
          logger.info(`REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`);
        }

        if (exec_obj.getVerbose()) {
          logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
        }

        logger.info(`\n${exec_fail_status_msg}`);
        logger.error(' Execution Failed!');

        setResult = false;

        let kill_status: any = await exec_obj.killExec();

        if (kill_status === null) {
          logger.info(`EXECUTION STATUS: FAILED to explicitly kill the execution!`);
        } else {
          logger.info(`EXECUTION STATUS: SUCCESSFUL to explicitly kill the execution!`);
        }

        if (exec_obj.getVerbose()) {
          logger.info(`REQUEST BODY: ${JSON.stringify(exec_obj.getKillPayload())}`);
        }

        if (exec_obj.getVerbose()) {
          logger.info(`RESPONSE BODY: ${JSON.stringify(kill_status)}`);
        }
      } else {
        logger.info(`EXECUTION STATUS: Execution ${exec_obj.getExecStatus()} for Suite ID: SU-${exec_obj.getCustId()}${exec_obj.getSuiteId()}`);
        logger.info(
          `${' '.repeat(27)}(Executed ${exec_obj.getExecutedTcs()} of ${exec_obj.getTotalTcs()} testcase(s), execution percentage: ${exec_obj
            .getExecPercent()
            .toFixed(2)} %, fail percentage: ${exec_obj.getFailPercent().toFixed(2)} %, threshold: ${exec_obj.getThreshold().toFixed(2)} % )\n`,
        );
        results_array = status.data.data.result;

        results_array.forEach((item: { tcCode: string; tcName: string; result: string; totalSteps: number }) => {
          logger.info(`${' '.repeat(27)}${item.tcCode}: ${item.tcName} | TESTCASE ${item.result.toUpperCase()} (total steps: ${item.totalSteps})`);
        });

        if (exec_obj.getVerbose()) {
          logger.info(`REQUEST BODY: ${JSON.stringify(exec_obj.getStatusPayload())}`);
        }

        if (exec_obj.getVerbose()) {
          logger.info(`RESPONSE BODY: ${JSON.stringify(status)}`);
        }

        if (issues_flag) {
          logger.info(`\n${exec_pass_with_warn_status_msg}`);
          logger.info(' Execution Succeded with Issues!');
        } else {
          logger.info(`\n${exec_pass_status_msg}`);
          logger.info(' Execution Succeded!');
        }
      }

      logger.info(`\nREPORT URL: ${exec_obj.getReportUrl()}`);
      logger.info('*'.repeat(51) + 'EOF' + '*'.repeat(51) + '\n');

      return setResult;
    } catch (err: any) {
      logger.error(err.message);
      return false;
    }
  }
}

export { ExecutionDriver };
