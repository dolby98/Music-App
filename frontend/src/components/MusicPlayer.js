import React, { Component } from "react";
import {
    Grid,
    Typography,
    Card,
    IconButton,
    LinearProgress,
} from "@material-ui/core";

import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import PauseIcon from "@material-ui/icons/Pause"
import SkipNextIcon from "@material-ui/icons/SkipNext"

export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);

        this.getCookie = this.getCookie.bind(this);
        this.pressPauseButton = this.pressPauseButton.bind(this);
        this.pressPlayButton = this.pressPlayButton.bind(this);
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

    pressSkipButton(){
        const requestOptions = {
            method: "POST",
            headers: {'Content-Type': "aaplications/json",
                      'X-CSRFToken' : this.getCookie('csrftoken')
            }};
            fetch('/Spotify/skip-song', requestOptions).then((response) =>{
                console.log(response)
            });
    }

    pressPlayPauseButton(){
        const requestOptions = {
            method: "PUT",
            headers: {'Content-Type': "aaplications/json",
                      'X-CSRFToken' : this.getCookie('csrftoken')
            },
            body : JSON.stringify({
                playbackState : this.props.is_playing
            }),
        };
        
        fetch('/Spotify/play-pause-song', requestOptions).then((response) =>{
            console.log(response)
        });

    }

    pressPauseButton(){
        console.log("Pressed Pause");
        const requestOptions = {
            method: "PUT",
            headers: {'Content-Type': "aaplications/json",
                      'X-CSRFToken' : this.getCookie('csrftoken')
            }};
            fetch('/Spotify/pause-song', requestOptions).then((response) => {
                console.log(response)
            });
    }
    pressPlayButton(){
        console.log("Pressed Play");
        const requestOptions = {
            method: "PUT",
            headers: {'Content-Type': "aaplications/json",
                      'X-CSRFToken' : this.getCookie('csrftoken')
            }};
            fetch('/Spotify/play-song', requestOptions).then((response) => {
                console.log(response)
            });
    }

    render(){

        const songProgress = (this.props.time/this.props.duration)*100;

        return (
        <Card>
            <Grid container alignItems="center">
                <Grid item align="center" xs={4}>
                    <img src={this.props.image_url} height="100%" width="100%" />
                </Grid>
                <Grid item align="center" xs={8}>
                    <Typography component="h5" variant="h5">
                        {this.props.title}
                    </Typography>
                    <Typography color="textSecondary" variant="subtitle1">
                        {this.props.artist}
                    </Typography>
                    <div>
                        <IconButton onClick={() => this.pressPlayPauseButton()}>
                            {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon /> } 
                        </IconButton>
                        <IconButton onClick={() => this.pressSkipButton()}>
                            <SkipNextIcon />
                        </IconButton>
                        {this.props.votes} / {this.props.votes_required_toSkip}
                    </div>
                </Grid>
            </Grid>
            <LinearProgress variant="determinate" value={songProgress} />
        </Card>
        );
    }
}