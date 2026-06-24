/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4144158273")

  collection.indexes.push("CREATE UNIQUE INDEX `idx_uniqueParticipant_pbc_4144158273` ON `group_participants` (`group_id`, `giver_id`)")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4144158273")

  collection.indexes = collection.indexes.filter(i => !i.includes("idx_uniqueParticipant_pbc_4144158273"))

  return app.save(collection)
})
