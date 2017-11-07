let OrderedDirectoryManager = require('./src');
let Volume = require('memfs').Volume;
let expect = require('chai').expect;

describe('OrderedDirectoryManager', () => {
  describe('insertSync', () => {
    it('should add a directory', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');

      oldir.insertSync('/tmp', 'foo', 1);
      expect(fs.readdirSync('/tmp')).to.eql(['1-foo']);
      expect(fs.statSync('/tmp/1-foo').isDirectory()).to.be.true;
    });

    it('should add a file', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');

      oldir.insertSync('/tmp', 'foo.js', 1);
      expect(fs.readdirSync('/tmp')).to.eql(['1-foo.js']);
      expect(fs.statSync('/tmp/1-foo.js').isFile()).to.be.true;
    });

    it('should add an entry and reorder', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/1-foo');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/3-baz');

      oldir.insertSync('/tmp', 'hello', 3);
      expect(fs.readdirSync('/tmp')).to.eql([
        '1-foo',
        '2-bar',
        '3-hello',
        '4-baz'
      ]);
    });

    it('should append if no order given', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/1-foo');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/3-baz');

      oldir.insertSync('/tmp', 'hello');
      expect(fs.readdirSync('/tmp')).to.eql([
        '1-foo',
        '2-bar',
        '3-baz',
        '4-hello'
      ]);
    });

    it('should pad entries', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/1-foo');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/3-baz');
      fs.mkdirSync('/tmp/4-bat');
      fs.mkdirSync('/tmp/5-yolo');
      fs.mkdirSync('/tmp/6-kit');
      fs.mkdirSync('/tmp/7-van');
      fs.mkdirSync('/tmp/8-nut');
      fs.mkdirSync('/tmp/9-mit');

      oldir.insertSync('/tmp', 'hello', 3);
      expect(fs.readdirSync('/tmp')).to.eql([
        '01-foo',
        '02-bar',
        '03-hello',
        '04-baz',
        '05-bat',
        '06-yolo',
        '07-kit',
        '08-van',
        '09-nut',
        '10-mit'
      ]);
    });
  });

  describe('moveSync', () => {
    it('should move an entry', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/1-foo');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/3-baz');

      oldir.moveSync('/tmp', '3-baz', 2);
      expect(fs.readdirSync('/tmp')).to.eql(['1-foo', '2-baz', '3-bar']);
    });

    it('should throw when trying to move a non existent entry', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/1-foo');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/3-baz');

      expect(() => oldir.moveSync('/tmp', 'nope')).to.throw(/not found/);
    });
  });

  describe('removeSync', () => {
    it('should remove a directory', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/1-foo');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/3-baz');

      oldir.removeSync('/tmp', '2-bar');
      expect(fs.readdirSync('/tmp')).to.eql(['1-foo', '2-baz']);
    });

    it('should remove a file', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.writeFileSync('/tmp/1-foo.js', '');
      fs.writeFileSync('/tmp/2-bar.js', '');
      fs.writeFileSync('/tmp/3-baz.js', '');

      oldir.removeSync('/tmp', '2-bar.js');
      expect(fs.readdirSync('/tmp')).to.eql(['1-foo.js', '2-baz.js']);
    });

    it('should throw when trying to remove a non existent entry', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/1-foo');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/3-baz');

      expect(() => oldir.removeSync('/tmp', 'nope')).to.throw(/not found/);
    });
  });

  describe('fixSync', () => {
    it('should fix ordered entries', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/2-bar');
      fs.mkdirSync('/tmp/4-baz');
      fs.mkdirSync('/tmp/foo');

      oldir.fixSync('/tmp');
      expect(fs.readdirSync('/tmp')).to.eql(['1-bar', '2-baz', 'foo']);
    });

    it('should fix all entries', () => {
      let fs = new Volume();
      let oldir = new OrderedDirectoryManager(fs);
      fs.mkdirSync('/tmp');
      fs.mkdirSync('/tmp/bar');
      fs.mkdirSync('/tmp/baz');
      fs.mkdirSync('/tmp/foo');

      oldir.fixSync('/tmp', true);
      expect(fs.readdirSync('/tmp')).to.eql(['1-bar', '2-baz', '3-foo']);
    });
  });
});
