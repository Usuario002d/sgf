import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Typography from '@material-ui/core/Typography';
import { FormClasses, FormControlLabelClasses } from "../Styles"

const useStylesForm = makeStyles(FormClasses);
const useStylesFormLabel = makeStyles(FormControlLabelClasses);

export default function FormStep2({ parentData }) {

    const classes = useStylesForm();
    const formControlClasses = useStylesFormLabel();
    const employeeData = parentData.dto;

    return (
        <>
            <Paper className={classes.paper}>
                <List className={classes.root}>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Nome: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.firstName}</FormLabel>
                            }
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Apelido: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.lastName}</FormLabel>
                            }
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Username: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.username}</FormLabel>
                            }
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Email: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.email}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Perfil: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.profile}</FormLabel>
                            }
                        />
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
