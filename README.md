# Awesome Tree

[![Support this project](https://img.shields.io/badge/GitHub_Sponsors-Bajdzis-green)](https://github.com/sponsors/Bajdzis/)
[![Build Status](https://travis-ci.com/Bajdzis/vscode-awesome-tree.svg?branch=master)](https://travis-ci.com/Bajdzis/vscode-awesome-tree)
[![Coverage Status](https://coveralls.io/repos/github/Bajdzis/vscode-awesome-tree/badge.svg?branch=master)](https://coveralls.io/github/Bajdzis/vscode-awesome-tree?branch=master)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

<img src="https://github.com/Bajdzis/vscode-awesome-tree/raw/master/readme/awesome-tree-icon.png" alt="logo" style="max-width:100px">

Extension for Visual Studio Code which analyze your files content **on your computer**!
We analyze files content by whitespace indentation so we can supports all programming languages. Parse algorithm is available on NPM :

https://www.npmjs.com/package/awesome-tree-engine


[![Coverage Status](https://coveralls.io/repos/github/Bajdzis/awesome-tree/badge.svg?branch=master)](https://coveralls.io/github/Bajdzis/awesome-tree?branch=master)
![npm](https://img.shields.io/npm/v/awesome-tree-engine)


## Features

- Create file content after creating a new file. We try to put the file name in the generated content.

![create file](https://github.com/Bajdzis/vscode-awesome-tree/raw/master/readme/create-file.gif)

- Create structure after creating new directory. We analyze siblings directories and create files with content.

![create directory](https://github.com/Bajdzis/vscode-awesome-tree/raw/master/readme/create-directory.gif)

- You can compare files if you want to find out on what basis the content was generated.

![compare files](https://github.com/Bajdzis/vscode-awesome-tree/raw/master/readme/compare-files.gif)

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
