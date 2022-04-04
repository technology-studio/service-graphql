/**
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date:   2018-07-04T15:46:09+02:00
 * @Copyright: Technology Studio
**/

import {
  ApolloError,
  FetchResult,
} from '@apollo/client'
import { GraphQLError } from 'graphql'

import type {
  ServiceError,
} from '@txo/service-prop'

export enum ExtendedGraphQlErrorType {
  VALIDATION = 'validation'
}

export type ExtendedGraphQlError = GraphQLError & {
  type?: ExtendedGraphQlErrorType,
  key?: string,
}

export type OperationOptions = {
  // TODO: let's remove after confirmation we don't need them anymore
  // onErrorCodeMapper?: (errorCode: number, data: any) => any,
  // onServiceErrorMapper?: (data: ServiceError[]) => ServiceError[],
  onSuccessDataMapper?: <DATA, SUB_DATA>(data: DATA) => SUB_DATA,
  operationName: string,
  context: string,
  path?: string,
}

export type GraphQlErrorResponseTranslator = (response: ApolloError | FetchResult<unknown>, options: OperationOptions) => ServiceError[]
