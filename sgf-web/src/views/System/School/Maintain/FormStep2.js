import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Typography from '@material-ui/core/Typography';
import { FormClasses, FormControlLabelClasses } from "../Styles"

const useStylesForm = makeStyles(FormClasses);
const useStylesFormLabel = makeStyles(FormControlLabelClasses);

export default function FormStep2({ parentData }) {

    const classes = useStylesForm();
    const formControlClasses = useStylesFormLabel();
    const schoolData = parentData.dto;

    return (
        <>
            <Paper className={classes.paper}>
                <List className={classes.root}>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >nuit: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{schoolData.nuit}</FormLabel>
                            }
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Nome: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{schoolData.name}</FormLabel>
                            }
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Email: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{schoolData.email}</FormLabel>
                            }
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Endereço: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="address" name="address" autoComplete="none" color="primary"
                                multiline
                                rows={3}
                                disabled
                                classes={{ multiline: formControlClasses.input }}
                                value={schoolData.address} />}
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone1: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{schoolData.cellphone1}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone2: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{schoolData.cellphone2}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone3: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{schoolData.cellphone3}</FormLabel>
                            }
                        />
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
