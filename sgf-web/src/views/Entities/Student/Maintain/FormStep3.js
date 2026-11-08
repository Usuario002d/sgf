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
import TableComponent from "components/Table/TableComponent";
import Button from '@material-ui/core/Button';
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

const tableColumns = [
    { name: 'code', label: 'Codigo', minWidth: 80 },
    { name: 'fullName', label: 'Nome completo', minWidth: 140 },
    { name: 'fullName', label: 'Grau de parentesco', minWidth: 120 },
    { name: 'email', label: 'email', minWidth: 200 },
    { name: 'state', label: 'Estado', minWidth: 100, align: 'right', size: "small" },
    { name: 'action', label: 'Acções', minWidth: 100, align: 'right', size: "small" },
];

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep2({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const { requiredFields, kinshipTypes } = parentData;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState({});
    const [sponsors, setSponsors] = React.useState([]);

    React.useEffect(() => {
        if (parentData.dto.sponsors && parentData.dto.sponsors.lenth !== 0) {
            setSponsors(parentData.dto.sponsors)
        }
    }, [parentData.dto.sponsors]);

    const handleAddSponser = (e) => {
        validateForm();
        let tempSponsers = sponsors;
        tempSponsers.push(formFields);
        setSponsors(tempSponsers);
        console.log(tempSponsers);

        /*----Update parent Data -----------*/
        let updatedfieldsDTO = { ...parentData.dto, sponsers: sponsors }
        let childData = { dto: updatedfieldsDTO, errors: errors };
        childToParent(childData);
        /*------------------------------------*/
        setFormFields({});
    };


    const handleInputValue = (e) => {
        let { name, value } = e.target
        let fieldName = name;
        let fieldValue = value;
        let fieldAsObject = name.split(".");
        if (fieldAsObject.lenth !== 0) {
            fieldName = fieldAsObject[1]
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
    }
    return (
        <>
            <Paper className={formClasses.paper}>
                <List className={formClasses.root}>

                    <ListItem style={{ height: 150 }} >
                        <Box display="flex" alignItems="center"
                            borderTop={1} borderColor="gray"
                            borderBottom={1} border={1} width={800} height={150}
                        >
                            <FormGroup classes={formControlClasses}>
                                {parentData.dto.id ?
                                    <FormControlLabel
                                        label={<Typography >Codigo do aluno: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={
                                            <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.code}</FormLabel>
                                        }
                                    /> : <></>
                                }
                                <FormControlLabel
                                    label={<Typography >Nome completo do aluno: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.fullName}</FormLabel>
                                    }
                                />
                                <FormControlLabel
                                    label={<Typography >Data de nascimento: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.birthDate}</FormLabel>
                                    }
                                />
                                <FormControlLabel
                                    label={<Typography >Tipo de documento: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.email}</FormLabel>
                                    }
                                />
                                <FormControlLabel
                                    label={<Typography >Numero do documento: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.email}</FormLabel>
                                    }
                                />
                            </FormGroup>
                        </Box>
                    </ListItem>

                    <ListItem style={{ height: 300 }} >
                        <div style={{ border: "1px solid black", width: 1200, height: 250 }}>
                            <h4 style={{ width: 200, marginTop: -12, marginLeft: 8, background: "white" }}>
                                Lista de encarregados</h4>
                            <TableComponent
                                columns={tableColumns}
                                rows={sponsors}
                                rowsPerPage={2}
                            />
                        </div>
                    </ListItem>

                    <ListItem>
                        <div style={{ border: "1px solid black", width: 1200 }}>
                            <h4 style={{ width: 350, marginTop: -12, marginLeft: 8, background: "white" }}>
                                Dados do encarregado por adicionar a lista</h4>
                            <List className={formClasses.root}>
                                <ListItem >
                                    <FormControlLabel
                                        label={<Typography >Grau de Parentesco: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={
                                            <SelectField
                                                variant="outlined"
                                                name="kinshipType"
                                                onChange={(e) => handleInputValue(e)}
                                                classes={{ root: formControlClasses.selectFieldLarge }}
                                                value={formFields.kinshipType ? formFields.kinshipType : ""}
                                            >
                                                < MenuItem value={"selecionar"} > Selecionar</MenuItem>
                                                {kinshipTypes.map((value, index) => {
                                                    return < MenuItem value={value} > {value.description}</MenuItem>
                                                }
                                                )}
                                            </SelectField>
                                        }
                                    />
                                </ListItem>
                                <ListItem >
                                    <FormControlLabel
                                        label={<Typography >Nome completo: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={<OutlinedInput key="sponsor.fullName" name="sponsor.fullName" autoComplete="none" color="primary"
                                            onBlur={handleInputValue}
                                            onChange={handleInputValue}
                                            classes={{ input: formControlClasses.input }}
                                            //error={errors.fullName}
                                            value={formFields.fullName ? formFields.fullName : ""} />}
                                    />
                                </ListItem>
                                <ListItem >
                                    <FormControlLabel
                                        label={<Typography >Email: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={<OutlinedInput key="sponsor.email" name="sponsor.email" autoComplete="none" color="primary"
                                            onBlur={handleInputValue}
                                            onChange={handleInputValue}
                                            classes={{ input: formControlClasses.input }}
                                            //error={errors.email}
                                            value={formFields.email ? formFields.email : ""} />}
                                    />
                                </ListItem>
                                <ListItem >
                                    <FormControlLabel
                                        label={<Typography >Telefone1: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={
                                            <OutlinedInput key="sponsor.cellphone1"
                                                name="sponsor.cellphone1" autoComplete="none" color="primary"
                                                margin="dense"
                                                classes={{ root: formControlClasses.inputShort }}
                                                onBlur={handleInputValue}
                                                onChange={handleInputValue}
                                                //error={errors.cellphone1}
                                                value={formFields.cellphone1 ? formFields.cellphone1 : ""}
                                            />
                                        }
                                    />
                                </ListItem>

                                <ListItem >
                                    <FormControlLabel
                                        label={<Typography >Telefone2: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={
                                            <OutlinedInput key="sponsor.cellphone2"
                                                name="sponsor.cellphone2" autoComplete="none" color="primary"
                                                margin="dense"
                                                classes={formControlClasses.input}
                                                onBlur={handleInputValue}
                                                onChange={handleInputValue}
                                                classes={{ root: formControlClasses.inputShort }}
                                                // error={errors.cellphone2}
                                                value={formFields.cellphone2 ? formFields.cellphone2 : ""}
                                            />
                                        }
                                    />
                                </ListItem>

                                <ListItem>
                                    <Button variant="contained"
                                        onClick={handleAddSponser}
                                        className={formClasses.button}>
                                        Adicionar a lista
                               </Button>
                                </ListItem>
                            </List>
                        </div>
                    </ListItem>

                </List>

            </Paper>
        </>
    );
}