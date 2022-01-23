const template = require("art-template");

template.defaults.imports.classNameFilter = function (value) {
  if (value === 0) {
    return "first";
  } else if (value === 1) {
    return "second";
  } else if (value === 2) {
    return "third";
  } else {
    return "";
  }
};
