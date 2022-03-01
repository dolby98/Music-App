import React, { useState, useEffect } from "react";
import { Grid, Button, Typography, IconButton } from "@material-ui/core";
import { Link } from "react-router-dom";

const pages = {
    JOIN : 'pages.join',
    CREATE : 'pages.create',
};


export default function InfoPage(props) {

    const [page, setPage] = useState(pages.JOIN);
    

    return (
    <Grid container spacing={1}>
        <Grid item xs={12} align="center">
            <Typography component="h4" variant="h4">
                What is this ?
            </Typography>
        </Grid>
        <Grid item xs={12} align="center">
            <Typography component="h4" variant="body1">
                {/* { page === pages.JOIN : "Join Page" ? "Create a Page" } */}
            </Typography>
        </Grid>
        <Grid item xs={12} align="center">
            <Button color="secondary" variant="contained" to="/" component={Link}>
                Back
            </Button>
        </Grid>
    </Grid>
    );
}