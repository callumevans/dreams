import React from "react";
import ReactDOM from "react-dom";
import AppMenu from "./components/app-menu";
import Editor from "./components/editor";
import Bookmarks from "./components/bookmarks";
import Mousetrap from "mousetrap";
import path from "path";
import fs from "fs";

const { remote } = require('electron');

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            files: []
        };

        this.loadFile = this.loadFile.bind(this);
        this.loadFileDialog = this.loadFileDialog.bind(this);
        this.setActiveFile = this.setActiveFile.bind(this);
        this.findHeadings = this.findHeadings.bind(this);
        this.handleEditorOnChange = this.handleEditorOnChange.bind(this);
        this.onHeadingClicked = this.onHeadingClicked.bind(this);
        this.onCloseFile = this.onCloseFile.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.persistState = this.persistState.bind(this);
        this.loadPersistentState = this.loadPersistentState.bind(this);

        Mousetrap.bind(["ctrl+s"], this.saveChanges);
        Mousetrap.bind(["ctrl+o"], this.loadFileDialog);
        Mousetrap.bind(["ctrl+shift+enter"], this.toggleFullscreen);
    }

    componentDidMount() {
        fs.access('./state', fs.F_OK, (err) => {
            if (err) {
                fs.copyFile(`${__dirname}/assets/intro.md`, `${__dirname}/intro.md`, (err) => {
                    this.loadFile(`${__dirname}/intro.md`);
                });
            } else {
                this.loadPersistentState();
            }
        });
    };

    loadFileDialog() {
        remote.dialog.showOpenDialog({
            filters: [{
                name: 'Text Files', extensions: ['txt', 'md']
            }],
        }, (file) => {
            if (file) {
                this.loadFile(file[0]);
            }
        });
    }

    persistState() {
        const files = this.state.files.map(file => {
            return {
                path: file.path,
                isActive: file.isActive,
            }
        });

        return new Promise((res, rej) => {
            fs.writeFile('./state', JSON.stringify({ files: files }), (err) => {
                if (err) {
                    console.error(err);
                    rej(err);
                }

                res();
            });
        });
    }

    loadPersistentState() {
        return new Promise((res, rej) => {
            fs.readFile('./state', 'utf-8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                const persistedState = JSON.parse(data);
                let loadFilePromises = [];

                persistedState.files.forEach(file => {
                    loadFilePromises.push(this.loadFile(file.path, false));
                });

                Promise.all(loadFilePromises).then(() => {
                    this.setActiveFile(persistedState.files.find(file => file.isActive).path);
                });
            });
        });
    }

    setActiveFile(filePath) {
        const state = this.state;

        state.files.forEach(file => file.isActive = false);
        const targetFile = state.files.find(file => file.path === filePath);
        targetFile.isActive = true;

        this.setState(state, () => this.persistState());
    }

    loadFile(filePath, setActive = true) {
        return new Promise((res, rej) => {
            const state = this.state;

            if (state.files.find(f => f.path === filePath)) {
                this.setActiveFile(filePath);
                return;
            }

            const name = path.parse(filePath).name;

            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    throw err;
                }

                state.files.forEach(file => file.isActive = false);

                fs.watchFile(filePath, { interval: 1000 }, (curr, prev) => {
                    this.syncFileChanges(filePath, curr.mtimeMs)
                });

                state.files.push({
                    path: filePath,
                    title: name,
                    isActive: setActive,
                    content: data,
                    headings: this.findHeadings(data),
                    syncTime: new Date().getTime(),
                });

                this.setState(state, () => {
                    this.persistState().then(() => {
                        res();
                    });
                });
            });
        });
    };

    onCloseFile(filePath) {
        const state = this.state;

        console.log(filePath);
        console.log(state.files[0])

        state.files = state.files.filter((f) => f.path !== filePath);

        console.warn(state.files)

        this.setState(state, () => {
            fs.unwatchFile(filePath);
            this.persistState();
        });
    };

    syncFileChanges(filePath, updatedTime) {
        const state = this.state;
        const activeFile = state.files.find(file => file.path === filePath);

        if (updatedTime > activeFile.syncTime) {
            fs.readFile(filePath, 'utf-8', (err, data) => {
                activeFile.content = data;
                this.setState(state);
            });
        }
    }

    handleEditorOnChange(event) {
        const state = this.state;
        const activeFile = state.files.find(file => file.isActive);

        activeFile.content = event.target.value;
        activeFile.syncTime = new Date().getTime();
        activeFile.headings = this.findHeadings(event.target.value);

        this.setState(state);
    };

    findHeadings(text) {
        const lines = text.split('\n');
        const headings = [];

        lines.forEach((line, index) => {
            if (line.startsWith('#')) {
                headings.push({
                    text: line.replace(/#/g, '').trim(),
                    lineNumber: index,
                });
            }
        });

        return headings;
    }

    saveChanges() {
        const state = this.state;
        const activeFile = state.files.find(file => file.isActive);

        fs.writeFile(activeFile.path, activeFile.content, (err) => {
            if (err) {
                throw err;
            }
        });
    };

    toggleFullscreen() {
        const window = remote.getCurrentWindow();

        if (window.isFullScreen()) {
            window.setFullScreen(false);
        } else {
            window.setFullScreen(true);
        }
    };

    onHeadingClicked(heading) {
        this.editor.scrollTo(heading.lineNumber);
    };

    render() {
        const fileContent = this.state.files.find(x => x.isActive === true);
        let value = '';

        if (fileContent && fileContent.content) {
            value = fileContent.content;
        }

        return (
            <div>
                <AppMenu />
                <Bookmarks
                    files={this.state.files}
                    onSelectFile={this.setActiveFile}
                    onHeadingClicked={this.onHeadingClicked}
                    onCloseFile={this.onCloseFile}
                />
                <Editor
                    content={value}
                    enabled={this.state.files.some((file) => file.isActive)}
                    onRef={ref => (this.editor = ref)}
                    onChange={this.handleEditorOnChange}
                />
            </div>
        )
    }
}

ReactDOM.render(<App />, document.getElementById("root"));
