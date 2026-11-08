import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import Typography from '@material-ui/core/Typography';
import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep1({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const requiredFields = parentData.requiredFields;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState(parentData.dto);

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
                            label={<Typography >Nome: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="firstName" name="firstName" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.firstName}
                                value={formFields.firstName} />}
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Apelido: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="lastName" name="lastName" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.lastName}
                                value={formFields.lastName} />}
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Username: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="username" name="username" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.username}
                                value={formFields.username} />}
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Email: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="email" name="email" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.email}
                                value={formFields.email}
                            />}
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Perfil: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <TextField key="email"
                                    name="profile" autoComplete="none" color="primary"
                                    margin="dense"
                                    variant="outlined"
                                    classes={formControlClasses.input}
                                    onBlur={handleInputValue}
                                    onChange={handleInputValue}
                                    classes={{ input: formControlClasses.input }}
                                    error={errors.profile}
                                    value={formFields.profile}
                                />
                            }
                        />
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
