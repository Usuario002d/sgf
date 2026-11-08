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

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
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
                            label={<Typography >Data de nascimento: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.birthDate}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Nuit : </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.nuit}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >BI Numero : </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.docNumber}</FormLabel>
                            }
                        />
                    </ListItem>


                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Nivel Academico: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.academicLevel.description}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Cargo / Função : </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.employeeRole.description}</FormLabel>
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
                            label={<Typography >Telefone1: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.cellphone1}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone2: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel >{employeeData.cellphone2}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Endereço: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={

                                <OutlinedInput key="address" name="address" autoComplete="none" color="primary"
                                    multiline
                                    rows={3}
                                    disabled
                                    classes={{ multiline: formControlClasses.input }}
                                    value={employeeData.address} />
                            }
                        />
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
