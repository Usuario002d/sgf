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

const useStylesForm = makeStyles(FormClasses);
const useStylesFormLabel = makeStyles(FormControlLabelClasses);

export default function CreateFormStep2({ childToParent, parentData }) {

    const classes = useStylesForm();
    const formControlClasses = useStylesFormLabel();
    const requiredFields = parentData.requiredFields;

    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState(parentData.childrenDataDTO);

    const handleInputValue = (e) => {
        let { name, value } = e.target;
        setFormFields({ ...formFields, [name]: value });
        validateForm();
    };

    const validateForm = (fieldValues = formFields) => {
        let tempErrors = {};
        requiredFields.forEach(field => {
            if (field in fieldValues)
                if (!fieldValues[field]) {
                    tempErrors[field] = "Campo " + field + " obrigatorio";
                }
        });
        setErrors({ ...tempErrors });
        let childData = { childrenDataDTO: fieldValues, errors: tempErrors };
        childToParent(childData);
    }

    return (
        <>
            <Paper className={classes.paper}>
                <List className={classes.root}>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Idade: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="age" name="age" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }} 
                                error={errors.age} 
                                value={formFields.age}/>}
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
