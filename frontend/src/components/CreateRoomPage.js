import React, { Component } from 'react';
import Button from "@material-ui/core/Button"
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { Link } from 'react-router-dom';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Collapse } from '@material-ui/core';

export default class CreateRoomPage extends Component{

    static defaultProps = {
        votesToSkip : 2,
        guestCanPause : true,
        update : false,
        roomCode : null,
        updateCallBack : null,
    }

    constructor(props){
        super(props);
        this.state = {
            guestCanPause : this.props.guestCanPause,
            votesToSkip : this.props.votesToSkip,
            errorMsg : "",
            successMsg : "",
        };
        this.handleCreateRoomButtonPressed = this.handleCreateRoomButtonPressed.bind(this),
        this.handleUpdateRoomButtonPressed = this.handleUpdateRoomButtonPressed.bind(this),
        this.handleVotesChange = this.handleVotesChange.bind(this),
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this),
        this.renderCreateButtons = this.renderCreateButtons.bind(this),
        this.renderUpdateButtons = this.renderUpdateButtons.bind(this)
    }

    handleVotesChange(e){
        this.setState({
            votesToSkip : e.target.value,
        });
    }

    handleGuestCanPauseChange(e){
        this.setState({
            guestCanPause : e.target.value === 'true' ? true : false,
        });
    }

    getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    handleCreateRoomButtonPressed(){
        const requestOptions = {
            method : 'POST',
            headers : { 
                'Content-Type': 'application/json',
                'X-CSRFToken' : this.getCookie('csrftoken'),
            },
            body : JSON.stringify({
                votes_to_skip : this.state.votesToSkip,
                guest_can_pause : this.state.guestCanPause
            }),
        };
        fetch('/api/room/create', requestOptions)
        .then((response)=>response.json()
        .then((data)=> this.props.history.push("/room/"+data.code))
        );
    }

    renderCreateButtons(){
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <FormControl>
                        <Button variant="contained" color="primary" onClick={this.handleCreateRoomButtonPressed}>Create Room</Button>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl>
                        <Button variant="contained" color="secondary" to="/" component={Link}>Back</Button>
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    handleUpdateRoomButtonPressed(){
        const requestOptions = {
            method : 'PATCH',
            headers : { 
                'Content-Type': 'application/json',
                'X-CSRFToken' : this.getCookie('csrftoken'),
            },
            body : JSON.stringify({
                votes_to_skip : this.state.votesToSkip,
                guest_can_pause : this.state.guestCanPause,
                code : this.props.roomCode,
            }),
        };
        fetch('/api/update-room', requestOptions)
        .then((response)=>{
            if(response.ok){
                this.setState({
                    successMsg : "Room updated successfully!!!"
                });
            }
            else{
                this.setState({
                    errorMsg : "Error updating Room..."
                });
            }
            this.props.updateCallBack();
        });
    }

    renderUpdateButtons(){
        return(
            <Grid item xs={12} align="center">
                <FormControl>
                    <Button variant="contained" color="primary" onClick={this.handleUpdateRoomButtonPressed}>Update Room</Button>
                </FormControl>
            </Grid>
        )
    }

    render(){
        console.log(this.props)
        const title = this.props.update ? "Update Room" : "Create a Room"

        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Collapse in={this.state.errorMsg!= "" || this.state.successMsg!= ""}>
                        {this.state.successMsg}
                    </Collapse>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">
                        { title }
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl component="fieldset">
                        <FormHelperText>
                            <div align="center">Guest control of playback state</div>
                        </FormHelperText>
                        <RadioGroup row defaultValue={this.props.guestCanPause.toString()}
                            onChange={this.handleGuestCanPauseChange}
                        >
                            <FormControlLabel value='true' control={<Radio color="primary" />} label="Play/Pause" labelPlacement="bottom" />
                            <FormControlLabel value='false' control={<Radio color="secondary" />} label="No Control" labelPlacement="bottom" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField required={true} type="number" defaultValue={this.props.votesToSkip} 
                            inputProps={{
                                min:1,
                                style: { textAlign: 'center' },
                            }}
                            onChange={this.handleVotesChange}
                        />
                        <FormHelperText>
                            <div align="center">Votes required to skip the song</div>
                        </FormHelperText>
                    </FormControl>
                </Grid>

                {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons() }

            </Grid>
        );
    }
}