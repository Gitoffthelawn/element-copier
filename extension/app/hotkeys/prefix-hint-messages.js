var PREFIX_HINT_SHOW = "PREFIX_HINT_SHOW";

var PREFIX_HINT_HIDE = "PREFIX_HINT_HIDE";

var PREFIX_HINT_CAN_SHOW = "PREFIX_HINT_CAN_SHOW";

var PREFIX_HINT_BLOCKED = "PREFIX_HINT_BLOCKED";

function isPrefixHintShowMessage(msg) {
  return msg.type === PREFIX_HINT_SHOW;
}

function isPrefixHintHideMessage(msg) {
  return msg.type === PREFIX_HINT_HIDE;
}

export { PREFIX_HINT_BLOCKED, PREFIX_HINT_CAN_SHOW, PREFIX_HINT_HIDE, PREFIX_HINT_SHOW, isPrefixHintHideMessage, isPrefixHintShowMessage };
