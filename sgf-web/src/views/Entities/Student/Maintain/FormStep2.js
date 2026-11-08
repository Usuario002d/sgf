import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
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

    const { requiredFields, academicLevels, employeeRoles } = parentData;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState(parentData.dto);

    const handleInputValue = (e) => {
        let { name, value } = e.target;
        let fieldName = name;
        let fieldValue = value;

        let fieldAsObject = name.split(".");
        if (fieldAsObject.lenth !== 0) {
            fieldName = fieldAsObject[0]
            fieldValue = { ...formFields[fieldName], [fieldAsObject[1]]: value }
        }
        setFormFields({ ...formFields, [fieldName]: fieldValue, state: 1 });
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
        let childData = { dto: fieldValues, errors: tempErrors };
        childToParent(childData);
        /*------------------------------------*/
    }

    return (
        <>
            <Paper className={formClasses.paper}>
                <h4 className={formClasses.paperTitle}>Informe os dados de filiacao do aluno</h4>
                <List className={formClasses.root}>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Nome completo do pai: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="father.fullName" name="father.fullName" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                //error={errors.father.fullName}
                                value={formFields.father.fullName} />}
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone do pai: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <OutlinedInput id="fatherCellphone1"
                                    name="father.cellphone1" autoComplete="none" color="primary"
                                    margin="dense"
                                    classes={{ root: formControlClasses.inputShort }}
                                    onBlur={handleInputValue}
                                    onChange={handleInputValue}
                                    //error={errors.father.cellphone1}
                                    value={formFields.father.cellphone1}
                                />
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Email do pai: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="father.email" name="father.email" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                // error={errors.father.email}
                                value={formFields.father.email} />}
                        />
                    </ListItem>


                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Nome completo da mae: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="mother.fullName" name="mother.fullName" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                //error={errors.mother.fullName}
                                value={formFields.mother.fullName} />}
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone da mae: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <OutlinedInput key="mother.cellphone1"
                                    name="mother.cellphone1" autoComplete="none" color="primary"
                                    margin="dense"
                                    classes={{ root: formControlClasses.inputShort }}
                                    onBlur={handleInputValue}
                                    onChange={handleInputValue}
                                    //error={errors.mother.cellphone1}
                                    value={formFields.mother.cellphone1}
                                />
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Email da mae: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="mother.email" name="mother.email" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                //error={errors.mother.email}
                                value={formFields.mother.email} />}
                        />
                    </ListItem>

                </List>
            </Paper>
        </>
    );
}