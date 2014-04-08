
function copy(one) {
  var two = {}
  for (var name in one) {
    two[name] = one[name]
  }
  return two
}

var commands = {
  newNode: {
    args: ['pid', 'index', 'text'],
    apply: function (view, model) {
      var cr = model.create(this.pid, this.index, this.text)
      this.id = cr.node.id
      view.add(cr.node, cr.before)
    },
    undo: function (view, model) {
      view.remove(this.id)
      this.saved = model.remove(this.id)
      var nid = model.ids[this.pid].children[this.index-1]
      if (nid === undefined) nid = this.pid
      view.startEditing(nid)
    },
    redo: function (view, model) {
      var before = model.readd(this.saved)
      view.add(this.saved.node, before)
    }
  },
  appendText: {
    args: ['id', 'text'],
    apply: function (view, model) {
      this.oldtext = model.ids[this.id].data.name
      model.appendText(this.id, this.text)
      view.appendText(this.id, this.text)
    },
    undo: function (view, model) {
      model.setData(this.id, {name: this.oldtext})
      view.setData(this.id, {name: this.oldtext})
    }
  },
  changeNode: {
    args: ['id', 'newdata'],
    apply: function (view, model) {
      this.olddata = copy(model.ids[this.id].data)
      model.setData(this.id, this.newdata)
      view.setData(this.id, this.newdata)
    },
    undo: function (view, model) {
      model.setData(this.id, this.olddata)
      view.setData(this.id, this.olddata)
    }
  },
  remove: {
    args: ['id'],
    apply: function (view, model) {
      this.saved = model.remove(this.id)
      view.remove(this.id)
    },
    undo: function (view, model) {
      var before = model.readd(this.saved)
      view.add(this.saved.node, before)
    }
  },
  move: {
    args: ['id', 'pid', 'index'],
    apply: function (view, model) {
      this.opid = model.ids[this.id].parent
      this.oindex = model.ids[this.opid].children.indexOf(this.id)
      var before = model.move(this.id, this.pid, this.index)
      view.move(this.id, this.pid, before)
    },
    undo: function (view, model) {
      var before = model.move(this.id, this.opid, this.oindex)
      view.move(this.id, this.opid, before)
    }
  }
}
