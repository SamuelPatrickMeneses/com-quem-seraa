/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  try {
    const groupId = e.record.getString("group_id")
    if (!groupId) return
    const group = $app.findRecordById("groups", groupId)
    if (group) {
      group.set("participants_count", group.getInt("participants_count") + 1)
      $app.save(group)
    }
  } catch (err) {
    console.error("participants_count hook error (create):", err)
  }
}, "group_participants")

onRecordAfterDeleteSuccess((e) => {
  try {
    const groupId = e.record.getString("group_id")
    if (!groupId) return
    const group = $app.findRecordById("groups", groupId)
    if (group) {
      const newCount = Math.max(0, group.getInt("participants_count") - 1)
      group.set("participants_count", newCount)
      $app.save(group)
    }
  } catch (err) {
    console.error("participants_count hook error (delete):", err)
  }
}, "group_participants")
