# Awesome Tree

engine:

[![Coverage Status](https://coveralls.io/repos/github/Bajdzis/awesome-tree/badge.svg?branch=master)](https://coveralls.io/github/Bajdzis/awesome-tree?branch=master)
![npm](https://img.shields.io/npm/v/awesome-tree-engine)


vscode extension:

[![Build Status](https://travis-ci.com/Bajdzis/vscode-awesome-tree.svg?branch=master)](https://travis-ci.com/Bajdzis/vscode-awesome-tree)
[![Coverage Status](https://coveralls.io/repos/github/Bajdzis/vscode-awesome-tree/badge.svg?branch=master)](https://coveralls.io/github/Bajdzis/vscode-awesome-tree?branch=master)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


### Extension for Visual Studio Code

![logo](https://github.com/Bajdzis/vscode-awesome-tree/raw/master/readme/awesome-tree-icon.png)

## Features

 - Create structure (file or directory) based on sibling directory
 - Rename directory with file content

## How it work?

This extension handle all events about create directory.
If you want to exclude folder you have to change the `awesomeTree.excludeWatchRegExp` setting.
By default, we skip the files listed in `.gitignore` file.
Once you have created the folder, we start analyzing the contents of the siblings folders.
After the analysis is completed, we will ask if you want to create files and folders based on siblings structure.

For example, you have a project with this structure:
```
src
├── components
│   ├── firstComponent
|   |   ├── firstComponent.js
|   |   ├── firstComponent.html
|   │   └── firstComponent.css
│   └── headerComponent
|       ├── headerComponent.js
|       ├── headerComponent.html
|       └── headerComponent.css
└── tests
    ├── header
    |   ├── HeaderTests.js
    │   └── mockData.js
    └── price
        ├── PriceTests.js
        └── mockData.js
```

When you create new folder `footerComponent` in `./src/components/` this extension generate 3 files in new directory: footerComponent.js, footerComponent.html and footerComponent.css.
Otherwise if we create the folder `awesome` in the path `./src/tests/` this extension will create the files `AwesomeTests.js` and `mockData.js`
Generated files have content!
