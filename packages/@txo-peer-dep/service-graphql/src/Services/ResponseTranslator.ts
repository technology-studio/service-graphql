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
import type { OperationOptions } from '@txo-peer-dep/service-graphql'

import type {
  ExtendedGraphQlError,
} from '../Model/Types'
import {
  FetchResult, ApolloError, isApolloError,
} from '@apollo/client'

const log = new Log('txo.react-graphql-service.Services.ResponseTranslator')

const populateGraphQLErrors = (serviceErrorList: ServiceError[], error: ExtendedGraphQlError): void => {
  serviceErrorList.push({
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    key: error.key || error.extensions?.code || ServiceErrorKey.SERVER_ERROR,
    message: error.message,
    data: error,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isApolloErrorInternal = (response: any): response is ApolloError => isApolloError(response)

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
      })
    }
    graphQLErrors.forEach(graphQLError => {
      serviceErrorList.push({
        key: ServiceErrorKey.CLIENT_ERROR,
        message: graphQLError.message || message,
        data: graphQLError,
      })
    })
  } else {
    response.errors?.forEach(error => {
      populateGraphQLErrors(serviceErrorList, error)
    })
  }
  return serviceErrorList
}
