/* eslint @typescript-eslint/no-explicit-any: 0 */

import chalk from 'chalk'

let verbose = false

export const setVerbose = (value: boolean): void => {
  verbose = value
}

export const isVerbose = (): boolean => verbose

export const log = (...data: any[]): void => console.log(...data)

export const logError = (message: string, verboseOnly: boolean = false): void =>
  (!verboseOnly || verbose) && log(chalk.red.bold(message))

export const logInfo = (message: string, verboseOnly: boolean = false): void =>
  (!verboseOnly || verbose) && log(chalk.green.bold(message))

export const logNewline = (verboseOnly: boolean = false): void => (!verboseOnly || verbose) && log('')

export const logWithoutNewline = (message: string, verboseOnly: boolean = false): void => {
  ;(!verboseOnly || verbose) && process.stdout.write(message)
}

export const logVerbose = (...data: any[]): void => {
  if (!verbose) {
    return
  }

  log(...data)
}

export const startGroup = (...label: any[]): void => console.group(...label)

export const endGroup = (): void => console.groupEnd()
