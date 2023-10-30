import React, { Component } from "react";

class SideBar extends Component {
    state = {
        isCollapsed: false
    };

    toggleCollapse = () => {
        this.setState((prevState: any) => ({
            isCollapsed: !prevState.isCollapsed
        }));
        console.log("State: " + this.state.isCollapsed);
        if (this.state.isCollapsed) {
            this.openNav();
        } else {
            this.closeNav();
        }
    };

    openNav() {
        const sideBar = document.getElementById("sideBar_1");
        const btnClose = document.getElementById("btnClose");
        const content = document.getElementById("content");
        const waveForm: any = document.getElementsByClassName("waveForm")[0];
        if (sideBar && btnClose && content) {
            sideBar.style.width = "250px";
            btnClose.innerHTML = "×";
            content.style.display = "block";
            waveForm.style.width = "100%";
            waveForm.style.margin = "0 auto";
        }
    }

    closeNav() {
        const sideBar = document.getElementById("sideBar_1");
        const btnClose = document.getElementById("btnClose");
        const content = document.getElementById("content");
        const waveForm: any = document.getElementsByClassName("waveForm")[0];
        if (sideBar && btnClose && content && waveForm) {
            sideBar.style.width = "50px";
            btnClose.innerHTML = "☰";
            content.style.display = "none";
            waveForm.style.width = "calc(100% - 200px)";
            waveForm.style.margin = "0 auto";
        }
    }

    render() {
        return (
            <div className="sidebar" id="sideBar_1">
                <button className="closebtn" id="btnClose" onClick={this.toggleCollapse}>×</button>
                <div id="content">
                    <strong>Voice commands 🎙️</strong>
                    <ul style={{paddingLeft: "15px"}}>
                        <li>🎙️ Start/Play</li>
                        <li>🎙️ Pause/Stop</li>
                        <li>🎙️ Repeat/Loop</li>
                        <li>🎙️ Next</li>
                    </ul>
                    <strong>Gestures 🙌</strong>
                    <br/>
                    <p>Use only 1 hand at the time</p>
                    <ul style={{paddingLeft: "15px"}}>
                        <li>Right Hand 🖐️ + ✊: Play/Pause</li>
                        <li>Right Hand 👍 + Rotate: control speed</li>
                        <li>Right Hand 👆 + ↔️: Volume control</li>
                        <li>Left Hand 🖐️ + 👌 with every finger: play the drum</li>
                        <li>Left Hand ✌️ + 🤞: Start a loop</li>
                        <li>Right Hand ✌️ + 🤞: Close a loop</li>
                        <li>Left Hand ✌️: To remove a loop</li>
                    </ul>
                </div>
            </div>
        );
    }
}

export default SideBar;
