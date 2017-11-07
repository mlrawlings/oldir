# &lt;ol>dir

A utility for managing a directory with ordered contents:

```
docs/
   1-installing.md
   2-hello-world.md
   3-advanced-usage.md
```

## Install

```
npm i -g oldir
```

## Commands

### `ol add`

Insert as the next available number:

```
ol add filename
```

Insert as the specified number and shift everything else:

```
ol add filename 2
```

### `ol mv`

Move a file or directory to a new place in the list:

```
ol mv 1-filename 3
```

### `ol rm`

Remove a file or directory to from the list:

```
ol mv 1-filename
```

### `ol fix`

Normalize the order of the directory:

```
ol fix
```

Normalize the order of the directory and assign numbers to any files in the directory that don't already have numbers:

```
ol fix --all
```

## Programatic API

```js
let fs = require('fs');
let OrderedDirectoryManager = require('oldir');
let oldir = new OrderedDirectoryManager(fs);

oldir.insertSync(process.cwd(), 'filename', 3);
oldir.moveSync(process.cwd(), '01-filename', 3);
oldir.removeSync(process.cwd(), '01-filename');
oldir.fixSync(process.cwd(), false);
```