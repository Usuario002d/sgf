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
        maxWidth: '80%'
    },
    root: {
        width: '100%'
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
                                <InputLabel htmlFor="input1">Lorem</InputLabel>
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
                                <InputLabel htmlFor="input2">Ipsum</InputLabel>
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
                                <InputLabel htmlFor="input3">Foobar</InputLabel>
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

            <div style={{ height: 30 }} />

            <Paper className={classes.paper}>
                <List className={classes.root}>
                    <ListSubheader>Section 1</ListSubheader>
                    <List disablePadding>
                        <ListItem divider className={classes.nested}>
                            <Grid container alignItems="center">
                                <Grid item xs={4}>
                                    <InputLabel htmlFor="input4">Mauris</InputLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField
                                        id="input4"
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
                        <ListItem divider className={classes.nested}>
                            <Grid container alignItems="center">
                                <Grid item xs={4}>
                                    <InputLabel htmlFor="input5">Vivamus </InputLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField
                                        id="input5"
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

                    <ListSubheader>Section 2</ListSubheader>
                    <List disablePadding>
                        <ListItem divider className={classes.nested}>
                            <Grid container alignItems="center">
                                <Grid item xs={4}>
                                    <InputLabel htmlFor="input5">Nunc</InputLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField
                                        id="input5"
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
                        <ListItem divider className={classes.nested}>
                            <Grid container alignItems="center">
                                <Grid item xs={4}>
                                    <InputLabel htmlFor="input6">Nulla</InputLabel>
                                </Grid>
                                <Grid item xs={8}>
                                    <TextField
                                        id="input6"
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

                    <ListItem button onClick={handleClick}>
                        <ListItemText primary="Expandable section" />
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <List disablePadding>
                            <ListItem divider className={classes.nested}>
                                <Grid container alignItems="center">
                                    <Grid item xs={4}>
                                        <InputLabel htmlFor="input7">Duis</InputLabel>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <TextField
                                            id="input7"
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
                            <ListItem className={classes.nested}>
                                <Grid container alignItems="center">
                                    <Grid item xs={4}>
                                        <InputLabel htmlFor="input8">Praesent</InputLabel>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <TextField
                                            id="input8"
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
                    </Collapse>
                </List>
            </Paper>
        </>
    );
}
