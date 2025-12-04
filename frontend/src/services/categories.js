// Categories services: data helpers only.

export function normalizeCategory(c = {}) {
  return {
    id: c.id || c.ma || null,
    name: c.name || c.ten || null,
    parentId: c.parent_id || c.danh_muc_cha_id || null,
    ...c
  };
}

export function buildCategoryTree(list = []) {
  // simple tree builder (flat parent_id -> children)
  const map = {};
  list.forEach(i => { map[i.id] = { ...i, children: [] }; });
  const roots = [];
  list.forEach(i => {
    const node = map[i.id];
    const pid = i.parentId || i.danh_muc_cha_id || null;
    if (pid && map[pid]) map[pid].children.push(node);
    else roots.push(node);
  });
  return roots;
}