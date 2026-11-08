import React from "react";
import Button from '@material-ui/core/Button';
import SteperFlowComponent from "components/StepComponent/SteperFlowComponent";
import Settings from "./Settings";
import Maintain from "./Maintain/SelectAccountPlane";
import { makeStyles } from '@material-ui/core/styles';
import { FormClasses } from "./Styles";
import { hasAnyValidFieldValue, hasRequiredData } from "utilities/ObjectUtility";
import { configTableDummyDate } from "variables/generalTestDummyData.js";

const formStyles = makeStyles(FormClasses);

const getSteps = () => { return ['Manter', 'Criar/Actualizar', 'Confirmar']; }

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return ['username', 'email', 'profile']
    case 2: return []
    default: return [];
  }
}

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function SelectedAccountPlane() {
  const formClasses = formStyles();
  const steps = getSteps();

  const [activeStep, setActiveStep] = React.useState(0);
  const [configTableData, setConfigTableData] = React.useState({});
  const [configsTablesData, setConfigsTablesData] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [action, setAction] = React.useState("CREATE");
  const [controllState, setControllState] = React.useState(0);


  const title = "Manter Tabela de Configurações";
  const subtitle = "Fluxo de Manuntenção de Configurações";


  React.useEffect(() => {
    if (controllState === 0) {
      setConfigsTablesData(configTableDummyDate)
      setControllState(1);
      console.log("Control useEffect to run once", configsTablesData)
    }
  }, [controllState]);


  /*FormDate to be created on steps as childDate*/
  const createChildDateToParent = (childdata) => {
    setConfigTableData(childdata.dto);
    setErrors(childdata.errors);
  }

  /*FormDate to be updated/edit on steps as childDate*/
  const editChildDateToParent = (childdata) => {
    configTableData(childdata.dto);
    setAction(childdata.action);
    setActiveStep(childdata.step);
    handleNext();
  }

  /*Filtered dtos to be mounted on parent form*/
  const seachChildDateToParent = (seachableField, inputFilterValue) => {
    let tempRows = configsTablesData;
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
          parentData={{ title: title, subtitle: subtitle, activeStep: activeStep, dtos: configsTablesData }} />;
      case 1:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, dto: configsTablesData, requiredFields, errors, action }} />;
      case 2:
        return <Maintain parentData={{ activeStep, dto: configsTablesData, requiredFields, errors, action }} />;
      case 3:
        return <Maintain parentData={{ activeStep, dto: configsTablesData, action }} />;

      default:
        return 'Fluxo de manutencao de estudantes invalido';
    }
  }

  const handleReset = () => {
    setActiveStep(0);
    setConfigsTablesData({});
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
      if (!hasRequiredData(configsTablesData, requiredFields)) {
        let dataFields = Object.keys(configsTablesData);
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
        let tempUser = configsTablesData;
        tempUser.id = configTableData.length + 1;
        configTableData.push(tempUser);
        resteAction();
        console.log("New user added", tempUser);
      }
      if (action === "EDIT") {
        configTableData.map((value, index) => {
          if (value.id === configsTablesData.id) {
            configTableData[index] = configsTablesData
          }
        });
        resteAction();
        console.log("User edited", configsTablesData);
      }

      if (action === "REMOVE") {
        configTableData.pop(configsTablesData);
        resteAction();
        console.log("User removed", configsTablesData);
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
      <div>
        <div>
          {stepContent(activeStep)}
          <div>
            {(activeStep !== 0) && (activeStep !== steps.length) && (action === "REMOVER" || action === "RESTORE") ?
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