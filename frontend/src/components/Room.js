import React, { Component } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';

export default class Room extends Component{
    constructor(props){
        super(props);
        this.state = {
            votesToSkip : 2,
            guestCanPause : false,
            isHost : false,
            showSettings : false,
            spotifyAuthenticated : false,
            song: {}
        };
        console.log(this.props);
        this.roomCode = this.props.match.params.roomCode;
        console.log(this.roomCode)
        console.log("Hey");
        console.log(this.props);
        this.leaveRoom = this.leaveRoom.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.getRoomDetails();
    }

    componentDidMount() {
        this.interval = setInterval(this.getCurrentSong, 10000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getRoomDetails(){
        fetch('/api/get-room'+'?code='+this.roomCode).then((response)=>
            {
                if(!response.ok){
                    this.props.leaveRoomCallback();
                    this.props.history.push('/');
                }
                return response.json();
            }).then((data) => {

            this.setState({
                votesToSkip : data.votes_to_skip,
                guestCanPause : data.guest_can_pause,
                isHost : data.is_host
            });
            console.log(data);
            if(this.state.isHost){
                this.authenticateSpotify();
            }
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

    authenticateSpotify() {
        fetch('/Spotify/is-authenticated')
        .then((response)=>response.json())
        .then((data) => {
            this.setState({
                spotifyAuthenticated : data.status
            });
            if(!data.status){
                fetch('/Spotify/get-auth-url')
                .then((response) => response.json())
                .then((data) => {
                    window.location.replace(data.url)
                });
            }
        });
    }

    getCurrentSong(){
        fetch('/Spotify/current-song').then((response) =>{
            if(!response.ok){
                return {}
            }
            else{
                return response.json()
            }
        })
        .then((data) => {
            this.setState({
                song : data.SongObj
            });
            console.log(data)
        });  
    }

    leaveRoom(){
        console.log("leavee Now");
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': "aaplications/json",
                      'X-CSRFToken' : this.getCookie('csrftoken')
        }
        };
        console.log("lvee Now");
        fetch('/api/leave-room', requestOptions).then((_response)=>{
            console.log("leee Now");
            this.props.leaveRoomCallback();
            this.props.history.push('/');
        });
    }

    updateShowSettings(value){
        this.setState({
            showSettings : value,
        })
    }


    renderSettings(){
        return(
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage update={true} 
                                    votesToSkip={this.state.votesToSkip} 
                                    guestCanPause={this.state.guestCanPause} 
                                    roomCode={this.roomCode} 
                                    updateCallBack={this.getRoomDetails}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={() => this.updateShowSettings(false)}>
                        Close
                    </Button>
                </Grid>
            </Grid>
        )
    }

    renderSettingsButton(){
        return(
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        );
    }

    render(){
        if (this.state.showSettings){
            return this.renderSettings()
        }
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant='h4' compact='h4'>
                        Code : {this.roomCode}
                    </Typography>
                </Grid>

                {/* <Grid item xs={12} align="center">
                    <Typography variant='h6' compact='h6'>
                        Votes to Skip a song : {this.state.votesToSkip}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant='h6' compact='h6'>
                    Guest Can Pause : {this.state.guestCanPause.toString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant='h6' compact='h6'>
                    Host : {this.state.isHost.toString()}
                    </Typography>
                </Grid> */}

                {/* <Grid item xs={12} align="center">
                    <Typography variant='h6' compact='h6'>
                    SongDetails : {song.map(s => <div>{s.name}</div>)}
                    
                    </Typography>
                </Grid> */}
                
                <MusicPlayer {...this.state.song} />

                {this.state.isHost ? this.renderSettingsButton() : null}

                <Grid item xs={12} align="center">
                    <Button variant='contained' color="secondary" onClick={this.leaveRoom}>
                        Leave Room
                    </Button>
                </Grid>

            </Grid>
        )
    }
}