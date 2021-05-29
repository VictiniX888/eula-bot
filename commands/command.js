module.exports = class Command {
  constructor(name, description, options, getResponseObj) {
    this.name = name;
    this.description = description;
    this.options = options;
    this.getResponseObj = getResponseObj;
    this.registerObj = { name, description, options };
  }
};
