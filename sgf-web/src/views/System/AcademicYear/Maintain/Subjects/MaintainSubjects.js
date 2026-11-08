import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import TableComponent from "components/Table/TableComponent";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Button from '@material-ui/core/Button';
import FormStep1 from "./FormStep1";
import FormStep2 from "./FormStep2";
import ViewAcademicYearComponent from "../../component/ViewAcademicYear"
import { ErrorNotification, SuccessNotification } from "components/Notification/NotificationComponent";
import { configTableDummyDate } from "variables/generalTestDummyData.js";
import { FormHeaderClass, FormClasses, FormControlLabelClasses } from "../../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);
const formHeaderStyles = makeStyles(FormHeaderClass);


const tableColumns = [
    { name: "academicLevel.description", label: 'Classes', minWidth: 140 },
    { name: 'subjects', label: 'Disciplinas', type: "array", minWidth: 120 },
    { name: 'state', label: 'Estado', minWidth: 100, align: 'right', size: "small" },
    { name: 'action', label: 'Acções', minWidth: 100, align: 'right', size: "small" },
];

const getSteps = () => { return ['Fluxo 1: Dados iniciais', 'Fluxo 2: Confirmar', 'Fluxo 3 :sucesso']; }


const getRequeredFields = (step) => {
    switch (step) {
        case 1: return ['year']
        case 2: return []
        default: return [];
    }
}



/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function MaintainSubject({ childToParent, parentData }) {

    const steps = getSteps();
    const formHeaderClasses = formHeaderStyles();
    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const [activeStep, setActiveStep] = React.useState(1);
    const [errors, setErrors] = React.useState({});

    const [academicSubjects, setAcademicSubjects] = React.useState([]);
    const [academicLevels, setAcademicLevels] = React.useState([]);
    const [academicLevelsSubjects, setAcademicLevelsSubjects] = React.useState([]);
    const [controllState, setControllState] = React.useState(0);

    React.useEffect(() => {
        if (controllState === 0) {
            setAcademicSubjects(configTableDummyDate.filter(field => field.type === "academicSubject"));
            setAcademicLevels(configTableDummyDate.filter(field => field.type === "academicLevel"));
            setAcademicLevelsSubjects([])
        }
    }, [controllState]);

    /*Form Data to be created on steps as childDate*/
    const handleOnEditChildDateToParent = (childData) => {
    }

    const stepContent = (step) => {
        switch (step) {
            case 1:
                return <FormStep1 childToParent={handleOnEditChildDateToParent} parentData={{ academicYear: parentData.dto, academicLevelsSubjects, academicLevels, academicSubjects }} />
            case 2:
                return <FormStep2 parentData={{ academicYear: parentData.dto, academicLevelsSubjects, }} />
            case 3:
                return <FormStep2 parentData={{ academicYear: parentData.dto, academicLevelsSubjects, }} />
            default:
                return 'Fluxo de Criacão invalido';
        }
    }


    const handleReset = () => {
        onClickCancel();
        setActiveStepButtons(true);
    };

    const handleBack = () => {
        activeStep === 1 ? handleReset()
            : setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleNext = () => {
        /**------------------------------------------------------------------------**/
        /*----------------------------- Forward next step --------------------------*/
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        /**------------------------------------------------------------------------ */
    };

    return (
        <div className={formHeaderClasses.root}>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <ViewAcademicYearComponent academicYearDTO={parentData.dto} />
                        </CardHeader >
                        <CardBody >
                            {activeStep === 3 ? SuccessNotification() : ErrorNotification(errors)}
                            {stepContent(activeStep)}
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>

            <div>
                {activeStep !== steps.length ?
                    <>
                        <Button variant="contained"
                            onClick={handleBack}
                            className={formHeaderClasses.button}>
                            Voltar
                        </Button>
                    </>
                    : <></>
                }
                <Button
                    variant="contained" className={formHeaderClasses.button}
                    onClick={activeStep !== steps.length ? handleNext : handleReset}
                >
                    {activeStep === steps.length ? "Novo fluxo" : activeStep === steps.length - 1 ? 'Confirmar' : 'Proximo'}
                </Button>

                {activeStep !== steps.length ?
                    <>
                        <Button variant="contained"
                            onClick={handleReset}
                            className={formHeaderClasses.button}>
                            Cancelar
                        </Button>
                    </>
                    : <></>
                }
            </div>
        </div>
    );
}