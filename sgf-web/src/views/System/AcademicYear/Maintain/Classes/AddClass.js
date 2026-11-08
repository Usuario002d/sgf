import React from "react";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import SelectField from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from "@material-ui/core/Checkbox";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import { FormClasses, FormControlLabelClasses } from "../../Styles"


const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(option, selected, theme) {
    return {
        fontWeight:
            selected.indexOf(option) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

/**
 * Adicionar/configurar Turmas
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function AddLevelSubject({ show, handleClose, childToParent, parentData }) {
    const theme = useTheme();
    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const { requiredFields, academicLevels, academicSubjects } = parentData;
    const [selectedSubjects, setSelectedSubjects] = React.useState([]);

    const [academicLevelSubjects, setAcademicLevelSubjects] = React.useState({ academicLevel: null, subjects: [], state: 1 });
    const [errors, setErrors] = React.useState(requiredFields);

    const isAllSelected =
        academicSubjects.length > 0 && selectedSubjects.length === academicSubjects.length;

    const handleChangeSubjects = (event) => {
        let { name, value } = event.target

        if (value[value.length - 1] === "all") {
            setSelectedSubjects(selectedSubjects.length === academicSubjects.length ? [] : academicSubjects);
            return;
        }
        setSelectedSubjects(value);
        setAcademicLevelSubjects({ ...academicLevelSubjects, [name]: value });
    };

    const handleAddClasses = (e) => {

        /*----Update parent Data -----------*/
        // let childData = { academicLevelSubjects: academicLevelSubjects };
        childToParent(academicLevelSubjects);
        setAcademicLevelSubjects({ academicLevel: null, subjects: [], state: 1 });
        setSelectedSubjects([]);
        /*------------------------------------*/

        /*
        validateForm();
        let tempSponsers = sponsors;
        tempSponsers.push(formFields);
        setSponsors(tempSponsers);
        console.log(tempSponsers);
        */
    };

    const handleChangeLevel = (e) => {
        let { name, value } = e.target
        if (value === null) {
            return
        }
        setAcademicLevelSubjects({ ...academicLevelSubjects, [name]: value });
    };

    const handleReset = () => {
        onClickCancel();
        setActiveStepButtons(true);
    };

    /** Validate data form and update to parent Data object */
    const validateForm = (fieldValues = academicLevelSubjects) => {
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
        <Dialog
            open={show}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
            maxWidth='md'>
            {
                /*
                        <div >
                            <Typography
                                variant="h5"
                                component="h5"
                                className={formControlClasses.dialogTitle}
                            >
                                Adicionar nova classe
                            </Typography>
                            <IconButton onClick={handleClose}>
                                <Clear />
                            </IconButton>
                        </div>
                        */
            }

            <DialogContent>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={formClasses.cardTitle}>{"Adição de classes"}</h4>
                        <p className={formClasses.cardCategory}>{"adiçao11 de classes"}</p>
                    </CardHeader >
                    <CardBody >
                        <div style={{ border: "1px solid black" }}>
                            <h4 style={{ width: 350, marginTop: -12, marginLeft: 8, background: "white" }}>
                                Classes por lecionar no ano lectivo</h4>
                            <List className={formClasses.root}>
                                <ListItem >
                                    <FormControlLabel
                                        label={<Typography >Classe: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={
                                            <SelectField
                                                variant="outlined"
                                                name="academicLevel"
                                                onChange={(e) => handleChangeLevel(e)}
                                                classes={{ root: formControlClasses.selectFieldLarge }}
                                                value={academicLevelSubjects.academicLevel}
                                            >
                                                < MenuItem value={null} > Selecionar</MenuItem>
                                                {academicLevels.map((data, index) => {
                                                    return < MenuItem id={"level_" + index}
                                                        value={data} >
                                                        {data.description}</MenuItem>
                                                }
                                                )}
                                            </SelectField>
                                        }
                                    />
                                </ListItem>

                                <ListItem >
                                    <FormControlLabel
                                        label={<Typography >Disciplinas: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={
                                            <SelectField
                                                variant="outlined"
                                                name="subjects"
                                                labelId="mutiple-select-label_subjects"
                                                multiple
                                                value={selectedSubjects}
                                                onChange={handleChangeSubjects}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((data) => (
                                                            <Chip key={data.description} label={data.description} />
                                                        ))}
                                                    </Box>)}
                                                MenuProps={MenuProps}
                                                classes={{ root: formControlClasses.selectFieldLarge }}
                                            >

                                                <MenuItem value="all">
                                                    <ListItemIcon>
                                                        <Checkbox
                                                            checked={isAllSelected}
                                                            indeterminate={
                                                                selectedSubjects.length > 0 && selectedSubjects.length < academicSubjects.length
                                                            }
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Select All"
                                                    />
                                                </MenuItem>
                                                {academicSubjects.map((option) => {
                                                    return < MenuItem
                                                        key={option.description}
                                                        value={option}
                                                        style={getStyles(option, selectedSubjects, theme)}>
                                                        <ListItemIcon>
                                                            <Checkbox checked={selectedSubjects.indexOf(option) > -1} />
                                                        </ListItemIcon>
                                                        <ListItemText primary={option.description} />
                                                    </MenuItem>
                                                }
                                                )}
                                            </SelectField>
                                        }
                                    />
                                </ListItem>
                                <ListItem>
                                </ListItem>
                            </List>
                        </div>
                    </CardBody>
                </Card>
            </DialogContent>

            <DialogActions>
                <Button variant="contained"
                    onClick={handleClose}
                    color="secondary"
                >
                    cancelar
                </Button>
                <Button variant="contained"
                    onClick={handleAddClasses}
                    className={formClasses.button}>
                    Adicionar a lista
                </Button>
            </DialogActions>
        </Dialog>
    );
}