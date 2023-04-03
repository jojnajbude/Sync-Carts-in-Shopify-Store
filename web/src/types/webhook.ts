export interface Webhook {
  id: number,
  address: string,
  topic: string,
  created_at: string,
  updated_at: string,
  format: string,
  fields: any[],
  metafield_namespaces: any[],
  api_version: string,
  private_metafield_namespaces: any[]
}