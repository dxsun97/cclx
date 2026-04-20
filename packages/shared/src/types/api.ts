export interface DataSource {
  id: string
  label: string
  path: string
  enabled: boolean
}

export interface Config {
  dataSources: DataSource[]
}

export interface SessionInfo {
  id: string
  filename: string
  size: number
  modified: string
  preview: string
  title: string
}

export interface ProjectInfo {
  sourceId: string
  sourceLabel: string
  sourceDir: string
  dirName: string
  projectPath: string
  sessions: SessionInfo[]
}
