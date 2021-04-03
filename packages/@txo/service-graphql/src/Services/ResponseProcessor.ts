/**
 * @Author: Erik Slovák <erik.slovak@technologystudio.sk>
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2017-11-07T16:45:41+01:00
 * @Copyright: Technology Studio
**/

import {
  ServiceErrorException,
  isServiceErrorException,
} from '@txo/service-prop'
import { configManager, OperationOptions } from '@txo-peer-dep/service-graphql'
import { Log } from '@txo/log'
import _get from 'lodash.get'
import { FetchResult } from '@apollo/client'

const log = new Log('txo.react-graphql-service.Services.ResponseProcessor')

export const singleOperationDataTranslator = <DATA, SUB_DATA>(
  data: DATA,
  path?: string,
  { onSuccessDataMapper }: OperationOptions = {},
): SUB_DATA => {
  const _data = path ? data && _get(data, path) : data
  return onSuccessDataMapper
    ? onSuccessDataMapper(_data)
    : _data
}

export const errorProcessor = async (
  resultOrException: FetchResult<unknown> | ServiceErrorException,
  options: OperationOptions = {},
): Promise<never> => {
  if (isServiceErrorException(resultOrException)) {
    throw resultOrException
  }

  log.debug('ERROR PROCESSOR', resultOrException)
  throw new ServiceErrorException(
    configManager.config.errorResponseTranslator(resultOrException, options),
  )
}

export const operationProcessor = async <DATA, SUB_DATA = DATA>(
  response: FetchResult<DATA>,
  path?: string,
  options: OperationOptions = {},
): Promise<SUB_DATA> => {
  log.debug('OPERATION PROCESSOR', response)
  if (response.errors) {
    return errorProcessor(response, options)
  }
  return singleOperationDataTranslator(response.data, path, options)
}

export const operationPromiseProcessor = async <DATA>(
  promise: Promise<FetchResult<DATA>>,
  path?: string,
  options: OperationOptions = {},
): Promise<DATA> => (
  promise
    .then(async response => operationProcessor(response, path, options))
    .catch(async error => errorProcessor(error, options))
)
