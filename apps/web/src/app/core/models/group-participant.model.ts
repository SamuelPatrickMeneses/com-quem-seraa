import { User } from './user.model';
import { Group } from './group.model';

export interface GroupParticipant {
  id: string;
  giver_id: string | null;
  giver_name: string;
  receiver_id: string | null;
  receiver_name: string | null;
  group_id: string;
  joined_at: string;
  expand?: {
    giver_id?: User;
    receiver_id?: User;
    group_id?: Group;
  };
}

export type JoinGroupDTO = Omit<GroupParticipant, 'id' | 'joined_at' | 'giver_id' | 'giver_name' | 'receiver_id' | 'receiver_name'>;
