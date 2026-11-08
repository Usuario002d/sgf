import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Typography from '@material-ui/core/Typography';
import SelectField from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import { FormClasses, FormGroupClasses, FormControlLabelClasses } from "../Styles"

import FormGroup from "@material-ui/core/FormGroup";
import Box from "@material-ui/core/Box";

const formStyles = makeStyles(FormClasses);
const formGroupStyles = makeStyles(FormGroupClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep1({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formGroupClasses = formGroupStyles();
    const formControlClasses = formControllLabelStyles();

    const requiredFields = parentData.requiredFields;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState(parentData.userData);
    const [employee, setEmployee] = React.useState();

    const handlEmployeeChange = (e) => {
        let { name, value } = e.target;
        setEmployee(value)
        setFormFields({ ...formFields, [name]: value, state: 1 });
        validateForm();
    };

    /** Validate data form and update to parent Data object */
    const validateForm = (fieldValues = formFields) => {
        /*---Validade steper fields -------------*/
        let tempErrors = {};
        requiredFields.forEach(field => {
            if (field in fieldValues)
                if (!fieldValues[field]) {
                    tempErrors[field] = "Campo " + field + " obrigatorio";
                }
        });
        setErrors({ ...tempErrors });
        /*-------------------------------------------*/
        /*----Update parent Data -----------*/
        let childData = { userDate: fieldValues, errors: tempErrors };
        childToParent(childData);
        /*------------------------------------*/
    }

    return (
        <>
            <Paper className={formClasses.paper}>
                <List className={formClasses.root}>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Funcionario: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <SelectField
                                    onChange={handlEmployeeChange}
                                    classes={{ root: formControlClasses.selectFieldLarge }}
                                    variant="outlined"
                                    value={employee}
                                >
                                    <MenuItem value={"Joao Cossa"}>Joao Cossa</MenuItem>
                                    <MenuItem value={"Ana Machado"}>Ana Machado</MenuItem>
                                </SelectField>
                            }
                        />
                    </ListItem>
                    <ListItem >
                        <Box display="flex" alignItems="center"
                            borderTop={1} borderColor="gray"
                            borderBottom={1} border={1} width={675}
                        >
                            <FormGroup classes={formGroupClasses}>
                                <FormControlLabel
                                    label={<Typography >Nome completo: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: FormGroupClasses.label }} disabled>{employee}</FormLabel>
                                    }
                                />
                                <FormControlLabel
                                    label={<Typography >Email: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: FormGroupClasses.label }} disabled>xxxxx xxxxxxxxxxxxxxx</FormLabel>
                                    }
                                />
                            </FormGroup>
                        </Box>
                    </ListItem>
                </List>
            </Paper >
        </>
    );
}
