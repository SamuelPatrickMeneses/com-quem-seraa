/// <reference path="../pb_data/types.d.ts" />

const groupParticipantsMemberRule =
  '@request.auth.id = giver_id || @request.auth.id = receiver_id || group_id.created_by = @request.auth.id || (@collection.group_participants.giver_id ?= @request.auth.id && @collection.group_participants.group_id ?= group_id)';

const usersGroupMemberViewRule =
  '@request.auth.id != "" && (id = @request.auth.id || (@collection.group_participants.giver_id ?= id && @collection.group_participants:auth.giver_id ?= @request.auth.id && @collection.group_participants:auth.group_id ?= @collection.group_participants.group_id))';

migrate((app) => {
  const users = app.findCollectionByNameOrId('_pb_users_auth_');
  unmarshal(
    {
      viewRule: usersGroupMemberViewRule,
    },
    users,
  );
  app.save(users);

  const participants = app.findCollectionByNameOrId('pbc_4144158273');
  unmarshal(
    {
      listRule: groupParticipantsMemberRule,
      viewRule: groupParticipantsMemberRule,
    },
    participants,
  );
  app.save(participants);
}, (app) => {
  const users = app.findCollectionByNameOrId('_pb_users_auth_');
  unmarshal(
    {
      viewRule: 'id = @request.auth.id',
    },
    users,
  );
  app.save(users);

  const participants = app.findCollectionByNameOrId('pbc_4144158273');
  unmarshal(
    {
      listRule:
        '@request.auth.id = giver_id || @request.auth.id = receiver_id || group_id.created_by = @request.auth.id',
      viewRule:
        '@request.auth.id = giver_id || @request.auth.id = receiver_id || group_id.created_by = @request.auth.id',
    },
    participants,
  );
  app.save(participants);
});
