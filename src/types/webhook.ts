export interface WebhookValue {
  id: string;
  name: string;
  value: string;
  persist: boolean;
  updated_at?: string;
  created_by?: string;
}

export interface WebhookPayload {
  event_id: string;
  webhook_id: string;
  device_id: string;
  thing_id: string;
  values: WebhookValue[];
}
