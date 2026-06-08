import { User } from './user.model';

export interface GroupParticipant {
  id: string;
  giver_id: string | null;
  receiver_id: string | null;
  group_id: string;
  joined_at: string;
  expand?: {
    giver_id?: User;
    receiver_id?: User;
    group_id?: Group;
  };
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  has_been_drawn: boolean;
  participants_count: number;
  created: string;
  updated: string;
  expand?: {
    created_by?: User;
    participants_via_group_id?: GroupParticipant[];
  };
}
