import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, MenuItem, Select } from "@mui/material";
import * as React from 'react';
import groupCallsController from "../../lib/calls/groupCallsController";
import rootScope from "../../lib/rootScope";

function AudioSetting() {
    const [open, setOpen] = React.useState(true)
    const [inputDeviceId, setInputDeviceId] = React.useState(localStorage.getItem('audioinput') || 'default');
    const [outputDeviceId, setOutputDeviceId] = React.useState(localStorage.getItem('audiooutput') || 'default');

    React.useEffect(() => {
        rootScope.allDispatch.openAudioSetting = (open: boolean) => {
            setOpen(open)
        }
        return () => {
            rootScope.allDispatch.openAudioSetting = () => { }
        }
    }, [setOpen])

    async function handleInputChange(e) {
        const value = e.target.value;
        setInputDeviceId(value);
        localStorage.setItem("audioinput", value)

        const currentGroupCall = groupCallsController.groupCall
        if (currentGroupCall) {
            const { streamManager } = currentGroupCall
            if (!streamManager) return;
            currentGroupCall.switchAudioInput(value);
        }
    }

    function handleOutputChange(e) {
        const value = e.target.value;
        setOutputDeviceId(value);
        localStorage.setItem("audiooutput", value)
        const player = document.getElementsByClassName('call-player')[0];
        if (player) {
            for (let audio of player.getElementsByTagName('audio')) {
                // @ts-ignore
                audio.setSinkId(value);
            }
        }
    }

    const devices = groupCallsController.groupCall.devices;
    const inputDevices = (devices || []).filter(x => x.kind === 'audioinput' && x.deviceId);
    const outputDevices = (devices || []).filter(x => x.kind === 'audiooutput' && x.deviceId);

    return (<Dialog open={open}>
        <DialogTitle>音频设置</DialogTitle>
        <DialogContent>
            <div>
                <FormControl sx={{ m: 1, width: 300 }} size="small">
                    输入设备：
                    <Select sx={{ mt: 1 }}
                        value={inputDeviceId}
                        onChange={handleInputChange}
                    >
                        {
                            inputDevices.map(x => {
                                return (<MenuItem value={x.deviceId}>{x.label}</MenuItem>)
                            })
                        }
                    </Select>
                </FormControl>
            </div>

            <div>
                <FormControl sx={{ m: 1, width: 300 }} size="small">
                    输出设备：
                    <Select
                        sx={{ mt: 1 }}
                        value={outputDeviceId}
                        onChange={handleOutputChange}
                    >
                        {
                            outputDevices.map(x => {
                                return (<MenuItem value={x.deviceId}>{x.label}</MenuItem>)
                            })
                        }
                    </Select>
                </FormControl>
            </div>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
                console.log("点击")
                setOpen(false)
            }}>完成</Button>
        </DialogActions>
    </Dialog>)
}

export default function showAudioSetting() {
    rootScope.dialogRoot.render(<AudioSetting />)
    if (rootScope.allDispatch.openAudioSetting)
        rootScope.allDispatch.openAudioSetting(true)
}
