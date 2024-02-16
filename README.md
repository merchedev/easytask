# EasyTask - Visual Studio Code Extension

EasyTask is an extension for Visual Studio Code that facilitates task management within your project.

## Features

- Finds all the comments in your project starting with TODO, ignoring 'node_modules', '.git', 'out' and 'build' folders.
- Lists them in a side view that appears when clicking the button with the extension icon on the activity bar.
- Clicking on a task takes you to the corresponding file and line.
- You can group by: none (default), files, folders.
- You can refresh with the refresh button. you must save the file first.
- Accepted comments:
 - Single line comments: `// # --`
 - Block comments: `<!-- -->  /* */   ''' '''  """ """`


## Installation

1. Open Visual Studio Code.
2. Go to the Extensions tab (Ctrl+Shift+X).
3. Search for "EasyTask" and click Install.

## Usage

You can access EasyTask in the following ways:

- Click the "EasyTask" button on the Visual Studio Code Activity Bar.
- Execute the command `EasyTask: Show Tasks` from the command palette (Ctrl+Shift+P).

## Development

If you wish to contribute to the development of EasyTask, follow these steps:

1. Clone this repository.
2. Open the project in Visual Studio Code.
3. Run `npm install` to install dependencies.
4. Run the extension in development mode with the F5 key.

## Contributing

If you find any bugs or have any suggestions, feel free to open an issue or submit a pull request.

## Credits

EasyTask is maintained by MercheDev.

## License

This project is licensed under the MIT License. See the LICENSE.md file for more details.
