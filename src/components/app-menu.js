import React from "react";
import { remote } from "electron";

const AppMenu = () => (
    <div id="titleBar">
        <div id="resizeTopHandle" />
        <div id="windowControls">
            <div id="minimise" className={"button"}>
                <span>&#xE921;</span>
            </div>

            <div id="maximise" className={"button"}>
                <span>&#xE922;</span>
            </div>

            <div id="restore" className={"button"}>
                <span>&#xE923;</span>
            </div>

            <div id="close" className={"button"}>
                <span>&#xE8BB;</span>
            </div>
        </div>
    </div>
);

(function () {
    document.onreadystatechange = () => {
        if (document.readyState === "complete") {
            init();
        }
    };

    function init() {
        let window = remote.getCurrentWindow();

        const minButton = document.getElementById("minimise");
        const maxButton = document.getElementById("maximise");
        const restoreButton = document.getElementById("restore");
        const closeButton = document.getElementById("close");

        minButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.minimize();
        });

        maxButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.maximize();

            toggleMaxRestoreButtons();
        });

        restoreButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();

            if (window.isFullScreen()) {
                window.setFullScreen(false);
            }

            window.unmaximize();

            toggleMaxRestoreButtons();
        });

        closeButton.addEventListener("click", event => {
            window = remote.getCurrentWindow();
            window.close();
        });

        window.on("maximize", toggleMaxRestoreButtons);
        window.on("unmaximize", toggleMaxRestoreButtons);
        window.on("enter-full-screen", toggleMaxRestoreButtons);
        window.on("leave-full-screen", toggleMaxRestoreButtons);

        function toggleMaxRestoreButtons() {
            window = remote.getCurrentWindow();

            if (window.isMaximized() || window.isFullScreen()) {
                maxButton.style.display = "none";
                restoreButton.style.display = "flex";
            } else {
                maxButton.style.display = "flex";
                restoreButton.style.display = "none";
            }
        }
    }
})();

export default AppMenu;
