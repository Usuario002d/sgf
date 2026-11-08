import React from "react";
import Button from '@material-ui/core/Button';
import SteperFlowComponent from "components/StepComponent/SteperFlowComponent"
//Forms steppers
import Maintain from "./Maintain/Index";
import Settings from "./Settings";
//Styles
import { makeStyles } from '@material-ui/core/styles';
import { FormClasses } from "./Styles"
//Utilities and variables
import { hasAnyValidFieldValue, hasRequiredData } from "utilities/ObjectUtility"
import { schoolDummyData } from "variables/generalTestDummyData.js";


const formStyles = makeStyles(FormClasses);

const getSteps = () => { return ['Manter', 'Criar/Actualizar', 'Confirmar']; }

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return ['nuit', 'name', 'email', 'address', 'cellphone1', 'cellphone2']
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

  const [activeStep, setActiveStep] = React.useState(0);
  const [schoolData, setSchoolData] = React.useState({});
  const [schoolsData, setSchoolsData] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [action, setAction] = React.useState("CREATE");

  const title = "Manter Escola";
  const subtitle = "Fluxo de Manuntenção de Escolas";

  React.useEffect(() => {
    setSchoolsData(schoolDummyData);
  });

  /*FormDate to be created on steps as childDate*/
  const createChildDateToParent = (childdata) => {
    setSchoolData(childdata.dto);
    setErrors(childdata.errors);
  }

  /*FormDate to be updated/edit on steps as childDate*/
  const editChildDateToParent = (childdata) => {
    setSchoolData(childdata.dto);
    setAction(childdata.action);
    setActiveStep(childdata.step);
    handleNext();
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 0:
        return <Settings childToParent={editChildDateToParent} parentData={{ title: title, subtitle: subtitle, activeStep, dtos: schoolsData }} />;
      case 1:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, dto: schoolData, requiredFields, errors, action }} />;
      case 2:
        return <Maintain parentData={{ activeStep, dto: schoolData, requiredFields, errors, action }} />;
      case 3:
        return <Maintain parentData={{ activeStep, dto: schoolData, action }} />;

      default:
        return 'Fluxo de manutencao de estudantes invalido';
    }
  }

  const handleReset = () => {
    setActiveStep(0);
    setSchoolData([]);
    setErrors({})
    setAction("CREATE");
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) { handleReset() };
  };

  const handleNext = () => {
    /*--------- Validate all step except settings step=0 -------*/
    if (activeStep !== 0) {
      const requiredFields = getRequeredFields(activeStep);
      if (!hasRequiredData(schoolData, requiredFields)) {
        let dataFields = Object.keys(schoolData);
        setErrors(["Preencha os campos obrigatorios: " +
          Object.values(requiredFields).filter(field => !dataFields.includes(field)).join()]);
        return;
      }
      let hasErrors = hasAnyValidFieldValue(errors);
      if (hasErrors) {
        return;
      }
    }
    /*---------------------------------------------------*/

    /**------- Execute (CREATE/EDIT/REMOVE) submit data on backend-------------**/
    if (activeStep === 2) {

      if (action === "CREATE") {
        let tempUser = schoolData;
        tempUser.id = schoolData.length + 1;
        schoolsData.push(tempUser);
        resteAction();
        console.log("New user added", tempUser);
      }
      if (action === "EDIT") {
        schoolsData.map((value, index) => {
          if (value.id === schoolData.id) {
            schoolData[index] = schoolData
          }
        });
        resteAction();
        console.log("User edited", schoolData);
      }

      if (action === "REMOVE") {
        schoolData.pop(schoolsData);
        resteAction();
        console.log("School removed", schoolData);
      }
      // console.log("Is array: " + Array.isArray(errors));
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
      <div>
        <div>
          {stepContent(activeStep)}
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
              {activeStep === steps.length ? "Novo fluxo" : activeStep === 0 ? 'Adicionar Novo' : activeStep === steps.length - 1 ? 'Confirmar' : 'Proximo'}
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
          </div>
        </div>
      </div>
    </div>
  );
}