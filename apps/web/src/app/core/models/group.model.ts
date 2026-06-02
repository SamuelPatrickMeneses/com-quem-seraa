import type { User } from './user.model';
import type { GroupParticipant } from './group-participant.model';

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  has_been_drawn: boolean;
  participants_count: number;
  expand?: {
    created_by?: User;
    participants_via_group_id?: GroupParticipant[];
  };
}

export type CreateGroupDTO = Omit<Group, 'id' | 'created_at' | 'has_been_drawn'>;
