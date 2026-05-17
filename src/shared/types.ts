// Emby Player TypeScript Interfaces

export interface AuthResult {
  UserId: string
  AccessToken: string
  ServerId: string
}

export interface MediaFolder {
  Name: string
  Id: string
  Type: string
  CollectionType?: string
}

export interface EmbyItem {
  Name: string
  Id: string
  Type: string
  MediaType?: string
  Overview?: string
  Taglines?: string[]
 Genres?: string[]
  CommunityRating?: number
  OfficialRating?: string
  ProductionYear?: number
  EndDate?: string
  Status?: string
  EpisodeCount?: number
  SeasonCount?: number
  ImageTags?: Record<string, string>
  BackdropImageTags?: string[]
  PrimaryImageAspectRatio?: number
  ChildCount?: number
  PremiereDate?: string
  DateCreated?: string
  Channels?: { UserData?: { UnplayedItemCount?: number; PlayedItemCount?: number } }[]
}

export interface Season {
  Name: string
  Id: string
  IndexNumber: number
  SeriesId: string
  SeriesName: string
  Overview?: string
  ImageTags?: Record<string, string>
  PrimaryImageAspectRatio?: number
  EpisodeCount?: number
}

export interface Episode {
  Name: string
  Id: string
  Type: string
  IndexNumber?: number
  ParentIndexNumber?: number
  Overview?: string
  SeriesId?: string
  SeasonId?: string
  SeasonName?: string
  CommunityRating?: number
  ProductionYear?: number
  PremiereDate?: string
  ImageTags?: Record<string, string>
  MediaSources?: MediaSource[]
}

export interface MediaSource {
  Id: string
  Protocol: string
  Type: string
  MediaStreams?: MediaStream[]
  Container?: string
  Path?: string
  Size?: number
}

export interface MediaStream {
  Codec: string
  Type: string
  Index: number
  Profile?: string
  Level?: number
  Width?: number
  Height?: number
  BitRate?: number
  Language?: string
  Title?: string
}

export interface SearchHint {
  Name: string
  Id: string
  Type: string
  MediaType?: string
  ThumbImageTag?: string
  ParentId?: string
  ParentName?: string
  IsMedia?: boolean
}

export interface EmbyRequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
}

export interface EmbyResponse<T = unknown> {
  ok: boolean
  status: number
  data: T
}
