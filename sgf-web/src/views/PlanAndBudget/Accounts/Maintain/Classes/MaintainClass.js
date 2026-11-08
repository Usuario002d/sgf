import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import TableComponent from "components/Table/TableComponent";
import Button from '@material-ui/core/Button';
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";

import ViewAcademicYearComponent from "../../component/ViewAcademicYear"
import AddClassSubject from "./AddClass";

import { FormClasses, FormControlLabelClasses } from "../../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

const tableColumns = [
    { name: 'academicLevel', label: 'Codigo', minWidth: 80 },
    { name: 'subjects', label: 'Classe', minWidth: 140 },
    { name: 'fullName', label: 'Disciplinas', minWidth: 120 },
    { name: 'state', label: 'Estado', minWidth: 100, align: 'right', size: "small" },
    { name: 'action', label: 'Acções', minWidth: 100, align: 'right', size: "small" },
];

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function MaintainClass({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const { requiredFields, academicLevels, academicSubjects } = parentData;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState({});
    const [academicLevelsSubjects, setAcademicLevelsSubjects] = React.useState([]);
    const [selected, setSelected] = React.useState([]);
    const [open, setOpen] = React.useState(false);


    React.useEffect(() => {
        if (parentData.dto.sponsors && parentData.dto.sponsors.lenth !== 0) {
            setAcademicLevelsSubjects(parentData.dto.sponsors)
        }
    }, [parentData.dto.sponsors]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddClasses = (e) => {
        setOpen(true);
    };

    const addAcademicLevel = (childDTO) => {
        alert("testes");

        //  alert(childDTO.academicLevel.description);
        // academicLevelsSubjects.push(childDTO);
    };


    const handleReset = () => {
        //  onClickCancel();
        // setActiveStepButtons(true);
    };

    return (
        <>
            <Paper className={formClasses.paper}>
                <List className={formClasses.root}>

                    <ListItem style={{ height: 100 }} >
                        <ViewAcademicYearComponent academicYearDTO={parentData.dto} />
                    </ListItem>

                    <ListItem>

                        <Button variant="contained"
                            onClick={handleReset} className={formClasses.button}>
                            Cancelar
                         </Button>

                        <Button variant="contained"
                            onClick={handleAddClasses}
                            className={formClasses.button}>
                            Salvar
                        </Button>
                    </ListItem>

                    <ListItem>
                        <AddClassSubject
                            show={open}
                            handleClose={handleClose}
                            parentData={parentData}
                            childToParent={addAcademicLevel}
                        />
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}