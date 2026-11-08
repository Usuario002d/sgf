import React from "react";
import Button from '@material-ui/core/Button';
import SteperFlowComponent from "components/StepComponent/SteperFlowComponent";
import Settings from "./Settings";
import Maintain from "./Maintain/Index";
import Create from "./Create/Index";

import { makeStyles } from '@material-ui/core/styles';
import { FormClasses } from "./Styles";
import { academicYearsDummyData, configTableDummyDate } from "variables/generalTestDummyData.js";

const formStyles = makeStyles(FormClasses);

const getSteps = () => { return ['Manter', 'Criar/Actualizar', 'Criar/Actualizar', 'Confirmar']; }

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
export default function Index() {
  const formClasses = formStyles();
  const steps = getSteps();

  const currentDate = new Date();

  const [isStepButtonsEnabled, setActiveStepButtons] = React.useState(true);
  const [activeStep, setActiveStep] = React.useState(0);
  const [academicYear, setAcademicYear] = React.useState({});
  const [academicYears, setAcademicYears] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [action, setAction] = React.useState("CREATE");
  const [controllState, setControllState] = React.useState(0);
  const [academicSubjects, setAcademicSubjects] = React.useState([]);
  const [academicLevels, setAcademicLevels] = React.useState([]);

  const title = "Manter Ano Fiscal";
  const subtitle = "Fluxo de Manuntenção do Ano Lectivo";

  const academicSubjectsDummyData = configTableDummyDate.filter(field => field.type === "academicSubject");
  const academicLevelDummyData = configTableDummyDate.filter(field => field.type === "academicLevel");

  React.useEffect(() => {
    if (controllState === 0) {
      setAcademicYears(academicYearsDummyData)
      setAcademicSubjects(academicSubjectsDummyData)
      setAcademicLevels(academicLevelDummyData)
      console.log("Control useEffect to run once", academicYearsDummyData);
      console.log("Control useEffect to run once academicYears", academicYears);
      setControllState(1);
    }
  }, [controllState]);


  /*FormDate to be updated/edit on steps as childDate*/
  const editChildDateToParent = (childdata) => {
    setAcademicYear(childdata.dto)
    setAction(childdata.action);
    setActiveStep(2);
    handleNext();
  }

  /*Filtered dtos to be mounted on parent form*/
  const seachChildDateToParent = (seachableField, inputFilterValue) => {
    let tempRows = academicYears;
    let filteredRows = tempRows.filter(field => field[seachableField] === inputFilterValue);
    return filteredRows;
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 0:
        return <Settings
          editChildDateToParent={editChildDateToParent}
          seachChildDateToParent={seachChildDateToParent}
          parentData={{ title: title, subtitle: subtitle, activeStep: activeStep, dtos: academicYears }} />;
      case 1:
        return <Create
          parentData={{ title: title, subtitle: subtitle, dtos: academicYears }}
          onClickCancel={handleReset}
          setActiveStepButtons={setActiveStepButtons}
        />
      case 2:
        return <Maintain childToParent={createChildDateToParent}
          parentData={{ activeStep, dto: academicYear, academicLevels: academicLevels, academicSubjects: academicSubjects, requiredFields, errors, action }}
          onClickCancel={handleReset}
          setActiveStepButtons={setActiveStepButtons} />;

      case 3:
        return <Maintain parentData={{ activeStep, dto: academicYear, requiredFields, errors, action }}
          onClickCancel={handleReset}
          setActiveStepButtons={setActiveStepButtons} />;
      case 4:
        return <Maintain parentData={{ activeStep, dto: academicYear, action }}
          onClickCancel={handleReset}
          setActiveStepButtons={setActiveStepButtons} />;

      default:
        return 'Fluxo de manutencao de estudantes invalido';
    }
  }

  const handleReset = () => {
    setActiveStep(0);
    setErrors({})
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) { handleReset() };
  };

  const handleNext = () => {

    /**------- Execute (CREATE/EDIT/REMOVE) submit data on backend-------------**/
    if (activeStep === 3) {

      if (action === "EDIT") {
        academicYears.map((value, index) => {
          if (value.id === academicYear.id) {
            academicYears[index] = academicYear
          }
        });
        resteAction();
        console.log("User edited", academicYear);
      }

      if (action === "REMOVE") {
        academicYears.pop(academicYear);
        resteAction();
        console.log("User removed", academicYear);
      }
    }
    /**------------------------------------------------------------------------**/
    /*----------------------------- Forward next step --------------------------*/
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    /**------------------------------------------------------------------------ */
  };

  const resteAction = () => {
    setAction("CREATE");
  }

  return (
    <div className={formClasses.root}>

      {/*<SteperFlowComponent activeStep={activeStep} steps={steps} />*/}
      {stepContent(activeStep)}
      {isStepButtonsEnabled ?
        <div>
          {(activeStep !== 0) && (activeStep !== steps.length) && (action !== "REMOVER" || action !== "RESTORE") ?
            <>
              <Button variant="contained"
                onClick={handleBack} className={formClasses.button}>
                Voltar
                </Button>
            </>
            : <></>
          }
          <Button
            variant="contained" className={formClasses.button}
            onClick={activeStep !== steps.length ? handleNext : handleReset}
          >
            {activeStep === steps.length ? "Novo fluxo" :
              activeStep === 0 ? 'Adicionar Novo' :
                activeStep === steps.length - 1 ? 'Confirmar' :
                  'Proximo'}
          </Button>

          {(activeStep !== 0) && (activeStep !== steps.length) ?
            <>
              <Button variant="contained"
                onClick={handleReset} className={formClasses.button}>
                Cancelar
                </Button>
            </>
            : <></>
          }
        </div> : <></>
      }

    </div>
  );
}