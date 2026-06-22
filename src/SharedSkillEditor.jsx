function createSkillEditorHandlers(options) {
  var setSkills = options.setSkills;
  var setFluencies = options.setFluencies;
  var setCustomSkill = options.setCustomSkill;
  var adjustedSkillsRef = options.adjustedSkillsRef;
  var setAdjustedSkills = options.setAdjustedSkills;
  var onRemoveExtra = options.onRemoveExtra || function () {};

  function startEditing(id) {
    setSkills(function (p) {
      return p.map(function (s) {
        return s.id === id ? Object.assign({}, s, { editing: true }) : s;
      });
    });
  }

  function updateText(id, text) {
    setSkills(function (p) {
      return p.map(function (s) {
        return s.id === id ? Object.assign({}, s, { text: text }) : s;
      });
    });
  }

  function commitEdit(id) {
    setSkills(function (p) {
      return p.map(function (s) {
        return s.id === id ? Object.assign({}, s, { editing: false }) : s;
      });
    });
  }

  function removeSkill(id) {
    setSkills(function (p) {
      return p.filter(function (s) {
        return s.id !== id;
      });
    });
    if (setFluencies) {
      setFluencies(function (p) {
        var n = Object.assign({}, p);
        delete n[id];
        return n;
      });
    }
    onRemoveExtra(id);
    if (adjustedSkillsRef && setAdjustedSkills) {
      adjustedSkillsRef.current.delete(id);
      setAdjustedSkills(new Set(adjustedSkillsRef.current));
    }
  }

  function addSkill(customSkill) {
    var t = (customSkill || "").trim();
    if (!t) return;
    var id = "s" + Date.now();
    setSkills(function (p) {
      return p.concat([{ id: id, text: t, editing: false }]);
    });
    if (setCustomSkill) setCustomSkill("");
  }

  return {
    startEditing: startEditing,
    updateText: updateText,
    commitEdit: commitEdit,
    removeSkill: removeSkill,
    addSkill: addSkill,
  };
}

function SkillCountBadge(props) {
  var count = props.count;
  var max = props.max != null ? props.max : 8;
  var tokens = props.tokens;
  return (
    <div
      style={{
        fontFamily: tokens.mono,
        fontSize: 12,
        color: count >= max ? tokens.red : tokens.dim,
        fontWeight: 700,
      }}
    >
      {count} / {max}
    </div>
  );
}

function skillsFromGeneratedList(skills) {
  return skills.map(function (text, i) {
    return { id: "s" + i, text: text, editing: false };
  });
}

export { createSkillEditorHandlers, SkillCountBadge, skillsFromGeneratedList };
