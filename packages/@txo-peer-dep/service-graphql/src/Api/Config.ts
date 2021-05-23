/**
 * @Author: Erik Slovak <erik.slovak@technologystudio.sk>
 * @Author: Rostislav Simonik <rostislav.simonik@technologystudio.sk>
 * @Date: 2020-06-03T10:06:36+02:00
 * @Copyright: Technology Studio
**/

import { ConfigManager } from '@txo/config-manager'

import type { GraphQlErrorResponseTranslator } from '../Model/Types'
import { defaultErrorResponseTranslator } from '../Services/ResponseTranslator'

export type Config = {
  errorResponseTranslator: GraphQlErrorResponseTranslator,
}

export const configManager: ConfigManager<Config> = new ConfigManager<Config>({
  errorResponseTranslator: () => defaultErrorResponseTranslator,
})
