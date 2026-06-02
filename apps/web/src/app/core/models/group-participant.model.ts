import { User } from './user.model';
import { Group } from './group.model';

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

export type JoinGroupDTO = Omit<GroupParticipant, 'id' | 'joined_at' | 'giver_id' | 'receiver_id'>;
