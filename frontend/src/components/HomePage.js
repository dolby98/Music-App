import React, { Component } from 'react';
import CreateRoomPage from './CreateRoomPage';
import RoomJoinPage from './RoomJoinPage';
import { Grid, Button, ButtonGroup, Typography } from '@material-ui/core';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from 'react-router-dom';
import Room from './Room';
import InfoPage from './InfoPage';

export default class HomePage extends Component{
    constructor(props){
        super(props);
        this.state = {
            roomCode: null,
        };
        this.clearRoomCode = this.clearRoomCode.bind(this)
    }

    async componentDidMount() {
        fetch("/api/user-in-room")
        .then((response) => response.json())
        .then((data) => {
            this.setState({
                roomCode: data.code
            });
        });
        console.log("This is room",this.roomCode)
    }

    renderHomePage(){
        return(
            <Grid container spacing={2}>
                <Grid item xs={12} align='center'>
                    <Typography variant='h3' compact='h3'>
                        MH Party
                    </Typography>
                </Grid>
                <Grid item xs={12} align='center'>
                    <ButtonGroup variant='contained' color='primary'>
                        <Button color='primary' to='/join' component={ Link }>
                            Join a Room
                        </Button>
                        {/* <Button color='default' to='/info' component={ Link }>
                            Info
                        </Button> */}
                        <Button color='secondary' to='/create' component={ Link }>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }

    clearRoomCode(){
        this.setState({
            roomCode: null,
        });
    }

    render(){
        return(
            <Router>
                <Switch>
                    <Route exact path='/' render={
                        () => {
                            return this.state.roomCode ? (
                                <Redirect to={`/room/${this.state.roomCode}`} />
                            ) : (
                                this.renderHomePage()
                            );
                            
                        }}
                    />

                    <Route path='/join' component={RoomJoinPage}></Route>
                    <Route path='/info' component={InfoPage}></Route>
                    <Route path='/create' component={CreateRoomPage}></Route>
                    <Route path='/room/:roomCode' 
                        render={(props) => {
                            return <Room {...props} leaveRoomCallback={this.clearRoomCode} />;
                    }} />
                </Switch>
            </Router>
        );
    }
}