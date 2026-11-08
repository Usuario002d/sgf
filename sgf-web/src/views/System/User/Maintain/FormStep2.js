import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Typography from '@material-ui/core/Typography';
import SelectField from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep2({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const requiredFields = parentData.requiredFields;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState(parentData.userData);
    const [employee, setEmployee] = React.useState();
    const [userProfile, handlUserProfileChange] = React.useState();

    const handlEmployeeChange = (e) => {
        setEmployee(e.target.value)

    };


    const handleInputValue = (e) => {
        let { name, value } = e.target;
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
                                <FormLabel disabled>{employee}</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Email: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <FormLabel disabled>xxxxx xxxxxxxxxxxxxxx</FormLabel>
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Username: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="username" name="username" autoComplete="none" color="primary"
                                margin="dense"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.username}
                                value={formFields.username} />}
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Perfil: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <SelectField
                                    onChange={handlUserProfileChange}
                                    classes={{ root: formControlClasses.selectField }}
                                    variant="outlined"
                                    value={userProfile}
                                >
                                    <MenuItem value={"01"}>Primario</MenuItem>
                                    <MenuItem value={"01"}>Secundario</MenuItem>
                                </SelectField>
                            }
                        />
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
