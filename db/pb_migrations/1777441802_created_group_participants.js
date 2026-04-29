/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\" && group_id.has_been_drawn = false",
    "deleteRule": "@request.auth.id = giver_id || group_id.created_by = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3346940990",
        "help": "",
        "hidden": false,
        "id": "relation4266973511",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "group_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation1975328041",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "giver_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation3444829622",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "receiver_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      }
    ],
    "id": "pbc_4144158273",
    "indexes": [],
    "listRule": "@request.auth.id = giver_id || @request.auth.id = receiver_id || group_id.created_by = @request.auth.id",
    "name": "group_participants",
    "system": false,
    "type": "base",
    "updateRule": "group_id.created_by = @request.auth.id",
    "viewRule": "@request.auth.id = giver_id || @request.auth.id = receiver_id || group_id.created_by = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4144158273");

  return app.delete(collection);
})
