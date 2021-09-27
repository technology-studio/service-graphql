/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2018-07-04T16:21:57+02:00
 * @Copyright: Technology Studio
**/

import {
  ServiceError,
  ServiceErrorKey,
} from '@txo/service-prop'
// import { CODE_VALIDATION_ERROR } from '@txo/react-service-error-handler'
import { Log } from '@txo/log'
import type {
  OperationOptions,
  ExtendedGraphQlError,
} from '../Model/Types'

import {
  FetchResult, ApolloError, isApolloError,
} from '@apollo/client'

const log = new Log('txo.react-graphql-service.Services.ResponseTranslator')

const populateGraphQLErrors = (serviceErrorList: ServiceError[], error: ExtendedGraphQlError, operationName: string | undefined): void => {
  serviceErrorList.push({
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    key: error.key || error.extensions?.code || ServiceErrorKey.SERVER_ERROR,
    message: error.message,
    data: error,
    operationName,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isApolloErrorInternal = (response: any): response is ApolloError => isApolloError(response)

const EMPTY_ARRAY: ServiceError[] = []

export const defaultErrorResponseTranslator = (response: FetchResult<unknown> | ApolloError, options: OperationOptions = {}): ServiceError[] => {
  log.debug('TRANSLATE GRAPH_QL ERROR RESPONSE', { response, options })
  const serviceErrorList: ServiceError[] = []
  if (isApolloErrorInternal(response)) {
    const { networkError, graphQLErrors, message } = response
    if (networkError) {
      serviceErrorList.push({
        key: ServiceErrorKey.NETWORK_ERROR,
        message: networkError.message || message,
        data: networkError,
        operationName: options.operationName,
      })
    }
    graphQLErrors.forEach(graphQLError => {
      serviceErrorList.push({
        key: ServiceErrorKey.CLIENT_ERROR,
        message: graphQLError.message || message,
        data: graphQLError,
        operationName: options.operationName,
      })
    })
  } else {
    response.errors?.forEach(error => {
      populateGraphQLErrors(serviceErrorList, error, options.operationName)
    })
  }
  return serviceErrorList.length === 0 ? EMPTY_ARRAY : serviceErrorList
}
