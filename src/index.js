let path = require('path');
let orderedPattern = /^(\d+)-(.*)$/;
let leftPad = require('left-pad');

module.exports = class OrderedDirectoryManager {
  constructor(fs) {
    this.fs = fs;
  }
  getDirSync(dir, all) {
    return this.fs
      .readdirSync(dir)
      .map(name => {
        let match = orderedPattern.exec(name);
        if (match) {
          return {
            currentFullName: name,
            order: parseInt(match[1]),
            orderString: match[1],
            name: match[2],
            ordered: true
          };
        } else {
          return {
            currentFullName: name,
            order: Infinity,
            name: name
          };
        }
      })
      .sort((a, b) => a.order - b.order);
  }
  reorderSync(dir, contents, all) {
    contents = all ? contents : contents.filter(x => x.ordered);
    let padLength = Math.ceil(Math.log10(contents.length + 1));
    contents.forEach((content, index) => {
      let order = index + 1;
      let orderString = leftPad(order, padLength, '0');
      if (content.orderString !== orderString) {
        if (content.currentFullName) {
          this.fs.renameSync(
            path.join(dir, content.currentFullName),
            path.join(dir, orderString + '-' + content.name)
          );
        } else {
          let target = path.join(dir, orderString + '-' + content.name);
          if (target.includes('.')) {
            this.fs.writeFileSync(target, '');
          } else {
            this.fs.mkdirSync(target);
          }
        }
      }
    });
  }
  insertSync(dir, name, order) {
    let contents = this.getDirSync(dir);
    if (order) {
      contents.splice(order - 1, 0, { ordered: true, name });
    } else {
      contents.push({ ordered: true, name });
    }
    this.reorderSync(dir, contents);
  }
  moveSync(dir, name, order) {
    let contents = this.getDirSync(dir);
    let currentIndex = contents.findIndex(
      content => content.currentFullName === name
    );
    let toMove = contents[currentIndex];

    if (!toMove) {
      throw new Error('File or directory not found: ' + name + ', in ' + dir);
    }

    contents.splice(currentIndex, 1);
    contents.splice(order - 1, 0, toMove);
    this.reorderSync(dir, contents);
  }
  removeSync(dir, name) {
    let contents = this.getDirSync(dir);
    let currentIndex = contents.findIndex(
      content => content.currentFullName === name
    );
    let toRemove = contents[currentIndex];

    if (!toRemove) {
      throw new Error('File or directory not found: ' + name + ', in ' + dir);
    }

    let pathToRemove = path.join(dir, toRemove.currentFullName);

    contents.splice(currentIndex, 1);
    this.reorderSync(dir, contents);
    if (this.fs.statSync(pathToRemove).isDirectory()) {
      this.fs.rmdirSync(pathToRemove);
    } else {
      this.fs.unlinkSync(pathToRemove);
    }
  }
  fixSync(dir, all) {
    let contents = this.getDirSync(dir);
    this.reorderSync(dir, contents, all);
  }
};
