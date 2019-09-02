const { app, BrowserWindow } = require('electron');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: false,
        webPreferences: { zoomFactor: 1.0, nodeIntegration: true, backgroundThrottling: false },
        titleBarStyle: "hidden",
        minHeight: 400,
        minWidth: 500,
        show: false,
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on('closed', function () {
        mainWindow = null;
        app.quit();
    });

    mainWindow.on('ready-to-show', function() {
        mainWindow.show();
        mainWindow.focus();
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('ready', createWindow);
