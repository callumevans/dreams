import React from "react";

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.textArea = React.createRef();
        this.scrollTo = this.scrollTo.bind(this);
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    scrollTo(lineNumber) {
        let lineIndex = 0;

        for (let targetChar = 0; targetChar < this.props.content.length; targetChar++) {
            if (this.props.content[targetChar] === '\n') {
                lineIndex++;
            }

            if (lineIndex === lineNumber) {
                targetChar++;
                this.textArea.current.setSelectionRange(targetChar, targetChar);
                this.textArea.current.focus();
                break;
            }
        }
    }

    render() {
        return (
            <div id="editor">
                { this.props.enabled &&
                    <textarea id="editorTextArea"
                              className="mousetrap"
                              ref={this.textArea}
                              autoFocus={true}
                              value={this.props.content}
                              onChange={this.props.onChange}
                    />
                }
            </div>
        );
    }
}

export default Editor;
