import React from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from '@material-ui/core/Tooltip';

import PropTypes from "prop-types";
import { connect } from "react-redux";

import { activatePreset } from "frontend/actions";
import { render } from "react-dom";

const styles = (theme) => ({
  button: {
    margin: theme.spacing.unit,
    float: "right",
  },
  submitControls: {
    margin: theme.spacing.unit,
    display: "block",
    width: "100%",
  },
});

var navigator = require("web-midi-api");
var navigator = require("jzz");

class MidiControl extends React.Component {
  midi;
  inputs;
  ouputs;

  componentDidMount() {
    navigator
      .requestMIDIAccess()
      .then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
  }

  constructor(props) {
    super(props);
    this.state = {
      status: null,
      midiname: null,
      brightnessSlider: 0,
      display: false,
    };
  }

  stopOutputs() {
    this.outputs.forEach(function (port) {
      port.send([0x80, 60, 0]);
    });
    this.testInputs();
  }

  onMIDISuccess(midiAccess) {
    if (!midiAccess) {
      debugger;
    }
    this.midi = midiAccess;
    this.inputs = midiAccess.inputs;
    this.outputs = midiAccess.outputs;
    setTimeout(this.midiOutput.bind(this), 500);
  }

  onMIDIFailure(msg) {
    console.log("Failed to get MIDI access - " + msg);
    process.exit(1);
  }

  onMidiIn(ev) {
    var arr = [];
    const currentStatus = this.state.display;

    for (var i = 0; i < ev.data.length; i++) {
      arr.push((ev.data[i] < 16 ? "0" : "") + ev.data[i].toString(16));
    }
    console.log("MIDI:", arr.join(" "));
    if (arr[0] == 97 && arr[1] == 0 && arr[2] != 0) {
      this.props.activatePreset("1");
      this.setState({
        display: !currentStatus,
      });
    }
    if (arr[0] == 97 && arr[1] == 1 && arr[2] != 0) {
      this.props.activatePreset("2");
    }
    if (arr[0] == 97 && arr[1] == 2 && arr[2] != 0) {
      this.props.activatePreset("3");
    }
    if (arr[0] == 97 && arr[1] == 3 && arr[2] != 0) {
      this.props.activatePreset("4");
    }
    if (arr[0] == "b0" && arr[1] == 13 && arr[0] != 0) {
      console.log("Four");
      this.setState({ brightnessSlider: parseInt(arr[2], 16) });
    }
  }

  testInputs() {
    console.log("Testing MIDI-In ports...");
    this.inputs.forEach(
      function (port) {
        console.log("id:", port.id);
        port.onmidimessage = this.onMidiIn.bind(this);
      }.bind(this)
    );
  }

  midiOutput() {
    console.log("Testing MIDI-Out ports...");
    this.outputs.forEach(
      function (port) {
        console.log(
          "id:",
          port.id,
          "manufacturer:",
          port.manufacturer,
          "name:",
          port.name,
          "version:",
          port.version
        );
        this.midiname = port.name;
        port.open();
        port.send([0x90, 60, 0x7f]);
      }.bind(this)
    );
    setTimeout(this.stopOutputs.bind(this), 1000);
  }

  startMidi() {
    if (navigator.requestMIDIAccess) {
      console.log("WebMIDI is supported in this browser.");
      this.status = "WebMIDI is supported in this browser.";
    } else {
      console.log("WebMIDI is not supported in this browser.");
      this.status = "WebMIDI is not supported in this browser.";
    }
  }

  updateMidi() {
    this.startMidi();
    this.setState(() => {
      return { status: this.status, midiname: this.midiname };
    });
  }

  render() {
    const { activatePreset } = this.props;
    const { brightnessSlider } = this.state;
    let content = null;
    if (this.state.display) {
      content = { backgroundColor: "red" };
    }
    return (
      <div>
        <Typography variant="h5" color="inherit">
          Midi Control
        </Typography>
        <h3>Device </h3>
        <CardActions>
          <Button onClick={() => this.updateMidi()} style = {{backgroundColor:"red", color: "white"}}>SET MIDI</Button>
          <Typography>{this.state.midiname}</Typography>
          <ul></ul>
          <Typography>{this.state.status}</Typography>
        </CardActions>
        <h3>Left</h3>
        <CardActions>
          <Tooltip title="SCROLL" >
          <Button
            id="midibutton"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
            onClick={() => activatePreset("1")}
          >
            1
          </Button>
          </Tooltip>
          <Tooltip title="STROBE">
          <Button
            id="midibutton2"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
            onClick={() => activatePreset("2")}
          >
            2
          </Button>
          </Tooltip>
          <Tooltip title="STROBE BOOST">
          <Button
            id="midibutton3"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
            onClick={() => activatePreset("3")}
          >
            3
          </Button>
          </Tooltip>
          <Tooltip title="OFF">
          <Button
            id="midibutton4"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
            onClick={() => activatePreset("4")}
          >
            4
          </Button>
          </Tooltip>
          <ul></ul>
          
        </CardActions>
        <CardActions>
          <Tooltip title="BEAT">
            <Button
              id="midibutton5"
              color="primary"
              size="large"
              aria-label="Activate"
              variant="contained"
              style={content}
            >
              5
            </Button>
          </Tooltip>
          <Tooltip title="SPECTRUM">
          <Button
            id="midibutton6"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            6
          </Button>
          </Tooltip>
          <Button
            id="midibutton7"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            7
          </Button>
          <Button
            id="midibutton8"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            8
          </Button>
        </CardActions>
          <h3>Right</h3>
          <CardActions>
          <Tooltip title="SCROLL" >
          <Button
            id="midibutton"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            1
          </Button>
          </Tooltip>
          <Tooltip title="STROBE">
          <Button
            id="midibutton2"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            2
          </Button>
          </Tooltip>
          <Tooltip title="STROBE BOOST">
          <Button
            id="midibutton3"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            3
          </Button>
          </Tooltip>
          <Tooltip title="OFF">
          <Button
            id="midibutton4"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            4
          </Button>
          </Tooltip>
          </CardActions>
          <CardActions>
          <Button
            id="midibutton4"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            5
          </Button>
          <Button
            id="midibutton4"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            6
          </Button>
          <Button
            id="midibutton4"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            7
          </Button>
          <Button
            id="midibutton4"
            color="primary"
            size="large"
            aria-label="Activate"
            variant="contained"
          >
            8 
          </Button>
          </CardActions>
          <ul></ul>
          <CardActions>
          <Typography id="range-slider" gutterBottom>
            Brightness
          </Typography>
          <ul></ul>
          <Slider
            id="midislider"
            defaultValue={0}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={127}
            value={brightnessSlider}
          ></Slider>
          <div>{brightnessSlider}</div>
          </CardActions>
      </div>
    );
  }
}

MidiControl.propTypes = {
  classes: PropTypes.object.isRequired,
  preset: PropTypes.object.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  activatePreset: (presetId) => dispatch(activatePreset(presetId)),
});

export default connect(
  null,
  mapDispatchToProps
)(withStyles(styles)(MidiControl));
