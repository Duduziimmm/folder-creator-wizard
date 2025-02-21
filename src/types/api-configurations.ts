
export interface ApiConfiguration {
  id: string;
  user_id: string;
  api_key: string;
  webhook_url: string;
  is_prod: boolean;
  created_at: string;
  updated_at: string;
}

export type ApiConfigurationInsert = Omit<ApiConfiguration, 'id' | 'created_at' | 'updated_at'>;
