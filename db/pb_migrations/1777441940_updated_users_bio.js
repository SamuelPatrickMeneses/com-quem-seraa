/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId('users');

  if (collection.fields.getByName('bio')) {
    return;
  }

  collection.fields.add(new TextField({
    name: 'bio',
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('users');

  if (!collection.fields.getByName('bio')) {
    return;
  }

  collection.fields.removeByName('bio');

  return app.save(collection);
});