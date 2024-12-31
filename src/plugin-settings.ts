import { UploadStrategy } from './UploadStrategy'

export interface ImgurPluginSettings {
  clientId: string
  authenticated: boolean
}

export const DEFAULT_SETTINGS: ImgurPluginSettings = {
  clientId: '',
  authenticated: false,
}
