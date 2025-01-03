/**
 * @Author: Erik Slovák <erik.slovak@technologystudio.sk>
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-11-07T16:45:41+01:00
 * @Copyright: Technology Studio
**/

import type { ServiceCallResult } from '@txo/service-prop'
import {
  ServiceOperationError,
  isServiceOperationError,
} from '@txo/service-prop'
import type { OperationOptions } from '@txo-peer-dep/service-graphql'
import { configManager } from '@txo-peer-dep/service-graphql'
import { Log } from '@txo/log'
import _get from 'lodash.get'
import type { FetchResult } from '@apollo/client'

const log = new Log('txo.react-graphql-service.Services.ResponseProcessor')

export const singleOperationDataTranslator = <DATA, SUB_DATA = DATA> (
  data: DATA | undefined | null,
  { onSuccessDataMapper, path }: OperationOptions,
): SUB_DATA => {
  const _data = path != null && path !== ''
    ? data != null ? _get(data, path) as SUB_DATA | null | undefined : undefined
    : data
  return onSuccessDataMapper != null
    ? onSuccessDataMapper(_data)
    : _data as SUB_DATA
}

export const errorProcessor = (
  resultOrException: FetchResult<unknown> | ServiceOperationError,
  options: OperationOptions,
): never => {
  if (isServiceOperationError(resultOrException)) {
    throw resultOrException
  }

  log.debug('ERROR PROCESSOR', resultOrException)
  throw new ServiceOperationError({
    serviceErrorList: configManager.config.errorResponseTranslator(resultOrException, options),
    operationName: options.operationName,
    context: options.context,
  })
}

export const operationProcessor = <DATA, SUB_DATA = DATA> (
  response: FetchResult<DATA>,
  options: OperationOptions,
): ServiceCallResult<SUB_DATA, FetchResult<DATA>> => {
  log.debug('OPERATION PROCESSOR', response)
  if (response.errors != null) {
    return errorProcessor(response, options)
  }
  return {
    data: singleOperationDataTranslator<DATA, SUB_DATA>(response.data, options),
    callData: response,
  }
}

export const operationPromiseProcessor = async <DATA, SUB_DATA = DATA> (
  promise: Promise<FetchResult<DATA>>,
  options: OperationOptions,
): Promise<ServiceCallResult<SUB_DATA, FetchResult<DATA>>> => (
  await promise
    .then(async response => await Promise.resolve(operationProcessor<DATA, SUB_DATA>(response, options)))
    .catch(async error => await Promise.reject(errorProcessor(error as FetchResult<unknown> | ServiceOperationError, options)))
)
