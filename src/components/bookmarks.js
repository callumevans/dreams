import React from "react";

const Bookmarks = ({ files, onSelectFile, onHeadingClicked, onCloseFile }) => (
    <div id="bookmarks">
        {
            files.map(file => {
                {
                    return (
                        <div key={file.path}>
                            <div className={"titleContainer"}>
                                <span className={"closeFile"} onClick={() => onCloseFile(file.path)}>X</span>
                                <h1 className={file.isActive ? "active" : ""} onClick={() => onSelectFile(file.path)}>{file.title}</h1>
                            </div>
                            { file.isActive && file.headings && file.headings.map((heading, index) => (
                                <h2 key={index} onClick={() => onHeadingClicked(heading)}>{heading.text}</h2>
                            )) }
                        </div>
                    )
                }
            })
        }
    </div>
);

export default Bookmarks;
