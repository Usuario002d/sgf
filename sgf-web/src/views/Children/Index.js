import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Create from "./Create/Create";
import Settings from "./Settings";
import { website } from "variables/general.js";
import { FormClasses } from "./Styles"
import { hasAnyValidFieldValue, hasRequiredData } from "utilities/ObjectUtility.js"


const indexStyles = makeStyles(FormClasses);

const getSteps = () => {
  return ['Settings', 'Create/Edit', 'Create/Edit', 'Confirm'];
}

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return ['username', 'email']
    case 2: return ['age', 'profile']
    default: return [];
  }
}

export default function IndexChildren() {
  const classes = indexStyles();
  const steps = getSteps();

  const [activeStep, setActiveStep] = React.useState(0);
  const [childrenDataDTO, setChildrenDataDTO] = React.useState({});
  const [errors, setErrors] = React.useState({});

  /*FormDate to be updated on steps as childDate*/
  const childDateToParent = (childdata) => {
    setChildrenDataDTO(childdata.childrenDataDTO);
    setErrors(childdata.errors);
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 0:
        return <Settings checkedIndexes={[0]} tasksIndexes={[0, 1]} tasks={website} />;
      case 1:
        return <Create childToParent={childDateToParent} step={activeStep} parentData={{ childrenDataDTO, requiredFields, errors }} />;
      case 2:
        return <Create childToParent={childDateToParent} step={activeStep} parentData={{ childrenDataDTO, requiredFields, errors }} />;
      case 3:
        return <Create step={activeStep} parentData={{ childrenDataDTO, requiredFields, errors }} />;
      case 4:
        return <Create step={activeStep} parentData={{ childrenDataDTO, requiredFields, errors }} />;

      default:
        return 'Fluxo de manutencao de usuario invalido';
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) handleReset();
  };

  const handleNext = () => {
    if (activeStep !== 0) {
      const requiredFields = getRequeredFields(activeStep);
      if (!hasRequiredData(childrenDataDTO, requiredFields)) {
        let dataFields = Object.keys(childrenDataDTO);
        setErrors(["Preencha os campos obrigatorios: " +
          Object.values(requiredFields).filter(field => !dataFields.includes(field)).join()]);
        return;
      }
      /*
      if (!hasValidRequiredData(userData, requiredFields)) {
        setErrors(["Dadosinvalidos: "]);
        return;
      }*/

      let hasErrors = hasAnyValidFieldValue(errors);
      if (hasErrors) {
        return;
      }
    }

    /**------- Execute Submit data on backend-------- */
    if (activeStep === 3) {
      console.log(childrenDataDTO);
      // console.log("Is array: " + Array.isArray(errors));
    }
    /**------------------------------------------- */
    /*------------- Forward next step -----------*/
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    /**------------------------------------------- */
  };

  const handleReset = () => {
    setActiveStep(0);
    setChildrenDataDTO({});
    setErrors({})
  };

  return (
    <div className={classes.root}>
      {/* 
            <SteperFlowComponent  activeStep={activeStep} steps={steps} />
      */ }
      <div>
        <div>
          {stepContent(activeStep)}
          <div>
            {(activeStep !== 0) && (activeStep !== steps.length) ?
              <Button variant="contained"
                onClick={handleBack} className={classes.button}>
                Voltar
              </Button> : <></>
            }
            <Button
              variant="contained"
              className={classes.button} 
              onClick={activeStep !== steps.length ? handleNext : handleReset}
            >
              {activeStep === steps.length ? "Novo fluxo" : activeStep === 0 ? 'Adicionar Novo' : activeStep === steps.length - 1 ? 'Confirmar' : 'Proximo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}