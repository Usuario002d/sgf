import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(theme => ({
    paper: {
        maxWidth: '100%'
    },
    root: {
        width: '80%'
    },
    textFieldInput: {
        paddingTop: 10,
        paddingBottom: 10
    },
    nested: {
        paddingLeft: theme.spacing(4)
    }
}));

export default function NestedList() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <>
            <Paper className={classes.paper}>
                <List className={classes.root}>
                    <ListItem >
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <InputLabel htmlFor="input1">Username:</InputLabel>
                            </Grid>
                            <Grid item xs={8}>
                                <TextField
                                    id="input1"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        classes: {
                                            input: classes.textFieldInput
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </ListItem>
                    <ListItem >
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <InputLabel htmlFor="input2">Email:</InputLabel>
                            </Grid>
                            <Grid item xs={8}>
                                <TextField
                                    id="input2"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        classes: {
                                            input: classes.textFieldInput
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </ListItem>
                    <ListItem>
                        <Grid container alignItems="center">
                            <Grid item xs={3}>
                                <InputLabel htmlFor="input3"></InputLabel>
                            </Grid>
                            <Grid item xs={8}>
                                <TextField
                                    id="input3"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        classes: {
                                            input: classes.textFieldInput
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
