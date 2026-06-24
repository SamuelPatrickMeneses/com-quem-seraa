/// <reference path="../pb_data/types.d.ts" />
routerAdd("GET", "/api/join", (e) => {
  const code = e.request.url.query().get("code");

  if (!code) {
    return e.json(400, { error: "Código do grupo é obrigatório." });
  }

  const group = $app.findRecordById("groups", code);
  if (!group) {
    return e.json(404, { error: "Grupo não encontrado." });
  }

  if (group.getBool("has_been_drawn")) {
    return e.json(400, { error: "Este grupo já foi sorteado e não aceita novos membros." });
  }

  const authUser = e.auth;
  if (!authUser) {
    return e.json(401, { error: "Usuário não autenticado." });
  }

  const existingParticipant = $app.findFirstRecordByFilter("group_participants",
    `group_id = '${code}' && giver_id = '${authUser.id}'`
  );
  if (existingParticipant) {
    return e.json(200, { redirect: `/group/${code}` });
  }

  if (group.getString("created_by") === authUser.id) {
    return e.json(200, { redirect: `/group/${code}` });
  }

  const participantsCollection = $app.findCollectionByNameOrId("group_participants");
  const participant = new Record(participantsCollection);
  participant.set("group_id", code);
  participant.set("giver_id", authUser.id);
  participant.set("giver_name", authUser.getString("name"));
  participant.set("receiver_id", null);
  participant.set("receiver_name", null);
  $app.save(participant);

  group.set("participants_count", group.getInt("participants_count") + 1);
  $app.save(group);

  return e.json(200, { redirect: `/group/${code}` });
});
