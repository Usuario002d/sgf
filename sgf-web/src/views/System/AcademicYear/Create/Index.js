import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Button from '@material-ui/core/Button';
import FormStep1 from "./FormStep1";
import FormStep2 from "./FormStep2";
import { FormHeaderClass } from "../Styles"
import { ErrorNotification, SuccessNotification } from "components/Notification/NotificationComponent";
import { hasAnyValidFieldValue, hasRequiredData } from "utilities/ObjectUtility";

const formHeaderStyles = makeStyles(FormHeaderClass);

const getSteps = () => { return ['Fluxo 1: Dados iniciais', 'Fluxo 2: Confirmar', 'Fluxo 3 :sucesso']; }

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return ['year']
    case 2: return []
    default: return [];
  }
}

/**
 * 
 * Create  Academic Year Step flow
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Index({ setActiveStepButtons, onClickCancel, parentData }) {

  const formHeaderClasses = formHeaderStyles();
  const steps = getSteps();

  const { title, dtos: academicYears, } = parentData;

  const subtitle = "Fluxo de Criação do Ano Lectivo";

  const [activeStep, setActiveStep] = React.useState(1);
  const [errors, setErrors] = React.useState({});
  const currentDate = new Date();
  const [academicYear, setAcademicYear] = React.useState({ year: currentDate.getFullYear(), description: "Ano lectivo " + currentDate.getFullYear() });

  //Disable parent stepers buttons
  setActiveStepButtons(false);

  /*Form Data to be created on steps as childDate*/
  const handleOnEditChildDateToParent = (childData) => {
    let tempDto = childData.dto ? childData.dto : academicYear;
    tempDto.year = tempDto.year ? tempDto.year : currentDate.getFullYear();
    tempDto.description = "Ano lectivo " + tempDto.year
    setAcademicYear(tempDto);
    setErrors(childData.errors);
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 1:
        return <FormStep1 childToParent={handleOnEditChildDateToParent} parentData={{ dto: academicYear, requiredFields, errors }} />
      case 2:
        return <FormStep2 parentData={{ dto: academicYear, requiredFields, errors }} />
      case 3:
        return <FormStep2 parentData={{ dto: academicYear }} />
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
    /*------------------------ Validate all step --------------------------------*/
    const requiredFields = getRequeredFields(activeStep);
    if (!hasRequiredData(academicYear, requiredFields)) {
      let dataFields = Object.keys(academicYear);
      setErrors(["Preencha os campos obrigatorios: " +
        Object.values(requiredFields).filter(field => !dataFields.includes(field)).join()]);
      return;
    }
    let hasErrors = hasAnyValidFieldValue(errors);

    if (hasErrors) {
      return;
    }
    /*-----------------------------------------------------------------------------*/
    /**----------- Execute (CREATE/EDIT/REMOVE) submit data on backend-------------**/
    if (activeStep === 2) {
      academicYears.push({ ...academicYear, id: academicYears.length + 1 });
    }
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
              <h4 className={formHeaderClasses.cardTitle}>{title}</h4>
              <p className={formHeaderClasses.cardCategory}>{subtitle}</p>
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